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
        test : function(cmp) {
            cmp.addInputDate();

            $A.test.addWaitFor(1, 
                    function() {
                        return cmp.get("v.count");
                    },
                    function() {
                        var holder = cmp.find("additionalHolder");
                        var body = holder.get("v.body");
                        $A.test.assertEquals(1, body.length, "expected a single element in the body");
                        var elt = body[0];
                        var expectedMarkupName = this.isDesktop() 
                                                 ? "markup://ui:inputDate" 
                                                 : "markup://ui:inputDateHtml";
                        $A.test.assertEquals(expectedMarkupName, elt.getDef().getDescriptor().getQualifiedName());
                    }
            );
        }
    },

    isDesktop : function() {
        return ($A.get('$Browser.formFactor').toLowerCase() === "desktop");
    }
})
