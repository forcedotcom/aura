/*

    Copyright (C) 2013 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/
({
    openDialog : function(cmp, evt) {
	var openEvent = $A.get("e.ui:openDialog");
        openEvent.setParams({
            dialog : cmp.find("dialogBoxId"),
            triggerEvent : evt
        });
        openEvent.fire();
    },  

   closeDialog : function(cmp, evt) {
       var lblAttrib = cmp.find("resultLabel").getAttributes();
       var checkBoxArray = $A.util.getElementsByClass("uiInputCheckbox uiInput");
              
       var str ="";
       var tmpArray = new Array();
       
       for(var i = 0; i < checkBoxArray.length; i++){
           if(checkBoxArray[i].checked){
               tmpArray.push(checkBoxArray[i].name);
           }  
       }
    
       if(tmpArray.length > 0){
	   str = tmpArray.join(" ");
       }
       else {
           str = "Data Submited";
       }

       if(evt.getParam("confirmClicked")){
	   lblAttrib.setValue("value", str);
       }
       else{
	   lblAttrib.setValue("value", "Data Not Submitted");      
       }
       
   }
})