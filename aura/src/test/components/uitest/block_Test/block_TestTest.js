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
	testDefaultOveflowProperty:{
		test: function(cmp){
			var uiBlock = cmp.find("overflowHidden").getElement();
			$A.test.assertEquals("hidden", $A.test.getStyle(uiBlock,'overflow'), "Default Css 'overflow' property for ui:block should be hidden");
	    }
	},
	
	testOverrideOveflowProperty:{
		test: function(cmp){
			var uiBlock = cmp.find("overflowVisible").getElement();
			$A.test.assertEquals("visible", $A.test.getStyle(uiBlock,'overflow'), "Css 'overflow' property for ui:block should be overridden to visible");
	    }
	},
	
	testDefaultBlockTag:{
		test: function(cmp){
			var uiBlock = cmp.find("overflowHidden").getElement();
			$A.test.assertTrue($A.test.isInstanceOfDivElement(uiBlock), "Default tag for ui:block should be div");
	    }
	},
	
	testOverrideDefaultBlockTag:{
		test: function(cmp){
			var uiBlock = cmp.find("overflowVisible").getElement();
			$A.test.assertTrue($A.test.isInstanceOfSpanElement(uiBlock), "Tag for ui:block should be span");
	    }
	},
	
	/**
	 * In IE7/8 cant use object.sytle.float need to use object.sytle.styleFloat
	 */
	testLeftBlockFacet:{
		browsers : ["-IE7","-IE8"],
		test: function(cmp){
			var leftDiv = $A.test.getElementByClass("bLeft")[0];
			$A.test.assertEquals("left", $A.test.getStyle(leftDiv,'float'), "Css 'float' property for leftblock should be left");
	    }
	},
	
	/**
	 * In IE7/8 cant use object.sytle.float need to use object.sytle.styleFloat
	 */
	testLeftBlockFacetInIE:{
		browsers : ["IE7","IE8"],
		test: function(cmp){
			var leftDiv = $A.test.getElementByClass("bLeft")[0];
			$A.test.assertEquals("left", $A.test.getStyle(leftDiv,'styleFloat'), "Css 'float' property for leftblock should be left");
	    }
	},
	
	/**
	 * In IE7/8 cant use object.sytle.float need to use object.sytle.styleFloat
	 */	
	testRightBlockFacet:{
		browsers : ["-IE7","-IE8"],
		test: function(cmp){
			var rightDiv = $A.test.getElementByClass("bRight")[0];
			$A.test.assertEquals("right", $A.test.getStyle(rightDiv,'float'), "Css 'float' property for rightblock should be right");
	    }
	},
	
	/**
	 * In IE7/8 cant use object.sytle.float need to use object.sytle.styleFloat
	 */
	testRightBlockFacetInIE:{
		browsers : ["IE7","IE8"],
		test: function(cmp){
			var leftDiv = $A.test.getElementByClass("bRight")[0];
			$A.test.assertEquals("right", $A.test.getStyle(leftDiv,'styleFloat'), "Css 'float' property for leftblock should be left");
	    }
	}
})
