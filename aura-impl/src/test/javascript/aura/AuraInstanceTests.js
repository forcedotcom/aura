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

[Fixture, Skip]
Test.Aura.AuraInstanceTests = function() {

    // mockNamespace(function() {
    //     Import("aura-impl/src/main/resources/aura/Logger.js");
    //     Import("aura-impl/src/main/resources/aura/polyfill/Json.js");
    //     Import("aura-impl/src/main/resources/aura/util/Mutex.js");
    //     Import("aura-impl/src/main/resources/aura/util/SecureFilters.js");
    //     Import("aura-impl/src/main/resources/aura/util/SizeEstimator.js");
    //     Import("aura-impl/src/main/resources/aura/util/Style.js");
    //     Import("aura-impl/src/main/resources/aura/util/Util.js");
    //     Import("aura-impl/src/main/resources/aura/util/PerfShim.js");
    //
    //     System.Environment.Write("\n\n\nLOGGER: " + Aura.Utils.Logger + "\n\n\n");
    //
    //     Import("aura-impl/src/main/resources/aura/Aura.js");
    //
    //     System.Environment.Write("\n\n\nLOGGER2: " + Aura.Utils.Logger + "\n\n\n");
    // });

    // [Fixture]
    // function deprecated(){
    //     [Fact]
    //     function ThrowsIfNoSinceDateOrDueDateSpecified(){
    //         var expected="DEPRECATED - blah blah blah";
    //
    //         var actual=Record.Exception(function(){
    //             $A.$deprecated$();
    //         });
    //
    //         Assert.Equal(expected,actual);
    //     }
    // }
    //
    // [Fixture, AuraUtil]
    // function util(){
    //     [Fact]
    //     function exists(){
    //         var expected="foo bar";
    //         var target=expected.split(' ');
    //
    //         var actual=$A.util.format("{0} {1}",target[0], target[1]);
    //
    //         Assert.Equal(expected,actual);
    //     }
    // }
    //
    // [Fixture, MockDom]
    // function muckWithWindow(){
    //     [Fact]
    //     function exists(){
    //         var expected="bar";
    //
    //         subjectUnderTest(expected);
    //         var actual=window.foo;
    //
    //
    //         Assert.Equal(expected,actual);
    //     }
    //
    //     function subjectUnderTest(value){
    //         window.foo=value;
    //     }
    //
    // }


};
