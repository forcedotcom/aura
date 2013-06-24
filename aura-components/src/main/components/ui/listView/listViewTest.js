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
    testControllerClickHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.clickHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.clickHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "click";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.clickHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.clickHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerDblClickHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.dblclickHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.dblclickHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "dblclick";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.dblclickHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.dblclickHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerKeydownHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.keydownHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.keydownHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "keydown";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.keydownHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.keydownHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerKeyupHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.keyupHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.keyupHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "keyup";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.keyupHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.keyupHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerKeypressHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.keypressHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.keypressHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "keypress";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.keypressHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.keypressHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerMousedownHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.mousedownHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.mousedownHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "mousedown";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.mousedownHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.mousedownHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerMouseoverHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.mouseoverHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.mouseoverHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "mouseover";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.mouseoverHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.mouseoverHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerMouseoutHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.mouseoutHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.mouseoutHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "mouseout";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.mouseoutHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.mouseoutHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerMouseupHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.mouseupHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.mouseupHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "mouseup";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.mouseupHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.mouseupHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerTouchstartHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.touchstartHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.touchstartHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "touchstart";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.touchstartHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.touchstartHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerTouchmoveHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.touchmoveHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.touchmoveHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "touchmove";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.touchmoveHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.touchmoveHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testControllerTouchendHandler:{
        test:[
            function CallsFireEvents(component) {
                var actual = false;
                var mockWhile = this.getHelperMock(component, "fireEvents", function () {
                    actual = true;
                });

                mockWhile(function () {
                    component.get("c.touchendHandler").runDeprecated();
                })

                aura.test.assertTrue(actual);
            },

            function PassesComponentToFireEvents(component) {
                var expected = component;
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent) {
                    actual = targetComponent;
                });

                mockWhile(function () {
                    component.get("c.touchendHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEvents(component) {
                var expected = "touchend";
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName) {
                    actual = targetEventName;
                });

                mockWhile(function () {
                    component.get("c.touchendHandler").runDeprecated();
                })

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToFireEvents(component) {
                var expected = {rawEvent:true};
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvents", function (targetComponent, targetEventName, targetRawEvent) {
                    actual = targetRawEvent;
                });

                mockWhile(function () {
                    component.get("c.touchendHandler").runDeprecated(expected);
                })

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperAddEvents:{
        test:[
            function GuardsAgainstNullEventMap(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEventDispatcher", function () {
                    throw "testListViewHelperAddEvents.GuardsAgainstNullEvents: Attempted to process undefined event map.";
                });

                var actual = this.recordException(mockWhile.bind(this, function () {
                    helper.addEvents(component, null);
                }));

                aura.test.assertNull(actual);
            },

            function GetsEventDispatcher(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEventDispatcher", function () {
                    actual = true;
                    return {};
                });
                var actual = false;

                mockWhile(function () {
                    helper.addEvents(component, {});
                });

                aura.test.assertTrue(actual);
            },

            function SetsEventFromMapOnDispatcher(component) {
                var expected = "expected";
                var target = {};
                var targetEvents = {};
                targetEvents[expected] = expected;
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEventDispatcher", function () {
                    return target;
                });

                mockWhile(function () {
                    helper.addEvents(component, targetEvents);
                });
                var actual = target[expected];

                aura.test.assertEquals(actual, expected);
            }
        ]
    },

    testHelperBuildColumns:{
        test:[
            function CreatesColumnHeader(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader")actual = true;
                    return component;
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var actual = false;

                mockWhile(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });

                aura.test.assertTrue(actual);
            },

            function CreatesColumnHeaderRow(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewRow")actual = true;
                    return component;
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var actual = false;

                mockWhile(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });

                aura.test.assertTrue(actual);
            },

            function AddsColumnHeaderToRow(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewRow")actual = targetAttributes.body[0];
                    if (targetDescriptor == "ui:listViewColumnHeader")expected = component;
                    return component;
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = null;
                var actual = null;

                mockWhile(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });

                aura.test.assertNotNull(expected);
                aura.test.assertEquals(expected, actual);
            },

            function AddsColumnHeaderRowToTarget(component) {
                var helper = this.getHelper(component);
                var target = component.find("listView:header");
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewRow")expected = component;
                    return component;
                });
                var mockSetValue=this.getMock(target.getValue("v.body"),"setValue",function(targetBody){
                    actual=targetBody[0];
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = null;
                var actual = null;

                mockGenerateComponent(function(){
                    mockSetValue(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, target);
                    });
                });

                aura.test.assertNotNull(expected);
                aura.test.assertEquals(expected, actual);
            },

            function ColumnsStoresSingleColumnForOneLevel(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader")expected = component;
                    return component;
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = null;

                mockWhile(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });
                var actual=component.get("v.columns")[0];

                aura.test.assertNotNull(expected);
                aura.test.assertEquals(expected,actual);
            },

            function ColumnsStoresSingleDataColumnForOneLevel(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader")expected = component;
                    return component;
                });
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                templates[0].isDataColumn=true;
                var expected = null;

                mockWhile(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });
                var actual = component.get("v.dataColumns")[0];

                aura.test.assertNotNull(expected);
                aura.test.assertEquals(expected, actual);
            },

            function ColumnsStoresSingleDataTemplateForOneLevel(component) {
                var helper = this.getHelper(component);
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = templates[0];

                helper.buildColumns(component, {columnTemplates:[templates], dataTemplates:templates}, component.find("listView:header"));
                var actual = component.get("v.dataTemplates")[0];

                aura.test.assertEquals(expected, actual);
            },

            function FiresColumnsReadyEvent(component){
                var helper = this.getHelper(component);
                var expected="oncolumnsready";
                var mockWhile=this.getHelperMock(component,"fireEvent",function(targetComponent,targetSource,targetEventName){
                    actual=targetEventName;
                });
                var actual = null;

                mockWhile(function(){
                    helper.buildColumns(component, null, component.find("listView:header"));
                });

                aura.test.assertEquals(expected,actual);
            },

            function PassesComponentToColumnsReadyEvent(component) {
                var helper = this.getHelper(component);
                var expected = component;
                var mockWhile = this.getHelperMock(component, "fireEvent", function (targetComponent) {
                    actual = targetComponent;
                });
                var actual = null;

                mockWhile(function () {
                    helper.buildColumns(expected, null, component.find("listView:header"));
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesSourceToColumnsReadyEvent(component) {
                var helper = this.getHelper(component);
                var expected = component;
                var mockWhile = this.getHelperMock(component, "fireEvent", function (targetComponent, targetSource) {
                    actual = targetSource;
                });
                var actual = null;

                mockWhile(function () {
                    helper.buildColumns(expected, null, component.find("listView:header"));
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventTypeToColumnsReadyEvent(component) {
                var helper = this.getHelper(component);
                var expected = "ListHeader";
                var mockWhile = this.getHelperMock(component, "fireEvent", function (targetComponent, targetSource, targetEventName, targetEventType) {
                    actual = targetEventType;
                });
                var actual = null;

                mockWhile(function () {
                    helper.buildColumns(component, null, component.find("listView:header"));
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsRowClassOnHeaderRow(component){
                var helper = this.getHelper(component);
                var expected = "expected";
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewRow"){
                        actual = targetAttributes["class"];
                    }
                    return component;
                });
                var mockGetRowClass = this.getHelperMock(component, "getRowClass", function(){
                    return expected;
                });
                var actual=null;

                mockGenerateComponent(function(){
                    mockGetRowClass(function () {
                        helper.buildColumns(component, {columnTemplates:[templates], dataTemplates:templates}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);

            },

            function PassesConcreteComponentToGetAttributes(component){
                var helper = this.getHelper(component);
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = templates[0];
                var mockGetConcreteComponent=this.getMock(component,"getConcreteComponent",function(){
                    return expected;
                });
                var mockGetAttributes=this.getHelperMock(component,"getAttributes",function(targetTemplate){
                    actual=targetTemplate;
                    return arguments.callee.mocked(targetTemplate);
                });
                var actual = null;

                mockGetConcreteComponent(function(){
                    mockGetAttributes(function(){
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected,actual);
            },

            function PassesAttributesToGenerateComponent(component){
                var helper = this.getHelper(component);
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected={};
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return expected;
                });
                var actual = null;

                mockGenerateComponent(function(){
                    mockGetAttributes(function(){
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function DeletesHeadersAttribute(component){
                var helper = this.getHelper(component);
                var templates = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var expected = {headers:"UNEXPECTED"};
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                         actual = targetAttributes.hasOwnProperty("headers");
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return expected;
                });
                var actual=null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertFalse(actual);
            },

            function SetsColumnHeaderBodyToTemplateTitle(component){
                var helper = this.getHelper(component);
                var expected = "expected";
                var targetAttributes= {title:expected, fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.body;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected,actual);
            },

            function SetsUnspecifiedColumnHeaderTooltipToTemplateTitle(component) {
                var helper = this.getHelper(component);
                var expected = "expected";
                var targetAttributes = {title:expected, fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.tooltip;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsDelayedExpressionColumnHeaderTooltipToTemplateTitle(component) {
                var helper = this.getHelper(component);
                var expected = "{#v.expected}";
                var targetAttributes = {title:expected, fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.tooltip;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsColumnHeaderTooltipToTemplateTooltip(component) {
                var helper = this.getHelper(component);
                var expected = "expected";
                var targetAttributes = {title:"Title",tooltip:expected, fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.tooltip;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsTemplateReferenceOnColumnHeader(component) {
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var expected = templates[0];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.column.template;
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsDereferencedFormattersOnColumnHeader(component) {
                var expected=aura.test.assertEquals;
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName',formatters:"aura.test.assertEquals"};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.formatters[0];
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsDereferencedFormatterOnColumnHeader(component) {
                var expected = aura.test.assertEquals;
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName', formatters:"aura.test.assertEquals"};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.formatters[0];
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SetsDereferencedFormattersOnColumnHeader(component) {
                var expected = aura.test.assertEquals;
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName', formatters:"aura.test.assertTrue,aura.test.assertEquals"};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGenerateComponent = this.getHelperMock(component, "generateComponent", function (targetDescriptor, targetAttributes) {
                    var component = arguments.callee.mocked(targetDescriptor, targetAttributes);
                    if (targetDescriptor == "ui:listViewColumnHeader") {
                        actual = targetAttributes.formatters[1];
                    }
                    return component;
                });
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return targetAttributes;
                });
                var actual = null;

                mockGenerateComponent(function () {
                    mockGetAttributes(function () {
                        helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function SavesCopyOfUnwrappedAttributesOnColumnTemplate(component) {
                var helper = this.getHelper(component);
                var expected = {title:"Title", fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", expected)];
                var mockGetAttributes = this.getHelperMock(component, "getAttributes", function (targetTemplate) {
                    return expected;
                });
                var actual = null;

                mockGetAttributes(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    actual = templates[0].attributes;
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsGetEvents(component) {
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var mockGetEvents = this.getHelperMock(component, "getEvents", function () {
                    actual=true;
                });
                var actual=false;

                mockGetEvents(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });

                aura.test.assertTrue(actual);
            },

            function PassesColumnTemplateToGetEvents(component) {
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var expected = templates[0];
                var mockGetEvents = this.getHelperMock(component, "getEvents", function (targetTemplate) {
                    actual=targetTemplate;
                });
                var actual = null;

                mockGetEvents(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                });

                aura.test.assertEquals(expected, actual);
            },

            function SavesCopyOfEventsOnColumnTemplate(component) {
                var helper = this.getHelper(component);
                var targetAttributes = {title:"Title", fieldName:'FieldName'};
                var templates = [helper.generateComponent("ui:listViewColumn", targetAttributes)];
                var expected = "expected";
                var mockGetEvents = this.getHelperMock(component, "getEvents", function () {
                    return expected;
                });
                var actual = null;

                mockGetEvents(function () {
                    helper.buildColumns(component, {columnTemplates:[templates]}, component.find("listView:header"));
                    actual = templates[0].events;
                });

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperBuildList:{
        test:[
            function CallsGetColumnTemplates(component){
                var helper=this.getHelper(component);
                var mockWhile=this.getHelperMock(component,"getColumnTemplates",function(){
                    actual = true;
                })
                var actual=false;

                mockWhile(function(){
                    helper.buildList(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToGetColumnTemplates(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "getColumnTemplates", function (targetComponent) {
                    actual = targetComponent;
                })
                var expected=component;
                var actual = null;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected,actual);
            },

            function CallsGenerateColumns(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateColumns", function () {
                    actual = true;
                })
                var actual = false;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToGenerateTemplates(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "generateColumns", function (targetComponent) {
                    actual = targetComponent;
                })
                var expected = component;
                var actual = null;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsBuildColumns(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "buildColumns", function (targetComponent) {
                    actual = true;
                })
                var actual = false;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToBuildColumns(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "buildColumns", function (targetComponent) {
                    actual = targetComponent;
                })
                var expected = component;
                var actual = null;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesTemplatesToBuildColumns(component) {
                var helper = this.getHelper(component);
                var expected = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var mockGetColumns = this.getHelperMock(component, "getColumnTemplates", function () {
                    return expected;
                });
                var mockBuildColumns = this.getHelperMock(component, "buildColumns", function (targetComponent, targetTemplates) {
                    actual = targetTemplates;
                })
                var actual = null;

                mockGetColumns(function () {
                    mockBuildColumns(function () {
                        helper.buildList(component);
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesListHeaderToBuildColumns(component) {
                var helper = this.getHelper(component);
                var expected = component.find("listView:header");
                var mockBuildColumns = this.getHelperMock(component, "buildColumns", function (targetComponent, targetTemplates, targetListHeader) {
                    actual = targetListHeader;
                })
                var actual = null;

                mockBuildColumns(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsBuildRows(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "buildRows", function (targetComponent) {
                    actual = true;
                })
                var actual = false;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToBuildRows(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getHelperMock(component, "buildRows", function (targetComponent) {
                    actual = targetComponent;
                })
                var expected = component;
                var actual = null;

                mockWhile(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesTemplatesToBuildRows(component) {
                var helper = this.getHelper(component);
                var expected = [helper.generateComponent("ui:listViewColumn", {title:'Title', fieldName:'FieldName'})];
                var mockGetColumns = this.getHelperMock(component, "getColumnTemplates", function () {
                    return expected;
                });
                var mockBuildColumns = this.getHelperMock(component, "buildRows", function (targetComponent, targetTemplates) {
                    actual = targetTemplates;
                })
                var actual = null;

                mockGetColumns(function () {
                    mockBuildColumns(function () {
                        helper.buildList(component);
                    });
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesListHeaderToBuildRows(component) {
                var helper = this.getHelper(component);
                var expected = component.find("listView:body");
                var mockBuildColumns = this.getHelperMock(component, "buildRows", function (targetComponent, targetTemplates, targetListHeader) {
                    actual = targetListHeader;
                })
                var actual = null;

                mockBuildColumns(function () {
                    helper.buildList(component);
                });

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperBuildRows:{
        test:[
            function BuildsEmptyMessge(component){
                var helper=this.getHelper(component);
                var mockGenerateComponent=this.getHelperMock(component,"generateComponent",function(targetDescriptor,targetAttributes){
                    if(targetDescriptor=="aura:unescapedHtml"){
                        actual=targetAttributes.value;
                    }
                });
                var mockGetValue=this.getMock(component,"get",function(expression){
                    if(expression=="v.emptyMessage")return expected;
                    return arguments.callee.mock(expression);
                });
                var expected="expected";
                mockGenerateComponent(function(){
                    mockGetValue(function(){
                        component.getValue();
                    });
                });

                helper.buildRows(component,{},component.find("listView:body"));

                aura.test.assertEquals();
            }

            // TODO: LOADS MORE BUILD ROW TESTS

        ]
    },

    testHelperDecodeHtml:{
        test:[
            function DecodesAmpersand(component){
                var helper = this.getHelper(component);
                var target="&amp;";
                var expected="&";

                var actual=helper.decodeHtml(target);

                aura.test.assertEquals(expected,actual);
            },

            function DecodesLessThanSign(component) {
                var helper = this.getHelper(component);
                var target = "&lt;";
                var expected = "<";

                var actual = helper.decodeHtml(target);

                aura.test.assertEquals(expected, actual);
            },

            function DecodesGreaterThanSign(component) {
                var helper = this.getHelper(component);
                var target = "&gt;";
                var expected = ">";

                var actual = helper.decodeHtml(target);

                aura.test.assertEquals(expected, actual);
            },

            function DecodesQuoteSign(component) {
                var helper = this.getHelper(component);
                var target = "&quot;";
                var expected = "\"";

                var actual = helper.decodeHtml(target);

                aura.test.assertEquals(expected, actual);
            },

            function StripsTags(component) {
                var helper = this.getHelper(component);
                var target = "<a>ex<b>pec</b>ted</a>";
                var expected = "expected";

                var actual = helper.decodeHtml(target);

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperFireEvent:{
        test:[
            function CallsGetEvent(component){
                var helper=this.getHelper(component);
                var mockWhile=this.getMock(component,"getEvent",function(){
                    actual=true;
                    return {
                        setParams:function(){},
                        fire:function(){}
                    };
                });
                var actual=false;

                mockWhile(function(){
                    helper.fireEvent(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesEventTypeToGetEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function (targetEventType) {
                    actual = targetEventType;
                    return {
                        setParams:function(){},
                        fire:function(){}
                    };
                });
                var expected="expected";
                var actual=null;

                mockWhile(function(){
                    helper.fireEvent(component, null, expected);
                });

                aura.test.assertEquals(expected,actual);
            },

            function CallsSetParamsOnEvent(component){
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function () {
                            actual=true;
                        },
                        fire:function () {}
                    };
                });
                var actual=false;

                mockWhile(function () {
                    helper.fireEvent(component);
                });

                aura.test.assertTrue(actual);
            },

            function PassesListViewEventTypeToSetParamsOnEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function (targetParams) {
                            actual = targetParams.type;
                        },
                        fire:function () {}
                    };
                });
                var expected="expected";
                var actual = null;

                mockWhile(function () {
                    helper.fireEvent(component,null,null,expected);
                });

                aura.test.assertEquals(expected,actual);
            },

            function PassesTargetToSetParamsOnEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function (targetParams) {
                            actual = targetParams.context.source;
                        },
                        fire:function () {}
                    };
                });
                var expected = "expected";
                var actual = null;

                mockWhile(function () {
                    helper.fireEvent(component, expected);
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesRawEventToSetParamsOnEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function (targetParams) {
                            actual = targetParams.context.event;
                        },
                        fire:function () {
                        }
                    };
                });
                var expected = "expected";
                var actual = null;

                mockWhile(function () {
                    helper.fireEvent(component, null, null, null, expected);
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesHelperToSetParamsOnEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function (targetParams) {
                            actual = targetParams.context.helper;
                        },
                        fire:function () {
                        }
                    };
                });
                var expected = helper;
                var actual = null;

                mockWhile(function () {
                    helper.fireEvent(component);
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesDataToSetParamsOnEvent(component) {
                var helper = this.getHelper(component);
                var mockWhile = this.getMock(component, "getEvent", function () {
                    return {
                        setParams:function (targetParams) {
                            actual = targetParams.data;
                        },
                        fire:function () {
                        }
                    };
                });
                var expected = "expected";
                var actual = null;

                mockWhile(function () {
                    helper.fireEvent(component,null,null,null,null,expected);
                });

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperFireEvents:{
        test:[
            function CallsGetEventTargets(component){
                var helper=this.getHelper(component);
                var mockGetEventTargets=this.getHelperMock(component,"getEventTargets",function(){
                    actual=true;
                    return {};
                });
                var mockFireEvent=this.getHelperMock(component,"fireEvent",function(){});
                var actual=false;

                mockGetEventTargets(function(){
                    mockFireEvent(function(){
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToGetEventTargets(component) {
                var helper = this.getHelper(component);
                var mockGetEventTargets = this.getHelperMock(component, "getEventTargets", function (targetComponent) {
                    actual = targetComponent;
                    return {};
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function () {
                });
                var expected=component;
                var actual = null;

                mockGetEventTargets(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesDomEventTargetToGetEventTargets(component) {
                var helper = this.getHelper(component);
                var mockGetEventTargets = this.getHelperMock(component, "getEventTargets", function (targetComponent,targetEventTarget) {
                    actual = targetEventTarget;
                    return {};
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function () {
                });
                var expected = {};
                var actual = null;

                mockGetEventTargets(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component,"",{target:expected});
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsGetEventType(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    actual = true;
                    return {};
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function () {});
                var actual = false;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertTrue(actual);
            },

            function PassesComponentToGetEventType(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function (targetComponent) {
                    actual = targetComponent;
                    return {};
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function () {});
                var expected = component;
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesTargetColumnToGetEventType(component) {
                var helper = this.getHelper(component);
                var mockGetEventTargets = this.getHelperMock(component, "getEventTargets", function (targetComponent) {
                    return {column:expected};
                });
                var mockGetEventType = this.getHelperMock(component, "getEventType", function (targetComponent,targetColumn) {
                    actual = targetColumn;
                    return {};
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function () {});
                var expected = "expected";
                var actual = null;

                mockGetEventTargets(function(){
                    mockGetEventType(function () {
                        mockFireEvent(function () {
                            helper.fireEvents(component);
                        })
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsFireEventForCell(component){
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return expected;
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent,targetElement,targetEventName, targetType) {
                    actual=targetType;
                });
                var expected = "Cell";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesComponentToFireEventForCell(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    actual = targetComponent;
                });
                var expected = component;
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesTargetColumnToFireEventForCell(component) {
                var helper = this.getHelper(component);
                var mockGetEventTargets = this.getHelperMock(component, "getEventTargets", function (targetComponent) {
                    return {column:expected};
                });
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    if(!actual)actual=targetElement;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventTargets(function () {
                    mockGetEventType(function () {
                        mockFireEvent(function () {
                            helper.fireEvents(component);
                        })
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEventForCell(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    if (!actual)actual = targetEventName;
                });
                var expected = "oncellEventType";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component,"EventType");
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesDomEventToFireEventForCell(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType,targetDomEvent) {
                    if (!actual)actual = targetDomEvent;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component, "", expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventParamsToFireEventForCell(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType, targetDomEvent, targetEventParams) {
                    if (!actual)actual = targetEventParams;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component, "", null, expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function FiresRowEventForCell(component){
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType, targetDomEvent, targetEventParams) {
                    if(targetEventName.indexOf("onrow")==0)actual = true;
                });
                var actual = false;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertTrue(actual);
            },

            function FiresTableEventForCell(component){
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Cell";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType, targetDomEvent, targetEventParams) {
                    if (targetEventName.indexOf("oncell") == -1 && targetEventName.indexOf("onrow") == -1 && targetEventName.indexOf("on")==0)actual = true;
                });
                var actual = false;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertTrue(actual);
           },

            function CallsFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return expected;
                })
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    actual=targetType;
                });
                var expected = "Header";
                var actual=null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesComponentToFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Header";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    actual = targetComponent;
                });
                var expected = component;
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesTargetColumnToFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventTargets = this.getHelperMock(component, "getEventTargets", function (targetComponent) {
                    return {column:expected};
                });
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Header";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    if (!actual)actual = targetElement;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventTargets(function () {
                    mockGetEventType(function () {
                        mockFireEvent(function () {
                            helper.fireEvents(component);
                        })
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventNameToFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Header";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    if (!actual)actual = targetEventName;
                });
                var expected = "onheaderEventType";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component, "EventType");
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesDomEventToFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Header";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType, targetDomEvent) {
                    if (!actual)actual = targetDomEvent;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component, "", expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function PassesEventParamsToFireEventForHeader(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return "Header";
                });
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType, targetDomEvent, targetEventParams) {
                    if (!actual)actual = targetEventParams;
                });
                var expected = "expected";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component, "", null, expected);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

            function CallsFireEventForRow(component) {
                var helper = this.getHelper(component);
                var mockGetEventType = this.getHelperMock(component, "getEventType", function () {
                    return expected;
                })
                var mockFireEvent = this.getHelperMock(component, "fireEvent", function (targetComponent, targetElement, targetEventName, targetType) {
                    actual = targetType;
                });
                var expected = "Row";
                var actual = null;

                mockGetEventType(function () {
                    mockFireEvent(function () {
                        helper.fireEvents(component);
                    })
                });

                aura.test.assertEquals(expected, actual);
            },

        ]
    },

    testHelperFormatColumnName:{
        test:[
            function ReturnsEmptyStringIfColumnNameIsNull(component){
                var helper=this.getHelper(component);
                var expected='';

                var actual=helper.formatColumnName(null);

                aura.test.assertEquals(expected,actual);
            },

            function ReturnsEmptyStringIfColumnNameIsUndefined(component) {
                var helper = this.getHelper(component);
                var expected = '';

                var actual = helper.formatColumnName();

                aura.test.assertEquals(expected, actual);
            },

            function SplitsWordsOnCapitalization(component){
                var helper = this.getHelper(component);
                var expected="Expected Name";

                var actual = helper.formatColumnName("ExpectedName");

                aura.test.assertEquals(expected, actual);
            },

            function CapitalizesFirstWord(component) {
                var helper = this.getHelper(component);
                var expected = "Expected Name";

                var actual = helper.formatColumnName("expectedName");

                aura.test.assertEquals(expected, actual);
            }
        ]
    },

    testHelperFormatContent:{
        test:[
            function UnwrapsDataItemIfPossible(component){
                var helper=this.getHelper(component);
                var targetItem={
                    unwrap:function(){
                        actual=true;
                        return {};
                    }
                };
                var actual=false;

                helper.formatContent(null,targetItem);

                aura.test.assertTrue(actual);
            },

            function ReturnsSimpleField(component) {
                var helper = this.getHelper(component);
                var expected="expected";
                var targetItem = {};
                targetItem[expected]=expected;

                var actual = helper.formatContent(null, targetItem, expected);

                aura.test.assertEquals(expected,actual);
            },

            function ReturnsComplexField(component) {
                var helper = this.getHelper(component);
                var expected = "expected";
                var targetItem = {};
                targetItem[expected] = {};
                targetItem[expected][expected] = expected;

                var actual = helper.formatContent(null, targetItem, expected+'.'+expected);

                aura.test.assertEquals(expected, actual);
            },

            function ReturnsObjectAsJson(component) {
                var helper = this.getHelper(component);
                var expected = "{\"expected\":\"expected\"}";
                var targetItem = {};
                targetItem["expected"] = {};
                targetItem["expected"]["expected"] = "expected";

                var actual = helper.formatContent(null, targetItem, "expected");

                aura.test.assertEquals(expected, actual);
            }
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
    },

    recordException:function (delegate) {
        try {
            delegate();
        } catch (e) {
            return e;
        }
        return null;
    }

})
