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
/*jslint sub: true*/

/**
 * @class InvalidComponent
 * @constructor
 * @private
 */
function InvalidComponent(){
    // Never used directly - just its prototype is leveraged
    this.raiseInvalidComponentError();
}

/**
 * @public
 */
InvalidComponent.prototype.auraType = "Component";

/**
 * @public
 */
InvalidComponent.prototype.getDef = function() {
    return null;
};

/**
 * @protected
 */
InvalidComponent.prototype.index = function(localId, globalId){
    this.raiseInvalidComponentError("index", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.deIndex = function(localId, globalId){
    // Unfortunately, there are some bizarre loops with deIndex and destroy.
    // For the moment, we don't enforce that this is a valid component until
    // we can track down _why_ it is being called on already destroyed components
    return null;
};

/**
 * @public
 */
InvalidComponent.prototype.find = function(name){
    this.raiseInvalidComponentError("find", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.findInstancesOf = function(type, ret, cmp){
    this.raiseInvalidComponentError("findInstancesOf", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.getSuperest = function(){
    this.raiseInvalidComponentError("getSuperest", arguments);
};

/**
 *
 * @private
 */
InvalidComponent.prototype.findInstanceOf = function(type){
    this.raiseInvalidComponentError("findInstanceOf", arguments);
};

InvalidComponent.prototype.isInstanceOf = function(name){
    this.raiseInvalidComponentError("isInstanceOf", arguments);
};

/**
 * @param {Object} type Applies the type to its definition.
 * @private
 */
InvalidComponent.prototype.implementsDirectly = function(type){
    this.raiseInvalidComponentError("implementsDirectly", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.addHandler = function(eventName, valueProvider, actionExpression, insert){
    this.raiseInvalidComponentError("addHandler", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.addValueHandler = function(config){
    this.raiseInvalidComponentError("addValueHandler", arguments);
};

/**
 * Forces the final destroy of a component (after async).
 */
InvalidComponent.prototype.finishDestroy = function(){
};

/**
 * @public
 */
InvalidComponent.prototype.destroy = function(async){
};

/**
 * @protected
 */
InvalidComponent.prototype.isRendered = function() {
    this.raiseInvalidComponentError("isRendered", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.setUnrendering = function(unrendering) {
    this.raiseInvalidComponentError("setUnrendering", arguments);
};


/**
 * @private
 */
InvalidComponent.prototype.isUnrendering = function() {
    this.raiseInvalidComponentError("isUnrendering", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.setRendered = function(rendered) {
    this.raiseInvalidComponentError("setRendered", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.getRenderer = function() {
};

/**
 * @public
 */
InvalidComponent.prototype.getGlobalId = function() {
};

/**
 * @public
 */
InvalidComponent.prototype.getLocalId = function() {
    this.raiseInvalidComponentError("getLocalId", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getRendering = function(){
    this.raiseInvalidComponentError("getRendering", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.getSuper = function(){
    this.raiseInvalidComponentError("getSuper", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.associateElement = function(config){
    this.raiseInvalidComponentError("associateElement", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getElements = function(){
    this.raiseInvalidComponentError("getElements", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getElement = function(){
    this.raiseInvalidComponentError("getElement", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.get = function(key){
    this.raiseInvalidComponentError("get", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.set = function (key, value) {
    this.raiseInvalidComponentError("set", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getConcreteComponent = function(){
    this.raiseInvalidComponentError("getConcreteComponent", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.isConcrete = function() {
    this.raiseInvalidComponentError("isConcrete", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getEventDispatcher = function(){
    this.raiseInvalidComponentError("getEventDispatcher", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getModel = function(){
    this.raiseInvalidComponentError("getModel", arguments);
};

/**
 * @public
 */
InvalidComponent.prototype.getEvent = function(name) {
    this.raiseInvalidComponentError("getEvent", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.getEventByDescriptor = function(descriptor) {
    this.raiseInvalidComponentError("getEventByDescriptor", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.fire = function(name) {
    this.raiseInvalidComponentError("fire", arguments);
};


/**
 * @public
 */
InvalidComponent.prototype.isValid = function(){
    return false;
};

/**
 * @public
 */
InvalidComponent.prototype.toString = function(){
    return "InvalidComponent" + (this._description ? ' ' + this._description : '');
};

/**
 * @private
 */
InvalidComponent.prototype.toJSON = function(){
    this.raiseInvalidComponentError("toJSON", arguments);
};

InvalidComponent.prototype.getFacets = function() {
    this.raiseInvalidComponentError("getFacets", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.raiseInvalidComponentError = function(func, args) {
    var error = "Invalid component tried calling function [" + func + "]";
    var argsArr = Array.prototype.slice.call(args);
    if (argsArr.length) {
        error += " with arguments [" + argsArr.join(",") + "]";
    }
    if (this._globalId && this._componentDef) {
        error += ", " + this._componentDef + " [" + this._globalId + "]";
    }

    $A.error(error);
};


//#include aura.component.InvalidComponent_export
