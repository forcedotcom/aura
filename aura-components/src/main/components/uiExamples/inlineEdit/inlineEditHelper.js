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
			},
			attributes : {
			    values : {
			        updateOn : 'input'
			    }
			}
		},
		name : {
			componentDef : {
				descriptor : 'markup://ui:inputText'
			},
			attributes : {
                values : {
                    updateOn : 'input'
                }
            }
		},
		bloodtype : {
			componentDef : {
				descriptor : 'markup://ui:inputSelect'
			},
			attributes : {
			    values : {
			        updateOn : 'input',
			        options : [
			            { label : "A", value : "A", selected : true },
			            { label : "B", value : "B", selected : false },
			            { label : "AB", value : "AB", selected : false },
			            { label : "O", value : "O", selected : false }
			        ]
			    }
			}
		},
		phone : {
			componentDef : {
				descriptor : 'markup://ui:inputPhone'
			},
			attributes : {
                values : {
                    updateOn : 'input'
                }
            }
		}
	},
	
	EDIT_PANEL_CONFIG : {
        bloodtype : {
            submitOn : 'change'
        }
    },
	
	generateItems : function() {
		var items = [];
		
		for (var i = 0; i < 10; i++) {
			items.push({
				record : {
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