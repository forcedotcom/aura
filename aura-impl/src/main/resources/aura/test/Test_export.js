/*
 * Copyright (C) 2012 salesforce.com, inc.
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
var p = test;
exp(p,
    "run", p.run,
    "addWaitFor", p.addWaitFor,
    "callServerAction", p.callServerAction,
    "isActionPending", p.isActionPending,
    "getServerControllerInstance", p.getServerControllerInstance,
    "runAfterIf", p.runAfterIf,
    "setTestTimeout", p.setTestTimeout,
    "isComplete", p.isComplete,
    "getErrors", p.getErrors,
    "getDump", p.getDump,
    "init", p.init,
    "assert", p.assert,
    "assertTruthy", p.assertTruthy,
    "assertFalsy", p.assertFalsy,
    "assertEquals", p.assertEquals,
    "assertTrue", p.assertTrue,
    "assertFalse", p.assertFalse,
    "assertUndefinedOrNull", p.assertUndefinedOrNull,
    "assertNull", p.assertNull,
    "assertNotNull", p.assertNotNull,
    "fail", p.fail,
    "getPrototype", p.getPrototype,
    "overrideFunction", p.overrideFunction,
    "addFunctionHandler", p.addFunctionHandler,
    "getOuterHtml", p.getOuterHtml,
    "getText", p.getText,
    "getTextByComponent", p.getTextByComponent,
    "getStyle", p.getStyle,
    "getNonCommentNodes", p.getNonCommentNodes,
    "isNodeDeleted", p.isNodeDeleted,
    "select", p.select,
    "dummyFunction", p.dummyFunction,
    "checkUndefinedMsg", p.checkUndefinedMsg
);
