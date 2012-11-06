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
({
    testProviderSettingAttributes: {
        attributes : {
            a1 : "a1",
            a2 : "a2",
            value : "aura"
        },

        test: function(component){
            aura.test.assertEquals("a1Provider", component.getAttributes().getValue("a1").getValue(), "a1 should have been overriden by provider");
            aura.test.assertTrue(component.getAttributes().getValue("a2").getValue()===undefined, "a2 should have been made undefined by provider");
            aura.test.assertEquals("b1Provider", component.getAttributes().getValue("b1").getValue(), "b1 should have been set by provider");
            aura.test.assertEquals("aura", component.getAttributes().getValue("value").getValue(), "value should have been passed through");

            // using something order than a simple string
            aura.test.assertEquals("ar1Provider1", component.getAttributes().getValue("ar1").get(1), "ar1 should have been set by provider");
            aura.test.assertTrue(component.getAttributes().getValue("b2").getValue()===undefined, "b2 should have been undefined");

            $A.test.assertEquals("aura [value]", $A.test.getText(component.find("value").getElement()));

            $A.test.assertEquals("aura [facet]", $A.test.getText(component.find("facet").getElement()));
        }
    },

    _testSetAttributeAbsentFromProvidedComponent: {
        attributes : {"a3" : "a3"},
        test: function(component){
            //Provider sets an attribute on the concrete component based on a3
           aura.test.assertEquals("b2Provider", component.getAttributes().getValue("b2").getValue(), "b2 should have been set by provider");
        }
    }
})
