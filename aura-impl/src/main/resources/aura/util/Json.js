/*
 * Copyright (C) 2012 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint evil: true, sub : true */
/**
 * @namespace A base class to enable JSON manipulation
 * @constructor
 */
function Json() {
}

/**
 * Decode a JSON string into an object, optionally using ref support to resolve
 * duplicate object references.
 * 
 * IMPORTANT: this function should NEVER be exported, as the eval()
 * implementation provides a public API for executing arbitrary code inside our
 * domain security context. If we decide we need to supply a JSON utility
 * function to consumers in the future, it should use the new window.JSON
 * support provided by newer browsers.
 * 
 * @param {String}
 *            json
 * @param {Object}
 *            refSupport
 */
Json.prototype.decode = function(json, refSupport) {
	var obj;
	if (aura.util.isUndefinedOrNull(json)) {
		return null;
	}
	try {
		obj = aura.util.globalEval(json);
	} catch (e) {
		aura.error("Unable to parse JSON response", e);
		return null;
	}
	return refSupport ? this.resolveRefs(obj) : obj;
};

/**
 * After the JSON data is decoded by Browser native JSON object, the resulted
 * object (or sub-object) property's value could be a function/array/object/ and
 * so on in string format. We need to convert them to the desired type.
 * 
 * @param {String}
 *            value The string to be decoded
 * @returns {Function|Array|Object} The converted value
 */
Json.prototype.decodeString = function(value) {
	var valueType = typeof (value);
	if (valueType === "function") {
		return value;
	} else if (valueType === "string") {
		return aura.util.globalEval(value);
	}
	return value;
};

/**
 * Convert a serialized state blob, with its internal serId and serRefId
 * markers, into a new data structure that can have internal JavaScript pointers
 * to the same identical location.
 * 
 * @param {Object}
 *            obj The object to resolve
 */
Json.prototype.resolveRefs = function(obj) {
	$A.mark("Json.resolveRefs", $A.logLevel["DEBUG"]);

	var config = aura.util.isArray(obj) ? obj : [obj];
	this._resolveRefs(config, {}, null, null);

	$A.measure("done", "Json.resolveRefs");

	return obj;
};

Json.prototype._resolveRefs = function(config, cache, parent, property) {
	if (typeof config === "object" && config !== null) {
		var value;
		if (aura.util.isArray(config)) {
			for ( var i = 0; i < config.length; i++) {
				value = config[i];
				if (typeof value === "object" && value !== null) {
					this._resolveRefs(value, cache, config, i);
				}
			}
		} else {
			var serRefId = config["serRefId"];
			if (serRefId !== undefined) {
				// Replace with the referenced object
				parent[property] = cache[serRefId];
			} else {
				var serId = config["serId"];
				if (serId !== undefined) {
					value = config["value"];

					if (typeof value === "object" && value !== null
							&& (value["serId"] || value["serRefId"])) {
						this._resolveRefs(value, cache, parent, property);
						value = parent[property];
					} else {
						// Pull up the values into the config itself
						parent[property] = value;
					}

					cache[serId] = value;

				} else {
					value = config;
				}

				// Recurse into the value's properties
				for ( var key in value) {
					var v = value[key];
					if (typeof v === "object" && v !== null) {
						this._resolveRefs(v, cache, value, key);
					}
				}
			}
		}
	}
};

/**
 * Encodes an object into a JSON representation.
 * 
 * @param {Object}
 *            obj The object to pass in the encoder.
 * @param {Object}
 *            replacer Optional function which passes key and value bound to the
 *            object, and returns a stringified value.
 * @param {String}
 *            whiteSpace Adds spaces or tabs to the resulting string. E.g. '\t'
 *            for tab
 */
Json.prototype.encode = function(obj, replacer, whiteSpace) {
	if (typeof (JSON) !== "undefined") {
		if ($A.util.isUndefinedOrNull(replacer)) {
			return JSON.stringify(obj, function(key, value) {
				// We have to do this as JSON.stringify removes the property from
				// the resulted JSON string if its value is a function
				return aura.util.json.encodeFunction(value);
			}, whiteSpace);
		} else {
			return JSON.stringify(obj, replacer, whiteSpace);
		}
	}

	if (typeof (JSON) !== "undefined") {
		return JSON.stringify(obj, replacer, whiteSpace);
	}

	if (obj === undefined) {
		return 'null';
	}

	if (obj === null) {
		return 'null';
	}

	// Support the JSON.stringify() Object.toJSON() standard
	if (!$A.util.isUndefined(obj.toJSON)) {
		return arguments.callee(obj.toJSON());
	}

	switch (obj.constructor) {
	case String:
		return '"' + obj.replace(/\"/g, '\\"').replace(/\r|\n|\f/g, "\\n")
				+ '"';

	case Array:
		var buf = [];
		for ( var i = 0; i < obj.length; i++) {
			buf.push(arguments.callee(obj[i]));
		}
		return '[' + buf.join(',') + ']';

	case Object:
		var buf2 = [];
		for ( var k in obj) {
			if (obj.hasOwnProperty(k)) {
				// Recursively invoke encode() on both the property name and the
				// value
				buf2.push(arguments.callee(k) + ':' + arguments.callee(obj[k]));
			}
		}
		return '{' + buf2.join(',') + '}';

	default:
		return obj.toString();
	}
};

/**
 * Encode function to String.
 * 
 * @param {Function}
 *            value The function to be encoded.
 */
Json.prototype.encodeFunction = function(value) {
	if (typeof value === 'function') {
		return value + '';
	}
	return value;
};
// #include aura.util.Json_export
