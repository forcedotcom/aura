/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	createPanel : function(cmp, event, helper) {
		var config = {};
		config['body'] = $A.createComponentFromConfig({descriptor:'markup://uitest:tabset_PanelBody'});
		config['referenceElementSelector'] = '.inputText';
		config['direction'] = 'south';
		
		// create panel
		$A.get('e.ui:createPanel').setParams({
			panelType : 'panel',
			visible : true,
			panelConfig : config,
			onCreate : function(panel) {
				cmp._panel = panel;
			}
		}).fire();
	}
})