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
 * Construct a SecureWindow.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            win - the DOM window
 * @param {Object}
 *            key - the key to apply to the secure window
 */
function SecureWindow(win, key, globalAttributeWhitelist) {
    "use strict";

    var o = ls_getFromCache(win, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        document: {
            enumerable: true,
            value: SecureDocument(win.document, key)
        },
        "$A": {
            enumerable: true,
            value: SecureAura(win['$A'], key)
        },
        window: {
            enumerable: true,
            get: function () {
                // circular window references to match DOM API
                return o;
            }
        },
        localStorage: {
            enumerable: true,
            value: SecureStorage(win.localStorage, "LOCAL", key)
        },
        sessionStorage: {
            enumerable: true,
            value: SecureStorage(win.sessionStorage, "SESSION", key)
        },
        MutationObserver: {
            enumerable: true,
            value: SecureMutationObserver(key)
        },
        navigator: {
            enumerable: true,
            value: SecureNavigator(win.navigator, key)
        },
        XMLHttpRequest: {
            enumerable: true,
            value: SecureXMLHttpRequest(key)
        },
        setTimeout: {
            enumerable: true,
            value: function (callback) {
                return setTimeout.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
            }
        },
        setInterval: {
            enumerable: true,
            value: function (callback) {
                return setInterval.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
            }
        },
        location: {
            enumerable: true,
            get: function() {
                return SecureLocation(location, key);
            },
            set: function(value) {
                var ret = location.href = value;
                return ret;
            }
        },
        toString: {
            value: function() {
                return "SecureWindow: " + win + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    SecureObject.addMethodIfSupported(o, win, "getComputedStyle", {
        rawArguments: true
    });

    [ "outerHeight", "outerWidth" ].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, win, name);
    });

    [ "scroll", "scrollBy", "scrollTo" ].forEach(function(name) {
        SecureObject.addMethodIfSupported(o, win, name);
    });

    [ "open"].forEach(function(name) {
        SecureObject.addMethodIfSupported(o, win, name, {
            beforeCallback  : function(url){
                // If an url was provided to window.open()
                if (url && typeof url === "string" && url.length > 1) {
                    // Only allow http|https|relative urls.
                    var schemeRegex = /[\s]*(http:\/\/|https:\/\/|\/)/i;
                    if (!schemeRegex.test(url)){
                        throw new $A.auraError("SecureWindow.open supports http://, https:// schemes and relative urls. It does not support javascript: scheme!");
                    }
                }
            }
        });
    });

    if ("FormData" in win) {
        var formDataValueOverride;
        Object.defineProperty(o, "FormData", {
            get: function() {
                return formDataValueOverride || function() {
                    var args = SecureObject.ArrayPrototypeSlice.call(arguments);
                    // make sure we have access to any <form> passed in to constructor
                    var form;
                    if (args.length > 0) {
                        form = args[0];
                        ls_verifyAccess(o, form);
                    }

                    var rawArgs = form ? [ls_getRef(form, ls_getKey(form))] : [];
                    var cls = win["FormData"];
                    if (typeof cls === "function") {
                        return new (Function.prototype.bind.apply(window["FormData"], [null].concat(rawArgs)));
                    } else {
                        return new cls(rawArgs);
                    }
                };
            },
            set: function(value){
                formDataValueOverride = value;
            }
        });
    }

    if ("Notification" in win) {
        var notificationValueOverride;
        Object.defineProperty(o, "Notification", {
            get: function() {
                if(notificationValueOverride){
                    return notificationValueOverride;
                }
                var notification = SecureNotification(key);
                if ("requestPermission" in win["Notification"]) {
                    Object.defineProperty(notification, "requestPermission", {
                        enumerable : true,
                        value : function(callback) {
                            return Notification["requestPermission"](callback);
                        }
                    });
                }
                if ("permission" in win["Notification"]) {
                    Object.defineProperty(notification, "permission", {
                        enumerable : true,
                        value : Notification["permission"]
                    });
                }
                return notification;
            },
            set: function(value){
                notificationValueOverride = value;
            }
        });
    }

    ["Blob", "File"].forEach(function(name) {
        if(name in win) {
            var valueOverride;
            Object.defineProperty(o, name, {
                get: function () {
                    return valueOverride || function () {
                        var cls = win[name],
                        result,
                        args = Array.prototype.slice.call(arguments);
                        var scriptTagsRegex = /<script[\s\S]*?>[\s\S]*?<\/script[\s]*?>/gi;
                        if (scriptTagsRegex.test(args[0])) {
                            throw new $A.auraError(name + " creation failed: <script> tags are blocked");
                        }
                        if (typeof cls === "function") {
                            //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
                            // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                            result = new (Function.prototype.bind.apply(cls, [null].concat(args)));
                        } else {
                            // For browsers that use a constructor that's not a function, invoke the constructor directly.
                            // For example, on Mobile Safari window["Blob"] returns an object called BlobConstructor
                            // Invoke constructor with specific arguments, handle up to 3 arguments(Blob accepts 2 param, File accepts 3 param)
                            switch (args.length) {
                            case 0:
                                result = new cls();
                                break;
                            case 1:
                                result = new cls(args[0]);
                                break;
                            case 2:
                                result = new cls(args[0], args[1]);
                                break;
                            case 3:
                                result = new cls(args[0], args[1], args[2]);
                                break;
                            }
                        }
                        return result;
                    };
                },
                set: function(value){
                    valueOverride = value;
                }
            });
        }
    });

    SecureElement.addEventTargetMethods(o, win, key);

    // Salesforce API entry points (first phase) - W-3046191 is tracking adding $A.lockerService.publish() API enhancement where we will move these
    // to their respective javascript/container architectures
    ["sforce", "Sfdc"].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, win, name);
    });

    SecureObject.addRTCMediaApis(o, win, "webkitRTCPeerConnection", key);

    var workerFrame = win.document.getElementById("safeEvalWorkerCustom");
    var safeEvalWindow = workerFrame && workerFrame.contentWindow;            
    var globalScope = safeEvalWindow || win;

    // Has to happen last because it depends on the secure getters defined above that require the object to be keyed
    globalAttributeWhitelist.forEach(function(name) {
        // These are direct passthrough's and should never be wrapped in a SecureObject
        Object.defineProperty(o, name, {
            enumerable: true,
            writable: true,
            value: globalScope[name]
        });
    });

    SecureObject.addPrototypeMethodsAndProperties(SecureWindow.metadata, o, win, key);

    ls_setRef(o, win, key);
    ls_addToCache(win, o, key);
    ls_registerProxy(o);

    return o;
}

