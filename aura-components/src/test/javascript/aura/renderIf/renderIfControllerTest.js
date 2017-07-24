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

Function.RegisterNamespace("Test.Aura.RenderIf");

[Fixture]
Test.Aura.RenderIf.RenderIfControllerTest = function(){
    var controller;
    var auraMock = function(delegate) {
        Mocks.GetMocks(Object.Global(), {
            $A:{
                util:{
                    getBooleanValue: function() {}
                }
           }
         })(function(){
            ImportJson("aura-components/src/main/components/aura/renderIf/renderIfController.js", function(path, result) {
                controller = result;
            });
            delegate();
        });
    };

    [Fixture]
    function updateBody() {
        [Fact]
        function BeginsWithUpdatingUndefined() {
            // Arrange
            var actual;
            var cmp = {
                get: function(exp) {
                    if (exp === "v.isTrue") {
                        actual = cmp.updating;
                    }
                },
                set: function() {}
            };

            // Act
            auraMock(function() {
                controller.updateBody(cmp);
            });

            // Assert
            Assert.Undefined(actual, "updating should not be set before cmp.get");
        }

        [Fact]
        function SetsUpdating() {
            // Arrange
            var actual;
            var cmp = {
                get: function() {},
                set: function() {
                    actual = cmp.updating;
                }
            };

            // Act
            auraMock(function() {
                controller.updateBody(cmp);
            });

            // Assert
            Assert.True(actual, "updating should be set after cmp.get");
        }

        [Fact]
        function UnsetsUpdating() {
            // Arrange
            var actual;
            var cmp = {
                get: function(exp) {},
                set: function() {}
            };

            // Act
            auraMock(function() {
                controller.updateBody(cmp);
                actual = cmp.updating;
            });

            // Assert
            Assert.False(actual, "updating should not be set after updateBody");
        }
    }
}