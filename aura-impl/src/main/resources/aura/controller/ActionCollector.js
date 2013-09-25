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
 * A 'collector' for a set of actions that will be sent to the server.
 *
 * The rules:
 *  * Chained actions are handled elsewhere, chained actions marked storable are not advised.
 *  * abortable actions must have been handled previously.
 *  * all actions provided to this collector will either be executed on the server or from storage (or both).
 *  * Callbacks from storage are asynchronous, meaning that this has to deal with that via its own callbacks.
 *  * Actions may not execute in order.
 *
 * @constructor
 * @param {Array}
 *            actions the set of actions to process
 * @param {Function}
 *            finishedCallback the callback for when the actions are collected.
 */
$A.ns.ActionCollector = function ActionCollector(actions, finishedCallback) {
    this.actionsToSend = [];
    this.actionsToComplete = [];
    this.actionsRefreshed = [];
    this.actionsFinished = {};
    this.finishedCallback = finishedCallback;
    this.collectorId = $A.ns.ActionCollector.prototype.counter++;
    this.actionsRequested = actions;
    if (actions) {
        this.actionsToCollect = actions.length;
    } else {
        this.actionsToCollect = 0;
    }
    this.num = -1;
};

$A.ns.ActionCollector.prototype.auraType = "ActionCollector";

$A.ns.ActionCollector.prototype.counter = 0;

/**
 * Run the collection of actions.
 *
 * This is the meat of the routine, which walks all of the actions and checks for storable actions,
 * looking them up in the cache as it goes. Because the cache is asynchronous, the actual collection
 * is done in a callable function.
 */
$A.ns.ActionCollector.prototype.process = function() {
    var i, key;
    var action, storage;

    for ( i = 0; i < this.actionsRequested.length; i++) {
        action = this.actionsRequested[i];
        $A.assert(action.getDef().isServerAction(), "Client side action leaked through to server call.");
        //
        // For cacheable actions check the storage service to see if we already have a viable cached action
        // response we can complete immediately. In this case, we get a callback, so we create a callback
        // for each one (ugh, this could have been handled via passing an additional param to the action,
        // bue we don't have that luxury now.)
        //
        storage = action.getStorage();
        if (action.isStorable() && storage) {
            key = action.getStorageKey();
            storage.get(key, this.createResultCallback(action));
        } else {
            this.collectAction(action);
        }
    }
};

/**
 * Get the set of actions requested.
 *
 * These actions are the actions that have storage associated with them, so they
 * can be completed immediately.
 */
$A.ns.ActionCollector.prototype.getActionsRequested = function() {
    return this.actionsRequested;
};


/**
 * Get the set of actions to complete.
 *
 * These actions are the actions that have storage associated with them, so they
 * can be completed immediately.
 */
$A.ns.ActionCollector.prototype.getActionsToComplete = function() {
    return this.actionsToComplete;
};

/**
 * Get the set of actions to send.
 */
$A.ns.ActionCollector.prototype.getActionsToSend = function() {
    return this.actionsToSend;
};

/**
 * Get the action group id.
 */
$A.ns.ActionCollector.prototype.getCollectorId = function() {
    return this.collectorId;
};

/**
 * Set the 'number' for this collector.
 */
$A.ns.ActionCollector.prototype.setNum = function(num) {
    this.num = num;
};

/**
 * get the 'number' for this collector.
 */
$A.ns.ActionCollector.prototype.getNum = function() {
    return this.num;
};

/**
 * Internal routine to create a callback for the storage service.
 *
 * This simply binds to both 'this' and 'action'.
 *
 * @private
 * @param {Action} action the action we will use in the call to collectAction.
 */
$A.ns.ActionCollector.prototype.createResultCallback = function(action) {
    var that = this;
    return function(response) {
        that.collectAction(action, response);
    };
};

/**
 * Find an action and mark it as 'completed'.
 */
$A.ns.ActionCollector.prototype.findActionAndClear = function(id) {
    var action;
    var i;

    for (i = 0; i < this.actionsRequested.length; i++) {
        action = this.actionsRequested[i];
        if (action !== undefined && action.getId() === id) {
            this.actionsFinished[id] = action;
            //
            // Oh, how I love hacks. We put chained actions in the queue
            // at the wrong place.
            //
            if (!action.isChained()) {
                this.actionsRequested[i] = undefined;
            }
            return action;
        }
    }
    for ( i = 0; i < this.actionsRefreshed.length; i++) {
        action = this.actionsRefreshed[i];
        if (action !== undefined && action.getId() === id) {
            this.actionsFinished[id] = action;
            this.actionsRefreshed[i] = undefined;
            return action;
        }
    }
    return null;
};

/**
 * Collect an action.
 *
 * This routine collects an action (with response if from storage).
 * Once we have collected all of the actions together, we make sure that we refresh any stored responses
 * that need a refresh, and call the callback provided on construction.
 *
 * @private
 * @param {Action} action the action to collect
 * @param {Object} response the response to the action (if from storage).
 */
$A.ns.ActionCollector.prototype.collectAction = function(action, response) {
    if (response) {
        action.updateFromResponse(response);
        this.actionsToComplete.push({
            action : action,
            response : response
        });
    } else {
        //
        // If this is a chained action, the execution will be via another path, and we won't be able
        // to guarantee correct sequencing or refreshing of chained events... so don't do that.
        //
        if (!action.isChained()) {
            this.actionsToSend.push(action);
        }
    }
    if (--this.actionsToCollect <= 0) {
        this.finishCollection();
    }
};

/**
 * Finish collection.
 *
 * This routine is called when all actions have been processed, either directly or through storage.
 * It completes the actions with stored responses, and calls the callback given in the constructor.
 * The refresh is handled here because it needs access to so much internal state.
 *
 * @private
 */
$A.ns.ActionCollector.prototype.finishCollection = function() {
    var i, now, toComplete, interval, refresh, action;
    //
    // Do the checks for up-to-date here to make our times consistent.
    // Since we are already out of order, there seems no point in trying to enforce here.
    //
    $A.assert(this.actionsToCollect === 0,
        "Actions to collect is < 0: "+this.actionsToCollect+" actions ="+this.actionsRequested);
    now = new Date().getTime();
    for (i = 0; i < this.actionsToComplete.length; i++) {
        toComplete = this.actionsToComplete[i];
        action = toComplete.action;
        interval = now - toComplete.response["storage"]["created"];
        if (action.isChained()) {
            //
            // If this is a chained action, the execution will be via another path, and we won't be able
            // to guarantee correct sequencing or refreshing of chained events... so make an action
            // storable and chained at your own risk.
            //
            continue;
        }
        refresh = action.getRefreshAction(toComplete.response, interval);
        if (refresh) {
            action.fireRefreshEvent("refreshBegin");
            this.actionsToSend.push(refresh);
            this.actionsRefreshed.push(refresh);
        }
    }
    this.finishedCallback(this);
};
