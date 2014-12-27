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
    testEventProperties: {
        test: [function(cmp) {
            var inner = cmp.find("innerComp");
            $A.test.clickOrTouch(inner.getElement());
        },
        function(cmp) {
            var globalId = cmp.find("innerComp").getGlobalId();
            var expected = "Event Properties.Source:markup://test:test_Events_ComponentForEvent {" + globalId + "} {innerComp}.Action Invoked at:OuterComponent.Client Action:changeLabel";
            var actual = $A.test.getText(cmp.find("innerComp").getElement());
            $A.test.assertEquals(expected, actual);
        }]
    }
})