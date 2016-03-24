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
    testSetNull : {
    	test : function(cmp) {
    		var richTextDiv = cmp.getElement();
    		
    		// Check to make sure the rich text has some children tags before setting it to null. 
    		$A.test.assert(richTextDiv.children.length > 0, "Rich Text should not be empty");
    		
    		cmp.find("richText").set("v.value", null);
    		$A.test.addWaitForWithFailureMessage(0, function() {
    			return cmp.getElement().children.length;
    		}, "Rich Text should be empty");
    	}
    }

})// eslint-disable-line semi
