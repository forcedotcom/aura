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
 * @namespace A Value wrapper for a property reference.
 * @constructor
 * @protected
 */
function PropertyReferenceValue(path){
    this.path = path;

//#if {"modes" : ["STATS"]}
    valueFactory.index(this);
//#end
}

PropertyReferenceValue.prototype.auraType = "Value";

/**
 * Returns the root piece of this property reference.
 */
PropertyReferenceValue.prototype.getRoot = function() {
    return this.path[0];
};

/**
 * Returns a new PropertyReferenceValue representing everything after the root, or null if there is no more.
 */
PropertyReferenceValue.prototype.getStem = function() {
    var l = this.path.length;
    if (l == 1) {
        return null;
    }
    return new PropertyReferenceValue(this.path.slice(1, l));
};

// this is here because of the inline markup action call thing {!c.wiggle}
/**
 * Returns the value in the format "{!path}".
 */
PropertyReferenceValue.prototype.getValue = function() {
    return "{!" + this.path.join(".") + "}";
};

/**
 * Sets the isDefined flag to true.
 */
PropertyReferenceValue.prototype.isDefined = function() {
    return true;
};

/**
 * Sets the isDirty flag to false.
 */
PropertyReferenceValue.prototype.isDirty = function(){
    return false;
};

/**
 * Always throws an error because PropertyReferenceValue cannot be unwrapped.
 * Do not call.
 */
PropertyReferenceValue.prototype.unwrap = function(){
    throw new Error("Cannot unwrap a PropertyReferenceValue");
};

/**
 * Always throws an error because PropertyReferenceValue cannot be merged into.
 * Do not call.
 */
PropertyReferenceValue.prototype.merge = function() {
    throw new Error("Cannot merge into a PropertyReferenceValue");
};

/**
 * Sets the isLiteral flag to false to denote that the property reference can be changed.
 */
PropertyReferenceValue.prototype.isLiteral = function(){
    return false;
};

/**
 * Sets the isExpression flag to true to denote an expression.
 */
PropertyReferenceValue.prototype.isExpression = function(){
    return true;
};

/**
 * Destroys the path.
 */
PropertyReferenceValue.prototype.destroy = function(){

//#if {"modes" : ["STATS"]}
    valueFactory.deIndex(this);
//#end
    delete this.path;
};

/**
 * Returns "PropertyReferenceValue" as  String.
 */
PropertyReferenceValue.prototype.toString = function(){
    return "PropertyReferenceValue";
};
//#include aura.value.PropertyReferenceValue_export
