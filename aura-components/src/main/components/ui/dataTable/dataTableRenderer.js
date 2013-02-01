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
({
    render: function(component) {
        var ret = this.superRender();

        var headerValues = component.get("v.headerValues");
//        if (!headerValues) {
//            // See if we can find the child ui:dataTableColumn(s) and ask them for their headerValue
//            headerValues = [];
//            var forEaches = component.get("v.body");
//            if (forEaches.length > 0) {
//                var forEach = forEaches[0];
//                var row = forEach.getSuper().get("v.body")[0];
//                var columns = row.get("v.body");
//
//                for (var i = 0; i < columns.length; i++) {
//                    var column = columns[i];
//                    headerValues.push(column.get("v.headerValue"));
//                }
//            }
//        }

        var items = component.getValue("v.items");
        if (!items.isEmpty()) {
	        // Create a <th scope="col" class="header">{!v.headerValue}</th> for each column
	        var headerEl = component.find("header").getElement();
	        if (headerEl) {
	            for (var j = 0; j < headerValues.length; j++) {
	                var headerValue = headerValues[j];
	
	                var th = document.createElement("th");
	                th.setAttribute("scope", "col");
	                th.setAttribute("class", "header");
	                th.appendChild(document.createTextNode(headerValue));
	                headerEl.appendChild(th);
	            }
	        }
        }
        
        return ret;
    }
})
