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
function PropertyReferenceChain(path){
    this.path = path;

//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

PropertyReferenceChain.prototype.auraType = "Value";

/**
 * Returns the root piece of this property reference.
 */
PropertyReferenceChain.prototype.getRoot = function() {
    return this.path[0];
};

/**
 * Returns a new PropertyReferenceChain representing everything after the root, or null if there is no more.
 */

PropertyReferenceChain.prototype.getStem = function() {
    var l = this.path.length;
    if (l == 1) {
        return null;
    }
    
    if (!this.stem) {
    	this.stem = new PropertyReferenceChain(this.path.slice(1, l));
    }
   
    return this.stem;
};

// this is here because of the inline markup action call thing {!c.wiggle}
/**
 * Returns the value in the format "{!path}".
 */
PropertyReferenceChain.prototype.getValue = function() {
    return "{!" + this.path.join(".") + "}";
};

/**
 * Sets the isDefined flag to true.
 */
PropertyReferenceChain.prototype.isDefined = function() {
    return true;
};

/**
 * Sets the isDirty flag to false.
 */
PropertyReferenceChain.prototype.isDirty = function(){
    return false;
};

/**
 * Always throws an error because PropertyReferenceChain cannot be unwrapped.
 * Do not call.
 */
PropertyReferenceChain.prototype.unwrap = function(){
    throw new Error("Cannot unwrap a PropertyReferenceChain");
};

/**
 * Always throws an error because PropertyReferenceChain cannot be merged into.
 * Do not call.
 */
PropertyReferenceChain.prototype.merge = function() {
    throw new Error("Cannot merge into a PropertyReferenceChain");
};

/**
 * Sets the isLiteral flag to false to denote that the property reference can be changed.
 */
PropertyReferenceChain.prototype.isLiteral = function(){
    return false;
};

/**
 * Sets the isExpression flag to true to denote an expression.
 */
PropertyReferenceChain.prototype.isExpression = function(){
    return true;
};

/**
 * Destroys the path.
 */
PropertyReferenceChain.prototype.destroy = function(){

//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    delete this.path;
};

/**
 * Returns "PropertyReferenceChain" as  String.
 */
PropertyReferenceChain.prototype.toString = function(){
    return "PropertyReferenceChain";
};
//#include aura.value.PropertyReferenceChain_export