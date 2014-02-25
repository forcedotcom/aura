/**
 * JSDoc plugin to dump out JSON
 */
var fs = require('jsdoc/fs'),
    path = require('jsdoc/path');

exports.handlers = {
    processingComplete: function(e) {
        var out = env.opts.destination;

	// create the folders and subfolders to hold the output
	fs.mkPath(out);
        fs.writeFileSync(path.join(out, "symbolSet.json"), encode(e.doclets), 'utf8');
    }
}

/**
 * Aura's encode function
 *
 * @param {Object} obj the object to encode
 */
function encode (obj){
    //if(typeof(JSON) !== "undefined") {
        //return JSON.stringify(obj, null, null);
    //}

    if (obj === undefined) {
        return 'null';
    }
    if (typeof obj === 'string') {
        return "'" + obj.replace(/\\/g, "\\\\").replace(/\'/g, "\\'").replace(/\n/g, '\\n')  + "'";
    }
    var strType = Object.prototype.toString.call(obj);
    if (strType === '[object Array]') {
        var buf = [];
        for (var i=0; i<obj.length; i++) {
            buf.push(encode(obj[i]));
        }
        return '[' + buf.join(',\n') + ']';
    } else if (strType === '[object Object]') {
        var buf2 = [];
        for (var k in obj) {
            if (k === 'comment') {
                continue;
            } else if (k === 'meta') {
                continue;
            }
            if (obj.hasOwnProperty(k)) {
                buf2.push(encode(k) + ':' + encode(obj[k]));
            }
        }
        return '{' + buf2.join(',\n') + '}';
    }
    return ''+obj;
}