var DEFAULT = SecureElement.DEFAULT;
var FUNCTION = SecureElement.FUNCTION;
var EVENT = SecureElement.EVENT;
var CTOR = { type: "@ctor" };
var RAW = { type: "@raw" };

SecureWindow.metadata = {
        "prototypes": {
            "Window" : {
                "$A":                                   DEFAULT,
                "AnalyserNode":                         FUNCTION,
                "AnimationEvent":                       FUNCTION,
                "AppBannerPromptResult":                FUNCTION,
                "ApplicationCache":                     FUNCTION,
                "ApplicationCacheErrorEvent":           FUNCTION,
                "Array":                                RAW,
                "ArrayBuffer":                          RAW,
                "Attr":                                 RAW,
                "Audio":                                CTOR,
                "AudioBuffer":                          FUNCTION,
                "AudioBufferSourceNode":                FUNCTION,
                "AudioContext":                         CTOR,
                "AudioDestinationNode":                 FUNCTION,
                "AudioListener":                        FUNCTION,
                "AudioNode":                            FUNCTION,
                "AudioParam":                           FUNCTION,
                "AudioProcessingEvent":                 FUNCTION,
                "AutocompleteErrorEvent":               FUNCTION,
                "BarProp":                              FUNCTION,
                "BatteryManager":                       FUNCTION,
                "BeforeInstallPromptEvent":             FUNCTION,
                "BeforeUnloadEvent":                    FUNCTION,
                "BiquadFilterNode":                     FUNCTION,
                "BlobEvent":                            FUNCTION,
                "Boolean":                              FUNCTION,
                "CDATASection":                         FUNCTION,
                "CSS":                                  FUNCTION,
                "CSSFontFaceRule":                      FUNCTION,
                "CSSGroupingRule":                      FUNCTION,
                "CSSImportRule":                        FUNCTION,
                "CSSKeyframeRule":                      FUNCTION,
                "CSSKeyframesRule":                     FUNCTION,
                "CSSMediaRule":                         FUNCTION,
                "CSSNamespaceRule":                     FUNCTION,
                "CSSPageRule":                          FUNCTION,
                "CSSRule":                              FUNCTION,
                "CSSRuleList":                          FUNCTION,
                "CSSStyleDeclaration":                  FUNCTION,
                "CSSStyleRule":                         FUNCTION,
                "CSSStyleSheet":                        FUNCTION,
                "CSSSupportsRule":                      FUNCTION,
                "CSSViewportRule":                      FUNCTION,
                "CanvasCaptureMediaStreamTrack":        FUNCTION,
                "CanvasGradient":                       FUNCTION,
                "CanvasPattern":                        FUNCTION,
                "CanvasRenderingContext2D":             RAW,
                "ChannelMergerNode":                    FUNCTION,
                "ChannelSplitterNode":                  FUNCTION,
                "CharacterData":                        FUNCTION,
                "ClientRect":                           FUNCTION,
                "ClientRectList":                       FUNCTION,
                "ClipboardEvent":                       FUNCTION,
                "CloseEvent":                           FUNCTION,
                "Comment":                              CTOR,
                "CompositionEvent":                     FUNCTION,
                "ConvolverNode":                        FUNCTION,
                "Credential":                           FUNCTION,
                "CredentialsContainer":                 FUNCTION,
                "Crypto":                               FUNCTION,
                "CryptoKey":                            FUNCTION,
                "CustomEvent":                          CTOR,
                "DOMError":                             FUNCTION,
                "DOMException":                         FUNCTION,
                "DOMImplementation":                    FUNCTION,
                "DOMParser":                            RAW,
                "DOMStringList":                        FUNCTION,
                "DOMStringMap":                         FUNCTION,
                "DOMTokenList":                         FUNCTION,
                "DataTransfer":                         FUNCTION,
                "DataTransferItem":                     FUNCTION,
                "DataTransferItemList":                 FUNCTION,
                "DataView":                             FUNCTION,
                "Date":                                 RAW,
                "DelayNode":                            FUNCTION,
                "DeviceMotionEvent":                    FUNCTION,
                "DeviceOrientationEvent":               FUNCTION,
                "Document":                             FUNCTION,
                "DocumentFragment":                     FUNCTION,
                "DocumentType":                         FUNCTION,
                "DragEvent":                            FUNCTION,
                "DynamicsCompressorNode":               FUNCTION,
                "ES6Promise":                           DEFAULT,
                "Element":                              RAW,
                "Error":                                FUNCTION,
                "ErrorEvent":                           FUNCTION,
                "EvalError":                            FUNCTION,
                "Event":                                FUNCTION,
                "EventSource":                          FUNCTION,
                "EventTarget":                          RAW,
                "FederatedCredential":                  FUNCTION,
                "FileError":                            FUNCTION,
                "FileList":                             RAW,
                "FileReader":                           RAW,
                "Float32Array":                         RAW,
                "Float64Array":                         RAW,
                "FocusEvent":                           FUNCTION,
                "FontFace":                             FUNCTION,
                "Function":                             FUNCTION,
                "GainNode":                             FUNCTION,
                "HTMLAllCollection":                    FUNCTION,
                "HTMLAnchorElement":                    RAW,
                "HTMLAreaElement":                      RAW,
                "HTMLAudioElement":                     RAW,
                "HTMLBRElement":                        RAW,
                "HTMLBaseElement":                      RAW,
                "HTMLBodyElement":                      RAW,
                "HTMLButtonElement":                    RAW,
                "HTMLCanvasElement":                    RAW,
                "HTMLCollection":                       RAW,
                "HTMLContentElement":                   RAW,
                "HTMLDListElement":                     RAW,
                "HTMLDataListElement":                  RAW,
                "HTMLDetailsElement":                   RAW,
                "HTMLDialogElement":                    RAW,
                "HTMLDirectoryElement":                 RAW,
                "HTMLDivElement":                       RAW,
                "HTMLDocument":                         RAW,
                "HTMLElement":                          RAW,
                "HTMLEmbedElement":                     RAW,
                "HTMLFieldSetElement":                  RAW,
                "HTMLFontElement":                      RAW,
                "HTMLFormControlsCollection":           FUNCTION,
                "HTMLFormElement":                      RAW,
                "HTMLFrameElement":                     RAW,
                "HTMLFrameSetElement":                  RAW,
                "HTMLHRElement":                        RAW,
                "HTMLHeadElement":                      RAW,
                "HTMLHeadingElement":                   RAW,
                "HTMLHtmlElement":                      RAW,
                "HTMLIFrameElement":                    RAW,
                "HTMLImageElement":                     RAW,
                "HTMLInputElement":                     RAW,
                "HTMLKeygenElement":                    RAW,
                "HTMLLIElement":                        RAW,
                "HTMLLabelElement":                     RAW,
                "HTMLLegendElement":                    RAW,
                "HTMLLinkElement":                      RAW,
                "HTMLMapElement":                       RAW,
                "HTMLMarqueeElement":                   RAW,
                "HTMLMediaElement":                     RAW,
                "HTMLMenuElement":                      RAW,
                "HTMLMetaElement":                      RAW,
                "HTMLMeterElement":                     RAW,
                "HTMLModElement":                       RAW,
                "HTMLOListElement":                     RAW,
                "HTMLObjectElement":                    RAW,
                "HTMLOptGroupElement":                  RAW,
                "HTMLOptionElement":                    RAW,
                "HTMLOptionsCollection":                RAW,
                "HTMLOutputElement":                    RAW,
                "HTMLParagraphElement":                 RAW,
                "HTMLParamElement":                     RAW,
                "HTMLPictureElement":                   RAW,
                "HTMLPreElement":                       RAW,
                "HTMLProgressElement":                  RAW,
                "HTMLQuoteElement":                     RAW,
                "HTMLScriptElement":                    RAW,
                "HTMLSelectElement":                    RAW,
                "HTMLShadowElement":                    RAW,
                "HTMLSourceElement":                    RAW,
                "HTMLSpanElement":                      RAW,
                "HTMLStyleElement":                     RAW,
                "HTMLTableCaptionElement":              RAW,
                "HTMLTableCellElement":                 RAW,
                "HTMLTableColElement":                  RAW,
                "HTMLTableElement":                     RAW,
                "HTMLTableRowElement":                  RAW,
                "HTMLTableSectionElement":              RAW,
                "HTMLTemplateElement":                  RAW,
                "HTMLTextAreaElement":                  RAW,
                "HTMLTitleElement":                     RAW,
                "HTMLTrackElement":                     RAW,
                "HTMLUListElement":                     RAW,
                "HTMLUnknownElement":                   RAW,
                "HTMLVideoElement":                     RAW,
                "HashChangeEvent":                      FUNCTION,
                "IdleDeadline":                         FUNCTION,
                "Image":                                CTOR,
                "ImageBitmap":                          FUNCTION,
                "ImageData":                            FUNCTION,
                "Infinity":                             DEFAULT,
                "InputDeviceCapabilities":              FUNCTION,
                "Int16Array":                           FUNCTION,
                "Int32Array":                           FUNCTION,
                "Int8Array":                            FUNCTION,
                "Intl":                                 DEFAULT,
                "JSON":                                 DEFAULT,
                "KeyboardEvent":                        FUNCTION,
                "Location":                             FUNCTION,
                "MIDIAccess":                           FUNCTION,
                "MIDIConnectionEvent":                  FUNCTION,
                "MIDIInput":                            FUNCTION,
                "MIDIInputMap":                         FUNCTION,
                "MIDIMessageEvent":                     FUNCTION,
                "MIDIOutput":                           FUNCTION,
                "MIDIOutputMap":                        FUNCTION,
                "MIDIPort":                             FUNCTION,
                "Map":                                  RAW,
                "Math":                                 DEFAULT,
                "MediaDevices":                         DEFAULT,
                "MediaElementAudioSourceNode":          FUNCTION,
                "MediaEncryptedEvent":                  FUNCTION,
                "MediaError":                           FUNCTION,
                "MediaKeyMessageEvent":                 FUNCTION,
                "MediaKeySession":                      FUNCTION,
                "MediaKeyStatusMap":                    FUNCTION,
                "MediaKeySystemAccess":                 FUNCTION,
                "MediaKeys":                            FUNCTION,
                "MediaList":                            FUNCTION,
                "MediaQueryList":                       FUNCTION,
                "MediaQueryListEvent":                  FUNCTION,
                "MediaRecorder":                        CTOR,
                "MediaSource":                          FUNCTION,
                "MediaStreamAudioDestinationNode":      CTOR,
                "MediaStreamAudioSourceNode":           CTOR,
                "MediaStreamEvent":                     CTOR,
                "MediaStreamTrack":                     FUNCTION,
                "MessageChannel":                       RAW,
                "MessageEvent":                         RAW,
                "MessagePort":                          RAW,
                "MimeType":                             FUNCTION,
                "MimeTypeArray":                        FUNCTION,
                "MutationObserver":                     CTOR,
                "MutationRecord":                       FUNCTION,
                "MouseEvent":                           CTOR,
                "NaN":                                  DEFAULT,
                "NamedNodeMap":                         FUNCTION,
                "Navigator":                            FUNCTION,
                "Node":                                 RAW,
                "NodeFilter":                           FUNCTION,
                "NodeIterator":                         FUNCTION,
                "NodeList":                             FUNCTION,
                "Number":                               FUNCTION,
                "Object":                               FUNCTION,
                "OfflineAudioCompletionEvent":          FUNCTION,
                "OfflineAudioContext":                  FUNCTION,
                "Option":                               CTOR,
                "OscillatorNode":                       FUNCTION,
                "PERSISTENT":                           DEFAULT,
                "PageTransitionEvent":                  FUNCTION,
                "PasswordCredential":                   FUNCTION,
                "Path2D":                               FUNCTION,
                "Performance":                          RAW,
                "PerformanceEntry":                     FUNCTION,
                "PerformanceMark":                      FUNCTION,
                "PerformanceMeasure":                   FUNCTION,
                "PerformanceNavigation":                FUNCTION,
                "PerformanceResourceTiming":            FUNCTION,
                "PerformanceTiming":                    FUNCTION,
                "PeriodicWave":                         FUNCTION,
                "PopStateEvent":                        FUNCTION,
                "Presentation":                         FUNCTION,
                "PresentationAvailability":             FUNCTION,
                "PresentationConnection":               FUNCTION,
                "PresentationConnectionAvailableEvent": FUNCTION,
                "PresentationConnectionCloseEvent":     FUNCTION,
                "PresentationRequest":                  FUNCTION,
                "ProcessingInstruction":                FUNCTION,
                "ProgressEvent":                        FUNCTION,
                "Promise":                              FUNCTION,
                "PromiseRejectionEvent":                FUNCTION,
                "RTCCertificate":                       FUNCTION,
                "RTCIceCandidate":                      FUNCTION,
                "RTCSessionDescription":                FUNCTION,
                "RadioNodeList":                        FUNCTION,
                "Range":                                FUNCTION,
                "RangeError":                           FUNCTION,
                "ReadableByteStream":                   FUNCTION,
                "ReadableStream":                       FUNCTION,
                "ReferenceError":                       FUNCTION,
                "Reflect":                              DEFAULT,
                "RegExp":                               FUNCTION,
                "Request":                              FUNCTION,
                "Response":                             FUNCTION,
                "SVGAElement":                          FUNCTION,
                "SVGAngle":                             FUNCTION,
                "SVGAnimateElement":                    FUNCTION,
                "SVGAnimateMotionElement":              FUNCTION,
                "SVGAnimateTransformElement":           FUNCTION,
                "SVGAnimatedAngle":                     FUNCTION,
                "SVGAnimatedBoolean":                   FUNCTION,
                "SVGAnimatedEnumeration":               FUNCTION,
                "SVGAnimatedInteger":                   FUNCTION,
                "SVGAnimatedLength":                    FUNCTION,
                "SVGAnimatedLengthList":                FUNCTION,
                "SVGAnimatedNumber":                    FUNCTION,
                "SVGAnimatedNumberList":                FUNCTION,
                "SVGAnimatedPreserveAspectRatio":       FUNCTION,
                "SVGAnimatedRect":                      FUNCTION,
                "SVGAnimatedString":                    FUNCTION,
                "SVGAnimatedTransformList":             FUNCTION,
                "SVGAnimationElement":                  RAW,
                "SVGCircleElement":                     RAW,
                "SVGClipPathElement":                   RAW,
                "SVGComponentTransferFunctionElement":  RAW,
                "SVGCursorElement":                     RAW,
                "SVGDefsElement":                       RAW,
                "SVGDescElement":                       RAW,
                "SVGDiscardElement":                    RAW,
                "SVGElement":                           RAW,
                "SVGEllipseElement":                    RAW,
                "SVGFEBlendElement":                    RAW,
                "SVGFEColorMatrixElement":              RAW,
                "SVGFEComponentTransferElement":        RAW,
                "SVGFECompositeElement":                RAW,
                "SVGFEConvolveMatrixElement":           RAW,
                "SVGFEDiffuseLightingElement":          RAW,
                "SVGFEDisplacementMapElement":          RAW,
                "SVGFEDistantLightElement":             RAW,
                "SVGFEDropShadowElement":               RAW,
                "SVGFEFloodElement":                    RAW,
                "SVGFEFuncAElement":                    RAW,
                "SVGFEFuncBElement":                    RAW,
                "SVGFEFuncGElement":                    RAW,
                "SVGFEFuncRElement":                    RAW,
                "SVGFEGaussianBlurElement":             RAW,
                "SVGFEImageElement":                    RAW,
                "SVGFEMergeElement":                    RAW,
                "SVGFEMergeNodeElement":                RAW,
                "SVGFEMorphologyElement":               RAW,
                "SVGFEOffsetElement":                   RAW,
                "SVGFEPointLightElement":               RAW,
                "SVGFESpecularLightingElement":         RAW,
                "SVGFESpotLightElement":                RAW,
                "SVGFETileElement":                     RAW,
                "SVGFETurbulenceElement":               RAW,
                "SVGFilterElement":                     RAW,
                "SVGForeignObjectElement":              RAW,
                "SVGGElement":                          RAW,
                "SVGGeometryElement":                   RAW,
                "SVGGradientElement":                   RAW,
                "SVGGraphicsElement":                   RAW,
                "SVGImageElement":                      RAW,
                "SVGLength":                            FUNCTION,
                "SVGLengthList":                        FUNCTION,
                "SVGLineElement":                       RAW,
                "SVGLinearGradientElement":             RAW,
                "SVGMPathElement":                      RAW,
                "SVGMarkerElement":                     RAW,
                "SVGMaskElement":                       RAW,
                "SVGMatrix":                            RAW,
                "SVGMetadataElement":                   RAW,
                "SVGNumber":                            FUNCTION,
                "SVGNumberList":                        FUNCTION,
                "SVGPathElement":                       RAW,
                "SVGPatternElement":                    RAW,
                "SVGPoint":                             FUNCTION,
                "SVGPointList":                         FUNCTION,
                "SVGPolygonElement":                    RAW,
                "SVGPolylineElement":                   RAW,
                "SVGPreserveAspectRatio":               FUNCTION,
                "SVGRadialGradientElement":             RAW,
                "SVGRect":                              FUNCTION,
                "SVGRectElement":                       RAW,
                "SVGSVGElement":                        RAW,
                "SVGScriptElement":                     RAW,
                "SVGSetElement":                        RAW,
                "SVGStopElement":                       RAW,
                "SVGStringList":                        FUNCTION,
                "SVGStyleElement":                      RAW,
                "SVGSwitchElement":                     RAW,
                "SVGSymbolElement":                     RAW,
                "SVGTSpanElement":                      RAW,
                "SVGTextContentElement":                RAW,
                "SVGTextElement":                       RAW,
                "SVGTextPathElement":                   RAW,
                "SVGTextPositioningElement":            RAW,
                "SVGTitleElement":                      RAW,
                "SVGTransform":                         FUNCTION,
                "SVGTransformList":                     FUNCTION,
                "SVGUnitTypes":                         FUNCTION,
                "SVGUseElement":                        RAW,
                "SVGViewElement":                       RAW,
                "SVGViewSpec":                          FUNCTION,
                "SVGZoomEvent":                         FUNCTION,
                "Screen":                               FUNCTION,
                "ScreenOrientation":                    FUNCTION,
                "SecurityPolicyViolationEvent":         FUNCTION,
                "Selection":                            FUNCTION,
                "Set":                                  RAW,
                "SourceBuffer":                         FUNCTION,
                "SourceBufferList":                     FUNCTION,
                "SpeechSynthesisEvent":                 FUNCTION,
                "SpeechSynthesisUtterance":             FUNCTION,
                "String":                               RAW,
                "StyleSheet":                           FUNCTION,
                "StyleSheetList":                       FUNCTION,
                "SubtleCrypto":                         FUNCTION,
                "Symbol":                               RAW,
                "SyntaxError":                          FUNCTION,
                "TEMPORARY":                            DEFAULT,
                "Text":                                 CTOR,
                "TextDecoder":                          FUNCTION,
                "TextEncoder":                          RAW,
                "TextEvent":                            FUNCTION,
                "TextMetrics":                          FUNCTION,
                "TextTrack":                            FUNCTION,
                "TextTrackCue":                         FUNCTION,
                "TextTrackCueList":                     FUNCTION,
                "TextTrackList":                        FUNCTION,
                "TimeRanges":                           RAW,
                "Touch":                                FUNCTION,
                "TouchEvent":                           FUNCTION,
                "TouchList":                            FUNCTION,
                "TrackEvent":                           FUNCTION,
                "TransitionEvent":                      FUNCTION,
                "TreeWalker":                           FUNCTION,
                "TypeError":                            FUNCTION,
                "UIEvent":                              FUNCTION,
                "URIError":                             FUNCTION,
                "URL":                                  RAW,
                "URLSearchParams":                      FUNCTION,
                "Uint16Array":                          RAW,
                "Uint32Array":                          RAW,
                "Uint8Array":                           RAW,
                "Uint8ClampedArray":                    RAW,
                "VTTCue":                               FUNCTION,
                "ValidityState":                        FUNCTION,
                "WaveShaperNode":                       FUNCTION,
                "WeakMap":                              RAW,
                "WeakSet":                              RAW,
                "WebGLActiveInfo":                      FUNCTION,
                "WebGLBuffer":                          FUNCTION,
                "WebGLContextEvent":                    FUNCTION,
                "WebGLFramebuffer":                     FUNCTION,
                "WebGLProgram":                         FUNCTION,
                "WebGLRenderbuffer":                    FUNCTION,
                "WebGLRenderingContext":                FUNCTION,
                "WebGLShader":                          FUNCTION,
                "WebGLShaderPrecisionFormat":           FUNCTION,
                "WebGLTexture":                         FUNCTION,
                "WebGLUniformLocation":                 FUNCTION,
                "WebKitAnimationEvent":                 FUNCTION,
                "WebKitCSSMatrix":                      CTOR,
                "WebKitTransitionEvent":                FUNCTION,
                "WebSocket":                            RAW,
                "WheelEvent":                           FUNCTION,
                "Window":                               FUNCTION,
                "XMLDocument":                          FUNCTION,
                "XMLHttpRequest":                       CTOR,
                "XMLHttpRequestEventTarget":            FUNCTION,
                "XMLHttpRequestUpload":                 FUNCTION,
                "XMLSerializer":                        CTOR,
                "XPathEvaluator":                       FUNCTION,
                "XPathExpression":                      FUNCTION,
                "XPathResult":                          FUNCTION,
                "XSLTProcessor":                        FUNCTION,
                "alert":                                FUNCTION,
                "atob":                                 FUNCTION,
                "aura":                                 DEFAULT,
                "blur":                                 FUNCTION,
                "btoa":                                 FUNCTION,
                "cancelAnimationFrame":                 FUNCTION,
                "cancelIdleCallback":                   FUNCTION,
                "captureEvents":                        FUNCTION,
                "chrome":                               DEFAULT,
                "clearInterval":                        FUNCTION,
                "clearTimeout":                         FUNCTION,
                "close":                                FUNCTION,
                "closed":                               DEFAULT,
                "confirm":                              FUNCTION,
                "console":                              RAW,
                "createImageBitmap":                    FUNCTION,
                "crypto":                               DEFAULT,
                "decodeURI":                            FUNCTION,
                "decodeURIComponent":                   FUNCTION,
                "defaultStatus":                        DEFAULT,
                "defaultstatus":                        DEFAULT,
                "devicePixelRatio":                     DEFAULT,
                "document":                             DEFAULT,
                "encodeURI":                            FUNCTION,
                "encodeURIComponent":                   FUNCTION,
                "escape":                               FUNCTION,
                "fetch":                                FUNCTION,
                "find":                                 FUNCTION,
                "focus":                                FUNCTION,
                "frameElement":                         DEFAULT,
                "frames":                               DEFAULT,
                "getComputedStyle":                     FUNCTION,
                "getMatchedCSSRules":                   FUNCTION,
                "getSelection":                         FUNCTION,
                "history":                              RAW,
                "innerHeight":                          DEFAULT,
                "innerWidth":                           DEFAULT,
                "isFinite":                             FUNCTION,
                "isNaN":                                FUNCTION,
                "isSecureContext":                      DEFAULT,
                "length":                               DEFAULT,
                "localStorage":                         DEFAULT,
                "locationbar":                          DEFAULT,
                "matchMedia":                           FUNCTION,
                "menubar":                              DEFAULT,
                "moveBy":                               FUNCTION,
                "moveTo":                               FUNCTION,
                "name":                                 DEFAULT,
                "navigator":                            DEFAULT,
                "offscreenBuffering":                   DEFAULT,
                "onabort":                              EVENT,
                "onanimationend":                       EVENT,
                "onanimationiteration":                 EVENT,
                "onanimationstart":                     EVENT,
                "onautocomplete":                       EVENT,
                "onautocompleteerror":                  EVENT,
                "onbeforeunload":                       EVENT,
                "onblur":                               EVENT,
                "oncancel":                             EVENT,
                "oncanplay":                            EVENT,
                "oncanplaythrough":                     EVENT,
                "onchange":                             EVENT,
                "onclick":                              EVENT,
                "onclose":                              EVENT,
                "oncontextmenu":                        EVENT,
                "oncuechange":                          EVENT,
                "ondblclick":                           EVENT,
                "ondevicemotion":                       EVENT,
                "ondeviceorientation":                  EVENT,
                "ondeviceorientationabsolute":          EVENT,
                "ondrag":                               EVENT,
                "ondragend":                            EVENT,
                "ondragenter":                          EVENT,
                "ondragleave":                          EVENT,
                "ondragover":                           EVENT,
                "ondragstart":                          EVENT,
                "ondrop":                               EVENT,
                "ondurationchange":                     EVENT,
                "onemptied":                            EVENT,
                "onended":                              EVENT,
                "onerror":                              EVENT,
                "onfocus":                              EVENT,
                "onhashchange":                         EVENT,
                "oninput":                              EVENT,
                "oninvalid":                            EVENT,
                "onkeydown":                            EVENT,
                "onkeypress":                           EVENT,
                "onkeyup":                              EVENT,
                "onlanguagechange":                     EVENT,
                "onload":                               EVENT,
                "onloadeddata":                         EVENT,
                "onloadedmetadata":                     EVENT,
                "onloadstart":                          EVENT,
                "onmessage":                            EVENT,
                "onmousedown":                          EVENT,
                "onmouseenter":                         EVENT,
                "onmouseleave":                         EVENT,
                "onmousemove":                          EVENT,
                "onmouseout":                           EVENT,
                "onmouseover":                          EVENT,
                "onmouseup":                            EVENT,
                "onmousewheel":                         EVENT,
                "onoffline":                            EVENT,
                "ononline":                             EVENT,
                "onpagehide":                           EVENT,
                "onpageshow":                           EVENT,
                "onpause":                              EVENT,
                "onplay":                               EVENT,
                "onplaying":                            EVENT,
                "onpopstate":                           EVENT,
                "onprogress":                           EVENT,
                "onratechange":                         EVENT,
                "onrejectionhandled":                   EVENT,
                "onreset":                              EVENT,
                "onresize":                             EVENT,
                "onscroll":                             EVENT,
                "onsearch":                             EVENT,
                "onseeked":                             EVENT,
                "onseeking":                            EVENT,
                "onselect":                             EVENT,
                "onshow":                               EVENT,
                "onstalled":                            EVENT,
                "onstorage":                            EVENT,
                "onsubmit":                             EVENT,
                "onsuspend":                            EVENT,
                "ontimeupdate":                         EVENT,
                "ontoggle":                             EVENT,
                "ontransitionend":                      EVENT,
                "ontouchcancel":               	  		EVENT,
                "ontouchend":                	  		EVENT,
                "ontouchmove":                	  		EVENT,
                "ontouchstart":                	  		EVENT,
                "onunhandledrejection":                 EVENT,
                "onunload":                             EVENT,
                "onvolumechange":                       EVENT,
                "onwaiting":                            EVENT,
                "onwheel":                              EVENT,
                "open":                                 FUNCTION,
                "outerHeight":                          DEFAULT,
                "outerWidth":                           DEFAULT,
                "pageStartTime":                        DEFAULT,
                "pageXOffset":                          DEFAULT,
                "pageYOffset":                          DEFAULT,
                "parent":                               DEFAULT,
                "parseFloat":                           FUNCTION,
                "parseInt":                             FUNCTION,
                "performance":                          RAW,
                "personalbar":                          DEFAULT,
                "postMessage":                          FUNCTION,
                "print":                                FUNCTION,
                "prompt":                               FUNCTION,
                "releaseEvents":                        FUNCTION,
                "requestAnimationFrame":                FUNCTION,
                "requestIdleCallback":                  FUNCTION,
                "resizeBy":                             FUNCTION,
                "resizeTo":                             FUNCTION,
                "screen":                               RAW,
                "screenLeft":                           DEFAULT,
                "screenTop":                            DEFAULT,
                "screenX":                              DEFAULT,
                "screenY":                              DEFAULT,
                "scroll":                               FUNCTION,
                "scrollBy":                             FUNCTION,
                "scrollTo":                             FUNCTION,
                "scrollX":                              DEFAULT,
                "scrollY":                              DEFAULT,
                "scrollbars":                           DEFAULT,
                "sessionStorage":                       DEFAULT,
                "self":                                 DEFAULT,
                "setInterval":                          FUNCTION,
                "setTimeout":                           FUNCTION,
                "status":                               DEFAULT,
                "statusbar":                            DEFAULT,
                "stop":                                 FUNCTION,
                "styleMedia":                           DEFAULT,
                "toolbar":                              DEFAULT,
                "top":                                  DEFAULT,
                "undefined":                            DEFAULT,
                "unescape":                             FUNCTION,
                "window":                               DEFAULT
            },
            "EventTarget": SecureElement.eventTargetMetadata
        }
};