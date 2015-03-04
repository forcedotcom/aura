/*
 * Copyright (C) 2014 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	checkImageMatches: function(cmp, expectedSrc){
		var imgElement = cmp.find("image").getElement().firstChild;
		var imgSrcOutput = cmp.find("outputStatus").get("v.value");
    	$A.test.assertTrue($A.util.stringEndsWith(imgElement.src, expectedSrc), "Expected src to be '/auraFW/resources/aura/s.gif' by default");
    	//check image was passed as a parameter to the action
    	$A.test.assertTrue($A.util.stringEndsWith(imgSrcOutput, expectedSrc), "Expected src to be '/auraFW/resources/aura/s.gif' by default after onload is fired");
    },
    
    /**
     * Test case for when the image is done loading, 
     * passes the image loaded as a parameter to the action.
     * Bug: W-2509320
     */
    testImageOnLoadPassesParams:{
    	 test: [function(cmp) {
        	var defaultSrc = "/auraFW/resources/aura/s.gif";
        	this.checkImageMatches(cmp, defaultSrc);
        	$A.test.clickOrTouch(cmp.find("loadButton").getElement());
        }, function(cmp){
            this.checkImageMatches(cmp, '/auraFW/resources/aura/auralogo.png');
        }]
    }
})
