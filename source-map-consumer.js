const mappingDecoder = require('vlq');

//Consumes a sourcemap file and a given default offset
//Returns a map object with one main function that uses the map to translate the error location to the original location if a map was given
exports.SourceMapConsumer = function(sourceMap, defaultOffset) {
    let map = {
        originalPositionsMap: undefined,
        originalPositionFor: function(position) {
            let originalPosition = {
                source: null,
                line: null,
                column: null,
                name: null
            };
            if (!this.originalPositionsMap || this.originalPositionsMap === undefined || !Object.keys(this.originalPositionsMap).length) {
                originalPosition.source = position.source;
                originalPosition.line = position.line;
                originalPosition.column = position.column;
                return originalPosition;
            }
            let cursor = this.originalPositionsMap[position.line];
            if (cursor === undefined) {
                console.log('didn\'t find requested position in mapped locations');
            } else {
                if (!(position.column in cursor)) {
                    //meaning there is only one column link - for the whole line and we don't need to check match to look further for proper column like we do in minified version
                    //Which usually means that the columns structure is preserved.
                    cursor = cursor[0];
                } else {
                    cursor = cursor[position.column];
                }
                originalPosition.source = cursor.source;
                originalPosition.line = cursor.sourceLine;
                originalPosition.column = position.column;
            }
            return originalPosition;
        }
    };
    map.originalPositionsMap = {};

    if (sourceMap === undefined || sourceMap.mappings === '') {
        return map;
    }

    const {version, sources, name, mappings, file} = sourceMap;
    //Splits the map - mappings list to Lines and segments / columns
    const splitMappingsToFiles = mappings.split(';').map(function(line) {
        return line.split(',');
    });

    //Decodes the mappings from vlq-base64 encoding
    const decodedMappingsToLines = splitMappingsToFiles.map(function(file) {
        return file.map(mappingDecoder.decode);
    });

    //Goes by the v3 source map spec proposal
    let sourceFileIndex = 0; // second field
    let sourceCodeLine = 0; // third field
    let sourceCodeColumn = 0; //fourth field
    let nameIndex = 0; // fifth field

    //Decodes the mappings to actual pointers to lines, columns and files taken from the source file
    const decoded = decodedMappingsToLines.map(function(line) {
        let generatedCodeColumn = 0; // first field - reset each time

        //In some cases we might have some lines in the generated file that don't belong to any original file -
        // i.e. added in the concatenation, and marked multiple line separators without actual data like this ';;;;' so we need to ignore them but add then as offset to our line count.
        return line.map(function(segment) {
            if (!segment || !Object.keys(segment).length) {
                return [-1, -1, -1, -1];
            }
            let result;

            generatedCodeColumn += segment[0];

            result = [generatedCodeColumn];

            if (segment.length === 1) {
                // only one field!
                return result;
            }

            sourceFileIndex += segment[1];
            sourceCodeLine += segment[2];
            sourceCodeColumn += segment[3];

            result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);

            if (segment.length === 5) {
                nameIndex += segment[4];
                result.push(nameIndex);
            }

            return result;
        });
    });

    let lineCounter = 0 + defaultOffset;
    decoded.forEach(function(line) {
        //now we got the line that may contain multiple columns values.
        //So the key in the original line map is the column
        let originalLine = {};
        line.forEach(function(column) {
            if (column[0] !== -1) {
                originalLine[column[0]] = {
                    sourceLine: column[2],
                    sourceColumn: column[3],
                    source: sources[column[1]]
                };
            }
        });
        if (originalLine && Object.keys(originalLine).length) {
            map.originalPositionsMap[lineCounter] = originalLine;
        }
        lineCounter++;
    });

    return map;
};