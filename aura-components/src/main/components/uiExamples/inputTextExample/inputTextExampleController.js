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
    checkInput : function(cmp, evt) {
     
        
        var colorVal = cmp.find("color").getValue("v.value");
        var myColorVal = colorVal.getValue("v.value");
        
        var myColor = cmp.find("color").get("v.value");
        var myOutput = cmp.find("outColor");
        var greet = "You entered: " + myColor;
        myOutput.getValue("v.value").setValue(greet);
        
        if (!myColorVal) {
            colorVal.setValid(false);
            colorVal.addErrors([{message:"Enter some text"}]);
        }
        else {
            //clear error
            if(!colorVal.isValid()){
                colorVal.setValid(true);
            }
        }
    }
})