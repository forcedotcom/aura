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
 * A queue of actions both client-side and server-side, foreground and background.  Handles pruning abortable actions as needed.
 * @constructor
 */
var ActionQueue = function ActionQueue() {
    this.nextActionGroupNumber = -1;
    this.lastAbortableActionGroupNumber = -1;
    this.actions = [];
};

ActionQueue.prototype.auraType = "ActionQueue";

/**
 * Put a single action in the queue, possibly clearing prior abortable action
 */
ActionQueue.prototype.enqueue = function(action) {
    if (action.isAbortable() && (this.lastAbortableActionGroupNumber !== this.nextActionGroupNumber)) {
        this.actions = this.clearPreviousAbortableActions(this.actions);
        this.lastAbortableActionGroupNumber = this.nextActionGroupNumber;
    }
    this.actions.push(action);
};

/**
 * increment the next action group counter (called at the _end_ of processing actions) 
 */
ActionQueue.prototype.incrementNextActionGroupNumber = function() {
    this.nextActionGroupNumber++;
};
        
/**
 * Re-enqueue a set of failed actions that we attempted to send to the server. 
 * They should re-queue at the front of the queue, and have abortable actions stripped if necessary. 
 */
ActionQueue.prototype.reenqueue = function(actionsToEnqueue, abortableId) {
    if (abortableId !== this.lastAbortableActionGroupNumber) {
        actionsToEnqueue = this.clearPreviousAbortableActions(actionsToEnqueue);
    }
    this.actions.splice(0, 0, actionsToEnqueue);
};

/**
 * Pop the current set of server actions (that are not isBackground()), clearing the actions from the queue.
 * Returns [] if there are no server actions in he queue.
 */
ActionQueue.prototype.getServerActions = function(filter) {
    return this.filterActions(function(action) {
        return action.getDef().isServerAction() && !action.isBackground();
    });
};

/**
 * Get the next background action, clearing it from the queue.
 * Returns undefined if no background actions are on the queue.
 */
ActionQueue.prototype.getNextBackgroundAction = function() {
    return this.filterActions(function(action) {
        return action.getDef().isServerAction() && action.isBackground();
    }, true);
};

/**
 * Return the current set of client actions, clearing them from the queue. 
 * Returns [] is there are no client actions in the queue.
 */
ActionQueue.prototype.getClientActions = function() {
    return this.filterActions(function(action) {
        return action.getDef().isClientAction();
    });
};

/**
 * Return the number of the last group of actions containing an abortable action.
 */
ActionQueue.prototype.getLastAbortableActionGroupNumber = function() {
    return this.lastAbortableActionGroupNumber;
};

ActionQueue.prototype.clearPreviousAbortableActions = function(queue) {
    var newQueue = [];
    var counter;
    for(counter = 0; counter < queue.length; counter++) {
        if (!queue[counter].isAbortable()) {
            newQueue.push(queue[counter]);
        } else {
            queue[counter].abort();
        }
    }
    return newQueue;
};

/**
 * Extract action(s) matching the given filter leave the rest in this.actions
 * and return the match(es).
 * @param returnFirst - true if only the first matched action should be removed 
 * from the queue and returned, false will return an array of all matched actions.
 */
ActionQueue.prototype.filterActions = function(filter, returnFirst) {
    var actionsCopy = this.actions;
    this.actions = [];
    var newActions = [];
    var requestedActions = [];
    var action;
    var counter;
    
    for (counter = 0; counter < actionsCopy.length; counter++) {
        action = actionsCopy[counter];
        if (filter(action)) {
            if (returnFirst) {
                actionsCopy.splice(counter, 1);
                requestedActions = action;
                break;
            } else {
                requestedActions.push(action);
            }
        } else if (!returnFirst){
            newActions.push(action);
        }
    }
    if (returnFirst) {
        this.actions = actionsCopy;
        requestedActions = undefined;
    } else {
        this.actions = newActions;
    }
    return requestedActions;
};