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
 * Construct a SecureRTCPeerConnection wrapper.
 * Note: This is a temporary wrapper for SPARK team only. Not exposed to any external customers.
 *
 * @public
 * @class
 * @constructor
 */
function SecureRTCPeerConnection(raw, key) {
    "use strict";
    var SecureConstructor = function(configuration) {
        var rtc = new raw(configuration);
        var o = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureRTCPeerConnection: " + rtc + "{ key: " + JSON.stringify(key) + " }";
                }
            }
        });
        ls_setRef(o, rtc, key);
        // Reference to the original event target functions
        var originalAddEventListener = rtc["addEventListener"];
        var originalDispatchEvent = rtc["dispatchEvent"];
        var originalRemoveEventListener = rtc["removeEventListener"];
        var options = { rawArguments: true };
        // Override the event target functions to handled wrapped arguments
        Object.defineProperties(rtc, {
            "addEventListener" : {
                writable : true,
                value : function(event, callback, useCapture) {
                    if (!callback) {
                        return;
                    }
                    var sCallback = ls_getFromCache(callback, key);
                    if (!sCallback) {
                        sCallback = function(e) {
                            ls_verifyAccess(o, callback, true);
                            var se = SecureDOMEvent(e, key);
                            callback.call(o, se);
                        };
                        ls_addToCache(callback, sCallback, key);
                        ls_setKey(callback, key);
                    }
                    originalAddEventListener.call(rtc, event, sCallback, useCapture);
                }
            },
            "dispatchEvent" : {
                enumerable : true,
                writable : true,
                value : function() {
                    var filteredArgs = SecureObject.filterArguments(o, arguments, options);
                    var fnReturnedValue = originalDispatchEvent.apply(rtc, filteredArgs);
                    if (options && options.afterCallback) {
                        fnReturnedValue = options.afterCallback(fnReturnedValue);
                    }
                    return SecureObject.filterEverything(o, fnReturnedValue, options);
                }
            },
            "removeEventListener" : {
                writable : true,
                value : function(type, listener, removeOption) {
                    var sCallback = ls_getFromCache(listener, key);
                    originalRemoveEventListener.call(rtc, type, sCallback, removeOption);
                }
            }
        });
        return rtc;
    };
    SecureConstructor.prototype = raw.prototype;
    return SecureConstructor;
}

// TODO: The following metadata is for future use
var DEFAULT = SecureElement.DEFAULT;
var EVENT = SecureElement.EVENT;
var FUNCTION = SecureElement.FUNCTION;
var FUNCTION_RAW_ARGS = SecureElement.FUNCTION_RAW_ARGS;
var READ_ONLY_PROPERTY = { writable : false };
var RAW = { type: "@raw" };

SecureRTCPeerConnection.metadata = {
    "prototypes": {
        "RTCPeerConnection" : {
            "addIceCandidate" :                 FUNCTION_RAW_ARGS,
            "addStream" :                       FUNCTION_RAW_ARGS,
            "addTrack" :                        FUNCTION_RAW_ARGS,
            "canTrickleIceCandidates" :         DEFAULT,
            "close" :                           FUNCTION,
            "connectionState":                  DEFAULT,
            "createAnswer" :                    FUNCTION,
            "createOffer" :                     FUNCTION,
            "currentLocalDescription" :         DEFAULT,
            "currentRemoteDescription" :        DEFAULT,
            "defaultIceServers" :               DEFAULT,
            "generateCertificate" :             FUNCTION,
            "getConfiguration" :                FUNCTION,
            "getIdentityAssertion" :            FUNCTION,
            "getLocalStreams" :                 FUNCTION,
            "getRemoteStreams" :                FUNCTION,
            "getSenders" :                      FUNCTION,
            "getStats" :                        FUNCTION,
            "getStreamById" :                   FUNCTION,
            "iceConnectionState" :              READ_ONLY_PROPERTY,
            "iceGatheringState " :              READ_ONLY_PROPERTY,
            "localDescription" :                READ_ONLY_PROPERTY,
            "onaddstream" :                     EVENT,
            "onconnectionstatechange" :         EVENT,
            "ondatachannel " :                  EVENT,
            "onicecandidate" :                  EVENT,
            "oniceconnectionstatechange" :      EVENT,
            "onicegatheringstatechange" :       EVENT,
            "onidentityresult" :                EVENT,
            "onidpassertionerror " :            EVENT,
            "onidpvalidationerror" :            EVENT,
            "onnegotiationneeded " :            EVENT,
            "onpeeridentity" :                  EVENT,
            "onremovestream" :                  EVENT,
            "onsignalingstatechange " :         EVENT,
            "ontrack" :                         EVENT,
            "peerIdentity" :                    READ_ONLY_PROPERTY,
            "pendingLocalDescription" :         DEFAULT,
            "pendingRemoteDescription" :        READ_ONLY_PROPERTY,
            "remoteDescription" :               READ_ONLY_PROPERTY,
            "removeStream" :                    FUNCTION_RAW_ARGS,
            "removeTrack" :                     FUNCTION_RAW_ARGS,
            "sctp" :                            DEFAULT,
            "setConfiguration" :                FUNCTION_RAW_ARGS,
            "setIdentityProvider" :             FUNCTION,
            "setLocalDescription" :             FUNCTION_RAW_ARGS,
            "setRemoteDescription" :            FUNCTION_RAW_ARGS,
            "signalingState" :                  READ_ONLY_PROPERTY
        }
    }
};
