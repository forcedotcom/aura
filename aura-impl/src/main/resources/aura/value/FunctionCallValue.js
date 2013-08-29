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
 * @namespace A Value wrapper for a function call.
 * @constructor
 * @protected
 */
function FunctionCallValue(config, def, cmp){
    this.func = expressionFunctions[config["key"]];
    this.def = def;
    this.cmp = cmp;
    if (!this.func) {
        throw new Error("couldn't find function from key: " + config["key"]);
    }
    this.args = [];
    for (var i = 0; i < config["args"].length; i++) {
        this.args.push(valueFactory.create(config["args"][i]));
    }

//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

FunctionCallValue.prototype.auraType = "Value";

/**
 * Sets the isDirty flag to false.
 */
FunctionCallValue.prototype.isDirty = function(){
    return false;
};

/**
 * Returns the value of function call with the given value provider.
 * Throws an error if vp is not provided.
 * @param {Object} vp The value provider to resolve.
 */
FunctionCallValue.prototype.getValue = function(vp){
    aura.assert(vp, "no value provider to resolve against");
    var str = "";
    var dirty = false;
    var resolvedArgs = [];
    for (var i = 0; i < this.args.length; i++) {
        var a = this.args[i];
        if (a.isExpression()) {
            a = expressionService.getValue(vp, a);
        }
        
        var value = null;
        if (a) {
            dirty = dirty || a.isDirty();
            value = a;
        }
        
        resolvedArgs.push(value);
    }
    
    var result = this.func.call(null, resolvedArgs);
    
    var ret;
    if (result && result.auraType === "Value"){
        ret = result;
        result = ret.unwrap();
    } else{
        ret = valueFactory.create(result, this.def, this.cmp);
    }

    if (dirty && ret.makeDirty) {
        ret.makeDirty();
    }

    return ret;
};

/**
 * Always throws an error because the value wrapper cannot be unwrapped.
 * Do not call.
 */
FunctionCallValue.prototype.unwrap = function(){
    throw new Error("Cannot unwrap an FunctionCallValue");
};

/**
 * Always throws an error because the value wrapper cannot be merged into.
 * Do not call.
 */
FunctionCallValue.prototype.merge = function() {
    throw new Error("Cannot merge into an FunctionCallValue");
};

/**
 * Sets the isLiteral flag to false to denote that the element can be changed.
 */
FunctionCallValue.prototype.isLiteral = function(){
    return false;
};

/**
 * Sets the isExpression flag to true to denote that the element is an expression.
 */
FunctionCallValue.prototype.isExpression = function(){
    return true;
};

/**
 * Destroys the value wrapper.
 */
FunctionCallValue.prototype.destroy = function(){
//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    delete this.type;
    delete this.args;
};

/**
 * Sets the isDefined flag to true.
 */
FunctionCallValue.prototype.isDefined = function(){
    return true;
};

/**
 * Helpful for logging/debugging.  Prints String value of the wrapped object.
 */
FunctionCallValue.prototype.toString = function(){
    return "FunctionCallValue";
};
//#include aura.value.FunctionCallValue_export


