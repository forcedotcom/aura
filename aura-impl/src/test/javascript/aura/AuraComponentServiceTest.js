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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraComponentServiceTest = function(){
	// Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
	Mocks.GetMock(Object.Global(), "exp", function() {
	})(function() {
		// #import aura.AuraComponentService
	});

    // Mocks necessary to create a new AuraComponentService Object
    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        ComponentDefRegistry: function(){},
        ControllerDefRegistry: function(){},
        ActionDefRegistry: function(){},
        ModelDefRegistry: function(){},
        ProviderDefRegistry: function(){},
        RendererDefRegistry: function(){},
        HelperDefRegistry: function(){},
        exp: function(){}
    });

    [Fixture]
    function NewComponentAsync(){
        [Fact]
        function AssertsConfigIsPresent(){
            // Arrange
            var expected = "config is required in ComponentService.newComponentAsync(config)";
            var target;
            mockOnLoadUtil(function(){
                target = new AuraComponentService();
            });
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(condition, message) {
                    if (!condition) {
                        var error = new Error(message);
                        throw error;
                    }
                }
            });

            // Act
            mockAssert(function(){
                actual = Record.Exception(function(){
                    target.newComponentAsync(null, function(){}, undefined);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AssertsCallbackIsPresent(){
            // Arrange
            var expected = "newComponentAsync requires a function as the callback parameter";
            var target;
            mockOnLoadUtil(function(){
                target = new AuraComponentService();
            });
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(condition, message) {
                    if (!condition) {
                        var error = new Error(message);
                        throw error;
                    }
                },
                util: {
                    isFunction: function(obj){
                        return false;
                    }
                }
            });

            // Act
            mockContext(function(){
                actual = Record.Exception(function(){
                    target.newComponentAsync(null, undefined, {});
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
