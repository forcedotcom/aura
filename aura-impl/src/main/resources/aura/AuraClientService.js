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

// #include aura.controller.ActionCallbackGroup
// #include aura.controller.ActionQueue
// #include aura.controller.ActionCollector

/**
 * @description Counter for in flight actions
 * @constructor
 */
$A.ns.FlightCounter = function(max) {
    this.lastStart = 0;
    this.started = 0;
    this.startCount = 0;
    this.inFlight = 0;
    this.sent = 0;
    this.finished = 0;
    this.max = max;
};

$A.ns.FlightCounter.prototype.idle = function() {
    return this.started === 0 && this.inFlight === 0;
};

$A.ns.FlightCounter.prototype.start = function() {
    if (this.started + this.inFlight < this.max) {
        this.started += 1;
        this.startCount += 1;
        // this.lastStart = now;
        return true;
    }
    return false;
};

$A.ns.FlightCounter.prototype.cancel = function() {
    $A.assert(this.started > 0, "broken inFlight counter");
    this.started -= 1;
};

$A.ns.FlightCounter.prototype.send = function() {
    $A.assert(this.started > 0, "broken inFlight counter");
    this.started -= 1;
    this.sent += 1;
    this.inFlight += 1;
};

$A.ns.FlightCounter.prototype.finish = function() {
    $A.assert(this.inFlight > 0, "broken inFlight counter");
    this.inFlight -= 1;
    this.finished += 1;
};

/**
 * @description The Aura Client Service, accessible using $A.services.client. Communicates with the Aura Server.
 * @constructor
 */
$A.ns.AuraClientService = function() {
    this._host = "";
    this._token = null;
    this._isDisconnected = false;
    this.auraStack = [];
    this.loadEventQueue = [];
    this.appcacheDownloadingEventFired = false;
    this.isOutdated = false;
    this.isUnloading = false;
    this.initDefsObservers = [];
    this.finishedInitDefs = false;

    this.foreground = new $A.ns.FlightCounter(1);
    this.background = new $A.ns.FlightCounter(3);
    this.actionQueue = new ActionQueue();

    this.NOOP = function() {};

    this["Action"] = Action;
    this["ActionQueue"] = ActionQueue;
    this["ActionCollector"] = ActionCollector;

    var acs = this;

    $A.ns.Util.prototype.on(window, "beforeunload", function(event) {
        if (!$A.util.isIE) {
            acs.isUnloading = true;
            acs.requestQueue = [];
        }
    });

    $A.ns.Util.prototype.on(window, "load", function(event) {
        // Lazy load data-src scripts
        var scripts = document.getElementsByTagName("script");
        if (scripts) {
            for ( var i = 0, len = scripts.length; i < len; i++) {
                var script = scripts[i];
                if (script.getAttribute("data-src") && !script.getAttribute("src")) {
                    script.src = script.getAttribute("data-src");
                }
            }
        }
    });

    this.handleAppCache();

    // only expose following private properties for Test.js and xUnit
    //#if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG", "DOC"]}
    this["foreground"] = this.foreground;
    this["background"] = this.background;
    this["actionQueue"] = this.actionQueue;
    this["checkAndDecodeResponse"] = this.checkAndDecodeResponse;
    this["isBB10"] = this.isBB10;
    //#end
};

/**
 * Take a json (hopefully) response and decode it. If the input is invalid JSON, we try to handle it gracefully.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.checkAndDecodeResponse = function(response, noStrip) {
    if (this.isUnloading) {
        return null;
    }

    var e;

    // failure to communicate with server
    if (this.isDisconnectedOrCancelled(response)) {
        this.setConnected(false);
        return null;
    }

    //
    // If a disconnect event was previously fired, fire a connection
    // restored event
    // now that we have a response from a server.
    //
    if (this._isDisconnected) {
        e = $A.get("e.aura:connectionResumed");
        if (e) {
            this._isDisconnected = false;
            e.fire();
        }
    }

    var text = response["responseText"];

    if (/^\s*</.test(text)) {
        //
        // This is what happens when someone hands us a pile of HTML
        // instead of JSON. There is no real hope of dealing with it,
        // so just flag an error, and carry on.
        //
        $A.error(text);
        return null;
    }

    //
    // server-side explosion. The new message is one where there is an /*ERROR*/ appended.
    // this allows us to deal with the fact that we can get errors after the send has started.
    // Of course, we also have the problem that we might not have valid JSON at all, in which case
    // we have further problems...
    //
    if ((response["status"] != 200) || (text.length > 9 && text.charAt(text.length - 9) == "/" //
        && text.charAt(text.length - 8) == "*" //
        && text.charAt(text.length - 7) == "E" //
        && text.charAt(text.length - 6) == "R" //
        && text.charAt(text.length - 5) == "R" //
        && text.charAt(text.length - 4) == "O" //
        && text.charAt(text.length - 3) == "R" //
        && text.charAt(text.length - 2) == "*" && text.charAt(text.length - 1) == "/")) {
        if (response["status"] == 200) {
            // if we encountered an exception once the response was committed
            // ignore the malformed JSON
            text = "/*" + text;
        } else if (!noStrip === true && text.charAt(0) == "w") {
            //
            // strip off the while(1) at the beginning
            //
            text = "//" + text;
        }
        var resp = $A.util.json.decode(text, true);

        // if the error on the server is meant to trigger a client-side
        // event...
        if ($A.util.isUndefinedOrNull(resp)) {
            //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            $A.error("Communication error, invalid JSON: " + text);
            // #end
            // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            $A.error("Communication error, please retry or reload the page");
            // #end
            return null;
        } else if (resp["exceptionEvent"] === true) {
            this.throwExceptionEvent(resp);
            return null;
        } else {
            // !!!!!!!!!!HACK ALERT!!!!!!!!!!
            // The server side actually returns a response with 'message' and 'stack' defined
            // when there was a server side exception. Unfortunately, we don't really know what
            // we have... the code in aura.error has checks for those, but if they are not
            // there the error message will be meaningless. This code thu does much the same
            // thing, but in a different way so that we get a real error message.
            // !!!!!!!!!!HACK ALERT!!!!!!!!!!
            //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            if (resp["message"] && resp["stack"]) {
                $A.error(resp["message"] + "\n" + resp["stack"]);
            } else {
                $A.error("Communication error, invalid JSON: " + text);
            }
            // #end
            // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            if (resp["message"]) {
                $A.error(resp["message"]);
            } else {
                $A.error("Communication error, please retry or reload the page");
            }
            // #end
            return null;
        }
    }
    //
    // strip off the while(1) at the beginning
    //
    if (!noStrip === true && text.charAt(0) == "w") {
        text = "//" + text;
    }

    var responseMessage = $A.util.json.decode(text, true);
    if ($A.util.isUndefinedOrNull(responseMessage)) {
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        $A.error("Communication error, invalid JSON: " + text);
        // #end
        // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        $A.error("Communication error, please retry or reload the page");
        // #end
        return null;
    }
    return responseMessage;
};

