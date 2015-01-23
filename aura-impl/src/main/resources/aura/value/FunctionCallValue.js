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
 * @description A Value wrapper for a function call.
 * @constructor
 * @protected
 */
function FunctionCallValue(config, valueProvider){
    this.func = expressionFunctions[config["key"]];
    this.valueProvider=valueProvider;
    this.byValue = config["byValue"];
    if (!this.func) {
        throw new Error("FunctionCallValue.ctor(): Unknown function '" + config["key"]+'.');
    }
    this.args = [];
    for (var i = 0; i < config["args"].length; i++) {
        this.args.push(valueFactory.create(config["args"][i],null,this.valueProvider));
    }

//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
    

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	this.key = config["key"];
//#end    
}

FunctionCallValue.prototype.auraType = "Value";

/**
 * Sets the isDirty flag to false.
 */
FunctionCallValue.prototype.isDirty = function(){
	for (var i = 0; i < this.args.length; i++) {
        var arg = this.args[i];
        if (aura.util.isExpression(arg) && arg.isDirty()) {
        	return true;
        }
    }
    return false;
};

/**
 * Returns the value of function call with the given value provider.
 * Throws an error if vp is not provided.
 * @param {Object} valueProvider The value provider to resolve.
 */
FunctionCallValue.prototype.evaluate = function(valueProvider){
    var resolvedArgs = [];
    for (var i = 0; i < this.args.length; i++) {
        var arg = this.args[i];
        if (aura.util.isExpression(arg)) {
            arg = arg.evaluate(valueProvider || this.valueProvider);
        }
        resolvedArgs.push(arg);
    }

    var result = this.func.call(null, resolvedArgs);
    if(!this.hasOwnProperty("result")){
        this["result"]=result;
    }
    return result;
};

FunctionCallValue.prototype.addChangeHandler=function(cmp, key, fcv) {
    if(this.byValue){
        return;
    }
    if(!fcv){
        fcv=this;
    }
    for (var i = 0; i < this.args.length; i++) {
        var arg = this.args[i];
        if (aura.util.isExpression(arg)) {
            if(arg instanceof PropertyReferenceValue) {
                arg.addChangeHandler(cmp, key, this.getChangeHandler(cmp,key,fcv));
            } else {
                arg.addChangeHandler(cmp, key, fcv);
            }
        }
    }
};

FunctionCallValue.prototype.getChangeHandler=function(cmp, key, fcv) {
    return function FunctionCallValue$getChangeHandler(event) {
        var result = fcv.evaluate();
            if (fcv["result"] !== result) {
              fcv["result"] = result;
              $A.renderingService.addDirtyValue(key, cmp);
              cmp.fireChangeEvent(key, event.getParam("oldValue"), event.getParam("value"), event.getParam("index"));
        }
    };
};

FunctionCallValue.prototype.removeChangeHandler=function(cmp, key){
    if(this.byValue){
        return;
    }
    for (var i = 0; i < this.args.length; i++) {
        var arg = this.args[i];
        if (aura.util.isExpression(arg)) {
            arg.removeChangeHandler(cmp,key);
        }
    }
};

/**
 * Sets the isLiteral flag to false to denote that the element can be changed.
 * @returns {Boolean} false
 */
FunctionCallValue.prototype.isLiteral = function(){
    return false;
};

/**
 * Sets the isExpression flag to true to denote that the element is an expression.
 * @returns {Boolean} true
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
// JBUCH: HALO: TODO: FIXME
//    for(var i=0;i<this.args.length;i++){
//        this.args[i].destroy();
//    }
    this.args=this.func=this.valueProvider=null;
};

/**
 * Sets the isDefined flag to true.
 * @returns {Boolean} true
 */
FunctionCallValue.prototype.isDefined = function(){
    return true;
};

/**
 * Helpful for logging/debugging.  Prints String value of the wrapped object.
 * @returns {String} FunctionCallValue
 */
FunctionCallValue.prototype.toString = function(){
//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    return this.args.join(" " + this.key + " ");
//#end
    
    return "FunctionCallValue";
};
//#include aura.value.FunctionCallValue_export


