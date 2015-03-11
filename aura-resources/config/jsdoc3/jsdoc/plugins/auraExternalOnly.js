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
};

exports.defineTags = function(dictionary) {
    dictionary.defineTag("platform", {
    	onTagged: function(doclet, tag) {
    		doclet.platform = true;
    	}
    });
};

function isFilteredByExternal(value) {
    if(!value || !value.hasOwnProperty('kind')) { return false; }
    var importantKinds = {
        "member": true,
        "function": true, 
        "class": true
    };

    return importantKinds[value.kind]===true;
}

function isExternal(value) {
    if(!value) { return false; }

    return !!value.platform;
}

/**
 * Aura's encode function
 *
 * @param {Object} obj the object to encode
 */
function encode (obj){
    if (obj === undefined) { return 'null'; }

    if (typeof obj === 'string') {
        return "'" + obj.replace(/\\/g, "\\\\").replace(/\'/g, "\\'").replace(/\n/g, '\\n')  + "'";
    }

    var dataType = Object.prototype.toString.call(obj);
    var buffer = [];
    var result;
    if (dataType === '[object Array]') {
        for (var i=0; i<obj.length; i++) {
            result = encode(obj[i]);
            if(result !== undefined) {
                buffer.push(result);
            }
        }
        return '[' + buffer.join(',\n') + ']';
    } else if (dataType === '[object Object]') {
        if(isFilteredByExternal(obj) && !isExternal(obj)) {
            return undefined;
        }

        for (var k in obj) {
            if (k === 'comment' || k === 'meta' || !obj.hasOwnProperty(k)) {
                continue;
            }
            
            if(isFilteredByExternal(obj[k])) {
                if(isExternal(obj[k])) {
                    buffer.push(encode(k) + ':' + encode(obj[k]));
                }
            } else {
                buffer.push(encode(k) + ':' + encode(obj[k]));
            }
        }
        return '{' + buffer.join(',\n') + '}';
    }
    return ''+obj;
}
