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
Test.Aura.Attribute.AttributeSetTest = function(){
    var Aura = {Attribute: {}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "$A": Aura,
        "AttributeSet": function(){}
    })(function () {
        [Import("aura-impl/src/main/resources/aura/attribute/AttributeSet.js")]
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
    function set(){
        var withMocks = Mocks.GetMocks(Object.Global(),{
            $A: {
                assert: function () {
                },
                clientService : {
                    allowAccess : function(){
                        return true;
                    }
                },
                util : {
                    isUndefinedOrNull : function (val) {
                        return val === undefined || val === null;
                    }
                }
            },
            PropertyReferenceValue : function() {},
            FunctionCallValue : function() {},
            AttributeSet : function() {}
        });

        var emptyAttributeDefSet = function() {
            return {
                getNames : function() {
                    return [];
                },
                getValues : function() {
                    return [];
                }
            };
        };
        
        [Fact]
        function HandlesUndefinedDef(){
            withMocks(function(){
                var component = {
                    getGlobalId : function(){}
                };
                AttributeSet = {
                    getDef : function() {
                        return [undefined, undefined];
                    }
                };
                
                var attributeSet = new Aura.Attribute.AttributeSet(null, new emptyAttributeDefSet());
                
                attributeSet.set("v.nonexistent", "arbitrary", component);
                
                Assert.True(true);
            });
        }
    }
}