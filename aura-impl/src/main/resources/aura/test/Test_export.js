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

// //#exportSymbols TestInstance

// asserts
TestInstance.prototype["assert"] = TestInstance.prototype.assert;
TestInstance.prototype["assertTruthy"] = TestInstance.prototype.assertTruthy;
TestInstance.prototype["assertFalsy"] = TestInstance.prototype.assertFalsy;
TestInstance.prototype["assertEquals"] = TestInstance.prototype.assertEquals;
TestInstance.prototype["assertEqualsIgnoreWhitespace"] = TestInstance.prototype.assertEqualsIgnoreWhitespace;
TestInstance.prototype["assertNotEquals"] = TestInstance.prototype.assertNotEquals;
TestInstance.prototype["assertDefined"] = TestInstance.prototype.assertDefined;
TestInstance.prototype["assertTrue"] = TestInstance.prototype.assertTrue;
TestInstance.prototype["assertFalse"] = TestInstance.prototype.assertFalse;
TestInstance.prototype["assertUndefined"] = TestInstance.prototype.assertUndefined;
TestInstance.prototype["assertUndefinedOrNull"] = TestInstance.prototype.assertUndefinedOrNull;
TestInstance.prototype["assertNotUndefinedOrNull"] = TestInstance.prototype.assertNotUndefinedOrNull;
TestInstance.prototype["assertNull"] = TestInstance.prototype.assertNull;
TestInstance.prototype["assertNotNull"] = TestInstance.prototype.assertNotNull;
TestInstance.prototype["assertStartsWith"] = TestInstance.prototype.assertStartsWith;
TestInstance.prototype["assertAccessible"] = TestInstance.prototype.assertAccessible;

// utils
TestInstance.prototype["compareValues"] = TestInstance.prototype.compareValues;
TestInstance.prototype["areActionsComplete"] = TestInstance.prototype.areActionsComplete;

// test flow/state
TestInstance.prototype["fail"] = TestInstance.prototype.fail;
TestInstance.prototype["isComplete"] = TestInstance.prototype.isComplete;
TestInstance.prototype["addWaitFor"] = TestInstance.prototype.addWaitFor;
TestInstance.prototype["addWaitForAction"] = TestInstance.prototype.addWaitForAction;
TestInstance.prototype["addWaitForWithFailureMessage"] = TestInstance.prototype.addWaitForWithFailureMessage;
TestInstance.prototype["runAfterIf"] = TestInstance.prototype.runAfterIf;
TestInstance.prototype["setTestTimeout"] = TestInstance.prototype.setTestTimeout;
TestInstance.prototype["getErrors"] = TestInstance.prototype.getErrors;
TestInstance.prototype["addCleanup"] = TestInstance.prototype.addCleanup;
TestInstance.prototype["expectAuraError"] = TestInstance.prototype.expectAuraError;
TestInstance.prototype["expectAuraWarning"] = TestInstance.prototype.expectAuraWarning;
TestInstance.prototype["getAuraErrorMessage"] = TestInstance.prototype.getAuraErrorMessage;
TestInstance.prototype["executeAfterCkEditorIsReady"] = TestInstance.prototype.executeAfterCkEditorIsReady;

