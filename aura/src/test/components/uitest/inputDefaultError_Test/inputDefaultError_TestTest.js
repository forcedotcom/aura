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

    //Test checking for to make sure that the aria-describedby attribute is set to the empty string when no errors present
    testForEmptyAttribute : {
	attributes : {val : "1000000"},
        test:function(cmp){
            var inputValue = $A.test.getElementAttributeValue(cmp.find("randNumInput").getElement(),"aria-describedby");
            $A.test.assertNotUndefinedOrNull(inputValue, "aria-describedby attribute does not exist on input component");
            $A.test.assertTrue($A.util.isEmpty(inputValue), "The initial value of aria-describedby attribute should be the empty string");
            
        }
    },
    //Test checking for to make sure that the aria-describedby attribute is set correctly when errors are present
    testForNonEmpty : {
	attributes : {val : "21"},
        test:function(cmp){
            var ul = $A.test.getElementByClass("uiInputDefaultError");
            $A.test.assertEquals(ul.length, 1, "uiInputDefaultError unordered list was not found");
            $A.test.assertEquals(ul[0].children.length, 2, "The unordered list has too many items in it");
            
        }
    } 

})
