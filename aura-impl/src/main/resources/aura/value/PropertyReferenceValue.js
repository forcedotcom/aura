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
 * @description A Value wrapper for a property reference.
 * @constructor
 * @protected
 */
function PropertyReferenceValue(path, valueProvider) {
    var isArray=$A.util.isArray(path);
    this.path = isArray?path:path.split('.');
    this.expression = isArray?path.join('.'):path;
    this.valueProvider = valueProvider;

    // #if {"modes" : ["STATS"]}
    valueFactory.index(this);
    // #end
}

PropertyReferenceValue.prototype.auraType = "Value";

/**
 * Returns the dereferenced value indicated by the path supplied.
 */
PropertyReferenceValue.prototype.evaluate = function(valueProvider) {
    if (this.isGlobal()) {
        return aura.get(this.expression);
    }
    return (valueProvider || this.valueProvider).get(this.expression);
};

/**
 * Sets the value indicated by the path
 */
PropertyReferenceValue.prototype.set = function(value) {
    this.valueProvider.set(this.expression,value);
};

PropertyReferenceValue.prototype.addChangeHandler=function(cmp, key, method) {
    var valueProvider=this.valueProvider;
    var expression = this.expression;
    // while(valueProvider instanceof PassthroughValue){
    //  expression = valueProvider.getExpression(expression);
    //     valueProvider=valueProvider.getComponent();
    // }
    if(valueProvider.addValueHandler&&(valueProvider!==cmp||expression!==key)) {
        if(!method){
            method=function PropertyReferenceValue$changeHandler(event) {
                $A.renderingService.addDirtyValue(key, cmp);

                // DVAL: HALO: FIXME:
                // Iteration can set this flag to true so we can 
                // prevent the events from firing on PRV where we know nothing has changed.
                if (!cmp["stopPropagationPRV"]) {
                    cmp.fireChangeEvent(key, event.getParam("oldValue"), event.getParam("value"), event.getParam("index"));
                }
            };
        }
        method.id=cmp.getGlobalId();
        method.key=key;
        var config={"event": "change", "value": expression, "method": method, "cmp": cmp};
        this.valueProvider.addValueHandler(config);

        // if(this.valueProvider instanceof PassthroughValue) {
        //     this.valueProvider.addValueHandler({"event": "change", "value": this.expression, "method": method});
        // }
    }
};


PropertyReferenceValue.prototype.removeChangeHandler=function(cmp, key){
    var valueProvider=this.valueProvider;
    var expression = this.expression;
    while(valueProvider instanceof PassthroughValue){
        expression = valueProvider.getExpression(expression);
        valueProvider=valueProvider.getComponent();
    }
    if(this.valueProvider.removeValueHandler&&(valueProvider!==cmp||this.expression!==key)) {
        this.valueProvider.removeValueHandler({"event": "change", "value": this.expression, "id":cmp.getGlobalId(),"key":key});
    }
};

/**
 * Returns true if the property reference starts with '$'.
 */
PropertyReferenceValue.prototype.isGlobal = function() {
    return this.path && this.path[0] && this.path[0].charAt(0) === '$';
};

/**
 * Returns the value in the format "v.expression".
 */
PropertyReferenceValue.prototype.getExpression = function() {
    return this.expression;
};

PropertyReferenceValue.prototype.getReference = function(path) {
    if(!path) {
        return this;
    }
    
    var valueProvider=this.valueProvider;
    var expression = this.expression;
    while(valueProvider instanceof PassthroughValue){
        expression = valueProvider.getExpression(expression);
        valueProvider=valueProvider.getComponent();
    }
    return valueProvider.getReference(expression + "." + path);
};

/**
 * Sets the isDefined flag to true.
 */
PropertyReferenceValue.prototype.isDefined = function() {
    return true;
};

PropertyReferenceValue.prototype.equals = function (target){
    return target instanceof PropertyReferenceValue && target.valueProvider === this.valueProvider && target.expression === this.expression;
};

/**
 * Sets the isDirty flag to false.
 */
PropertyReferenceValue.prototype.isDirty = function() {
    var valueProvider = this.valueProvider;
    var expression = this.expression;

    // KRIS: HALO: I'm really unsure if I want this here or not, do we check against the component if it's dirty? 
    // Why would we care if the passthrough value is dirty? I would think the 
    while(valueProvider instanceof PassthroughValue){
        expression = valueProvider.getExpression(expression);
        valueProvider=valueProvider.getComponent();
    }
    
    // Check Render service, since the value it could be referencing is dirty.
    return $A.renderingService.isDirtyValue(expression, valueProvider);
};

/**
 * Sets the isLiteral flag to false to denote that the property reference can be
 * changed.
 */
PropertyReferenceValue.prototype.isLiteral = function() {
    return false;
};

/**
 * Sets the isExpression flag to true to denote an expression.
 */
PropertyReferenceValue.prototype.isExpression = function() {
    return true;
};

/**
 * Destroys the path.
 */
PropertyReferenceValue.prototype.destroy = function() {


    // #if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
    // #end
    this.valueProvider=this.expression=this.path=null;
};

/**
 * Returns "PropertyReferenceValue" as String.
 */
PropertyReferenceValue.prototype.toString = function() {
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        return "{!"+this.expression+"}";
    //#end
    return "PropertyReferenceValue";
};

/**
 * When serializing say an Action, we don't want to serialize the reference elements, but the value under the covers.
 */
PropertyReferenceValue.prototype.toJSON = function() {
    return this.evaluate();
};


// #include aura.value.PropertyReferenceValue_export
