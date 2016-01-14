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
 * @export
 */
function InvalidComponent(){
    // Never used directly - just its prototype is leveraged
    this.raiseInvalidComponentError();
}

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getDef = function() {
    return null;
};

/**
 * @protected
 * @export
 */
InvalidComponent.prototype.index = function(){
    this.raiseInvalidComponentError("index", arguments);
};

/**
 * @protected
 * @export
 */
InvalidComponent.prototype.deIndex = function(){
    // Unfortunately, there are some bizarre loops with deIndex and destroy.
    // For the moment, we don't enforce that this is a valid component until
    // we can track down _why_ it is being called on already destroyed components
    return null;
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.find = function(){
    this.raiseInvalidComponentError("find", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.findInstancesOf = function(){
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
InvalidComponent.prototype.findInstanceOf = function(){
    this.raiseInvalidComponentError("findInstanceOf", arguments);
};

/**
 * @export
 */
InvalidComponent.prototype.isInstanceOf = function(){
    this.raiseInvalidComponentError("isInstanceOf", arguments);
};

/**
 * @param {Object} type Applies the type to its definition.
 * @private
 */
InvalidComponent.prototype.implementsDirectly = function(){
    this.raiseInvalidComponentError("implementsDirectly", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.addHandler = function(){
    this.raiseInvalidComponentError("addHandler", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.addValueHandler = function(){
    this.raiseInvalidComponentError("addValueHandler", arguments);
};

InvalidComponent.prototype.removeValueHandler = function() {
    // We do nothing as this can be called in the destroy stage
    // and in that case we don't really want to gack, just not worry
    // about trying to cleanup a destroyed component.
};

/**
 * Forces the final destroy of a component (after async).
 */
InvalidComponent.prototype.finishDestroy = function(){
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.destroy = function(){
};

/**
 * @protected
 * @export
 */
InvalidComponent.prototype.isRendered = function() {
    this.raiseInvalidComponentError("isRendered", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.setUnrendering = function() {
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
InvalidComponent.prototype.setRendered = function() {
    this.raiseInvalidComponentError("setRendered", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.getRenderer = function() {
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getGlobalId = function() {
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getLocalId = function() {
    this.raiseInvalidComponentError("getLocalId", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getRendering = function(){
    this.raiseInvalidComponentError("getRendering", arguments);
};

/**
 * @protected
 * @export
 */
InvalidComponent.prototype.getSuper = function(){
    this.raiseInvalidComponentError("getSuper", arguments);
};

/**
 * @protected
 * @export
 */
InvalidComponent.prototype.associateElement = function(){
    this.raiseInvalidComponentError("associateElement", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getElements = function(){
    this.raiseInvalidComponentError("getElements", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getElement = function(){
    this.raiseInvalidComponentError("getElement", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.get = function(){
    this.raiseInvalidComponentError("get", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.set = function () {
    this.raiseInvalidComponentError("set", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getConcreteComponent = function(){
    this.raiseInvalidComponentError("getConcreteComponent", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.isConcrete = function() {
    this.raiseInvalidComponentError("isConcrete", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getEventDispatcher = function(){
    this.raiseInvalidComponentError("getEventDispatcher", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getModel = function(){
    this.raiseInvalidComponentError("getModel", arguments);
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.getEvent = function() {
    this.raiseInvalidComponentError("getEvent", arguments);
};

/**
 * @protected
 */
InvalidComponent.prototype.getEventByDescriptor = function() {
    this.raiseInvalidComponentError("getEventByDescriptor", arguments);
};

/**
 * @private
 */
InvalidComponent.prototype.fire = function() {
    this.raiseInvalidComponentError("fire", arguments);
};


/**
 * @public
 * @export
 */
InvalidComponent.prototype.isValid = function(){
    return false;
};

/**
 * @public
 * @export
 */
InvalidComponent.prototype.toString = function(){
    return "InvalidComponent" + (this._description ? ' ' + this._description : '');
};

/**
 * @export
 */
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

    throw new $A.auraError(error);
};

Aura.Component.InvalidComponent = InvalidComponent;
