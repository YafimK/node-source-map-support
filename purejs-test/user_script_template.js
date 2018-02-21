
const sourceMapSupport = require('../source-map-support-purejs.js');
sourceMapSupport.install({
    hookRequire: true,
    emptyCacheBetweenOperations: true,
    defaultMapOffset: 0,
    retrieveSourceMap: function(source) {
        if (source.includes('__compiledScript.js')) {
            return {
                url: '__compiledScript.js',
                map: JSON.parse("{\"version\":3,\"sources\":[\"user_script_template.js\",\"user_script.js\"],\"names\":[],\"mappings\":\"AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;ACzBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA\",\"file\":\"__compiled_script.js\"}")
            };
        }
        return {
            url: source,
            map: JSON.parse("{\"version\":3,\"sources\":[" + JSON.stringify(source) + "],\"names\":[],\"mappings\":\"\"}")
        };    }
});

console.log ('template');
try {
    userFuncEnclosed();
} catch (e) {
    console.log (e)
}
