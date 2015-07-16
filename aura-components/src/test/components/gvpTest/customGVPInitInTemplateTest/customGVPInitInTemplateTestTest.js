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
	 * Verify that setting value of GVP to the same current value won't actually do anything.
	 * Note : We cannot hook up value change handler for GVP directly in component, instead we assign 
	 * the GVP to a attribute in cmp (v.gvpValue), then add value change handler on it.
	 * W-2676281
	 */
    testSetSameValueNoOp : {
    	test: [function(component){
    		$A.test.blockRequests();
    		component.set("v.valueChanged", false);
    		//set it to new value, should trigger change event
        	$A.set("$CustomInitInTemplate.task_mode_today","Tomorrow");
        	
        	//sanity check
        	var res = $A.get("$CustomInitInTemplate.task_mode_today");
        	$A.test.assertEquals("Tomorrow", res, "fail to set the value in Custom Global Value Provider");
        }, function(component) {
        	$A.test.assertTrue(component.get("v.valueChanged"), "we just change value in custom gvp");
        	component.set("v.valueChanged", false);
        	
        	//set it again, shouldn't trigger change event.
        	$A.set("$CustomInitInTemplate.task_mode_today","Tomorrow");
        }, function(component) {
        	$A.test.assertFalse(component.get("v.valueChanged"), "we don't do anything if new value is the same as old one");
        	$A.test.releaseRequests();
        }]
    }
    
})