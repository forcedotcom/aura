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
	 * When using scrollerWrapper, subelements should have a 
	 * transform CSS property set to translate3d(0,0,0)
	 */
	testTransform: {
		browsers: ["IPHONE, IPAD"],
	    test: function(component) {
	    	var lyricsSty1 = this.getTransformValue(component, "lyrics1.1"),
	    		lyricsSty2 = this.getTransformValue(component, "lyrics1.2");
	    	
	    	$A.test.assertEquals("matrix(1, 0, 0, 1, 0, 0)", lyricsSty1, "There should be a transform CSS property");
	    	$A.test.assertEquals("matrix(1, 0, 0, 1, 0, 0)", lyricsSty2, "There should be a transform CSS property");
       }
	},
	
	/**
	 * When using scrollerWrapper, elements with the 
	 * skipTransform class should not have a transform 
	 * CSS property set
	 */
	testSkipTransform: {
		browsers: ["IPHONE, IPAD"],
	    test: function(component) {
	    	//debugger;
	    	var lyricsSty1 = this.getTransformValue(component, "lyrics2.1"),
    		    lyricsSty2 = this.getTransformValue(component, "lyrics2.2");
	    	
	    	$A.test.assertEquals("none", lyricsSty1, "There should not be a transform CSS property");
	    	$A.test.assertEquals("matrix(1, 0, 0, 1, 0, 0)", lyricsSty2, "There should be a transform CSS property");
       }
	},
	
	/**
	 * Utility function for retrieving the transform CSS property
	 * 
	 * @param the component
	 * @param auraid  of the element being observed
	 * @return the computed value of the transform CSS property
	 */
	getTransformValue: function(component, idName) {
    	var lyricsCmp = component.find(idName);
    	var	lyricsEle = lyricsCmp.getElement();
    	return $A.test.getStyle(lyricsEle, "transform");
	}
})