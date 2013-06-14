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
 * @namespace The Action Definition including the name, descriptor, action type, method, and parameter definitions. An
 *            ActionDef instance is created as part of the ControllerDef initialization.
 * 
 * @constructor
 * @param {Object}
 *            config
 */
function ActionDef(config) {
	this.name = config["name"];
	this.descriptor = config["descriptor"];
	this.actionType = config["actionType"];
	this.meth = null;
	this.paramDefs = {};

	if (this.actionType === "SERVER") {
		this.returnType = new ValueDef(config["returnType"]);

		var params = config["params"];
		if (!!params && $A.util.isArray(params)) {
			for ( var i = 0; i < params.length; i++) {
				var paramConfig = params[i];
				var param = new ValueDef(paramConfig);
				this.paramDefs[param.getName()] = param;
			}
		}
		this.background = config["background"];
	}

	if (this.actionType === "CLIENT") {
		try {
			this.meth = $A.util.json.decodeString(config["code"]);
		} catch (e) {
			$A.log(config["code"], e);
		}
	}
}

ActionDef.prototype.auraType = "ActionDef";

/**
 * Gets the name of this Action. The name is the unique identifier that the component can use to call this Action.
 * 
 * @returns {String}
 */
ActionDef.prototype.getName = function() {
	return this.name;
};

/**
 * Gets the Action Descriptor.
 * 
 * @private
 * @returns {Object}
 */
ActionDef.prototype.getDescriptor = function() {
	return this.descriptor;
};

/**
 * Gets the Action type, which can either be "CLIENT" or "SERVER".
 * 
 * @private
 * @returns {String} Possible values are "CLIENT" or "SERVER".
 */
ActionDef.prototype.getActionType = function() {
	return this.actionType;
};

/**
 * Returns true if the Action type is client-side, or false otherwise.
 * 
 * @returns {Boolean}
 */
ActionDef.prototype.isClientAction = function() {
	return this.actionType === "CLIENT";
};

/**
 * Returns true if the Action type is server-side, or false otherwise.
 * 
 * @returns {Boolean}
 */
ActionDef.prototype.isServerAction = function() {
	return this.actionType === "SERVER";
};

/**
 * Returns a new Action instance.
 * 
 * @private
 * @param {Object}
 *            cmp The component associated with the Action.
 * @returns {Action}
 */
ActionDef.prototype.newInstance = function(cmp) {
	return new Action(this, this.meth, this.paramDefs, this.background, cmp);
};

// #include aura.controller.ActionDef_export
