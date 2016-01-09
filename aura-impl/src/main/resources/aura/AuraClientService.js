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
 * AuraXHR: struct used to represent a connection.
 *
 * @private
 * @constructor
 */
Aura.Services.AuraClientServiceMarker = 0;

Aura.Services.AuraClientService$AuraXHR = function AuraXHR() {
    this.length = 0;
    this.marker = 0;
    this.request = undefined;
    this.actions = {};
    this.transactionId = undefined;
};

/**
 * Reset the xhr.
 */
Aura.Services.AuraClientService$AuraXHR.prototype.reset = function() {
    this.request = undefined;
    this.actions = {};
};

/**
 * add an action.
 */
Aura.Services.AuraClientService$AuraXHR.prototype.addAction = function(action) {
    if (action) {
        if (this.actions[""+action.getId()]) {
            throw new $A.auraError("Adding duplicate action");
        }
        this.actions[""+action.getId()] = action;
    }
};

/**
 * get an action for a response.
 */
Aura.Services.AuraClientService$AuraXHR.prototype.getAction = function(id) {
    var action = this.actions[id];

    if (action) {
        this.actions[id] = undefined;
    }
    return action;
};

/**
 * A handy structure to hold data.
 *
 * @constructor
 * @private
 */
Aura.Services.AuraClientService$AuraActionCollector = function AuraActionCollector() {
    // Collected client actions for execution.
    this.clientActions = [];
    this.clientIndex = 0;

    // collected server actions to send.
    this.actionsToCollect = 0;
    this.collected = [];

    // collected server actions to complete (stored)
    this.actionsToComplete = [];
    this.completionIndex = 0;

    // server actions completed.
    this.actionsCompleted = 0;
};


/**
 * @description The Aura Client Service.
 *
 * There be dragons here.
 *
 * Manage the queue of actions sent to the server.
 *
 * Abortable actions are handled via three variables:
 *  (1) lastTransactionId - The abortable transaction that should be executed
 *  (2) nextTransactionId - used to track the next abortable group to be created.
 *  (3) currentTransactionId - if we are executing in context of an abortable group, this is the group to use.
 *
 * Queue Processing Notes:
 *  * The queue is processed synchronously, but almost all of the interesting functionily occurs asynchronously.
 *  * client actions are run in a single flow of setTimeout calls.
 *  * storable server actions get processed in the "then" clause of the promise
 *  * non-storable server actions are processed synchronously.
 *
 * Input conditions:
 * We have a queue of actions that are inserted vie enqueueAction.
 *
 * Dangers:
 *  * Race conditions.
 *  * caboose actions.
 *  * problems with storage.
 *  * complexity of code due to asynchronicity.
 *
 * Tradeoffs:
 *  * number of actions boxcarred.
 *  * actions in flight
 *  * sending XHR early vs. late.
 *
 * Processing Loop:
 *  * gather actions into a collector.
 *  * walk each action, queueing up server actions to retrieve from storage and client actions to execute.
 *  * execute client actions with setTimeout(0) to allow server actions to complete.
 *  * As server actions come back from storage, queue up for execution, and queue refresh actions to refresh.
 *  * After all actions collect, check for further actions in the queue, restart loop if there are some.
 *
 * @constructor
 */
