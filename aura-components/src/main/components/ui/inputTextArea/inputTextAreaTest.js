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
    /**
     * Verify setting value.
     */
    testValue: {
        attributes : {value: "Initial value"},
        test: function(component){
        debugger;
            aura.test.assertEquals("Initial value", component.getElement().value, "Textarea value not correctly initialized.");
            component.getValue("v.value").setValue("Changed value");
            $A.rerender(component);
            aura.test.assertEquals("Changed value", component.getElement().value, "Textarea value not correctly changed.");
        }
    },
    /**
     * Verify setting disabled attribute to true, then switching to false.
     */
    testDisabled: {
        attributes : {disabled: true},
        test: function(component){
            aura.test.assertTrue(component.getElement().disabled, "Textarea not correctly disabled");
            component.getValue("v.disabled").setValue(false);
            $A.rerender(component);
            aura.test.assertFalse(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }
    },
    /**
     * Verify not setting disabled attribute to false, then switching to true.
     */
    testNotDisabled: {
        attributes : {disabled: false},
        test: function(component){
            aura.test.assertFalse(component.getElement().disabled, "Textarea not correctly enabled");
            component.getValue("v.disabled").setValue(true);
            $A.rerender(component);
            aura.test.assertTrue(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }
    },
    /**
     * Verify setting readonly attribute to true, then switching to false.
     */
    testReadonly: {
        attributes : {readonly: 'true'},
        test: function(component){
            aura.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.getValue("v.readonly").setValue(false);
            $A.rerender(component);
            aura.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }
    },
    /**
     * Verify setting readonly attribute to false, then switching to true.
     */
    testNotReadonly: {
        attributes : {readonly: 'false'},
        test: function(component){
            aura.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.getValue("v.readonly").setValue(true);
            $A.rerender(component);
            aura.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }
    },
    /**
     * Verify setting rows attribute.
     */
    testRows: {
        attributes : {rows: "15"},
        test: function(component){
            aura.test.assertEquals(15, component.getElement().rows, "Textarea rows attribute not correct");
        }
    },
    /**
     * Verify setting columns attribute.
     */
    testCols: {
        attributes : {cols: "15"},
        test: function(component){
            aura.test.assertEquals(15, component.getElement().cols, "Textarea cols attribute not correct");
        }
    },
    /**
     * Verify setting resizable attribute to true, then switching to false.
     */
    testResizable: {
        attributes : {resizable: true},
        test: function(component){
            var textarea = document.createElement('textarea');
            if (textarea.hasAttribute("resizable")) {
            	// resizable is supported
                aura.test.assertEquals('both', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea not correctly resizable");
                component.getValue("v.resizable").setValue(false);
                $A.rerender(component);
                aura.test.assertEquals('none', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea resizable attribute not correct after switching.");
            }
        }
    }
})
