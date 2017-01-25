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

	initStyle: function(component) {

		var tabIndex = component.get('v.tabIndexOverride');
		var trigger            = component.get('v.trigger');

		if(tabIndex === 0 || Math.abs(tabIndex) > 0) {
            component.set('v.tabIndex', tabIndex);
        } else {
            component.set('v.tabIndex', 0);
        }

        if(trigger === 'none' || trigger === '') {
	        component.set('v.disabled', true);
        }

		
		this.ttLib.tooltip.computeTooltipStyle(component);

	},

	updateBodyText: function(component) {
		if(component._tooltip && component._tooltip.isValid()) {
			component._tooltip.set('v.tooltipBody', component.get('v.tooltipBody'));
		}
	},


	buildTooltip: function(component, cb) {
		var cmLib = this.cmLib;
		var compDef = {};
		if(component._tooltip) {
			setTimeout($A.getCallback(function () {
				cb(component._tooltip);
			}, 0));
		} else {
			['tooltipBody', 
				'isVisible', 
				'tooltipBody', 
				'classList',
				'class',
				'direction', 
				'fadeOut', 
				'fadeIn',
				'domId',
				'fadeOutDuration',
				'fadeInDuration',
				'boundingElementSelector',
				'delay'].forEach(function(attr) {
					compDef[attr] = component.get('v.' + attr);
				});
			
			compDef.target = component.getGlobalId();

			$A.createComponent('markup://ui:tooltipAdvanced', compDef, function(tt, status){
				if (status === "SUCCESS") {
					cmLib.containerManager.getSharedInstance().renderContainer(tt);
	                component._tooltip = tt;
	                cb(tt);
				}
            });
		}
		
	},

	_doUpdatePosition: function() {
		this.lib.panelPositioning.reposition();
	},

	_handlePositionEvents: function(ev, component) {
		this.updatePosition(component, true);
	},

	show: function(component) {

		var self = this;
		component._toggleGuard = true;

		setTimeout(function() {
			component._toggleGuard = false;
		}, 500);
		
		component.set('v.isVisible', false);
		this.buildTooltip(component, $A.getCallback(function(tt) {
			if (tt && tt.isValid()) {
				tt.set('v.isVisible', true);
				self.smLib.stackManager.bringToFront(tt);
			}
		}));
	},


	// if async is true this will throttle calls
	// to once every 10ms.
	updatePosition: function(component, async) {
		var self = this;
		clearTimeout(component._tHandle);

		if(async) {
			component._tHandle = setTimeout(function() {
				self._doUpdatePosition(component);
			}, 10);
		} else {
			self._doUpdatePosition(component);
		}
	},

	hide: function(component) {

		this.buildTooltip(component, $A.getCallback(function(tt){
			//Race condition causes tt to be null
			if(tt && tt.isValid()) {
				tt.set('v.isVisible', false);
			}
			if(component.isValid()) {
				component.set('v.isVisible', false);
			}
			
		}));

	},

	toggle: function(component) {
		
		//make sure toggle isn't called 
		//over and over again
		if(component._toggleGuard) {
			return;
		} 
		var self = this;
		this.buildTooltip(component, function(tt) {
			if(tt.get('v.isVisible')) {
				self.hide(component);
			} else {
				self.show(component);
			}
		});
		
	},

	cleanup: function(component) {
		if(component._tooltip ) {
			this.cmLib.containerManager.getSharedInstance().destroyContainer(component._tooltip);
			component._tooltip = null;
		}
	},

	makeTrigger: function(component) {

		var self = this;
		var trigger = component.get('v.trigger');
		var disabled = component.get('v.disabled');
		var node = component.getElement();
		var focusHandled = false;

		
		var showComponent = $A.getCallback(function() {
			self.show(component);
		});
		var hideComponent = $A.getCallback(function() {
			self.hide(component);
		});


		if(!trigger || trigger === 'none') {
			disabled = true;
		}

		if(!disabled) {
			// if hover is the trigger, focus should still
			// work for a11y
						//stupid focus doesn't bubble.
			var list = node.querySelectorAll('a,object,input,select,textarea,button,[tabindex]');

			for (var i = 0; i < list.length; i++) {
				list[i].addEventListener('focus', showComponent);
				list[i].addEventListener('blur', hideComponent);
				focusHandled = true;
			}

		}

		/* this will remove the tabindex from the created 
			target if there is already a focusable element inside */
		if(focusHandled) {
			component.set('v.tabIndexOverride', -1, true);
		}
		component._trigger = node;

	}
})// eslint-disable-line semi
