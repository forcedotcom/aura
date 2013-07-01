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

{
	render: function(cmp, helper) {
		var value = cmp.get('v.value');		
		var	ret = this.superRender();		
		var	span = cmp.find('span').getElement();
		
		helper.appendTextElements(value, span);
		
		return ret;		
	},
	
	rerender: function(cmp, helper) {		
		var value = cmp.getValue('v.value');		
		if (value.isDirty()) {			
			var span = cmp.find('span').getElement();
			helper.removeChildren(span);		        
			helper.appendTextElements(value.getValue(), span);
		}
		this.superRerender();
	}

}