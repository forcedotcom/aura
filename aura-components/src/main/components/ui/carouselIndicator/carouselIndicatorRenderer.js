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
	render: function (cmp, hlp) {
		var dom = this.superRender(),
			root = dom[0],
			indicatorDOM = hlp.createDOM(cmp);
		
		root.insertBefore(indicatorDOM, root.firstChild);
		hlp.setIndicatorSize(cmp, root);
		hlp.attachHandlers(cmp, root);
		
		return dom;
	},
	afterRender: function (cmp, hlp) {
		this.superAfterRender();
    },
    unrender: function (cmp, hlp) {
        this.superUnrender();
    }
})