/*jshint asi:true,expr:true,unused:false,newcap:false*/
/*global Fixture,Fact,Skip,Trait,Async,Data,Assert,Mocks,Test,Record,Stubs,Import,ImportJson,MockedImport*/
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
Function.RegisterNamespace("Test.Components.Ui.PanelPositioning");	

[Fixture]
Test.Components.Ui.PanelPositioning.constraintTests=function(){

	var Constraint;

	function getMockElement(clientBoundingRect) {
		var direction;

		var mockElement = {};
		for(direction in clientBoundingRect) {
			mockElement[direction] = clientBoundingRect[direction];
		}

		mockElement.set = function(key, value) {
			this[key] = value;
		};

		mockElement.refresh = function() {

		};

		return mockElement;

	}

	[ImportJson("aura-components/src/main/components/ui/panelPositioningLib/constraint.js", function(path, result) {
		Constraint = result().Constraint;
	})]

	[Fixture]
	function newConstraint() {

		[Fact]
		function constraintConstructorRegistered() {
			Assert.NotEmpty(Constraint);
		}

		[Fact]
		function instationtionCreatesObject() {
			var targetElement = getMockElement({top:0, left:0, height: 200, with: 200});
			var element = getMockElement({top:200, left:0, height: 100, width: 100});

			var myConstraint = new Constraint('top', {
				element: element,
				targetElement: targetElement,
				targetAlign: 'left top'
			});

			Assert.NotEmpty(myConstraint);

		}
	}

	[Fixture]
	function defaultPositioning() {

		[Fact]
		function targetTopElementBottom() {
			var elementDims = {top:200, left:0, height: 100, width: 100},
				targetDims = {top:500, left:0, height: 200, width: 200};
			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('bottom', {
				element: element,
				target: targetElement,
				targetAlign: 'center top'
			});

			myConstraint.updateValues();
			myConstraint.reposition();

			var expected = targetDims.top - elementDims.height;

			Assert.Equal(expected, element.top);
		}

		[Fact]
		function targetTopElementTop() {

			var elementDims = {top:200, left:0, height: 100, width: 100},
				targetDims = {top:500, left:0, height: 200, with: 200};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('top', {
				element: element,
				target: targetElement,
				targetAlign: 'left top'
			});

			myConstraint.updateValues();
			myConstraint.reposition();

			var expected = targetDims.top;

			Assert.Equal(expected, element.top);
		}

		[Fact]
		function targetBottomElementTop() {

			var elementDims = {top:234, left:0, height: 100, width: 100},
				targetDims = {top:500, left:0, height: 200, with: 200};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('top', {
				element: element,
				target: targetElement,
				targetAlign: 'center bottom'
			});

			myConstraint.updateValues();
			myConstraint.reposition();

			var expected = targetDims.top + targetDims.height;

			Assert.Equal(expected, element.top);
		}

		[Fact]
		function targetLeftElementRight() {
			var elementDims = {top:200, left:0, height: 100, width: 100},
				targetDims = {top:500, left:600, height: 200, width: 200};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('right', {
				element: element,
				target: targetElement,
				targetAlign: 'left top'
			});

			var expected = targetDims.left - elementDims.width;

			myConstraint.updateValues();
			myConstraint.reposition();

			

			Assert.Equal(expected, element.left);
		}

		[Fact]
		function targetLeftElementLeft() {
			var targetDims = {top:500, left:600, height: 200, width: 200};
			var elementDims = {top:200, left:0, height: 100, width: 100};


			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('left', {
				element: element,
				target: targetElement,
				targetAlign: 'left top'
			});

			myConstraint.updateValues();
			myConstraint.reposition();

			var expected = targetDims.left;

			Assert.Equal(expected, element.left);
		}

		[Fact]
		function targetRightElementRight() {

			var targetDims = {top:500, left:600, height: 200, width: 200};
			var elementDims = {top:200, left:0, height: 100, width: 100};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('right', {
				element: element,
				target: targetElement,
				targetAlign: 'right top'
			});

			var expected = targetDims.left + targetDims.width - elementDims.width;

			myConstraint.updateValues();
			myConstraint.reposition();

			Assert.Equal(expected, element.left);
		}

		[Fact]
		function targetCenterElementMiddle() {

			var targetDims = {top:500, left:600, height: 200, width: 200};
			var elementDims = {top:200, left:0, height: 100, width: 100};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('middle', {
				element: element,
				target: targetElement,
				targetAlign: 'right center'
			});


			myConstraint.updateValues();
			myConstraint.reposition();

			/**
			 *
			 * Vertical center means this:
			 *
			 * elementTop + elementHeight/2 = targetTop + targetHeight/2
			 *
			 * Solve for element Top:
			 *
			 * elementTop = 0.5 * (2 * targetTop + targetHeight - elementHeight )
			 * 
			 */
			
			var expected = 0.5 * (2 * targetDims.top + targetDims.height - elementDims.height);

			Assert.Equal(expected, element.top);
		}

		[Fact]
		function targetRightElementRightWithPad() {

			var targetDims = {top:500, left:600, height: 200, width: 200};
			var elementDims = {top:200, left:0, height: 100, width: 100};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('right', {
				element: element,
				target: targetElement,
				pad: 10,
				targetAlign: 'right top'
			});

			var expected = (targetDims.left + targetDims.width - elementDims.width - 10);
			myConstraint.updateValues();
			myConstraint.reposition();

			Assert.Equal(expected, element.left);

		}

		[Fact]
		function targetTopElementTopWithPad() {

			var elementDims = {top:200, left:0, height: 100, width: 100},
				targetDims = {top:500, left:0, height: 200, with: 200};

			var targetElement = getMockElement(targetDims);
			var element = getMockElement(elementDims);

			var myConstraint = new Constraint('top', {
				element: element,
				target: targetElement,
				targetAlign: 'left top',
				pad: 10
			});

			myConstraint.updateValues();
			myConstraint.reposition();

			var expected = targetDims.top + 10;

			Assert.Equal(expected, element.top);
		}

	}

	

};
