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
	positionList: function(component) {
		var referenceElement = component.get("v.referenceElement");
		if ($A.util.isEmpty(referenceElement)) {
			return;
		}
		var listElement = component.getElement();
        listElement.style.width = referenceElement.getBoundingClientRect().width + 'px';

        // All these styles are necessary since sometimes the position library puts some wonky left and top position values
		// which make scrollbars appear on a page when it doesn't need to and cause it to not align correctly.
		listElement.style.opacity = 0;
		listElement.style.left = 0;
		listElement.style.top = 0;

		// The items take a while to render and the iterationComplete event doesn't get fired after they're rendered,
		// so the only way to make sure all the items in the list are rendered by the time this is fired is to push
		// this to the bottom of the callstack.
		var self = this;
		window.requestAnimationFrame($A.getCallback(function () {
			self.addPositionConstraintAndReposition(component, listElement, referenceElement);
		}));
	},

	shouldFlip: function(element, targetElement) {
		var viewPort = $A.util.getWindowSize();
		var elemRect = element.getBoundingClientRect();
		var referenceElemRect = targetElement.getBoundingClientRect();
		var height = elemRect.height;

		return (referenceElemRect.top >= height  // enough space above
		&& (viewPort.height - referenceElemRect.bottom) < height); // not enough space below
	},

	addPositionConstraintAndReposition: function (component, listElement, referenceElement) {
		// If we've flipped upwards we just want to stay that way or else we can potentially keep flipping
		if(!$A.util.getBooleanValue(component._shouldFlip)) {
			component._shouldFlip = this.shouldFlip(listElement, referenceElement);
		}

		var listVerticalAlignment = component._shouldFlip ? "top" : "bottom";
		var listAlign = "left " + (listVerticalAlignment === "top" ? "bottom" : "top");
		var targetAlign = "left " + listVerticalAlignment;
		component.positionConstraint = this.lib.panelPositioning.createRelationship({
			element: listElement,
			target: referenceElement,
			appendToBody: true,
			align: listAlign,
            targetAlign: targetAlign,
			padTop: 2
		});

		this.reposition(component, $A.getCallback(function () {
			listElement.style.opacity = 1;
		}));
	},

	reposition: function(component, callback) {
		if(component.get('v.visible') && component.positionConstraint) {
			this.lib.panelPositioning.reposition(callback);
		}
	},

	showPositionList : function(component) {
		if (component.positionConstraint) {
            component.positionConstraint.enable();
		} else {
            this.positionList(component);
		}
	},

	hidePositionList : function(component) {
		if (component.positionConstraint) {
			component.positionConstraint.disable();
		}
	},

	clearPositionConstraint: function(component) {
		if(component.positionConstraint) {
			component.positionConstraint.destroy();
			component.positionConstraint = undefined;
		}
	}
})// eslint-disable-line semi