/**
 * Fire an event exception from the wire.
 *
 * This is published, but only for use in the case of an event exception serialized as JS,
 * not sure if this is important.
 *
 * @param {Object} config The data for the exception event
 * @memberOf $A.ns.AuraClientService
 * @private
 */
$A.ns.AuraClientService.prototype.throwExceptionEvent = function(resp) {
    var evtObj = resp["event"];
    var descriptor = evtObj["descriptor"];

    if (evtObj["eventDef"]) {
        // register the event with the EventDefRegistry
        eventService.getEventDef(evtObj["eventDef"]);
    }

    if (eventService.hasHandlers(descriptor)) {
        var evt = $A.getEvt(descriptor);
        if (evtObj["attributes"]) {
            evt.setParams(evtObj["attributes"]["values"]);
        }

        evt.fire();
    } else {
        try {
            $A.util.json.decodeString(resp["defaultHandler"])();
        } catch (e) {
            $A.error("Error in defaultHandler for event: " + descriptor, e);
            throw e;
        }
    }
};

$A.ns.AuraClientService.prototype.fireDoneWaiting = function() {
    this.fireLoadEvent("e.aura:doneWaiting");
};

$A.ns.AuraClientService.prototype.isDisconnectedOrCancelled = function(response) {
    if (response && response.status) {
        if (response.status === 0) {
            return true;
        } else if (response.status >= 12000 && response.status < 13000) {
            // WINHTTP CONNECTION ERRORS
            return true;
        }
    } else {
        return true;
    }
    return false;
};

/**
 * Get the abortable ID that is currently in force.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.getCurrentTransasctionId = function() {
    if (!this.inAuraLoop()) {
        $A.error("AuraClientService.getCurrentTransasctionId(): Unable to get abortable ID outside of aura loop");
        return;
    }
    return this.actionQueue.getCurrentAbortableId();
};

/**
 * Get the abortable ID that is currently in force.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.setCurrentTransasctionId = function(abortableId) {
    if (!this.inAuraLoop()) {
        $A.error("AuraClientService.getCurrentTransasctionId(): Unable to get abortable ID outside of aura loop");
        return;
    }
    return this.actionQueue.setCurrentAbortableId(abortableId);
};

/**
 * Process a single action/response.
 *
 * Note that it does this inside an $A.run to provide protection against error returns, and to notify the user if an
 * error occurs.
 *
 * @param {Action}
 *            action the action.
 * @param {Boolean}
 *            noAbort if false abortable actions will be aborted.
 * @param {Object}
 *            actionResponse the server response.
 * @private
 */
$A.ns.AuraClientService.prototype.singleAction = function(action, noAbort, actionResponse) {
    var key = action.getStorageKey();

    $A.run(function() {
        var storage, toStore, needUpdate, errorHandler;

        needUpdate = action.updateFromResponse(actionResponse);

        if (noAbort || !action.isAbortable()) {
            if (needUpdate) {
                action.finishAction($A.getContext());
            }
            if (action.isRefreshAction()) {
                action.fireRefreshEvent("refreshEnd", needUpdate);
            }
        } else {
            action.abort();
        }
        storage = action.getStorage();
        if (storage) {
            toStore = action.getStored(storage.getName());
            errorHandler = action.getStorageErrorHandler();

            if (toStore) {
                storage.put(key, toStore).then(
                    function() {},
                    function(error){
                        $A.run(function() {
                            if (errorHandler && $A.util.isFunction(errorHandler)) {
                                errorHandler(error);
                            } else {
                                // storage problems should warn rather than the agressive error.
                                $A.warning("AuraClientService.singleAction, problem when putting "+key+" into storage, error:"+error);
                            }
                        });
                    }
                );
            }
        }
    }, key);
};

/**
 * Callback for an XHR for a set of actions.
 *
 * This function does all of the processing for a set of actions that come back from the server. It correctly deals
 * with the case of interrupted communications, and handles aborts.
 *
 * @param {Object}
 *            response the response from the server.
 * @param {ActionCollector}
 *            the collector for the actions.
 * @param {FlightCounter}
 *            the in flight counter under which the actions were run
 * @param {Scalar}
 *            the abortableId associated with the set of actions.
 * @private
 */
$A.ns.AuraClientService.prototype.actionCallback = function(response, collector, flightCounter, abortableId) {
    //
    // Note that this is a very specific assertion. We can either be called back from an empty stack
    // (the normal case, after an XHR has gone to the server), or we can be called back from inside
    // the popStack protection (currently I only know this to occur in disconnected webkit).
    //
    if (this.auraStack.length > 0) {
        if (this.auraStack.length != 1 || this.auraStack[0] !== "$A.clientServices.popStack") {
            $A.error("Action callback called on non-empty stack '" + this.auraStack + "', length = " + this.auraStack.length);
            this.auraStack = [];
        }
    }


    if (abortableId) {
        this.actionQueue.setCurrentAbortableId(abortableId);
    }
    var that = this;
    try {
        $A.run(function() { that.doActionCallback(response, collector, flightCounter, abortableId); }, "actionCallback");
    } catch (e) {
        throw e;
    } finally {
        this.actionQueue.setCurrentAbortableId(undefined);
    }
};

$A.ns.AuraClientService.prototype.doActionCallback = function(response, collector, flightCounter, abortableId) {
    var action, actionResponses;
    var responseMessage = this.checkAndDecodeResponse(response);
    var noAbort = (abortableId === this.actionQueue.getLastAbortableTransactionId());

    //
    // pre-decrement so that we correctly send the next response right after this.
    //
    if (responseMessage) {
        var token = responseMessage["token"];
        if (token) {
            this._token = token;
            this.saveTokenToStorage();
        }

        $A.getContext().merge(responseMessage["context"]);

        // Look for any Client side event exceptions
        var events = responseMessage["events"];
        if (events) {
            for ( var en = 0, len = events.length; en < len; en++) {
                this.parseAndFireEvent(events[en]);
            }
        }

        actionResponses = responseMessage["actions"];

        // Process each action and its response
        for ( var r = 0; r < actionResponses.length; r++) {
            var actionResponse = actionResponses[r];
            action = collector.findActionAndClear(actionResponse["id"]);

            if (action === null) {
                if (actionResponse["storable"]) {
                    //
                    // Hmm, we got a missing action. We allow this in the case that we have
                    // a storable action from the server (i.e. we are faking an action from the
                    // server to store data on the client. This is only used in priming, and is
                    // more than a bit of a hack.
                    //
                    // Create a client side action instance to go with the server created action response
                    //
                    var descriptor = actionResponse["action"];
                    var actionDef = $A.services.component.getActionDef({
                        descriptor : descriptor
                    });
                    action = actionDef.newInstance();
                    action.setStorable();
                    action.setParams(actionResponse["params"]);
                    action.setAbortable(false);
                } else {
                    $A.assert(action, "Unable to find action for action response " + actionResponse["id"]);
                }
            }
            this.singleAction(action, noAbort, actionResponse);
        }
    } else if (this.isDisconnectedOrCancelled(response) && !this.isUnloading) {
        var actions = collector.getActionsToSend();

        for ( var m = 0; m < actions.length; m++) {
            action = actions[m];
            if (noAbort || !action.isAbortable()) {
                action.incomplete($A.getContext());
            } else {
                action.abort();
            }
        }
    }
    $A.Perf.endMark("Completed Action Callback - XHR " + collector.getNum());
    this.fireDoneWaiting();
};

