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

var mapValueNextId = 0;

/**
 * @class A value object wrapper for a map with case-insensitive keys. Each value in the map is a value object rather than a JavaScript literal value. A value
 *        object is a thin wrapper around the actual data. The wrapper layer around the literal JavaScript objects enables you to modify data in a transactional
 *        manner. The framework selectively rerenders and updates the UI in response to data changes.
 * 
 * @constructor
 * @protected
 */
function MapValue(config, def, component) {
    this.value = {};
    this.keys = {};
    this.owner = component;

    /** One of "true" if set to any {...} object, or "null" or "undefined" if not */
    this.hasRealValue = true;

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
        this.hasRealValue = (config !== null && config !== undefined);
        if (config) {
            for (k in config) {
                this.add(k, config);
            }
        }
    }

    this.dirty = false;
    // #if {"modes" : ["DEVELOPMENT", "STATS"]}
    this._mapValueId = mapValueNextId++;

    if (def) {
        this.name = def.getDescriptor().getQualifiedName();
    }
    // #end
    // #if {"modes" : ["STATS"]}
    valueFactory.index(this);
    // #end
}

MapValue.prototype.auraType = "Value";

/**
 * @class A simple object for a map that responds correctly to hasOwnProperty() to hide back ref to MapValue that created it.
 * 
 * @constructor
 * @private
 */
var RawMapValue = function(source) {
    var that = this;
    source.each(function(k, v) {
        that[k] = v.unwrap();
    });

    // We are specifically using the closure based approach to private variables to avoid issues with code that 
    // for/in's on the "raw" object (space for safety tradeoff)
    this.getSourceValue = (function(_source) { 
        return function() {
            return _source;
        };
    })(source);
};

// Hide from for/in iterations that correctly use thing.hasOwnProperty() to guard against traversal of inherited/private props
RawMapValue.prototype.hasOwnProperty = function(name) {
    return Object.prototype.hasOwnProperty.call(this, name) 
        && (this[name] !== this.getSourceValue);
};

// toJSON is expected to return an object that can be converted by JSON.stringify, this means
// we can't actually convert the string here, but must have a copy of the map to convert.
// We do the lazy creation here to avoid having the memory hit of storing it every time we create
// a RawMapValue. Since this is only used for serialization it should be fine.
RawMapValue.prototype.toJSON = function() {
    var copy = {};
    for (var k in this) {
        if (this.hasOwnProperty(k)) {
            copy[k] = this[k];
        }
    }
    return copy;
};

/**
 * Recursively fire for subelements of the map. Used in particular when MapValue.put() adds a new submap to a MapValue with handlers already registered.
 * 
 * @private
 */
MapValue.prototype.fire = function(name) {
    for ( var k in this.value) {
        this.value[k].fire(name);
    }
};

/**
 * DO NOT USE THIS METHOD.
 * 
 * @public
 * 
 * @deprecated use Component.get(key) instead
 */
MapValue.prototype.getValue = function(key) {
    // $A.warning("DEPRECATED USE OF mapValue.getValue(key). USE component.get(key) INSTEAD.",{key:key});
    return this._getValue(key);
};

/**
 * Returns a SimpleValue for the specified key.
 * 
 * @param {String}
 *            k The key for whose value is to be fetched.
 * 
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 * 
 * @private
 */
MapValue.prototype.getValue = function(k, returnUndefined) {
    if ($A.util.isUndefined(this.value)) {
        return valueFactory.create(undefined, null, this.owner);
    }

    aura.assert(k, "Key is required for getValue on MapValue");

    var ret = this.value[k.toLowerCase()];
    if ($A.util.isUndefined(ret) && !returnUndefined) {
        ret = valueFactory.create(undefined, null, this.owner);
    }

    return ret;
};

/**
 * DO NOT USE THIS METHOD.
 * 
 * @public
 * 
 * @deprecated use Component.set(key,newMap) instead
 */
MapValue.prototype.setValue = function(newMap) {
    // $A.warning("DEPRECATED USE OF mapValue.setValue(newMap). USE component.set(key,newMap) INSTEAD.", {key: key,value:newMap});
    this._setValue(newMap);
};

