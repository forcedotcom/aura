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

Function.RegisterNamespace("Test.Aura.Html");

[Fixture]
Test.Aura.Html.HtmlHelperTest = function(){

    Function.RegisterNamespace("Aura.Component");
    [Import("aura-impl/src/main/resources/aura/component/Component.js"),
     Import("aura-impl/src/main/resources/aura/component/HtmlComponent.js")]
     delete Component;
     delete HtmlComponent;

    [Fixture]
    function dispatchAction() {
        var mockAura = Mocks.GetMock(Object.Global(), "$A", {
                run : function(func) {
                    func();
                }
            });

        [Fact]
        function ActionRunsWtihEventArgument() {
            // Arrange
            var mockEvent = {};
            var mockAction = Stubs.GetObject({runDeprecated : function(event){}});
            var targetHelper = Aura.Component.HtmlComponent.prototype.helper;

            // Act
            mockAura(function(){
                targetHelper.dispatchAction(mockAction, mockEvent);
            });

            // Assert
            Assert.True(mockAction.runDeprecated.Calls[0].Arguments.event === mockEvent);
        }
    }
}
