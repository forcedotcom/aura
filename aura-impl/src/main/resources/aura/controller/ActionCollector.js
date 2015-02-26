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
var ActionCollector = function ActionCollector(actions, finishedCallback) {
    this.actionsToSend = [];
    this.actionsCount = 0;
    this.actionsToComplete = [];
    this.actionsRefreshed = [];
    this.actionsFinished = {};
    this.finishedCallback = finishedCallback;
    this.collectorId = ActionCollector.prototype.counter++;
    this.actionsRequested = actions;
    if (actions) {
        this.actionsToCollect = actions.length;
        this.actionsCount = actions.length;
    } else {
        this.actionsToCollect = 0;
        this.actionsCount = 0;
    }
    this.num = -1;
};

ActionCollector.prototype.auraType = "ActionCollector";

ActionCollector.prototype.counter = 0;

/**
 * Run the collection of actions.
 *
 * This is the meat of the routine, which walks all of the actions and checks for storable actions,
 * looking them up in the cache as it goes. Because the cache is asynchronous, the actual collection
 * is done in a callable function.
 */
ActionCollector.prototype.process = function() {
    var i, key;
    var action;
    var that = this;

    var checkForCachedResponse = function(action, index) {
        //
        // For cacheable actions check the storage service to see if we already have a viable cached action
        // response we can complete immediately. In this case, we get a callback, so we create a callback
        // for each one (ugh, this could have been handled via passing an additional param to the action,
        // but we don't have that luxury now.)
        //
        var storage = action.getStorage();
        if (action.isStorable() && storage) {
            key = action.getStorageKey();
            // using storage so callbacks *must* be in an aura loop
            storage.get(key).then(
                function(value) {
                    $A.run(function() {
                        // FIXME: (from KV) - do we want to reject expired values?
                        that.collectAction(action, value ? value.value : null, index);
                    });
                },
                function() {
                    // error fetching from storage so go to the server
                    $A.run(function() {
                        that.collectAction(action, null, index);
                    });
                }
            );
        } else {
            that.collectAction(action, null, index);
        }
    };

    for (i = 0; i < this.actionsRequested.length; i++) {
        action = this.actionsRequested[i];
        $A.assert(action.getDef().isServerAction(), "Client side action leaked through to server call.");
        checkForCachedResponse(action, i);
    }
};

/**
 * Get the set of actions requested.
 *
 * These actions are the actions that have storage associated with them, so they
 * can be completed immediately.
 */
ActionCollector.prototype.getActionsRequested = function() {
    return this.actionsRequested;
};


/**
 * Get the set of actions to complete.
 *
 * These actions are the actions that have storage associated with them, so they
 * can be completed immediately.
 */
ActionCollector.prototype.getActionsToComplete = function() {
    return this.actionsToComplete;
};

/**
 * Get the set of actions to send.
 */
ActionCollector.prototype.getActionsToSend = function() {
    return this.actionsToSend;
};

/**
 * Get the action group id.
 */
ActionCollector.prototype.getCollectorId = function() {
    return this.collectorId;
};

/**
 * Set the 'number' for this collector.
 */
ActionCollector.prototype.setNum = function(num) {
    this.num = num;
};

/**
 * get the 'number' for this collector.
 */
ActionCollector.prototype.getNum = function() {
    return this.num;
};

/**
 * Find an action and mark it as 'completed'.
 */
ActionCollector.prototype.findActionAndClear = function(id) {
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
 * @param {Action} action the action to collect
 * @param {Object} response the response to the action (if from storage).
 * @param {integer} index the index for the action.
 * @private
 */
ActionCollector.prototype.collectAction = function(action, response, index) {
    if (response) {
        this.actionsToComplete[index] = {
            action : action,
            response : response
        };
    } else {
        //
        // If this is a chained action, the execution will be via another path, and we won't be able
        // to guarantee correct sequencing or refreshing of chained events... so don't do that.
        //
        action.callAllAboardCallback();
        if (!action.isChained()) {
            this.actionsToSend[index] = action;
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
ActionCollector.prototype.finishCollection = function() {
    var i, toComplete, refresh, action;
    //
    // Do the checks for up-to-date here to make our times consistent.
    // Since we are already out of order, there seems no point in trying to enforce here.
    //
    $A.assert(this.actionsToCollect === 0,
        "Actions to collect is = 0: "+this.actionsToCollect+" actions ="+this.actionsRequested);
    var complete = this.actionsToComplete;
    this.actionsToComplete = [];
    for (i = 0; i < this.actionsCount; i++) {
        toComplete = complete[i];
        if (!toComplete) {
            continue;
        }
        this.actionsToComplete.push(toComplete);
        action = toComplete.action;
        if (action.isChained()) {
            //
            // If this is a chained action, the execution will be via another path, and we won't be able
            // to guarantee correct sequencing or refreshing of chained events... so make an action
            // storable and chained at your own risk.
            //
            continue;
        }
        refresh = action.getRefreshAction(toComplete.response);
        if (refresh) {
            action.fireRefreshEvent("refreshBegin");
            this.actionsToSend[i] = refresh;
            this.actionsRefreshed.push(refresh);
        }
    }
    var ordered = this.actionsToSend;
    this.actionsToSend = [];
    for (i = 0; i < this.actionsCount; i++) {
        if (ordered[i]) {
            this.actionsToSend.push(ordered[i]);
        }
    }
    this.finishedCallback(this);
};

$A.ns.ActionCollector = ActionCollector;
