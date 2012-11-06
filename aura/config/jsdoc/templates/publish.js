function publish(symbolSet) {
    var outputDir = JSDOC.opt.d || SYS.pwd+"../out/jsdoc/";
    IO.mkPath(outputDir);
    IO.saveFile(outputDir,"symbolSet.json", encode(symbolSet.toArray()));
}

function encode (obj, replacer, whiteSpace){
    if(typeof(JSON) !== "undefined") {
        return JSON.stringify(obj, replacer, whiteSpace);
    }

    if (obj === undefined) {
        return 'null';
    }
    if (obj === null){
        return 'null';
    }

    switch (obj.constructor) {
        case String: return '"' + obj.replace(/\"/g,'\\"').replace(/\r|\n|\f/g,"\\n")+ '"';
        case Array:
            var buf = [];
            for (var i=0; i<obj.length; i++) {
                buf.push(arguments.callee(obj[i]));
            }
            return '[' + buf.join(',') + ']';
        case Object:
        default:
            var buf2 = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    buf2.push(arguments.callee(k) + ':' + arguments.callee(obj[k]));
                }
            }
            return '{' + buf2.join(',') + '}';
    }
}
