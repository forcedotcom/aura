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
	 * test if we can evaluate attribute outside of ui:list of current component
	 */
    testAttributeCmp: {
    	test: function(component) {
    		var nodelist = $A.test.getElementByClass("itemFromThisComp");
    		//there are three of them since the list has length=3, all with same word, just verify the first one
    		var msg = $A.test.getText(nodelist[0]);
    		$A.test.assertTrue($A.test.contains(msg,"cat"), "testList, cannot evaluate attribute outside list");
    	}
    }
})