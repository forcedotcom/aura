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
	/**
	 * Adding default values to outputText components so we have a baseline
	 */
   doInit : function(cmp){
	   cmp.find("changedEvt_ot").set("v.value", ""+cmp.find("checkbox").get("v.value"));
	   cmp.find("clickedEvt_ot").set("v.value", ""+cmp.find("checkbox").get("v.value"));
   },
   
   changed: function(cmp) {
       cmp.find("changedEvt_ot").set("v.value", ""+cmp.find("checkbox").get("v.value"));
   },
   
   clicked: function(cmp) {
       cmp.find("clickedEvt_ot").set("v.value", ""+cmp.find("checkbox").get("v.value"));
    }
})