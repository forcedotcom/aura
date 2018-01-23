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
     * Verify setting value.
     */
    testValue: {
        attributes : {value: "Initial value"},
        test: [function(component){
            $A.test.assertEquals("Initial value", component.getElement().value, "Textarea value not correctly initialized.");
            component.set("v.value", "Changed value");
        }, function(component){
            $A.test.assertEquals("Changed value", component.getElement().value, "Textarea value not correctly changed.");
        }]
    },
    /**
     * Verify setting disabled attribute to true, then switching to false.
     */
    testDisabled: {
        attributes : {disabled: true},
        test: [function(component){
            $A.test.assertTrue(component.getElement().disabled, "Textarea not correctly disabled");
            component.set("v.disabled", false);
        }, function(component){
            $A.test.assertFalse(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }]
    },
    /**
     * Verify not setting disabled attribute to false, then switching to true.
     */
    testNotDisabled: {
        attributes : {disabled: false},
        test: [function(component){
            $A.test.assertFalse(component.getElement().disabled, "Textarea not correctly enabled");
            component.set("v.disabled", true);
        }, function(component){
            $A.test.assertTrue(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }]
    },
    /**
     * Verify setting readonly attribute to true, then switching to false.
     */
    testReadonly: {
        attributes : {readonly: 'true'},
        test: [function(component){
            $A.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.set("v.readonly", false);
        }, function(component){
            $A.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }]
    },
    /**
     * Verify setting readonly attribute to false, then switching to true.
     */
    testNotReadonly: {
        attributes : {readonly: 'false'},
        test: [function(component){
            $A.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.set("v.readonly", true);
        }, function(component){
            $A.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }]
    },
    /**
     * Verify setting rows attribute.
     */
    testRows: {
        attributes : {rows: "15"},
        test: function(component){
            $A.test.assertEquals(15, component.getElement().rows, "Textarea rows attribute not correct");
        }
    },
    /**
     * Verify setting columns attribute.
     */
    testCols: {
        attributes : {cols: "15"},
        test: function(component){
            $A.test.assertEquals(15, component.getElement().cols, "Textarea cols attribute not correct");
        }
    },
    /**
     * Verify setting resizable attribute to true, then switching to false.
     */
    testResizable: {
        attributes : {resizable: true},
        doNotWrapInAuraRun : true,
        test: function(component){
        	var textarea = document.createElement('textarea');
        	if (textarea.hasAttribute("resizable")) {
        		// resizable is supported
            	$A.test.assertEquals('both', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea not correctly resizable");
                component.set("v.resizable", false);
                $A.rerender(component);
                $A.test.assertEquals('none', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea resizable attribute not correct after switching.");
        	}
        }
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/
