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
	/**
	 * Applies CSS for opening a row.
	 * 
	 * @param cmp {Component} Instance of ui:infiniteListRow.
	 * @param params {Object} Whichever values passed from ui:open / ui:command.
	 */
	open: function (cmp, params) {
		var el = cmp.getElement();

		// TODO: create custom event to bubble 'open' operation to infiniteList.
	},

	/**
	 * Applies CSS for closing a row.
	 * 
	 * @param cmp {Component} Instance of ui:infiniteListRow.
	 * @param params {Object} Whichever values passed from ui:open / ui:command.
	 */
	close: function (cmp, params) {
		var el = cmp.getElement();
		
		// TODO: create custom event to bubble 'close' operation to infiniteList.
	}
})