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
     * Verify setting disabled attribute.
     */
    testDisabled: {
        attributes : {disabled: true},
        test: function(component){
            aura.test.assertTrue(component.find("radio").getElement().disabled, "Element not correctly disabled");
        }
    },
    /**
     * Verify not setting disabled attribute.
     */
    testNotDisabled: {
    	attributes : {disabled: false},
    	test: function(component){
    		aura.test.assertFalse(component.find("radio").getElement().disabled, "Element not correctly enabled");
    	}
    },
    
    /**
     * Verify radio button is clickable
     */
    testClick: {
    	attributes : {name: "testRadio"},
    	test: function(component){
    		radioElement = component.find("radio").getElement();
    		$A.test.clickOrTouch(radioElement);
    		aura.test.assertTrue(radioElement.checked, "Radio Element was not clickable");
    	}
    }
})