/**
 * Execute the list of client actions synchronously. Populate state and return values and execute the action
 * callbacks. This method does not interact with the inFlight counter and does no throttling. All actions will be
 * run as it is assumed abortable actions have already been pruned.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.runClientActions = function(actions) {
    var action;
    for ( var i = 0; i < actions.length; i++) {
        action = actions[i];
        action.runDeprecated();
        action.finishAction($A.getContext());
    }
};

/**
 * The last step before sending to the server.
 *
 * This routine does the actual XHR request to the server, using the collected actions to do so. In the event that
 * there are no actions to send, it simply completes the request.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.finishRequest = function(collector, flightCounter, abortableId, flightHandled) {
    var actionsToSend = collector.getActionsToSend();
    var actionsToComplete = collector.getActionsToComplete();

    if (actionsToComplete.length > 0) {
        for ( var n = 0; n < actionsToComplete.length; n++) {
            var info = actionsToComplete[n];
            info.action.updateFromResponse(info.response);
            try {
                info.action.finishAction($A.getContext());
            } catch(e) {
                var retryAction = info.action.getRetryFromStorageAction();
                if (retryAction) {
                    $A.warning("Finishing cached action failed. Trying to refetch from server: " + retryAction.getStorageKey(), e);
                    // Clear potential leftover configs
                    $A.getContext().clearComponentConfigs(info.action.getId());
                    // Enqueue the retry action
                    $A.enqueueAction(retryAction);
                } else {
                    // If it was not from storage, just rethrow the error and carry on as normal.
                    throw e;
                }
            }
        }
        this.fireDoneWaiting();
    }

    if (actionsToSend.length > 0) {
        collector.setNum($A.getContext().incrementNum());

        var markDescription = undefined;
        // #if {"modes" : ["PTEST"]}
        markDescription = ": [";
        for (var m = 0; m < actionsToSend.length; m++) {
            if (actionsToSend[m].def) {
                markDescription += "'" + actionsToSend[m].def.name
            } else {
                markDescription += "'undefined";
            }
            if (actionsToSend[m].background) {
                markDescription += "<BG>'";
            } else {
                markDescription += "'";
            }
            if (m < actionsToSend.length - 1) {
                markDescription += ",";
            }
        }
        markDescription += "]";
        // #end

        var acs = this;
        var actionDefs = [];

        for (var i = 0; i < actionsToSend.length; i++) {
            actionDefs.push(actionsToSend[i].getDef() + '[' + actionsToSend[i].getId() + ']');
        }

        // clientService.requestQueue reference is mutable
        var requestConfig = {
            "url" : this._host + "/aura",
            "method" : "POST",
            "scope" : this,
            "callback" : function(response) {
                // always finish our in-flight counter here.
                flightCounter.finish();
                acs.actionCallback(response, collector, flightCounter, abortableId);
            },
            "params" : {
                "message" : $A.util.json.encode({
                    "actions" : actionsToSend
                }),
                "aura.token" : this._token,
                "aura.context" : $A.getContext().encodeForServer(),
                "aura.num" : collector.getNum()
                // #if {"modes" : ["PTEST"]}
                ,
                "beaconData" : $A.Perf.getBeaconData()
                // #end
            },
            "actionDefs": actionDefs,
            "markDescription" : markDescription // Delete this when we remove all jiffy marks
        };

        $A.Perf.endMark("Action Group " + collector.getCollectorId() + " enqueued");

        // clear the beaconData
        // #if {"modes" : ["PTEST"]}
        $A.Perf.clearBeaconData();
        // #end

        $A.Perf.endMark("Action Request Prepared");
        $A.util.transport["request"](requestConfig);
        flightCounter.send();
        flightHandled.value = true;

        setTimeout(function() {
            $A.get("e.aura:waiting").fire();
        }, 1);
    } else {
        // We didn't send a request, so clean up the in-flight counter.
        flightCounter.cancel();
        flightHandled.value = true;
    }
};

/**
 * Start a request sequence for a set of actions and an 'in-flight' counter.
 *
 * This routine will usually send off a request to the server, and will always walk through the steps to do so. If
 * no request is sent to the server, it is because the request was either a storable action without needing refresh,
 * or all abortable actions that will be aborted (not sure if that is even possible).
 *
 * This function should never be called unless flightCounter.start() was called and returned true (meaning there is
 * capacity in the channel).
 *
 * @param {Array}
 *            actions the list of actions to process.
 * @param {FlightCounter}
 *            the flight counter under which the actions should be run.
 * @private
 */
$A.ns.AuraClientService.prototype.request = function(actions, flightCounter) {
    $A.Perf.mark("AuraClientService.request");
    $A.Perf.mark("Action Request Prepared");
    var flightHandled = { value: false };
    var acs = this;
    //
    // NOTE: this is done here, before the callback to avoid a race condition of someone else queueing up
    // an abortable action while we are off waiting for storage.
    //
    window.setTimeout(function() {
        if(!flightHandled.value) {
            $A.warning("Timed out waiting for ActionController to reset flight counter! Resetting the flight counter and clearing component configs of processed actions");
            flightCounter.cancel();
        }
    }, 30000);
    try {
        var abortableId = this.actionQueue.getLastAbortableTransactionId();
        var collector = new $A.ns.ActionCollector(actions, function() {
            try {
                acs.actionQueue.setCurrentAbortableId(abortableId);
                acs.finishRequest(collector, flightCounter, abortableId, flightHandled);
            } catch (e) {
                if (!flightHandled.value) {
                    flightCounter.cancel();
                    flightHandled.value = true;
                }
                throw e;
            }
        });
        collector.process();
        $A.Perf.mark("Action Group " + collector.getCollectorId() + " enqueued");
    } catch (e) {
        if (!flightHandled.value) {
            flightCounter.cancel();
            flightHandled.value = true;
        }
        throw e;
    }
};

$A.ns.AuraClientService.prototype.isBB10 = function() {
    var ua = navigator.userAgent;
    return (ua.indexOf("BB10") > 0 && ua.indexOf("AppleWebKit") > 0);
};

$A.ns.AuraClientService.prototype.getManifestURL = function() {
    var htmlNode = document.body.parentNode;
    return htmlNode ? htmlNode.getAttribute("manifest") : null;
};

$A.ns.AuraClientService.prototype.isManifestPresent = function() {
    return !!this.getManifestURL();
};

/**
 * Perform a hard refresh.
 *
 * @memberOf $A.ns.AuraClientService
 */
