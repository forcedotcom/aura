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

// //#exportSymbols $A.ns.Test

// asserts
$A.ns.Test.prototype["assert"] = $A.ns.Test.prototype.assert;
$A.ns.Test.prototype["assertTruthy"] = $A.ns.Test.prototype.assertTruthy;
$A.ns.Test.prototype["assertFalsy"] = $A.ns.Test.prototype.assertFalsy;
$A.ns.Test.prototype["assertEquals"] = $A.ns.Test.prototype.assertEquals;
$A.ns.Test.prototype["assertEqualsIgnoreWhitespace"] = $A.ns.Test.prototype.assertEqualsIgnoreWhitespace;
$A.ns.Test.prototype["assertNotEquals"] = $A.ns.Test.prototype.assertNotEquals;
$A.ns.Test.prototype["assertDefined"] = $A.ns.Test.prototype.assertDefined;
$A.ns.Test.prototype["assertTrue"] = $A.ns.Test.prototype.assertTrue;
$A.ns.Test.prototype["assertFalse"] = $A.ns.Test.prototype.assertFalse;
$A.ns.Test.prototype["assertUndefined"] = $A.ns.Test.prototype.assertUndefined;
$A.ns.Test.prototype["assertUndefinedOrNull"] = $A.ns.Test.prototype.assertUndefinedOrNull;
$A.ns.Test.prototype["assertNotUndefinedOrNull"] = $A.ns.Test.prototype.assertNotUndefinedOrNull;
$A.ns.Test.prototype["assertNull"] = $A.ns.Test.prototype.assertNull;
$A.ns.Test.prototype["assertNotNull"] = $A.ns.Test.prototype.assertNotNull;
$A.ns.Test.prototype["assertStartsWith"] = $A.ns.Test.prototype.assertStartsWith;
$A.ns.Test.prototype["assertAccessible"] = $A.ns.Test.prototype.assertAccessible;

// test flow/state
$A.ns.Test.prototype["fail"] = $A.ns.Test.prototype.fail;
$A.ns.Test.prototype["isComplete"] = $A.ns.Test.prototype.isComplete;
$A.ns.Test.prototype["addWaitFor"] = $A.ns.Test.prototype.addWaitFor;
$A.ns.Test.prototype["addWaitForAction"] = $A.ns.Test.prototype.addWaitForAction;
$A.ns.Test.prototype["addWaitForWithFailureMessage"] = $A.ns.Test.prototype.addWaitForWithFailureMessage;
$A.ns.Test.prototype["runAfterIf"] = $A.ns.Test.prototype.runAfterIf;
$A.ns.Test.prototype["setTestTimeout"] = $A.ns.Test.prototype.setTestTimeout;
$A.ns.Test.prototype["getErrors"] = $A.ns.Test.prototype.getErrors;
$A.ns.Test.prototype["addCleanup"] = $A.ns.Test.prototype.addCleanup;
$A.ns.Test.prototype["expectAuraError"] = $A.ns.Test.prototype.expectAuraError;
$A.ns.Test.prototype["expectAuraWarning"] = $A.ns.Test.prototype.expectAuraWarning;
$A.ns.Test.prototype["getAuraErrorMessage"] = $A.ns.Test.prototype.getAuraErrorMessage;

