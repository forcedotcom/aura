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
//TODO: IMPLEMENT TESTS
({

    testHelperFireEvent: {
        test: [
            function GettingEventFromComponent(component){
                var expected = "eventName";
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    actual = eventName;
                    return { setParams:function(){}, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, expected);
                });

                aura.test.assertEquals(expected, actual);
            },
            function TypeSetOnEventParams(component){
                var expected = "columnType";
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(params){ actual = params.type }, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName", expected);
                });

                aura.test.assertEquals(expected, actual);
            },

            function ContextSourceSetOnEventParams(component){
                var expected = component;
                var helper = this.getHelper(component);
                var data = {};
                var domEvent = {};
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(params){ actual = params.context.source}, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName", "type", domEvent, data);
                });

                aura.test.assertEquals(expected, actual);
            },

            function ContextEventSetOnEventParams(component){
                var expected = { domEvent: true };
                var helper = this.getHelper(component);
                var data = {};
                var domEvent = expected;
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(params){ actual = params.context.event }, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName", "type", domEvent, data);
                });

                aura.test.assertEquals(expected, actual);
            },

            function ContextHelperSetOnEventParams(component){
                var expected = this.getHelper(component);
                var helper = expected;
                var data = {};
                var domEvent = { domEvent: true };
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(params){ actual = params.context.helper }, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName", "type", domEvent, data);
                });

                aura.test.assertEquals(expected, actual);
            },
            function DataSetOnEventParams(component){
                var expected = {};
                var helper = this.getHelper(component);
                var data = expected;
                var domEvent = { domEvent: true };
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(params){ actual = params.data}, fire:function(){}};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName", "type", domEvent, data);
                });

                aura.test.assertEquals(expected, actual);
            },
            function EventIsFired(component){
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function(eventName){
                    return { setParams:function(){}, fire:function(){ actual = true; }};
                });
                var actual = null;

                mockWhile(function(){
                    helper.fireEvent(component, "eventName");
                });

                aura.test.assertTrue(actual);
            }
        ]
    },

    testProvider: {
        test: [
            function CreateCheckboxColumn(component){},
            function CreateNamespacedCheckboxColumn(component){},
            function CreateEmailColumn(component){},
            function CreateNamespacedEmailColumn(component){},
            function CreateHeaderColumn(component){},
            function CreateNamespacedHeaderColumn(component){},
            function CreateHtmlColumn(component){},
            function CreateNamespacedHtmlColumn(component){},
            function CreateIndexColumn(component){},
            function CreateNamespacedIndexColumn(component){},
            function CreateLinkColumn(component){},
            function CreateNamespacedLinkColumn(component){},
            function CreateTextColumn(component){},
            function CreateNamespacedTextColumn(component){},
            function DefaultColumnIsTextColumn(component){},
            function InvalidColumnTypeThrowsError(component){}

        ]
    },

    // INSTRUMENTATION
    getHelper:function (component) {
        return component.getDef().getHelperDef().getFunctions();
    },

    getHelperMock:function (component, name, mock) {
        return this.getMock(this.getHelper(component), name, mock);
    },

    getMock:function (target, name, mock) {
        return function (during) {
            var original = target[name];
            try {
                mock.mocked = original.bind(target);
                target[name] = mock;
                return during.apply(target, Array.prototype.slice.call(arguments, 1));
            } catch (e) {
                throw e;
            } finally {
                delete mock.mocked;
                target[name] = original;
            }
        }
    }
})
