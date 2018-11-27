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
Function.RegisterNamespace("Test.Aura.Polyfill");

[Fixture]
Test.Aura.Polyfill.CssVariables = function () {

    var auraMock = function(delegate) {
        Mocks.GetMocks(Object.Global(), {
            Aura: {}
        })(function(){
            [Import("aura-impl/src/main/resources/aura/polyfill/css-variables.js")]
            delegate();
        });
    };

    var targetUtil;
    auraMock(function(){
        targetUtil = Aura;
    });

    [Fact]
    function varToStaticValue() {
        var output = targetUtil.polyfillCssVars(".test { color: var(--lwc-color,red)}");
        Assert.Equal(".test { color: red}", output);
    }

    [Fact]
    function varToStaticCalcValue() {
        var output = targetUtil.polyfillCssVars(".test { height: var(--lwc-color,calc(1px + 95%))}");
        Assert.Equal(".test { height: calc(1px + 95%)}", output);
    }

    [Fact]
    function varToStaticNestedCalcValue() {
        var output = targetUtil.polyfillCssVars(".test { height: var(--lwc-color,calc(1px + calc(-1 * 300)))}");
        Assert.Equal(".test { height: calc(1px + calc(-1 * 300))}", output);
    }

    [Fact]
    function varToStaticMultipleNestedCalcValue() {
        var output = targetUtil.polyfillCssVars(".test { color: var(--lwc-color,rgb(calc(200 + 5), 100, calc(10 + 25))); height: 200;}");
        Assert.Equal(".test { color: rgb(calc(200 + 5), 100, calc(10 + 25)); height: 200;}", output);
    }

    [Fact]
    function varToStaicValueFromLookup() {
        var output = targetUtil.polyfillCssVars(".test { color: var(--lwc-color,red)}", {"lwc-color": "blue"});
        Assert.Equal(".test { color: blue}", output);
    }

    [Fact]
    function skipsVarTranslationWithNoFallback() {
        var output = targetUtil.polyfillCssVars(".test { color: var(--lwc-color)}");
        Assert.Equal(".test { color: var(--lwc-color)}", output);
    }

    [Fact]
    function noopWhenNoVarsPresent() {
        var input = ".test { color: red}";
        var output = targetUtil.polyfillCssVars(input);
        Assert.Equal(input, output);
    }

    [Fact]
    function ignoresNonLWCVarSyntax() {
        var input = ".test { color: var(--custom-prop, red)}";
        var output = targetUtil.polyfillCssVars(input);
        Assert.Equal(input, output);
    }
};

