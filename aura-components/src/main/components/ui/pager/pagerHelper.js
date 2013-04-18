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
	changePage : function(component, targetPage, domEvent) {
		targetPage = parseInt(targetPage, 10);
		var pageCount = parseInt(component.get("v.pageCount"), 10);
		if (isNaN(targetPage) || targetPage <= 0 || isNaN(pageCount) || targetPage > pageCount) {
			return false;
		}

		var pageSize = parseInt(component.get("v.pageSize"), 10);

		this.firePageChangeEvent(component, {
			page : targetPage,
			pageSize : pageSize
		}, domEvent);

		component.getValue("v.currentPage").setValue(targetPage);

		return true;
	},

	changePageSize : function(component, targetPageSize, domEvent) {
		targetPageSize = parseInt(targetPageSize, 10);
		if (isNaN(targetPageSize)) {
			return false;
		}

		var pageSize = parseInt(component.getValue("v.pageSize"), 10);
		if (pageSize == targetPageSize) {
			return false;
		}

		var targetPage = 1;
		this.firePageChangeEvent(component, {
			page : targetPage,
			pageSize : targetPageSize
		}, domEvent);

		component.getValue("v.currentPage").setValue(targetPage);
		component.getValue("v.pageSize").setValue(targetPageSize);

		return true;
	},

	firePageChangeEvent : function(component, pageData, domEvent) {
		if (domEvent && domEvent.preventDefault) {
			domEvent.preventDefault();
		}

		var pageEvent = component.getEvent("onPageChange");
		pageEvent.setParams({
			currentPage : pageData && pageData.page || 1,
			pageSize : pageData && pageData.pageSize || 0
		}).fire();
	},

	updateCalculatedFields : function(component) {
		component = component.getConcreteComponent();
		
		var pageSize = component.get("v.pageSize") || 0;
		var totalItems = parseInt(component.get("v.totalItems"), 10);
		if (pageSize > 0) {
			var pageCount = component.getValue("v.pageCount");
			var newPageCount = Math.ceil(totalItems / pageSize);
			if (!isNaN(newPageCount) && pageCount.getValue() != newPageCount) {
				pageCount.setValue(newPageCount);
			}
		} else {
			component.getValue("v.pageCount").setValue(1);
			pageSize = totalItems;
		}
		if (totalItems > 0) {
			var endIndex = (component.get("v.currentPage") * pageSize) - 1;
			var startIndex = Math.max(0, endIndex - pageSize + 1);
			component.getValue("v.startIndex").setValue(startIndex);
			component.getValue("v.endIndex").setValue(
					Math.min(endIndex, totalItems - 1));
		} else {
			component.getValue("v.currentPage").setValue(0, true);
			component.getValue("v.startIndex").setValue(-1);
			component.getValue("v.endIndex").setValue(-1);
		}
		
		var updateDisplay = component.getDef().getHelper().updateDisplay;
		if (updateDisplay) {
			updateDisplay.call(component, component);
		}
	}
})