/**
 * Sets the map to newMap.
 * 
 * There are a variety of special conditions here. The most important is that an empty input value will simply clear the array. This means that null, undefined,
 * or a SimpleValue representing this will clear it.
 * 
 * MapValue or an object will set the internal map to match the input. If you need to do as the constructor and create a map based on a model, you would need to
 * first construct a MapValue, then call this.
 * 
 * @param {Object}
 *            newMap The new map.
 * 
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 * @private
 */
MapValue.prototype._setValue = function(newMap, skipChange) {
    this.oldvalue = this.value; // Held to test for dirty replaced subobjects & copy handlers
    this.value = {};
    this.keys = {};
    this.makeDirty();
    
    if ($A.util.isUndefinedOrNull(newMap) || (newMap.isDefined && !newMap.isDefined())) {
        this.hasRealValue = false;
        return;
    }
    
    this.hasRealValue = true;
    if (!$A.util.isObject(newMap)) {
        $A.assert(false, "newMap must be an object");
    }
    
    var copyMap = newMap;
    var copyKeys = null;
    
    if (newMap.auraType === "Value") {
        var type = (newMap.toString ? newMap.toString() : '');
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
    
    for (var originalKey in copyMap) {
        var lowerKey;
        if (copyKeys && copyKeys[originalKey]) {
            lowerKey = originalKey;
            originalKey = copyKeys[originalKey];
        } else {
            lowerKey = originalKey.toLowerCase();
        }
        
        if (copyMap.hasOwnProperty(originalKey)) {
            this.add(originalKey, copyMap, lowerKey in this.oldvalue, skipChange);
        }
    }

    this.oldvalue = undefined; // We no longer hold this for commit/rollback
};

/**
 * Returns the unwrapped value for the key. Shortcut for getValue(key).unwrap().
 * 
 * @param {String}
 *            key The key for the value to return.
 */
MapValue.prototype.get = function(key) {
    // FIXME: W-1563175
    return $A.expressionService.get(this, key);
    //
    // The code below does not work either, but it doesn't throw an error, it gives the wrong value..
    // Not clear which is worse.
    //
    // var value = $A.expressionService.getValue(this, key);
    // if ($A.util.isUndefinedOrNull(value)) {
    // return value;
    // }
    // if (value.toString && value.toString() === 'PropertyReferenceValue') {
    // return $A.expressionService.get(this.owner, key);
    // }
    // return value.unwrap();
};

/**
 * Sets the value for the key.
 * 
 * @param {String}
 *            key The key for the value to return.
 */
MapValue.prototype.set = function(key, value) {
    var v = this._getValue(key);
    if ($A.util.isUndefinedOrNull(v)) {
        $A.error("Invalid key " + key);
        return;
    }
    v._setValue(value);
};

/**
 * Merges the specified map into the current map. After this, the map will have all its original keys <i>plus</i> keys from the supplied maps.
 * 
 * @param {Object}
 *            yourMap The map to merge into the current map.
 * @param {Boolean}
 *            overwrite If set to true, entries from yourMap overwrite entries in the current map.
 */
MapValue.prototype.merge = function(yourMap, overwrite) {
    var my = this.value;
    var keys = yourMap.value;
    for ( var key in keys) {
        var yourvalue = yourMap.getValue(key);
        var myvalue = this.getValue(key);
        if (myvalue && (myvalue.isDefined ? myvalue.isDefined() : true) && myvalue.merge) {
            myvalue.merge(yourvalue, overwrite);
        } else {
            my[key] = yourvalue;
        }
    }
    this.hasRealValue = true;
};

/**
 * Returns false as this is not an expression.
 */
MapValue.prototype.isExpression = function() {
    return false;
};

/**
 * Returns false as this is not a literal.
 */
MapValue.prototype.isLiteral = function() {
    return false;
};

/** Returns true if this was set to null or undefined */
MapValue.prototype.isUnset = function() {
    return !this.hasRealValue;
};

/**
 * @private
 */
MapValue.prototype.makeDirty = function(subDirty) {
    this.dirty = true;
    $A.renderingService.addDirtyValue(this);
    if(subDirty) {
        for (var key in this.value) {
            if (this.value[key]&&this.value[key].makeDirty){
                this.value[key].makeDirty(subDirty);
            }
        }
    }
};

/**
 * Returns true if the map has been modified but not yet committed. The dirty flag is set whenever data changes. Aura automatically rerenders the component that
 * owns the data, and calls commit() to remove the dirty flag.
 */
MapValue.prototype.isDirty = function() {
    return this.dirty;
};

/**
 * @private
 */
MapValue.prototype.commit = function(clean) {
    this.dirty = false;
};

/**
 * @private Removes uncommitted changes if there are any. isDirty() returns false after rollback() is called. This method doesn't return a value.
 * 
 * @param {Object}
 *            clean Do not use this internal-only parameter.
 */
MapValue.prototype.rollback = function(clean) {
    $A.renderingService.removeDirtyValue(this);
    this.dirty = false;
};

/**
 * Iterates through the map and calls the user-defined function on each entry. For example, this function simply alerts the user for each key-value pair in the
 * map.
 * 
 * <pre>
 * mapValue.each(function(key, val) {
 *  alert(&quot;Value &quot; + val + &quot; stored at key &quot; + key);
 * });
 * </pre>
 * 
 * @param {Function}
 *            func The function that operates on each entry.
 * @param {Object}
 *            config A context value passed to func as the third parameter.
 * @param {Object}
 *            config.scope A context value for 'this' when func is invoked.
 */
MapValue.prototype.each = function(func, config) {
    // Defaults to global scope
    var scope = config && config.scope ? config.scope : window;

    var values = this.value;
    var keys = this.keys;
    for ( var k in values) {
        var v = values[k];
        func.call(scope, keys[k] || k, v, config);
    }
};

/**
 * Convenience method for getting the current value (committed or not) of a named property of this map. Same as calling getValue(k).unwrap(), and different from
 * get() in that it bypasses the expression service.
 * 
 * @param {String}
 *            k The key for the value to return.
 */
MapValue.prototype.getRawValue = function(k) {
    var ret = this.getValue(k);
    if (!ret) {
        return ret;
    }

    return ret.unwrap();
};

/**
 * Recursively destroys all entries in the map and deletes the map. Also, removes any onchange handlers listening to this value object.
 */
MapValue.prototype.destroy = function(async) {
    // #if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
    // #end
    var values = this.value;
    for ( var k in values) {
        var v = values[k];
        if (v !== undefined  && v.destroy) {
            v.destroy(async);
        }
    }

    delete this.handlers;
    delete this.value;
    delete this.keys;
};

MapValue.prototype.toString = function() {
    return "MapValue";
};

/**
 * Returns a copy of the map containing unwrapped values. This method performs a deep copy of the map. This can be an expensive operation so only use this
 * method if you have no other alternatives.
 */
MapValue.prototype.unwrap = function() {
    return new RawMapValue(this);
};

/**
 * wraps the value in a simple or map value and adds to this map.
 * 
 * The use of config allows null or undefined to be passed in as the value. The subDirty flag can be used to force the new subkey to be dirty; an added key is
 * normally clean.
 * 
 * @private
 */
MapValue.prototype.add = function(k, config, subDirty, skipChange) {
    var key = k.toLowerCase();
    var v = config[k];
    
    var value = valueFactory.create(v, null, this.owner);
    this.value[key] = value;

    if (key !== k) {
        this.keys[key] = k;
    }
    
    if (this.oldvalue && this.oldvalue[key]) {
        this.copyHandlers(this.oldvalue[key], value);
    }

    this.makeDirty(subDirty);

    if (value.makeDirty && subDirty) {
        value.makeDirty(subDirty);
    }

    var handlers = this.handlers;
    if (handlers) {
        for ( var globalId in handlers) {
            var cmpHandlers = handlers[globalId];
            for (var i = 0; i < cmpHandlers.length; i++) {
                BaseValue.addValueHandler(k, value, cmpHandlers[i]);
            }
        }
    }
    
    if (!skipChange && (value.handlers || value.eventDispatcher)) {
        // Value might be simple, using eventDispatcher; it might be a map,
        // using handlers. Either way, if we have handlers from before or from
        // this map, fire the change.
        value.fire("change");
    }
};

/**
 * @public Associates the specified value with the specified key. If the map previously contained a mapping for the key, the old value is replaced by the
 *         specified value.
 * 
 * @param {String}
 *            k The key.
 * @param {Object}
 *            v The value.
 */
MapValue.prototype.put = function(k, v) {
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
 * Adds a new handler to the map value, fired when its children are changed.
 * 
 * @public
 */
MapValue.prototype.addHandler = function(config) {
    var values = this.value;
    var keys = this.keys;
    for ( var k in values) {
        var v = values[k];
        var key = keys[k] !== undefined ? keys[k] : k;
        BaseValue.addValueHandler(key, v, config);
    }

    var handlers = this.handlers;
    if (!this.handlers) {
        handlers = {};
        this.handlers = handlers;
    }

    var cmpHandlers = handlers[config["globalId"]];
    if (!cmpHandlers) {
        cmpHandlers = [];
        handlers[config["globalId"]] = cmpHandlers;
    }

    cmpHandlers.push(config);
};

/**
 * Destroys handlers registered for a given global id.
 * 
 * @protected
 */
MapValue.prototype.destroyHandlers = function(globalId) {
    var handlers = this.handlers;
    if (handlers) {
        delete handlers[globalId];
    }

    var values = this.value;
    for ( var k in values) {
        var v = values[k];
        if (v.destroyHandlers) {
            v.destroyHandlers(globalId);
        }
    }
};

/**
 * Returns true if the map contains the given key, in a case-insensitive test.
 * 
 * @private
 */
MapValue.prototype.contains = function(key) {
    return !$A.util.isUndefined(this.value[key.toLowerCase()]);
};

/**
 * Patch job for propagating change handlers & observers during setValue. TODO(fabbott, dchasman): Doug has a better implementation here coming.
 * 
 * @private
 */
MapValue.prototype.copyHandlers = function(oldvalue, newvalue) {
    if (!oldvalue) {
        return;
    }
    
    var k;
    var oldHandlers;

    oldHandlers = oldvalue.eventDispatcher ? oldvalue.eventDispatcher["markup://aura:valueChange"] : oldvalue.handlers;

    if (oldHandlers) {
        // Semi-deep copy the handlers: the actual handler objects can
        // be shared, but they're in a map of map of arrays, which needs to copy.
        // We can (and should) skip any handlers from "this" map's handlers,
        // because they'll be restored later, separately.
        var newHandlers;
        if (newvalue instanceof MapValue) {
            newvalue.handlers = {};
            newHandlers = newvalue.handlers;
        } else {
            newHandlers = newvalue.getEventDispatcher();
            if (!newHandlers["markup://aura:valueChange"]) {
                newHandlers["markup://aura:valueChange"] = {};
            }
            newHandlers = newHandlers["markup://aura:valueChange"];
        }

        for (k in oldHandlers) {
            newHandlers[k] = oldHandlers[k].concat(); // Using concat as "create copy"
            // TODO(fabbott): I wish we could trim out the map-level handlers; they
            // create duplicate calls. But there's no identity relation to figure
            // which are the dups, and in theory I've got the new event handling on
            // deck anyway, which won't push them down. So don't chase it.
        }
    }

    // Only SimpleValue supports obeservers today, but it's harmless to act as
    // though MapValues might:
    if (oldvalue.observers) {
        for (k = 0; k < oldvalue.observers.length; k++) {
            oldvalue.observers[k].observe(newvalue);
        }
    }

    // But only MapValue needs to recurse down:
    if (oldvalue instanceof MapValue && newvalue instanceof MapValue) {
        for ( var k in newvalue) {
            if (k in oldvalue) {
                this.copyHandlers(oldvalue[k], newvalue[k]);
            }
        }
    }
    // TODO(fabbott, dchasman): Arrays should be supported too, but aren't yet.
    // We don't much like expressions like {!v.foo.bar[3].baz} anyway....
};

// #include aura.value.MapValue_export
