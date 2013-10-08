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
		helper.setVisibility(cmp);
		return this.superRender();
	},
	
	afterRender: function(cmp, helper) {
		helper.setDefaultAttributes(cmp);
		this.superAfterRender();
		helper.updateSize(cmp);
	},
	
	rerender: function(cmp, helper) {
		var width = cmp.getValue('v.priv_width'),
			height = cmp.getValue('v.priv_height'),
			cssClass = cmp.getValue('v.class'),
			snap = cmp.getValue('v.priv_snap');
		
		//call super rerender only if necessary, to avoid triggering unnecessary rerendering for contained child components
		if (width.isDirty() || height.isDirty()) {			
			helper.updateSize(cmp);
		}
		
		if (cssClass.isDirty() || snap.isDirty()) {
			this.superRerender();
		}
	}
}