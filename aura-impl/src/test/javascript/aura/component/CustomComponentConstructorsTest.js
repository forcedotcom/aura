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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.CustomComcponentConstructorsTest = function () {

    Function.RegisterNamespace("Aura.Component");
    [Import("aura-impl/src/main/resources/aura/component/Component.js"),
     Import("aura-impl/src/main/resources/aura/component/BaseComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/ExpressionComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/HtmlComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/IfComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/IterationComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/TextComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/ComponentClassRegistry.js")]
    delete ComponentClassRegistry;
    delete Component;
    delete BaseComponent;
    delete HtmlComponent;
    delete ExpressionComponent;
    delete IfComponent;
    delete IterationComponent;
    delete TextComponent;

    var mockFramework = Mocks.GetMocks(Object.Global(), {
        "Component": function() {},
        "BaseComponent": Aura.Component.BaseComponent,
        "ExpressionComponent": Aura.Component.ExpressionComponent,
        "HtmlComponent": Aura.Component.HtmlComponent,
        "IfComponent": Aura.Component.IfComponent,
        "IterationComponent": Aura.Component.IterationComponent,
        "TextComponent": Aura.Component.TextComponent,
        "$A": {
            "assert": function(condition, message){ if (!condition) { throw new message }},
            "util": {
                "isString": function(obj){ return typeof obj === 'string' },
                "isFunction": function(obj){ return typeof obj === 'function' },
                "globalEval": function(src){ 
                    var returnableEx = /^(\s*)([{(["']|function\s*\()/;
                    var match = src.match(returnableEx);
                    if (match) src = src.replace(match[1], 'return ');
                    eval ("function x() {" + src + "}");
                    return x();
                }
            },
            "componentService": {
                "getLibrary": function(descriptor) { return descriptor }
            },
            clientService: {
                getSourceMapsUrl: function () {return;}
            }
        }
    });

    [Fact]
    function AuraComponentUsesBaseComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$component");

            Assert.Equal(BaseComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }

    [Fact]
    function AuraExpressionUsesExpressionComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$expression");

            Assert.Equal(ExpressionComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }

    [Fact]
    function AuraHtmlUsesHtmlComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$html");

            Assert.Equal(HtmlComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }

    [Fact]
    function AuraIfUsesIfComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$if");

            Assert.Equal(IfComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }

    [Fact]
    function AuraIterationUsesIterationComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$iteration");

            Assert.Equal(IterationComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }

    [Fact]
    function AuraTextUsesTextComponent() {
        var registry = new Aura.Component.ComponentClassRegistry();
        var actual;

        mockFramework(function() {
            actual = registry.buildConstructor({}, "aura$text");

            Assert.Equal(TextComponent.prototype, Object.getPrototypeOf(actual.prototype));
        });
    }
    
}
