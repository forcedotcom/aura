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
    [Import("aura-impl/src/main/resources/aura/library/LibraryIncludeRegistry.js")]
    delete LibraryIncludeRegistry;

    var mockFramework = Mocks.GetMocks(Object.Global(), {
        "$A": {
            "assert": function(condition, message){ if (!condition) { throw new message }},
            "util": {
                "isString": function(obj){ return typeof obj === 'string' },
                "isFunction": function(obj){ return typeof obj === 'function' },
                "isObject": function(obj){ return typeof obj === 'object' },
                "isEmpty": function(obj){ return Object.keys(obj).length === {} }
            },
        }
    });

    [Fixture]
    function GetLibraryInclude() {

        [Fact]
        function LibraryIncludeSimple() {
            // Arrange
            var expected = "cat";
            var actual;

            // Act
            mockFramework(function(){
                var target = new Aura.Library.LibraryIncludeRegistry();
                target.addLibraryInclude("test:name", [], function() { return {name: expected}; });
                var object = target.getLibraryInclude("test:name");
                actual = object.name;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LibraryIncludeTwoDependencies() {
            // Arrange
            var expected = "john doe";
            var actual;

            // Act
            mockFramework(function(){
                var target = new Aura.Library.LibraryIncludeRegistry();
                target.addLibraryInclude("test:name", ["test:first", "test:last"], function(first, last) {
                    return {name: first.name + " " + last.name};
                });
                target.addLibraryInclude("test:first", [], function() { return {name: "john"}; });
                target.addLibraryInclude("test:last", [], function() { return {name: "doe"}; });
                var object = target.getLibraryInclude("test:name");
                actual = object.name;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LibraryIncludeDefinedOnce() {
            // Arrange
            var expected = 1;
            var actual = 0;

            // Act
            mockFramework(function(){
                var target = new Aura.Library.LibraryIncludeRegistry();
                target.addLibraryInclude("test:basic", [], function() { actual++; return {}; });
                target.addLibraryInclude("test:one", ["test:basic"], function() { return {}; });
                target.addLibraryInclude("test:two", ["test:basic"], function() { return {}; });

                target.getLibraryInclude("test:one");
                target.getLibraryInclude("test:two");
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