$A.ns.AuraClientService.prototype.hardRefresh = function() {
    var url = location.href;
    if (!this.isManifestPresent() || url.indexOf("?nocache=") > -1) {
        location.reload(true);
        return;
    }

    // if BB10 and using application cache
    if (this.isBB10() && window.applicationCache
        && window.applicationCache.status !== window.applicationCache.UNCACHED) {
        url = location.protocol + "//" + location.host + location.pathname + "?b=" + Date.now();
    }

    // replace encoding of spaces (%20) with encoding of '+' (%2b) so that when request.getParameter is called in the server, it will decode back to '+'.
    var params = "?nocache=" + encodeURIComponent(url).replace(/\%20/g,"%2b");
    // insert nocache param here for hard refresh
    var hIndex = url.indexOf("#");
    var qIndex = url.indexOf("?");
    var cutIndex = -1;
    if (hIndex > -1 && qIndex > -1) {
        cutIndex = (hIndex < qIndex) ? hIndex : qIndex;
    } else if (hIndex > -1) {
        cutIndex = hIndex;
    } else if (qIndex > -1) {
        cutIndex = qIndex;
    }

    if (cutIndex > -1) {
        url = url.substring(0, cutIndex);
    }


    var sIndex = url.lastIndexOf("/");
    var appName = url.substring(sIndex+1,url.length);
    var newUrl = appName + params;
    //use history.pushState to change the url of current page without actually loading it.
    //AuraServlet will force the reload when GET request with current url contains '?nocache=someUrl'
    //after reload, someUrl will become the current url.
    //state is null: don't need to track the state with popstate
    //title is null: don't want to set the page title.
    history.pushState(null,null,newUrl);

    //fallback to old way : set location.href will trigger the reload right away
    //we need this because when AuraResourceServlet's GET request with a 'error' cookie,
    //AuraServlet doesn't get to do the GET reqeust
    if( (location.href).indexOf("?nocache=") > -1 ) {
        location.href = (url + params);
    }
};

$A.ns.AuraClientService.prototype.fireLoadEvent = function(eventName) {
    var e = $A.get(eventName);
    if (e) {
        e.fire();
    } else {
        this.loadEventQueue.push(eventName);
    }
};

$A.ns.AuraClientService.prototype.isDevMode = function() {
    var context = $A.getContext();
    return !$A.util.isUndefined(context) && context.getMode() === "DEV";
};

$A.ns.AuraClientService.prototype.handleAppCache = function() {

    var acs = this;

    function showProgress(progress) {
        var progressContEl = document.getElementById("auraAppcacheProgress");
        if (progressContEl) {
            if (progress > 0 && progress < 100) {
                progressContEl.style.display = "block";
                var progressEl = progressContEl.firstChild;
                progressEl.firstChild.style.width = progress + "%";
            } else if (progress >= 100) {
                progressContEl.style.display = "none";
            } else if (progress < 0) {
                progressContEl.className = "error";
            }
        }
    }

    function handleAppcacheChecking(e) {
        document._appcacheChecking = true;
    }

    function handleAppcacheUpdateReady(event) {
        if (window.applicationCache.swapCache) {
            window.applicationCache.swapCache();
        }

        // Clear out our componentDefs in localStorage
        $A.componentService.registry.clearCache();

        location.reload(true);
    }

    function handleAppcacheError(e) {
        if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }
        if (window.applicationCache
            && (window.applicationCache.status === window.applicationCache.UNCACHED ||
                window.applicationCache.status === window.applicationCache.OBSOLETE)) {
            return;
        }

        /**
         * BB10 triggers appcache ERROR when the current manifest is a 404.
         * Other browsers triggers OBSOLETE and we refresh the page to get
         * the new manifest.
         *
         * For BB10, we append cache busting param to url to force BB10 browser
         * not to use cached HTML via hardRefresh
         */
        if (acs.isBB10()) {
            acs.hardRefresh();
        }

        var manifestURL = acs.getManifestURL();
        if (acs.isDevMode()) {
            showProgress(-1);
        }

        if (manifestURL) {
            setTimeout(function() {
                $A.util.transport["request"]({
                    "url" : manifestURL,
                    "method" : "GET",
                    "callback" : function() {
                    },
                    "params" : {
                        "aura.error" : "true"
                    }
                });
            }, 500);
        }

        if (acs.appcacheDownloadingEventFired && acs.isOutdated) {
            // No one should get here.
            $A.log("Outdated.");
        }
    }

    function handleAppcacheDownloading(e) {
        if (acs.isDevMode()) {
            var progress = Math.round(100 * e.loaded / e.total);
            showProgress(progress + 1);
        }

        acs.appcacheDownloadingEventFired = true;
    }

    function handleAppcacheProgress(e) {
        if (acs.isDevMode()) {
            var progress = Math.round(100 * e.loaded / e.total);
            showProgress(progress);
        }
    }

    function handleAppcacheNoUpdate(e) {
        if (acs.isDevMode()) {
            showProgress(100);
        }
    }

    function handleAppcacheCached(e) {
        showProgress(100);
    }

    function handleAppcacheObsolete(e) {
        acs.hardRefresh();
    }

    if (window.applicationCache && window.applicationCache.addEventListener) {
        window.applicationCache.addEventListener("checking", handleAppcacheChecking, false);
        window.applicationCache.addEventListener("downloading", handleAppcacheDownloading, false);
        window.applicationCache.addEventListener("updateready", handleAppcacheUpdateReady, false);
        window.applicationCache.addEventListener("error", handleAppcacheError, false);
        window.applicationCache.addEventListener("progress", handleAppcacheProgress, false);
        window.applicationCache.addEventListener("noupdate", handleAppcacheNoUpdate, false);
        window.applicationCache.addEventListener("cached", handleAppcacheCached, false);
        window.applicationCache.addEventListener("obsolete", handleAppcacheObsolete, false);
    }
};

/**
 * Marks the application as outdated.
 *
 * @memberOf $A.ns.AuraClientService
 */
$A.ns.AuraClientService.prototype.setOutdated = function() {
    this.isOutdated = true;
    var appCache = window.applicationCache;
    if (!appCache || (appCache && appCache.status === appCache.UNCACHED)) {
        location["reload"](true);
    } else if (appCache.status === appCache.OBSOLETE) {
        location.reload(true);
    } else if (appCache.status !== appCache.CHECKING && appCache.status !== appCache.DOWNLOADING) {
        appCache.update();
    }
};

/**
 * Inform Aura that the environment is either online or offline.
 *
 * @param {Boolean} isConnected Set to true to run Aura in online mode,
 * or false to run Aura in offline mode.
 * @memberOf $A.ns.AuraClientService
 * @public
 */
