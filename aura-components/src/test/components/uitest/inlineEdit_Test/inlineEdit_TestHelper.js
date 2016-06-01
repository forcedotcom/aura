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
		grade : {
			componentDef : {
				descriptor : 'markup://ui:inputNumber'
			}
		},
		linkLabel : {
		    componentDef : {
		        descriptor : 'markup://ui:inputText'
		    }
		},
		issueDate : {
			componentDef : {
				descriptor : 'markup://ui:inputDate'
			}
		},
		passing : {
			componentDef : {
				descriptor : 'markup://ui:inputCheckbox'
			}
		},
		notes : {
			componentDef : {
				descriptor : 'markup://ui:inputTextArea'
			}
		},
		modDateTime : {
			componentDef : {
				descriptor : 'markup://ui:inputDateTime'
			}
		}
	},
	
	updateLastEdited : function(cmp, params) {
	    var lastEdited = {};
	    
	    lastEdited.index = params.index;
	    lastEdited.key = params.key;
	    lastEdited.value = params.value;
	    
	    cmp.set("v.lastEdited", lastEdited);
	}
})// eslint-disable-line semi
