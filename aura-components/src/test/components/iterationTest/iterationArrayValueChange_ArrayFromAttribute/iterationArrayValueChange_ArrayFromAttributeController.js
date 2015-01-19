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

	doInit: function(cmp, event, helper) {
		var listdata = [
		    	"0",
		    	"1",
		    	"2",
		    	"3",
		    	"4"
		    ];

		    cmp.set("v.listdata", listdata);
	},
	
	changeOneValueOnIterationItems: function(cmp, event, helper) {
		var index = parseInt(cmp.get("v.indexToChange"), 10);
    	var newValue = cmp.get("v.newValueToChange");
    	var iter = cmp.find("iterationOnArrayAttribute");
        var data = iter.get("v.items");
        data[index] = newValue; 
        iter.set("v.items", data);
	},
	
	changeOneValueInAttribute: function(cmp, event, helper) {
		var index = parseInt(cmp.get("v.indexToChange"), 10);
    	var newValue = cmp.get("v.newValueToChange");
        var data = cmp.get("v.listdata");
        data[index] =  newValue; 
        cmp.set("v.listdata", data);
	}
})