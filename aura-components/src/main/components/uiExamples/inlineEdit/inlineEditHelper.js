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
    BLOOD_TYPES : ["A", "B", "AB", "O"],
    
	EDIT_LAYOUTS : {
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
		bloodtype : {
			componentDef : {
				descriptor : 'markup://ui:inputSelect'
			},
			attributes : {
			    values : {
			        options : [
			            { label : "A", value : "A" },
			            { label : "B", value : "B" },
			            { label : "AB", value : "AB" },
			            { label : "O", value : "O" }
			        ]
			    }
			}
		},
		phone : {
			componentDef : {
				descriptor : 'markup://ui:inputPhone'
			}
		}
	},
	
	generateItems : function() {
		var items = [];
		
		for (var i = 0; i < 10; i++) {
			items.push({
				data : {
					id : i,
					name : "Name" + i,
					bloodtype : this.BLOOD_TYPES[Math.floor(Math.random() * 3)],
					phone : '3' + i + '2-4' + i + '6' + i
				},
				status : { 
					name : {
						disabled : (i % 2 == 0)
					}
				},
			});
		}
		
		return items;
	}
})// eslint-disable-line semi