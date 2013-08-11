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
 * A base class for an Aura Action to be passed to an associated component. An Action is created in a client-side or
 * server-side controller. Invoke an Action in a controller by declaring cmp.get("c.actionName"). Call a server-side
 * Action from a client-side controller.
 * 
 * @constructor
 * @param {Object}
 *            def The definition of the Action.
 * @param {Function}
 *            method The method for the Action. For client-side Action only. A function to serialize the Action as a
 *            String in the JSON representation.
 * @param {Object}
 *            paramDefs The parameter definitions for the Action.
 * @param {Object}
 *            cmp The component associated with the Action.
 */
function Action(def, method, paramDefs, background, cmp) {
    this.def = def;
    this.meth = method;
    this.paramDefs = paramDefs;
    this.background = background;
    this.cmp = cmp;
    this.params = {};
    this.responseState = null;
    this.state = "NEW";
    this.callbacks = {};
    this.events = [];
    this.groups = [];
    this.components = null;
    this.actionId = Action.prototype.nextActionId++;
    this.id = undefined;
    this.originalResponse = undefined;
    this.storable = false;
}

Action.prototype.nextActionId = 1;
Action.prototype.auraType = "Action";

/**
 * Gets the Action Id.
 * 
 * @private
 * @returns {String}
 */
Action.prototype.getId = function() {
	if (!this.id) {
		this.id = this.actionId + "." + $A.getContext().getNum();
	}

	return this.id;
};

/**
 * Gets the next action scoped Id.
 * 
 * @private
 * @returns {String}
 */
Action.prototype.getNextGlobalId = function() {
	if (!this.nextGlobalId) {
		this.nextGlobalId = 1;
	}

	return this.nextGlobalId++;
};

/**
 * Gets the <code>ActionDef</code> object. Shorthand: <code>get("def")</code>
 * <p>
 * See Also: <a href="#reference?topic=api:ActionDef">ActionDef</a>
 * </p>
 * 
 * @public
 * @returns {ActionDef}
 */
Action.prototype.getDef = function() {
	return this.def;
};

/**
 * Adds a callback group for completion tracking.
 * 
 * If this action is already completed, <code>completeAction()</code> is called.
 * 
 * @private
 */
Action.prototype.addCallbackGroup = function(group) {
	if (this.state === "NEW") {
		this.groups.push(group);
	} else {
		group.completeAction(this);
	}
};

/**
 * Marks this action as complete for all callback groups.
 * 
 * @private
 */
Action.prototype.completeGroups = function() {
	while (this.groups.length > 0) {
		var group = this.groups.pop();
		group.completeAction(this);
	}
};

/**
 * Sets parameters for the Action. Maps keys to <code>config</code>.
 * <p>
 * For example, <code>serverAction.setParams({ "record": id });</code> sets a parameter on <code>serverAction</code>.
 * </p>
 * 
 * @public
 * @param {Object}
 *            config The parameters for the Action.
 */
Action.prototype.setParams = function(config) {
	var paramDefs = this.paramDefs;
	for ( var key in paramDefs) {
		this.params[key] = config[key];
	}
};

/**
 * Gets an Action parameter.
 * 
 * @public
 * @param {String}
 *            name The name of the Action parameter.
 * @returns {Array}
 */
Action.prototype.getParam = function(name) {
	return this.params[name];
};

/**
 * Gets the collection of parameters for this Action.
 * 
 * @public
 * @returns {Object}
 */
Action.prototype.getParams = function() {
	return this.params;
};

/**
 * Gets the component for this Action.
 * 
 * @private
 */
Action.prototype.getComponent = function() {
	return this.cmp;
};

/**
 * Sets the callback function that is executed after the server-side Action returns. Call a server-side Action from a
 * client-side controller using <code>callback</code>.
 * <p>
 * See Also: <a href="#help?topic=serverSideControllers">Server-Side Controllers</a>
 * </p>
 * 
 * @public
 * @param {Object}
 *            scope The scope in which the function is executed.
 * @param {Function}
 *            callback The callback function to run for each controller.
 * @param {String}
 *            name The action state for which the callback is to be associated with.
 */