$A.ns.AuraClientService.prototype.setConnected = function(isConnected) {
    var isDisconnected = !isConnected;
    if (isDisconnected === this._isDisconnected) {
        // Already in desired state so no work to be done:
        return;
    }

    var e = $A.get(isDisconnected ? "e.aura:connectionLost" : "e.aura:connectionResumed");
    if (e) {
        this._isDisconnected = isDisconnected;
        e.fire();
    } else {
        // looks like no definitions loaded yet
        alert(isDisconnected ? "Connection lost" : "Connection resumed");
    }
};

/**
 * Saves the CSRF token to the Actions storage. Does not block nor report success or failure.
 */
$A.ns.AuraClientService.prototype.saveTokenToStorage = function() {
    // update the persisted CSRF token so it's accessible when the app is launched while offline.
    // fire-and-forget style, matching action response persistence.
    var storage = Action.prototype.getStorage();
    if (storage && this._token) {
        var value = { "token": this._token };
        storage.put("$AuraClientService.priv$", value).then(
            this.NOOP,
            function(err){ $A.warning("AuraClientService.saveTokenToStorage(): failed to persist token: " + err); }
        );
    }
};

/**
 * Loads the CSRF token from Actions storage.
 * @return {Promise} resolves or rejects based on data loading.
 */
$A.ns.AuraClientService.prototype.loadTokenFromStorage = function() {
    var storage = Action.prototype.getStorage();
    if (storage) {
        return storage.get("$AuraClientService.priv$");
    }
    return Promise.reject(new Error("no Action storage"));
};

/**
 * Init host is used to set the host name for communications.
 *
 * It should only be called once during the application life cycle, since it
 * will be deleted in production mode.
 *
 * Note that in testing, this can be used to make the host appear unreachable.
 *
 * @param {string} host the host name of the server.
 * @public
 */
$A.ns.AuraClientService.prototype.initHost = function(host) {
    this._host = host || "";
    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    delete $A.ns.AuraClientService.prototype.initHost;
    delete $A.ns.AuraClientService.prototype["initHost"];
    //#end
};

/**
 * Initialize aura.
 *
 * This should never be called by client code.
 *
 * @param {Object} config the configuration for aura.
 * @param {string} token the XSS token.
 * @param {function} callback the callback when init is complete.
 * @param {object} container the place to install aura (defaults to document.body).
 * @private
 */
$A.ns.AuraClientService.prototype.init = function(config, token, container) {
    $A.Perf.mark("Initial Component Created");
    $A.Perf.mark("Initial Component Rendered");

    //
    // not on in dev modes to preserve stacktrace in debug tools
    // Why? - goliver
    // I think this should be done in all cases, the $A.error can be more
    // instructive than an uncaught exception.
    //
    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    try {
        //#end

        if (token) {
            this._token = token;
        }

        var component = $A.componentService["newComponentDeprecated"](config, null, false, true);

        $A.Perf.endMark("Initial Component Created");

        renderingService.render(component, container || document.body);
        renderingService.afterRender(component);

        $A.Perf.endMark("Initial Component Rendered");

        return component;

        // not on in dev modes to preserve stacktrace in debug tools
        //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    } catch (e) {
        $A.error("Error during init", e);
        throw e;
    }
    //#end
};

/**
 * This function is used by the test service to determine if there are outstanding actions.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.idle = function() {
    return this.foreground.idle() && this.background.idle() && this.actionQueue.actions.length === 0;
};

/**
 * Initialize definitions.
 *
 * This should never be called by client code. It is exposed, but deleted after
 * first use.
 *
 * @param {Object} config the set of definitions to initialize
 * @private
 */
$A.ns.AuraClientService.prototype.initDefs = function(config) {
    var evtConfigs = aura.util.json.resolveRefs(config["eventDefs"]);
    $A.Perf.mark("Registered Events [" + evtConfigs.length + "]");
    for ( var j = 0; j < evtConfigs.length; j++) {
        $A.eventService.getEventDef(evtConfigs[j]);
    }
    $A.Perf.endMark("Registered Events [" + evtConfigs.length + "]");

    var libraryConfigs = aura.util.json.resolveRefs(config["libraryDefs"]);
    $A.Perf.mark("Registered Libraries [" + libraryConfigs.length + "]");
    for (j = 0; j < libraryConfigs.length; j++) {
        $A.componentService.getLibraryDef(libraryConfigs[j]);
    }
    $A.Perf.endMark("Registered Libraries [" + libraryConfigs.length + "]");

    var controllerConfigs = aura.util.json.resolveRefs(config["controllerDefs"]);
    $A.Perf.mark("Registered Controllers [" + controllerConfigs.length + "]");
    for (j = 0; j < controllerConfigs.length; j++) {
        $A.componentService.getControllerDef(controllerConfigs[j]);
    }
    $A.Perf.endMark("Registered Controllers [" + controllerConfigs.length + "]");

    var comConfigs = aura.util.json.resolveRefs(config["componentDefs"]);
    $A.Perf.mark("Registered Components [" + comConfigs.length + "]");
    for ( var i = 0; i < comConfigs.length; i++) {
        $A.componentService.getDef(comConfigs[i]);
    }
    $A.Perf.endMark("Registered Components [" + comConfigs.length + "]");

    $A.Perf.endMark("PageStart");

    // Let any interested parties know that defs have been initialized
    for ( var n = 0, olen = this.initDefsObservers.length; n < olen; n++) {
        this.initDefsObservers[n]();
    }

    this.initDefsObservers = [];

    $A.log("initDefs complete");

    // Use the non-existence of initDefs() as the sentinel indicating that defs are good to go
    this.finishedInitDefs = true;
};

/**
 * Run a callback after defs are initialized.
 *
 * This is for internal use only. The function is called synchronously if definitions have
 * already been initialized.
 *
 * @param {function} callback the callback that should be invoked after defs are initialized
 * @private
 */
$A.ns.AuraClientService.prototype.runAfterInitDefs = function(callback) {
    if (!this.finishedInitDefs) {
        // Add to the list of callbacks waiting until initDefs() is done
        this.initDefsObservers.push(callback);
    } else {
        // initDefs() is done and gone so just run the callback
        callback();
    }
};

/**
 * Load an app by calling loadComponent.
 *
 * @param {DefDescriptor}
 *            descriptor The key for a definition with a qualified name
 *            of the format prefix://namespace:name.
 * @param {Map}
 *            attributes The configuration data to use in the app
 * @param {function}
 *            callback The callback function to run
 * @memberOf $A.ns.AuraClientService
 * @private
 */
$A.ns.AuraClientService.prototype.loadApplication = function(descriptor, attributes, callback) {
    this.loadComponent(descriptor, attributes, callback, "APPLICATION");
};

/**
 * Load a component.
 *
 * @param {DefDescriptor}
 *            descriptor The key for a definition with a qualified name
 *            of the format prefix://namespace:name
 * @param {Map}
 *            attributes The configuration data to use. If specified,
 *            attributes are used as a key value pair.
 * @param {function}
 *            callback The callback function to run
 * @param {String}
 *            defType Sets the defType to "COMPONENT"
 * @memberOf $A.ns.AuraClientService
 * @private
 */