AuraClientService = function AuraClientService () {
    this._host = "";
    this._token = null;
    this._isDisconnected = false;
    this._useBootstrapCache = true;
    this.auraStack = [];
    this.appcacheDownloadingEventFired = false;
    this.isOutdated = false;
    this.initDefsObservers = [];
    this.finishedInitDefs = false;
    this.protocols={"layout":true};
    this.namespaces={};
    this.lastSendTime = Date.now();

    // token storage key should not be changed because external client may query independently
    this._tokenStorageKey = "$AuraClientService.token$";

    // cookie name to force getApplication to the server (to skip cache). done as a cookie so the server
    // can set this flag if ever required.
    this._disableBootstrapCacheCookie = "auraDisableBootstrapCache";

    this.NOOP = function() {};

    Aura.Utils.Util.prototype.on(window, "load", function() {
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

    // safe eval worker enables the page to run arbitrary evaluation,
    // this iframe is hidden, and not accessible via keyboard navigation, and
    // it adds two new globals: `$$safe-eval` and `$$safe-eval-compat$$`
    // this block adds some basic error checks on the iframe while specific
    // routines could opt-in to wait for the iframe to be ready as well.
    var safeEvalWorker = document.getElementById("safeEvalWorker");
    if (!safeEvalWorker) {
        // note: the locker worker is required to be inserted before aura fw script tag.
        throw new $A.auraError("Aura(): Failed to locate the locker worker.");
    }
    if (!window['$$safe-eval$$']) {
        Aura.Utils.Util.prototype.on(safeEvalWorker, "load", function () {
            if (!window["$$safe-eval$$"]) {
                throw new $A.auraError("Aura(): Failed to initialize locker worker.");
            }
        });
        Aura.Utils.Util.prototype.on(safeEvalWorker, 'error', function () {
            throw new $A.auraError("Aura(): Failed to load locker worker.");
        });
    }

    var auraXHR = new Aura.Services.AuraClientService$AuraXHR();
    this.availableXHRs = [ auraXHR ];
    this.allXHRs = [ auraXHR ];
    this.actionStoreMap = {};
    this.collector = undefined;
    // FIXME: this will go away in iteration 3.
    this.setQueueSize(4);

    this.actionsQueued = [];
    this.actionsDeferred = [];

    // guess at xhr type.
    if (window.XMLHttpRequest) {
        this.httpType = 'generic';
    } else {
        this.httpType = undefined;
    }

    this._disconnected = undefined;

    //
    // Transactions
    //
    this.nextTransactionId = 1;
    this.currentTransactionId = undefined;
    this.lastTransactionId = 1;

    //
    // Option to send stored actions after the XHR send. version 33 behaviour is false
    //
    this.optionStoredAfterSend = false;
    //
    // Run client actions synchronously. This is the previous behaviour.
    //
    this.optionClientSynchronous = true;

    this.handleAppCache();

};

/**
 * set the queue size.
 *
 * This is a one time set for the queue size. Any further attempts will be ignored.
 * This should become a configuration parameter at some point.
 *
 * @private
 */
AuraClientService.prototype.setQueueSize = function(queueSize) {
    var auraXHR;
    if (this.allXHRs.length === 1) {
        for (var i = 1; i < queueSize; i+= 1) {
            auraXHR = new Aura.Services.AuraClientService$AuraXHR();
            this.availableXHRs.push(auraXHR);
            this.allXHRs.push(auraXHR);
        }
    }
};


/**
 * Take a json (hopefully) response and decode it. If the input is invalid JSON, we try to handle it gracefully.
 *
 * @returns {Object} An object with properties 'status', which represents the status of the response, and potentially
 *          'message', which contains the decoded server response or an error message.
 */
AuraClientService.prototype.decode = function(response, noStrip) {
    var ret = {};

    var e;

    // failure to communicate with server
    if (this.isDisconnectedOrCancelled(response)) {
        this.setConnected(false);
        ret["status"] = "INCOMPLETE";
        return ret;
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
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ret["message"] = "Communication error, invalid JSON: " + text;
        // #end
        // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ret["message"] = "Communication error, please retry or reload the page";
        // #end
        ret["status"] = "ERROR";
    }

    //
    // server-side explosion. The new message is one where there is an /*ERROR*/ appended.
    // this allows us to deal with the fact that we can get errors after the send has started.
    // Of course, we also have the problem that we might not have valid JSON at all, in which case
    // we have further problems...
    //
    var status = response["status"];
    if ((status !== 200) || $A.util.stringEndsWith(text, "/*ERROR*/")) {
        if (status === 200) {
            // if we encountered an exception once the response was committed
            // ignore the malformed JSON
            text = "/*" + text;
        } else if (!noStrip === true && text.charAt(0) === "w") {
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
            ret["message"] = "Communication error, invalid JSON: " + text;
            // #end
            // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            ret["message"] = "Communication error, please retry or reload the page";
            // #end
            ret["status"] = "ERROR";

            // in case stale application cache, handling old exception code
            var appCache = window.applicationCache;
            if (appCache && (appCache.status === appCache.IDLE || appCache.status > appCache.DOWNLOADING)) {
                appCache.update();
            }
            return ret;
        } else if (resp["exceptionEvent"] === true) {
            this.throwExceptionEvent(resp);
            ret["status"] = "ERROR";
            ret["message"] = "Received exception event from server";
            return ret;
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
                ret["message"] = resp["message"] + "\n" + resp["stack"];
            } else {
                ret["message"] = "Communication error, invalid JSON: " + text;
            }
            // #end
            // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
            if (resp["message"]) {
                ret["message"] = resp["message"];
            } else {
                ret["message"] = "Communication error, please retry or reload the page";
            }
            // #end
            ret["status"] = "ERROR";
            return ret;
        }
    }
    //
    // strip off the while(1) at the beginning
    //
    if (!noStrip === true && text.charAt(0) === "w") {
        text = "//" + text;
    }

    var responseMessage = $A.util.json.decode(text);
    if ($A.util.isUndefinedOrNull(responseMessage)) {
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ret["message"] = "Communication error, invalid JSON: " + text;
        // #end
        // #if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ret["message"] = "Communication error, please retry or reload the page";
        // #end
        ret["status"] = "ERROR";
        return ret;
    } else {
        var i;
        // Prevent collision between $Label value provider and serRefId properties (typically "s" and "r").
        if (responseMessage["context"] && responseMessage["context"]["globalValueProviders"]) {
            var saved = [];
            var gvpList = responseMessage["context"]["globalValueProviders"];

            // Filter out providers without refs
            for (i = gvpList.length - 1; i >= 0; i--) {
                if (gvpList[i]["hasRefs"] !== true) {
                    saved.push(gvpList.splice(i, 1)[0]);
                }
            }

            $A.util.json.resolveRefsObject(responseMessage);

            // Restore original provider (order doesn't matter)
            responseMessage["context"]["globalValueProviders"] = gvpList.concat(saved);
        } else {
            $A.util.json.resolveRefsObject(responseMessage);
        }

        if (responseMessage["context"]) {
            $A.componentService.saveDefsToStorage(responseMessage["context"]);
        }
    }

    ret["status"] = "SUCCESS";
    ret["message"] = responseMessage;
    return ret;
};

/**
 * Fire an event exception from the wire.
 *
 * This is published, but only for use in the case of an event exception serialized as JS,
 * not sure if this is important.
 *
 * @param {Object} config The data for the exception event
 * @memberOf AuraClientService
 * @private
 */
AuraClientService.prototype.throwExceptionEvent = function(resp) {
    var evtObj = resp["event"];
    var descriptor = evtObj["descriptor"];
    var values = evtObj["attributes"] && evtObj["attributes"]["values"];

    if (evtObj["eventDef"]) {
        // register the event with the EventDefRegistry
        $A.eventService.createEventDef(evtObj["eventDef"]);
    }

    if ($A.eventService.hasHandlers(descriptor)) {
        var evt = $A.getEvt(descriptor);
        if (evtObj["attributes"]) {
            evt.setParams(values);
        }

        evt.fire();
    } else {
        try {
            $A.util.json.decodeString(resp["defaultHandler"])(values);
        } catch (e) {
            throw new $A.auraError("Error in defaultHandler for event: " + descriptor, e);
        }
    }
};

AuraClientService.prototype.fireDoneWaiting = function() {
    $A.get("e.aura:doneWaiting").fire();
};

/**
 * make the current thread be 'in aura collections'
 *
 * @private
 */
AuraClientService.prototype.setInCollection = function() {
    this.auraStack.push("AuraClientService$collection");
    this.setCurrentTransactionId(this.collector.transactionId);
};

/**
 * release the current thread from 'in aura collections'
 *
 * @private
 */
AuraClientService.prototype.clearInCollection = function() {
    this.setCurrentTransactionId(undefined);
    var name = this.auraStack.pop();
    $A.assert(name === "AuraClientService$collection");
};

AuraClientService.prototype.isDisconnectedOrCancelled = function(response) {
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
 * Get the current transaction ID.
 *
 * This routine selects the transaction id that should be assigned by first selecting currentTransactionId if it
 * is defined, otherwise, we fall back to using nextTransactionId.
 *
 * @private
 */
AuraClientService.prototype.getCurrentTransactionId = function() {
    $A.assert(this.inAuraLoop(), "AuraClientService.getCurrentTransasctionId(): Unable to get transaction ID outside aura loop");
    return this.currentTransactionId;
};

/**
 * Set the current transaction ID.
 *
 * This routine sets the currentTransactionId, and it should always be a previous transaction ID, or things
 * may well go very wrong.
 *
 * @private
 */
AuraClientService.prototype.setCurrentTransactionId = function(abortableId) {
    var tid = undefined;

    if (abortableId !== undefined) {
        $A.assert(this.inAuraLoop(), "AuraClientService.setCurrentTransasctionId(): Unable to set abortable ID outside aura loop");

        tid = parseInt(abortableId, 10);
        $A.assert(tid <= this.nextTransactionId, "AuraClientService.setCurrentTransactionId(): invalid transaction id: "+tid);
        if (tid > this.lastTransactionId) {
            this.lastTransactionId = tid;
        }
    }
    this.currentTransactionId = tid;
};


/**
 * Process a single action/response.
 *
 * Note that it does this inside an $A.run to provide protection against error returns, and to notify the user if an
 * error occurs.
 *
 * @param {Action} action the action.
 * @param {Object} actionResponse the server response.
 * @param {string} key the storage key (may be null).
 * @param {Boolean} store should storable action responses get stored? Set to false when
 *        for duplicate storable actions are deduped on the client.
 * @private
 */
AuraClientService.prototype.singleAction = function(action, actionResponse, key, store) {
    var storage, toStore, needUpdate, errorHandler, tid = this.currentTransactionId, newTid;

    try {
        // Force the transaction id to 'this' action, so that we maintain chains.
        if (action.getAbortableId() !== undefined) {
            this.setCurrentTransactionId(action.getAbortableId());
        }
        newTid = this.currentTransactionId;
        needUpdate = action.updateFromResponse(actionResponse);
        if (action.getAbortableId() === this.lastTransactionId || !action.isAbortable()) {
            if (needUpdate) {
                action.finishAction($A.getContext());
            }
            if (action.isRefreshAction()) {
                action.fireRefreshEvent("refreshEnd", needUpdate);
            }
        } else {
            action.abort();
        }
        if (store) {
            storage = action.getStorage();
        }
        if (storage) {
            errorHandler = action.getStorageErrorHandler();

            if (!key) {
                try {
                    key = action.getStorageKey();
                } catch (e) {
                    if (errorHandler && $A.util.isFunction(errorHandler)) {
                        errorHandler(e);
                    } else {
                        $A.logger.auraErrorHelper(e, action);
                    }
                    return;
                }
            }

            toStore = action.getStored();

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
    } catch (e) {
        $A.logger.auraErrorHelper(e, action);
        throw e;
    } finally {
        if (newTid === this.currentTransactionId || tid) {
            this.currentTransactionId = tid;
        }
    }
};

AuraClientService.prototype.isBB10 = function() {
    var ua = navigator.userAgent;
    return (ua.indexOf("BB10") > 0 && ua.indexOf("AppleWebKit") > 0);
};

AuraClientService.prototype.getManifestURL = function() {
    var htmlNode = document.body.parentNode;
    return htmlNode ? htmlNode.getAttribute("manifest") : null;
};

AuraClientService.prototype.isManifestPresent = function() {
    return !!this.getManifestURL();
};

/**
 * Check to see if an action should be aborted.
 *
 * @param {Action} the action to check.
 * @returns true if the action was aborted
 */
AuraClientService.prototype.maybeAbortAction = function(action) {
    if (action.isAbortable() && action.getAbortableId() !== this.lastTransactionId) {
        // whoops, action is already aborted.
        action.abort();
        return true;
    }
    return false;
};

/**
 * Count the available XHRs, including abortable ones.
 */
AuraClientService.prototype.countAvailableXHRs = function(/*isBackground*/) {
    // FIXME : this needs to figure out what XHRs can be aborted.
    return this.availableXHRs.length;
};

/**
 * Get an available XHR, possibly aborting others.
 *
 * Used for instrumentation
 *
 * This function MUST be called after a call to countAvailableXHRs().
 *
 * @param {Boolean} isBackground is the XHR for a background action.
 */
AuraClientService.prototype.getAvailableXHR = function(isBackground) {
    //FIXME : this needs to abort XHRs.
    if (isBackground && this.availableXHRs.length === 1) {
        // FIXME: this is bogus and will change.
        return null;
                }
    var auraXHR = this.availableXHRs.pop();
    return auraXHR;
};

/**
 * Releas an xhr back in to the pool.
 *
 * @export
 */
AuraClientService.prototype.releaseXHR = function(auraXHR) {
    auraXHR.reset();
    this.availableXHRs.push(auraXHR);
};


/**
 * Perform hard refresh
 *
 * This is part of the appcache refresh, forcing a reload while
 * avoiding the appcache which is important for system such as
 * Android such doesn't adhere to window.location.reload(true)
 * and still uses appcache.
 *
 * @memberOf AuraClientService
 * @export
 */
AuraClientService.prototype.hardRefresh = function() {
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

AuraClientService.prototype.isDevMode = function() {
    var context = $A.getContext();
    return !$A.util.isUndefined(context) && context.getMode() === "DEV";
};

AuraClientService.prototype.handleAppCache = function() {

    var acs = this;


    /**
     * Clears actions and ComponentDefStorage stores then reloads the page.
     */
    function dumpCachesAndReload() {
        // reload even if storage clear fails
        var actionStorage = Action.getStorage();
        var actionClear = actionStorage && actionStorage.isPersistent() ? actionStorage.clear() : Promise["resolve"]([]);

        actionClear.then(
            undefined, // noop on success
            function() {
                $A.log("Failed to clear persistent actions cache");
                // do not rethrow to return to resolve state
            }
        ).then(
            function() {
                return $A.componentService.clearDefsFromStorage();
            }
        ).then(
            undefined, // noop on success
            function() {
                $A.log("Failed to clear persistent component def storage");
                // do not rethrow to return to resolve state
            }
        ).then(
            function() {
                window.location.reload(true);
            }
        );
    }

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

    function handleAppcacheChecking() {
        document._appcacheChecking = true;
    }

    function handleAppcacheUpdateReady() {
        var appCache = window.applicationCache;
        if (appCache.swapCache && appCache.status === appCache.UPDATEREADY) {
            try {
                appCache.swapCache();
            } catch(ignore) {
                // protect against InvalidStateError with swapCache even when UPDATEREADY (weird)
            }
        }
        dumpCachesAndReload();
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

        if (acs.isDevMode()) {
            showProgress(-1);
        }

        if (acs.appcacheDownloadingEventFired && acs.isOutdated) {
            // Hard reload if we error out trying to download new appcache
            $A.log("Outdated.");
            dumpCachesAndReload();
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

    function handleAppcacheNoUpdate() {
        if (acs.isDevMode()) {
            showProgress(100);
        }
        if (acs.isOutdated) {
            window.location.reload(true);
        }
    }

    function handleAppcacheCached() {
        showProgress(100);
    }

    function handleAppcacheObsolete() {
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
 * @memberOf AuraClientService
 * @export
 */
AuraClientService.prototype.setOutdated = function() {
    this.isOutdated = true;
    var appCache = window.applicationCache;
    if (!appCache || (appCache && (appCache.status === appCache.UNCACHED || appCache.status === appCache.OBSOLETE))) {
        window.location.reload(true);
    } else if (appCache.status === appCache.IDLE || appCache.status > appCache.DOWNLOADING) {
        // call update when there is a cache ie IDLE (status = 1) or cache is not being checked (status = 2) or downloaded (status = 3)
        appCache.update();
    }
};

/**
 * Inform Aura that the environment is either online or offline.
 *
 * @param {Boolean} isConnected Set to true to run Aura in online mode,
 * or false to run Aura in offline mode.
 * @memberOf AuraClientService
 * @export
 */
AuraClientService.prototype.setConnected = function(isConnected) {
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
        alert(isDisconnected ? "Connection lost" : "Connection resumed");//eslint-disable-line no-alert
    }
};

/**
 * Saves the CSRF token to the Actions storage. Does not block nor report success or failure.
 *
 * This storage operate uses the adapter directly instead of AuraStorage because the specific
 * token key is used in mobile (hybrid) devices to obtain the token without the isolation and
 * even before Aura initialization.
 *
 * @returns {Promise} Promise that resolves with the current CSRF token value.
 */
AuraClientService.prototype.saveTokenToStorage = function() {
    // update the persisted CSRF token so it's accessible when the app is launched while offline.
    // fire-and-forget style, matching action response persistence.
    var storage = Action.prototype.getStorage();
    if (storage && this._token) {
        var token = this._token;
        // certain storage adapters require token object be wrapped in "value" object for indexing
        var value = { "value": { "token": this._token } };
        var size = $A.util.estimateSize(this._tokenStorageKey) + $A.util.estimateSize(this._token);
        return storage.adapter.setItem(this._tokenStorageKey, value, size).then(
            function() { return token; },
            function(err) {
                $A.warning("AuraClientService.saveTokenToStorage(): failed to persist token: " + err);
                return token;
            }
        );
    }

    return Promise["resolve"](this._token);
};

/**
 * Loads the CSRF token from Actions storage.
 * @return {Promise} resolves or rejects based on data loading.
 */
AuraClientService.prototype.loadTokenFromStorage = function() {
    var storage = Action.prototype.getStorage();
    if (storage) {
        return storage.adapter.getItem(this._tokenStorageKey);
    }
    return Promise["reject"](new Error("no Action storage"));
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
 * @export
 */
AuraClientService.prototype.initHost = function(host) {
    this._host = host || "";

    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    delete AuraClientService.prototype.initHost;
    delete AuraClientService.prototype["initHost"];
    //#end
};

/**
 * Initialize aura.
 *
 * FIXME: why is this exported
 *
 * This should never be called by client code.
 *
 * @param {Object} config the configuration for aura.
 * @param {string} token the XSS token.
 * @param {function} callback the callback when init is complete.
 * @param {object} container the place to install aura (defaults to document.body).
 * @export
 */
AuraClientService.prototype.init = function(config, token, container) {

    //
    // not on in dev modes to preserve stacktrace in debug tools
    // Why? - goliver
    // I think this should be done in all cases, the error can be more
    // instructive than an uncaught exception.
    //
    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    try {
        //#end

        if (token) {
            this._token = token;
        }

        var component = $A.componentService.createComponentPriv(config);
        $A.getContext().setCurrentAccess(component);
        $A.renderingService.render(component, container || document.body);
        $A.renderingService.afterRender(component);

        return component;

        // not on in dev modes to preserve stacktrace in debug tools
        //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    } catch (e) {
        throw new $A.auraError("Error during init", e);
    }
    //#end
};

/**
 * This function is used by the test service to determine if there are outstanding actions.
 *
 * @private
 */
AuraClientService.prototype.idle = function() {
    return (this.actionsQueued.length === 0 && this.actionsDeferred.length === 0
        && this.availableXHRs.length === this.allXHRs.length);
};

/**
 * Initialize definitions.
 *
 * FIXME: why is this exported
 *
 * This should never be called by client code. It is exposed, but deleted after
 * first use.
 *
 * @param {Object} config the set of definitions to initialize
 * @export
 */

AuraClientService.prototype.initDefs = function(config) {
    var i;

    var evtConfigs = $A.util.json.resolveRefsArray(config["eventDefs"]);
    for (i = 0; i < evtConfigs.length; i++) {
        $A.eventService.saveEventConfig(evtConfigs[i]);
    }

    var libraryConfigs = $A.util.json.resolveRefsArray(config["libraryDefs"]);
    for (i = 0; i < libraryConfigs.length; i++) {
        $A.componentService.createLibraryDef(libraryConfigs[i]);
    }

    var controllerConfigs = $A.util.json.resolveRefsArray(config["controllerDefs"]);
    for (i = 0; i < controllerConfigs.length; i++) {
        $A.componentService.createControllerDef(controllerConfigs[i]);
    }

    var comConfigs = $A.util.json.resolveRefsArray(config["componentDefs"]);
    for (i = 0; i < comConfigs.length; i++) {
        $A.componentService.saveComponentConfig(comConfigs[i]);
    }

    var namespaces = config["namespaces"];
    for (i = 0; i < namespaces.length; i++){
        this.namespaces[namespaces[i]] = true;
    }

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
AuraClientService.prototype.runAfterInitDefs = function(callback) {
    if (!this.finishedInitDefs) {
        // Add to the list of callbacks waiting until initDefs() is done
        this.initDefsObservers.push(callback);
    } else {
        // initDefs() is done and gone so just run the callback
        callback();
    }
};

/**
 * Load a component.
 *
 * This function does a very complex dance to try to bring up the app as fast as possible. This is really
 * important in the case of persistent storage.
 *
 * @param {DefDescriptor} descriptor The key for a definition with a qualified name of the format prefix://namespace:name
 * @param {Object} attributes The configuration data to use. If specified, attributes are used as a key value pair.
 * @param {function} callback The callback function to run
 * @param {String} defType Sets the defType to "COMPONENT"
 *
 * @memberOf AuraClientService
 * @private
 */
AuraClientService.prototype.loadComponent = function(descriptor, attributes, callback, defType) {
    var acs = this;
    this.loadTokenFromStorage().then(
        function (value) {
            if (value && value.value && value.value["token"]) {
                acs._token = value.value["token"];
                $A.log("AuraClientService.loadComponent(): token found in storage");
            } else {
                $A.log("AuraClientService.loadComponent(): no token found in storage");
                // on next reload force server trip to get new token
                acs.disableBootstrapCacheOnNextLoad();
            }
        },
        function(err) {
            $A.log("AuraClientService.loadComponent(): failed to load token from storage: " + err);
            // on next reload force server trip to get new token
            acs.disableBootstrapCacheOnNextLoad();
        }
    );

    this.runAfterInitDefs(function () {
        $A.run(function () {
            var desc   = new DefDescriptor(descriptor);
            var tag    = desc.getNamespace() + ":" + desc.getName();
            var method = defType === "APPLICATION" ? "getApplication" : "getComponent";
            var action = $A.get("c.aura://ComponentController." + method);
            if(acs.getUseBootstrapCache()) {
                action.setStorable({ "refresh": 0 });
            } else {
                action.setStorable({ "ignoreExisting": true });
            }

            // we've respected the value so clear it
            acs.clearDisableBootstrapCacheOnNextLoad();

            //
            // No, really, do not abort this. The setStorable above defaults this
            // to be abortable, but, even though nothing should ever trigger an action
            // that could be abortable here (we haven't loaded the app yet, so it shouldn't
            // be possible), we want to avoid any confusion.
            //
            action.setAbortable(false);

            action.setParams({ "name": tag, "attributes": attributes, "chainLoadLabels": true });
            //
            // we use stored and loaded here to track the various race conditions and prevent
            // them.
            // * stored === true means that we have either succeeded or are still in process to initialize
            //   from storage.
            // * loaded === undefined means that nothing has returned an error.
            // * loaded === false means that something has failed.
            // * loaded truthy means we have initialized.
            //
            var stored = false;
            var storage = Action.prototype.getStorage();
            var loaded;

            var failCallback = function (force, err) {
                //
                // The first failure here means just mark loaded so that the second failure will
                // post an error. The second error dies.
                //
                if (loaded === false || force) {
                    err = err || "";
                    $A.reportError("Aura.loadComponent(): Failed to initialize application.\n" + err);
                    return;
                }

                if (!loaded) {
                    loaded = false;
                }
            };

            //
            // SUCCESS callback cases
            // (1) From storage: Get the token from storage, and if successful, initialize the app. Note that
            // this has a race condition with the server. If we initialize the app from storage, remember
            // that we have.
            // (2) Server callback, storage incomplete. Save the token and initialize the app.
            // (3) Server callback, storage completed initialization. Save the token, fire an event to
            // allow the app to give the user the chance to refresh. This should only happen if the response
            // has changed.
            //
            action.setCallback(acs,
                function (a) {
                    if (storage && a.isFromStorage()) {
                        stored = true;
                        if (!loaded) {
                            loaded = "STORAGE";
                            callback(a.getReturnValue());
                        }
                    } else {
                        if (!loaded) {
                            loaded = "SERVER";
                            callback(a.getReturnValue());
                        } else {
                            var key = a.getStorageKey(),
                                toStore = a.getStored();
                            var storeCallback = function() {
                                $A.log("getApplication response changed. Firing aura:applicationRefreshed event");
                                $A.getEvt("markup://aura:applicationRefreshed").fire();
                            };

                            // Fires applicationRefreshed only after the new response is saved
                            // Guarantees the new action response is there before page reloads
                            storage.put(key, toStore).then(storeCallback, storeCallback);
                        }
                    }
            }, "SUCCESS");
            //
            // INCOMPLETE: If we did not initialize from storage, flag an error, otherwise it is a no-op.
            //
            action.setCallback(acs,
                function (a) {

                    // Even if bootstrap cache is disabled we still want to load from cache
                    // if action fails as "INCOMPLETE" for offline launch
                    if (!acs.getUseBootstrapCache() && storage) {
                        var key = a.getStorageKey();
                        storage.get(key).then(
                            function(value) {
                                if (value) {
                                    storage.log("AuraClientService.loadComponent(): bootstrap request was INCOMPLETE, using stored action response.", [a, value.value]);
                                    $A.run(function() {
                                        action.updateFromResponse(value.value);
                                        action.finishAction($A.getContext());
                                    });
                                } else {
                                    failCallback(true, " : No connection to server");
                                }
                            },
                            function() {
                                failCallback(true, " : No connection to server");
                            }
                        );
                    } else {
                        failCallback(!stored, " : No connection to server");
                    }

                }, "INCOMPLETE");
            //
            // ERROR: this is generally trouble, but if we already initialized, we won't flag it. We also don't flag
            // errors that are ClientSideEventExceptions sent down from the server, which are identified by a specific
            // message string on the error.
            //
            action.setCallback(acs,
                function (a) {
                    // This should only be called in the case of a refresh action that fails for some
                    // reason. In this case, we really would like to gack, and act as if nothing happened.
                    var errors = a.getError();
                    var errorStr = "";

                    if (errors && errors[0] && errors[0].message) {
                        errorStr = errors[0].message;
                    }
                    $A.log("$A.loadComponent(): Refresh failed:\n" + errorStr);
                    var forceError = !stored && (errorStr !== "Received exception event from server");
                    failCallback(forceError, errorStr);
                }, "ERROR");

            acs.enqueueAction(action);
        }, "loadComponent");
    });
};

/**
 * Check to see if we are inside the aura processing 'loop'.
 *
 * @private
 */
AuraClientService.prototype.inAuraLoop = function() {
    return this.auraStack.length > 0;
};

/**
 * Push a new name on the stack.
 *
 * @param {string} name the name of the item to push.
 * @private
 */
AuraClientService.prototype.pushStack = function(name) {
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
AuraClientService.prototype.popStack = function(name) {
    var lastName;

    if (this.auraStack.length > 0) {
        lastName = this.auraStack.pop();
        $A.assert(lastName === name, "Broken stack: popped "+lastName+" expected "+name+", stack = "+this.auraStack);
    } else {
        $A.warning("Pop from empty stack");
    }

    if (this.auraStack.length === 0) {
        this.auraStack.push("AuraClientService$popStack");
        this.postProcess();
    }
};

/*
 * @private
 */
AuraClientService.prototype.postProcess = function() {
    if (this.auraStack.length === 1 && this.auraStack[0] === "AuraClientService$popStack") {
        try {
            this.process();
        } catch (e) {
            throw (e instanceof $A.auraError) ? e : new $A.auraError("AuraClientService.popStack: error in processing", e);
        }
        this.auraStack.pop();
        this.nextTransactionId += 1;
        this.currentTransactionId = undefined;
    }
};

/**
 * Run the collection of actions.
 *
 * Entry point for processing actions. This creates a collector, and parcels out the action handling.
 * After this, server actions will be either getting values from storage, or will be executed, and the
 * client actions will all be queued up to be executed in order via setTimeout, giving server actions
 * entry points to collect.
 */
AuraClientService.prototype.process = function() {
    if (this.collector) {
        return;
    }
    this.collector = new Aura.Services.AuraClientService$AuraActionCollector();
    this.collector.transactionId = this.currentTransactionId;
    this.continueProcessing();
};

/**
 * continuation.
 *
 * Setp 2: walk actions setting up collections.
 *
 * We divide into client actions and server actions. Server actions are further
 * divided into stored vs. non-stored.
 */
AuraClientService.prototype.continueProcessing = function() {
    var i;
    var index = 0;
    var action;
    var actionList;

    // Protect against server actions collecting early.
    this.collector.actionsToCollect += 1;
    actionList = this.actionsQueued;
    this.actionsQueued = [];
    for (i = 0; i < actionList.length; i++) {
        action = actionList[i];
        try {
            if (this.maybeAbortAction(action)) {
                // action alrealy aborted.
                continue;
            }
            if (action.getDef().isServerAction()) {
                this.collector.actionsToCollect += 1;
                var storage = action.getStorage();
                this.collector.collected[index] = undefined;
                if (!action.isRefreshAction() && action.isStorable() && storage) {
                    this.getStoredResult(action, storage, index);
                } else {
                    this.collectServerAction(action, index);
                }
                index += 1;
            } else {
                this.collector.clientActions.push(action);
            }
        } catch (e) {
            $A.logger.auraErrorHelper(e, action);
        }
    }
    this.collector.actionsToCollect -= 1;
    // Start our index at 0
    this.collector.clientIndex = 0;
    if (this.optionClientSynchronous) {
        this.runClientActions();
    } else {
        this.continueClientActions();
    }
};

/**
 * Handle a single server action.
 */
AuraClientService.prototype.getStoredResult = function(action, storage, index) {
    //
    // For cacheable actions check the storage service to see if we already have a viable cached action
    // response we can complete immediately. In this case, we get a callback, so we create a callback
    // for each one (ugh, this could have been handled via passing an additional param to the action,
    // but we don't have that luxury now.)
    //
    var that = this;
    var key;

    key = action.getStorageKey();
    // using storage so callbacks *must* be in an aura loop
    storage.get(key).then(
        function(value) {
            if (value && value.value) {
                if (that.optionStoredAfterSend) {
                    that.enqueueStoredAction(action, value.value);
                } else {
                    that.executeStoredAction(action, value.value, that.collector.collected, index);
                }
                that.collector.actionsToCollect -= 1;
                that.finishCollection();
            } else {
                that.collectServerAction(action, index);
            }
        },
        function(/*error*/) {
            // error fetching from storage so go to the server
            that.collectServerAction(action, index);
        }
    );
};

/**
 * Enqueue a stored action for execution after the XHR send.
 */
AuraClientService.prototype.enqueueStoredAction = function(action, response) {
    this.collector.actionsToComplete.push({ "action":action, "response":response});
};

/**
 * Execute a single stored action.
 *
 * This is done in situations when we get a result from the storage service. We also queue up a refresh
 * action if we are due a refresh or we have trouble running the action.
 */
AuraClientService.prototype.executeStoredAction = function(action, response, collected, index) {
    var refreshAction = null;

    this.setInCollection();
    try {
        if (!this.maybeAbortAction(action)) {
            try {
                action.updateFromResponse(response);
                action.finishAction($A.getContext());
            } catch (e) {
                refreshAction = action.getRetryFromStorageAction();
                $A.warning("Finishing cached action failed. Trying to refetch from server: "
                    + refreshAction.getStorageKey(), e);
                // Clear potential leftover configs
                $A.getContext().clearComponentConfigs(action.getId());
            }
            this.collector.actionsCompleted += 1;
            if (!refreshAction) {
                refreshAction = action.getRefreshAction(response);
            }
            if (refreshAction) {
                action.fireRefreshEvent("refreshBegin");
                collected[index] = refreshAction;
            }
        }
    } catch (e) {
        $A.logger.auraErrorHelper(e, action);
    } finally {
        this.clearInCollection();
    }
};

/**
 * Collect a single action into our list.
 */
AuraClientService.prototype.collectServerAction = function(action, index) {
    this.collector.collected[index] = action;
    this.collector.actionsToCollect -= 1;
    this.finishCollection();
};

/**
 * Run client actions asynchronously.
 */
AuraClientService.prototype.continueClientActions = function() {
    var that = this;

    if (this.collector.clientIndex < this.collector.clientActions.length) {
        setTimeout(function() {
            that.setInCollection();
            that.executeClientAction(that.collector.clientActions[that.collector.clientIndex]);
            that.clearInCollection();
            that.collector.clientIndex += 1;
            that.continueClientActions();
        }, 0);
    } else {
        this.collector.clientActions = [];
        this.finishCollection();
    }
};

/**
 * Run client actions synchronously.
 */
AuraClientService.prototype.runClientActions = function() {
    var i;

    this.setInCollection();
    for (i = 0; i < this.collector.clientActions.length; i++) {
        this.executeClientAction(this.collector.clientActions[i]);
    }
    this.clearInCollection();
    this.collector.clientActions = [];
    this.finishCollection();
};

/**
 * Execute a client action.
 */
AuraClientService.prototype.executeClientAction = function(action) {
    try {
        if (!this.maybeAbortAction(action)) {
            action.runDeprecated();
            action.finishAction($A.getContext());
        }
    } catch (ignore) {
        // already handled in the action.
    }
};

/**
 * Finish the collection process and send XHRs.
 */
AuraClientService.prototype.finishCollection = function() {
    if (this.collector.actionsToCollect !== 0 || this.collector.clientActions.length) {
        return;
    }
    if (this.collector.actionsCompleted) {
        this.fireDoneWaiting();
    }
    //
    // Carefully walk actions here, since we may have undefined actions in our collected set.
    // This way we filter them out, and don't try to process too many things. It also avoids
    // other problems processing the deferred queue.
    //
    var i = 0;
    var length;
    var collected = this.collector.collected;
    this.collector.collected = [];
    for (i = 0, length = collected.length; i < length; i++) {
        if (collected[i]) {
            this.actionsDeferred.push(collected[i]);
        }
    }
    if (this.actionsQueued.length) {
        this.continueProcessing();
        return;
    }
    if (this.actionsDeferred.length) {
        this.sendActionXHRs();
    }

    //
    // This will only be true if we opt for stored actions after send.
    //
    if (this.collector.actionsToComplete.length) {
        for (i = 0; i < this.collector.actionsToComplete.length; i++) {
            this.collector.collected.push(undefined);
        }
        this.continueCompletions();
    } else {
        this.finishProcessing();
    }
};

/**
 * @private
 */
AuraClientService.prototype.shouldSendOutForegroundActions = function( foregroundActions, cabooseCount ) {
    if(foregroundActions.length > cabooseCount ||
        (cabooseCount > 0 && Date.now() - this.lastSendTime > 60000) ) {
        return true;
    } else {
        return false;
    }
};

/**
 * Send actions.
 *
 */
AuraClientService.prototype.sendActionXHRs = function() {
    var processing;
    var foreground = [];
    var background = [];
    var action, auraXHR;
    var caboose = 0;
    var transactionId = this.collector.transactionId;
    var i;

    //
    // FIXME: Second cut. No division of actions, but we can have multiple forground actions.
    //
    processing = this.actionsDeferred;
    this.actionsDeferred = [];
    for (i = 0; i < processing.length; i++) {
        action = processing[i];
        if (this.maybeAbortAction(action)) {
            continue;
        }
        if (action.isAbortable()) {
            transactionId = action.getAbortableId();
        }
        if (action.isBackground()) {
            background.push(action);
        } else {
            foreground.push(action);
            if (action.isCaboose()) {
                caboose += 1;
            }
        }
    }
    if (transactionId === undefined) {
        transactionId = this.lastTransactionId;
    }

    // either group caboose with at least one non-caboose foreground
    // or send all caboose after 60s since last send
    if( this.shouldSendOutForegroundActions(foreground, caboose) ) {
        auraXHR = this.getAvailableXHR(false);
        if (auraXHR) {
            auraXHR.transactionId = transactionId;
            if (!this.send(auraXHR, foreground, "POST")) {
                this.releaseXHR(auraXHR);
            }
        }
    }
    // If we don't have an XHR, that means we need to try to send later.
    if (!auraXHR) {
        this.actionsDeferred = this.actionsDeferred.concat(foreground);
    }

    if (background.length) {
        for (i = 0; i < background.length; i++) {
            action = background[i];
            auraXHR = this.getAvailableXHR(true);
            if (auraXHR) {
                auraXHR.transactionId = transactionId;
                if (!this.send(auraXHR, [ action ], "POST")) {
                    this.releaseXHR(auraXHR);
                }
            } else {
                this.actionsDeferred.push(action);
            }
        }
    }
};


AuraClientService.prototype.continueCompletions = function() {
    var that = this;

    if (this.collector.completionIndex < this.collector.actionsToComplete.length) {
        setTimeout(function() {
            var collected = [ null ];
            var completion = that.collector.actionsToComplete[that.collector.completionIndex];
            that.executeStoredAction(completion["action"], completion["response"], collected, 0);
            that.collector.completionIndex += 1;
            if (collected[0]) {
                that.enqueueAction(collected[0]);
            }
            that.continueCompletions();
        }, 0);
    } else {
        if (this.actionsQueued.length) {
            this.continueProcessing();
        } else {
            this.finishProcessing();
        }
    }
};

AuraClientService.prototype.finishProcessing = function() {
    this.setInCollection();
    try {
        $A.renderingService.rerenderDirty();
        } catch (e) {
        throw e;
        } finally {
        this.clearInCollection();
        if (this.actionsQueued.length > 0) {
            this.continueProcessing();
        } else {
            this.collector = undefined;
        }
    }
};

AuraClientService.prototype.deDupe = function(action) {
    var key, entry, dupes;

    if (!action.isStorable()) {
        return false;
    }
    try {
        key = action.getStorageKey();
    } catch (e) {
        return false;
    }
    entry = this.actionStoreMap[key];
    if (entry && !(entry.action.getState() === 'NEW' || entry.action.getState() === 'RUNNING')) {
        dupes = entry.dupes;
        $A.warning("Unfinished handling of action for key "+key);
        entry = undefined;
    }
    if (!entry) {
        entry = {};
        entry.action = action;
        if (dupes) {
            entry.dupes = dupes;
        }
        this.actionStoreMap[key] = entry;
        this.actionStoreMap[action.getId()] = key;
        return false;
    } else if (entry.action !== action) {
        if (!entry.dupes) {
            entry.dupes = [ action ];
        } else {
            entry.dupes.push(action);
        }
        return true;
    }
    return false;
};

AuraClientService.prototype.getAndClearDupes = function(key) {
    if (!key || !this.actionStoreMap[key]) {
        return undefined;
    }
    var entry;
    var dupes;

    // we have a mapping.
    entry = this.actionStoreMap[key];
    dupes = entry.dupes;
    delete this.actionStoreMap[entry.action.getId()];
    delete this.actionStoreMap[key];
    return dupes;
};

/**
 * Send an xhr with a set of actions.
 *
 * The only note here is that if we fail to serialize the actions for any reason, we will log an
 * error and error out the actions. This is because we don't have a way of determining which of the
 * actions errored out.
 *
 * Used for instrumentation.
 *
 * @param auraXHR the wrapped XHR.
 * @param actions the set of actions to send.
 * @param method GET or POST
 * @param options extra options for the send, allows callers to set headers.
 * @return true if the XHR was sent, otherwise false.
 */
AuraClientService.prototype.send = function(auraXHR, actions, method, options) {
    var actionsToSend = [];
    var that = this;
    var action;
    var context = $A.getContext();
    var i;

    for (i = 0; i < actions.length; i++) {
        action = actions[i];
        if (!action.callAllAboardCallback(context)) {
            action.finishAction(context);
            continue;
        }
        if (this.deDupe(action)) {
            continue;
        }
        auraXHR.addAction(action);
        if (action.isChained()) {
            continue;
        }
        actionsToSend.push(action);
    }
    if (actionsToSend.length === 0) {
        return false;
    }

    var processed = false;
    var qs;
    try {
        var params = {
            "message"      : $A.util.json.encode({ "actions" : actionsToSend }),
            "aura.context" : context.encodeForServer(method === "POST")
        };
        if (method === "GET") {
            params["aura.access"] = "UNAUTHENTICATED";
        } else {
            params["aura.token"] = this._token;
        }
        qs = this.buildParams(params);
    } catch (e) {
        for (i = 0; i < actions.length; i++) {
            action = actions[i];
            action.markException(e);
            action.finishAction(context);
        }
    }

    var url = this._host + "/aura";
    if (qs && method === "GET") {
        url = url + "?" + qs;
    }

    auraXHR.length = qs.length;
    auraXHR.request = this.createXHR();
    auraXHR.marker = Aura.Services.AuraClientServiceMarker++;
    auraXHR.request["open"](method, url, true);
    if ("withCredentials" in auraXHR.request) {
        auraXHR.request["withCredentials"] = true;
    }
    //
    // Careful! On some browsers "onreadystatechange" is a write only property, so make
    // sure that we only write it. And for safety's sake, just write it once.
    //
    var onReady = function() {
        // Ordering is important. auraXHR will no longer be valid after processed.
        if (processed === false && auraXHR.request["readyState"] === 4) {
            processed = true;
            that.receive(auraXHR);
        }
    };
    if(context&&context.getCurrentAccess()&&this.inAuraLoop()){
        onReady = $A.getCallback(onReady);
    }
    auraXHR.request["onreadystatechange"] = onReady;

    if (options && options["headers"]) {
        var key, headers = options["headers"];

        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                auraXHR.request.setRequestHeader(key, headers[key]);
            }
        }
    }

    // Delete all this jiffy nonsense start of 200 release

    if (qs && method === "POST") {
        auraXHR.request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=ISO-8859-13');
        auraXHR.request["send"](qs);
    } else {
        auraXHR.request["send"]();
    }

    // legacy code, spinner actually relies on the waiting event, need a proper fix
    setTimeout(function() {
        $A.get("e.aura:waiting").fire();
    }, 1);

    this.lastSendTime = Date.now();
    return true;
};


/**
 * @returns {Object} An XHR based on what is available on the current browser.
 * @private
 */
AuraClientService.prototype.createXHR = function() {
    if (this.httpType) {
        if (this.httpType === 'generic') {
            return new XMLHttpRequest();
        } else if (this.httpType === 'msxml2') {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    // UGLY!!!!
    if (window.ActiveXObject) {
        try {
            this.httpType = 'msxml2';
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            this.httpType = 'msxml';
            // If this throws, we are out of ideas anyway, so just "let it throw, let it throw, let it throw".
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    } else {
        throw new Error("AuraClientService.createXHR: Unable to find an appropriate XHR");
    }
};

/**
 * Create an encoded string of parameters.
 *
 * @param {Map} map A map of parameter names and values
 * @returns {String} The encoded parameters
 * @private
 */
AuraClientService.prototype.buildParams = function(map) {
    var arr = [];
    var first = true;
    for (var key in map) {
        if (!first) {
            arr.push("&");
        }
        first = false;
        if ($A.util.isArray(map[key])) {
            var valueArray = map[key];
            if (valueArray.length === 0) {
                arr.push(key);
                arr.push("=");
            } else {
                for ( var i = 0; i < valueArray.length; i++) {
                    if (i > 0) {
                        arr.push("&");
                    }
                    arr.push(key);
                    arr.push("=");
                    arr.push(encodeURIComponent(valueArray[i]));
                }
            }
        } else {
            arr.push(key);
            arr.push("=");
            arr.push(encodeURIComponent(map[key]));
        }
    }
    return arr.join("");
};

/**
 * Callback for an XHR for a set of actions.
 *
 * This function does all of the processing for a set of actions that come back from the server. It correctly deals
 * with the case of interrupted communications, and handles aborts.
 *
 * @param {AuraXHR} the xhr container.
 * @private
 */
AuraClientService.prototype.receive = function(auraXHR) {
    var responseMessage;
    this.auraStack.push("AuraClientService$receive");
    if (auraXHR.transactionId) {
        this.setCurrentTransactionId(auraXHR.transactionId);
    }
    try {
        responseMessage = this.decode(auraXHR.request);

        if (responseMessage["status"] === "SUCCESS") {
            this.processResponses(auraXHR, responseMessage["message"]);
        } else if (responseMessage["status"] === "INCOMPLETE") {
            this.processIncompletes(auraXHR);
        } else if (responseMessage["status"] === "ERROR") {
            this.processErrors(auraXHR, responseMessage["message"]);
        }
        this.fireDoneWaiting();
    } catch (e) {
        throw (e instanceof $A.auraError) ? e : new $A.auraError("AuraClientService.receive action callback failed", e);
    } finally {
        this.auraStack.pop();
        this.releaseXHR(auraXHR);
        this.process();
        this.setCurrentTransactionId(undefined);
    }

    return responseMessage;
};

/**
 * Mark actions from an XHR response as being in the error state and set the error on the actions.
 *
 * @param {AuraXHR} auraXHR The xhr container.
 * @param {String} errorMessage The error message to associate with the actions.
 * @private
 */
AuraClientService.prototype.processErrors = function(auraXHR, errorMessage) {
    var action;
    var actions = auraXHR.actions;
    for (var id in actions) {
        if (actions.hasOwnProperty(id)) {
            action = actions[id];
            var error = new Error(errorMessage);
            $A.warning("Error in the server action response:" + errorMessage);
            action.markError($A.getContext(), [error]);
        }
    }
};

AuraClientService.prototype.processResponses = function(auraXHR, responseMessage) {

    var action, actionResponses, response, dupes;
    var token = responseMessage["token"];
    if (token) {
        this._token = token;
        try {
            this.saveTokenToStorage();
        } catch (e) {
            $A.logger.auraErrorHelper(e);
        }
    }

    try {
        var context=$A.getContext();
        if(!context.getCurrentAccess()){
            context.setCurrentAccess($A.getRoot());
        }
        context['merge'](responseMessage["context"]);
    } catch (e) {
        $A.logger.auraErrorHelper(e);
    }

    // Look for any Client side event exceptions
    var events = responseMessage["events"];
    if (events) {
        for ( var en = 0, len = events.length; en < len; en++) {
            try {
                this.parseAndFireEvent(events[en]);
            } catch (e) {
                $A.logger.auraErrorHelper(e);
            }
        }
    }

    actionResponses = responseMessage["actions"];

    // Process each action and its response
    for ( var r = 0; r < actionResponses.length; r++) {
        action = null;
        try {
            response = actionResponses[r];
            action = auraXHR.getAction(response["id"]);
            if (action) {
                if (response["storable"] && !action.isStorable()) {
                    action.setStorable();
                    // the action started as non-abortable on the client
                    if(action.getAbortableId() === undefined) {
                        action.setAbortable(false);
                    }
                }
            } else {
                // the client didn't request the action response but the server sent it so
                // a component is priming the actions cache. if the response isn't success
                // (which should never happen) then skip processing the action
                if (response["state"] !== "SUCCESS") {
                    continue;
                }

                action = this.buildStorableServerAction(response);
            }
            if (!action) {
                throw new $A.auraError("Unable to find an action for "+response["id"]+": "+response);
            } else {
                var key = this.actionStoreMap[action.getId()];
                dupes = this.getAndClearDupes(key);
                this.singleAction(action, response, key, true);
                if (dupes) {
                    for (var i = 0; i < dupes.length; i++) {
                        this.singleAction(dupes[i], response, key, false);
                    }
                }
            }
        } catch (e) {
            $A.logger.auraErrorHelper(e, action);
            throw (e instanceof $A.auraError) ? e : new $A.auraError("Error processing action response", e);
        }
    }
};

AuraClientService.prototype.buildStorableServerAction = function(response) {
    var action = null;
    if (response["storable"]) {
        //
        // Hmm, we got a missing action. We allow this in the case that we have
        // a storable action from the server (i.e. we are faking an action from the
        // server to store data on the client. This is only used in priming, and is
        // more than a bit of a hack.
        //
        // Create a client side action instance to go with the server created action response
        //
        var descriptor = response["action"];
        var actionDef = $A.services.component.getActionDef(descriptor);
        if (!actionDef) {
            // No action.
            throw new $A.auraError("Missing action definition for "+descriptor);
        }
        action = actionDef.newInstance();
        action.setStorable();
        action.setParams(response["params"]);
        action.setAbortable(false);
        action.updateFromResponse(response);
    }
    return action;
};

AuraClientService.prototype.processIncompletes = function(auraXHR) {
    var actions = auraXHR.actions;
    var id, action, key, dupes;

    for (id in actions) {
        if (actions.hasOwnProperty(id)) {
            action = actions[id];
            if ((action.getAbortableId() === this.lastTransactionId) || !action.isAbortable()) {
                action.incomplete($A.getContext());
            } else {
                action.abort();
            }
            key = this.actionStoreMap[action.getId()];
            dupes = this.getAndClearDupes(key);
            if (dupes) {
                for (var i = 0; i < dupes.length; i++) {
                    if ((dupes[i].getAbortableId() === this.lastTransactionId) || !dupes[i].isAbortable()) {
                        dupes[i].incomplete($A.getContext());
                    } else {
                        dupes[i].abort();
                    }
                }
            }
        }
    }
};

/**
 * A utility to handle events passed back from the server.
 */
AuraClientService.prototype.parseAndFireEvent = function(evtObj) {
    var descriptor = evtObj["descriptor"];

    if (evtObj["eventDef"]) {
        // register the event with the EventDefRegistry
        $A.eventService.createEventDef(evtObj["eventDef"]);
    }

    if ($A.eventService.hasHandlers(descriptor)) {
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
 * Used by plugins.
 *
 * @param {Object}
 *            newToken Refresh the current token with a new one.
 * @memberOf AuraClientService
 * @export
 */
AuraClientService.prototype.resetToken = function(newToken) {
    this._token = newToken;
    this.saveTokenToStorage();
};

/**
 * [DEPRECATED] Run the actions.
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
 * @memberOf AuraClientService
 * @deprecated
 * @export
 */
AuraClientService.prototype.runActions = function(actions, scope, callback) {
    var i;
    var count = actions.length;
    var completion = function() {
        count -= 1;
        if (count === 0) {
            callback.call(scope);
        }
    };

    for (i = 0; i < actions.length; i++) {
        this.enqueueAction(actions[i]);
        actions[i].setCompletion(completion);
    }
    this.process();
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
 * @memberOf AuraClientService
 * @export
 */
AuraClientService.prototype.injectComponent = function(rawConfig, locatorDomId, localId) {
    var config = $A.util.json.resolveRefsObject(rawConfig);

    // Save off any context global stuff like new labels
    $A.getContext()['merge'](config["context"]);

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

        var root = $A.getRoot();

        $A.util.apply(componentConfig, {
            "localId" : localId,
            "attributes" : {
                "valueProvider" : root
            }
        }, null, true);

        var c = $A.componentService.createComponentPriv(componentConfig);

        if (!errors) {
            // Wire up event handlers
            self.addComponentHandlers(c, config["actionEventHandlers"]);
        }

        var body = root.get("v.body");
        body.push(c);

        // Do not let Aura consider this initial setting into the surrogate app as a candiadate for rerendering
        root.set("v.body", body, true);

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
AuraClientService.prototype.createIntegrationErrorConfig = function(errorText) {
    return {
        "componentDef" : {
            "descriptor" : "markup://ui:message"
        },

        "attributes" : {
            "valueProvider": $A.getRoot(),
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
 * @param {String} locator - parent element or the id of the parent element where to inject component
 * @param {Object} [actionEventHandlers] - event handlers
 */
AuraClientService.prototype.renderInjection = function(component, locator, actionEventHandlers) {
    var error = null;

    var stringLocator = $A.util.isString(locator);
    var hostEl = stringLocator ? document.getElementById(locator) : locator;

    if (!hostEl) {
        error = "Invalid locator specified - " + (stringLocator ? "no element found in the DOM with id=" + locator : "locator element not provided");
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
        component = $A.componentService.createComponentPriv(errorConfig);
    }

    this.addComponentHandlers(component, actionEventHandlers);
    $A.render(component, hostEl);
    $A.afterRender(component);
};

/**
 * Use async created component for integration service
 *
 * @param {Object} config - component def config
 * @param {String} locator - parent element or the id of the parent element where to inject component
 * @param {Object} [eventHandlers] - handlers of registered event
 * @param {Function} callback The callback to use once the component is successfully created
 * @export
 */
AuraClientService.prototype.injectComponentAsync = function(config, locator, eventHandlers, callback) {
    var acs = this;
    $A.componentService.newComponentAsync(undefined, function(component) {
        if (callback) {
            callback(component);
        }

        acs.renderInjection(component, locator, eventHandlers);
    }, config, $A.getRoot(), false, false, true);
    //
    // Now we go ahead and stick a label load on the request.
    //
    var labelAction = $A.get("c.aura://ComponentController.loadLabels");
    labelAction.setCallback(this, function() {});
    acs.enqueueAction(labelAction);
};

/**
 * Add handlers of registered events for AIS
 *
 * @param {Component} component - component
 * @param {Object} [actionEventHandlers] - handlers of registered events
 */
AuraClientService.prototype.addComponentHandlers = function(component, actionEventHandlers) {
    if (actionEventHandlers) {
        var containerValueProvider = {
            get : function(functionName) {
                return {
                    run : function(event) {
                        window[functionName](event);
                    },
                    runDeprecated : function(event) {
                        window[functionName](event);
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
 * @memberOf AuraClientService
 * @return {Boolean} Returns true if Aura believes it is online; false otherwise.
 * @export
 */
AuraClientService.prototype.isConnected = function() {
    return !this._isDisconnected;
};

AuraClientService.prototype.clearPreviousAbortableActions = function() {
    var actions = this.actionsQueued;
    var i;

    this.actionsQueued = [];
    for (i = 0; i < actions.length; i++) {
        if (!this.maybeAbortAction(actions[i])) {
            this.actionsQueued.push(actions[i]);
        }
    }
    actions = this.actionsDeferred;
    this.actionsDeferred = [];
    for (i = 0; i < actions.length; i++) {
        if (!this.maybeAbortAction(actions[i])) {
            this.actionsDeferred.push(actions[i]);
        }
    }
};

/**
 * This function must be called from within an event loop.
 *
 * @param {Action} action the action to enqueue
 * @param {Boolean} background Set to true to run the action in the background, otherwise the value of action.isBackground() is used.
 * @export
 * @public
 * @platform
 */
AuraClientService.prototype.enqueueAction = function(action, background) {

    $A.assert(!$A.util.isUndefinedOrNull(action), "EnqueueAction() cannot be called on an undefined or null action.");
    $A.assert($A.util.isAction(action), "Cannot call EnqueueAction() with a non Action parameter.");

    if (background) {
        $A.warning("Do not use the deprecated background parameter");
    }
    if (action.isAbortable()) {
        if (action.getAbortableId() === undefined) {
            if (!this.currentTransactionId && this.nextTransactionId !== this.lastTransactionId) {
                this.lastTransactionId = this.nextTransactionId;
                this.actions = this.clearPreviousAbortableActions();
            }
            action.setAbortableId(this.currentTransactionId || this.nextTransactionId);
            if (this.currentTransactionId && this.currentTransactionId !== this.lastTransactionId) {
                action.abort();
                return;
            }
        } else if (this.maybeAbortAction(action)) {
            // whoops, action is already aborted.
            return;
        }
        this.currentTransactionId = action.getAbortableId();
    }
    this.actionsQueued.push(action);
};

/**
 * [DEPRECATED] [DOES NOT WORK] [DO NOT USE] Defer the action by returning a Promise object.
 * Configure your action excluding the callback prior to deferring.
 * The Promise is a thenable, meaning it exposes a 'then' function for consumers to chain updates.
 *
 * @param {Action} action - target action
 * @return {Promise} a promise which is resolved or rejected depending on the state of the action
 * @export
 */
AuraClientService.prototype.deferAction = function (action) {
    $A.warning("$A.deferAction is broken, do not use it!");
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
AuraClientService.prototype.hasActionStorage = function() {
    return !!Action.getStorage();
};

/**
 * Checks to see if an action is currently being stored (by action descriptor and parameters).
 *
 * @param {String} descriptor - action descriptor.
 * @param {Object} params - map of keys to parameter values.
 * @param {Function} callback - called asynchronously after the action was looked up in the cache. Fired with a
 * single parameter, isInStorge {Boolean} - representing whether the action was found in the cache.
 * @export
 */
AuraClientService.prototype.isActionInStorage = function(descriptor, params, callback) {
    var storage = Action.getStorage();
    callback = callback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        callback(false);
        return;
    }

    storage.get(Action.getStorageKey(descriptor, params)).then(
        function(response) {
            $A.run(function() {
                callback(!!response && !!response.value && !response["isExpired"]);
            });
        },
        function(err) {
            // storage.get() errored so assume repeating the request will also fail
            $A.warning("AuraClientService.isActionInStorage(): storage.get() threw " + err);
            callback(false);
        }
    );
};

/**
 * Resets the cache cleanup timer for an action.
 *
 * @param {String} descriptor - action descriptor.
 * @param {Object} params - map of keys to parameter values.
 * @param {Function} callback - called asynchronously after the action was revalidated. Called with a single
 * parameter, wasRevalidated {Boolean} - representing whether the action was found in the cache and
 * successfully revalidated.
 * @export
 */
AuraClientService.prototype.revalidateAction = function(descriptor, params, callback) {
    var storage = Action.getStorage();
    callback = callback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        callback(false);
        return;
    }

    var actionKey = Action.getStorageKey(descriptor, params);
    storage.get(actionKey).then(
        function(response) {
            if (response && response.value) {
                storage.put(actionKey, response.value).then(
                    function() { callback(true); },
                    function(/*error*/) { callback(false); }
                );
            } else {
                callback(false);
            }
        },
        function(err) {
            $A.warning("AuraClientService.revalidateAction(): storage.get() threw " + err);
            callback(false);
        }
    );
};

/**
 * Clears an action out of the action cache.
 *
 * @param {String} descriptor action descriptor.
 * @param {Object} params map of keys to parameter values.
 * @param {Function} successCallback called after the action was invalidated. Called with true if the action was
 * successfully invalidated and false if the action was invalid or was not found in the cache.
 * @param {Function} errorCallback called if an error occurred during execution
 * @export
 */
AuraClientService.prototype.invalidateAction = function(descriptor, params, successCallback, errorCallback) {
    var storage = Action.getStorage();
    successCallback = successCallback || this.NOOP;
    errorCallback = errorCallback || this.NOOP;

    if (!$A.util.isString(descriptor) || !$A.util.isObject(params) || !storage) {
        successCallback(false);
        return;
    }

    storage.remove(Action.getStorageKey(descriptor, params)).then(
        function() { successCallback(true); },
        errorCallback
    );
};

AuraClientService.prototype.isPrivilegedNamespace = function(namespace) {
	return this.namespaces.hasOwnProperty(namespace);
};

AuraClientService.prototype.allowAccess = function(definition, component) {
    if(definition&&definition.getDescriptor){
        var context;
        var currentAccess;
        switch(definition.access){
            case 'G':
                // GLOBAL means accessible from anywhere
                return true;
            case 'p':
                // PRIVATE means "same component only".
                context=$A.getContext();
                currentAccess=context&&context.getCurrentAccess();
                return currentAccess&&(currentAccess===component||currentAccess.getComponentValueProvider()===component||currentAccess.getDef()===component);
            default:
                // INTERNAL, PUBLIC, or absence of value means "same namespace only".
                context=$A.getContext();
                currentAccess=(context&&context.getCurrentAccess())||component;
                if(currentAccess){// && currentAccess.isValid()){
                    var accessDef=null;
                    var accessFacetDef=null;
                    if(currentAccess instanceof Component){
                        var accessFacetValueProvider = currentAccess.getComponentValueProvider();
                        accessFacetDef=accessFacetValueProvider&&accessFacetValueProvider.getDef();
                        accessDef=currentAccess.getDef();
                    }else{
                        accessDef=currentAccess;
                    }

                    var accessDescriptor=accessDef&&accessDef.getDescriptor();
                    var accessFacetDescriptor=accessFacetDef&&accessFacetDef.getDescriptor();
                    var accessNamespace=accessDescriptor&&accessDescriptor.getNamespace();
                    var accessFacetNamespace=accessFacetDescriptor&&accessFacetDescriptor.getNamespace();
                    // JBUCH: ACCESS: TODO: DETERMINE IF THIS IS THE CORRECT DEFAULT BEHAVIOR; FOR NOW, TREAT PUBLIC/OMITTED AS INTERNAL
                    // if(definition.access!=="P"){
                    // INTERNAL / DEFAULT
                    var allowProtocol=this.protocols.hasOwnProperty(accessDescriptor&&accessDescriptor.getPrefix()) || this.protocols.hasOwnProperty(accessFacetDescriptor&&accessFacetDescriptor.getPrefix());
                    var allowNamespace=this.namespaces.hasOwnProperty(accessNamespace) || this.namespaces.hasOwnProperty(accessFacetNamespace);
                    if(allowProtocol || allowNamespace){
                        // Privileged Namespace
                        return true;
                    }
                    //}
                    // Not a privileged namespace or explicitly set to PUBLIC
                    var targetNamespace=definition.getDescriptor().getNamespace();
                    if(currentAccess===component || accessNamespace===targetNamespace || accessFacetNamespace===targetNamespace){
                        return true;
                    }
                }
                // JBUCH: HACK: THIS DELIGHTFUL BLOCK IS BECAUSE OF LEGACY UNAUTHENTICATED/AUTHENTICATED ABUSE OF ACCESS ATTRIBUTE. COOL.
                return (definition.isInstanceOf && definition.isInstanceOf("aura:application")) ||
                // #if {"excludeModes" : ["PRODUCTION","PRODUCTIONDEBUG"]}
                // This check allows components to be loaded directly in the browser in DEV/TEST
                 !(context&&context.getCurrentAccess()) ||
                // #end
                false;
        }
    }
    return false;
};

/**
 * Handles invalidSession exception from the server when the csrf token is invalid.
 * Saves new token to storage then refreshes page.
 *
 * @export
 */
AuraClientService.prototype.invalidSession = function(token) {
    var acs = this;

    var refresh = function(disableBootstrapCache) {
        if (disableBootstrapCache) {
            acs.disableBootstrapCacheOnNextLoad();
        }
        $A.clientService.hardRefresh();
    };

    // if new token provided then persist to storage and reload. if persisting
    // fails then we must go to the server for getApplication to get a new token.
    if (token && token["newToken"]) {
        this._token = token["newToken"];
        this.saveTokenToStorage().then(refresh.bind(null, false), refresh.bind(null, true));
    } else {
        // refresh (to get a new session id) and force getApplication to the server
        // (to get a new csrf token).
        refresh(true);
    }
};

/**
 * Sets whether Aura should attempt to load the getApplication action from cache first.
 * This must be called from a template's auraPreInitBlock. By default this is enabled.
 * @param {Boolean} useBootstrapCache if true load getApplication action from cache first.
 *  If false go to the server first (ignoring any existing cache).
 * @export
 */
AuraClientService.prototype.setUseBootstrapCache = function(useBootstrapCache) {
    this._useBootstrapCache = useBootstrapCache;
};

/**
 * Forces getApplication action to the server, skipping the cache, when the app
 * is next loaded.
 *
 * Bootstrap cache is disabled when a valid csrf token is not available because the
 * getApplication action is the only mechanism to get a new token.
 *
 * @private
 */
AuraClientService.prototype.disableBootstrapCacheOnNextLoad = function() {
    // can only get a cache hit on getApplication with persistent storage
    var storage = Action.prototype.getStorage();
    if (storage && storage.isPersistent()) {
        var expire = new Date(new Date().getTime() + 1000*60*60*24*7); // + 1 week
        document.cookie = this._disableBootstrapCacheCookie + '=true; expires=' + expire.toUTCString();
    }
};

/**
 * Clears disabling of the bootstrap cache. See disableBootstrapCacheOnNextLoad.
 * @private
 */
AuraClientService.prototype.clearDisableBootstrapCacheOnNextLoad = function() {
    document.cookie = this._disableBootstrapCacheCookie + '=true; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Gets whether to check action cache for getApplication.
 * @return {Boolean} true if the cache should be checked; false to skip the cache.
 */
AuraClientService.prototype.getUseBootstrapCache = function() {
    if (!this._useBootstrapCache) {
        return false;
    }

    // check for cookie indicating disablement
    var cookies = '; ' + document.cookie;
    var key = '; ' + this._disableBootstrapCacheCookie + '=';
    var begin = cookies.indexOf(key);
    if (begin === -1) {
        return true;
    }
    var end = cookies.indexOf(';', begin + key.length);
    var value = cookies.substring(begin + key.length, end);
    // stored value is string true; see disableBootstrapCacheOnNextLoad()
    return value !== 'true';
};


Aura.Services.AuraClientService = AuraClientService;