Action.prototype.setCallback = function(scope, callback, name) {
	if (!$A.util.isFunction(callback)) {
		$A.error("Action callback should be a function");
		return;
	}
	// If name is undefined or specified as "ALL", then apply same callback in all cases
	if (name === undefined || name === "ALL") {
		this.callbacks["SUCCESS"] = {
			fn : callback,
			s : scope
		};
		this.callbacks["ERROR"] = {
			fn : callback,
			s : scope
		};
		this.callbacks["ABORTED"] = {
			fn : callback,
			s : scope
		};
		this.callbacks["INCOMPLETE"] = {
			fn : callback,
			s : scope
		};
	} else {
		if (name !== "SUCCESS" && name !== "ERROR" && name !== "ABORTED" && name !== "INCOMPLETE") {
			$A.error("Illegal name " + name);
			return;
		}
		this.callbacks[name] = {
			fn : callback,
			s : scope
		};
	}
};

/**
 * Wrap the current action callbacks to ensure that they get called before a given function.
 * 
 * This can be used to add additional functionality to the already existing callbacks, allowing the user to effectively
 * 'append' a function to the current one.
 * 
 * @private
 * @param {Object}
 *            scope the scope in which the new function should be called.
 * @param {Function}
 *            callback the callback to call after the current callback is executed.
 */
Action.prototype.wrapCallback = function(scope, callback) {
	var nestedCallbacks = this.callbacks;
	var outerCallback = callback;
	var outerScope = scope;
	this.callbacks = {};

	this.setCallback(this, function(action, cmp) {
		var cb = nestedCallbacks[this.getState()];
		if (cb && cb.fn) {
			cb.fn.call(cb.s, this, cmp);
		}
		outerCallback.call(outerScope, this, cmp);
		this.callbacks = nestedCallbacks;
	});
};

/**
 * Deprecated. Note: This method is deprecated and should not be used. Instead, use the <code>enqueueAction</code>
 * method on the Aura type. For example, <code>$A.enqueueAction(action)</code>.
 * 
 * The deprecated run method runs client-side actions. Do not use it for running server-side actions.
 * 
 * If you must have synchronous execution, you can temporarily use runDeprecated.
 * 
 * @deprecated
 * @public
 * @param {Event}
 *            evt The event that calls the Action.
 */
Action.prototype.run = function(evt) {
	this.runDeprecated(evt);
};

/**
 * Deprecated. Run an action immediately.
 * 
 * This function should only be used for old code that requires inline execution of actions. Note that the code then
 * must know if the action is client side or server side, since server side actions cannot be executed inline.
 * 
 * @deprecated
 * @public
 * @param {Event}
 *            evt The event that calls the Action.
 */
Action.prototype.runDeprecated = function(evt) {
	$A.assert(this.def.isClientAction(),
			"run() cannot be called on a server action. Use $A.enqueueAction() on a server action instead.");
	this.state = "RUNNING";
	try {
		var helper = this.cmp.getDef().getHelper();
		this.returnValue = this.meth.call(this, this.cmp, evt, helper);
		this.state = "SUCCESS";
	} catch (e) {
		this.state = "FAILURE";
		$A.log("Action failed: " + this.cmp.getDef().getDescriptor().getQualifiedName() + " -> "
				+ this.getDef().getName(), e);
	}
};

/**
 * Gets the current state of the Action. Possible values are "NEW", "RUNNING", and "FAILURE". <br/>
 * 
 * @public
 * @returns {String}
 */
Action.prototype.getState = function() {
	return this.state;
};

/**
 * Gets the return value of the Action. A server-side Action can return any object containing serializable JSON data.<br/>
 * 
 * @public
 */
Action.prototype.getReturnValue = function() {
	return this.returnValue;
};

/**
 * Returns an error object with a message field, or in development modes, a stack field. For server-side Actions only.
 * <p>
 * For example, <code>$A.message(action.getError().message);</code> logs the error message.
 * </p>
 * 
 * @public
 */
Action.prototype.getError = function() {
	return this.error;
};

/**
 * Returns true if the actions should be enqueued in the background, false if it should be run in the foreground.
 * 
 * @public
 */
