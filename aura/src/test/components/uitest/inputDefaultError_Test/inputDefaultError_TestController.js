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
     
     doInit : function (cmp, evt, helper){
	 //Get actual value
	 var num = ""+cmp.find("randNumInput").get("v.value");
	 //Get SimpleValue object to modify
	 var value = cmp.find("randNumInput").getValue("v.value");
	 
	 if (num.length < 5 || num.length>7) {
	     value.setValid(false);
	     value.addErrors({"message":"Number should have (5,7] digits"})
	 }
	 //Check integer starts with 1;
	 if(num.charAt(0) != "1"){
	     value.setValid(false);
	     value.addErrors({"message":"The number given should start with a 1"});
	 }
     }
 })