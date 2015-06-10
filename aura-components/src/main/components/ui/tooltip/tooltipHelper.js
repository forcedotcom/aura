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

		var node = component.find('tooltip').getElement();
		var direction = component.get('v.direction');
		var ttbodyNode = component.find('tooltipbody').getElement();
		var pointer = node.querySelector('.pointer');
		var target = component.getElement();
		var lib = this.lib.panelPositioning;
		var bbDirections;

		var targetAlign, align;

		switch (direction) {
            case 'north':
                align = 'center bottom';
                targetAlign = 'center top';
                bbDirections = {
                    left:true,
                    right:true
                };
                break;
            case 'south':
                align = 'center top';
                targetAlign = 'center bottom';
                bbDirections = {
                    left:true,
                    right:true
                };
                break;
            case 'west':
                align = 'right center';
                targetAlign = 'left center';
                bbDirections = {
                    top:true,
                    bottom:true
                };
                break;
            case 'east':
                align = 'left center';
                targetAlign = 'right center';
                bbDirections = {
                    top:true,
                    bottom:true
                };
                break;
		}


		if(!component._tooltip) {
			component._tooltip = node;
			component._tooltip.style.display = 'block';
			document.body.appendChild(node);

			lib.createRelationship({
				element:ttbodyNode,
				target:component._trigger,
				align:align,
				targetAlign:targetAlign,
				enable: true,
				pad: 10
			});

			lib.createRelationship({
				element:ttbodyNode,
				target:window,
				type:'bounding box',
				weight: 'medium',
				enable: true,
				pad: 2
			});

			lib.createRelationship({
				element:pointer,
				target:target,
				align:align,
				targetAlign: targetAlign,
				weight: 'medium',
				enable: true,
				pad: 0
			});

			if(direction === 'east') {
                lib.createRelationship({
                    element:pointer,
                    target:ttbodyNode,
                    align: 'right center',
                    targetAlign: 'left center',
                    enable: true,
                    pad: 0
                });
            }

            if(direction === 'west') {
                lib.createRelationship({
                    element:pointer,
                    target:ttbodyNode,
                    align: 'left center',
                    targetAlign: 'right center',
                    enable: true,
                    pad: 0
                });
            }
            


			lib.createRelationship({
				element:pointer,
				target:ttbodyNode,
				type: 'bounding box',
				weight: 'medium',
				enable: true,
				boxDirections: bbDirections,
				pad: 5
			});

		}

		return component._tooltip;
	},

	_doUpdatePosition: function(component) {
		this.lib.panelPositioning.reposition();
	},

	_handlePositionEvents: function(ev, component) {
		this.updatePosition(component, true);
	},



	_canFocus: function() {

	},



	show: function(component) {
		var tt = this.buildTooltip(component);
		this.updatePosition(component, false);
		component.set('v.isVisible', true, false);
		tt.classList.add('visible');
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

		if(trigger === 'none') {
			disabled = true;
		}

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
		} else if(!disabled || trigger !== 'none') {
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