$A.ns.AuraClientService.prototype.loadComponent = function(descriptor, attributes, callback, defType) {
    var acs = this;
    this.runAfterInitDefs(function() {
        $A.run(function() {
            var desc = new DefDescriptor(descriptor);
            var tag = desc.getNamespace() + ":" + desc.getName();

            var method = defType === "APPLICATION" ? "getApplication" : "getComponent";
            var action = $A.get("c.aura://ComponentController." + method);

            action.setStorable({
                "ignoreExisting" : true
            });
            //
            // No, really, do not abort this. The setStorable above defaults this
            // to be abortable, but, even though nothing should ever trigger an action
            // that could be abortable here (we haven't loaded the app yet, so it shouldn't
            // be possible), we want to avoid any confusion.
            //
            action.setAbortable(false);

            action.setParams({
                name : tag,
                attributes : attributes
            });

            action.setCallback(acs, function(a) {
                var state = a.getState();

                if (state === "SUCCESS") {
                    // Persists the CSRF token so it's accessible when the app is launched while offline.
                    acs.saveTokenToStorage();
                    callback(a.getReturnValue());
                } else if (state === "INCOMPLETE"){
                    // Use a stored response if one exists
                    var storage = Action.prototype.getStorage();
                    if (storage) {
                        // TODO W-2512654: storage.get() returns expired items, need to check
                        // value['isExpired'] in the multiple gets() below
                        var key = action.getStorageKey();
                        acs.loadTokenFromStorage()
                            .then(function(value) {
                                if (value && value.value && value.value.token) {
                                    this._token = value.value.token;
                                }
                            }, function(err) {
                                // So this isn't good: we don't have the CSRF token so if we go back online the server
                                // Actions will fail due to not having a token. But cached data remains accessible so we
                                // warn rather than error.
                                $A.warning("AuraClientService.loadComponent(): failed to load token: " + err);
                            })
                            // load getApplication() from storage
                            .then(function() { return storage.get(key); })
                            .then(
                            function(value) {
                                if (value) {
                                    storage.log("AuraClientService.loadComponent(): bootstrap request was INCOMPLETE using stored action response.", [action, value.value]);
                                    $A.run(function() {
                                        action.updateFromResponse(value.value);
                                        action.finishAction($A.getContext());
                                    });
                                } else {
                                    $A.error("Unable to load application.");
                                }
                            }, function() {
                                $A.error("Unable to load application.");
                            }
                        );
                    }
                } else {
                    //
                    // This can be either error or aborted, and we really should only
                    // see error.
                    //
                    var errors = a.getError();

                    if (errors && errors[0] && errors[0].message) {
                        $A.error(a.getError()[0].message);
                    } else {
                        $A.error("Unable to load component, action state = "+state);
                    }
                }

                $A.Perf.endMark("Sending XHR " + $A.getContext().getNum());
            });

            acs.enqueueAction(action);

            //
            // Now make sure we load labels....
            //
            var labelAction = $A.get("c.aura://ComponentController.loadLabels");
            // no parameters, no callback.
            labelAction.setCallback(acs, function(a) {});
            acs.enqueueAction(labelAction);
        }, "loadComponent");
    });
};

/**
 * Check to see if we are inside the aura processing 'loop'.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.inAuraLoop = function() {
    return this.auraStack.length > 0;
};

/**
 * Check to see if a public pop should be allowed.
 *
 * We allow a public pop if the name was pushed, or if there is nothing
 * on the stack.
 *
 * @param {string} name the name of the public 'pop' that will happen.
 * @return {Boolean} true if the pop should be allowed.
 */
$A.ns.AuraClientService.prototype.checkPublicPop = function(name) {
    if (this.auraStack.length > 0) {
        return this.auraStack[this.auraStack.length-1] === name;
    }
    //
    // Allow public pop calls on an empty stack for now.
    //
    return true;
};

/**
 * Push a new name on the stack.
 *
 * @param {string} name the name of the item to push.
 * @private
 */
$A.ns.AuraClientService.prototype.pushStack = function(name) {
    this.auraStack.push(name);
};

/**
 * Pop an item off the stack.
 *
 * The name of the item must match the previously pushed. If this is the last
 * item on the stack we do post processing, which involves sending actions to
 * the server.
 *
 * @param name the name of the last item pushed.
 * @private
 */
$A.ns.AuraClientService.prototype.popStack = function(name) {
    var lastName;

    if (this.auraStack.length > 0) {
        lastName = this.auraStack.pop();
        if (lastName !== name) {
            $A.error("Broken stack: popped "+lastName+" expected "+name+", stack = "+auraStack);
        }
    } else {
        $A.warning("Pop from empty stack");
    }

    if (this.auraStack.length === 0) {
        try {
            this.handleProcessing(name);
        } catch (e) {
            // this should be very unlikely, but we need to finish processing here.
            $A.error("AuraClientService.popStack(): Failed during processing", e);
        } finally {
            this.auraStack = [];
            this.actionQueue.incrementNextTransactionId();
            this.actionQueue.setCurrentAbortableId(undefined);
        }
    }
};

$A.ns.AuraClientService.prototype.handleProcessing = function(name) {
    var tmppush = "$A.clientServices.popStack";
    var lastName;
    var count = 0;
    var done;

    this.auraStack.push(tmppush);
    this.processActions();
    done = !$A["finishedInit"];
    while (!done && count <= 15) {
        $A.renderingService.rerenderDirty(name);

        done = !this.processActions();

        count += 1;
        if (count > 14) {
            $A.error("popStack has not completed after 15 loops");
        }
    }

    // Force our stack to nothing.
    lastName = this.auraStack.pop();
    if (lastName !== tmppush) {
        $A.error("Broken stack: popped "+tmppush+" expected "+lastName+", stack = "+auraStack);
    }
};

/**
 * A utility to handle events passed back from the server.
 */
$A.ns.AuraClientService.prototype.parseAndFireEvent = function(evtObj) {
    var descriptor = evtObj["descriptor"];

    if (evtObj["eventDef"]) {
        // register the event with the EventDefRegistry
        eventService.getEventDef(evtObj["eventDef"]);
    }

    if (eventService.hasHandlers(descriptor)) {
        var evt = $A.getEvt(descriptor);
        if (evtObj["attributes"]) {
            evt.setParams(evtObj["attributes"]["values"]);
        }

        evt.fire();
    }
};

/**
 * Reset the token.
 *
 * @param {Object}
 *            newToken Refresh the current token with a new one.
 * @memberOf $A.ns.AuraClientService
 * @private
 */
$A.ns.AuraClientService.prototype.resetToken = function(newToken) {
    this._token = newToken;
    this.saveTokenToStorage();
};

/**
 * Create an action group with a callback.
 *
 * The callback will be called when all actions are complete within the group.
 *
 * @param actions
 *      {Array.<Action>} the array of actions.
 * @param scope
 *      {Object} the scope for the function.
 * @param callback
 *      {function} The callback function
 */
