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
	EDIT_LAYOUTS: {
	    id : {
	        componentDef : {
	            descriptor : 'markup://ui:inputNumber'
	        }
	    },
	    name : {
	        componentDef : {
	            descriptor : 'markup://ui:inputText'
	        }
	    },
	    date : {
            componentDef : {
                descriptor : 'markup://ui:outputDate'
            }
        },
        checkbox : {
            componentDef : {
                descriptor : 'markup://ui:outputCheckbox'
            }
        },
        notes : {
            componentDef : {
                descriptor : 'markup://ui:outputTextArea'
            }
        },
        modDateTime : {
            componentDef : {
                descriptor : 'markup://ui:outputDateTime'
            }
        },
        url : {
            componentDef : {
                descriptor : 'markup://ui:outputURL'
            }
        },
        phone : {
            componentDef : {
                descriptor : 'markup://ui:outputPhone'
            }
        }
	},
	
	HEADERS: [
	    { name: "id", label: "Id", sortable: "true"},
	    { name: "name", label: "Name" },
	    { name: "id", label: "Id"},
	    { name: "date", label: "Date"},
	    { name: "checkbox", label: "Checkbox"},
	    { name: "notes", label: "Notes"},
	    { name: "modDateTime", label: "DateTime"},
	    { name: "url", label: "Url"},
	    { name: "phone", label: "Phone"}
	],
	
	generateItems: function(count) {
	    var items = [];
	    
	    for (var i = 0; i < count; i++) {
	        var rand = Math.floor(Math.random() * count);
	        
	        items.push({
	            data: {
	                id: rand,
	                name: "Name " + rand,
	                date: "0123" + rand,
	                checkbox: (i % 2 == 0),
	                notes: "special string that is long with special char!@#$%^&*()",
	                modDateTime: "2000-01-01 12:00",
	                url: 'www.salesforce.com',
	                phone: "555-555-555" + rand
	            },
	            status: {
	                name: {
	                    disabled: (i % 2 == 0)
	                }
	            }
	        });
	    }
	    
	    return items;
	},
	
	generateColumnDefs: function(cmp, count) {
	    var columnDefs = cmp.get("v.columnDefs");
	    
	    var headers = [];
	    var columns = [];
	    
	    for (var i = 0; i < count; i++) {
	        var index = i;
	        
	        $A.createComponent("markup://ui:dataGridColumn", this.HEADERS[index], function(header) {
	            headers[index] = header;
	        });
	        columns[index] = columnDefs[index];
	    }
	    
	    return { headers: headers, columns: columns };
	},
	
	updateLastEdited: function(cmp, params) {
            var values = params.values;
            var lastEdited = {
                index : params.index,
                keys : [],
                values : []
            };
        
            // Retrieve keys and values as arrays
            for (key in values) {
                lastEdited.keys.push(key);
                lastEdited.values.push(values[key]);
            }
        
            cmp.set("v.lastEdited", lastEdited);
	}
})

