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
	
	[Fixture]
    function executeHandlerIterator() {
		var auraContext = {
				stack : [],

				"getStackLength": function() {
					return this.stack.length;
				},
				"resetStack": function() {
					this.stack = [];
				}
		};
		var mockFramework = Mocks.GetMocks(Object.Global(), {
			"$A": {
	            "getContext": function() {
	            	return auraContext;
	            },
				"clientService":{
					"setCurrentAccess": function(cmp) {
						auraContext.stack.push(cmp)
					},
					"releaseCurrentAccess": function() {
						auraContext.stack.pop();
					},
				},
				"lockerService": {
	            	"trust": function(a, b) {}
	            }
	        }
		}
		);
		[Fact]
		function releaseContextNoMatterWhat() {
			// Arrange
			var eventCmp = {};
			var eventDefDescriptor = {
					"getQualifiedName": function() { return "markup://aura:methodCall" }, //for getEventExecutionType(), also isComponentEventType will be false
					"toString": function() { return "markup://aura:methodCall" }
			};
			var eventDef = {
					"getDescriptor": function() { return eventDefDescriptor; }
			};
			var eventDispatcher = {};
			var eventName = "testEvent";
			var mockEventConfig = {
			        "name" : eventName,
			        "eventDef" : eventDef,
			        "component" : eventCmp,
			        "eventDispatcher" : eventDispatcher
		    };
			var mockHandler = {
				"value": {
					"handler": function(thisEvent) { thisEvent.paused = true; throw Error("from testing event"); },
					"phase": "mockPhase"
				}	
			};
			var mockHandlerIterator = {
					"next": function() {
						return mockHandler;
					}
			};
			
			// Act
			auraContext.resetStack();
            mockFramework(function(){
                var target = new Aura.Event.Event(mockEventConfig);
                try { 
                	target.executeHandlerIterator(mockHandlerIterator);
                } catch(err) {
                	//expected, we did throw error "from testing event"
                }
            });

            // Assert
            Assert.True(auraContext.getStackLength() == 0);
		}
	}
	

};	