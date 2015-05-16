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
    addError: function(cmp) {
        var action = cmp.get("c.addError");
        $A.enqueueAction(action);

        $A.test.addWaitFor(true,
            function() {
                var text = cmp.find("inputBlock1").getElement().innerHTML;
                return text.indexOf("m an error") > -1;
            }
        );
    },

    testAddErrors: {
        test: function(cmp) {
            this.addError(cmp);
        }
    },

    testClearErrors: {
        test: [
            function(cmp) {
                this.addError(cmp);
            },
            function(cmp) {

                var action = cmp.get("c.clearErrors");
                $A.enqueueAction(action);

                $A.test.addWaitFor(true,
                    function() {
                        var text = cmp.find("inputBlock1").getElement().innerHTML;
                        return text.indexOf("m an error") == -1;
                    }
                );
            }
        ]
    }
})
