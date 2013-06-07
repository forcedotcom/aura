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
var priv = {
    token : null,
    auraStack : [],
    host : "",
    requestQueue : [],
    inRequest : false,
    loadEventQueue : [],
    appcacheDownloadingEventFired : false,
    isOutdated : false,
    isUnloading : false,
    initDefsObservers : [],
    isDisconnected : false,
    actionQueue : [],

    /**
     * Take a json (hopefully) response and decode it. If the input is invalid JSON, we try to handle it gracefully.
     */
    checkAndDecodeResponse : function(response, noStrip) {
        if (priv.isUnloading) {
            return null;
        }

        var storage = Action.prototype.getStorage();
        var e;

        // failure to communicate with server
        if (priv.isDisconnectedOrCancelled(response)) {
            if (priv.isDisconnected) {
                return null;
            }

            e = $A.get("e.aura:connectionLost");
            if (e) {
                priv.isDisconnected = true;
                e.fire();
            } else {
                // looks like no definitions loaded yet
                alert("Connection lost");
            }

            return null;
        }

        //
        // If a disconnect event was previously fired, fire a connection
        // restored event
        // now that we have a response from a server.
        //
        if (priv.isDisconnected) {
            e = $A.get("e.aura:connectionResumed");
            if (e) {
                priv.isDisconnected = false;
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
            aura.error(text);
            return null;
        }

        //
        // server-side explosion. The new message is one where there is an /*ERROR*/ appended.
        // this allows us to deal with the fact that we can get errors after the send has started.
        // Of course, we also have the problem that we might not have valid JSON at all, in which case
        // we have further problems...
        //
        if ((response["status"] != 200)
                || (text.length > 9 && text.charAt(text.length - 9) == "/" && 
            				text.charAt(text.length - 8) == "*" && 
            				text.charAt(text.length - 7) == "E" && 
            				text.charAt(text.length - 6) == "R" && 
            				text.charAt(text.length - 5) == "R" && 
            				text.charAt(text.length - 4) == "O" && 
            				text.charAt(text.length - 3) == "R" && 
            				text.charAt(text.length - 2) == "*" && 
            				text.charAt(text.length - 1) == "/")) {
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
            var resp = aura.util.json.decode(text, true);

            // if the error on the server is meant to trigger a client-side
            // event...
            if (aura.util.isUndefinedOrNull(resp)) {
                //#if {"excludeModes" : ["PRODUCTION"]}
                aura.error("Communication error, invalid JSON: " + text);
                //#end
                //#if {"modes" : ["PRODUCTION"]}
                aura.error("Communication error, please retry or reload the page");
                //#end
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
                //#if {"excludeModes" : ["PRODUCTION"]}
                if (resp["message"] && resp["stack"]) {
                    aura.error(resp["message"] + "\n" + resp["stack"]);
                } else {
                    aura.error("Communication error, invalid JSON: " + text);
                }
                //#end
                //#if {"modes" : ["PRODUCTION"]}
                if (resp["message"]) {
                    aura.error(resp["message"]);
                } else {
                    aura.error("Communication error, please retry or reload the page");
                }
                //#end
                return null;
            }
        }
        //
        // strip off the while(1) at the beginning
        //
        if (!noStrip === true && text.charAt(0) == "w") {
            text = "//" + text;
        }

        var responseMessage = aura.util.json.decode(text, true);
        if (aura.util.isUndefinedOrNull(responseMessage)) {
            //#if {"excludeModes" : ["PRODUCTION"]}
            aura.error("Communication error, invalid JSON: " + text);
            //#end
            //#if {"modes" : ["PRODUCTION"]}
            aura.error("Communication error, please retry or reload the page");
            //#end
            return null;
        }
        return responseMessage;
    },

    throwExceptionEvent : function(resp) {
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
                aura.util.json.decodeString(resp["defaultHandler"])();
            } catch (e) {
                aura.error("Error in defaultHandler for event: " + descriptor, e);
            }
        }
    },

    fireDoneWaiting : function() {
        priv.fireLoadEvent("e.aura:doneWaiting");
    },

    findGroupAndAction : function(actionGroups, actionId) {
        for ( var i = 0; i < actionGroups.length; i++) {
            actionGroup = actionGroups[i];

            var actions = actionGroup.actions;
            for ( var j = 0; j < actions.length; j++) {
                action = actions[j];
                if (actionId === action.getId()) {
                    return {
                        group : actionGroup,
                        action : action
                    };
                }
            }
        }

        return null;
    },

    actionCallback : function(response, actionGroups, num) {
        var responseMessage = this.checkAndDecodeResponse(response);
        var queue = this.requestQueue;

        var errors = [];
        if (this.auraStack.length > 0) {
            $A.error("Action callback called on non-empty stack "+this.auraStack);
            this.auraStack = [];
        }
        $A.clientService.pushStack("actionCallback");
        if (responseMessage) {
            var token = responseMessage["token"];
            if (token) {
                priv.token = token;
            }

            var ctx = responseMessage["context"];
            $A.getContext().join(ctx);

            //Look for any Client side event exceptions
            var events = responseMessage["events"];
            if (events) {
                for ( var en = 0, len = events.length; en < len; en++) {
                    $A.clientService.parseAndFireEvent(events[en]);
                }
            }

            var actionResponses = responseMessage["actions"];
            //Process each action and its response
            for ( var r = 0; r < actionResponses.length; r++) {
                var actionResponse = actionResponses[r];

                var actionGroupNumber;
                var action;
                if (actionResponse["storable"] === true) {
                    // Create a client side action instance to go with the
                    // server created action response
                    var descriptor = actionResponse["action"];
                    var actionDef = $A.services.component.getActionDef({
                        descriptor : descriptor
                    });
                    action = actionDef.newInstance();

                    action.setStorable();
                    action.setParams(actionResponse["params"]);

                    actionGroupNumber = this.newestAbortableGroup;
                } else {
                    var groupAndAction = this.findGroupAndAction(actionGroups, actionResponse.id);
                    aura.assert(groupAndAction, "Unable to find action for action response " + actionResponse.id);

                    actionGroupNumber = groupAndAction.group.number;
                    action = groupAndAction.action;
                }

                try {
                    if (!action.isAbortable() || this.newestAbortableGroup === actionGroupNumber) {
                        action.complete(actionResponse);
                    }
                } catch (e) {
                    errors.push(e);
                }
            }

            for ( var i = 0; i < actionGroups.length; i++) {
                actionGroup = actionGroups[i];

                actionGroup.callback.call(actionGroup.scope || window, {
                    "errors" : errors
                });

                actionGroup.status = "done";
            }
        } else if (priv.isDisconnectedOrCancelled(response) && !priv.isUnloading) {
            for ( var n = 0; n < actionGroups.length; n++) {
                actionGroup = actionGroups[n];
                actions = actionGroup.actions;
                for ( var m = 0; m < actions.length; m++) {
                    try {
                        action = actions[m];
                        if (!action.isAbortable() || this.newestAbortableGroup === actionGroup.number) {
                            action.complete({
                                returnValue : null,
                                state : "INCOMPLETE"
                            });
                        }
                    } catch (e2) {
                        errors.push(e2);
                    }
                }

                actionGroup.callback.call(actionGroup.scope || window, {
                    "errors" : errors
                });

                actionGroup.status = "done";
            }
        }
        $A.clientService.popStack("actionCallback");

        this.inRequest = false;
        priv.fireDoneWaiting();
        var queueCopy = queue;
        queue = [];

        for ( var p = 0; p < queueCopy.length; p++) {
            actionGroup = queueCopy[p];
            if (actionGroup.status !== "done") {
                queue.push(actionGroup);
            }
        }

        this.requestQueue = queue;
        var that = this;
        $A.endMark("Completed Action Callback - XHR " + num);

        //#if {"modes" : ["PTEST"]}
        // if there are no more actions for a particular transaction and if
        // onLoad has already been fired
        if (queueCopy.length == 1 && $A.getContext().getTransaction() !== 0) {
            // if the current action is a list, a subsequent action follows to
            // fetch
            // the detail, so skip this for next time
            // a bit of a hack to capture the getDetail action as well
            if (queueCopy[0].actions[0].getDef().name.indexOf("Overview") == -1 && (queueCopy[0].actions[0].getDef().name.indexOf("List") == -1 || queueCopy[0].actions[0].getDef().name.indexOf("RelatedList") !== -1)) {
                // end the previously started transaction
                $A.endTransaction($A.getContext().getTransaction());
                // set the transaction using #hashtag from the URL and the
                // concatenated action names as the unique ID
                var tokenJson = $A.historyService.get();
                $A.updateTransaction("txn_" + $A.getContext().getTransaction(), "txn_" + tokenJson["token"] + $A.getContext().getTransactionName());
                // update the vars and set the beaconData to piggyback on the next XHR call
                $A.setBeaconData($A.toJson());
            }
        }
        //#end
        setTimeout(function() {
            that.doRequest();
        }, 1);
    },

    actionGroupCounter : 0,

    /**
     * Serialize requests to the aura server from this client. AuraContext.num needs to be synchronized across all
     * requests, and pending a better fix, this works around that issue.
     */
    request : function(actions, scope, callback, exclusive) {
        $A.mark("AuraClientService.request");
        $A.mark("Action Request Prepared");
        var actionGroup = this.actionGroupCounter++;
        $A.mark("Action Group " + actionGroup + " enqueued");

        var fireDoneWaiting = false;
        var actionsToSend = [];
        var actionsToComplete = [];

        // Aura Storage.get() requires an async/callback invocation flow
        var clientService = this;
        var actionsToCollect = actions.length;
        var actionCollected = function() {
            if (--actionsToCollect <= 0) {
                // We're done waiting for pending async operations to complete,
                // let's light this candle!
                if (fireDoneWaiting) {
                    setTimeout(function() {
                        priv.fireDoneWaiting();
                    }, 1);
                }

                if (actionsToComplete.length > 0) {
                    var that = this;
                    setTimeout(function() {
                        for ( var n = 0; n < actionsToComplete.length; n++) {
                            var info = actionsToComplete[n];
                            info.action.complete(info.response);
                        }

                        clientService.fireDoneWaiting();
                    }, 300);
                }

                if (actionsToSend.length > 0) {
                    // clientService.requestQueue reference is mutable
                    clientService.requestQueue.push({
                        actions : actionsToSend,
                        scope : scope,
                        callback : callback,
                        number : actionGroup,
                        exclusive : exclusive
                    });
                    $A.endMark("Action Group " + actionGroup + " enqueued");
                    clientService.doRequest();
                }
            }
        };

        for ( var i = 0; i < actions.length; i++) {
            var action = actions[i];
            $A.assert(action.def.isServerAction(), "RunAfter() cannot be called on a client action. Use run() on a client action instead.");

            // For cacheable actions check the storage service to see if we
            // already have a viable cached action response we can complete
            // immediately
            var storage = Action.prototype.getStorage();
            if (action.isStorable() && storage) {
                var key = action.getStorageKey();

                storage.get(key, this.createResultCallback(action, scope, actionGroup, callback, actionsToComplete, actionsToSend, actionCollected));
            } else {
                this.collectAction(action, scope, actionGroup, callback, actionsToSend, actionCollected);
            }
        }
    },

    createResultCallback : function(action, scope, actionGroup, callback, actionsToComplete, actionsToSend, actionCollected) {
        var that = this;
        return function(response) {
            if (response) {
                actionsToComplete.push({
                    action : action,
                    response : response
                });

                actionCollected();
            } else {
                that.collectAction(action, scope, actionGroup, callback, actionsToSend, actionCollected);
            }
        };
    },

    collectAction : function(action, scope, actionGroup, callback, actionsToSend, actionCollectedCallback) {
        if (action.isAbortable()) {
            this.newestAbortableGroup = actionGroup;
        }

        if (action.isExclusive()) {
            action.setExclusive(false);
            this.request([
                action
            ], scope, callback, true);
        } else {
            actionsToSend.push(action);
        }

        actionCollectedCallback();
    },

    doRequest : function() {
        var queue = this.requestQueue;
        if (!this.inRequest && queue.length > 0) {
            this.inRequest = true;
            var num = aura.getContext().incrementNum();

            var actionsToRequest = [];
            var actionGroups = [];

            for ( var j = 0; j < queue.length; j++) {
                var actionGroup = queue[j];

                var status = actionGroup.status;
                if (status !== "requested" && status !== "done") {
                    actionGroups.splice(0, 0, actionGroup);
                    var actions = actionGroup.actions;
                    var requestedActions = [];
                    var hasActionsToRequest = false;
                    for ( var m = 0; m < actions.length; m++) {
                        var action = actions[m];
                        if (!action.isAbortable() || this.newestAbortableGroup === actionGroup.number) {
                            hasActionsToRequest = true;
                            requestedActions.push(action);
                            // Chained actions are transported and executed by
                            // custom code
                            if (!action.isChained()) {
                             //#if {"modes" : ["PTEST"]}
                                $A.getContext().updateTransactionName(action.getDef().name);
                             //#end
                                actionsToRequest.push(action);
                            }
                        }
                    }
                    actionGroup.actions = requestedActions;

                    actionGroup.status = hasActionsToRequest ? "done" : "requested";
                    if (actionGroup.exclusive === true) {
                        break;
                    }
                }
            }
            var requestConfig = {
                "url" : priv.host + "/aura",
                "method" : "POST",
                "scope" : this,
                "callback" : function(response) {
                    this.actionCallback(response, actionGroups, num);
                },
                "params" : {
                    "message" : aura.util.json.encode({
                        "actions" : actionsToRequest
                    }),
                    "aura.token" : priv.token,
                    "aura.context" : $A.getContext().encodeForServer(),
                    "aura.num" : num
                    //#if {"modes" : ["PTEST"]}
                    ,
                    "beaconData" : $A.getBeaconData()
                   //#end
                }
            };

            // clear the beaconData
            //#if {"modes" : ["PTEST"]}
            $A.clearBeaconData();
            //#end

            $A.endMark("Action Request Prepared");
            $A.util.transport.request(requestConfig);
            setTimeout(function() {
                $A.get("e.aura:waiting").fire();
            }, 1);
        }
    },

    hardRefresh : function() {
        var url = location.href;
        if (!priv.isManifestPresent() || url.indexOf("?nocache=") > -1) {
            location.reload(true);
            return;
        }
        var params = "?nocache=" + encodeURIComponent(url);

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

        location.href = url + params;
    },

    flushLoadEventQueue : function() {
        if (priv.loadEventQueue) {
            for ( var i = 0, len = priv.loadEventQueue.length; i < len; i++) {
                var eventName = priv.loadEventQueue[i];
                $A.get(eventName).fire();
            }
        }
        priv.loadEventQueue = [];
    },

    fireLoadEvent : function(eventName) {
        var e = $A.get(eventName);
        if (e) {
            e.fire();
        } else {
            priv.loadEventQueue.push(eventName);
        }
    },

    isDevMode : function() {
        var context = $A.getContext();
        return !$A.util.isUndefined(context) && context.getMode() === "DEV";
    },

    getManifestURL : function() {
        var htmlNode = document.body.parentNode;
        return htmlNode ? htmlNode.getAttribute("manifest") : null;
    },

    isManifestPresent : function() {
        return !!priv.getManifestURL();
    },

    handleAppcacheChecking : function(e) {
        if (priv.isDevMode()) {
            // TODO IBOGDANOV Why are you checking in commented out code like
            // this???
            /*
             * setTimeout( function(){ if(window.applicationCache.status === window.applicationCache.CHECKING){
             * priv.showProgress(1); } }, 2000 );
             */
        }
    },

    handleAppcacheUpdateReady : function(event) {
        if (window.applicationCache.swapCache) {
            window.applicationCache.swapCache();
        }

        // Clear out localStorage and sessionStorage to insure nothing that
        // might depend
        // on out of date stuff is left lying about
        if (window.localStorage) {
            window.localStorage.clear();
        }

        if (window.sessionStorage) {
            window.sessionStorage.clear();
        }

        location.reload(true);
    },

    handleAppcacheError : function(e) {
        if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }
        if (window.applicationCache && (window.applicationCache.status === window.applicationCache.UNCACHED || window.applicationCache.status === window.applicationCache.OBSOLETE)) {
            return;
        }
        var manifestURL = priv.getManifestURL();
        if (priv.isDevMode()) {
            priv.showProgress(-1);
        }

        if (manifestURL) {
            setTimeout(function() {
                $A.util.transport.request({
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

        if (priv.appcacheDownloadingEventFired && priv.isOutdated) {
            // No one should get here.
            $A.log("Outdated.");
        }
    },

    handleAppcacheDownloading : function(e) {
        if (priv.isDevMode()) {
            var progress = Math.round(100 * e.loaded / e.total);
            priv.showProgress(progress + 1);
        }

        priv.appcacheDownloadingEventFired = true;
    },

    handleAppcacheProgress : function(e) {
        if (priv.isDevMode()) {
            var progress = Math.round(100 * e.loaded / e.total);
            priv.showProgress(progress);
        }
    },

    handleAppcacheNoUpdate : function(e) {
        if (priv.isDevMode()) {
            priv.showProgress(100);
        }
    },

    handleAppcacheCached : function(e) {
        priv.showProgress(100);
    },

    handleAppcacheObsolete : function(e) {
        priv.hardRefresh();
    },

    showProgress : function(progress) {
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
    },

    setOutdated : function() {
        priv.isOutdated = true;
        var appCache = window.applicationCache;
        if (!appCache || (appCache && appCache.status === appCache.UNCACHED)) {
            location["reload"](true);
        } else if (appCache.status === appCache.OBSOLETE) {
            location.reload(true);
        } else if (appCache.status !== appCache.CHECKING && appCache.status !== appCache.DOWNLOADING) {
            appCache.update();
        }
    },

    isDisconnectedOrCancelled : function(response) {
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
    }
};

$A.ns.Util.prototype.on(window, "beforeunload", function(event) {
    if (!$A.util.isIE) {
        priv.isUnloading = true;
        priv.requestQueue = [];
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

if (window.applicationCache && window.applicationCache.addEventListener) {
    window.applicationCache.addEventListener("checking", priv.handleAppcacheChecking, false);
    window.applicationCache.addEventListener("downloading", priv.handleAppcacheDownloading, false);
    window.applicationCache.addEventListener("updateready", priv.handleAppcacheUpdateReady, false);
    window.applicationCache.addEventListener("error", priv.handleAppcacheError, false);
    window.applicationCache.addEventListener("progress", priv.handleAppcacheProgress, false);
    window.applicationCache.addEventListener("noupdate", priv.handleAppcacheNoUpdate, false);
    window.applicationCache.addEventListener("cached", priv.handleAppcacheCached, false);
    window.applicationCache.addEventListener("obsolete", priv.handleAppcacheObsolete, false);
}
