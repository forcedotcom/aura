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
    waitForLayoutItems: function(component, callback){
        aura.test.runAfterIf(
            function(){
            	return $A.util.hasClass(component.find("ready").getElement(),"layoutDone");
            },
            callback);
    },

    /**
     * layout item contains just markup
     */
    testMarkup: {
        attributes : {__layout: '#markup'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('text1text2', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout item references action that returns one component
     */
    testActionSingleComponent: {
        attributes : {__layout: '#action?input=1'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('action:java:0', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('initial', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout item references action that returns multiple components
     */
    testActionMultipleComponents: {
        attributes : {__layout: '#action?input=3'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('action:java:2action:java:1action:java:0', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('initial', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout item references action that returns no component
     */
    testActionNoComponent: {
        attributes : {__layout: '#action?input=0'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('initial', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout has item with markup and item referencing action that returns one component
     */
    testMarkupAndActionSingleComponent: {
        attributes : {__layout: '#markupAndAction?input=1'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('text', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('markupAndAction:java:0', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },


    /**
     * layout has item with markup and item referencing action that returns multiple components
     */
    testMarkupAndActionMultipleComponents: {
        attributes : {__layout: '#markupAndAction?input=2'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('text', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('markupAndAction:java:1markupAndAction:java:0', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout has item with markup and item referencing action that returns no component
     */
    testMarkupAndActionNoComponent: {
        attributes : {__layout: '#markupAndAction?input=0'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('text', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout has item referencing action that returns one component and item with markup
     */
    testActionSingleComponentAndMarkup: {
        attributes : {__layout: '#actionAndMarkup?input=1'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('actionAndMarkup:java:0', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('text', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },


    /**
     * layout has item referencing action that returns multiple components and item with markup
     */
    testActionMultipleComponentsAndMarkup: {
        attributes : {__layout: '#actionAndMarkup?input=3'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('actionAndMarkup:java:2actionAndMarkup:java:1actionAndMarkup:java:0', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('text', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    },

    /**
     * layout has item referencing action that returns no component and item with markup
     */
    testActionNoComponentAndMarkup: {
        attributes : {__layout: '#actionAndMarkup?input=0'},
        test: function(component){
            this.waitForLayoutItems(component, function(){
                aura.test.assertEquals('', $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals('text', $A.test.getText(component.find("containerB").getElement()), "B content not expected");
            });
        }
    }
})
