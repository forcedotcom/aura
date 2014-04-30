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
	init: function (component, event, helper) {
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		
		var collection=[];
    	for(var i=0; i<500; i++){
    		collection.push({text: "Pretty row " + (i+1)});
    	}
		component.set("v.rows", collection);
    },
    
    handleClick: function(component, event, helper){
    	function inner(component, event){
    		var _c = component,
    			_e = event;
    	}
    }
})