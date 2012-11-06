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
    testTrue: {
        attributes : {thang : "true"},

        test: function(component){
            this.whatItIs(component, "true", true);
        }
    },

    testFalse: {
        attributes : {thang : "false"},

        test: function(component){
            this.whatItIs(component, "false", false);
        }
    },

    testUndefined: {
        test: function(component){
            this.whatItIs(component, "undefined", false);
        }

    },

    testEmptyString: {
        attributes: {thang : ''},

        test:function(component){
            this.whatItIs(component, "Empty string", false);
        }
    },

    testRerender: {
        attributes : {thang : "true"},

        test: function(component){
            this.whatItIs(component, "Testing rerender: true", true);
            component.getAttributes().setValue("thang", false);
            $A.rerender(component);
            this.whatItIs(component, "Testing rerender: false", false);
        }
    },

    whatItIs : function(component, name, value){
        if (value) {
            aura.test.assertNotNull(aura.util.getElementByClass("itIsTrue"), name+" didn't evaluate as true");
            aura.test.assertNull(aura.util.getElementByClass("itWishesItWasTrue"), name+" evaluated as true");
            aura.test.assertNull(aura.util.getElementByClass("itIsNotTrue"), name+" evaluated as not true");
            aura.test.assertNotNull(aura.util.getElementByClass("itWishesItWasNotTrue"), name+" didn't evaluate as not true");
        }else{
            aura.test.assertNull(aura.util.getElementByClass("itIsTrue"), name+" evaluated as true");
            aura.test.assertNotNull(aura.util.getElementByClass("itWishesItWasTrue"), name+" didn't evaluate as true");
            aura.test.assertNotNull(aura.util.getElementByClass("itIsNotTrue"), name+" didn't evaluate as not true");
            aura.test.assertNull(aura.util.getElementByClass("itWishesItWasNotTrue"), name+" evaluated as not true");
        }
    }
})
