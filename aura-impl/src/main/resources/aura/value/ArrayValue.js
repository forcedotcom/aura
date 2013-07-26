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
 * @class A value object wrapper for an array. Each member of the array is a value object rather than a JavaScript literal value.
 * A value object is a thin wrapper around the actual data. The wrapper layer around the literal JavaScript objects enables you
 * to modify data in a transactional manner. The framework selectively rerenders and updates the UI in response to data changes.
 * @constructor
 * @protected
 */
function ArrayValue(config, def, component) {
    this.owner = component;
    this.setValue(config);
    this.commit();

    this.fireEvents = true;
    this.initialized = true;
//#if {"modes" : ["DEVELOPMENT"]}
    if (def) {
        this.name = def.getDescriptor().getQualifiedName();
    }
//#end
//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

ArrayValue.prototype.auraType = "Value";

/**
 * Returns the value object at the specified index.
 * getValue('length') will return a value object representing the length of this array value.
 * Any other argument for getValue() will flag an error.
 */
ArrayValue.prototype.getValue = function(i) {
    if (aura.util.isString(i)) {
        if ("length" === i) {
            // special case for length
            return valueFactory.create(this.getLength());
        } else {
            i = parseInt(i, 10);
        }
    }

    aura.assert(!isNaN(i), "A number is required for getValue on ArrayValue");

    return this.getArray()[i];
};

/**
 * Returns the new array if this value is dirty
 * @private
 */
ArrayValue.prototype.getArray = function() {
    var array = this.dirty ? this.newArray : this.array;

    if (array && !array._arrayValueRef) {
        // establish a back ref from the array to the ArrayValue for those times when someone has stripped off the
        // ArrayValue'ness and we need it
        array._arrayValueRef = this;
    }

    return array;
};

/**
 * Returns the unwrapped value at the specified index. Shortcut for getValue(index).unwrap().
 * @param i The index for the value to retrieve
 */
ArrayValue.prototype.get = function(i) {
    return $A.expressionService.get(this, String(i));
};

/**
 * Returns the length of the array.
 */
ArrayValue.prototype.getLength = function() {
    var arr = this.getArray();

    if (arr) {
        return arr.length;
    }
    
    return 0;
};

/**
 * Returns true if the array is empty; false otherwise.
 */
ArrayValue.prototype.isEmpty = function() {
    return this.getLength() === 0;
};

/**
 * Removes all objects from the array.
 */
ArrayValue.prototype.clear = function() {
    this.setValue([]);
};

/**
 * Promises that I am the true owner of my children and that I should be responsible for cleaning
 * up lost references.
 */
ArrayValue.prototype.setIsOwner = function(isOwner) {
    this.isOwner = isOwner;
};


/**
 * Sets the array to newArray.
 *
 * @param newArray The new array. This can be an array of literal JavaScript values or an array of value objects.
 */
ArrayValue.prototype.setValue = function(newArray, skipChange) {
    this.fireEvents = false;

    if (this.array === undefined) {
        this.array = [];
    }
    this.newArray = [];
    this.makeDirty();

    if (newArray) {
        if (newArray.auraType === "Value" && newArray.toString() === "ArrayValue"){
            newArray = newArray.getArray();
        }

        if (!aura.util.isArray(newArray)) {
            newArray = [ newArray ];
        }
        for (var i = 0; i < newArray.length; i++) {
           this.push(newArray[i]);
           if (i < this.array.length) {
               // Values at old indeces are dirty, since they may have changed.
               if (this.newArray[i].makeDirty) {
                   this.newArray[i].makeDirty();
               }
           }
        }
    }

    this.fireEvents = true;
    if (!skipChange) {
    	this.fire("change");
    }
};


/**
 * Recursively destroys all values in the array
 */
ArrayValue.prototype.destroyOrphans = function(array, async) {
    
     while (array.length > 0) {
         var v = array.pop();
         if (v && v.destroy) {
             v.destroy(async);
         }
    }
};

/**
 * Commits changes to the array.
 * If there is no uncommitted value, nothing will happen.  isDirty() will return false
 * after this method is called.
 *
 * @param {Object} clean Do not use this internal-only parameter.
 */
ArrayValue.prototype.commit = function(clean) {
    if (this.isDirty()) {
        if (this.array && this.isOwner) {
            this.destroyOrphans(this.array,true);
        }
            
        this.array = this.newArray;
        this.rollback(clean);
    }
};

/**
 * @private
 */
ArrayValue.prototype.makeDirty = function() {
    if (!this.dirty) {
        if($A.util.isUndefinedOrNull(this.newArray)){
            this.newArray = this.array;
        }

        this.dirty = true;
        $A.renderingService.addDirtyValue(this);
    }
};

/**
 * Returns true if the array has been modified but not yet committed. The dirty flag is set whenever data changes.
 * Aura automatically rerenders the component that owns the data, and calls commit() to remove the dirty flag.
 */
ArrayValue.prototype.isDirty = function() {
    return this.dirty;
};

/**
 * Removes uncommitted changes if there are any. isDirty() returns false after rollback() is called.
 * This method doesn't return a value.
 *
 * @param {Object} clean Do not use this internal-only parameter.
 */
ArrayValue.prototype.rollback = function(clean){
    if (this.isDirty()) {
        delete this.newArray;
        this.dirty = false;
        if (!clean && this.owner) {
            // was called by user directly
            $A.renderingService.removeDirtyValue(this);
        }
    }
};

/**
 * Adds a new item to the end of the array.
 *
 * @param config The value for the new item. This can be either a literal JavaScript value or a value object.
 */
ArrayValue.prototype.push = function(config) {
    var ar = this.getArray();

    var value = valueFactory.create(config, null, this.owner);
    ar.push(value);

    this.makeDirty();
    this.addValueHandlers(value);
};

/**
 * Inserts an item at the specified index of the array.
 * @param index The array index where the value will be inserted
 * @param config The value of the new item. This can be either a literal JavaScript value or a value object.
 */
ArrayValue.prototype.insert = function(index, config) {
    if ($A.util.isNumber(index) && index >= 0) {
        var ar = this.getArray();
        var value = valueFactory.create(config, null, this.owner);
        ar.splice(index, 0, value);
        this.makeDirty();

        this.addValueHandlers(value);
    }
};

/**
 * Removes from the array the item at the specified index and returns the removed item.
 */
ArrayValue.prototype.remove = function(index) {
    if ($A.util.isNumber(index) && index >= 0 && index < this.getLength()) {
        var ar = this.getArray();
        var removed = ar.splice(index, 1)[0];
        this.makeDirty();

        var handlers = this.handlers;
        if (handlers) {
            for (var globalId in handlers) {
                removed.destroyHandlers(globalId);
            }
        }

        this.fire("change");
        return removed;
    }
    return null;
};


/**
 * @private
 */
ArrayValue.prototype.addValueHandlers = function(value){
    var handlers = this.handlers;
    if (handlers) {
        for (var globalId in handlers) {
            var cmpHandlers = handlers[globalId];
            for ( var i = 0; i < cmpHandlers.length; i++) {
                BaseValue.addValueHandler(i, value, cmpHandlers[i]);
            }
        }

        this.fire("change");
    }
};

/**
 * @protected
 */
ArrayValue.prototype.fire = function(name) {
    if (this.initialized && this.fireEvents){
        BaseValue.fire(name, this, this.getEventDispatcher());
    }
};

/**
 * Returns false as this is not an expression.
 */
ArrayValue.prototype.isExpression = function() {
    return false;
};

/**
 * Returns false as this is not a literal.
 */
ArrayValue.prototype.isLiteral = function() {
    return false;
};

/**
 * Iterates through the array and calls the user-defined function on each value.
 * For example, this function simply alerts the user for each value in the array.
 *
 * arrValue.each(function(val) {
 *      alert(val);
 * });
 *
 * @param func The function that operates on each value.
 * @param reverse If defined, reverses the direction of the iteration.
 */
ArrayValue.prototype.each = function(func, reverse) {
    var a = this.getArray();
    var i;
    if (reverse) {
        for(i = a.length - 1; i >= 0; i--){
            func(a[i]);
        }
    } else {
        for(i = 0; i < a.length; i++){
            func(a[i]);
        }
    }
};

/**
 * Returns the unwrapped value at the specified index.
 *
 * @param i index of value to return.
 */
ArrayValue.prototype.getRawValue = function(i) {
    var ret = this.getValue(i);

    return !ret ? ret : ret.unwrap();
};

/**
 * Recursively destroys all values in the array and deletes the array.
 * Also, removes any onchange handlers listening to this value object.
 */
ArrayValue.prototype.destroy = function(async) {
//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    function destroy(a, async) {
        var array = a.dirty ? a.newArray : a.array;
        for (var i = 0; i < array.length; i++) {
            var v = array[i];
            if (v !== undefined) {
                v.destroy(async);
            }
        }

        // Remove back reference
        delete array._arrayValueRef;
    }

    if (this.isDirty()) {
        destroy(this, async);
        this.rollback();
    }

    var a = this.array;
    if (a) { // in case destroy is called twice
        var len = a.length;
        if (len > 0) {
            if (this.referenceNode) {
                // We need to inject a replacement reference node because our current one is about to be destroyed
                var referenceNode = this.createLocator(" array locator (from destroy) " + this.owner);
                $A.util.insertBefore(referenceNode, this.referenceNode);
                this.setReferenceNode(referenceNode);
            }

            destroy(this, async);
        }

        delete this.rendered;
        delete this.array;
    }

    delete this.handlers;
};



