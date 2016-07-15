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
	generateItems: function(count, startIndex) {
	   var startIndex = startIndex || 0;

	   var items = [];
	   for (var i = 0; i < count; i++) {
	       var rowValue = i + startIndex;
	       items[i] = {
	               id : rowValue,
	               name : "Name " + rowValue,
	               longName : "This is a very long string for row " + rowValue
	       }
	   }
	   
	   return items;
	},
	
	applyRowClass: function(cmp, index) {
	    var table = cmp.find("grid").getElement();
	    var tr = table.querySelector('tbody tr:nth-child(' + (index + 1) + ')');
	    
	    if (tr) {
	        tr.classList.add("changed");
	    }
	}
})

