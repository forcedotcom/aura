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
    createComponents: function(component, toAdd, alterFunction, ignoreChanges) {

        // We have 4 items by default.
        // Add a few items to the end of the body
        var currentCount = component.find("content").get("v.body.length");
        var configs = [];
        for (var i = 1; i <= toAdd; i++) {
            configs.push([
                "renderingTest:renderCounter",
                {
                    index: currentCount + i
                }
            ]);
        }

        var that = this;
        $A.componentService.createComponents(
            configs,
            function(newCmps) {
                that.changeBody(component, alterFunction, newCmps, ignoreChanges);
            }
        );
    },

    /**
     * Alter the content of a body using a callback.
     */
    changeBody: function(component, alterFunction, newCmps, ignoreChanges) {

        var content = component.find("content");
        var body = content.get("v.body");
        var newBody = alterFunction(body, newCmps);
        content.set("v.body", newBody, ignoreChanges);
    },

    isIframeReloaded: function() {
        // Some tests are aware that we are sub-optimal: facet reordering causes a reload of all
        // iframes because the reinsertion of DOM elements will create a reload. Both IE7/IE8 had
        // the right behavior, and this will probably be fixed in FF soon, so we expect different
        // results on diffewrent browsers. The specs are ambiguous:
        //
        // "When an iframe element is inserted into a document that has a browsing context, the user
        // agent must create a nested browsing context, and then process the iframe attributes for the "first time".
        // https://html.spec.whatwg.org/multipage/embedded-content.html#the-iframe-element

        return ! $A.get("$Browser.isIE8");
    },

    /**
     * Check that all iFrames are done loading.
     */
    iframesLoaded: function() {
        var iframeList = document.getElementsByTagName("iframe");
        for(var i = 0; i < iframeList.length; i++) {
            var iframe = iframeList.item(i);
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDocument.readyState !== "complete") {
                return false;
            }
        }
        return true;
    },

    assertComponents: function(component, values, message) {
        $A.rerender(component);
        $A.test.addWaitFor(true,
            this.iframesLoaded,
            function() {

                var nodes = component.find("content").getElement().childNodes;
                $A.test.assertEquals(values.length, nodes.length, message + ": invalid component count");

                for (var n = 0; n < nodes.length; n++) {

                    //
                    // If a number is provided for a row, we assume render=1, rerender=onload=1, unrender=0, onload=1
                    // which is the normal case.
                    //
                    // If a string is provided, we use it to validate the values in each column.
                    //

                    var expected = "#" + values[n] + ((typeof values[n] == "number")? "1101" : "");
                    var actual = $A.test.getText(nodes[n]).replace(/[\t\s]/g, "");
                    $A.test.assertEquals(expected, actual, message + ": invalid row #" + (n + 1) + "( " + expected + "vs " + actual + ")");
                }
            }
        );
    },

    setUp : function(component) {
        // This extra check ensures exisiting components are rendered before we modify them.
        this.assertComponents(component, [1,2,3,4], "Initial rendering");
    },

    testAppendFour: {
        test: [
            function(component) {
                this.createComponents(component, 4, function(body, newCmps) {
                	return body.concat(newCmps);
                });
            },
            function(component) {
                this.assertComponents(component, [1,2,3,4,5,6,7,8], "Append 4 components");
            }
        ]
    },

    testAppendFourNoUpdate: {
        test: [
            function(component) {

                this.createComponents(component, 4, function(body, newCmps) {
                    return body.concat(newCmps);
                }, true); // No rerender
            },
            function(component) {
                this.assertComponents(component, [1,2,3,4], "Append 4 components, no update");
            }
        ]
    },

    testRerenderTwo: {
        test: [
            function(component) {
                this.changeBody(component, function(body) {
                    body[1].set("v.index", 5);
                    body[2].set("v.index", 6);
                    return body;
                });
            },
            function(component) {
                // Here we have force rerendering of the two middle components.
                this.assertComponents(component, [1,"51201","61201",4], "Rerender 2nd and 3rd components");
            }
        ]
    },

    testPrependFour: {
        test: [
            function(component) {

                this.createComponents(component, 4, function(body, newCmps) {
                    return newCmps.concat(body);
                });
            },
            function(component) {
                this.assertComponents(component, [5,6,7,8,1,2,3,4], "Prepend 4 components");
            }
        ]
    },

    testInsertFour: {
        test: [
            function(component) {
                this.createComponents(component, 4, function(body, newCmps) {
                    body.splice.apply(body,[2,0].concat(newCmps));
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,2,5,6,7,8,3,4], "Insert 4 components between 2nd and 3rd");
            }
        ]
    },

    testInsertFourWithOverlap: {
        test: [
            function(component) {
                this.createComponents(component, 4, function(body, newCmps) {
                    body.splice.apply(body,[1,2].concat(newCmps));
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,5,6,7,8,4], "Insert 4 components over 2nd and 3rd");
            }
        ]
    },

    testAppendOne: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body, newCmps) {
                    body.push(newCmps[0]);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,2,3,4,5], "Append 1 component");
            }
        ]
    },

    testDeleteLast: {
        test: [
            function(component) {
                this.changeBody(component, function(body) {
                    body.pop();
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,2,3], "Delete last component");
            }
        ]
    },

    testPrependOne: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body, newCmps) {
                    body.unshift(newCmps[0]);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [5,1,2,3,4], "Prepend 1 component");
            }
        ]
    },

    testDeleteFirst: {
        test: [
            function(component) {
                this.changeBody(component, function(body) {
                    body.shift();
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [2,3,4], "Delete first component");
            }
        ]
    },

    testInsertOne: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body, newCmps) {
                    body.splice(1, 0, newCmps[0]);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,5,2,3,4], "Insert 1 component in 2nd");
            }
        ]
    },

    testDeleteOne: {
        test: [
            function(component) {
                this.changeBody(component, function(body) {
                    body.splice(1, 1);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,3,4], "Delete 2nd component");
            }
        ]
    },

    testReplaceOne: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body, newCmps) {
                    body.splice(1, 1, newCmps[0]);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,5,3,4], "Replace 2nd component");
            }
        ]
    },

    testSwapEnds: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body) {
                    return [
                        body[3],
                        body[1],
                        body[2],
                        body[0]
                    ];
                });
            },
            function(component) {
                var expected = this.isIframeReloaded() ? ["41202","21202","31202","11202"] : ["41101","21101","31101","11101"];
                this.assertComponents(component, expected, "Swapped 1st and 4rd components");
            }
        ]
    },

    testSwapMiddleTwo: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body) {
                    return [
                        body[0],
                        body[2],
                        body[1],
                        body[3]
                    ];
                });
            },
            function(component) {
                var expected = this.isIframeReloaded() ? ["11202","31202","21202","41202"] : ["11101","31101","21101","41101"];
                this.assertComponents(component, expected, "Swapped 2nd and 3rd components");
            }
        ]
    },

    testSwapFirstTwo: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body) {
                    return [
                        body[1],
                        body[0],
                        body[2],
                        body[3]
                    ];
                });
            },
            function(component) {
                var expected = this.isIframeReloaded() ? ["21202","11202","31202","41202"] : ["21101","11101","31101","41101"];
                this.assertComponents(component, expected, "Swapped 1st and 2nd components");
            }
        ]
    },

    testSwapLastTwo: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body) {
                    return [
                        body[0],
                        body[1],
                        body[3],
                        body[2]
                    ];
                });
            },
            function(component) {
                var expected = this.isIframeReloaded() ? ["11202","21202","41202","31202"] : ["11101","21101","41101","31101"];
                this.assertComponents(component, expected, "Swapped 3rd and 4th components");
            }
        ]
    },

    testMultiChange: {
        test: [
            function(component) {
                this.createComponents(component, 1, function(body, newCmps) {
                    // insert in 4rd place
                    body.splice(3, 0, newCmps[0]);
                    // remove the second
                    body.splice(1, 1);
                    return body;
                });
            },
            function(component) {
                this.assertComponents(component, [1,3,5,4], "Insert 4rd, delete 2nd component");
            }
        ]
    }
})