// DOM
$A.ns.Test.prototype["getOuterHtml"] = $A.ns.Test.prototype.getOuterHtml;
$A.ns.Test.prototype["getText"] = $A.ns.Test.prototype.getText;
$A.ns.Test.prototype["getTextByComponent"] = $A.ns.Test.prototype.getTextByComponent;
$A.ns.Test.prototype["getStyle"] = $A.ns.Test.prototype.getStyle;
$A.ns.Test.prototype["getNonCommentNodes"] = $A.ns.Test.prototype.getNonCommentNodes;
$A.ns.Test.prototype["isNodeDeleted"] = $A.ns.Test.prototype.isNodeDeleted;
$A.ns.Test.prototype["select"] = $A.ns.Test.prototype.select;
$A.ns.Test.prototype["getActiveElement"] = $A.ns.Test.prototype.getActiveElement;
$A.ns.Test.prototype["getActiveElementText"] = $A.ns.Test.prototype.getActiveElementText;
$A.ns.Test.prototype["getElementByClass"] = $A.ns.Test.prototype.getElementByClass;
$A.ns.Test.prototype["findChildWithClassName"] = $A.ns.Test.prototype.findChildWithClassName;
$A.ns.Test.prototype["fireDomEvent"] = $A.ns.Test.prototype.fireDomEvent;
$A.ns.Test.prototype["isInstanceOfText"] = $A.ns.Test.prototype.isInstanceOfText;
$A.ns.Test.prototype["isInstanceOfAnchorElement"] = $A.ns.Test.prototype.isInstanceOfAnchorElement;
$A.ns.Test.prototype["isInstanceOfInputElement"] = $A.ns.Test.prototype.isInstanceOfInputElement;
$A.ns.Test.prototype["isInstanceOfLiElement"] = $A.ns.Test.prototype.isInstanceOfLiElement;
$A.ns.Test.prototype["isInstanceOfParagraphElement"] = $A.ns.Test.prototype.isInstanceOfParagraphElement;
$A.ns.Test.prototype["isInstanceOfButtonElement"] = $A.ns.Test.prototype.isInstanceOfButtonElement;
$A.ns.Test.prototype["isInstanceOfImageElement"] = $A.ns.Test.prototype.isInstanceOfImageElement;
$A.ns.Test.prototype["isInstanceOfDivElement"] = $A.ns.Test.prototype.isInstanceOfDivElement;
$A.ns.Test.prototype["isInstanceOfSpanElement"] = $A.ns.Test.prototype.isInstanceOfSpanElement;
$A.ns.Test.prototype["isInstanceOf"] = $A.ns.Test.prototype.isInstanceOf;
$A.ns.Test.prototype["getElementAttributeValue"] = $A.ns.Test.prototype.getElementAttributeValue;
$A.ns.Test.prototype["clickOrTouch"] = $A.ns.Test.prototype.clickOrTouch;

// javascript
$A.ns.Test.prototype["getPrototype"] = $A.ns.Test.prototype.getPrototype;
$A.ns.Test.prototype["overrideFunction"] = $A.ns.Test.prototype.overrideFunction;
$A.ns.Test.prototype["addFunctionHandler"] = $A.ns.Test.prototype.addFunctionHandler;
$A.ns.Test.prototype["objectKeys"] = $A.ns.Test.prototype.objectKeys;

// actions
$A.ns.Test.prototype["callServerAction"] = $A.ns.Test.prototype.callServerAction;
$A.ns.Test.prototype["isActionPending"] = $A.ns.Test.prototype.isActionPending;
$A.ns.Test.prototype["markForCompletion"] = $A.ns.Test.prototype.markForCompletion;
$A.ns.Test.prototype["isComplete"] = $A.ns.Test.prototype.isComplete;
$A.ns.Test.prototype["isSuccessfullyComplete"] = $A.ns.Test.prototype.isSuccessfullyComplete;
$A.ns.Test.prototype["clearCompletion"] = $A.ns.Test.prototype.clearCompletion;
$A.ns.Test.prototype["getAction"] = $A.ns.Test.prototype.getAction;
$A.ns.Test.prototype["getExternalAction"] = $A.ns.Test.prototype.getExternalAction;
$A.ns.Test.prototype["blockRequests"] = $A.ns.Test.prototype.blockRequests;
$A.ns.Test.prototype["releaseRequests"] = $A.ns.Test.prototype.releaseRequests;
$A.ns.Test.prototype["getSentRequestCount"] = $A.ns.Test.prototype.getSentRequestCount;
$A.ns.Test.prototype["enqueueAction"] = $A.ns.Test.prototype.enqueueAction;
$A.ns.Test.prototype["runActionsAsTransaction"] = $A.ns.Test.prototype.runActionsAsTransaction;
$A.ns.Test.prototype["clearAndAssertComponentConfigs"] = $A.ns.Test.prototype.clearAndAssertComponentConfigs;

// events
$A.ns.Test.prototype["addEventHandler"] = $A.ns.Test.prototype.addEventHandler;

// internal functions
$A.ns.Test.prototype["run"] = $A.ns.Test.prototype.run;
$A.ns.Test.prototype["getDump"] = $A.ns.Test.prototype.getDump;
$A.ns.Test.prototype["dummyFunction"] = $A.ns.Test.prototype.dummyFunction;

// appcache
$A.ns.Test.prototype["getAppCacheEvents"] = $A.ns.Test.prototype.getAppCacheEvents;
// //#end
