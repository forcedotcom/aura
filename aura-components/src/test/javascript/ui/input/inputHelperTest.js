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

Function.RegisterNamespace("Test.Components.Ui.Input");

[Fixture]
Test.Components.Ui.Input.HelperTest = function(){
	var targetHelper;

	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura-components/src/main/components/ui/input/inputHelper.js",function(path,result){
		targetHelper=result;
	});

    [Fixture]
    function renderFieldHelpComponent(){

		var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
			util: {
				isArray: function(array) {
					if(array instanceof Array){return true;}
					else {return false;}
				},
				isEmpty: function(array) {
					if(array.length > 0 ) {return false;}
					else {return true;}
				},
                isUndefinedOrNull: function(obj) {
					return obj === undefined || obj === null;
				}
            }
        });

    	[Fact]
    	function positiveTest() {
    		var tooltip = {};
    		tooltip.isInstanceOf = function(instance) {
    			return true;
    		};

    		var tooltipArray = [tooltip];
    		var body = [];
    		var labelComponent = {
    			get: function(attribute) {
    				if(attribute === 'v.body') {return body;}
    			}
    		};

    		var targetComponent = {
    				get: function(attribute) {
    					if(attribute === 'v.fieldHelpComponent') {
    						return tooltipArray;
    					}
    				},
    				find: function(component) {
    					if(component === 'inputLabel') {
    						return labelComponent;
    					}
    				}
    		};


			mockUtil(function() {
				targetHelper.renderFieldHelpComponent(targetComponent);
			});

    		Assert.Equal(1, labelComponent.get('v.body').length);
    	}

    	[Fact]
    	function nonArrayPassedToFieldHelpComponentTest() {

    		var notAnArray = "This is not an array";
    		var body = [];
    		var labelComponent = {
    			get: function(attribute) {
    				if(attribute === 'v.body') {return body;}
    			}
    		};

    		var targetComponent = {
    				get: function(attribute) {
    					if(attribute === 'v.fieldHelpComponent') {
    						return notAnArray;
    					}
    				},
    				find: function(component) {
    					if(component === 'inputLabel') {
    						return labelComponent;
    					}
    				}
    		};


			mockUtil(function() {
				targetHelper.renderFieldHelpComponent(targetComponent);
			});

    		Assert.Equal(0, labelComponent.get('v.body').length);
    	}

    	[Fact]
    	function emptyArrayPassedToFieldHelpComponentTest() {

    		var tooltipArray = [];
    		var body = [];
    		var labelComponent = {
    			get: function(attribute) {
    				if(attribute === 'v.body') {return body;}
    			}
    		};

    		var targetComponent = {
    				get: function(attribute) {
    					if(attribute === 'v.fieldHelpComponent') {
    						return tooltipArray;
    					}
    				},
    				find: function(component) {
    					if(component === 'inputLabel') {
    						return labelComponent;
    					}
    				}
    		};


			mockUtil(function() {
				targetHelper.renderFieldHelpComponent(targetComponent);
			});

    		Assert.Equal(0, labelComponent.get('v.body').length);
    	}

    	[Fact]
    	function nonInstanceOfTooltipTest() {
    		var notTooltip = {};
    		notTooltip.isInstanceOf = function(instance) {
    			return false;
    		};

    		var tooltipArray = [notTooltip];
    		var body = [];
    		var labelComponent = {
    			get: function(attribute) {
    				if(attribute === 'v.body') {return body;}
    			}
    		};

    		var targetComponent = {
    				get: function(attribute) {
    					if(attribute === 'v.fieldHelpComponent') {
    						return tooltipArray;
    					}
    				},
    				find: function(component) {
    					if(component === 'inputLabel') {
    						return labelComponent;
    					}
    				}
    		};


			mockUtil(function() {
				targetHelper.renderFieldHelpComponent(targetComponent);
			});

    		Assert.Equal(0, labelComponent.get('v.body').length);
    	}
    }

}