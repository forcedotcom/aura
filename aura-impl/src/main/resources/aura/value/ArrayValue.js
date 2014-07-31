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
	this.array = [];
    this.owner = component;
    this.hasRealValue = true;
    this.setValue(config);
    this.commit();

    this.fireEvents = true;
    this.initialized = true;
//#if {"modes" : ["DEVELOPMENT", "STATS"]}
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
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.get(name)[i] instead
 */
ArrayValue.prototype.getValue = function (index) {
    //$A.warning("DEPRECATED USE OF arrayValue.get(index). USE component.get(name)[index] INSTEAD.");
    return this._getValue(index);
};

/**
 * Returns the value object at the specified index.
 * <code>getValue('length')</code> returns a value object representing the length of this array value.
 * Any other argument for getValue() will flag an error.
 * @param {Number} i The length of the array.
 *
 * @private
 */
ArrayValue.prototype._getValue = function(i) {
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
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.get(name)[i] instead
 */
ArrayValue.prototype.get = function (index) {
    //$A.warning("DEPRECATED USE OF arrayValue.get(index). USE component.get(name)[index] INSTEAD.");
    return this._get(index);
};
/**
 * Returns the unwrapped value at the specified index. Shortcut for getValue(index).unwrap().
 * @param i The index for the value to retrieve
 */
ArrayValue.prototype._get = function(i) {
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

/** Returns true if the array was set to null or undefined, not an actual array. */
ArrayValue.prototype.isUnset = function() {
    return !this.hasRealValue;
};

/**
 * Removes all objects from the array.
 */
ArrayValue.prototype.clear = function() {
    this._setValue([]);
};

/**
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.set(name,value) instead
 */
ArrayValue.prototype.setValue = function (newArray, skipChange) {
    //$A.warning("DEPRECATED USE OF arrayValue.setValue(newArray, skipChange). USE component.set(name,newArray) INSTEAD.", newArray);
    this._setValue(newArray, skipChange);
};

/**
 * Sets the array to newArray.
 *
 * @param {Object} newArray The new array. This can be an array of literal JavaScript values or an array of value objects.
 * @param {Boolean} skipChange Set to true if you want to skip firing of the change event, which indicates that the content or state has changed. Or set to false if you want to fire the change event.
 * @param {Boolean} doNotAutoDestroy Set to true if you want to skip auto destroy in commit().
 */
ArrayValue.prototype._setValue = function(newArray, skipChange, doNotAutoDestroy) {
	if (doNotAutoDestroy) {
		this.doNotAutoDestroy = true;
	}
	
    this.fireEvents = false;
    this.hasRealValue = (newArray !== null && newArray !== undefined);
    this.newArray = [];
    
    if (newArray) {
        if (newArray.auraType === "Value" && newArray.toString() === "ArrayValue") {
            newArray = newArray.getArray();
        }
        
        if (aura.util.isArray(newArray)) {
        	try {
	        	this["ignoreCommit"] = true; // NOTE: Using this ridiculous workaround for obfuscation collisions from Google Closure (using DOT notation results in $A.util.on() being undefined!
	        	
				var candiates = this.array ? this.array.slice() : [];
		        for (var i = 0; i < newArray.length; i++) {
		        	var value = newArray[i];
		        	var found = false;
		
		        	if (value && candiates && candiates.length > 0) {
		            	// See if we can find an existing object to use
		                for (var j = 0; j < candiates.length; j++) {
		                	var current = candiates[j];
		                	if (current && $A.util.equalBySource(current, value)) {
		                		if (current && current.auraType === "Value") {
		                			current._setValue(value);
		                			
		                			// Preserve prior semantics that if something in the array is dirty then the entire array gets marked dirty
		                			if (current.isDirty()) {
		                				this.makeDirty();
		                			}
		                		}
		                		
		                		this.newArray.push(current);
		                		
		                		// Mark dirty if the positions are not equal
		                		if (i !== j && !this.isDirty()) {
		                			this.makeDirty();
		                		}
		                		
		                		// Consume the candidate
		                		candiates[j] = undefined;
		                		found = true;
		                		break;
		                	}
		                }
		        	}
		        	
		            // Create a new value
		            if (!found) {
		            	this.push(value);
		            }
		        } 

		        // Catch the case where we have a subset of the original values
		        if (!this.isDirty() && (this.newArray.length !== candiates.length)) {
		        	this.makeDirty();
		        }
        	} finally {
	        	delete this["ignoreCommit"];
	        }
        } else {
        	this.push(newArray);
        }
    } else {
        this.makeDirty();
    }

    // We always fire the change event even if nothing has changed because a number of places expect this 
    // to trigger initialization of downstream behavior
    this.fireEvents = true;
    if (!skipChange) {
        this.fire("change");
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
	// If we're in the middle of _setValue and a call to commit() happens we need to ignore it and not mess with
	// this.newArray while mid _setValue() (this can happen under tests)
	if (this.isDirty() && !this["ignoreCommit"]) {
		if (this.array) {
			if (!this.doNotAutoDestroy) {
				// Auto destroy any orphaned items
				var orphans = [];
				for (var i = 0; i < this.array.length; i++) {
					var toFind = this.array[i];
					if (toFind && toFind.auraType === "Component" && toFind.isValid()) {
						var found = false;
						for (var j = 0; j < this.newArray.length; j++) {
							if (this.newArray[j] === toFind) {
								found = true;
								break;
							}
						}
						
						if (!found) {
							orphans.push(toFind);
						}
					}
				}
				
				for (var n = 0; n < orphans.length; n++) {
					var orphan = orphans[n];
					orphan.getConcreteComponent().destroy();
				}
			} else {
				// Reset for the next time around since this is the result of _setValue() with doNotAutoDestroy === true
				this.doNotAutoDestroy = false;
			}
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
 * Returns true if a new array has been set using the setValue() method but not yet committed.
 */
ArrayValue.prototype.isDifferentArray = function() {
    return this.dirty && this.newArray !== this.array;
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
 * @param {Object} config The value for the new item. This can be either a literal JavaScript value or a value object.
 */
ArrayValue.prototype.push = function(config) {
    this.makeDirty();

	var ar = this.getArray();

    var value = valueFactory.create(config, null, this.owner);
    if (value.makeDirty) {
        value.makeDirty();
    }
    
    ar.push(value);
    
    this.hasRealValue = true;
    
    this.addValueHandlers(value);
};

/**
 * Inserts an item at the specified index of the array.
 * @param {Number} index The array index where the value will be inserted.
 * @param {Object} config The value of the new item. This can be either a literal JavaScript value or a value object.
 */
ArrayValue.prototype.insert = function(index, config) {
    if ($A.util.isNumber(index) && index >= 0) {
        var ar = this.getArray();
        var value = valueFactory.create(config, null, this.owner);
        ar.splice(index, 0, value);
        this.hasRealValue = true;
        this.makeDirty();
        for (var i = index; i < ar.length; i++) {
            if (ar[i].makeDirty) {
                ar[i].makeDirty();
            }
        }
        this.addValueHandlers(value);
    }
};

/**
 * Removes from the array the item(s) at the specified index and returns the removed item(s).
 * Largely for back compatibility, remove(i) will return the removed item, but remove(i,m)
 * will return an array of removed items (perhaps only one item, for m=1).
 *
 * @param {Number} index The array index of the item to be removed
 * @param {Number} count The number of items to remove.  If undefined, one item is removed,
 *     and the return is NOT an array.
 */
ArrayValue.prototype.remove = function(index, count) {
    if ($A.util.isNumber(index) && index >= 0 && index < this.getLength()) {
        var ar = this.getArray();
        var removed = ar.splice(index, count === undefined ? 1 : count);
        this.makeDirty();
        for (var i = index; i < ar.length; i++) {
            if (ar[i].makeDirty) {
                ar[i].makeDirty();
            }
        }
        var handlers = this.handlers;
        if (handlers) {
            for (var globalId in handlers) {
                for (i = 0; i < removed.length; i++) {
                    removed[i].destroyHandlers(globalId);
                }
            }
        }
        // Ensure that we keep a reference node, or that we create a new locator
        if (this.referenceNode) {
            i = 0;
            while (i < removed.length) {
                if (removed[i].getElement && removed[i].getElement() === this.referenceNode) {
                    break;   // We removed our reference
                }
                i++;
            }
            // First removed item with an element might have been the reference node
            if (removed[i] && removed[i].getElement && this.referenceNode === removed[i].getElement()) {
                // Oops, it's not anymore.  So, check if we still have one to use, or make one.
                i = 0;
                while (i < ar.length) {
                    if (ar[i].getElement && ar[i].getElement()) {
                        break;  // Found a viable reference node instead
                    }
                    i++;
                }
                if (i < ar.length) {
                    this.referenceNode = ar[i].getElement();
                } else {
                    var newRef = this.createLocator("array locator " + this.owner);
                    $A.util.insertBefore(newRef, this.referenceNode);
                    this.referenceNode = newRef;
                }
            }
        }
        this.fire("change");
        return count === undefined ? removed[0] : removed;
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
 * @private
 */
ArrayValue.prototype.fire = function(name) {
    if (this.initialized && this.fireEvents){
        BaseValue.fire(name, this.unwrap(), this.getEventDispatcher());
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
 * <p>For example, this function simply alerts the user for each value in the array.</p>
 * <code>
 * arrValue.each(function(val) {
 *      alert(val);
 * });
 *</code>
 * @param {Function} func The function that operates on each value.
 * @param {Boolean} reverse If defined, reverses the direction of the iteration.
 */
ArrayValue.prototype.each = function(func, reverse) {
    var a = this.getArray();
    
    if (a) {
	    var i;
	    if (reverse) {
	        for(i = a.length - 1; i >= 0; i--){
	            func(a[i],i);
	        }
	    } else {
	        for(i = 0; i < a.length; i++){
	            func(a[i],i);
	        }
	    }
    }
};

/**
 * Calls getValue() and returns the unwrapped value at the specified index.
 * Different from <code>get()</code>, which is generally preferred, because this bypasses
 * the expression service for lookup.
 *
 * @param {Number} i Index of value to return.
 */
ArrayValue.prototype.getRawValue = function(i) {
    var ret = this.getValue(i);

    return !ret ? ret : ret.unwrap();
};

/**
 * Recursively destroys all values in the array and deletes the array.
 * Also, removes any onchange handlers listening to this value object.
 * @param {Boolean} async Set to true if values are to be destroyed asynchronously. The default is false.
 */
ArrayValue.prototype.destroy = function(async) {
//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end

//#if {"modes" : ["TESTING", "TESTINGDEBUG", "AUTOTESTING", "AUTOTESTINGDEBUG"]}
    async = false; // Force synchronous destroy when in testing modes
//#end

    function destroy(a, async) {
        var array = a.dirty ? a.newArray : a.array;
        for (var i = 0; i < array.length; i++) {
            var v = array[i];
            if (v !== undefined && v.destroy !== undefined) {
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
            if (this.referenceNode && this.owner.isValid()) {
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
    var ret = [];
    this.each(function(v) {
        ret.push(v.unwrap ? v.unwrap() : v);
    });

    // establish a back ref from the array to the ArrayValue for those times when someone has stripped off the
    // ArrayValue'ness and we need it
    ret._arrayValueRef = this;

    return ret;
};

/**
 * Compare to an ArrayValue or Array.
 * @param {Object} arr The object that is compared. If the object is neither an ArrayValue nor an Array, return false.
 * @returns {Boolean} Returns true if they are identical return true, otherwise return false.
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
            if (m[i]._getValue() !== arr[i]._getValue()) {
                return false;
            }
        } else {
            if (m[i]._getValue() !== arr[i]) {
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
 * @param {Object} config The handlers to be added to the queue.
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

    var prevReferenceNodes = [];
    this.prevReferenceNodes = prevReferenceNodes;

    var referenceNode;
    var ret = [];

    var array = this.getArray();
    var len = array.length;
    for (var i = 0; i < len; i++) {
        var item = array[i];

        var els = $A.render(item);

        var elLen = els.length;
        if (elLen > 0) {
            ret = ret.concat(els);

            // Just use the last element as the reference node
            referenceNode = els[elLen - 1];
        } else {
            referenceNode = this.createLocator(" item " + item);
            ret.push(referenceNode);
        }

        rendered[item.getGlobalId()] = { 
    		refNode: referenceNode,
    		index: i
		};
        
        prevReferenceNodes[i] = referenceNode;
    }

    if (ret.length > 0) {
        // Just use the first element as the reference node
        referenceNode = ret[0];
    } else {
        referenceNode = this.createLocator(" array locator " + this.owner);
        ret.unshift(referenceNode);
    }

    this.setReferenceNode(referenceNode);

    if (parent) {
        insertElements(ret, parent);
    }

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
 * Rerender the elements in the array.
 *
 * This function tries to maintain pointers to various positions in the array
 * so that it can be correctly re-rendered as necessary.
 *
 * @private
 */
ArrayValue.prototype.rerender = function(suppliedReferenceNode, appendChild, insertElements){
    if (!this.hasBeenRendered) {
        // No reason to attempt to rerender something that was never rendered in the first place!
        return;
    }

    var prevRendered = this.rendered || {};
    var prevReferenceNodes = this.prevReferenceNodes || [];
    var rendered = {};
        
    /** Since ArrayValue has no getElements, we'd better have rerender return them all */
    var elems = [];

    // These three variables are used to ensure that we do not lose our reference node when the
    // contents are removed. Basically, if the array is empty, we declare that we need a reference
    // node, and ensure that one is created if there were previously elements in the array. All
    // very complicated in the case where you do not have a parent node (which is the case here).
    var startReferenceNode = this.referenceNode;
    var firstReferenceNode = null;
    var needReference = false;
    var item, info, globalId;
    
    var referenceNode = (appendChild || !this.referenceNode) ? suppliedReferenceNode : this.referenceNode;
    
    if (!this.isEmpty()) {
        var array = this.getArray();
        var len = array.length;
        
        
        // DCHASMAN TODO Add surgical DOM repositioning for previously rendered components! Can we swap reference nodes? Reparent??
        var positionChanges = false;
        var previousIndex = 0;
        for (var j = 0; j < len; j++) {
            item = array[j];
        	
            info = prevRendered[item.getGlobalId()];
            if (info) {
	            // Look for reordering - if the relative ordering of current items has been maintained between renderings we'll use inplace rerender
	            if (info.index < previousIndex) {
	            	positionChanges = true;
	            	break;
	            }
	            
	            previousIndex = info.index;
            }
        }
        
        if (positionChanges) {

        	$A.log("Fragment based rerendering ", this);
        	
        	// Switch to fragment rerendering
        	var parent = referenceNode.parentNode;
        	var fragment = document.createDocumentFragment();
        	
            for (var j = 0; j < len; j++) {
                item = array[j];
                
                if (item.isValid()) {
	                globalId = item.getGlobalId();
	                
	                if (!item.isRendered()) {
	                	prevRendered[globalId] = info = { 
	                		refNode: null // DCHASMAN TODO Figure out the best way to get the ref node for this!
	            		};
	                	
	                	$A.render(item);
	                } else {
		                info = prevRendered[globalId];
	                }
	
	            	info.index = j;
	
	        		var elements = item.getElements();
	        		var element = elements[0]; 
	                if (element) {
	                	var elementKey = 1;
	                	do {
							fragment.appendChild(element);
	                		element = elements[elementKey++]; 
	                	} while (element);
	                } else {
	                	element = elements["elements"];
	                	if (element) {
	                		fragment.appendChild(element);
	                	}
	                }
	
	                //$A.rerender(item);
                }
            }

            parent.appendChild(fragment);

        	return;
        }
        
        for (j = 0; j < len; j++) {
            item = array[j];

            globalId = item.getGlobalId();
            var itemReferenceNode;
            var itemElems;
            
            if (!item.isRendered()) {
                // If the item was not previously rendered, we render after the last element.
                itemElems = $A.render(item);
                
                if (itemElems.length > 0) {
                    // Just use the last element as the reference node
                    itemReferenceNode = itemElems[itemElems.length - 1];
                } else {
                    // If nothing was rendered put in a placeholder so that we
                    // can find the element. (FIXME W-1835211: this needs tests -- is it removed?.)
                    itemReferenceNode = this.createLocator(" item {rerendered, index:" + j + "} " + item);
                    itemElems.push(itemReferenceNode);
                }

                // When adding children and index is zero, referenceNode still points to parent,
                // and we need to call insertFist(), not appendChild()
                var asFirst = (j === 0);
                insertElements(itemElems, referenceNode, !appendChild, asFirst);

                $A.afterRender(item);
            } else {            	
                itemElems = $A.rerender(item);
                
                // Find the item reference node.  We have prevRendered, but can't trust it: the
                // elem might have rerendered away.  So, go hunting....

                if (itemElems.length > 0) {
                    // itemElems is an array, take the last one
                    itemReferenceNode = itemElems[itemElems.length - 1];
                } else {
                    // Get the funky elements object, find the last
                    itemElems = item.getElements();

                    if (itemElems === undefined) {
                        // in case there are no elements, associate a comment
                        item.associateElement({
                            "name": 0,
                            "element": this.createLocator(" item {rerendered, index:" + j + "} " + item)
                        });
                        itemElems = item.getElements();
                    }

                    if (itemElems[0]) {
                        for (var k = 0; itemElems[k]; ++k) {
                            itemReferenceNode = itemElems[k];
                        }
                    } else {
                        itemReferenceNode = itemElems['element'];
                    }
                }
            }
            // We have prevRendered, but can't trust it: the elem might have rerendered away.
            itemElems = item.getElements();
            itemReferenceNode = itemElems[0] ? itemElems[0] : itemElems['element'];
            
            if (firstReferenceNode === null) {
                firstReferenceNode = itemReferenceNode;
            }
            
            itemElems = item.getElements();
            for (k = 0; itemElems[k]; ++k) {
                elems.push(itemElems[k]);
            }

            // Next iteration of the loop will use this component's ref node as its "top"
            // FIXME W-1835211: this may remove elements...
            referenceNode = itemElems[k - 1];
            this.setReferenceNode(referenceNode);

            appendChild = false;

            rendered[globalId] = { 
        		refNode: itemReferenceNode,
        		index: j
    		};
            
            prevReferenceNodes[j] = itemReferenceNode;
        }
    } else {
        needReference = true;
    }

    // Unrender components no longer in the array
    for (var key in prevRendered) {
        if (needReference) {
            // If we need a reference node (this only occurs when we have
            // nothing to render), make sure that we create one and put it
            // in the right spot. If there was nothing previously rendered
            // this isn't needed because we already have a locator.
            referenceNode = this.createLocator(" array locator " + this.owner);
            insertElements([referenceNode], startReferenceNode, true);
            firstReferenceNode = referenceNode;
            needReference = false;
        }

        if (!rendered[key]) {
            var c = $A.getCmp(key);
            if (c && c.isValid()) {
                $A.unrender(c);
            }
        }
    }
    
    if (elems.length === 0 && firstReferenceNode) {
        // Symmetrically to render(), if there are no "real" elements, use the reference node.
        elems.unshift(firstReferenceNode);
    }
    
    if (firstReferenceNode === null) {
        firstReferenceNode = startReferenceNode;
    }
    
    this.setReferenceNode(firstReferenceNode);
        
    this.rendered = rendered;
    this.prevReferenceNodes = prevReferenceNodes;
    
    return elems;
};

/**
 * Returns the reference node during a rerender.
 */
ArrayValue.prototype.getReferenceNode = function() {
    return this.referenceNode;
};

/**
 * @private
 */
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
    if (ref === this.referenceNode) {
        return;
    }
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
