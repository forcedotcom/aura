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
	 browsers: ['-IE7','-IE8'],
	 
	 /**
	  * Test cell's edit trigger can be disabled dynamically.
	  */
	 testInlineEditCellDynamicDisabled : {
		 test : [function(cmp) {
			 this.verifyEditTriggerEnabled(cmp);
			 cmp.find('cell1DisableBtn').get('e.press').fire();
		 }, function(cmp) {
			 this.waitForEditDisabled(cmp);
		 }]
	 },
	 
	 /**
	  * Test cell's edit trigger can be enabled dynamically.
	  */
	 testInlineEditCellDynamicEnabled : {
		 attributes : {isCell1Disabled:true},
		 test : [function(cmp) {
			 this.verifyEditTriggerDisabled(cmp);
			 cmp.find('cell1EnableBtn').get('e.press').fire();
		 }, function(cmp) {
			 this.waitForEditEnabled(cmp);
		 }]
	 },
	 
	 /**
	  * Test cell's value can be changed dynamically.
	  */
	 testInlineEditCellUpdateValueDynamically : {
		 test : [function(cmp) {
			 this.verifyCellOutputValue(cmp, 'abc');
			 cmp.find('cell1ChangeDataBtn').get('e.press').fire();
		 }, function(cmp) {
			 this.waitForEditDataChange(cmp, 'Aura!');
		 }]
	 },
	 
	 /**
	  * Test cell dynamically set and clear error.
	  */
	 testInlineEditCellDynamicallySetAndClearError : {
		 test : [function(cmp) {
			 this.verifyCellErrorState(cmp, false);
			 cmp.find('cell1ErrorBtn').get('e.press').fire();
		 }, function(cmp) {
			 this.waitForCellErrorState(cmp, true);
		 }, function(cmp) {
			 cmp.find('cell1ErrorClearBtn').get('e.press').fire();
		 }, function(cmp) {
			 this.waitForCellErrorState(cmp, false);
		 }]
	 },
	 
	 getEditTriggerState : function(cmp) {
		 return cmp.find('cell1').find('editTrigger').getElement().disabled;
	 },
	 
	 verifyEditTriggerEnabled : function(cmp) {
		 this.verifyEditTrigger(cmp, false);
	 },
	 
	 verifyEditTriggerDisabled : function(cmp) {
		 this.verifyEditTrigger(cmp, true);
	 },
	 
	 verifyEditTrigger : function(cmp, expected) {
		 var actual = this.getEditTriggerState(cmp);
		 $A.test.assertEquals(expected, actual, 'Edit trigger state is incorrect');
	 },
	 
	 waitForEditDisabled : function(cmp) {
		 this.waitForEditTrigger(cmp, true);
	 },
	 
	 waitForEditEnabled : function(cmp) {
		 this.waitForEditTrigger(cmp, false);
	 },
	 
	 waitForEditTrigger : function(cmp, expected) {
		 var that = this;
		 $A.test.addWaitForWithFailureMessage(expected, function() {
			 return that.getEditTriggerState(cmp);
		 }, 'Expected inline edit trigger disabled=' + expected + ' but was not');
	 },
	 
	 getCellOutputValue : function(cmp) {
		 return cmp.find('cell1').get('v.body')[0].get('v.value');
	 },
	 
	 verifyCellOutputValue : function(cmp, expected) {
		 var actualCell1OutputValue = this.getCellOutputValue(cmp);
		 $A.test.assertEquals(expected, actualCell1OutputValue, 'Cell1 output value incorrect');
	 },
	 
	 waitForEditDataChange : function(cmp, expected) {
		 var that = this;
		 var actual = '';
		 $A.test.addWaitForWithFailureMessage(expected, function() {
			 var actual = that.getCellOutputValue(cmp);
			 return actual;
		 }, 'Expected data "' + expected + '" but was "' + actual + '"');
	 },
	 
	 getCellErrorState : function(cmp) {
		 var cellElem = cmp.find('cell1').getElement();
		 return $A.util.hasClass(cellElem, 'errors');
	 },
	 
	 verifyCellErrorState : function(cmp, expected) {
		 var actual = this.getCellErrorState(cmp);
		 $A.test.assertEquals(expected, actual, 'Cell1 error state is incorrect');
	 },
	 
	 waitForCellErrorState : function(cmp, expected) {
		 var that = this;
		 var actual = '';
		 $A.test.addWaitForWithFailureMessage(expected, function() {
			 actual = that.getCellErrorState(cmp);
			 return actual;
		 }, 'Expected error state "' + expected + '" but was "' + actual + '"');
	 }
 })