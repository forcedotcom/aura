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
     * verify type of actionref passed around
     */
    testAPI: {
        test: function(component){
            var sand = component.get("c.sand");
            $A.test.assertEquals("Action", sand.auraType, "action type was incorrect");
            $A.test.assertEquals("function", typeof sand.run, "run was not a function on the actions");
        }
    },

    /*
     * invoking an action passed as an actionref attribute to another cmp
     */
    testActionPassing: {
        test: [function(component){
            // the text node for pants
           var btnAndText = this.getNecessaryElements(component);
          
            $A.test.assertEquals("0", btnAndText["text"].nodeValue, "initial value for pants wasn't 0");

            btnAndText["btn"].get("e.press").fire();
        }, function(component){
        	 var btnAndText = this.getNecessaryElements(component);
            $A.test.assertEquals("1", btnAndText["text"].nodeValue, "action was not called");
            // click again to make sure the actionref can run twice
            btnAndText["btn"].get("e.press").fire();
        }, function(component){
        	 var btnAndText = this.getNecessaryElements(component);
            $A.test.assertEquals("2", btnAndText["text"].nodeValue, "action should have been called twice");
            btnAndText["btn"].get("e.press").fire();
        }, function(component){
        	 var btnAndText = this.getNecessaryElements(component);
            $A.test.assertEquals("3", btnAndText["text"].nodeValue, "action should have been called thrice");
        }]
    },
    
    getNecessaryElements : function(component){
    	var text = component.getElements()[1];
        var child = component.find("sandputter");
        var btn = child.find("button");
        return {"btn" : btn, "text" : text};
    }
})
