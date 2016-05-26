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
	generateColumnConfigs: function(cmp) {
		cmp._columnConfigs = {
				who : {
					header: {
						"componentDef": "markup://ui:dataGridColumn",
			            "attributes": {
			                "values": { label: "Name",
			                			name: "who.name"
			                		  }
			            }
					},
					column: {
						"componentDef": "markup://ui:outputText",
						"attributes": {
							"values": { 
								value: $A.expressionService.create(null, "{!item.who.name}")
							}
						}
					}
				},
				activityDate : {
					header: {
						"componentDef": "markup://ui:dataGridColumn",
			            "attributes": {
			                "values": { label: "Due Date",
			                			name: "activityDate"
			                		  }
			            }
					},
					column: {
						"componentDef": "markup://ui:outputText",
						"attributes": {
							"values": { 
								value: $A.expressionService.create(null, "{!item.activityDate}")
							}
						}
					}
				}
		}
	},
	updateSelectedItems: function(cmp, state, index) {
		var gridSelectedItems = cmp.get('v.gridSelectedItems');
		
		if (state ==='Selected'){
			gridSelectedItems.push(index);
		} else if (state === 'Deselected'){
			gridSelectedItems = this.removeArrayItem(gridSelectedItems,index);
		}

		cmp.set('v.gridSelectedItems', gridSelectedItems);
	},

	/* Utility Functions */
	removeArrayItem: function(arr, item){
		var index = arr.indexOf(item);
    	return (index > -1) ? arr.splice(index, 1) : arr;
		
	},

	generateRandomDateString: function(){
		var start = new Date(2014, 0, 1),
			end = new Date();

    	var _date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    	return _date.getFullYear() + '-' + ('0' + (_date.getMonth()+1)).slice(-2) + '-' + ('0' + _date.getDate()).slice(-2);
    }
})