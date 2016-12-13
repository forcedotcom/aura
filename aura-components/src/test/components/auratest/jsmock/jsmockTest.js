({
    mocks : [{
        type : "MODEL",
        stubs : [{
            answers : [{
                value : {
                    secret : { value : "<suite-level>" } ,
                    integer : { value : 0 },
                    integerString : { value : "2" },
                    stringList : { value : [ "super", "mock", "def"] }
                }
            }]
        }]
    }],

    testModelSuiteMocks : {
        labels : ["basic"],
        test : function(cmp) {
            $A.test.assertEquals("<suite-level>supermock", $A.test.getText(cmp.find("output").getElement()));
        }
    },

    testModelPropertiesCaseMocks : {
        mocks : [{
            type : "MODEL",
            stubs : [{
                answers : [{
                    value : {
                        secret : { value : "<not available>" } ,
                        integer : { value : 1 },
                        integerString : { value : "3" },
                        stringList : { value : [ "early", "on", "time", "late"] }
                    }
                }]
            }]
        }],
        test : function(cmp) {
            $A.test.assertEquals("<not available>ontime", $A.test.getText(cmp.find("output").getElement()));
        }
    },

    _testModelThrowsOnInstantiation : {
        mocks : [{
            type : "MODEL",
            stubs : [{
                answers : [{
                    error : "org.auraframework.throwable.AuraRuntimeException"
                }]
            }]
        }],
        test : function(cmp) {
            $A.test.assertEquals("<not available>", $A.test.getText(cmp.find("output").getElement()));
        }
    },

    _testModelThrowsOnGet : {
        mocks : [{
            type : "MODEL",
            stubs : [{
                answers : [{
                    value : { secret : { error : "org.auraframework.throwable.AuraRuntimeException" } }
                }]
            }]
        }],
        test : function(cmp) {
            $A.test.assertEquals("<not available>", $A.test.getText(cmp.find("output").getElement()));
        }
    },

    testProviderAttributes : {
        mocks : [{
            type : "PROVIDER",
            stubs : [{
                answers : [{
                    value : { attributes : { providedAttribute : "fresh"} }
                }]
            }]
        }],
        test : function(cmp) {
            $A.test.assertEquals("fresh<suite-level>supermock", $A.test.getText(cmp.find("output").getElement()));
        }
    },

    testProviderDescriptorAndAttributes : {
        mocks : [{
            type : "PROVIDER",
            stubs : [{
                answers : [{
                    value : {
                        descriptor : "aura:text",
                        attributes : { value : "fresh"}
                    }
                }]
            }]
        }],
        test : function(cmp) {
            $A.test.assertEquals("markup://aura:text", cmp.getDef().getDescriptor().getQualifiedName());
            var text = $A.test.getText(cmp.getElement()).trim();
            $A.test.assertEquals("fresh", text);
        }
    },

    testActionDefault : {
        test : [function(cmp) {
            this.saveDate = Date.parse(new Date());
            cmp.find("trigger").get("e.press").fire();
            $A.test.addWaitFor(true, function(){return "<suite-level>supermock" != $A.test.getText(cmp.find("output").getElement())});
        }, function(cmp) {
            var rawText = $A.test.getText(cmp.find("output").getElement());
            var newDate = Date.parse(rawText.substring(0, rawText.indexOf("supermock")));
            $A.test.assertTrue(newDate >= this.saveDate);
        }]
    },

    testActionString : {
        labels : ["basic"],
        mocks : [{
            type : "ACTION",
            stubs : [{
                method : { name : "getString" },
                answers : [{
                        value : "what I expected"
                }]
            } ]
        }],
        test : [function(cmp) {
            cmp.find("trigger").get("e.press").fire();
            $A.test.addWaitFor(true, function(){return "<suite-level>supermock" != $A.test.getText(cmp.find("output").getElement())});
        }, function(cmp) {
            $A.test.assertEquals("what I expectedsupermock", $A.test.getText(cmp.find("output").getElement()));
        }]
    },

    /*
     * This test mocking with storable actions. we have two answers in the stub, the action get to run 3 times.
     * 1st time it consume 1st answer, 2nd time it get response from storage,
     * then we clear the storage, so 3nd time it consume 2nd answer
     */
    testActionStringWithStorable : {
        mocks : [{
            type : "ACTION",
            stubs : [{
                                method : { name : "getString" },
                                answers : [{
                                        value : "what I expected First"
                                },{
                                        value : "what I expected Again"
                                }]
                            }
            ]
        }],
        test : [function(cmp) {
            $A.storageService.getStorage("actions").clear();
            var a = $A.test.getAction(cmp, "c.getString", undefined, function(a) {
                $A.test.assertTrue(a.isStorable(), "during first run, action should be storable");
                $A.test.assertFalse(a.isFromStorage(), "during first run, action shouldn't come from storage");
                $A.test.assertEquals("what I expected First", a.returnValue, "during first run, return value should from 1nd answer of our mock");
            });
            a.setStorable();
            $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([a]); }, "fail waiting for 1st action to finish");
            $A.enqueueAction(a);
        }, function(cmp) {
            var a = $A.test.getAction(cmp, "c.getString", undefined, function(a) {
                $A.test.assertTrue(a.isStorable(), "during second run, action should be storable");
                $A.test.assertTrue(a.isFromStorage(), "during second run, action should come from storage");
                $A.test.assertEquals("what I expected First", a.returnValue, "during second run, return value should from storage");
                //now let's clear the storage, so action 2 down there won't get a hit
                $A.storageService.getStorage("actions").clear();
            });
            a.setStorable();
            $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([a]); }, "fail waiting for 2nd action to finish");
            $A.enqueueAction(a);
        }, function(cmp) {
            var a = $A.test.getAction(cmp, "c.getString", undefined, function(a) {
                $A.test.assertTrue(a.isStorable(), "during third run, action should be storable");
                $A.test.assertFalse(a.isFromStorage(), "during third run, action shouldn't come from storage");
                $A.test.assertEquals("what I expected Again", a.returnValue, "during third run, return value should from 2nd answer of our mock");
            });
            a.setStorable();
            $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([a]); }, "fail waiting for 3nd action to finish");
            $A.enqueueAction(a);
        }]
    },

    _testActionThrows : {
        mocks : [{
            type : "ACTION",
            stubs : [{
                method : { name : "getString" },
                answers : [{
                    error : "java.lang.IllegalStateException"
                }]
            }]
        }],
        test : [function(cmp) {
            cmp.find("trigger").get("e.press").fire();
            $A.test.addWaitFor(true, function(){return "password" != $A.test.getText(cmp.find("output").getElement())});
        }, function(cmp) {
            $A.test.assertEquals("what I expected", $A.test.getText(cmp.find("output").getElement()));
        }]
    }
})