$A.ns.AuraClientService.prototype.makeActionGroup = function(actions, scope, callback) {
    var group = undefined;
    $A.assert($A.util.isArray(actions), "makeActionGroup expects a list of actions, but instead got: " + actions);
    if (callback !== undefined) {
        $A.assert($A.util.isFunction(callback),
                "makeActionGroup expects the callback to be a function, but instead got: " + callback);
        group = new ActionCallbackGroup(actions, scope, callback);
    }
    return group;
};

/**
 * Run the actions.
 *
 * This function effectively attempts to submit all pending actions immediately (if
 * there is room in the outgoing request queue). If there is no way to immediately queue
 * the actions, they are submitted via the normal mechanism. Note that this does not change
 * the 'transaction' associated with the current aura stack, so abortable actions might go
 * out in two separate requests without cancelling each other.
 *
 * @param {Array.<Action>}
 *            actions an array of Action objects
 * @param {Object}
 *            scope The scope in which the function is executed
 * @param {function}
 *            callback The callback function to run
 * @memberOf $A.ns.AuraClientService
 * @public
 */
$A.ns.AuraClientService.prototype.runActions = function(actions, scope, callback) {
    var i;

    this.makeActionGroup(actions, scope, callback);
    for (i = 0; i < actions.length; i++) {
        this.actionQueue.enqueue(actions[i]);
    }
    this.processActions();
};

/**
 * Inject a component and set up its event handlers. For Integration
 * Service.
 *
 * FIXME: this should be private.
 *
 * @param {Object} rawConfig the config for the component to be injected
 * @param {String} locatorDomId the DOM id where we should place our element.
 * @param {String} localId the local id for the component to be created.
 * @memberOf $A.ns.AuraClientService
 * @public
 */
$A.ns.AuraClientService.prototype.injectComponent = function(rawConfig, locatorDomId, localId) {
    var config = $A.util.json.resolveRefs(rawConfig);

    // Save off any context global stuff like new labels
    $A.getContext().merge(config["context"]);

    var actionResult = config["actions"][0];
    var action = $A.get("c.aura://ComponentController.getComponent");
    var self = this;

    action.setCallback(action, function(a) {
        var element = $A.util.getElement(locatorDomId);

        // Check for bogus locatorDomId
        var errors;
        if (!element) {
            // We have no other place to display this
            // critical failure - fallback to the
            // document.body
            element = document.body;
            errors = [
                    "Invalid locatorDomId specified - no element found in the DOM with id=" + locatorDomId
            ];
        } else {
            errors = a.getState() === "SUCCESS" ? undefined : action.getError();
        }

        var componentConfig;
        if (!errors) {
            componentConfig = a.getReturnValue();
        } else {
            //
            // Make sure we clear any configs associated with the action.
            //
            $A.getContext().clearComponentConfigs(a.getId());
            //
            // Display the errors in a ui:message instead
            //
            componentConfig = self.createIntegrationErrorConfig(errors);
        }

        componentConfig["localId"] = localId;

        var root = $A.getRoot();
        var c = $A.componentService["newComponentDeprecated"](componentConfig, root);

        if (!errors) {
            // Wire up event handlers
            self.addComponentHandlers(c, config["actionEventHandlers"]);
        }

        var body = root.get("v.body");
        body.push(c);
        // Do not let Aura consider this initial setting into the surrogate app as a candiadate for rerendering
        root.set("v.body",body,true);

        $A.render(c, element);

        $A.afterRender(c);
    });

    action.updateFromResponse(actionResult);
    action.finishAction($A.getContext());
};

/**
 * Create error component config to display integration service errors
 *
 * @param {(String|String[])} errorText
 * @returns {Object} error config for ui:message
 */
$A.ns.AuraClientService.prototype.createIntegrationErrorConfig = function(errorText) {
    return {
        "componentDef" : {
            "descriptor" : "markup://ui:message"
        },

        "attributes" : {
            "values" : {
                "title" : "Aura Integration Service Error",
                "severity" : "error",
                "body" : [
                    {
                        "componentDef" : {
                            "descriptor" : "markup://ui:outputText"
                        },

                        "attributes" : {
                            "values" : {
                                "value" : $A.util.json.encode(errorText)
                            }
                        }
                    }
                ]
            }
        }
    };
};

/**
 * Used within async callback for AIS.
 *
 * @param {Component} component - component
 * @param {String} locatorDomId - element id
 * @param {Object} [actionEventHandlers] - event handlers
 */
$A.ns.AuraClientService.prototype.renderInjection = function(component, locatorDomId, actionEventHandlers) {
    var error = null,
        hostEl = document.getElementById(locatorDomId);

    if (!hostEl) {
        error = "Invalid locatorDomId specified - no element found in the DOM with id=" + locatorDomId;
        hostEl = document.body;
    }

    if (component.isInstanceOf("aura:text")) {
        // check for component creation error
        error = component.get("v.value");
    }

    if (error) {
        // create same messaging as injectComponent
        var errorConfig = this.createIntegrationErrorConfig(error);
        errorConfig["localId"] = component.getLocalId();
        component = $A.componentService["newComponentDeprecated"](errorConfig, $A.getRoot());
    }

    this.addComponentHandlers(component, actionEventHandlers);
    $A.render(component, hostEl);
    $A.afterRender(component);
};

/**
 * Use async created component for integration service
 *
 * @param {Object} config - component def config
 * @param {String} locatorDomId - id of element to inject component
 * @param {Object} [eventHandlers] - handlers of registered event
 */
$A.ns.AuraClientService.prototype.injectComponentAsync = function(config, locatorDomId, eventHandlers) {
    var acs = this;
    $A.componentService.newComponentAsync(undefined, function(component) {
        acs.renderInjection(component, locatorDomId, eventHandlers);
    }, config, $A.getRoot(), false, false, true);
    //
    // Now we go ahead and stick a label load on the request.
    //
    var labelAction = $A.get("c.aura://ComponentController.loadLabels");
    labelAction.setCallback(this, function(a) {});
    acs.enqueueAction(labelAction);
};

/**
 * Add handlers of registered events for AIS
 *
 * @param {Component} component - component
 * @param {Object} [actionEventHandlers] - handlers of registered events
 */
$A.ns.AuraClientService.prototype.addComponentHandlers = function(component, actionEventHandlers) {
    if (actionEventHandlers) {
        var containerValueProvider = {
            get : function(functionName) {
                return {
                    run : function(evt) {
                        window[functionName](evt);
                    },
                    runDeprecated : function(evt) {
                        window[functionName](evt);
                    }
                };
            }
        };

        for (var evt in actionEventHandlers) {
            component.addHandler(evt, containerValueProvider, actionEventHandlers[evt]);
        }
    }
};

/**
 * Return whether Aura believes it is online.
 * Immediate and future communication with the server may fail.
 * @memberOf $A.ns.AuraClientService
 * @return {Boolean} Returns true if Aura believes it is online; false otherwise.
 * @public
 */
