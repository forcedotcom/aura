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
    /**
     * Test to verify we don't get stuck in an infinite loop after updating the template to something that isn't
     * already cached on the client.
     */
    testChangeTemplateWithServerRequestThenUpdateBody: {
        test: [
        function(cmp) {
            cmp.set("v.items", ["start1","start2","start3","start4","start5"]);
            cmp.find("iteration").set("v.template", [
                {attributes: {values: {value: "{!item}"}}, componentDef: {descriptor: "aura:expression"}},
                {attributes: {values: {value: ":"}}, componentDef: {descriptor: "aura:text"}},
                {attributes: {values: {value: "{!index}"}}, componentDef: {descriptor: "aura:expression"}},
                {attributes: {values: {value: "\n"}}, componentDef: {descriptor: "aura:text"}},
                
                // This line included to force a server request
                {attributes: {values: {value: "{!item}"}}, componentDef: {descriptor: "ui:inputText"}}
            ]);
            cmp.set("v.items", ["next1","next2","next3","next4","next5"]);

            $A.test.addWaitFor(true, function() {
                return !$A.test.isActionPending() && $A.test.getTextByComponent(cmp.find("iteration")).indexOf("next1") > -1;
            });
        },
        function(cmp) {
            cmp.set("v.items", ["last1","last2","last3","last4","last5"]);
        },
        function(cmp) {
            $A.test.assertTrue($A.test.getTextByComponent(cmp.find("iteration")).indexOf("last1") > -1);
        }]
    },

    /**
     * Verify infinite loop is not encountered when template contains an item with a server-side dependency.
     */
    testChangeTemplateWithServerDependentComponentThenUpdateBody: {
        test: [
        function(cmp) {
            cmp.set("v.items", ["start1","start2","start3","start4","start5"]);
            cmp.find("iteration").set("v.template", [
                {attributes: {values: {value: "{!item}"}}, componentDef: {descriptor: "aura:expression"}},
                {attributes: {values: {value: ":"}}, componentDef: {descriptor: "aura:text"}},
                {attributes: {values: {value: "{!index}"}}, componentDef: {descriptor: "aura:expression"}},
                {attributes: {values: {value: "\n"}}, componentDef: {descriptor: "aura:text"}},
                
                // This line included to force a server request
                {attributes: {values: {value: "{!item}"}}, componentDef: {descriptor: "iterationTest:iterationWithModelInnerCmp"}}
            ]);
            cmp.set("v.items", ["next1","next2","next3","next4","next5"]);

            $A.test.addWaitFor(true, function() {
                return !$A.test.isActionPending() && $A.test.getTextByComponent(cmp.find("iteration")).indexOf("next1") > -1;
            });
        },
        function(cmp) {
            cmp.set("v.items", ["last1","last2","last3","last4","last5"]);
            cmp.set("v.items", []);
            $A.test.addWaitFor(false, $A.test.isActionPending);
        },
        function(cmp) {
            $A.test.assertEquals("", $A.test.getTextByComponent(cmp.find("iteration")));
        }]
    }
})