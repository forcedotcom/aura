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
({
    clickAndCheck: function(cmp, target, language, expected) {
        var localId = [target, language].join(" ");
        var button = cmp.find(localId);
        $A.test.clickOrTouch(button.getElement());
        this.checkOutput(cmp, expected, "error after click " + localId);
    },

    checkOutput: function(cmp, expected, msg) {
        $A.test.setTestTimeout(2000);
        $A.test.addWaitForWithFailureMessage(
            expected,
            function(){
                var output = cmp.find('output');
                var el = output.getElement();
                var text = $A.test.getText(el);
                var actual = $A.util.trim(text);
                return actual;
            },
            msg,
            null
        );
    },

    // TODO: W-2406307: remaining Halo test failure
    _testSettingInnerThenOuter: {
        test: [ function(cmp) {
            this.checkOutput(cmp, 'Hello!', "Invalid initial value");
        }, function(cmp) {
            this.clickAndCheck(cmp, "inner", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "inner", "French", 'Bonjour!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "inner", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "inner", "French", 'Bonjour!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "French", 'Bonjour!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "French", 'Bonjour!');
        }]
    },

    testSettingOuterThenInner: {
        test: [ function(cmp) {
            this.checkOutput(cmp, 'Hello!', "Invalid initial value");
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "French", 'Bonjour!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "Spanish", '¡Hola!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "outer", "French", 'Bonjour!');
        }, function(cmp) {
            this.clickAndCheck(cmp, "inner", "Spanish", 'Bonjour!'); // No update (expected)
        }]
    }
})
