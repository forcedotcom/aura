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
	 * Verifying that the change and click handler both change inputCheckboxes values
	 * Blocked from IOS and IPAD because clicking on an input does not seem to work when using clickOrTouch, works fine manually
	 */
    testClickVsChanged : {
    	browsers : ["-IPHONE", "-IPAD"],
    	test : [function (cmp){   	
    		//Verify that the outputTexts are set to their default value of the inputCheckbox
    		$A.test.assertEquals("false", cmp.find("changedEvt_ot").get("v.value"), "Value of the checkbox should be 'false', since no events have been fired");
    		$A.test.assertEquals("false", cmp.find("clickedEvt_ot").get("v.value"), "Value of the checkbox should be 'false', since no events have been fired");
    	},function (cmp){
            // v.value does not change since no change event is fired in IE7/8: W-2328667
            // so, focus, click, blur is required for IE to generate a change event

            //Change the value of the checkbox
            var checkbox = cmp.find("checkbox").find("checkbox").getElement();
            checkbox.focus();
    		$A.test.clickOrTouch(checkbox);
            checkbox.blur();
    	}, function(cmp){
    		//Verify that both outputTexts are now set to true since they represent the currently value of the checkbox
    		$A.test.addWaitForWithFailureMessage("true",function(){
    			return cmp.find("changedEvt_ot").get("v.value");
    		}, "Value of the checkbox should be true, when the change evt is fired");
    	}, function(cmp) {
    		//Verify that both outputTexts are now set to true since they represent the currently value of the checkbox
    		$A.test.addWaitForWithFailureMessage("true",function(){
    			return cmp.find("clickedEvt_ot").get("v.value");
    		}, "Value of the checkbox should be true, when the click evt is fired");
    	}]
    }	
})