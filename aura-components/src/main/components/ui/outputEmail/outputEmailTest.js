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
     * Verify outputEmail can display label.
     */
    testLabel: {
        attributes : {value : 'aura-test@salesforce.com', label: 'Email us'},
        test: function(component){
        	var link = component.find("link").getElement();
            aura.test.assertEquals('Email us', link.textContent, "Value attribute not correct");
            aura.test.assertTrue(aura.test.contains(link.href,'mailto:aura-test@salesforce.com'), "Value attribute not correct");
        }
    },

    /**
     * Verify outputEmail displays email as default label.
     */
    testLabelEmpty: {
        attributes : {value : 'aura-test@salesforce.com', label: ''},
        test: function(component){
        	var link = component.find("link").getElement();
            aura.test.assertTrue(aura.test.contains(link.href,'mailto:aura-test@salesforce.com'), "Value attribute not correct");
            aura.test.assertEquals('aura-test@salesforce.com', link.textContent, "Label attribute not correct");
        }
    },

    /**
     * Verify outputEmail can display email.
     */
    testValue: {
        attributes : {value : 'aura-test@salesforce.com', 'class' : 'myClass'},
        test: function(component){
        	var link = component.find("link").getElement();
        	aura.test.assertTrue(aura.test.contains(link.href,'mailto:aura-test@salesforce.com'), "Value attribute not correct");
            aura.test.assertEquals('aura-test@salesforce.com', link.textContent, "Label attribute not correct");
            aura.test.assertTrue($A.util.hasClass(link, "myClass"), "myClass class not correctly added");
        }
    },

    /**
     * Verify outputEmail displays the link even if the email address is wrong as we don't want to
     * do any validation for display
     */
    testValueInvalid: {
        attributes : {value : 'salesforce.com'},
        test: function(component){
        	var link = component.find("link").getElement();
            aura.test.assertTrue(aura.test.contains(link.href,'mailto:salesforce.com'), "Value attribute not correct");
            aura.test.assertEquals('salesforce.com', link.textContent, "label attribute not correct");
        }
    },

    /**
     * Verify outputEmail sets chains through class attribute even for invalid email addresses
     */
    testValueInvalidWithClass: {
        attributes : {value : 'salesforce.com', 'class' : 'myClass'},
        test: function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "myClass"), "myClass class not correctly added");
            aura.test.assertEquals('salesforce.com', component.find("link").getElement().textContent, "label attribute not correct");
        }
    },

    /**
     * Verify empty value still displays tag without the href.
     */
    testValueEmptyString: {
        attributes : {value : '', label : 'email me'},
        test: function(component){
             $A.test.assertEquals(null, component.getElement(), "unexpected elements");
        }
    },

    /**
     * Verify all-whitespace value still displays tag without the href.
     */
    _testValueOnlyWhitespace: {
        attributes : {value : '    ', label : 'email me'},
        test: function(component){
            $A.test.assertEquals(null, component.getElement(), "unexpected elements");
        }
    }
})
