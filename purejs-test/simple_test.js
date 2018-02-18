const Concat = require('concat-with-sourcemaps');
var fs = require("fs");
var inlineSourceMapCommentGenerator = require('inline-source-map-comment');
var concat = new Concat(true, '__compiled_script.js', '\n\n');

var jsFiles = ["user_script_template.js", "user_script.js"];
jsFiles = jsFiles.map(function(file) {
    return {
        source:  file,
        code: fs.readFileSync(file).toString()
    }
});
concat.add('', "require('../source-map-support-purejs.js').install({\n" +
    "});");
concat.add(jsFiles[0].source, jsFiles[0].code);
concat.add('', 'function userFuncEnclosed(load) {');
concat.add(jsFiles[1].source, jsFiles[1].code);
concat.add('', '}');

var concatenatedContent = concat.content;
var sourceMapForContent = concat.sourceMap;


// console.log(concatenatedContent.toString());
// console.log(sourceMapForContent);

const inlineSourceMapComment = inlineSourceMapCommentGenerator(sourceMapForContent, {block: true});

var finalSourceMapFile = '//# sourceMappingURL=__compiledScript.js.map' + '\n\n' + concatenatedContent;
// var finalSourceMapFile = '//# sourceMappingURL=' +inlineSourceMapComment + '\n\n' + concatenatedContent;
console.log(finalSourceMapFile);



var validate = require('sourcemap-validator')
    , assert = require('assert')
    , min = concatenatedContent.toString()
    , map = sourceMapForContent;

const sources = {};
jsFiles.forEach(function(file) {
    sources[file.source] = file.code;
});

assert.doesNotThrow(function () {
    validate(min, map, sources);
}, 'The sourcemap is not valid');


fs.writeFileSync('__compiledScript.js', finalSourceMapFile);
fs.writeFileSync('__compiledScript.js.map', map);