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
	 doCell1Error : function(cmp) {
		 var cell1 = cmp.find('cell1');
		 cell1.set('v.hasErrors', true);
	 },
	 
	 doCell1ClearError : function(cmp) {
		 var cell1 = cmp.find('cell1');
		 cell1.set('v.hasErrors', false);
	 },
	 
	 doCell1ChangeData : function(cmp) {
		 cmp.set('v.cell1Data', 'Aura!');
	 },
	 
	 doCell1Disable : function(cmp) {
		 cmp.set('v.isCell1Disabled', true);
	 },
	 
	 doCell1Enable : function(cmp) {
		 cmp.set('v.isCell1Disabled', false);
	 }
 })