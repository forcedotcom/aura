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
	testLoad : {
		attributes : {'defaultSrc' : "http://actualSrc.cmp"},
	    test : function(cmp) {
	    	this.imageSrcCheck(cmp, "/auraFW/resources/aura/s.gif","Default src of ui:image and default src of imgElem are not the same");    			
	    	$A.test.clickOrTouch(cmp.find("loadButton").getElement());
	    	this.imageSrcCheck(cmp, "http://actualSrc.cmp" ,"aysnc src of ui:image and async src of imgElem are not the same");
	    }
	},
	
	imageSrcCheck : function(cmp, expectedValue, errorMsg){
		var imgElem = cmp.getConcreteComponent().getElement();
		var src = $A.util.getElementAttributeValue(imgElem, "src");
    	$A.test.assertEquals(expectedValue, src, errorMsg);
	}
})