Action.prototype.isBackground = function() {
	return this.background === true;
};

/**
 * Sets the action to run as a background action. This cannot be unset. Background actions are usually long running and
 * lower priority actions.
 * 
 * @public
 */
Action.prototype.setBackground = function() {
	this.background = true;
};

/**
 * Deprecated. Note: This method is deprecated and should not be used. Instead, use the <code>enqueueAction</code>
 * method on the Aura type. For example, <code>$A.enqueueAction(action)</code>.
 * 
 * The deprecated <code>runAfter</code> method adds a specified server-side action to the action queue. It is for
 * server-side actions only. For example, <code>this.runAfter(serverAction);</code> sends the action to the server and
 * runs the callback when the server action completes (if the action was not aborted).
 * 
 * @deprecated
 * @public
 * @param {Action}
 *            action The action to run.
 */
Action.prototype.runAfter = function(action) {
	$A.assert(action.def.isServerAction(),
			"RunAfter() cannot be called on a client action. Use run() on a client action instead.");
	$A.clientService.enqueueAction(action);
};

/**
 * Update the fields from a response.
 * 
 * @private
 * @param {Object}
 *            response The response from the server.
 * @return {Boolean} Returns true if the response differs from the original response
 */
Action.prototype.updateFromResponse = function(response) {
	this.sanitizeStoredResponse(response);
	this.state = response["state"];
	this.responseState = response["state"];
	this.returnValue = response["returnValue"];
	this.error = response["error"];
	this.storage = response["storage"];
	this.components = response["components"];
	if (this.state === "ERROR") {
		//
		// Careful now. If we get back an event from the server as part of the error,
		// we want to fire off the event. Note that this will also remove it from the
		// list of errors, and this may leave us with an empty error list. In that case
		// we toss in a message of 'event fired' to prevent confusion from having an
		// error state, but no error.
		//
		// This code is perhaps a bit tenuous, as it attempts to reverse the mapping from
		// event descriptor to event name in the component, giving back the first one that
		// it finds (deep down in code). This almost violates encapsulation, but, well,
		// not badly enough to remove it.
		//
		var i;
		var newErrors = [];
		var fired = false;
		for (i = 0; i < response["error"].length; i++) {
			var err = response["error"][i];
			if (err["exceptionEvent"]) {
				fired = true;
				this.events.push(err["event"]);
			} else {
				newErrors.push(err);
			}
		}
		if (fired === true && newErrors.length === 0) {
			newErrors.push({
				"message" : "Event fired"
			});
		}
		this.error = newErrors;
	} else if (this.originalResponse && this.state === "SUCCESS") {
		// Compare the refresh response with the original response and return false if they are equal (no update)
		var originalValue = $A.util.json.encode(this.originalResponse["returnValue"]);
		var refreshedValue = $A.util.json.encode(response["returnValue"]);
		if (refreshedValue === originalValue) {
			var originalComponents = $A.util.json.encode(this.originalResponse["components"]);
			var refreshedComponents = $A.util.json.encode(response["components"]);
			if (refreshedComponents === originalComponents) {
				return false;
			}
		}
	}
	return true;
};

/**
 * Gets a storable response from this action.
 * 
 * WARNING: Use after finishAction() since getStored() modifies <code>this.components</code>.
 * 
 * @private
 * @param {String}
 *            storageName the name of the storage to use.
 */
Action.prototype.getStored = function(storageName) {
	if (this.storable && this.responseState === "SUCCESS") {
		// Rewrite any embedded ComponentDef from object to descriptor only
		for ( var globalId in this.components) {
			var c = this.components[globalId];
			if (c) {
				var def = c["componentDef"];
				c["componentDef"] = {
					"descriptor" : def["descriptor"]
				};
			}
		}
		return {
			"returnValue" : this.returnValue,
			"components" : this.components,
			"state" : "SUCCESS",
			"storage" : {
				"name" : storageName,
				"created" : new Date().getTime()
			}
		};
	}
	return null;
};

/**
 * Calls callbacks and fires events upon completion of the action.
 * 
 * @private
 * @param {Object}
 *            context the context for pushing and popping the current action.
 */
