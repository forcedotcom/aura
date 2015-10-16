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

	testClickTriggerShow: {
		attributes : {"renderItem" : "triggers"},
		test: function(component) {
			var trigger = component.find('trigger1-trigger');
			var tt = component.find('trigger1');
			$A.test.clickOrTouch(trigger.getElement(), true, true);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? true : false;
			}, function() {
				$A.test.assertTruthy(tt._tooltip.className.match(/visible/), 'The tooltip has the visible class');
			});
		}
	},

	testClickTriggerHide: {
		attributes : {"renderItem" : "triggers"},
		test: function(component) {
			var trigger = component.find('trigger1-trigger');
			var tt = component.find('trigger1');
			$A.test.clickOrTouch(trigger.getElement(), true, true);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? true : false;
			}, function() {
				$A.test.clickOrTouch(trigger.getElement(), true, true);
				$A.test.addWaitFor(true, function(){
					return tt._tooltip.className.match(/visible/) ? false : true;
				}, function() {
					$A.test.assertFalsy(tt._tooltip.className.match(/visible/), 'The tooltip should not have the visible class');
				});
			});
		}
	},


	testAdvancedShow: {
		attributes : {"renderItem" : "advancedPositioning"},
		test: function(component) {
			var trigger = component.find('tooltip1-trigger').getElement();
			$A.test.fireDomEvent(trigger, "focus");
			var tt = component.find('tooltip1');
			$A.test.assertEquals('Hello world', $A.test.getText(tt._tooltip));
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(tt._tooltip,"visible");}, "The tooltip has the visible class");
		}
	},

	testAdvancedHide: {
		attributes : {"renderItem" : "advancedPositioning"},
		test: function(component) {
			var trigger = component.find('tooltip1-trigger').getElement();
			$A.test.fireDomEvent(trigger, "focus");
			
			var tt = component.find('tooltip1');
			$A.test.assertEquals('Hello world', $A.test.getText(tt._tooltip));
			setTimeout(function() {
				$A.test.fireDomEvent(trigger, "blur");
			}, 10);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? false : true;
			}, function(){
				$A.test.assertFalsy(tt._tooltip.className.match(/visible/), 'The tooltip does not have the visible class');
			});
		}	
	},

	//the tooltip should adjust to fit on the screen
	testLeftNearEdge: {
		attributes : {"renderItem" : "advancedPositioning"},
		test: function(component) {
			var tt = component.find('tooltip2');
			tt.show(tt);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? true : false;
			}, function(){
				var content = tt._tooltip.querySelector('.tooltip-body');
				var pointer = tt._tooltip.querySelector('.pointer');
				var bb = content.getBoundingClientRect();
				var pbb = pointer.getBoundingClientRect();
				$A.test.assertTrue(bb.left > 0, 'The content should not be outside the viewport');
				$A.test.assertTrue(pbb.left-5 > bb.left, 'The poiner should stay inside the box');
				tt.hide(tt);
			});
		}
	},

	// but the tooltip should not adjust so much the pointer doesn't fit anymore.
	// this is disabled because I'm not sure this is the right behavior
	_testLeftEdgeTooFar: {
		attributes : {"renderItem" : "advancedPositioning"},
		test: function(component) {
			var tt = component.find('tooltip3');
			tt.show(tt);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? true : false;
			}, function(){
				var content = tt._tooltip.querySelector('.tooltip-body');
				var pointer = tt._tooltip.querySelector('.pointer');
				var bb = content.getBoundingClientRect();
				var pbb = pointer.getBoundingClientRect();
				$A.test.assertTrue(bb.left < 0, 'The content can leave the view port');
				$A.test.assertTrue(pbb.left-5 > bb.left, 'The poiner should stay inside the box');
				tt.hide(tt);
			});
		}
	},

	testRightNearEdge: {
		attributes : {"renderItem" : "advancedPositioning"},
		test: function(component) {
			var tt = component.find('tooltip4');
			tt.show(tt);
			$A.test.addWaitFor(true, function(){
				return tt._tooltip.className.match(/visible/) ? true : false;
			}, function(){
				var content = tt._tooltip.querySelector('.tooltip-body');
				var pointer = tt._tooltip.querySelector('.pointer');
				var bb = content.getBoundingClientRect();
				var pbb = pointer.getBoundingClientRect();
				$A.test.assertTrue(bb.right < window.innerWidth, 'The content can leave the view port');
				$A.test.assertTrue(pbb.right < bb.right-5, 'The poiner should stay inside the box ' + pbb.right + ' ' + bb.right);
				tt.hide(tt);
			});
		}
	}
})
