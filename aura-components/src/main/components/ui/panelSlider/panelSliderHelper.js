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
	init : function(cmp, evt) {
		var self = this;
		cmp._isVisible = cmp.get('v.isVisible');
		cmp._isModal = cmp.get('v.isModal');
		
		cmp._windowKeyHandler = function(e) {
			if ((e || window.event).keyCode == 27) {
				if (cmp._panelSlideIn) {
					$A.util.squash(e);
					self.slideOut(cmp, evt);
				}
			}
		};
	},

	show : function(cmp) {
		var panel = cmp.getElement();
		$A.util.addClass(panel, 'visible');
        cmp.set('v.isVisible', true);
		cmp._isVisible = true;
		
		// move panel to make visible in viewport
		panel.style.top = window.pageYOffset + 'px';
	},
	hide : function(cmp, evt) {
		var panel = cmp.getElement();
		$A.util.removeClass(panel, 'visible');
        // cmp.set('v.isVisible', false);
		cmp._isVisible = false;
	},
	toggleVisibility : function(cmp, evt) {
		if (cmp._isVisible) {
			this.hide(cmp, evt);
		} else {
			this.show(cmp, evt);
		}
	},
	slideInTransitionEnd : function(cmp, evt) {
		var dom = this._getDOMElements(cmp);

		this._unbindTransitionEnd(cmp, dom.panel, 'slideInTransitionEnd');
		cmp._panelSlideIn = true;

		$A.get('e.ui:panelTransitionEnd').setParams({
			panelId: cmp.getGlobalId(),
			action: 'show',
			isTransient: cmp.get('v.isTransient')
		}).fire();
		
		// set aria-hidden false on panel body when panel slides into view
		cmp.find('body').getElement().setAttribute('aria-hidden', false);
	},
	slideOutTransitionEnd : function(cmp, evt) {
		var dom = this._getDOMElements(cmp);

		this._unbindTransitionEnd(cmp, dom.panel, 'slideOutTransitionEnd');
		$A.util.removeClass(dom.modal, 'visible');
		cmp._panelSlideIn = false;

		$A.get('e.ui:panelTransitionEnd').setParams({
			panelId: cmp.getGlobalId(),
			action: 'hide',
			isTransient: cmp.get('v.isTransient')
		}).fire();
		
		// set aria-hidden true on panel body when panel slides out of view
		cmp.find('body').getElement().setAttribute('aria-hidden', true);
		
		// override panelManager's toggle of the aria-hidden attr on the panel itself
		// sliderPanel is always aria-hidden false
		dom.panel.setAttribute('aria-hidden', false);

		// NOTE this is a fix for IE surface tablet which forces the panel to re-render
		// without this fix the slide button will disappear in IE on the surface tablet
		if (this._isWindows()) {
			dom.panel.style.display = 'none';
			dom.panel.style.display = 'block';
		}
	},
	_bindMethod : function(cmp, dom, method) {
		var self          = this,
			handler       = '_' + method,
			transitionEnd = this.getTransitionEndEventName();

		if (!cmp[handler]) {
			cmp[handler] = function(e) {
				self[method].call(self, cmp, e);
			};
		}
		dom.addEventListener(transitionEnd, cmp[handler], false);
	},
	_isWindows : function() {
		var browser = $A.get('$Browser');
		// If browser variable is not available assume not windows
		if (!browser) { return false; }
		var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
		return browser.isWindowsPhone || isIE11 || browser.isIE10 ||
			browser.isIE9 || browser.isIE8 || browser.isIE7 || browser.isIE6;
	},
	_unbindTransitionEnd : function(cmp, dom, method) {
		var handlerName = '_' + method,
		    transitionEnd = this.getTransitionEndEventName();

		dom.removeEventListener(transitionEnd, cmp[handlerName], false);
	},
	_getDOMElements : function(cmp) {
		var panel      = cmp.getElement(),
			wrapper    = cmp.find('panel'),
			button     = cmp.find('button'),
			isModal    = cmp.get("v.isModal"),
			modal      = isModal && cmp.find('modal-glass'),
			buttonDOM  = button.getElement(),
			wrapperDOM = wrapper.getElement(),
			modalDOM   = modal && modal.getElement();

		return {
			panel : panel,
			wrapper : wrapperDOM,
			modal : modalDOM,
			button : buttonDOM
		};
	},
	slideIn : function(cmp, evt) {
		var dom = this._getDOMElements(cmp);
		
		// move panel to the top before sliding out as parent panels will be inactive
		dom.panel.style.top = '0';

		$A.util.addClass(dom.modal, 'visible');
		this._bindMethod(cmp, dom.panel, 'slideInTransitionEnd');
		var button = cmp.find("button").get("v.body");
		if (button.length > 0) {
			var iconCmp = button[0];
			if(cmp.get("v.iconTransformation")){
				$A.util.addClass(iconCmp.getElement(), cmp.get("v.iconTransformation"));
			}
			iconCmp.getElement().setAttribute("title",cmp.get("v.panelInAltText"));//set alt text in icon without rendering
		}
		$A.util.addClass(dom.panel, 'slideIn');
		var useEsc = $A.util.getBooleanValue(cmp.get("v.escToClose"));
		var that = this;
		if (useEsc) {
			$A.util.on(window, "keydown", cmp._windowKeyHandler);
		}

        $A.getEvt('ui:panelTransitionBegin').setParams({
            panel: cmp,
            isOpening: true
        }).fire();
	},

	slideOut : function(cmp, evt) {
		var dom = this._getDOMElements(cmp);
		this._bindMethod(cmp, dom.panel, 'slideOutTransitionEnd');
		$A.util.removeClass(dom.panel, 'slideIn');
		var iconCmp = cmp.find("button").get("v.body")[0];
		if(cmp.get("v.iconTransformation")){
			$A.util.removeClass(iconCmp.getElement(), cmp.get("v.iconTransformation"));
		}
		iconCmp.getElement().setAttribute("title",cmp.get("v.panelOutAltText"));
		var useEsc = $A.util.getBooleanValue(cmp.get("v.escToClose"));
		if (useEsc) {
			$A.util.removeOn(window, "keydown", cmp._windowKeyHandler);
		}

        $A.getEvt('ui:panelTransitionBegin').setParams({
            panel: cmp,
            isOpening: false
        }).fire();
	},

	toggleSlide : function(cmp, evt) {
		if (cmp._inTransition) {
			return;
		}

		if (cmp._panelSlideIn) {
			this.slideOut(cmp, evt);
		} else {
			this.slideIn(cmp, evt);
		}
	},
	 
	getPrefix : function () {
    	if (!this._prefix) {
	        var styles = window.getComputedStyle(document.documentElement, ''),
	            pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
	            up = $A.util.isIE;
	        
	        this._prefix = up ? pre.toUpperCase() : pre;
    	}
        return this._prefix;
	},
	
	getTransitionEndEventName: function () {
        var eventName = this.TRANSITION_END_EVENT_NAMES[this.getPrefix()];
        return eventName ? eventName : 'transitionend';
    },
    
    TRANSITION_END_EVENT_NAMES: {
        webkit : 'webkitTransitionEnd',
        o : 'oTransitionEnd',
        moz : 'transitionend',
        ms : 'transitionend' // IE 10 or above
    }
})