/**
 * Returns this type as a String.
 */
ArrayValue.prototype.toString = function(){
    return "ArrayValue";
};

/**
 * Returns a copy of the array containing unwrapped values.
 * This method performs a deep copy of the array.
 * This can be an expensive operation so only use this method if you have no other alternatives.
 */
ArrayValue.prototype.unwrap = function(){
    // DCHASMAN TODO See JayM about killing this entirely - bad things happen when this gets used indirectly via get("v.body")
    // instead of getValue("v.body");
    var ret = [];
    this.each(function(v) {
        ret.push(v.unwrap());
    });

    // establish a back ref from the array to the ArrayValue for those times when someone has stripped off the
    // ArrayValue'ness and we need it
    ret._arrayValueRef = this;

    return ret;
};

/**
 * Compare to an ArrayValue or Array.
 * @param {Object} arr The object that is compared. If the object is neither an ArrayValue nor an Array, return false.
 * @returns {Boolean} if they are identical return true, otherwise return false.
 */
ArrayValue.prototype.compare = function(arr) {
    if (arr && arr.auraType === "Value" && arr.toString() === "ArrayValue") {
        arr = arr.getArray();
    }
    if (!aura.util.isArray(arr)) {
        return false;
    }

    var m = this.getArray();
    if (m.length != arr.length) {
        return false;
    }
    for (var i = 0; i < m.length; i++) {
        if (m[i].compare) {
            if (!m[i].compare(arr[i])) {
                return false;
            }
        }
        if (arr[i].auraType === "Value") {
            if (m[i].getValue() !== arr[i].getValue()) {
                return false;
            }
        } else {
            if (m[i].getValue() !== arr[i]) {
                return false;
            }
        }
    }
    return true;
};