// DOM
TestInstance.prototype["getOuterHtml"] = TestInstance.prototype.getOuterHtml;
TestInstance.prototype["getText"] = TestInstance.prototype.getText;
TestInstance.prototype["getTextByComponent"] = TestInstance.prototype.getTextByComponent;
TestInstance.prototype["getStyle"] = TestInstance.prototype.getStyle;
TestInstance.prototype["getNonCommentNodes"] = TestInstance.prototype.getNonCommentNodes;
TestInstance.prototype["isNodeDeleted"] = TestInstance.prototype.isNodeDeleted;
TestInstance.prototype["select"] = TestInstance.prototype.select;
TestInstance.prototype["getActiveElement"] = TestInstance.prototype.getActiveElement;
TestInstance.prototype["getActiveElementText"] = TestInstance.prototype.getActiveElementText;
TestInstance.prototype["getElementByClass"] = TestInstance.prototype.getElementByClass;
TestInstance.prototype["findChildWithClassName"] = TestInstance.prototype.findChildWithClassName;
TestInstance.prototype["fireDomEvent"] = TestInstance.prototype.fireDomEvent;
TestInstance.prototype["isInstanceOfText"] = TestInstance.prototype.isInstanceOfText;
TestInstance.prototype["isInstanceOfAnchorElement"] = TestInstance.prototype.isInstanceOfAnchorElement;
TestInstance.prototype["isInstanceOfInputElement"] = TestInstance.prototype.isInstanceOfInputElement;
TestInstance.prototype["isInstanceOfLiElement"] = TestInstance.prototype.isInstanceOfLiElement;
TestInstance.prototype["isInstanceOfParagraphElement"] = TestInstance.prototype.isInstanceOfParagraphElement;
TestInstance.prototype["isInstanceOfButtonElement"] = TestInstance.prototype.isInstanceOfButtonElement;
TestInstance.prototype["isInstanceOfImageElement"] = TestInstance.prototype.isInstanceOfImageElement;
TestInstance.prototype["isInstanceOfDivElement"] = TestInstance.prototype.isInstanceOfDivElement;
TestInstance.prototype["isInstanceOfSpanElement"] = TestInstance.prototype.isInstanceOfSpanElement;
TestInstance.prototype["isInstanceOf"] = TestInstance.prototype.isInstanceOf;
TestInstance.prototype["getElementAttributeValue"] = TestInstance.prototype.getElementAttributeValue;
TestInstance.prototype["clickOrTouch"] = TestInstance.prototype.clickOrTouch;

// javascript
TestInstance.prototype["getPrototype"] = TestInstance.prototype.getPrototype;
TestInstance.prototype["overrideFunction"] = TestInstance.prototype.overrideFunction;
TestInstance.prototype["addFunctionHandler"] = TestInstance.prototype.addFunctionHandler;
TestInstance.prototype["objectKeys"] = TestInstance.prototype.objectKeys;

// actions
TestInstance.prototype["callServerAction"] = TestInstance.prototype.callServerAction;
TestInstance.prototype["isActionPending"] = TestInstance.prototype.isActionPending;
TestInstance.prototype["markForCompletion"] = TestInstance.prototype.markForCompletion;
TestInstance.prototype["isComplete"] = TestInstance.prototype.isComplete;
TestInstance.prototype["isSuccessfullyComplete"] = TestInstance.prototype.isSuccessfullyComplete;
TestInstance.prototype["clearComplete"] = TestInstance.prototype.clearComplete;
TestInstance.prototype["getAction"] = TestInstance.prototype.getAction;
TestInstance.prototype["getExternalAction"] = TestInstance.prototype.getExternalAction;
TestInstance.prototype["blockRequests"] = TestInstance.prototype.blockRequests;
TestInstance.prototype["blockForegroundRequests"] = TestInstance.prototype.blockForegroundRequests;
TestInstance.prototype["blockBackgroundRequests"] = TestInstance.prototype.blockBackgroundRequests;
TestInstance.prototype["releaseRequests"] = TestInstance.prototype.releaseRequests;
TestInstance.prototype["releaseForegroundRequests"] = TestInstance.prototype.releaseForegroundRequests;
TestInstance.prototype["releaseBackgroundRequests"] = TestInstance.prototype.releaseBackgroundRequests;
TestInstance.prototype["getSentRequestCount"] = TestInstance.prototype.getSentRequestCount;
TestInstance.prototype["enqueueAction"] = TestInstance.prototype.enqueueAction;
TestInstance.prototype["clearAndAssertComponentConfigs"] = TestInstance.prototype.clearAndAssertComponentConfigs;
TestInstance.prototype["setServerReachable"] = TestInstance.prototype.setServerReachable;
TestInstance.prototype["getActionQueue"] = TestInstance.prototype.getActionQueue;

// events
TestInstance.prototype["addEventHandler"] = TestInstance.prototype.addEventHandler;

// internal functions
TestInstance.prototype["run"] = TestInstance.prototype.run;
TestInstance.prototype["getDump"] = TestInstance.prototype.getDump;
TestInstance.prototype["dummyFunction"] = TestInstance.prototype.dummyFunction;

// appcache
TestInstance.prototype["getAppCacheEvents"] = TestInstance.prototype.getAppCacheEvents;
// //#end
