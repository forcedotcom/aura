/*
 * Copyright (C) 2013 salesforce.com, inc.
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
/*jslint sub: true */
/**
 * @class A value object wrapper for a map. Each value in the map is a value object rather than a JavaScript literal
 * value. A value object is a thin wrapper around the actual data. The wrapper layer around the literal JavaScript
 * objects enables you to modify data in a transactional manner. The framework selectively rerenders and updates the
 * UI in response to data changes.
 *
 * @constructor
 * @protected
 */
function MapValue(config, def, component){
    this.value = {};
    this.keys = {};
    this.owner = component;
    var k;
    // attributes can come through here but have no way of knowing the member keys
    // models have getMembers
    if (def && def.getMembers) {
        var allMembers = def.getMembers();
        for (var i = 0; i < allMembers.length; i++) {
            k = allMembers[i].getName();
            this.add(k, config);
        }
    } else {
        if (config) {
            for (k in config) {
                this.add(k, config);
            }
        }
    }

    this.dirty = false;
//#if {"modes" : ["DEVELOPMENT"]}
    if (def) {
        this.name = def.getDescriptor().getQualifiedName();
    }
//#end
//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

MapValue.prototype.auraType = "Value";

/**
 * Returns a SimpleValue for the specified key.
 * @param {String} k The key for whose value is to be fetched.
 */
MapValue.prototype.getValue = function(k){
    if ($A.util.isUndefined(this.value)) {
        return valueFactory.create(undefined, null, this.owner);
    }

    aura.assert(k, "Key is required for getValue on MapValue");

    var ret = this.value[k.toLowerCase()];
    if ($A.util.isUndefined(ret)){
        ret = valueFactory.create(undefined, null, this.owner);
    }

    return ret;
};

/**
 * Sets the map to newMap.
 *
 * There are a variety of special conditions here. The most important is that an
 * empty input value will simply clear the array. This means that null, undefined,
 * or a SimpleValue representing this will clear it.
 *
 * MapValue or an object will set the internal map to match the input. If you need to
 * do as the constructor and create a map based on a model, you would need to first
 * construct a MapValue, then call this.
 *
 * @param {Object} newMap The new map.
 */
MapValue.prototype.setValue = function(newMap) {
    this.value = {};
    this.keys = {};
    this.makeDirty();
    if ($A.util.isUndefinedOrNull(newMap) || (newMap.isDefined && !newMap.isDefined())) {
        return;
    }
    if (!$A.util.isObject(newMap)) {
        $A.assert(false, "newMap must be an object");
    }
    var copyMap = newMap;
    var copyKeys = null;
    if (newMap.auraType === "Value") {
        var type = (newMap.toString?newMap.toString():'');
        if (type === 'MapValue') {
            copyMap = newMap.value;
            copyKeys = newMap.keys;
        } else if (type === 'SimpleValue') {
            if (newMap.unwrap() === null) {
                return;
            }
            // bad.
            $A.assert(false, "Defined simplevalue cannot be passed to MapValue.setValue");
            return;
        } else if (type === 'ArrayValue') {
            // bad.
            $A.assert(false, "Defined ArrayValue cannot be passed to MapValue.setValue");
            return;
        }
    }
    for (var k in copyMap) {
        var key = k;

        if (copyKeys && copyKeys[k]) {
            key = copyKeys[k];
        }
        this.add(key, copyMap);
    }
};

/**
 * Returns the unwrapped value for the key. Shortcut for getValue(key).unwrap().
 *
 * @param {String} key The key for the value to return.
 */
MapValue.prototype.get = function(key){
    // FIXME: W-1563175
    return $A.expressionService.get(this, key);
    //
    // The code below does not work either, but it doesn't throw an error, it gives the wrong value..
    // Not clear which is worse.
    //
    // var value = $A.expressionService.getValue(this, key);
    // if ($A.util.isUndefinedOrNull(value)) {
    //     return value;
    // }
    // if (value.toString && value.toString() === 'PropertyReferenceValue') {
    //     return $A.expressionService.get(this.owner, key);
    // }
    // return value.unwrap();
};

/**
 * Merges the specified map into the current map.
 *
 * @param {Object} yourMap The map to merge into the current map.
 * @param {Boolean} overwrite If set to true, entries from yourMap overwrite entries in the current map.
 */
MapValue.prototype.merge = function(yourMap, overwrite) {
    var my = this.value;
    var keys = yourMap.value;
    for (var key in keys) {
        var yourvalue = yourMap.getValue(key);
        var myvalue = this.getValue(key);
        if (myvalue && (myvalue.isDefined?myvalue.isDefined():true) && myvalue.merge) {
            myvalue.merge(yourvalue, overwrite);
        } else {
            my[key] = yourvalue;
        }
    }
};

/**
 * Returns false as this is not an expression.
 */
MapValue.prototype.isExpression = function(){
    return false;
};

/**
 * Returns false as this is not a literal.
 */
MapValue.prototype.isLiteral = function(){
    return false;
};

/**
 * @private
 */
MapValue.prototype.makeDirty = function() {
    this.dirty = true;
    $A.renderingService.addDirtyValue(this);
};

/**
 * Returns true if the map has been modified but not yet committed. The dirty flag is set whenever data changes.
 * Aura automatically rerenders the component that owns the data, and calls commit() to remove the dirty flag.
 */
MapValue.prototype.isDirty = function(){
    return this.dirty;
};

/**
 * @private
 */
MapValue.prototype.commit = function(clean) {
    this.dirty = false;
};

/**
 * @private
 * Removes uncommitted changes if there are any. isDirty() returns false after rollback() is called.
 * This method doesn't return a value.
 *
 * @param {Object} clean Do not use this internal-only parameter.
 */
MapValue.prototype.rollback = function(clean) {
    $A.renderingService.removeDirtyValue(this);
    this.dirty = false;
};

/**
 * Iterates through the map and calls the user-defined function on each entry.
 * For example, this function simply alerts the user for each key-value pair in the map.
 * <pre>
 * mapValue.each(function(key, val) {
 *      alert("Value " + val + " stored at key " + key);
 * });
 * </pre>
 *
 * @param {Function} func The function that operates on each entry.
 * @param {Object} config A context value passed to func as the third parameter.
 * @param {Object} config.scope A context value for 'this' when func is invoked.
 */
MapValue.prototype.each = function(func, config){
    // Defaults to global scope
    var scope = config && config.scope ? config.scope : window;

    var values = this.value;
    var keys = this.keys;
    for (var k in values){
        var v = values[k];
        func.call(scope, keys[k] || k, v, config);
    }
};

/**
 * Convenience method for getting the current value (committed or not)
 * of a named property of this map.  Same as calling getValue(k).getValue().
 * @param {String} k The key for the value to return.
 */
MapValue.prototype.getRawValue = function(k){
    var ret = this.getValue(k);
    if (!ret) {
        return ret;
    }

    return ret.unwrap();
};

/**
 * Recursively destroys all entries in the map and deletes the map.
 * Also, removes any onchange handlers listening to this value object.
 */
MapValue.prototype.destroy = function(async){
//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    var values = this.value;
    for (var k in values) {
        var v = values[k];
        if (v !== undefined) {
            v.destroy(async);
        }
    }

    delete this.handlers;
    delete this.value;
    delete this.keys;
};

MapValue.prototype.toString = function(){
    return "MapValue";
};

/**
 * Returns a copy of the map containing unwrapped values.
 * This method performs a deep copy of the map.
 * This can be an expensive operation so only use this method if you have no other alternatives.
 */
MapValue.prototype.unwrap = function(){
    var ret = {};

    this.each(function(k,v){
        ret[k] = v.unwrap();
    });

    return ret;
};

/**
 * wraps the value in a simple or map value and adds to this map.
 *
 * The use of config allows null or undefined to be passed in as the value.
 *
 * @private
 */
MapValue.prototype.add = function(k, config) {
    var key = k.toLowerCase();
    var v = config[k];

    var value = valueFactory.create(v, null, this.owner);
    this.value[key] = value;

    if (key !== k) {
        this.keys[key] = k;
    }

    this.makeDirty();

    var handlers = this.handlers;
    if (handlers) {
        for (var globalId in handlers){
            var cmpHandlers = handlers[globalId];
            for (var i = 0; i < cmpHandlers.length; i++){
                BaseValue.addValueHandler(k, value, cmpHandlers[i]);
            }
        }

        value.fire("change");
    }
};

/**
 * @public
 * Associates the specified value with the specified key.
 * If the map previously contained a mapping for the key, the old value is replaced by the specified value.
 *
 * @param {String} k The key.
 * @param {Object} v The value.
 */
MapValue.prototype.put = function(k, v){
    var key = k.toLowerCase();
    var value = this.value[key];

    if (value) {
        value.setValue(v);
    } else {
        var config = {};
        config[k] = v;
        this.add(k, config);
    }
    this.makeDirty();
};

/**
 * @public
 */
MapValue.prototype.addHandler = function(config){
    var values = this.value;
    var keys = this.keys;
    for(var k in values){
        var v = values[k];
        var key = this.keys[k] !== undefined ? this.keys[k]:k;
        BaseValue.addValueHandler(key, v, config);
    }

    var handlers = this.handlers;
    if (!this.handlers){
        handlers = {};
        this.handlers = handlers;
    }

    var cmpHandlers = handlers[config["globalId"]];
    if (!cmpHandlers){
        cmpHandlers = [];
        handlers[config["globalId"]] = cmpHandlers;
    }

    cmpHandlers.push(config);
};

/**
 * @protected
 */
MapValue.prototype.destroyHandlers = function(globalId){
    var handlers = this.handlers;
    if(handlers){
        delete handlers[globalId];
    }

    var values = this.value;
    var keys = this.keys;
    for(var k in values){
        var v = values[k];
        v.destroyHandlers(globalId);
    }
};

/**
 * @private
 */
MapValue.prototype.contains = function(key){
    return !$A.util.isUndefined(this.value[key.toLowerCase()]);
};

//#include aura.value.MapValue_export
