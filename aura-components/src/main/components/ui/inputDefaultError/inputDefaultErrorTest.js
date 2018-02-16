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
    testDomIdIsGlobalId : {
        attributes : {
            "errors" : [ {
                "message" : "ignored"
            } ]
        },
        test : function(cmp) {
            $A.test.assertEquals(cmp.getGlobalId(), cmp.getElement().id);
        }
    },

    testNothingForEmptyValue : {
        attributes : {
            "value" : ""
        },
        test : function(cmp) {
            $A.test.assertNull(cmp.getElement());
        }
    },

    testNothingForEmptyErrors : {
        attributes : {
            "errors" : []
        },
        test : function(cmp) {
            $A.test.assertNull(cmp.getElement());
        }
    },

    testNothingForNoErrors : {
        attributes : {},
        test : function(cmp) {
            $A.test.assertNull(cmp.getElement());
        }
    },

    testEmptyStringForStringError : {
        attributes : {
            "errors" : [ "justastring" ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("", $A.test.getText(ul.children[0]));
        }
    },

    testEmptyStringForNoMessageError : {
        attributes : {
            "errors" : [ {
                "stack" : "ignored"
            } ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("", $A.test.getText(ul.children[0]));
        }
    },

    testSingleError : {
        attributes : {
            "errors" : [ {
                "message" : "first"
            } ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
        }
    },

    testSingleValue : {
        attributes : {
            "value" : [ "single" ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("single", $A.test.getText(ul.children[0]));
        }
    },

    testMultipleErrors : {
        attributes : {
            "errors" : [ {
                "message" : "first"
            }, {
                "message" : "second"
            }, {
                "message" : "third"
            } ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(3, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
            $A.test.assertEquals("third", $A.test.getText(ul.children[2]));
        }
    },

    testMultipleValues : {
        attributes : {
            "value" : [ "first", "second", "third" ]
        },
        test : function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(3, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
            $A.test.assertEquals("third", $A.test.getText(ul.children[2]));
        }
    },

    testSetErrors : {
        attributes : {},
        test : [ function(cmp) {
            $A.test.assertNull(cmp.getElement());
            cmp.set("v.errors", [ {
                "message" : "first"
            }, {
                "message" : "second"
            } ]);
        }, function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(2, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
        } ]
    },

    testSetValue : {
        attributes : {},
        test : [ function(cmp) {
            $A.test.assertNull(cmp.getElement());
            cmp.set("v.value", [ "first", "second" ]);
        }, function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(2, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
        } ]
    },

    testClearErrorsWithEmptyList : {
        attributes : {
            "errors" : [ {
                "message" : "first"
            }, {
                "message" : "second"
            } ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(2, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
            cmp.set("v.errors", []);
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testClearErrorsWithUndefined : {
        attributes : {
            "errors" : [ {
                "message" : "first"
            } ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            cmp.set("v.errors");
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testClearErrorsWithNull : {
        attributes : {
            "errors" : [ {
                "message" : "first"
            } ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            cmp.set("v.errors", null);
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testClearValueWithEmptyList : {
        attributes : {
            "value" : [ "first", "second" ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(2, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("second", $A.test.getText(ul.children[1]));
            cmp.set("v.value", []);
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testClearValueWithUndefined : {
        attributes : {
            "value" : [ "first" ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            cmp.set("v.value");
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testClearValueWithNull : {
        attributes : {
            "value" : [ "first" ]
        },
        test : [ function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(1, ul.children.length);
            $A.test.assertEquals("first", $A.test.getText(ul.children[0]));
            cmp.set("v.value", null);
        }, function(cmp) {
            $A.test.assertNull(cmp.getElement());
        } ]
    },

    testValueAndErrorsIndependent : {
        attributes : {},
        test : [ function(cmp) {
            $A.test.assertNull(cmp.getElement());
            cmp.set("v.value", [ "v1", "v2" ]);
            cmp.set("v.errors", [ {
                "message" : "e1"
            } ]);
        }, function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(3, ul.children.length);
            $A.test.assertEquals("v1", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("v2", $A.test.getText(ul.children[1]));
            $A.test.assertEquals("e1", $A.test.getText(ul.children[2]));

            cmp.set("v.value", []);
            cmp.set("v.errors", [ {
                "message" : "e3"
            }, {
                "message" : "e4"
            } ]);
        }, function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(2, ul.children.length);
            $A.test.assertEquals("e3", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("e4", $A.test.getText(ul.children[1]));

            cmp.set("v.value", [ "v3" ]);
        }, function(cmp) {
            var ul = cmp.getElement();
            $A.test.assertEquals(3, ul.children.length);
            $A.test.assertEquals("v3", $A.test.getText(ul.children[0]));
            $A.test.assertEquals("e3", $A.test.getText(ul.children[1]));
            $A.test.assertEquals("e4", $A.test.getText(ul.children[2]));
        } ]
    }
})// eslint-disable-line semi
