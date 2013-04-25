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
var p = Test;
exp(p,
	// asserts
    "assert", p.assert,
    "assertTruthy", p.assertTruthy,
    "assertFalsy", p.assertFalsy,
    "assertEquals", p.assertEquals,
    "assertNotEquals", p.assertNotEquals,
    "assertDefined", p.assertDefined,
    "assertTrue", p.assertTrue,
    "assertFalse", p.assertFalse,
    "assertUndefinedOrNull", p.assertUndefinedOrNull,
    "assertNull", p.assertNull,
    "assertNotNull", p.assertNotNull,
    "assertStartsWith", p.assertStartsWith,
    
    // test flow/state
    "fail", p.fail,
    "isComplete", p.isComplete,
    "addWaitFor", p.addWaitFor,
    "addWaitForWithFailureMessage", p.addWaitForWithFailureMessage,
    "runAfterIf", p.runAfterIf,
    "setTestTimeout", p.setTestTimeout,
    "getErrors", p.getErrors,
    "addCleanup", p.addCleanup,
    
    // DOM
    "getOuterHtml", p.getOuterHtml,
    "getText", p.getText,
    "getTextByComponent", p.getTextByComponent,
    "getStyle", p.getStyle,
    "getNonCommentNodes", p.getNonCommentNodes,
    "isNodeDeleted", p.isNodeDeleted,
    "select", p.select,
    "getActiveElement", p.getActiveElement,
    "getActiveElementText", p.getActiveElementText,
    "getElementByClass", p.getElementByClass,
    "fireDomEvent",	p.fireDomEvent,
    "isInstanceOfText", p.isInstanceOfText,
    "isInstanceOfAnchorElement", p.isInstanceOfAnchorElement,
    "isInstanceOfInputElement", p.isInstanceOfInputElement,
    "isInstanceOfLiElement", p.isInstanceOfLiElement,
    "isInstanceOfParagraphElement", p.isInstanceOfParagraphElement,
    "isInstanceOfButtonElement", p.isInstanceOfButtonElement,
    "isInstanceOfImageElement", p.isInstanceOfImageElement,
    "isInstanceOfDivElement", p.isInstanceOfDivElement,
    "isInstanceOf", p.isInstanceOf,
    "getElementAttributeValue", p.getElementAttributeValue,
    
    // javascript
    "getPrototype", p.getPrototype,
    "overrideFunction", p.overrideFunction,
    "addFunctionHandler", p.addFunctionHandler,
    "objectKeys", p.objectKeys,
    
    // actions
    
    "callServerAction", p.callServerAction,
    "isActionPending", p.isActionPending,
    "getAction", p.getAction,
    "getExternalAction", p.getExternalAction,

    // internal functions
    "run", run,
    "getDump", getDump,
    "dummyFunction", p.dummyFunction,
    
    // appcache
    "getAppCacheEvents", p.getAppCacheEvents
);
