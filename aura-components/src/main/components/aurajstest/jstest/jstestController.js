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
({
    init  : function(cmp) {
        var a = cmp.get("c.getTestCases");
        var params = {
            "descriptor" : cmp.get("v.descriptor")
        };
        var testFilter = cmp.get("v.test");
        if (!$A.util.isUndefinedOrNull(testFilter)) {
            params["test"] = testFilter;
        }
        a.setParams(params);
        a.setCallback(this, function(action){
            if (action.getState() === "SUCCESS") {
                var tests = action.getReturnValue();
                cmp.set("v.testCases", tests);
            } else if (action.getState() === "ERROR") {
                throw new Error(action.getError()[0].message);
            }
        });
        $A.enqueueAction(a);
    },

    testDone : function(cmp, evt, helper) {
        helper.runNextTest(cmp);
    },

    toggleCode: function(cmp) {
        var codeEl = cmp.find("test-suite-code").getElement();
        $A.util.toggleClass(codeEl, "show");

        var code = cmp.get("v.testSuiteCode");
        if ($A.util.isUndefinedOrNull(code)){
            var a = cmp.get("c.getSource");
            a.setParams({
                "descriptor" : cmp.get("v.descriptor")
            });
            a.setCallback(this, function(action){
                cmp.set("v.testSuiteCode", action.getReturnValue());
            });
            $A.enqueueAction(a);
        }
    }

})// eslint-disable-line semi