Action.prototype.finishAction = function(context) {
	var previous = context.setCurrentAction(this);
	try {
		// Add in any Action scoped components /or partial configs
		if (this.components) {
			context.joinComponentConfigs(this.components);
		}

		if (this.cmp === undefined || this.cmp.isValid()) {
			if (this.events.length > 0) {
				for ( var x in this.events) {
					this.parseAndFireEvent(this.events[x], this.cmp);
				}
			}

			// If there is a callback for the action's current state, invoke that too
			var cb = this.callbacks[this.getState()];

			if (cb) {
				cb.fn.call(cb.s, this, this.cmp);
			}
		} else {
			this.abort();
		}
	} finally {
		context.setCurrentAction(previous);
		this.completeGroups();
	}
};

/**
 * Mark this action as aborted.
 * 
 * @private
 */
Action.prototype.abort = function() {
	this.state = "ABORTED";
	this.completeGroups();
};

/**
 * Marks the Action as abortable. For server-side Actions only.
 * 
 * @public
 */
Action.prototype.setAbortable = function() {
	this.abortable = true;
};

/**
 * Checks if this action is a refresh.
 * 
 * @private
 */
Action.prototype.isRefreshAction = function() {
	return this.originalResponse !== undefined;
};

/**
 * Checks if the function is abortable. For server-side Actions only.
 * 
 * @public
 * @returns {Boolean} The function is abortable (true), or false otherwise.
 */
Action.prototype.isAbortable = function() {
	return this.abortable || false;
};

/**
 * An exclusive Action is processed on an XMLHttpRequest of its own. <code>a.setExclusive(true)</code> and
 * <code>a.setExclusive()</code> are the same. For server-side Actions only.
 * 
 * @public
 * @param {Object}
 *            val
 * @returns {Boolean} Set to true if the Action should be exclusive, or false otherwise.
 */
Action.prototype.setExclusive = function(val) {
	this.exclusive = val === undefined ? true : val;
};

/**
 * Returns true if a given function is exclusive, or false otherwise.
 * 
 * @public
 * @returns {Boolean}
 */
Action.prototype.isExclusive = function() {
	return this.exclusive || false;
};

/**
 * Marks the Action as storable and abortable. For server-side Actions only.
 * <p>
 * See Also: <a href="#help?topic=auraStorageService">Aura Storage Service</a>
 * </p>
 * 
 * @public
 * @param {Object}
 *            config Optional. A set of key/value pairs that specify the storage options to set. You can set the
 *            following options: <code>ignoreExisting</code> and <code>refresh</code>.
 */
Action.prototype.setStorable = function(config) {
	$A.assert(this.def.isServerAction(), "setStorable() cannot be called on a client action.");
	this.storable = true;
	this.storableConfig = config;

	//
	// Storable actions must also be abortable (idempotent, replayable and non-mutating)
	// Careful with this, as it will cause side effects if there are other abortable actions
	//
	this.setAbortable();
};

/**
 * Returns true if the function is storable, or false otherwise. For server-side Actions only.
 * 
 * @public
 * @returns {Boolean}
 */
Action.prototype.isStorable = function() {
	var ignoreExisting = this.storableConfig && this.storableConfig["ignoreExisting"];
	return this._isStorable() && !ignoreExisting;
};

/**
 * @private
 */
Action.prototype._isStorable = function() {
	return this.storable || false;
};

/**
 * Gets the storage key in name-value pairs.
 * 
 * @private
 */
Action.prototype.getStorageKey = function() {
	return this.getDef().getDescriptor().toString() + ":" + $A.util["json"].encode(this.getParams());
};

/**
 * Returns true if a given function is from the current storage, or false otherwise.
 * 
 * @public
 * @returns {Boolean}
 */
Action.prototype.isFromStorage = function() {
	return !$A.util.isUndefinedOrNull(this.storage);
};

/**
 * Chains a function to run after the current Action. For server-side Actions only.
 * 
 * @public
 */
Action.prototype.setChained = function() {
	this.chained = true;
	$A.enqueueAction(this);
};

/**
 * Returns true if a given function is chained, or false otherwise. For server-side Actions only.
 * 
 * @private
 * @returns {Boolean}
 */
