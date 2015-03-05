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
    testHrefPresent: {
        test: function(component) {
            var link = component.find("testLink");
            var hrefValue = link.getElement().href;
            aura.test.assertEquals("javascript:void(0/*#*/);", hrefValue, "href not expected");
        }
    },
    
    testAnchorHref: {
        test: function(component) {
            var link = component.find("testAnchor");
            var hrefValue = link.getElement().href;
            $A.test.assertEquals("javascript:void(0/*#anchor*/);", hrefValue); //in test mode we incldue original href value 
        }
    },
    
    testOnMouseOverMouseOutEventFiring: {
    	test: function(component){
    		var anchorA = component.find("testAnchorA");
    		
    		$A.test.fireDomEvent(anchorA.getElement(), "mouseover");
    		$A.test.assertEquals("true", component.get("v.mouseOverEvent"), "onmouseover event did not get fired.");
    		
    		$A.test.fireDomEvent(anchorA.getElement(), "mouseout");
    		$A.test.assertEquals("false", component.get("v.mouseOutEvent"), "onmouseout event did not get fired.");
    	}
    }

})
