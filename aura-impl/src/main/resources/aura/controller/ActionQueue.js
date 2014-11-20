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
/**
 * A queue of actions both client-side and server-side, foreground and background.
 * 
 * Handles pruning abortable actions as needed. The queue is divided into 'transactions' that correspond to all actions
 * queued up from the start of an entry point to the last exit from aura. If a later transaction has an abortable
 * action, all previous abortable actions will be aborted if they have not yet executed..
 * 
 * This object is not intended to be public.
 * 
 * @name ActionQueue
 * @constructor
 * @private
 */

var ActionQueue = function ActionQueue() {
    this.nextTransactionId = -1;
    this.lastAbortableTransactionId = -1;
    this.actions = [];
    this.xhr = false;
};

ActionQueue.prototype.auraType = "ActionQueue";

/**
 * Put a single action in the queue, possibly clearing prior abortable actions.
 * 
 * This maintains the order of the queue, but if, this action is the first action in the current transaction that is
 * abortable, all previous abortable actions are cleared.
 * 
 * @protected
 * @param {Action}
 *            action the action to enqueue
 */
ActionQueue.prototype.enqueue = function(action) {
    if (action.isAbortable()) {
        if (action.getAbortableId() == undefined) {
            if (this.lastAbortableTransactionId !== this.nextTransactionId) {
                this.actions = this.clearPreviousAbortableActions(this.actions);
                this.lastAbortableTransactionId = this.nextTransactionId;
            }
            action.setAbortableId(this.nextTransactionId);
        } else if (action.getAbortableId() !== this.lastAbortableTransactionId) {
            // whoops, action is already aborted.
            action.abort();
            return;
        }
    }
    // XHR is only set for forground server actions that are not forced into a boxcar.
    if (!action.isCaboose() && action.getDef().isServerAction() && !action.isBackground()) {
        this.xhr = true;
    }
    this.actions.push(action);
};

/**
 * Get the transaction ID for the next set pulled from the queue.
 * 
 * @protected
 * @return {Number} the next transaction id.
 */
ActionQueue.prototype.getTransactionId = function() {
    return this.nextTransactionId;
};

/**
 * Increment the transaction id.
 * 
 * This is used when we terminate/begin a transaction.
 * 
 * @protected
 */
ActionQueue.prototype.incrementNextTransactionId = function() {
    this.nextTransactionId++;
};

/**
 * Does the queue currently have an action that wants an immediate XHR?.
 */
ActionQueue.prototype.needXHR = function() {
    return this.xhr;
};

/**
 * Pop the current set of foreground server actions.
 * 
 * Pop the current set of foreground server actions (that are not isBackground()), clearing the actions from the queue.
 * 
 * @protected
 * @return {Array} the array of actions, empty if there are none.
 */
ActionQueue.prototype.getServerActions = function() {
        this.xhr = false;
    return this.filterActions(function(action) {
        return action.getDef().isServerAction() && !action.isBackground();
    });
};

/**
 * Get the next background action.
 * 
 * This will return the next background action, or null if there is none.
 * 
 * @protected
 * @return {Action} The first action in the queue that is marked as background.
 */
ActionQueue.prototype.getNextBackgroundAction = function() {
    for ( var i = 0; i < this.actions.length; i++) {
        var action = this.actions[i];

        if (action.isBackground() && action.getDef().isServerAction()) {
            this.actions.splice(i, 1);
            return action;
        }
    }
    return null;
};

/**
 * Return the current set of client actions, clearing them from the queue. Returns [] is there are no client actions in
 * the queue.
 * 
 * @protected
 * @return {Array} the set of client actions.
 */
ActionQueue.prototype.getClientActions = function() {
    return this.filterActions(function(action) {
        return action.getDef().isClientAction();
    });
};

/**
 * Return the number of the last 'transaction' containing an abortable action.
 * 
 * @protected
 */
ActionQueue.prototype.getLastAbortableTransactionId = function() {
    return this.lastAbortableTransactionId;
};

/**
 * Clear the previous abortable actions.
 * 
 * This internal function clears out previous abortable actions, marking them as aborted,
 * and returns the remaining actions.
 * 
 * @param {Array} queue The incoming array of actions
 * @return {Array} A copy of the array with all abortable actions removed.
 * @private
 */
ActionQueue.prototype.clearPreviousAbortableActions = function(queue) {
    var newQueue = [];
    var counter;
    for (counter = 0; counter < queue.length; counter++) {
        var action = queue[counter],
            abortable = action.isAbortable();
        if (!abortable) {
            // push not abortable actions
            newQueue.push(action);
        } else {
            action.abort();
        }
    }
    return newQueue;
};

/**
 * Extract action(s) matching the given filter leave the rest in this.actions and return the match(es).
 * 
 * @param {Function}
 *            filter A filter function that should return true if the action should be removed and returned.
 * @private
 */
ActionQueue.prototype.filterActions = function(filter) {
    var actionsCopy = this.actions;
    this.actions = [];
    var newActions = [];
    var requestedActions = [];
    var action;
    var counter;

    for (counter = 0; counter < actionsCopy.length; counter++) {
        action = actionsCopy[counter];
        if (filter(action)) {
            requestedActions.push(action);
        } else {
            newActions.push(action);
        }
    }
    this.actions = newActions;
    return requestedActions;
};
