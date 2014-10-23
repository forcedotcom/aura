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
Function.RegisterNamespace("Test.Aura.Attribute");

[Fixture]
Test.Aura.Attribute.AttributeDefSetTest = function(){
    Mocks.GetMock(Object.Global(), "exp", function() {
    })(function() {
        // #import aura.attribute.AttributeDefSet
    });

    var configItem = function(param) {
        return {
            getDescriptor: function(){
                return {
                    getQualifiedName: function(){
                        return param;
                    }
                }
            }
        }
    }

    [Fixture]
    function Constructor(){
        var mockAttributeDef = Mocks.GetMock(Object.Global(), "AttributeDef",
            function(param){
                return param;
            }
        );

        [Fact]
        function PushesItemsToValuesArrayInOrder(){
            var config = [configItem("item1"), configItem("item2"), configItem("item3")];
            var actual;

            mockAttributeDef(function(){
                var defSet = new AttributeDefSet(config);
                actual = defSet.valuesOrder;
            });

            Assert.True(actual.length == 3, "Wrong length for values array");
            Assert.Equal(actual[0],"item1", "First item of config not found at first index of array");
            Assert.Equal(actual[1],"item2", "Second item of config not found at second index of array");
            Assert.Equal(actual[2],"item3", "Third item of config not found at third index of array");
        }
    }
}