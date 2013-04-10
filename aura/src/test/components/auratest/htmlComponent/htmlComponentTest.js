/*
 * Copyright (C) 2012 salesforce.com, inc.
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
	 * Set tag attribute to a valid tag with valid attributes for that tag. 
	 */
	testValidTag: {
		test: function(component){
			var tag = component.find('atag').getElement();
			$A.test.assertNotNull(tag, "Valid tag not found");
			$A.test.assertEquals("a", tag.tagName.toLowerCase(), "Tag name of valid tag is incorrect");
			
			var hrefValue = tag.getAttribute("href");
			$A.test.assertNotNull(hrefValue, "Did not find href on valid tag");
            $A.test.assertTrue(aura.test.contains(hrefValue, "www.salesforce.com"), "Href value incorrect on valid tag");
		}
	},
	
	/**
	 * For a valid tag set an invalid attribute for that tag. 
	 */
	testInvalidAttributes: {
		test: function(component){
			var tag = component.find("atagInvalidAttr").getElement();
			$A.test.assertNotNull(tag, "Valid tag with invalid attributes not found");
			
			var abcValue = tag["abc"];
			$A.test.assertNotNull(abcValue, "Did not find invalid attirubte on a valid tag");
			$A.test.assertEquals("www.salesforce.com", abcValue, "Invalid attritube value on a valid tag is incorrect");
		}
	},
	
	/**
	 * Do not set any attributes for a valid html tag that has attirbutes. 
	 */
	testTagWithNoAttributes: {
		test: function(component){
			var tag = component.find("noAttr").getElement();		
			$A.test.assertNotNull(tag, "Tag with no attributes not found");
		}
	},
	
	/*
	 * TODO : @auraframework - uncommment after bug W-1538537 
	 */
	/**
	 * Set tag attribute to a html tag that is not supported by aura.
	 */
	_testUnsupportedTag: {
		test: function(component){
			var tag = component.find("objecttag").getElement();		
			$A.test.assertNull(tag, "Unsupported tag should NOT have rendered");
		}
	},
	
	/*
	 * TODO : @auraframework - uncommment after bug W-1538537
	 */
	/**
	 * Set tag attribute to a non-existing html tag.
	 */
	_testInvalidTag: {
		test: function(component){
			var tag = component.find("invalidtag").getElement();	
			$A.test.assertNull(tag, "Invlaid tag should NOT have rendered");
		}
	},
	
	/**
	 * Do not set tag attributes on html component.
	 * W-1538544
	 */
	testTagNotSet: {
	    attributes:{testNoTagAttr:true},
		test: function(component){
		    	$A.test.assertTrue($A.hasErrors, "HTMl component without a tag attribute should not be allowed");
		    	$A.test.assertEquals("Undefined tag attribute for "+component.find("notag").getGlobalId(), 
		    		$A.test.getText($A.util.getElement("auraErrorMessage")));
		}
	},
	
	/**
	 * Set tag attribute on html component to an undefined value.
	 * W-1538544 
	 */
	testUndefinedTagAttr: {
	    attributes:{testUndefinedTagAttr:true},
		test: function(component){
		    	$A.test.assertTrue($A.hasErrors, "HTMl component with a undefined tag attribute should not be allowed");
		    	$A.test.assertEquals("Undefined tag attribute for "+component.find("undefinedTag").getGlobalId(), 
		    		$A.test.getText($A.util.getElement("auraErrorMessage")));
		}
	},
	
	/*
	 * TODO : @auraframework - uncomment after bug W-1538581
	 */
	/**
	 * Dynamically change tag attribute to something else. 
	 */
	_testDynamicallyChangeTag: {
		test: function(component){
			var tagCmp = component.find('atag')
			var tag = tagCmp.getElement();
			
			$A.test.assertNotNull(tag, "Dynamic change test component not found");
			$A.test.assertEquals("a", tag.tagName.toLowerCase(), "Tag name of dynamic change test is incorrect");
			
			tagCmp.getAttributes().setValue("tag", "p");
			$A.rerender(component);
			
			var pTag = component.find('atag').getElement();
			$A.test.assertNotNull(pTag, "Modified tag not found");
			$A.test.assertEquals("p", pTag.tagName.toLowerCase(), "Tag name modified tag is incorrect");
		}
	}
})