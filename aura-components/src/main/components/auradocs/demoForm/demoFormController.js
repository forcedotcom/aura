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
{
  getInput: function(cmp, event) {
        var textI = cmp.find("textI");
        
      //Get the text value
        var textvalue = textI.get("v.value");
        var textO = cmp.find("textO");
        
      //Set the text value in the ui:outputText component
        textO.getValue("v.value").setValue(textvalue);
   },
   
   getDate: function(cmp,event) {
	   
	 //Get the value in the ui:inputDate component
	   var d = cmp.getValue("v.myDate");
	   
	 //Set the new date
	   var newdate = new Date();
	   d.setValue(newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate());
   },
   
   inspectKeyEvent: function(cmp,event) {
	   
	  //Get the keycode value of the pressed key
		var keyCodeValue =  event.getParam("keyCode");
		cmp.find("outputValue").getValue("v.value").setValue(keyCodeValue);
   },
   
   inspectMouseEvent: function(cmp,event) {
	   
	 //Get the button value of the pressed button: 0 (left), 1 (middle), or 2 (right)
   	   var buttonValue =  event.getParam("button");
       cmp.find("outputValue").getValue("v.value").setValue(buttonValue);
     }
}