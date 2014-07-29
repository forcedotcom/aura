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
 * @namespace A parsed property reference.
 * @constructor
 * @protected
 */
function PropertyChain(path){
    this.path = path;

//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

PropertyChain.prototype.auraType = "Value";

/**
 * Returns the root piece of this property reference.
 */
PropertyChain.prototype.getRoot = function() {
    return this.path[0];
};

/**
 * Returns a new PropertyChain representing everything after the root, or null if there is no more.
 */

PropertyChain.prototype.getStem = function() {
    var l = this.path.length;
    if (l == 1) {
        return null;
    }
    
    if (!this.stem) {
    	this.stem = new PropertyChain(this.path.slice(1, l));
    }
   
    return this.stem;
};

// this is here because of the inline markup action call thing {!c.wiggle}
/**
 * Returns the value in the format "{!path}".
 */
PropertyChain.prototype.getValue = function() {
    return "{!" + this.path.join(".") + "}";
};

/**
 * Sets the isDefined flag to true.
 */
PropertyChain.prototype.isDefined = function() {
    return true;
};

/**
 * Sets the isDirty flag to false.
 */
PropertyChain.prototype.isDirty = function(){
    return false;
};

/**
 * Always throws an error because PropertyChain cannot be unwrapped.
 * Do not call.
 */
PropertyChain.prototype.unwrap = function(){
    throw new Error("Cannot unwrap a PropertyChain");
};

/**
 * Always throws an error because PropertyChain cannot be merged into.
 * Do not call.
 */
PropertyChain.prototype.merge = function() {
    throw new Error("Cannot merge into a PropertyChain");
};

/**
 * Sets the isLiteral flag to false to denote that the property reference can be changed.
 */
PropertyChain.prototype.isLiteral = function(){
    return false;
};

/**
 * Sets the isExpression flag to true to denote an expression.
 */
PropertyChain.prototype.isExpression = function(){
    return true;
};

/**
 * Destroys the path.
 */
PropertyChain.prototype.destroy = function(){

//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    delete this.path;
};

/**
 * Returns "PropertyChain" as  String.
 */
PropertyChain.prototype.toString = function(){
    return "PropertyChain";
};
//#include aura.value.PropertyChain_export