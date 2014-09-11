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
	 * @param cmp {Component} instance of uiExamples:infiniteList
	 * @param evt {Function} callback provided by ui:scroller by onPullToRefresh.
	 */
	handleRefresh: function (cmp, evt) {
		cmp.find('list')
		.getEvent('refresh')
		.setParams({
			parameters: {
				callback: function () {
					console.log('REFRESH DONE!');
					evt();
				}
			}
		})
		.fire();
	},

	/**
	 * @param cmp {Component} instance of uiExamples:infiniteList
	 * @param evt {Function} callback provided by ui:scroller by onPullToShowMore.
	 */
	handleShowMore: function (cmp, evt) {
		cmp.find('list')
		.getEvent('showMore')
		.setParams({
			parameters: {
				callback: function () {
					console.log('SHOW MORE DONE!');
					evt();
				}
			}
		})
		.fire();
	}
})