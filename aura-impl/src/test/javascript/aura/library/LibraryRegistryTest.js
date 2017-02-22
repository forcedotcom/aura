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
Function.RegisterNamespace("Test.Aura.Library");

[Fixture]
Test.Aura.Library.LibraryRegistryTest = function () {

    Function.RegisterNamespace("Aura.Library");
    [Import("aura-impl/src/main/resources/aura/library/LibraryRegistry.js")]
    delete LibraryRegistry;

    var mockFramework = Mocks.GetMocks(Object.Global(), {
        "$A": {
            "assert": function(condition, message){ if (!condition) { throw new message }},
            "util": {
                "isString": function(obj){ return typeof obj === 'string' },
                "isFunction": function(obj){ return typeof obj === 'function' },
                "isArray": function(obj){ return obj instanceof Array },
                "isObject": function(obj){ return typeof obj === 'object' },
                "isEmpty": function(obj){ return Object.keys(obj).length === {} }
            },
            "componentService": {
                "getLibraryInclude": function(descriptor) { return descriptor },
                "addModule": function () {}
            }
        }
    });

    [Fixture]
    function GetLibrary() {

        [Fact]
        function LibrarySimpleDependecyTest() {
            // Arrange
            var expected = "simpleInclude";
            var includes = {"simpleExport": expected};

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Library.LibraryRegistry();
                target.addLibrary("simpleLib", includes);
                var lib = target.getLibrary("simpleLib");
                actual = lib.simpleExport;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LibraryTwoDependenciesTest() {
            // Arrange
            var expected = "includeOne";
            var includes = {"exportOne": expected, "exportTwo": "includeTwo"};

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Library.LibraryRegistry();
                target.addLibrary("doubleLib", includes);
                var lib = target.getLibrary("doubleLib");
                actual = lib.exportOne;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LibrarySinbgletonTest() {
            // Arrange
            var expected = "includeTest";
            var includes = {"simpleExport": "sinpleInclude"};

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Library.LibraryRegistry();
                target.addLibrary("simpleLib", includes);
                var lib1 = target.getLibrary("simpleLib");
                var lib2 = target.getLibrary("simpleLib");
                lib1.simpleLib = expected;
                actual = lib2.simpleLib;
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
