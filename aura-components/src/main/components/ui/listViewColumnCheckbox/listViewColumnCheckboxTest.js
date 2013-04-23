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
    testControllerChangeHandler: {
        test: [
            function BubblingIsCanceled(component) {
                var domEvent = {
                        cancelBubble: function() {
                            actual = true;
                    },
                    target: { checked: null }
                };
                var actual = null;

                component.get("c.changeHandler").run(domEvent);

                aura.test.assertTrue(actual);
            },
            function CallsHelperFireEvent(component) {
                var domEvent = { target: { checked: null } };
                var mockWhile = this.getHelperMock(component, "fireEvent", function(){
                    actual = true;
                });
                var actual = false;

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

                aura.test.assertTrue(actual);
            },
            function ComponentPassedToFireEvent(component){
                var expected = component;
                var domEvent = { target: { checked: null } };
                var mockWhile = this.getHelperMock(component, "fireEvent", function(component){
                    actual = component;
                });
                var actual = false;

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

                aura.test.assertEquals(expected, actual);
            },
            function EventNamePassedToFireEvent(component){
                var expected = "onchange";
                var domEvent = { target: { checked: null } };
                var actual = null;
                var mockWhile = this.getHelperMock(component, "fireEvent", function(component, eventName){
                    actual = eventName;
                });

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

                aura.test.assertEquals(expected, actual);
            },
            function EventCategoryPassedToFireEvent(component){
                var expected = "checkbox";
                var domEvent = { target: { checked: null } };
                var mockWhile = this.getHelperMock(component, "fireEvent", function(component, eventName, category){
                    actual = category;
                });
                var actual = null;

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

                aura.test.assertEquals(expected, actual);
            },
            function RawDomEventPassedToFireEvent(component){
                var domEvent = { target: { checked: null } };
                var expected = domEvent;
                var mockWhile = this.getHelperMock(component, "fireEvent", function(component, eventName, category, rawDomEvent){
                    actual = rawDomEvent;
                });
                var actual = null;

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

                aura.test.assertEquals(expected, actual);
            },
            function CheckedInformationPassedToFireEvent(component){
                var expected = true;
                var domEvent = { target: { checked: expected } };
                var mockWhile = this.getHelperMock(component, "fireEvent", function(component, eventName, category, rawDomEvent, data){
                    actual = data.checked;
                });
                var actual = null;

                mockWhile(function(){
                    component.get("c.changeHandler").run(domEvent);
                });

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
    }
})
