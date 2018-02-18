
const sourceMapSupport = require('../source-map-support-purejs.js');
sourceMapSupport.install({
    hookRequire: true,
    emptyCacheBetweenOperations: true,
    retrieveSourceMap: function(source) {
        if (source.includes('__compiledScript.js')) {
            return {
                url: '__compiledScript.js',
                map: ""
            };
        } else {
            return {
                url: source,
                map: "{\"version\":3,\"sources\":[" + JSON.stringify(source) + "],\"names\":[],\"mappings\":\"\"}"
            };
        }
        return null;
    }
});

console.log ('template');
try {
    userFuncEnclosed();
} catch (e) {
    console.log (e)
}
