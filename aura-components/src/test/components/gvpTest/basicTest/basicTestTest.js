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
	
	testSetNotSupported: {
    	test: function(cmp) {
            try {
                $A.set("$Label.whatever.anything","new value");
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: Unable to set value for key '$Label.whatever.anything'. Value provider does not implement 'set(key, value)'. : false", e.message);
            }
    	}
    },
    
    testSetNoValueProvider: {
    	test: function(cmp) {
            try {
                $A.set("$Bla.whatever.anything","new value");
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: Unable to set value for key '$Bla.whatever.anything'. No value provider was found for '$Bla'. : false", e.message);
            }
    	}
    },
    
    /*
     * v.attributeLabel is initialized with '$Label.Related_Lists.task_mode_today'
     * This test verify that changing v.attributeLabel won't update $Label
     * for W-2676281
     */
    testNoUpdateGVPFromComponent: {
    	test: function(cmp) {
    		var actual, expected;
    		var oldValueLabel = $A.get("$Label.Related_Lists.task_mode_today");
    		//change attribute value
    		expected = "data";
    		cmp.set("v.attributeLabel", expected);
    		actual = cmp.get('v.attributeLabel');
    		$A.test.assertEquals(expected, actual);
    		$A.test.assertEquals(oldValueLabel, $A.get("$Label.Related_Lists.task_mode_today"), "we don't update GVP from component");
    	}
    }
})