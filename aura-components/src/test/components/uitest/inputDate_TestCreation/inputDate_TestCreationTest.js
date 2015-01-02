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
    testCreateComponent: {
        test : [function(component) {
            var a = component.get("c.addInputDate");
            $A.enqueueAction(a);
        }, function(component) {
            //
            // Must do this test in a wait, as the component is fetched
            // asynchronously. Note that if we forced a dependency, this could
            // revert to being direct. Not sure which is better.
            //
            $A.test.addWaitFor(1, function() { return component.get("v.count"); },
                function() {
                    var holder = component.find("additionalHolder");
                    var body = holder.get("v.body");
                    $A.test.assertEquals(1, body.length, "expected a single element in the body");
                    var elt = body[0];
                    $A.test.assertEquals("markup://ui:inputDate", elt.getDef().getDescriptor().getQualifiedName());
                })
        }]
    },
})
