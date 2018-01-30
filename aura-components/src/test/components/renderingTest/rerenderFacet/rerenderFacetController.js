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
    one: function(cmp, event, helper) {
        cmp.set("v.one", !cmp.get("v.one"));
    },

    two: function(cmp, event, helper) {
        cmp.set("v.two", !cmp.get("v.two"));
    },

    three: function(cmp, event, helper) {
        cmp.set("v.three", !cmp.get("v.three"));
    },

    four: function(cmp, event, helper) {
        var value = !cmp.get("v.four")
        cmp.set("v.four", value);

        if (!value) {
            cmp.set("v.facet1", []);
            cmp.set("v.facet2", []);
            cmp.set("v.component", null);
        }
    },

    rerenderAuraExpression: function(cmp) {
        if (!cmp.get("v.four")) {
            return;
        }

        var components = [
            ["renderingTest:html", null],
            ["renderingTest:html", null],
            ["renderingTest:html", null]
        ];

        $A.createComponents(components, function(newCmps) {
            cmp.set("v.facet1", [newCmps[0]]);
            cmp.set("v.facet2", [newCmps[1]]);
            cmp.set("v.component", newCmps[2]);
        });
    }

})
