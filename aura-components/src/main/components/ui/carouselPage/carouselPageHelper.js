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
	updateSize: function(cmp, width, height) {
		var w=width || cmp.get('v.priv_width'),
			h=height || cmp.get('v.priv_height'),
			el = cmp.getElement();

		if (!el) {
			if ($A.util.isNumber(w)) {
				cmp.set('v.priv_width', w);
			}

			if ($A.util.isNumber(h)) {
				cmp.set('v.priv_height', h);
			}

			return;
		}

		if ($A.util.isNumber(w)) {
			el.style.width = w + 'px';
		}
		if ($A.util.isNumber(h)) {
			el.style.height = h + 'px';
		}
	},

	selectPage: function(cmp, evt) {
		var selectedPage = evt.getParam('pageIndex'),
			curPage = cmp.get('v.pageIndex'),
			selectedItemCss = 'carousel-page-selected';

		if (selectedPage === curPage) {
			cmp.set('v.isSelected', true);
			$A.util.addClass(cmp.getElement(), selectedItemCss);
			this.showPage(cmp, selectedPage);
		} else {
			cmp.set('v.isSelected', false);
			$A.util.removeClass(cmp.getElement(), selectedItemCss);
		}
	},

	/**
	 * Update page content
	 */
	updatePage: function(cmp, pageBody) {
		cmp.find('pageContainer').set('v.body', pageBody || []);
	},

	/**
	 * Set page is visible or not when displayed
	 */
	setVisibility: function(cmp) {
		var isVisible = cmp.get('v.priv_visible'),
			strClass = cmp.get('v.class') || '';

		if (!isVisible) {
			cmp.set('v.class', strClass + ' hidden');
		}

		if (!cmp.get('v.priv_continuousFlow')) {
			var snap = cmp.get('v.priv_snap');
			if (snap && snap.indexOf('.') != -1) {
				cmp.set('v.priv_snap', snap.substring(snap.indexOf('.') + 1));
			}
		}
	},

	showPage: function(cmp, pageIndex) {
		var curPage = cmp.get('v.pageIndex'),
			isVisible = $A.util.getBooleanValue(cmp.get('v.priv_visible')),
			hiddenClass = 'hidden';

		if (pageIndex == curPage && !isVisible) {
            if(cmp.getElement()) {
                $A.util.removeClass(cmp.getElement(), hiddenClass);
                cmp.getElement().setAttribute('aria-expanded', 'true');
            }
            cmp.set('v.priv_visible', true);
		}
	},

	hidePage: function(cmp, pageIndex) {

		var curPage = cmp.get('v.pageIndex'),
			isVisible = $A.util.getBooleanValue(cmp.get('v.priv_visible')),
			hiddenClass = 'hidden';

		if (pageIndex == curPage && isVisible) {
			$A.util.addClass(cmp.getElement(), hiddenClass);
			cmp.getElement().setAttribute('aria-expanded', 'false');
			cmp.set('v.priv_visible', false);
		}
	},

	setDefaultAttributes: function(cmp) {
		if (!cmp.get('v.priv_continuousFlow')) {
			cmp.getElement().setAttribute('aria-expanded', 'false');
		}
	}
})