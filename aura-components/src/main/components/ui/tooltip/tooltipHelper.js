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

	initStyle: function(component) {
        var domId = component.get('v.domId');

        if(!domId) {
            domId = component.getConcreteComponent().getGlobalId();
        }
        var fadeInDuration     = component.get('v.fadeInDuration'),
	        fadeOutDuration    = component.get('v.fadeOutDuration'),
	        triggerClass       = component.get('v.triggerClass'),
	        extraClass         = component.get('v.class'),
	        delay              = component.get('v.delay'),
	        direction          = component.get('v.direction'),
	        tabIndex           = component.get('v.tabIndexOverride'),
	        trigger            = component.get('v.trigger'),
	        disabled           = component.get('v.disabled');
        
        if(trigger === 'none' || trigger === '') {
            component.set('v.disabled', true);
        }

        if(!fadeInDuration) {
            fadeInDuration = 0;
        }

        if(!fadeOutDuration) {
            fadeOutDuration = 0;
        }

        
        var classList = ['tooltip'];

        if(extraClass) {
            classList.push(extraClass);
        }

        if(direction) {
            classList.push(direction);
        }

        if(fadeInDuration > 0) {
            classList.push('fade-in');
        }
        if(fadeOutDuration > 0) {
            classList.push('fade-out');
        }

        if(disabled) {
            classList.push('disabled');
        }

        if(fadeInDuration > fadeOutDuration) {
            fadeOutDuration = fadeInDuration;
        } else {
            fadeInDuration = fadeOutDuration;
        }

        var styleDeclaration = [
            '-webkit-transtion-duration:' + fadeInDuration + 'ms',
            'transition-duration:' + fadeInDuration  + 'ms',
            '-webkit-transition-delay:' + delay  + 'ms', 
            'transition-delay:' + delay  + 'ms'
        ];

        if(tabIndex === 0 || Math.abs(tabIndex) > 0) {
            component.set('v.tabIndex', tabIndex);
        } else {
            component.set('v.tabIndex', 0);
        }

        component.set('v.tooltipStyle', styleDeclaration.join(';'));
        component.set('v.domId', domId);
        component.set('v.classList', classList.join(' '));
	},

	updateConstraints: function(component) {
		/* Distance from the top or bottom of the viewport
		   that causes a flip */
		var FLIP_THRESHOLD = 50;
		var direction = component.get('v.direction');
		var allowFlips = $A.util.getBooleanValue(component.get('v.allowFlips'));
		var target = component.getElement();
		var boundingRect = target.getBoundingClientRect();
		
		if(allowFlips && boundingRect.top < FLIP_THRESHOLD) {
			direction = 'south';
			component.set('v.direction', 'south');
		} else if (allowFlips && document.documentElement.clientHeight - (boundingRect.top + boundingRect.height) < FLIP_THRESHOLD) {
			direction = 'north';
			component.set('v.direction', 'north');
		} else if (allowFlips) {
			direction = component.originalDirection;
			component.set('v.direction', component.originalDirection);
		}

		['north', 'south', 'west' , 'east'].forEach(function(direction) {
			component.constraints[direction].disable();
			component.constraints[direction + '_pointer'].disable();
			if(component.constraints[direction + 'PointerOverlap']) {
				component.constraints[direction + 'PointerOverlap'].disable();
				component.constraints[direction + 'pointerBox'].disable();
			}  
		});

		component.constraints[direction].enable();
		component.constraints[direction + '_pointer'].enable();
		if(component.constraints[direction + 'PointerOverlap']) {
			component.constraints[direction + 'PointerOverlap'].enable();
		}
		component.constraints[direction + 'pointerBox'].enable();
		
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
		var thisConstraint;
		
		var constraintMap = {
            north : {
                align: 'center bottom',
                targetAlign : 'center top',
                bbDirections : {
                    left:true,
                    right:true
                }
            },
            south : {
                align: 'center top',
                targetAlign : 'center bottom',
                bbDirections : {
                    left:true,
                    right:true
                }
            },
            west : {
                align: 'right center',
                targetAlign : 'left center',
                bbDirections : {
                    top:true,
                    bottom:true
                }
            },
            east : {
                align : 'left center',
                targetAlign : 'right center',
                bbDirections : {
                    top:true,
                    bottom:true
                }
            }
		};


		if(!component._tooltip) {
			component.originalDirection = direction;
			/*
			
			IMPORTANT. The order in which constraints
			are applied matters. The last constraint applied
			has the highest priority.
			 */
			component.constraints = {};

			component._tooltip = node;
			component._tooltip.style.display = 'block';
			document.body.appendChild(node);

			for(thisConstraint in constraintMap) {
				component.constraints[thisConstraint] = lib.createRelationship({
					element:ttbodyNode,
					target:component._trigger,
					align:constraintMap[thisConstraint].align,
					targetAlign:constraintMap[thisConstraint].targetAlign,
					enable: false,
					pad: 10
				});
			}

			component.constraints.windowBox = lib.createRelationship({
				element:ttbodyNode,
				target:window,
				type:'bounding box',
				enable: true,
				pad: 5,
				boxDirections: {
					left:true,
					right:true
				}
			});

			for(thisConstraint in constraintMap) {

				component.constraints[thisConstraint + '_pointer'] = lib.createRelationship({
					element:pointer,
					target:target,
					align:constraintMap[thisConstraint].align,
					targetAlign: constraintMap[thisConstraint].targetAlign,
					enable: false,
					pad: 0
				});

			}

			component.constraints.eastPointerOverlap = lib.createRelationship({
                    element:pointer,
                    target:ttbodyNode,
                    align: 'right center',
                    targetAlign: 'left center',
                    enable: true,
                    pad: 0
            });

			component.constraints.westPointerOverlap = lib.createRelationship({
                    element:pointer,
                    target:ttbodyNode,
                    align: 'left center',
                    targetAlign: 'right center',
                    enable: false,
                    pad: 0
            });
           

			for(thisConstraint in constraintMap) {

				if(thisConstraint === 'north' || thisConstraint === 'south') {
					bbDirections = {
						left:true,
						right:true
					};
				} else {
					bbDirections = {
						top: true,
						bottom:true
					};
				}

				component.constraints[thisConstraint + 'pointerBox'] = lib.createRelationship({
					element:pointer,
					target:ttbodyNode,
					type: 'bounding box',
					enable: false,
					boxDirections: bbDirections,
					pad: 5
				});
			
			}



			

		}

		this.updateConstraints(component);

		return component._tooltip;
	},

	_doUpdatePosition: function(component) {
		this.lib.panelPositioning.reposition();
	},

	_handlePositionEvents: function(ev, component) {
		this.updatePosition(component, true);
	},

	show: function(component) {
		var tt = this.buildTooltip(component);
		this.updateConstraints(component);
		this.updatePosition(component, false);
		component.set('v.isVisible', true, false);
		requestAnimationFrame(function() {
			tt.classList.add('transition-start');
			requestAnimationFrame(function() {
				tt.classList.add('visible');
			});
			
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

	cleanup: function(component) {
		if(component._tooltip) {
			component._tooltip.parentNode.removeChild(component._tooltip);
		}

	},

	makeTrigger: function(component) {
		var self = this;
		var showTrigger = 'mouseover';
		var hideTrigger = 'mouseout';
		var trigger = component.get('v.trigger');
		var disabled = component.get('v.disabled');
		var node = component.getElement();
		
		if(!trigger || trigger === 'none') {
			disabled = true;
		}

		if(!disabled && trigger === 'click') {
			node.addEventListener('click', self.toggle.bind(self, component));
		} else if(!disabled || (trigger !== 'none' && trigger !== '')) {

			// if hover is the trigger, focus should still
			// work for a11y
						//stupid focus doesn't bubble.
			var list = node.querySelectorAll('a,object,input,select,textarea,button,[tabindex]');

			for (var i = 0; i < list.length; i++) {
				list[i].addEventListener('focus', function() {
					self.show.call(self, component);
				});
				list[i].addEventListener('blur', function() {
					self.hide.call(self, component);
				});
			}

			node.addEventListener('focus', function() {
				self.show.call(self, component);
			});

			node.addEventListener('blur', function() {
				self.hide.call(self, component);
			});


			if(trigger === 'hover') {
				node.addEventListener(showTrigger, function() {
					self.show.call(self, component);
				});
				node.addEventListener(hideTrigger, function() {
					self.hide.call(self, component);
				});
			}
			
		} else {
			console.log('disabled');
		}
		component._trigger = node;
		this.buildTooltip(component);
	}
})