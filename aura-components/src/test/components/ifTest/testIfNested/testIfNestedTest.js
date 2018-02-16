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
	testOuterTrue: {
        attributes : {outer : true, inner: false},
        test: function(component){
            this.whatItIs(component, "Outer is True, inner false:", true, false);
        }
    },

    testOuterFalse: {
        attributes : {outer : false, inner : true},
        test: function(component){
            this.whatItIs(component, "Outer is false, inner true:", false, true);
        }
    },

    // TODO(W-1419175): onchange events don't fire across function expressions
    _testRerender: {
        attributes : {outer : true, inner : false},
        test: function(component){
            this.whatItIs(component, "Testing rerender, outer is true, inner false:", true, false);
            component.set("v.outer", false);
            component.set("v.inner", true);
            $A.rerender(component);
            this.whatItIs(component, "Testing rerender, outer is false, inner true:", false, true);
        }
    },

    // BUG: W-4039086
    // The issue here is that if can not remove elements from the facetInfo collection, depending on the rendering cycle functions.
    // When can we safely destroy the facetInfo collection after unrendering it?
    // You can't do it if you're inside a renderIf, so need to figure some things out here.
    _testRawNestedIfs: {
        test: function(component) {
            var container = component.find("container");
            var containerElement = container.getElement();

            component.edit();

            // Break the thread
            setTimeout(function(){
                component.save();
            }, 100);
            
            // Wait for the Edit button to be the only thing left.
            $A.test.addWaitFor(true, function() {
                var buttons = containerElement.querySelectorAll("button");
                if(buttons.length !== 1) {
                    return false;
                }

                var button = buttons[0];
                return button != null && $A.util.hasClass(button, "edit");
            });

        }
    },


    whatItIs : function(component, name, outervalue, innervalue){
        if (outervalue) {
            $A.test.assertNotNull($A.test.getElementByClass("outerIsTrue"), name+"Outer If was not displayed.");
            $A.test.assertNull($A.test.getElementByClass("outerIsFalse"), name+"Outer else was displayed");
        } else {
            $A.test.assertNull($A.test.getElementByClass("outerIsTrue"), name+"Outer rIf was displayed.");
            $A.test.assertNotNull($A.test.getElementByClass("outerIsFalse"), name+"Outer else was not displayed");
        }
    	if (innervalue) {
            $A.test.assertNotNull($A.test.getElementByClass("itIsTrue"), name+"{!v.inner} didn't evaluate as true");
            $A.test.assertNull($A.test.getElementByClass("itWishesItWasTrue"), name+"{!v.inner} evaluated as false");
            $A.test.assertNull($A.test.getElementByClass("itIsNotTrue"), name+"{! !v.inner} evaluated as true");
            $A.test.assertNotNull($A.test.getElementByClass("itWishesItWasNotTrue"), name+"{! !v.inner} didn't evaluate as false");
        } else {
            $A.test.assertNull($A.test.getElementByClass("itIsTrue"), name+"{!v.inner} evaluated as true");
            $A.test.assertNotNull($A.test.getElementByClass("itWishesItWasTrue"), name+"{!v.inner} didn't evaluate as false");
            $A.test.assertNotNull($A.test.getElementByClass("itIsNotTrue"), name+"{! !v.inner} didn't evaluate as true");
            $A.test.assertNull($A.test.getElementByClass("itWishesItWasNotTrue"), name+"{! !v.inner} evaluated as false");
        }
    }
})