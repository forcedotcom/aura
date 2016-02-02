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
    testDefaultApp: {
        test: function() {
            this.checkHeader("Dependencies for markup://aura:application");
            this.checkDependencyListPopulated();
        }
    },

    testCustomApp: {
        attributes: {
            component: "test:runner"
        },
        test: function() {
            this.checkHeader("Dependencies for markup://test:runner");
            this.checkDependencyListPopulated();
        }
    },

    testInvalidApp: {
        attributes: {
            component: "aura:doesNotExist"
        },
        test: function() {
            this.checkHeader("aura:doesNotExist: No APPLICATION named markup://aura:doesNotExist found");
        }
    },

    checkHeader: function(expectedText) {
        var header = document.getElementsByClassName("header")[0];
        var text = $A.test.getText(header);
        $A.test.assertStartsWith(expectedText, text, "Unexpected header text");
    },

    /**
     * Dependencies may change frequently so just verify we have a list of items that's of decent size and contains at
     * least 1 non-null UID entry.
     */
    checkDependencyListPopulated: function() {
        var items = document.getElementsByClassName("auradevDependencyItem");
        $A.test.assertTrue(items.length > 20, "List of dependencies not present or unexpectedly short");

        // Skip the first entry which is just the headerline
        for (var i = 1; i < items.length; i++) {
            var uid = items[i].getElementsByClassName("uid")[0].innerText;
            if (uid !== "null") {
                return;
            }
        }
        $A.test.fail("No non-null UID entries in dependency list");
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/