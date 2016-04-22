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
	 browsers: ["-IE7","-IE8"],
	 
	 /**
	  * Test that triggering an edit moves focus into an inputElement
	  */
	 testEditTrigger : {
		test : [function(cmp) {
			this.triggerEditOnCell(cmp, 0, 2);
		}, function(cmp) {
			$A.test.addWaitForWithFailureMessage(true, function() {
				var activeElement = $A.test.getActiveElement();
				return activeElement.tagName === 'INPUT';
			}, "Input element should be focused.");
		}]
	 },
	 
	 triggerEditOnCell : function(cmp, rowIndex, colIndex) {
		 var tbody = document.getElementsByTagName("tbody")[0];
		 var trs = this.getOnlyTrs(tbody.children);		 
		 var trigger = trs[rowIndex].children[colIndex].querySelector('.triggerContainer button');
		 
		 $A.test.clickOrTouch(trigger);
	 },
	 
	 getOnlyTrs : function(elements) {
		 var elementArray = [];

		 for (var i = 0; i < elements.length; i++) {
			 if (elements[i].tagName == 'TR') {
				 elementArray.push(elements[i]);
			 }
		 }
		 return elementArray;
	 }
 })