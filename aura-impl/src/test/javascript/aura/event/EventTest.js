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
/*jshint asi:true,expr:true,strict:false*/
/*global Test,Aura*/
Function.RegisterNamespace("Test.Aura.Event");

// KGRAY: TODO: We need to get namespace delcaration done in the files themselves so we don't need to do this in the test.
Function.RegisterNamespace("Aura.Event");

[Import("aura-impl/src/main/resources/aura/event/Event.js")]
[Fixture]
Test.Aura.Event.Event=function(){

	[Fact]
    function DoesNotOverrideEventGlobal() {
        Assert.NotEqual(Object.Global().Event, Aura.Event.Event);
    }

};	