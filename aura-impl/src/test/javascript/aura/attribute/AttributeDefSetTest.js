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
    var Aura = {Attribute: {}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AttributeDefSet": function(){}
    })(function () {
        [Import("aura-impl/src/main/resources/aura/attribute/AttributeDefSet.js")]
    });

    var configItem = function(param) {
        return {
            getDescriptor: function(){
                return {
                    getName: function(){
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
            var expected = ["item1", "item2", "item3"];
            var actual;

            mockAttributeDef(function(){
                var defSet = new Aura.Attribute.AttributeDefSet(config);
                actual = defSet.valuesOrder;
            });

            Assert.Equal(expected, actual);
        }
    }
}