/**
 * @private
 */
ArrayValue.prototype.getEventDispatcher = function() {
    var ret = this.eventDispatcher;
    if (ret === undefined) {
        ret = {};
        this.eventDispatcher = ret;
    }
    return ret;
};

/**
 * Adds handlers that will be called by the value when a related event is triggered.
 * @param {Object} config The handlers to be added to the queue
 */
ArrayValue.prototype.addHandler = function(config){
    BaseValue.addHandler(config, this.getEventDispatcher());

    var values = this.getArray();
    for (var i = 0; i < values.length; i++){
        var value = values[i];
        BaseValue.addValueHandler(i, value, config);
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
 * @private
 */
ArrayValue.prototype.destroyHandlers = function(globalId){
    var handlers = this.handlers;
    if (handlers){
        delete handlers[globalId];
    }

    var values = this.getArray();
    for (var i = 0; i < values.length; i++){
        var value = values[i];
        value.destroyHandlers(globalId);
    }
};

/**
 * @private
 */
ArrayValue.prototype.render = function(parent, insertElements){
    var rendered = {};
    this.rendered = rendered;

    var referenceNode;
    var ret = [];

    var that = this;
    var array = this.getArray();
    var len = array.length;
    for (var i = 0; i < len; i++) {
        var item = array[i];

        var els = $A.render(item);

        var elLen = els.length;
        for (var j = 0; j < elLen; j++) {
            ret.push(els[j]);
        }

        if (elLen > 0) {
            // Just use the last element as the reference node
            referenceNode = els[elLen - 1];
        } else {
            referenceNode = this.createLocator(" item " + item);
            ret.push(referenceNode);
        }

        rendered[item.getGlobalId()] = referenceNode;
    }

    if (ret.length > 0) {
        // Just use the first element as the reference node
        referenceNode = els[0];
    } else {
        referenceNode = this.createLocator(" array locator " + this.owner);
        ret.unshift(referenceNode);
    }

    this.setReferenceNode(referenceNode);

    insertElements(ret, parent);

    this.hasBeenRendered = true;

    return ret;
};

/**
 * @private
 */
ArrayValue.prototype.unrender = function(){
    this.setReferenceNode(null);
    delete this.rendered;
};

/**
 * @private
 */
ArrayValue.prototype.rerender = function(suppliedReferenceNode, appendChild, insertElements){
    if (!this.hasBeenRendered) {
        // No reason to attempt to rerender something that was never rendered in the first place!
        return;
    }

    var prevRendered = this.rendered || {};
    var rendered = {};
    if (!this.isEmpty()) {
        var referenceNode = appendChild || !this.referenceNode ? suppliedReferenceNode : this.referenceNode;

        var renderer;
        var array = this.getArray();
        var len = array.length;
        for (var j = 0; j < len; j++) {
            var item = array[j];

            if (!item["getDef"]) {
                // If someone passed a config in, construct it.
                item = $A.componentService.newComponentDeprecated(item, null, false, true);

                // And put the constructed component back into the array.
                array[j] = item;
            }

            var globalId = item.getGlobalId();
            var itemReferenceNode;
            if (!item.isRendered()) {
                var ret = $A.render(item);
                if (ret.length > 0) {
                    // Just use the last element as the reference node
                    itemReferenceNode = ret[ret.length - 1];
                } else {
                    itemReferenceNode = this.createLocator(" item {rerendered, index:" + j + "} " + item);
                    ret.push(itemReferenceNode);
                }

                insertElements(ret, referenceNode, !appendChild);

                $A.afterRender(item);
            } else {
                $A.rerender(item);

                itemReferenceNode = prevRendered[globalId];
                if (!itemReferenceNode) {
                    itemReferenceNode = item.getElement();
                }
            }

            // Next iteration of the loop will use this component's ref node as its "top"
            referenceNode = itemReferenceNode;
            this.setReferenceNode(referenceNode);

            appendChild = false;

            rendered[globalId] = itemReferenceNode;
        }
    }

    // Unrender components no longer in the array
    for (var key in prevRendered) {
        if (!rendered[key]) {
            var c = $A.getCmp(key);
            if (c && c.isValid()) {
                $A.unrender(c);
            }
        }
    }

    this.rendered = rendered;
};

ArrayValue.prototype.getReferenceNode = function() {
    return this.referenceNode;
};

ArrayValue.prototype.createLocator = function(debugText) {
    var label = "";

    //#if {"modes" : ["DEVELOPMENT"]}
    label = debugText;
    //#end

    var locator = document.createComment(label);
    locator._arrayValueOwner = this;

    return locator;
};

ArrayValue.prototype.setReferenceNode = function(ref) {
    if (this.referenceNode && this.referenceNode._arrayValueOwner === this) {
        this.referenceNode._arrayValueOwner = null;
        $A.util.removeElement(this.referenceNode);
    }

    if (ref) {
        this.referenceNode = ref;
    } else {
        delete this.referenceNode;
    }
};

//#include aura.value.ArrayValue_export
