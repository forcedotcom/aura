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

var priv = {
	token : null,
	auraStack : [],
	host : "",
	loadEventQueue : [],
	appcacheDownloadingEventFired : false,
	isOutdated : false,
	isUnloading : false,
	initDefsObservers : [],
	isDisconnected : false,

	foreground : new $A.ns.FlightCounter(1),
	background : new $A.ns.FlightCounter(1),
	actionQueue : new ActionQueue(),

	/**
	 * Take a json (hopefully) response and decode it. If the input is invalid JSON, we try to handle it gracefully.
	 * 
	 * @private
	 */
	checkAndDecodeResponse : function(response, noStrip) {
		if (priv.isUnloading) {
			return null;
		}

		var storage = Action.prototype.getStorage();
		var e;

		// failure to communicate with server
		if (priv.isDisconnectedOrCancelled(response)) {
			priv.setConnectedFalse();
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
			var resp = aura.util.json.decode(text, true);

			// if the error on the server is meant to trigger a client-side
			// event...
			if (aura.util.isUndefinedOrNull(resp)) {
				// #if {"excludeModes" : ["PRODUCTION"]}
				aura.error("Communication error, invalid JSON: " + text);
				// #end
				// #if {"modes" : ["PRODUCTION"]}
				aura.error("Communication error, please retry or reload the page");
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
				// #if {"excludeModes" : ["PRODUCTION"]}
				if (resp["message"] && resp["stack"]) {
					aura.error(resp["message"] + "\n" + resp["stack"]);
				} else {
					aura.error("Communication error, invalid JSON: " + text);
				}
				// #end
				// #if {"modes" : ["PRODUCTION"]}
				if (resp["message"]) {
					aura.error(resp["message"]);
				} else {
					aura.error("Communication error, please retry or reload the page");
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

		var responseMessage = aura.util.json.decode(text, true);
		if (aura.util.isUndefinedOrNull(responseMessage)) {
			// #if {"excludeModes" : ["PRODUCTION"]}
			aura.error("Communication error, invalid JSON: " + text);
			// #end
			// #if {"modes" : ["PRODUCTION"]}
			aura.error("Communication error, please retry or reload the page");
			// #end
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
				// W-1728079 : verify & remove this comment when error() take two parameters in the future
				aura.error("Error in defaultHandler for event: " + descriptor, e);
			}
		}
	},

	fireDoneWaiting : function() {
		priv.fireLoadEvent("e.aura:doneWaiting");
	},

	/**
	 * Process a single action/response.
	 * 
	 * Note that it does this inside an $A.run to provide protection against error returns, and to notify the user if an
	 * error occurs.
	 * 
	 * @private
	 * @param {Action}
	 *            action the action.
	 * @param {Boolean}
	 *            noAbort if false abortable actions will be aborted.
	 * @param {Object}
	 *            actionResponse the server response.
	 */
	singleAction : function(action, noAbort, actionResponse) {
		var key = action.getStorageKey();
		var that = this;

		$A.run(function() {
			var storage, toStore, needUpdate;

			needUpdate = action.updateFromResponse(actionResponse);

			if (noAbort || !action.isAbortable()) {
				if (needUpdate) {
					action.finishAction($A.getContext());
				}
				if (action.isRefreshAction()) {
					action.fireRefreshEvent("refreshEnd");
				}
			} else {
				action.abort();
			}
			storage = action.getStorage();
			if (storage) {
				toStore = action.getStored(storage.getName());
				if (toStore) {
					storage.put(key, toStore);
				}
			}
		}, key);
	},

	/**
	 * Callback for an XHR for a set of actions.
	 * 
	 * This function does all of the processing for a set of actions that come back from the server. It correctly deals
	 * with the case of interrupted communications, and handles aborts.
	 * 
	 * @private
	 * @param {Object}
	 *            response the response from the server.
	 * @param {ActionCollector}
	 *            the collector for the actions.
	 * @param {FlightCounter}
	 *            the in flight counter under which the actions were run
	 * @param {Scalar}
	 *            the abortableId associated with the set of actions.
	 */
	actionCallback : function(response, collector, flightCounter, abortableId) {
		var responseMessage = this.checkAndDecodeResponse(response);
		var that = this;
		var firstAction = undefined;
		var noAbort = (abortableId === this.actionQueue.getLastAbortableTransactionId());
		var i;

		var errors = [];
		if (this.auraStack.length > 0) {
			$A.error("Action callback called on non-empty stack " + this.auraStack);
			this.auraStack = [];
		}
		$A.run(function() {
			var action, actionResponses;

			//
			// pre-decrement so that we correctly send the next response right after this.
			//
			flightCounter.finish();
			if (responseMessage) {
				var token = responseMessage["token"];
				if (token) {
					priv.token = token;
				}

				$A.getContext().join(responseMessage["context"]);

				// Look for any Client side event exceptions
				var events = responseMessage["events"];
				if (events) {
					for ( var en = 0, len = events.length; en < len; en++) {
						$A.clientService.parseAndFireEvent(events[en]);
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
							aura.assert(action, "Unable to find action for action response " + actionResponse["id"]);
						}
					}
					if (firstAction === undefined) {
						firstAction = action;
					}
					that.singleAction(action, noAbort, actionResponse);
				}
			} else if (priv.isDisconnectedOrCancelled(response) && !priv.isUnloading) {
				var actions = collector.getActionsToSend();

				for ( var m = 0; m < actions.length; m++) {
					action = actions[m];
					if (firstAction === undefined) {
						firstAction = action;
					}
					if (noAbort || !action.isAbortable()) {
						action.incomplete($A.getContext());
					} else {
						action.abort();
					}
				}
			}
			priv.fireDoneWaiting();
		}, "actionCallback");

		$A.endMark("Completed Action Callback - XHR " + collector.getNum());

		// #if {"modes" : ["PTEST"]}
		// if there are no more actions for a particular transaction and if
		// onLoad has already been fired
		if (firstAction && $A.getContext().getTransaction() !== 0) {
			// if the current action is a list, a subsequent action follows to
			// fetch
			// the detail, so skip this for next time
			// a bit of a hack to capture the getDetail action as well
			if (firstAction.getDef().name.indexOf("Overview") == -1
					&& (firstAction.getDef().name.indexOf("List") == -1 || firstAction.getDef().name
							.indexOf("RelatedList") !== -1)) {
				$A.clientService.unregisterTransaction();
			}
		}
		// #end
	},

	/**
	 * Execute the list of client actions synchronously. Populate state and return values and execute the action
	 * callbacks. This method does not interact with the inFlight counter and does no throttling. All actions will be
	 * run as it is assumed abortable actions have already been pruned.
	 * 
	 * @private
	 */
	runClientActions : function(actions) {
		var action;
		for ( var i = 0; i < actions.length; i++) {
			action = actions[i];
			action.runDeprecated();
			action.finishAction($A.getContext());
		}
	},

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
	 * @private
	 * @param {Array}
	 *            actions the list of actions to process.
	 * @param {FlightCounter}
	 *            the flight counter under which the actions should be run.
	 */
	request : function(actions, flightCounter) {
		$A.mark("AuraClientService.request");
		$A.mark("Action Request Prepared");
		var that = this;
		//
		// NOTE: this is done here, before the callback to avoid a race condition of someone else queueing up
		// an abortable action while we are off waiting for storage.
		//
		var abortableId = this.actionQueue.getLastAbortableTransactionId();
		var collector = new $A.ns.ActionCollector(actions, function() {
			that.finishRequest(collector, flightCounter, abortableId);
		});
		collector.process();
		$A.mark("Action Group " + collector.getCollectorId() + " enqueued");
	},

	/**
	 * The last step before sending to the server.
	 * 
	 * This routine does the actual XHR request to the server, using the collected actions to do so. In the event that
	 * there are no actions to send, it simply completes the request.
	 * 
	 * @private
	 */
	finishRequest : function(collector, flightCounter, abortableId) {
		var actionsToSend = collector.getActionsToSend();
		var actionsToComplete = collector.getActionsToComplete();

		if (actionsToComplete.length > 0) {
			for ( var n = 0; n < actionsToComplete.length; n++) {
				var info = actionsToComplete[n];
				info.action.updateFromResponse(info.response);
				info.action.finishAction($A.getContext());
			}
			this.fireDoneWaiting();
		}

		if (actionsToSend.length > 0) {
			collector.setNum(aura.getContext().incrementNum());

			// clientService.requestQueue reference is mutable
			flightCounter.send();
			var requestConfig = {
				"url" : priv.host + "/aura",
				"method" : "POST",
				"scope" : this,
				"callback" : function(response) {
					this.actionCallback(response, collector, flightCounter, abortableId);
				},
				"params" : {
					"message" : aura.util.json.encode({
						"actions" : actionsToSend
					}),
					"aura.token" : priv.token,
					"aura.context" : $A.getContext().encodeForServer(),
					"aura.num" : collector.getNum()
					// #if {"modes" : ["PTEST"]}
					,
					"beaconData" : $A.getBeaconData()
				// #end
				}
			};
			$A.endMark("Action Group " + collector.getCollectorId() + " enqueued");

			// clear the beaconData
			// #if {"modes" : ["PTEST"]}
			$A.clearBeaconData();
			// #end

			$A.endMark("Action Request Prepared");
			$A.util.transport.request(requestConfig);
			setTimeout(function() {
				$A.get("e.aura:waiting").fire();
			}, 1);
		} else {
			// We didn't send a request, so clean up the in-flight counter.
			flightCounter.cancel();
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
		if (window.applicationCache
				&& (window.applicationCache.status === window.applicationCache.UNCACHED || window.applicationCache.status === window.applicationCache.OBSOLETE)) {
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
	},

	setConnectedFalse : function() {
		if (priv.isDisconnected) {
			return;
		}
		e = $A.get("e.aura:connectionLost");
		if (e) {
			priv.isDisconnected = true;
			e.fire();
		} else {
			// looks like no definitions loaded yet
			alert("Connection lost");
		}
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