Action.prototype.isChained = function() {
	return this.chained || false;
};

/**
 * Returns the key/value pair of the Action id, descriptor, and parameters in JSON format.
 * 
 * @public
 */
Action.prototype.toJSON = function() {
	return {
		"id" : this.getId(),
		"descriptor" : this.getDef().getDescriptor(),
		"params" : this.getParams()
	};
};

/**
 * Mark the current action as incomplete.
 * 
 * @private
 */
Action.prototype.incomplete = function(context) {
	this.state = "INCOMPLETE";
	this.finishAction(context);
};

/**
 * Refreshes the Action. Used with storage.
 * 
 * @private
 */
Action.prototype.getRefreshAction = function(originalResponse) {
	var storage = originalResponse["storage"];
	var storageService = this.getStorage();
	var autoRefreshInterval = this.storableConfig ? this.storableConfig["refresh"] * 1000 : storageService
			.getDefaultAutoRefreshInterval();

	// Only auto refresh if the data we have is more than
	// v.autoRefreshInterval seconds old
	var now = new Date().getTime();
	if ((now - storage["created"]) > autoRefreshInterval) {
		var refreshAction = this.def.newInstance(this.cmp);

		storageService.log("Action.refresh(): auto refresh begin: " + this.actionId + " to " + refreshAction.actionId);

		refreshAction.callbacks = this.callbacks;
		refreshAction.setParams(this.params);
		refreshAction.setStorable({
			"ignoreExisting" : true
		});
		refreshAction.abortable = this.abortable;
		refreshAction.sanitizeStoredResponse(originalResponse);
		refreshAction.originalResponse = originalResponse;
		return refreshAction;
	}
	return null;
};

/**
 * Sanitize generation number references to allow actions to be replayed w/out globalId conflicts.
 * 
 * @private
 */
Action.prototype.sanitizeStoredResponse = function(response) {
	var santizedComponents = {};

	var globalId;
	var suffix = this.getId();
	var components = response["components"];
	for (globalId in components) {
		var newGlobalId = globalId.substr(0, globalId.indexOf(":") + 1) + suffix;

		// Rewrite the globalId
		var c = components[globalId];
		c["globalId"] = newGlobalId;

		santizedComponents[newGlobalId] = c;
	}

	response["components"] = santizedComponents;

	var returnValue = response["returnValue"];
	if (returnValue) {
		globalId = returnValue["globalId"];
		if (globalId) {
			returnValue["globalId"] = globalId.substr(0, globalId.indexOf(":") + 1) + suffix;
		}
	}
};

/**
 * Gets the Action storage.
 * 
 * @private
 * @returns {Storage}
 */
Action.prototype.getStorage = function() {
	return $A.storageService.getStorage("actions");
};

/**
 * Uses the event object in the action's response and fires the event.
 * 
 * @private
 */
Action.prototype.parseAndFireEvent = function(evtObj) {
	var descriptor = evtObj["descriptor"];

	// If the current component has registered to fire the event,
	// then create the event object and associate it with this component(make it the source)
	var evt = this.getComponent().getEventByDescriptor(descriptor);
	if (evt !== null) {
		if (evtObj["attributes"]) {
			evt.setParams(evtObj["attributes"]["values"]);
		}
		evt.fire();
	} else {
		// Else create the event using ClientService and fire it. Usually the case for APPLICATION events.
		// If the event is a COMPONENT event, it is fired anyway but has no effect because its an orphan(without source)
		$A.clientService.parseAndFireEvent(evtObj);
	}
};

/**
 * Fire off a refresh event if there is a valid component listener.
 * 
 * @private
 */
Action.prototype.fireRefreshEvent = function(event) {
	// storageService.log("Action.refresh(): auto refresh: "+event+" for "+this.actionId);
	if (this.cmp && this.cmp.isValid()) {
		var isRefreshObserver = this.cmp.isInstanceOf("auraStorage:refreshObserver");
		if (isRefreshObserver) {
			this.cmp.getEvent(event).setParams({
				"action" : this
			}).fire();
		}
	}
};
// #include aura.controller.Action_export
