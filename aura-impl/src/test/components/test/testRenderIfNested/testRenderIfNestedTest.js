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
    testOuterTrue: {
        attributes : {outer : "true", inner: "false"},

        test: function(component){
            this.whatItIs(component, "Outer is True, inner false:", true, false);
        }
    },

    testOuterFalse: {
        attributes : {outer : "false", inner : "true"},

        test: function(component){
            this.whatItIs(component, "Outer is false, inner true:", false, true);
        }
    },

    testRerender: {
        attributes : {outer : "true", inner : "false"},

        test: function(component){
            this.whatItIs(component, "Testing rerender, outer is true, inner false:", true, false);
            component.getAttributes().setValue("outer", false);
            component.getAttributes().setValue("inner", true);
            $A.rerender(component);
            this.whatItIs(component, "Testing rerender, outer is false, inner true:", false, true);
        }
    },

    whatItIs : function(component, name, outervalue, innervalue){
        if(outervalue){
            aura.test.assertNotNull($A.test.getElementByClass("outerIsTrue"), name+"Outer renderIf was not displayed.");
            aura.test.assertNull($A.test.getElementByClass("outerIsFalse"), name+"Outer else was displayed");
        }else{
            aura.test.assertNull($A.test.getElementByClass("outerIsTrue"), name+"Outer renderIf was displayed.");
            aura.test.assertNotNull($A.test.getElementByClass("outerIsFalse"), name+"Outer else was not displayed");
        }
        if (innervalue) {
            aura.test.assertNotNull($A.test.getElementByClass("itIsTrue"), name+"{!v.inner} didn't evaluate as true");
            aura.test.assertNull($A.test.getElementByClass("itWishesItWasTrue"), name+"{!v.inner} evaluated as false");
            aura.test.assertNull($A.test.getElementByClass("itIsNotTrue"), name+"{! !v.inner} evaluated as true");
            aura.test.assertNotNull($A.test.getElementByClass("itWishesItWasNotTrue"), name+"{! !v.inner} didn't evaluate as false");
        }else{
            aura.test.assertNull($A.test.getElementByClass("itIsTrue"), name+"{!v.inner} evaluated as true");
            aura.test.assertNotNull($A.test.getElementByClass("itWishesItWasTrue"), name+"{!v.inner} didn't evaluate as false");
            aura.test.assertNotNull($A.test.getElementByClass("itIsNotTrue"), name+"{! !v.inner} didn't evaluate as true");
            aura.test.assertNull($A.test.getElementByClass("itWishesItWasNotTrue"), name+"{! !v.inner} evaluated as false");
        }
    }
})
