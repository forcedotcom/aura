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
function manualTestEvents() {
    var ACTIONS = ["fetch", "reload", "clearCache"];
    var ACTIONS_WEIGHT = [0.7, 0.2, 0.1]; // must add up to 1
    var DEFS = ["ui:scroller", "ui:tree", "ui:carousel", "auraStorageTest:manualTesterBigCmp"];
    var DEFAULT_DELAY_MS = 1;
    var DEFAULT_MAX_DELAY = 1000;

    // WIP - capture repros that are know to cause issues
    var PRESET_INDEX = -1;
    var PRESET1 = ["ui:scroller", "ui:carousel", "reload", "ui:scroller", "ui:carousel", "reload", "ui:scroller", "ui:carousel", "reload", "ui:scroller", "ui:carousel", "reload", "ui:scroller", "ui:carousel","reload", "ui:scroller", "ui:carousel","clearCache", "reload"];

    /**
     * Gets the amount of time in milliseconds to delay before running an event.
     * @param {Boolean} randomDelay true to get a random amount of delay, otherwise the default will be returned
     */
    function getDelay(randomDelay) {
        return !!randomDelay ? getRandomDelay() : DEFAULT_DELAY_MS;
    };

    /**
     * Gets a random amount of time in milliseconds to delay before running an event.
     * @param {Integer} maxMs the maximum milliseconds possible to return
     */
    function getRandomDelay(maxMs) {
        maxMs = !!maxMs ? maxMs : DEFAULT_MAX_DELAY;
        return Math.floor(Math.random() * maxMs);
    };

    /**
     * Returns a random item from a list, given weights for each item. 
     * For example, if [a,b,c] were passed in with weights [.1,.2,.7], a would have a 10% chance of being chosen
     * and c a 70% chance.
     * @param {Array} list the items to choose from
     * @param {Array} weight the list of weights that must add up to 1, where each index of the array maps to the index of the list
     */
    function getRandomItem(list, weight) {
        var sum = weight.reduce(function(a,b) { return (a + b) }, 0);
        $A.assert(sum > .9999 && sum < 1.0001, "sum of weights must be 1");
        var randomNumber = Math.random();
        var weightedSum = 0;

        for (var i = 0; i < list.length; i++) {
            weightedSum += weight[i];
            weightedSum = +weightedSum.toFixed(2);
            if (randomNumber <= weightedSum) {
                return list[i];
            }
        }
    };

    /**
     * Returns an event to execute.
     * @param {String} action the name of the event to run
     * @param {Integer} delay the amount of time in milliseconds to delay before executing the event
     * @param {String} def the def to fetch for a 'fetch' event
     */
    function buildEvent(action, delay, def) {
        var event = {
                "action": action,
                "delay": delay
        };
        if (def) {
            event["def"] = def;
        }
        return event;
    };

    return {
        /**
         * Returns a random event
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getRandomEvent: function(randomDelay) {
            var action = getRandomItem(ACTIONS, ACTIONS_WEIGHT);
            if (action === "fetch") {
                return this.getRandomFetchEvent(randomDelay);
            } else {
                return buildEvent(action, getDelay(randomDelay));
            }
        },

        /**
         * Returns an event that fetches a component from the server, choosing a def from the list at random.
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getRandomFetchEvent: function(randomDelay) {
            var defIndex = Math.floor(Math.random() * (DEFS.length));
            return buildEvent("fetch", getDelay(randomDelay), DEFS[defIndex]);
        },

        /**
         * Returns an event that fetches the given def from the server
         * @param {String} def the name of the def to fetch from the server
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getFetchEvent: function(def, randomDelay) {
            return buildEvent("fetch", getDelay(randomDelay), def);
        },

        /**
         * Returns a reload event.
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getReloadEvent: function(randomDelay) {
            return buildEvent("reload", getDelay(randomDelay));
        },

        /**
         * Returns an event that clears the cache.
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getClearCacheEvent: function(randomDelay) {
            return buildEvent("clearCache", getDelay(randomDelay));
        },

        /**
         * For a reset list of events to execute, returns the next event in the list.
         * @param {Boolean} randomDelay true to delay the action a random amount of time before executing
         */
        getNextPresetEvent: function(randomDelay) {
            PRESET_INDEX = ++PRESET_INDEX >= PRESET1.length ? 0 : PRESET_INDEX;
            var event = PRESET1[PRESET_INDEX];
            if (event === "reload") {
                return this.getReloadEvent(randomDelay);
            } else if (event === "clearCache") {
                return this.getClearCacheEvent(randomDelay);
            } else {
                return this.getFetchEvent(event, randomDelay);
            }
        }
    };
}