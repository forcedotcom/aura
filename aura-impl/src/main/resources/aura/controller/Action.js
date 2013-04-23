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
 * A base class for an Aura Action to be passed to an associated component. An
 * Action is created in a client-side or server-side controller. Invoke an
 * Action in a controller by declaring cmp.get("c.actionName"). Call
 * a server-side Action from a client-side controller.
 *
 * @constructor
 * @param {Object}
 *            def The definition of the Action.
 * @param {Function}
 *            method The method for the Action. For client-side Action only. A
 *            function to serialize the Action as a String in the JSON
 *            representation.
 * @param {Object}
 *            paramDefs The parameter definitions for the Action.
 * @param {Object}
 *            cmp The component associated with the Action.
 */
var Action = function Action(def, method, paramDefs, cmp) {

    this.def = def;
    this.meth = method;
    this.paramDefs = paramDefs;
    this.cmp = cmp;
    this.params = {};
    this.state = "NEW";
};

Action.prototype.nextActionId = 1;
Action.prototype.auraType = "Action";

/**
 * Gets the Action Id.
 * @private
 * @returns {String}
 */
Action.prototype.getId = function() {
    if (!this.id) {
        this.id = (Action.prototype.nextActionId++) + "." + $A.getContext().getNum();
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
 * <p>See Also: <a href="#reference?topic=api:ActionDef">ActionDef</a></p>
 * @returns {ActionDef}
 */
Action.prototype.getDef = function() {
    return this.def;
};

/**
 * Sets parameters for the Action. Maps key in paramDefs to config.
 * <p>For example, <code>serverAction.setParams({ "record": id });</code> sets a parameter on serverAction.</p>
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
 * Sets the callback function that is executed after the server-side Action
 * returns. Call a server-side Action from a client-side controller
 * using callback.
 * <p>See Also: <a href="#help?topic=serverSideControllers">Server-Side Controllers</a></p>
 *
 * @param {Object}
 *            scope The scope in which the function is executed.
 * @param {Function}
 *            callback The callback function to run for each controller.
 */
Action.prototype.setCallback = function(scope, callback) {
    this.callbackScope = scope;
    this.callback = callback;
};

/**
 * Runs the Action. Checks that the event is client-side before running.
 * For server-side Actions, use <code>runAfter()</code> instead.
 * <p>See Also: <a href="#help?topic=helloActions">Client-Side Controllers</a></p>
 * @param {Event}
 *            evt The event that calls the Action.
 */
Action.prototype.run = function(evt) {
    $A.assert(this.def.isClientAction(), "Run() cannot be called on a server action. Use runAfter() on a server action instead.");
    this.state = "RUNNING";
    var finished = false;
    try {
        var helper = this.cmp.getDef().getHelper();
        this.meth.call(this, this.cmp, evt, helper);
        finished = true;
    } catch (e) {
        $A.log("Action failed: " + this.cmp.getDef().getDescriptor().getQualifiedName() + " -> " + this.getDef().getName(), e);
    } finally {
        if (!finished) {
            this.state = "FAILURE";
        }
    }
};

/**
 * Gets the current state of the Action. Possible values are "NEW", "RUNNING",
 * and "FAILURE". <br/>
 *
 * @returns {String}
 */
Action.prototype.getState = function() {
    return this.state;
};

/**
 * Gets the return value of the Action. A server-side Action can return any
 * object containing serializable JSON data.<br/>
 */
Action.prototype.getReturnValue = function() {
    return this.returnValue;
};

/**
 * Returns an error object with a message field, or in development modes, a
 * stack field. For server-side Actions only.
 * <p>For example, <code>$A.message(action.getError().message);</code> logs the error message.</p>
 * @public
 */
Action.prototype.getError = function() {
    return this.error;
};

/**
 * Adds the server-side action to the queue. Checks that the event is
 * server-side before enqueuing. For client-side Action, use <code>run()</code>
 * instead.
 * <p>For example,  <code>this.runAfter(serverAction);</code> runs serverAction after a callback.</p>
 *
 * @param {Action}
 *            action The action to run after the function.
 */
Action.prototype.runAfter = function(action) {
    $A.assert(action.def.isServerAction(), "RunAfter() cannot be called on a client action. Use run() on a client action instead.");
    $A.services.event.enqueueAction(action);
};

/**
 * Returns a response function if the Action is complete.
 * <p>For example, <code>this.complete({ returnValue: cmp.get("c.getAction") });</code> runs getAction after the current Action is complete.</p>
 * @private
 * @param {Object}
 *            response
 */
Action.prototype.complete = function(response) {
    this.sanitizeStoredResponse(response);

    this.state = response["state"];
    this.returnValue = response.returnValue;
    this.error = response.error;
    this.storage = response["storage"];

    var completeAction = true;
    if (this.originalResponse) {
        // Compare the refresh response with the original response and only
        // complete the action if they differ
        var originalValue = $A.util.json.encode(this.originalResponse["returnValue"]);
        var refreshedValue = $A.util.json.encode(response["returnValue"]);
        if (refreshedValue === originalValue) {
            var originalComponents = $A.util.json.encode(this.originalResponse["components"]);
            var refreshedComponents = $A.util.json.encode(response["components"]);
            if (refreshedComponents === originalComponents) {
                completeAction = false;

                var storageService = this.getStorage();
                storageService.log("Action.complete(): no change in refresh action response, skipping replay.", this);

                this.fireRefreshEvent(this, this.getComponent(), "refreshEnd");
            }
        }
    }

    var context = $A.getContext();
    var previous = context.setCurrentAction(this);
    try {
        var components = response["components"];

        if (completeAction) {
            // Add in any Action scoped components /or partial configs
            if (components) {
                context.joinComponentConfigs(components);
            }

            if (this.callback && (this.cmp === undefined || this.cmp.isValid())) {
                this.callback.call(this.callbackScope, this);
            }
        }

        var storage = this.getStorage();
        if (storage && this._isStorable() && this.getState() === "SUCCESS") {
            var storageName = storage.getName();
            var key = this.getStorageKey();
            if (!this.storage) {
                // Rewrite any embedded ComponentDef from object to descriptor
                // only
                for ( var globalId in components) {
                    var c = components[globalId];
                    if (c) {
                        var def = c["componentDef"];
                        c["componentDef"] = {
                            "descriptor" : def["descriptor"]
                        };
                    }
                }

                var stored = {
                    "returnValue" : response.returnValue,
                    "components" : components,
                    "state" : "SUCCESS",
                    "storage" : {
                        "name" : storageName,
                        "created" : new Date().getTime()
                    }
                };

                storage.put(key, stored);
            } else {
                // Initiate auto refresh if configured to do so
                this.refresh(response);
            }
        }
    } finally {
        context.setCurrentAction(previous);
    }
};

/**
 * Marks the Action as abortable. For server-side Actions only.
 */
Action.prototype.setAbortable = function() {
    this.abortable = true;
};

/**
 * Checks if the function is abortable. For server-side Actions only.
 *
 * @returns {Boolean} The function is abortable (true), or false otherwise.
 */
Action.prototype.isAbortable = function() {
    return this.abortable || false;
};

/**
 * An exclusive Action is processed on an XMLHttpRequest of its own.
 * <code>a.setExclusive(true)</code> and <code>a.setExclusive()</code> are the same. For server-side Actions only.
 *
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
 * @returns {Boolean}
 */
Action.prototype.isExclusive = function() {
    return this.exclusive || false;
};

/**
 * Marks the Action as storable and abortable. For server-side Actions only.
 * <p>See Also: <a href="#help?topic=auraStorageService">Aura Storage Service</a></p>
 * @param {Object}
 *            config Optional. A set of key/value pairs that specify the storage
 *            options to set. You can set the following options: <code>ignoreExisting</code>
 *            and <code>refresh</code>.
 */
Action.prototype.setStorable = function(config) {
    $A.assert(this.def.isServerAction(), "setStorable() cannot be called on a client action.");
    this.storable = true;
    this.storableConfig = config;

    // Storable actions must also be abortable (idempotent, replayable and
    // non-mutating)
    this.setAbortable();
};

/**
 * Checks if the function is storable. For server-side Actions only.
 *
 * @returns {Boolean} Set to true if the function is storable, or false otherwise.
 */
Action.prototype.isStorable = function() {
    var ignoreExisting = this.storableConfig && this.storableConfig["ignoreExisting"];
    return this._isStorable() && !ignoreExisting;
};

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
 * Checks if the object is from the current storage.
 */
Action.prototype.isFromStorage = function() {
    return !$A.util.isUndefinedOrNull(this.storage);
};

/**
 * Chains a function to run after the current Action. For server-side Actions only.
 */
Action.prototype.setChained = function() {
    this.chained = true;
    this.runAfter(this);
};

/**
 * Returns true if a given function is chained, or false otherwise. For
 * server-side Actions only.
 *
 * @private
 * @returns {Boolean}
 */
Action.prototype.isChained = function() {
    return this.chained || false;
};

/**
 * Returns the key/value pair of the Action id, descriptor, and parameters in
 * JSON format.
 */
Action.prototype.toJSON = function() {
    return {
        "id" : this.getId(),
        "descriptor" : this.getDef().getDescriptor(),
        "params" : this.getParams()
    };
};

/**
 * Refreshes the Action. Used with storage.
 *
 * @private
 */
Action.prototype.refresh = function(originalResponse) {
    // If this action was served from storage let's automatically try to get the
    // latest from the server too
    var storage = this.storage;
    if (storage) {
        var storageService = this.getStorage();
        var autoRefreshInterval = this.storableConfig ? this.storableConfig["refresh"] * 1000 : storageService.getDefaultAutoRefreshInterval();

        // Only auto refresh if the data we have is more than
        // v.autoRefreshInterval seconds old
        var now = new Date().getTime();
        var action = this;
        if ((now - storage["created"]) > autoRefreshInterval) {
            storageService.log("Action.refresh(): auto refresh begin", action);

            var cmp = action.getComponent();
            this.fireRefreshEvent(action, cmp, "refreshBegin");

            var refreshAction = action.getDef().newInstance(cmp);
            refreshAction.setCallback(action.callbackScope, action.callback);
            refreshAction.setParams(action.params);
            refreshAction.setStorable({
                "ignoreExisting" : true
            });

            refreshAction.sanitizeStoredResponse(originalResponse);
            refreshAction.originalResponse = originalResponse;

            var originalCallbackScope = action.callbackScope;
            var originalCallback = action.callback;

            refreshAction.setCallback(originalCallbackScope, function(a) {
                if (originalCallback) {
                    // Chain to the original callback to let it do its thing
                    originalCallback.call(originalCallbackScope, a);
                }

                a.fireRefreshEvent(a, cmp, "refreshEnd");

                storageService.log("Action.refresh(): auto refresh end", a);
            });

            action.runAfter(refreshAction);
        }
    }
};

/**
 * Sanitize generation number references to allow actions to be replayed w/out
 * globalId conflicts.
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
 * @private
 */
Action.prototype.fireRefreshEvent = function(action, cmp, event) {
    if (cmp) {
        var isRefreshObserver = cmp.isInstanceOf("auraStorage:refreshObserver");
        if (isRefreshObserver) {
            // If our component implements auraStorage:refreshObserver then let
            // it know that refreshing has started
            cmp.getEvent(event).setParams({
                "action" : action
            }).fire();
        }
    }
};

// #include aura.controller.Action_export
