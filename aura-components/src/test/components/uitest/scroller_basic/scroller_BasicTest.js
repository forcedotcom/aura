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
	/*
	 * Test case for ui:scroller does not react to update size events 
	 * and properly resize itself when "enabled" is false
	 * Bug: W-2397722
	 */
	testReEnableScrollerDynamically: {
        browsers: ["-IE7","-IE8"],
        test: [
               function(cmp) {
            	   	//this.setDefaultAuraRenderedBy(cmp);
            	   	this.verifyScrollerPresentAndEnabled(cmp, true);
            	 	cmp.set("v.enabled", false);
               }, function(cmp) {
            	   this.verifyScrollerPresentAndEnabled(cmp, false);
           	 	   cmp.set("v.enabled", true);
               }, function(cmp) {
           	  	//scroller instance should be present
            	   this.verifyScrollerPresentAndEnabled(cmp, true);
               }
          ] 
    },
    
    verifyScrollerPresentAndEnabled : function(cmp, isEnabled)	{
    	var scrollerCmp = cmp.find("test-scroller"),
     	scrollerCmpInstance = scrollerCmp._scroller,
     	data_aura_rendered_by = $A.util.getElementAttributeValue(scrollerCmpInstance.wrapper, "data-aura-rendered-by"),
        isScrollerEnabled    = scrollerCmpInstance.enabled;
     	$A.test.assertNotUndefinedOrNull(scrollerCmpInstance, "Didn't find an scroller instance");
     	if(isEnabled){
     		$A.test.assertTrue(isScrollerEnabled, "Scroll functionality should be enabled");
     	}
     	else{
     		$A.test.assertFalse(isScrollerEnabled, "Scroll functionality should be enabled be disable");
        }
     	
    }
})