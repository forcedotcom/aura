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

	setTransform: function(el, transformValue) {

		//basically this only for safari support
		var list = ['webkitTransform', 'transform'];
		list.forEach(function(property) {
			el.style[property] = transformValue;
		});
	},


	buildTooltip: function(component) {
		var node = component.getElement();
		if(!component._tooltip) {
			component._tooltip = node.querySelector('.tooltip-advanced');
			component._tooltip.style.display = 'block';
			document.body.appendChild(component._tooltip);
		}

		return component._tooltip;
	},

	_doUpdatePosition: function(component) {
		var tt = component._tooltip;
		var ttContent = tt.querySelector('.content');
		
		var box = component._trigger.getBoundingClientRect();

		var topPos = box.top + window.scrollY;
		var leftPos = box.left + box.width/2;
		var ttBox = ttContent.getBoundingClientRect();
		var halfWidth = ttBox.width/2;
		
		var pad = 0;
		if(leftPos - halfWidth < 0) {
			pad = Math.abs(leftPos - halfWidth) + 10;
		}

		if(leftPos + halfWidth  > window.innerWidth - 15) {
			
			//extra for hiding scroll bars on mac laptops
			// pad = ttBox.right + window.innerWidth;
			pad = -(leftPos + halfWidth - window.innerWidth + 25);
		}

		if(pad > halfWidth - 15) {
			pad = halfWidth - 15;
		} else if (pad < -halfWidth+15) {
			console.log(true);
			pad = -halfWidth+20;
		}

		tt.style.top = topPos + 'px';
		tt.style.left = leftPos + 'px';
		this.setTransform(ttContent, 'translateX('+(pad)+'px)');
	},

	_handlePositionEvents: function(ev, component) {
		this.updatePosition(component, true);
	},

	_bindEvent: function(el, eventName, handler, component) {
		var self = this;

		var h = function(e) {
			handler.call(self, e, component);
		};

		el.addEventListener(eventName, h);

		return {
			detach: function() {
				el.removeEventListener(eventName, h);
			}
		};
	},

	_canFocus: function() {

	},



	show: function(component) {
		var tt = this.buildTooltip(component);
		this.updatePosition(component, false);
		component.set('v.isVisible', true, false);
		
		component.resizeHandler = this._bindEvent(window, 'resize', this._handlePositionEvents, component);
		component.scrollHandler = this._bindEvent(window, 'scroll', this._handlePositionEvents, component);
		requestAnimationFrame(function() {
			tt.classList.add('visible');
		});
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
		var tt = this.buildTooltip(component);
		tt.classList.remove('visible');
		component.set('v.isVisible', false, false);
		component.scrollHandler.detach();
		component.resizeHandler.detach();
	},

	toggle: function(component) {
		if(component.get('v.isVisible')) {
			this.hide(component);
		} else {
			this.show(component);
		}
	},

	makeTrigger: function(component) {
		var self = this;
		var showTrigger = 'mouseover';
		var hideTrigger = 'mouseout';
		var trigger = component.get('v.trigger');
		var disabled = component.get('v.disabled');
		var node = component.getElement();

		if(!disabled && trigger === 'focus') {
			showTrigger = 'focus';
			hideTrigger = 'blur';

			//stupid focus doesn't bubble.
			var list = node.querySelectorAll('a,object,input,select,textarea,button,[tabindex]');

			for (var i = 0; i < list.length; i++) {
				list[i].addEventListener(showTrigger, function() {
					self.show.call(self, component);
				});
				list[i].addEventListener(hideTrigger, function() {
					self.hide.call(self, component);
				});
			}
		} else if(!disabled && trigger === 'click') {
			node.addEventListener('click', self.toggle.bind(self, component));
		} else if(disabled || trigger !== 'none') {
			node.addEventListener(showTrigger, function() {
				self.show.call(self, component);
			});
			node.addEventListener(hideTrigger, function() {
				self.hide.call(self, component);
			});
		}

		component._trigger = node;
		this.buildTooltip(component);
	}
})