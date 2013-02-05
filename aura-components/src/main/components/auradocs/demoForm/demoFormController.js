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
{
  getInput: function(cmp, event) {
        var textI = cmp.find("textI");
        var textvalue = textI.getValue("v.value").getValue();
        var textO = cmp.find("textO");
        textO.setValue("{!v.value}", textvalue);
   },
   
   inspectKeyEvent: function(cmp,event) {
		var keyCodeValue =  event.getParam("keyCode");
		cmp.find("outputValue").getAttributes().setValue("value", keyCodeValue);
   },
   
   inspectMouseEvent: function(cmp,event) {
   	var buttonValue =  event.getParam("button");
       cmp.find("outputValue").getAttributes().setValue("value", buttonValue);
     }
}