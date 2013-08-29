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
 * @public
 * @class
 * @constructor
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
    this.raiseInvalidComponentError();
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
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.findValue = function(name){
    this.raiseInvalidComponentError();
};

InvalidComponent.prototype.unwrap = function() {
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.findInstancesOf = function(type, ret, cmp){
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.getSuperest = function(){
    this.raiseInvalidComponentError();
};

/**
 *
 * @private
 */
InvalidComponent.prototype.findInstanceOf = function(type){
    this.raiseInvalidComponentError();
};

InvalidComponent.prototype.isInstanceOf = function(name){
    this.raiseInvalidComponentError();
};

/**
 * @private
 * @param {Object} type Applies the type to its definition.
 */
InvalidComponent.prototype.implementsDirectly = function(type){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.addHandler = function(eventName, valueProvider, actionExpression, insert){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.addValueHandler = function(config){
    this.raiseInvalidComponentError();
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
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.setUnrendering = function(unrendering) {
    this.raiseInvalidComponentError();
};


/**
 * @private
 */
InvalidComponent.prototype.isUnrendering = function() {
    this.raiseInvalidComponentError();
};

/**
 * @protected
 */
InvalidComponent.prototype.setRendered = function(rendered) {
    this.raiseInvalidComponentError();
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
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getRendering = function(){
    this.raiseInvalidComponentError();
};

/**
 * @protected
 */
InvalidComponent.prototype.getSuper = function(){
    this.raiseInvalidComponentError();
};

/**
 * @protected
 */
InvalidComponent.prototype.associateElement = function(config){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getElements = function(){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getElement = function(){
    this.raiseInvalidComponentError();
};

InvalidComponent.prototype.getAttributes = function() {
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getValue = function(key){
};

/**
 * @public
 */
InvalidComponent.prototype.setValue = function(key, value){
    this.raiseInvalidComponentError();
};


/**
 * @public
 */
InvalidComponent.prototype.get = function(key){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getConcreteComponent = function(){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.isConcrete = function() {
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getEventDispatcher = function(){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getModel = function(){
    this.raiseInvalidComponentError();
};

/**
 * @public
 */
InvalidComponent.prototype.getEvent = function(name) {
    this.raiseInvalidComponentError();
};

/**
 * @protected
 */
InvalidComponent.prototype.getEventByDescriptor = function(descriptor) {
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.fire = function(name) {
    this.raiseInvalidComponentError();
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
    return "InvalidComponent";
};

/**
 * @private
 */
InvalidComponent.prototype.toJSON = function(){
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.output = function(){
    this.raiseInvalidComponentError();
};

InvalidComponent.prototype.getFacets = function() {
    this.raiseInvalidComponentError();
};

/**
 * @private
 */
InvalidComponent.prototype.raiseInvalidComponentError = function(){
	var error = "Invalid component";
	if (this._globalId && this._componentDef) {
		error += ": " + this._componentDef + " [" + this._globalId + "]";
	}
	
    $A.error(error);
};


//#include aura.component.InvalidComponent_export
