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
	//Api test for title
    testTitle : {
        attributes : {"title" : "title1"},
        test : function(cmp){
            var element = cmp.find("tabItem").getElement();
            var text = $A.util.getText(element);
            $A.test.assertEquals("title1", text, "The title of the tabItem element was not correct")        
        }
    },
    
    //Api test for closable anchor
    testClosable : {
        attributes : {"title" : "title1", "closable" : true}, 
        test : function(cmp){
            this.verifyChildExists(cmp, "a", "The closable anchor should be present and it is not.");
        }
    },
    
    //Helper functions
    verifyChildExists : function(cmp, elementName, text){
        var anchor = cmp.find("tabItem").getElement();
        var img = anchor.getElementsByTagName(elementName)[0];
        $A.test.assertNotUndefinedOrNull(img, text);  
    }
})