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
/**
 * @description A value provider that resolves against a few primary providers first, then falls back on a component.
 * @constructor
 * @protected
 */
function PassthroughValue(primaryProviders, component) {
    this.primaryProviders = primaryProviders;
    this.component = component;
    this.references={};
}

PassthroughValue.prototype.auraType = "Value";

/**
 * Returns the Component.
 */
PassthroughValue.prototype.getComponent = function() {
    return this.component;
};

/**
 * Returns the primary providers associated with the given key or the Component.
 * @param {String} key The data key to look up on the primary providers.
 */
PassthroughValue.prototype.get = function(key) {
	var path = key.split('.');
    if (this.primaryProviders.hasOwnProperty(path[0])){
        var value = null;
        if(path.length>1) {
            value=$A.expressionService.resolve(key, this.primaryProviders);
        }else{
            value=this.primaryProviders[key];
        }
        while($A.util.isExpression(value)){
            value = value.evaluate();
        }
        return value;
    } else {
    	return this.component.get(key);
    }
};

/**
 * Passthrough's have extra providers that can reference other items of data.
 * If it's raw data, no problem. If it's another reference, you may want to 
 * expand that reference. {row.value} could expand into {v.item.0.value} if row 
 * is at index 0. 
 * @param {String} expression The key to reference on the component, which will get expanded into the reference you were looking for.
 */
PassthroughValue.prototype.getExpression = function(expression) {
    var path = $A.util.isArray(expression)?expression:expression.split(".");
    
    if(this.primaryProviders.hasOwnProperty(path[0])){
        var provider = this.primaryProviders[path[0]];
        if(provider instanceof PassthroughValue) {
            return provider.getExpression(path);
        }

        if(provider instanceof PropertyReferenceValue) {
            path.splice(0, 1, provider.getExpression());
            return path.join(".");
        }
    }
    return expression;
};

/**
 * Sets the value of the primary providers associated value.
 * @param {String} key The data key to look up on the primary providers.
 * @param {Object} v The value to be set.
 */
PassthroughValue.prototype.set = function(key, value) {
   var path = key.split('.');
    if (this.primaryProviders.hasOwnProperty(path[0])){
        var target=this.primaryProviders;
        key=path[path.length-1];
        if(path.length>1) {
            target=$A.expressionService.resolve(path.slice(0,path.length-1),target);
        }
        var oldValue=target[key];
        target[key]=value;
        var valueProvider = this.component;
        while (valueProvider instanceof PassthroughValue) {
            valueProvider = valueProvider.getComponent();
        }
        valueProvider.fireChangeEvent(key,oldValue,value,key);
        valueProvider.markDirty(key);
        return value;
    }

   return this.component.set(key,value);
};

/**
 * Returns a reference to a key on the the primary provider or the Component.
 * @param {String} key The data key for which to return a reference.
 */
PassthroughValue.prototype.getReference = function(key) {
    key = aura.expressionService.normalize(key);
    var path = key.split('.');
    if (this.primaryProviders.hasOwnProperty(path[0])){
        if(!this.references.hasOwnProperty(key)){
            this.references[key]=new PropertyReferenceValue(key, this);
        }
        return this.references[key];
    } else {
        return this.component.getReference(key);
    }
};


/**
 * Delegates indexing logic to the wrapped value provider.
 * Likely delegating to a wrapped component.
 */
PassthroughValue.prototype.index = function () {
    var valueProvider = this.getComponent();

    // Potentially nested PassthroughValue objects.
    while (valueProvider instanceof PassthroughValue) {
        valueProvider = valueProvider.getComponent();
    }

    if (!valueProvider) {
        return;
    }

    valueProvider.index.apply(valueProvider, arguments);
};

/**
 * Delegates de-indexing logic to the wrapped value provider.
 * Likely delegating to a wrapped component.
 */
PassthroughValue.prototype.deIndex = function () {
    var valueProvider = this.getComponent();

    // Potentially nested PassthroughValue objects.
    while (valueProvider instanceof PassthroughValue) {
        valueProvider = valueProvider.getComponent();
    }

    if (!valueProvider) {
        return;
    }

    valueProvider.deIndex.apply(valueProvider, arguments);
};

//#include aura.value.PassthroughValue_export
