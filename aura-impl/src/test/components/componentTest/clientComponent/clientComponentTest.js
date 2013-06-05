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
    testAddOutputNumber: {
        test: [
            function(cmp){

                var a = cmp.get("c.showOutputCmp");
                $A.run(function() {
                    a.run();
                });

                $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete,
                    function(){
                        $A.test.assertEquals(6, cmp.get("v.outputValue.value"), "Failed: Wrong value from outputNumber");
                    }
                );

            }
        ]
    },

    testAddOutputCurrency: {
        test: [
            function (cmp) {
                var a = cmp.get("c.addOutputCurrency");
                $A.run(function() {
                    a.run();
                });

                $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete,
                    function(){
                        var body = cmp.get("v.body");
                        if(body && body.length > 0) {
                            var newCmp = body[0];
                            if ($A.util.isComponent(newCmp)) {
                                $A.test.assertEquals(
                                    "markup://ui:outputCurrency",
                                    newCmp.getDef().getDescriptor().getQualifiedName(),
                                    "Failed: new component should be ui:outputLabel"
                                )
                            } else {
                                $A.test.fail("Failed: body element should be a component");
                            }
                        } else {
                            $A.test.fail("Failed: new ui:outputCurrency component not in body");
                        }
                    }
                );
            }
        ]
    }

});