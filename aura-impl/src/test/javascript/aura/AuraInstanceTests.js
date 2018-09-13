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
Test.Aura.AuraInstanceTests = function() {
    var _AuraError;
    var _StackFrame;
    var _ErrorStackParser;
    var _murmurHash3;
    var _generateErrorId;
    var _generateErrorIdHashGen;
    var _Util;
    var _AuraInstance;
    var PerfShim;

    Mocks.GetMocks(Object.Global(), {
        "Aura": {
            "Errors": {},
            "Utils": {
                "SecureFilters": {}
            }
        },
        "navigator": {
            "userAgent": ""
        },
        "window": {},
        "PerfShim": {}
    })(function() {
        // Aura Error portion
        Import("aura-impl/src/main/resources/aura/polyfill/stackframe.js");
        Import("aura-impl/src/main/resources/aura/polyfill/error-stack-parser.js");
        Import("aura-impl/src/main/resources/aura/error/AuraError.js");
        Import("aura-impl/src/main/resources/aura/util/Util.js");
        _StackFrame = StackFrame;
        _ErrorStackParser = ErrorStackParser;
        _AuraError = AuraError;
        _murmurHash3 = Aura.Errors.MurmurHash3;
        _generateErrorId = Aura.Errors.GenerateErrorId;
        _generateErrorIdHashGen = Aura.Errors.GenerateErrorIdHashGen;
        _Util = Aura.Utils.Util;
        delete StackFrame;
        delete ErrorStackParser;
        delete AuraError;

        // Aura instance portion
        Import("aura-impl/src/main/resources/aura/AuraInstance.js");
        _AuraInstance = AuraInstance;
        delete AuraInstance;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            "Aura": {
                Errors: {
                    AuraError: _AuraError,
                    StackFrame: _StackFrame,
                    StackParser: _ErrorStackParser,
                    MurmurHash3: _murmurHash3,
                    GenerateErrorId: _generateErrorId,
                    GenerateErrorIdHashGen: _generateErrorIdHashGen,
                }
            },
            "$A": {
                // To create util object, it needs to import couple more files,
                // so only injects needed function here.
                util: {
                    hyphensToCamelCase: _Util.prototype.hyphensToCamelCase
                },
                "auraError": _AuraError,
                "isCustomerError": _AuraInstance.prototype.isCustomerError
            }

        })(during);
    }
    
    [Fixture]
    function isCustomerErrorTests(){
        [Fact]
        function CustomerErrorsFilteredBySourceOfError(){
            var innerError = new Error();
            innerError.stack = "eval()@https://customer.instance.force.com/components/c/my_component.js:3546:66";

            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                auraError.setComponent("selfService:profileMenu");

                $A.isCustomerComponent = function() { return false; };
                $A.isCustomerComponentStack = function() { return false; };

                actual = $A.isCustomerError(auraError);
            });

            Assert.True(actual);
        }
        
        [Fact]
        function SystemErrorsNotFilteredBySourceOfError(){
            var innerError = new Error();
            innerError.stack = "eval()@https://support.customer.com/libraries/force:relatedListsDataManagerLibrary.js:11:129\n\
Object.eval()@https://support.customer.com/components/force/relatedListContainerDataProvider.js:3:163";

            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                auraError.setComponent("system:component");

                $A.isCustomerComponent = function() { return false; };
                $A.isCustomerComponentStack = function() { return false; };

                actual = $A.isCustomerError(auraError);
            });

            Assert.False(actual);
        }
    
    }


};
