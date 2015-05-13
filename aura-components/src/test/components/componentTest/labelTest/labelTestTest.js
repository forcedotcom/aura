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
	// Essentially Verify that the afterRender was fired for ui:ouputDate.
    testDateFormatted : {
    	test: [
    		function(cmp) {
	    		var expectedCmp = cmp.find("expected");
	    		var actualCmp = cmp.find("actual");
	    		var expected = $A.test.getText(expectedCmp.getElement());
	    		var actual;
	
	    		actual = $A.test.getText(actualCmp.getElement());
	
	    		$A.test.assertEquals(expected, actual);
	    	},
    		function(cmp) {
	    		var expectedCmp = cmp.find("expected");
	    		var actualCmp = cmp.find("actual");
	    		var expected = "Sep 8, 2015";
	    		var actual;
	
	    		actual = $A.test.getText(actualCmp.getElement());
	
	    		$A.test.assertEquals(expected, actual);
	    	}
	    ]
    }
})