$A.ns.AuraClientService.prototype.isConnected = function() {
    return !this._isDisconnected;
};

/**
 * Queue an action for execution after the current event loop has ended.
 *
 * This function must be called from within an event loop.
 *
 * @param {Action} action the action to enqueue
 * @param {Boolean} background Set to true to run the action in the background, otherwise the value of action.isBackground() is used.
 * @memberOf $A.ns.AuraClientService
 * @public
 */
// TODO: remove boolean trap http://ariya.ofilabs.com/2011/08/hall-of-api-shame-boolean-trap.html
$A.ns.AuraClientService.prototype.enqueueAction = function(action, background) {
    $A.assert(!$A.util.isUndefinedOrNull(action), "EnqueueAction() cannot be called on an undefined or null action.");
    $A.assert(!$A.util.isUndefined(action.auraType)&& action.auraType==="Action", "Cannot call EnqueueAction() with a non Action parameter.");

    if (background) {
        action.setBackground();
    }

    this.actionQueue.enqueue(action);
};

/**
 * Defer the action by returning a Promise object.
 * Configure your action excluding the callback prior to deferring.
 * The Promise is a thenable, meaning it exposes a 'then' function for consumers to chain updates.
 *
 * @public
 * @param {Action} action - target action
 * @return {Promise} a promise which is resolved or rejected depending on the state of the action
 */
$A.ns.AuraClientService.prototype.deferAction = function (action) {
    var acs = this;
    var promise = new Promise(function(success, error) {

        action.wrapCallback(acs, function (a) {
            if (a.getState() === 'SUCCESS') {
                success(a.getReturnValue());
            }
            else {
                // Reject the promise as it was not successful.
                // Give the user a somewhat useful object to use on reject.
                error({ state: a.getState(), action: a });
            }
        });

        acs.enqueueAction(action);
    });

    return promise;
};

/**
 * Gets whether or not the Aura "actions" cache exists.
 * @returns {Boolean} true if the Aura "actions" cache exists.
 */
$A.ns.AuraClientService.prototype.hasActionStorage = function() {
    return !!Action.getStorage();
};

/**
 * Checks to see if an action is currently being stored (by action descriptor and parameters).
 *
 * @param {String} descriptor - action descriptor.
 * @param {Object} params - map of keys to parameter values.
 * @param {Function} callback - called asynchronously after the action was looked up in the cache. Fired with a
 * single parameter, isInStorge {Boolean} - representing whether the action was found in the cache.
 */
$A.ns.AuraClientService.prototype.isActionInStorage = function(descriptor, params, callback) {
    var storage = Action.getStorage();
    callback = callback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        callback(false);
        return;
    }

    storage.get(Action.getStorageKey(descriptor, params))
        .then(function(response) {
            $A.run(function() {
                callback(!!response && !!response.value && !response.isExpired);
            });
        });
};

/**
 * Resets the cache cleanup timer for an action.
 *
 * @param {String} descriptor - action descriptor.
 * @param {Object} params - map of keys to parameter values.
 * @param {Function} callback - called asynchronously after the action was revalidated. Called with a single
 * parameter, wasRevalidated {Boolean} - representing whether the action was found in the cache and
 * successfully revalidated.
 */
$A.ns.AuraClientService.prototype.revalidateAction = function(descriptor, params, callback) {
    var storage = Action.getStorage();
    callback = callback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        callback(false);
        return;
    }

    var actionKey = Action.getStorageKey(descriptor, params);
    storage.get(actionKey).then(function(response) {
        if (!!response && !!response.value) {
            storage.put(actionKey, response.value)
                .then(function() { callback(true); });
        } else {
            callback(false);
        }
    });
};

/**
 * Clears an action out of the action cache.
 *
 * @param descriptor {String} action descriptor.
 * @param params {Object} map of keys to parameter values.
 * @param successCallback {Function} called after the action was invalidated. Called with true if the action was
 * successfully invalidated and false if the action was invalid or was not found in the cache.
 * @param errorCallback {Function} called if an error occured during execution
 */
$A.ns.AuraClientService.prototype.invalidateAction = function(descriptor, params, successCallback, errorCallback) {
    var storage = Action.getStorage();
    successCallback = successCallback || this.NOOP;
    errorCallback = errorCallback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        successCallback(false);
        return;
    }

    storage.remove(Action.getStorageKey(descriptor, params))
        .then(function() { successCallback(true); }, errorCallback );
};

/**
 * process the current set of actions, looping if needed.
 *
 * This runs the current action set.
 *
 * @private
 */
$A.ns.AuraClientService.prototype.processActions = function() {
    var actions;
    var processedActions = false;
    var action;

    actions = this.actionQueue.getClientActions();
    if(actions.length > 0) {
        this.runClientActions(actions);
        processedActions = true;
    }

    //
    // Only send forground actions if we have something that
    // needs to be sent (force boxcar will delay this)
    // FIXME: we need measures of how long this delays things.
    //
    if (this.actionQueue.needXHR() && this.foreground.start()) {
        actions = this.actionQueue["getServerActions"]();
        if (actions.length > 0) {
            this.request(actions, this.foreground);
            processedActions = true;
        } else {
            this.foreground.cancel();
        }
    }

    if (this.background.start()) {
        action = this.actionQueue.getNextBackgroundAction();
        if (action !== null) {
            this.request([action], this.background);
            processedActions = true;
        } else {
            this.background.cancel();
        }
    }
    return processedActions;
};

exp($A.ns.AuraClientService.prototype,
    "initHost", $A.ns.AuraClientService.prototype.initHost,
    "init", $A.ns.AuraClientService.prototype.init,
    "initDefs", $A.ns.AuraClientService.prototype.initDefs,
    "loadApplication", $A.ns.AuraClientService.prototype.loadApplication,
    "loadComponent", $A.ns.AuraClientService.prototype.loadComponent,
    "enqueueAction", $A.ns.AuraClientService.prototype.enqueueAction,
    "deferAction", $A.ns.AuraClientService.prototype.deferAction,
    "runActions", $A.ns.AuraClientService.prototype.runActions,
    "throwExceptionEvent", $A.ns.AuraClientService.prototype.throwExceptionEvent,
    "resetToken", $A.ns.AuraClientService.prototype.resetToken,
    "hardRefresh", $A.ns.AuraClientService.prototype.hardRefresh,
    "setOutdated", $A.ns.AuraClientService.prototype.setOutdated,
    "injectComponent", $A.ns.AuraClientService.prototype.injectComponent,
    "injectComponentAsync", $A.ns.AuraClientService.prototype.injectComponentAsync,
    "isConnected", $A.ns.AuraClientService.prototype.isConnected,
    "setConnected", $A.ns.AuraClientService.prototype.setConnected,
    "isActionInStorage", $A.ns.AuraClientService.prototype.isActionInStorage,
    "revalidateAction", $A.ns.AuraClientService.prototype.revalidateAction,
    "invalidateAction", $A.ns.AuraClientService.prototype.invalidateAction
);
