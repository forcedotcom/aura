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
var p = $A.ns.Util.prototype;
p["isIE"] = p.isIE;
p["isIOSWebView"] = p.isIOSWebView;
p["isArray"] = p.isArray;
p["isBoolean"] = p.isBoolean;
p["isObject"] = p.isObject;
p["isError"] = p.isError;
p["isFunction"] = p.isFunction;
p["isNumber"] = p.isNumber;
p["isFiniteNumber"] = p.isFiniteNumber;
p["isString"] = p.isString;
p["isUndefined"] = p.isUndefined;
p["isUndefinedOrNull"] = p.isUndefinedOrNull;
p["isEmpty"] = p.isEmpty;
p["getElement"] = p.getElement;
p["getBooleanValue"] = p.getBooleanValue;
p["hasClass"] = p.hasClass;
p["addClass"] = p.addClass;
p["removeClass"] = p.removeClass;
p["toggleClass"] = p.toggleClass;
p["swapClass"] = p.swapClass;
p["insertFirst"] = p.insertFirst;
p["insertBefore"] = p.insertBefore;
p["insertAfter"] = p.insertAfter;
p["removeElement"] = p.removeElement;
p["attachToDocumentBody"] = p.attachToDocumentBody;
p["stringEndsWith"] = p.stringEndsWith;
p["urlDecode"] = p.urlDecode;
p["trim"] = p.trim;
p["truncate"] = p.truncate;
p["on"] = p.on;
p["removeOn"] = p.removeOn;
p["formToMap"] = p.formToMap;
p["getSelectValue"] = p.getSelectValue;
p["addValueToMap"] = p.addValueToMap;
p["addMapValueToMap"] = p.addMapValueToMap;
p["isSubDef"] = p.isSubDef;
p["getElementAttributeValue"] = p.getElementAttributeValue;
p["getDataAttribute"] = p.getDataAttribute;
p["setDataAttribute"] = p.setDataAttribute;
p["hasDataAttribute"] = p.hasDataAttribute;
p["createTimeoutCallback"] = p.createTimeoutCallback;
p["arrayIndexOf"] = p.arrayIndexOf;
p["contains"] = p.contains;
p["squash"] = p.squash;
p["stripTags"] = p.stripTags;
p["getWindowSize"] = p.getWindowSize;
p["isComponent"] = p.isComponent;
p["isValue"] = p.isValue;
p["instanceOf"] = p.instanceOf;
p["supportsTouchEvents"] = p.supportsTouchEvents;
p["estimateSize"] = p.estimateSize;
p["createPromise"] = p.createPromise;
p["when"] = p.when;
p["lookup"] = p.lookup;
p["map"] = p.map;
p["reduce"] = p.reduce;
p["forEach"] = p.forEach;
p["merge"] = p.merge;
p["every"] = p.every;
p["some"] = p.some;
p["filter"] = p.filter;
p["keys"] = p.keys;
p["bind"] = p.bind;
p["includeScript"] = p.includeScript;
p["equalBySource"] = p.equalBySource;

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
p["getDebugToolComponent"] = p.getDebugToolComponent;
p["setDebugToolWindow"] = p.setDebugToolWindow;
p["getDebugToolsAuraInstance"] = p.getDebugToolsAuraInstance;
p["getUrl"] = p.getUrl;
p["getText"] = p.getText;
p["errorBasedOnMode"] = p.errorBasedOnMode;
//#end

