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
Function.RegisterNamespace("Test.Aura.Locker");

[Fixture]
Test.Aura.Locker.SecureElementTest = function() {

    Function.RegisterNamespace("Aura.Locker");
    [Import("aura-impl/src/main/resources/aura/locker/SecureElement.js")]
    // remove globals
    delete SecureElement;

    var mockAura = Mocks.GetMocks(Object.Global(), {
        $A: {
            util: {
                hyphensToCamelCase: function(str) {
                    return str.replace(this.CAMEL_CASE_TO_HYPHENS_REGEX, "-$1").toLowerCase();
                }
            }
        },
        SecureElement: Aura.Locker.SecureElement
    });

    [Fixture]
    function addElementSpecificProperties() {
        // reset when using in test case
        var addedProperties = [];

        var mockSecureObject = Mocks.GetMocks(Object.Global(), {
            SecureObject: {
                addPropertyIfSupported: function(st, raw, name, options) {
                    addedProperties.push(name);
                }
            }
        });

        [Fact]
        function DoesNotAddIfPropertyExists() {
            addedProperties = [];
            var se = {
                // href is <a>'s porperty in elementSpecificAttributeWhitelists
                "href": {}
            };
            var el = {
                tagName: "a"
            };

            mockAura(function(){
                mockSecureObject(function() {
                    Aura.Locker.SecureElement.addElementSpecificProperties(se, el);
                });
            });

            Assert.True(addedProperties.indexOf("href") < 0);
        }
    }
}
