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

		/* TODO this method talks to the DOM a lot because I wrote this before I
			understood aura and is in general janky, please fix in 200: W-2726214 */
		
		var direction = component.get('v.direction');
		
		var target = component.getElement();
		var ttWrapper = component.find('tooltipwrapper').getElement();


		component.set('v.direction', direction);

		['north', 'south', 'west' , 'east'].forEach(function(directions) {
			component.constraints[directions].disable();
			component.constraints[directions + '_pointer'].disable();
			component.constraints[directions + 'pointerBox'].disable();

			// Manipulating classes directly to avoid re-render: 
			ttWrapper.classList.remove(directions);
			if(component.constraints[directions + 'PointerOverlap']) {
				component.constraints[directions + 'PointerOverlap'].disable();
				component.constraints[directions + 'pointerBox'].disable();
			}  
		});

		



		component.constraints[direction].enable();
		ttWrapper.classList.add(direction);
		component.constraints[direction + '_pointer'].enable();
		if(component.constraints[direction + 'PointerOverlap']) {
			component.constraints[direction + 'PointerOverlap'].enable();
		}
		component.constraints[direction + 'pointerBox'].enable();
		// classname must be set after constraints
        // for advanced tooltips to avoid positioning issues
		
		
	},

	buildTooltip: function(component) {
		var FLIP_THRESHOLD = 50;
		var node = component.find('tooltip').getElement();
		var direction = component.get('v.direction');
		var ttbodyNode = component.find('tooltipbody').getElement();
		var pointer = node.querySelector('.pointer');
		var target = component.getElement();
		var lib = this.lib.panelPositioning;
		var bbDirections;
		var thisConstraint;
		var classList = component.get('v.classList');
		

		var allowFlips = $A.util.getBooleanValue(component.get('v.allowFlips'));
		var boundingRect = target.getBoundingClientRect();
		var ttWrapper = component.find('tooltipwrapper').getElement();

		if(allowFlips && boundingRect.top < FLIP_THRESHOLD) {
			direction = 'south';
		} else if (allowFlips && document.documentElement.clientHeight - (boundingRect.top + boundingRect.height) < FLIP_THRESHOLD) {
			direction = 'north';
		}
		
		// TODO remove ugly class manipulation, W-2726214
		var classArr = classList.split(' ');
		classArr = classArr.filter(function(item) {
			if(item.match(/north|east|west|south/)) {
				return false;
			} else {
				return true;
			}
		});
		
		classArr.push(direction);
		component.set('v.direction', direction);
		component.set('v.classList', classArr.join(' '));

		ttWrapper.className = classArr.join(' ');

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

	_doUpdatePosition: function() {
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
				if(component.get('v.isVisible')) {
					tt.classList.add('visible');
				}
				
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
			
		}
		component._trigger = node;
		this.buildTooltip(component);
	}
})// eslint-disable-line semi