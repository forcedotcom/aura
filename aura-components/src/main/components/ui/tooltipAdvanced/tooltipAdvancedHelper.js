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
	getClassList: function() {
		return 'uiTooltip advanced-wrapper visible';
	},

	initStyle: function(component) {
		this.ttLib.tooltip.computeTooltipStyle(component);     
	},
	
	setStyle: function(component) {
	    var tooltip = component.find("tooltip");
        var tooltipStyle = component.get("v.tooltipStyle");
        tooltip.getElement().style = tooltipStyle;
	},

	show: function(cmp) {
		var classList = this.ttLib.tooltip.getClassList(cmp);

		classList.push('transition-start');

		cmp.set('v.classList', classList.join(' '));
		this.position(cmp);
		requestAnimationFrame($A.getCallback(function() {
			if(!cmp.isValid()) {
				return;
			}

			if(cmp.get('v.isVisible')) {
				classList.push('visible');
				cmp.set('v.classList', classList.join(' '));
			}
		}));
	},

	hide: function(cmp) {
		if(cmp.isValid()) {
			cmp.set('v.classList', this.ttLib.tooltip.getClassList(cmp).join(' '));
		}
		
	},

	position: function(component) {
		var FLIP_THRESHOLD = 50;
		var node = component.find('tooltip').getElement();
		var direction = component.get('v.direction');
		var ttbodyNode = component.find('tooltipbody').getElement();
		var ttWrapper = component.find('tooltipwrapper').getElement();
		var classList = component.get('v.classList');
		
		var pointer = node.querySelector('.pointer');
		var target = $A.getComponent(component.get('v.target')).getElement();

		var allowFlips = $A.util.getBooleanValue(component.get('v.allowFlips'));
		var boundingRect = target.getBoundingClientRect();

		var lib = this.lib.panelPositioning;
		var bbDirections;
		var thisConstraint;
		var classArr = classList.split(' ');

		var boundingElementSelector = component.get('v.boundingElementSelector');
		var boundingElement;

		if(!$A.util.getBooleanValue(boundingElementSelector)) {
			boundingElement = window;
		} else {
			boundingElement = document.querySelector(boundingElementSelector);
			if(!boundingElement) {
				boundingElement = window;
				$A.logger.warning('boundingElementSelector "'+ boundingElementSelector +'" matched no elements, falling back to window');
			}
		}

		if(allowFlips && boundingRect.top < FLIP_THRESHOLD) {
			direction = 'south';
		} else if (allowFlips && document.documentElement.clientHeight - (boundingRect.top + boundingRect.height) < FLIP_THRESHOLD) {
			direction = 'north';
		}

		
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

		component.originalDirection = direction;
		/*
		
		IMPORTANT. The order in which constraints
		are applied matters. The last constraint applied
		has the highest priority.
		 */
		component.constraints = {};
		node.style.display = 'block';

		for(thisConstraint in constraintMap) {
			component.constraints[thisConstraint] = lib.createRelationship({
				element:ttbodyNode,
				target:target,
				align:constraintMap[thisConstraint].align,
				targetAlign:constraintMap[thisConstraint].targetAlign,
				enable: false,
				pad: 10
			});
		}

		component.constraints.windowBox = lib.createRelationship({
			element:ttbodyNode,
			target:boundingElement,
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

		this.updateConstraints(component);

	},

	updateConstraints: function(component) {


		/* TODO this method talks to the DOM a lot because I wrote this before I
			understood aura and is in general janky, please fix in 200: W-2726214 */

		var direction = component.get('v.direction');

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
		this.lib.panelPositioning.reposition();
		// classname must be set after constraints
        // for advanced tooltips to avoid positioning issues
	}
})// eslint-disable-line semi