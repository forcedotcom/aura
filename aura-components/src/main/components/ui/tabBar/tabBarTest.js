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

    testActiveTabOnLoad: {
        attributes: {
            "tabs": [{
                "descriptor": "markup://ui:tabItem",
                "attributes": {
                    "title": "tabOne",
                    "name": "tabOne"
                }
            }, {
                "descriptor": "markup://ui:tabItem",
                "attributes": {
                    "title": "tabTwo",
                    "name": "tabTwo",
                    "active": true
                }
            }
            ]
        },
        test: function (cmp) {
            var page = this.newPageObject(cmp);

            $A.test.assertEquals("tabTwo", page.getActiveTabTitle(), "Wrong tab or no tab was marked as active.");
        }
    },

    testTabMovesActiveOnSwitch: {
        attributes: {
            "tabs": [{
                "descriptor": "markup://ui:tabItem",
                "attributes": {
                    "title": "tabOne",
                    "name": "tabOne",
                    "active": true
                }
            }, {
                "descriptor": "markup://ui:tabItem",
                "attributes": {
                    "title": "tabTwo",
                    "name": "tabTwo"
                }
            }]
        },
        test: function (cmp) {
            var page = this.newPageObject(cmp);

            page.setActiveTabByIndex(1, function () {

                // Assert
                $A.test.assertEquals("tabTwo", page.getActiveTabTitle(), "Wrong tab or no tab was marked as active.");
            }, "Failed switching active to the second tab.");
        }
    },

    newPageObject: function (cmp) {

        return {
            getActiveTabTitle: function () {
                var element = cmp.getElement().querySelectorAll(".uiTabItem.active a");

                if (!element) {
                    throw new Error("No tabItems marked as active");
                }

                if (element.length !== 1) {
                    throw new Error("More than one tabItem was marked as active");
                }

                return element[0].getAttribute("title");
            },

            setActiveTabByIndex: function (index, callback, errorMessage) {
                cmp.get("e.setActive").fire({index: index, active: true});

                var targetTab = cmp.getElement().querySelectorAll(".uiTabItem")[index];

                $A.test.addWaitForWithFailureMessage(true, function () {
                    return targetTab.classList.contains("active");
                }, errorMessage, callback);
            }
        };
    }
    /*eslint-disable semi*/
})
/*eslint-enable semi*/
