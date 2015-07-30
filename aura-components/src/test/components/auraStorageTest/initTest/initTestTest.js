({
    setUp : function(component) {
        var completed = false;
        $A.storageService.getStorage("actions").clear()
            .then(
                function() { completed = true; },
                function(err) { $A.test.fail("Test setUp() failed to clear storage: " + err);
            });

        $A.test.addWaitFor(true, function() { return completed; });
    },

    resetCounter:function(cmp, _testName){
        var a = cmp.get('c.resetCounter');
        a.setParams({ testName: _testName });
        $A.test.enqueueAction(a);
        $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([a])});
    },

    executeAction:function(cmp, actionName, actionParam, additionalProperties, extraCallback){
        var helper = cmp.getDef().getHelper();
        return helper.executeAction.call(helper, cmp, actionName, actionParam, additionalProperties, extraCallback);
    },

    findAndSetText:function(cmp, targetCmpId, msg){
        cmp.find(targetCmpId).getElement().innerHTML = msg;
    },

    /**
     * Verify the default adapter selected when auraStorage:init is used without
     * any specification.
     */
    testDefaultAdapterSelection : {
        test : function(cmp) {
            var storage = $A.storageService.getStorage("defaultAdapter");
            $A.test.assertTruthy(storage, "Failed to fetch named storage.");
            $A.test.assertEquals("memory", storage.getName());
        }
    },

    /**
     * Register two auraStorage:init components with the same name but different
     * config, establish which one stands W-1560182: Is it okay that we allow
     * duplicate registration using auraStorage:init with same name but, we do
     * not allow dups using $A.storageService.initStorage()? we do not allow dup
     * named auraStorage:init in templates?
     */
    testDuplicateNamedStorage : {
        auraErrorsExpectedDuringInit : ["Storage named 'dupNamedStorage' already exists!"],
        attributes : {
            dupNamedStorage : true
        },
        test : [
            function(cmp) {
                $A.test.assertTruthy(cmp.find("dupNamedStorage1"));
                $A.test.assertTruthy(cmp.find("dupNamedStorage2"),
                                "Duplicate named storage not registered using auraStorage:init");
            },
            function(cmp) {
                //FIXME: W-1689002
                //var storage = $A.storageService.getStorage("dupNamedStorage");
                //$A.test.assertEquals(9999, storage.getMaxSize(),
                //                "storage config was overriden by duplicate registrations.");
            } ]
    },

    testActionStorageProperties : {
        test : [
            function(cmp) {
                $A.test.assertTruthy($A.storageService, "Aura Storage service is undefined.");
                var storage = $A.storageService.getStorage("actions");
                $A.test.assertTruthy(storage, "Aura Storage object is undefined.");
                $A.test.assertEquals("memory", storage.getName());
                this.resetCounter(cmp, "testBasicStorageServiceInitialization");
            },
            function(cmp) {
                // Verify API for server actions
                var a = cmp.get("c.fetchDataRecord");
                $A.test.assertTrue(a.getDef().isServerAction());
                $A.test.assertFalse(a.isStorable(), "By default action should not be marked for storage.");

                a.setStorable();
                $A.test.assertTrue(a.isStorable(), "Failed to mark action for storage.");
            },
            function(cmp) {
                // Verify API for client actions
                var a = cmp.get("c.forceActionAtServer");
                try {
                    a.setStorable();
                    $A.test.fail("Client actions cannot be marked for storage.");
                } catch (e) {
                    $A.test.assert(e.message.indexOf("Assertion Failed!: setStorable() cannot be called on a client action.") === 0);
                }
                $A.test.assertFalse(a.isStorable());
            } ]
    },
    /**
     * Verify Action.isStorable()
     */
    testIsStorableAPI : {
        test : [ function(cmp) {
            var a = cmp.get("c.fetchDataRecord");
            a.setStorable();
            $A.test.assertTrue(a.isStorable(), "Failed to mark action as storable.");
            a.setStorable({
                "ignoreExisting" : true
            });
            $A.test.assertFalse(a.isStorable(), "Failed to use ignoreExisting as config.");
            a.setStorable({
                "ignoreExisting" : false
            });
            $A.test.assertTrue(a.isStorable(), "Action was marked to not ignore existing storage config.");
        } ]
    },

    textForName : function(cmp, name) {
        var subcmp = cmp.find(name);
        if(!subcmp) {
            subcmp = cmp.getSuper().find(name);
        }
        if(!subcmp) {
            return null;
        }
        return $A.test.getText(subcmp.getElement());
    },

    /**
     * Verify Action.setStorable() and auto refresh setStorage() accepts
     * configuration. These configuration are helpful for follow up actions but
     * not the first action to be stored.
     *
     * {ignoreExisting: "Ignore existing stored response, but cache my response
     * after the action is complete" "refresh": "Time in seconds to override
     * action's current storage expiration"}
     *
     * We crank up the default refresh and expiration to make them irrelevant here.
     */
    testSetStorableAPI : {
        attributes : {
            defaultExpiration : "600",
            defaultAutoRefreshInterval : "600"
        },
        test : [ function(cmp) {
            //
            // Reset everything.
            //
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testSetStorableAPI");
        }, function(cmp) {
            //
            // Run a single 'fetch', and store the result. This should never run from
            // storage, and should always give a zero response.
            //
            $A.test.setTestTimeout(30000);
            var fetch1 = cmp.get("c.fetchDataRecord");
            fetch1.setParams({testName : "testSetStorableAPI"});
            fetch1.setStorable();
            $A.test.enqueueAction(fetch1);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([fetch1]); },
                function(){
                    $A.test.assertEquals("SUCCESS", fetch1.getState());
                    $A.test.assertFalse(fetch1.isFromStorage(), "Failed to excute action at server");
                    $A.test.assertEquals(0, fetch1.getReturnValue().Counter, "Wrong counter value seen in response");
                    //Set response stored time
                    cmp._requestStoredTime = new Date().getTime();
                });
        }, function(cmp) {
            //
            // Now, go and get it again, we should always get a response from storage, and we should never
            // cause a refresh.
            //
            $A.test.setTestTimeout(30000);
            var fetch2 = cmp.get("c.fetchDataRecord");
            var that = this;
            fetch2.setParams({testName : "testSetStorableAPI"});
            fetch2.setStorable();
            $A.test.enqueueAction(fetch2);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([fetch2]); },
                function(){
                    $A.test.assertEquals("SUCCESS", fetch2.getState());
                    $A.test.assertEquals(0, fetch2.getReturnValue().Counter, "fetch 2 response invalid.");
                    $A.test.assertEquals("", that.textForName(cmp, "refreshBegin"),
                            "refreshBegin fired unexpectedly");
                    $A.test.assertEquals("", that.textForName(cmp, "refreshEnd"),
                            "refreshEnd fired unexpectedly");
                });
        }, function(cmp) {
            //
            // Now that we have tested a stored response, make sure that refresh still has not fired,
            // and go ahead and put in a blocking request, followed by a request for the data record.
            // This should give us an immediate callback for the stored response, along with a refresh
            // event, followed by a wait.
            //
            // Once we get the refresh event, we send a resume to the server, ensuring that we unblock
            // the server.
            //
            var that = this;
            $A.test.setTestTimeout(30000);
            $A.test.assertEquals("", this.textForName(cmp, "refreshBegin"),
                    "refreshBegin fired unexpectedly");
            $A.test.assertEquals("", this.textForName(cmp, "refreshEnd"),
                    "refreshEnd fired unexpectedly");
            var block = cmp.get("c.block");
            var refreshState = "none";
            block.setParams({testName : "testSetStorableAPI"});
            $A.test.callServerAction(block, true);
            var requestTime;
            //Wait till the block action is executed
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([block]); },
                function(){
                    $A.test.assertEquals("", this.textForName(cmp, "refreshBegin"),
                            "refreshBegin fired unexpectedly");
                    $A.test.assertEquals("", this.textForName(cmp, "refreshEnd"),
                            "refreshEnd fired unexpectedly");
                    var aThird = cmp.get("c.fetchDataRecord");
                    aThird.setParams({testName : "testSetStorableAPI"});
                    //Keeping the auto refresh time to 0, helps testing the override
                    aThird.setStorable({"refresh": 0});
                    requestTime = new Date().getTime();
                    $A.test.enqueueAction(aThird);
                    $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([aThird]); },
                        function(){
                            $A.test.assertEquals("SUCCESS", aThird.getState());
                            $A.test.assertTrue(aThird.isFromStorage(), "failed to fetch cached response");
                        });
                });
            //Verify that refreshBegin was fired
            $A.test.addWaitFor("refreshBegin", function(){ return that.textForName(cmp, "refreshBegin"); },
                function(){
                    var refreshTime = new Date().getTime();
                    //Verify that the refresh begin event kicked off
                    $A.test.assertEquals(refreshState, "none");
                    refreshState = "start";
                    $A.test.assertTrue((refreshTime-requestTime)< 6000,
                        "Expected refresh within 5 seconds, got "+((refreshTime-requestTime)/1000) );
                    //resume controller only after refreshBegin
                    var resume = cmp.get("c.resume");
                    resume.setParams({testName : "testSetStorableAPI"});
                    $A.test.callServerAction(resume, true);
                });
            //Verify that refreshEnd was fired
            $A.test.addWaitFor("refreshEnd", function(){ return that.textForName(cmp, "refreshEnd"); },
                function(){
                    $A.test.assertEquals(refreshState, "start");
                    refreshState = "end";
                });
        }, function(cmp) {
            $A.test.setTestTimeout(30000);
            var aFourth = cmp.get("c.fetchDataRecord");
            aFourth.setParams({testName : "testSetStorableAPI"});
            aFourth.setStorable();
            $A.test.enqueueAction(aFourth);
            $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([aFourth]); },
                "Expected action to become SUCCESSful.",
                function(){
                    $A.test.assertEquals("SUCCESS", aFourth.getState());
                    $A.test.assertTrue(aFourth.isFromStorage(), "aFourth should have been from storage");
                }
            );
            // Storage is asynchronous; therefore, the Action may be SUCCESS before the value is stored.
            $A.test.addWaitForWithFailureMessage(1,
                    function() { return aFourth.getReturnValue().Counter; },
                    "aFourth should have fetched a refreshed response.");
        } ]
    },

    /**
     * Refresh action which refresh the response of stored action can be configured to not call the callback.
     * This test case verified that.
     */
    testSetStorableAPI_executeCallbackIfUpdated : {
    	attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            cmp._testName = "testSkipCallbackOnRefresh";
            this.resetCounter(cmp, "testSkipCallbackOnRefresh");
        }, function(cmp) {
            //First action which fetches the response from server.
            var a = this.executeAction(cmp, "c.fetchDataRecord",
                    {testName:cmp._testName},
                    function(a){a.setStorable();});
            //Wait for first callback
            $A.test.addWaitFor("1", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            cmp._originalExpiration = item.expires;
                        });
                });
        }, function(cmp) {
            // Specify that callback should not be called in case of refresh, so callback count should be 1 (for get())
            var a = this.executeAction(cmp, "c.fetchDataRecord",
                {testName:cmp._testName}, function(a) { a.setStorable({"executeCallbackIfUpdated":false}); });
            $A.test.addWaitFor("refreshEnd", function(){return $A.test.getText(cmp.find("refreshEnd").getElement());},
    	            function() {
            			//From cached response
    	                $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
    	                //Once for the original action and second action which was fetched from storage. None for refresh action
    	                $A.test.assertEquals("2", $A.test.getText(cmp.find("callbackCounter").getElement()));
    	                $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
    	                    function(item){
    	                		$A.test.assertEquals(1, item.value.returnValue.Counter,
    	                				"Refresh action response not stored in storage");
    	                		if(item.expires <= cmp._originalExpiration){
    	                            $A.test.fail("storage expiration was not updated after refresh " +
    	                                item.expires+" != "+cmp._originalExpiration);
    	                        }
    	                    });
    	            });
        } ]
    },
    /**
     * Providing empty config doesn't change the default behavior. The default refresh interval will be used.
     */
    testSetStorableAPI_Empty : {
        attributes : {
            defaultExpiration : "60",
            defaultAutoRefreshInterval : "0"
        },
        test : [
            function(cmp) {
                $A.test.setTestTimeout(30000);
                this.resetCounter(cmp, "testSetStorableAPI_Empty");
            },
            function(cmp) {
                var a = cmp.get("c.fetchDataRecord");
                a.setParams({
                    testName : "testSetStorableAPI_Empty"
                });
                // Empty settings
                a.setStorable({});
                $A.test.enqueueAction(a);
                $A.test.addWaitFor(false, $A.test.isActionPending);
            },
            function(cmp) {
                var aSecond = cmp.get("c.fetchDataRecord");
                aSecond.setParams({
                    testName : "testSetStorableAPI_Empty"
                });
                // Empty settings
                aSecond.setStorable({});
                $A.test.assertTrue(aSecond.isStorable());
                $A.test.enqueueAction(aSecond);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([aSecond]); },
                    function() {
                        $A.test.assertEquals("SUCCESS", aSecond.getState(), "failed to fetch cached response");
                        $A.test.assertTrue(aSecond.isFromStorage(), "failed to fetch cached response");
                        //Refresh interval should default to 0 and refresh should happen.
                        $A.test.addWaitFor("refreshEnd", function() {
                            return $A.test.getText(cmp.find("refreshEnd").getElement());
                        });
                    });
            }
        ]
    },
    testSetStorableAPI_Undefined : {
        attributes : {
            defaultExpiration : "60",
            defaultAutoRefreshInterval : "0"
        },
        test : [
            function(cmp) {
                $A.test.setTestTimeout(30000);
                this.resetCounter(cmp, "testSetStorableAPI_Undefined");
            },
            function(cmp) {
                var aUndefined = cmp.get("c.fetchDataRecord");
                aUndefined.setParams({ testName : "testSetStorableAPI_Undefined" });
                // Undefined
                aUndefined.setStorable(undefined);
                $A.test.assertTrue(aUndefined.isStorable());
                $A.test.enqueueAction(aUndefined);
                $A.test.addWaitFor("SUCCESS", function() {
                    return aUndefined.getState();
                }, function() {
                    $A.test.assertFalse(aUndefined.isFromStorage(), "failed to fetch cached response");
                    $A.test.assertEquals("", $A.test.getText(cmp.find("refreshBegin").getElement()),
                        "refreshBegin fired unexpectedly");
                    $A.test.assertEquals("", $A.test.getText(cmp.find("refreshEnd").getElement()),
                        "refreshEnd fired unexpectedly");
                });
            },
            function(cmp) {
                var aUndefinedSecond = cmp.get("c.fetchDataRecord");
                aUndefinedSecond.setParams({ testName : "testSetStorableAPI_Undefined" });
                aUndefinedSecond.setStorable(undefined);
                $A.test.assertTrue(aUndefinedSecond.isStorable());
                $A.test.enqueueAction(aUndefinedSecond);
                // Make sure refreshEnd has not fired.
                $A.test.assertEquals("", $A.test.getText(cmp.find("refreshEnd").getElement()),
                                    "refreshEnd fired unexpectedly");
                $A.test.addWaitFor("SUCCESS", function() { return aUndefinedSecond.getState(); },
                    function() {
                        $A.test.assertTrue(aUndefinedSecond.isFromStorage(), "failed to fetch cached response");
                    });
                $A.test.addWaitFor("refreshEnd", function() {
                        return $A.test.getText(cmp.find("refreshEnd").getElement());
                    });
            },
            function(cmp) {
                var aUndefinedThird = cmp.get("c.fetchDataRecord");
                aUndefinedThird.setParams({ testName : "testSetStorableAPI_Undefined" });
                aUndefinedThird.setStorable(undefined);
                $A.test.assertTrue(aUndefinedThird.isStorable());
                $A.test.enqueueAction(aUndefinedThird);
                $A.test.addWaitFor("SUCCESS", function() { return aUndefinedThird.getState(); },
                    function() {
                        $A.log(aUndefinedThird.getReturnValue());
                        $A.test.assertTrue(aUndefinedThird.isFromStorage(),
                            "aUndefinedThird should have been from storage");
                        $A.test.assertEquals(1, aUndefinedThird.getReturnValue().Counter,
                            "aUndefinedThird should have fetched refreshed response");
                    });
            } ]
    },
    testSetStorableAPI_UndefinedProps : {
        attributes : {
            defaultExpiration : "60",
            defaultAutoRefreshInterval : "0"
        },
        test : [
            function(cmp) {
                    $A.test.setTestTimeout(30000);
                    this.resetCounter(cmp, "testSetStorableAPI_UndefinedProps");
            },
            function(cmp) {
                    var aUndefined = cmp.get("c.fetchDataRecord");
                    aUndefined.setParams({
                            testName : "testSetStorableAPI_UndefinedProps"
                    });
                    // Undefined parts
                    aUndefined.setStorable({
                            "IgnoreExisting" : undefined,
                            "refresh" : undefined
                    });
                    $A.test.assertTrue(aUndefined.isStorable());
                    $A.test.enqueueAction(aUndefined);
                    $A.test.addWaitFor("SUCCESS", function() {
                            return aUndefined.getState();
                    }, function() {
                            $A.test.assertFalse(aUndefined.isFromStorage(), "failed to fetch cached response");
                            $A.test.assertEquals("", $A.test.getText(cmp.find("refreshBegin").getElement()),
                                            "refreshBegin fired unexpectedly");
                            $A.test.assertEquals("", $A.test.getText(cmp.find("refreshEnd").getElement()),
                                            "refreshEnd fired unexpectedly");
                    });
            },
            function(cmp) {
                    var aUndefinedSecond = cmp.get("c.fetchDataRecord");
                    aUndefinedSecond.setParams({
                            testName : "testSetStorableAPI_UndefinedProps"
                    });
                    aUndefinedSecond.setStorable({
                            "IgnoreExisting" : undefined,
                            "refresh" : undefined
                    });
                    $A.test.assertTrue(aUndefinedSecond.isStorable());
                    $A.test.enqueueAction(aUndefinedSecond);
                    $A.test.addWaitFor("SUCCESS", function() {
                            return aUndefinedSecond.getState();
                    }, function() {
                            $A.test.assertTrue(aUndefinedSecond.isFromStorage(), "failed to fetch cached response");

                    }, function() {
                            $A.test.addWaitFor("refreshEnd",
                                function() {
                                    return $A.test.getText(cmp.find("refreshEnd").getElement());
                                }, function() {
                                    var aUndefinedThird = cmp.get("c.fetchDataRecord");
                                    aUndefinedThird.setParams({
                                            testName : "testSetStorableAPI_UndefinedProps"
                                    });
                                    aUndefinedThird.setStorable({
                                            "IgnoreExisting" : undefined,
                                            "refresh" : undefined
                                    });
                                    $A.test.enqueueAction(aUndefinedThird);
                                    $A.test.addWaitFor("SUCCESS", function() {
                                            return aUndefinedThird.getState();
                                    }, function() {
                                            $A.test.assertTrue(aUndefinedThird.isFromStorage(),
                                                            "aUndefinedThird should have been from storage");
                                            $A.test.assertEquals(1, aUndefinedThird.getReturnValue().Counter,
                                                            "aUndefinedThird should have fetched refreshed response");
                                    });
                                }
                            );
                    });
            } ]
    },
    /**
     * Verify that an action can bypass the storage service when its not marked
     * a Storable. Verify isFromStorage() API on Action.
     */
    testForceActionAtServer : {
        attributes : {
            defaultExpiration : 30
        },
        test : [
            function(cmp) {
                $A.test.setTestTimeout(30000);
                cmp._testName = "testForceActionAtServer";
                this.resetCounter(cmp, "testForceActionAtServer");
            },
            function(cmp) {
                // Run the action and mark it as storable.
                var btn = cmp.find("RunActionAndStore");
                var evt = btn.get("e.press");
                var storage = $A.storageService.getStorage("actions");
                var completed = false;

                evt.fire();

                $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                    $A.test.assertEquals("StorageController", $A.test.getText(cmp.find("responseData").getElement()));
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.test.assertEquals("1", $A.test.getText(cmp.find("callbackCounter").getElement()));

                    storage.getSize()
                        .then(function(size) { $A.test.assertTrue(size > 0,
                            "Expected first action to be stored in storage service."); })
                        .then(function() { completed = true; }, function(err) { $A.test.fail(err); });
                });

                $A.test.addWaitFor(true, function() { return completed; });
            },
            function(cmp) {
                // Re-Run the action without marking it as storable, this
                // should force the action to by pass memory service.
                var btn = cmp.find("ForceActionAtServer");
                var evt = btn.get("e.press");
                evt.fire();
                $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                    $A.test.assertEquals("StorageController", $A.test
                                    .getText(cmp.find("responseData").getElement()));
                    $A.test.assertEquals("1", $A.test.getText(cmp.find("staticCounter").getElement()),
                                    "Failed to force a previously cached action to run at server.");
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.test.assertEquals("2", $A.test.getText(cmp.find("callbackCounter").getElement()));
                });
            }, function(cmp) {
                // Re-Run the action and mark it as storable. Expect to see
                // the cached response.
                var btn = cmp.find("RunActionAndStore");
                var evt = btn.get("e.press");
                evt.fire();
                $A.test.addWaitFor("0", function() {
                        return $A.test.getText(cmp.find("staticCounter").getElement());
                    }, function() {
                        $A.test.assertEquals("true", $A.test.getText(cmp.find("isFromStorage").getElement()));
                        $A.test.assertEquals("3", $A.test.getText(cmp.find("callbackCounter").getElement()));
                    });
            }
        ]
    },
    testUnmarkedActionAreNotStored : {
        test : [
            function(cmp) {
                var completed = false;
                cmp._testName = "testUnmarkedActionAreNotStored";
                this.resetCounter(cmp, "testUnmarkedActionAreNotStored");
                var storage = $A.storageService.getStorage("actions");
                storage.getSize()
                    .then(function(size) { $A.test.assertEquals(0, size); })
                    .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

                $A.test.addWaitFor(true, function() { return completed; });
            },
            function(cmp) {
                // Run the action without marking it as storable.
                var btn = cmp.find("ForceActionAtServer");
                var evt = btn.get("e.press");
                var storage = $A.storageService.getStorage("actions");
                var completed = false;

                evt.fire();

                $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                    $A.test.assertEquals(
                        "StorageController",
                        $A.test.getText(cmp.find("responseData").getElement())
                    );
                    $A.test.assertEquals(
                        "0",
                        $A.test.getText(cmp.find("staticCounter").getElement()),
                        "Failed to inoke server action."
                    );

                    storage.getSize()
                        .then(function(size) { $A.test.assertEquals(0, size, "Storage service saw an increase in size."); })
                        .then(function() { completed = true; }, function(err) { $A.test.fail(err); });
                });

                $A.test.addWaitFor(true, function() { return completed; });
            }, function(cmp) {
                var btn = cmp.find("ForceActionAtServer");
                var evt = btn.get("e.press");
                evt.fire();
                $A.test.addWaitFor("1", function() {
                    return $A.test.getText(cmp.find("staticCounter").getElement());
                });
            } ]
    },
    /**
     * Verify cache sweeping(expiration check). defaultExpiration settings
     * trumps defaultAutoRefreshInterval setting
     */
    testCacheExpiration : {
        attributes : {
            defaultExpiration : 1, // I am king
            defaultAutoRefreshInterval : 60 // Very high but doesn't matter
        },
        test : [ function(cmp) {
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testCacheExpiration");
        }, function(cmp) {
            //Run the action and mark it as storable.
            var a = cmp.get("c.fetchDataRecord");
            a.setParams({testName : "testCacheExpiration"});
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){
                    $A.test.assertFalse(a.isFromStorage(), "Failed to execute action at server");
                    $A.test.assertEquals(0, a.getReturnValue().Counter, "Wrong counter value seen in response");
                }
            );
            var key = a.getStorageKey();
            var expired = false;
            // Twisted asynchronicity, but it should do the right thing.
            $A.test.addWaitFor(true, function(){
                    if (a.getState() == "SUCCESS") {
                        // don't start looking until our action has finished.
                        $A.storageService.getStorage("actions").get(key).then(function(item) {
                            if (item === undefined) {
                                expired = true;
                            }
                        });
                    }
                    return expired;
                });
        }, function(cmp) {
            var aSecond = cmp.get("c.fetchDataRecord");
            aSecond.setParams({testName: "testCacheExpiration"});
            aSecond.setStorable();
            $A.test.enqueueAction(aSecond);
            $A.test.addWaitFor(
                "SUCCESS",
                function () {
                    return aSecond.getState();
                },
                function () {
                    $A.test.assertEquals(1, aSecond.getReturnValue().Counter, "aSecond response invalid.");
                    $A.test.assertFalse(aSecond.isFromStorage(), "expected cache expiration");
                }
            );
        } ]
    },

    /**
     * When offline, should not purge cached data.
     *
     */
    testCacheDataNotPurgedWhenOffline : {
        attributes : {
            defaultExpiration : 5, // I am king
            defaultAutoRefreshInterval : 60 // Very high but doesn't matter
        },
        test : [
            function(cmp) {
                $A.test.setTestTimeout(30000);
                this.resetCounter(cmp, "testCacheDataNotPurgedWhenOffline");
            },
            function(cmp) {
                // Run the action and mark it as storable.
                var a = cmp.get("c.fetchDataRecord");
                a.setParams({ testName : "testCacheDataNotPurgedWhenOffline" });
                a.setStorable();
                $A.test.enqueueAction(a);
                $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                    $A.test.assertFalse(a.isFromStorage(), "Should not be using cached data");
                    $A.test.assertEquals(0, a.getReturnValue().Counter, "Wrong counter value seen in response");
                });
            },
            function(cmp) {
                // Wait for atleast 5 seconds after the response has been
                // stored
                $A.test.addWaitFor(true, function() {
                        var now = new Date().getTime();
                        var storageModified = $A.test.getText(cmp.find("storageModified").getElement());
                        return (now - parseInt(storageModified, 10)) > 5000;
                    });
            },
            function(cmp) {
                // Create an offline event,
                var connectionLostEvent = $A.get("e.aura:connectionLost");
                connectionLostEvent.fire();
            },
            function(cmp) {
                // Run the action and verify that cached data is not purged
                var a = cmp.get("c.fetchDataRecord");
                a.setParams({
                        testName : "testCacheDataNotPurgedWhenOffline"
                });
                a.setStorable();
                $A.test.enqueueAction(a);
                $A.test.addWaitFor("SUCCESS", function() {
                        return a.getState();
                    }, function() {
                        $A.test.assertEquals(0, a.getReturnValue().Counter,
                                        "Offline, second response should not be available.");
                        $A.test.assertTrue(a.isFromStorage(), "Should use cached data because offline");
                    });
            } ]
    },
    /**
     * Go offline (should not purge cached data), then go back online, should
     * use cached data.
     *
     */
    testCacheDataUsedWhenConnectionResumed : {
        attributes : {
            defaultExpiration : 50,
            defaultAutoRefreshInterval : 60
        },
        test : [ function(cmp) {
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testCacheDataUsedWhenConnectionResumed");
        }, function(cmp) {
            // Run the action and mark it as storable.
            var a = cmp.get("c.fetchDataRecord");
            a.setParams({
                    testName : "testCacheDataUsedWhenConnectionResumed"
            });
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                    $A.test.assertFalse(a.isFromStorage(), "Should not be using cached data");
                    $A.test.assertEquals(0, a.getReturnValue().Counter, "Wrong counter value seen in response");
                });
        }, function(cmp) {
            // Create an offline event,
            var connectionLostEvent = $A.get("e.aura:connectionLost");
            connectionLostEvent.fire();
        }, function(cmp) {
            // go back online
            var connectionResumed = $A.get("e.aura:connectionResumed");
            connectionResumed.fire();

            // Run the action and verify that cache data is still being used
            var a = cmp.get("c.fetchDataRecord");
            a.setParams({
                    testName : "testCacheDataUsedWhenConnectionResumed"
            });
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor("SUCCESS", function() {
                    return a.getState();
                }, function() {
                    $A.test.assertTrue(a.isFromStorage(), "Connection resumed but should still use cached data");
            });
        } ]
    },

    /**
     * Verify stored items are overwritten with identical action keys
     */
    testActionKeyOverloading : {
        test : [ function(cmp) {
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testActionKeyOverloading");
        }, function(cmp) {
            var a = cmp.get("c.substring");
            a.setParams({testName : "testActionKeyOverloading", param1 : 999});
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                    $A.test.assertEquals(0, a.getReturnValue()[0], "Wrong counter value seen in response");
                    $A.test.assertEquals(999, a.getReturnValue()[1]);
                });
        }, function(cmp) {
            //Controller name is a substring of previous controller
            var a = cmp.get("c.string");
            a.setParams({testName : "testActionKeyOverloading", param1 : 999});
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    $A.test.assertFalse(a.isFromStorage(), "should not have fetched from cache");
                    $A.test.assertEquals(1, a.getReturnValue()[0], "Wrong counter value seen in response");
                    $A.test.assertEquals(999, a.getReturnValue()[1]);
                });
        }, function(cmp) {
            //Controller name is the same as previous controller but different parameter value
            var a = cmp.get("c.string");
            a.setParams({testName : "testActionKeyOverloading", param1 : 9999});
            a.setStorable();
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                    $A.test.assertEquals(2, a.getReturnValue()[0], "Wrong counter value seen in response");
                    $A.test.assertEquals(9999, a.getReturnValue()[1]);
                });
        } ]
    },

    /**
     * Grouping multiple actions and setting them to be storable.
     */
    testActionGrouping : {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 60
        },
        test : [ function(cmp) {
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testActionGrouping_A");
            this.resetCounter(cmp, "testActionGrouping_B");
            this.resetCounter(cmp, "testActionGrouping_notStored");
        }, function(cmp) {
            var a1 = cmp.get("c.substring");
            a1.setParams({testName : "testActionGrouping_A", param1 : 999});
            a1.setStorable();
            $A.enqueueAction(a1);
            var b1 = cmp.get("c.string");
            b1.setParams({testName : "testActionGrouping_B", param1 : 666});
            b1.setStorable();
            $A.enqueueAction(b1);
            //1 Unstored action
            var notStored = cmp.get("c.fetchDataRecord");
            notStored.setParams({testName : "testActionGrouping_notStored"});
            $A.enqueueAction(notStored);
            $A.test.addWaitFor(false, $A.test.isActionPending);
        }, function(cmp) {
            //Run a action whose response has been previously stored
            var a2 = cmp.get("c.substring");
            a2.setParams({testName : "testActionGrouping_A", param1 : 999});
            a2.setStorable();
            $A.test.enqueueAction(a2);
            $A.test.addWaitFor("SUCCESS", function() { return a2.getState(); },
                function(){
                    $A.log($A.storageService.getStorage("actions"));
                    $A.test.assertTrue(a2.isFromStorage(), "Failed to fetch action from storage");
                    $A.test.assertEquals(0, a2.getReturnValue()[0], "Wrong counter value seen in response");
                    $A.test.assertEquals(999, a2.getReturnValue()[1]);
                });
        }, function(cmp) {
            //Run a action whose response has been previously stored
            var b2 = cmp.get("c.string");
            b2.setParams({testName : "testActionGrouping_B", param1 : 666});
            b2.setStorable();
            $A.enqueueAction(b2);
            //Run a action which was previously not marked to be stored and group it with the one above
            var notStoredAgain = cmp.get("c.fetchDataRecord");
            notStoredAgain.setParams({testName : "testActionGrouping_notStored"});
            $A.test.enqueueAction(notStoredAgain);
            $A.test.addWaitFor("SUCCESS", function() { return b2.getState(); },
                function(){
                    $A.test.assertTrue(b2.isFromStorage(), "failed to fetch action from cache");
                    $A.test.assertEquals(0, b2.getReturnValue()[0], "Wrong counter value seen in response");
                    $A.test.assertEquals(666, b2.getReturnValue()[1]);
                });
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    $A.test.assertFalse(notStoredAgain.isFromStorage(), "Failed to group stored actions and unstored actions.");
                    $A.test.assertEquals(1, notStoredAgain.getReturnValue().Counter,
                        "Counter value should have been incremented for unstored action");
                    });
        } ]
    },

    /**
     * Abortable actions and caching
     */
    testAbortableActions : {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 60
        },
        test : [
            function(cmp) {
                $A.test.setTestTimeout(30000);
                this.resetCounter(cmp, "testAbortableAction_A");
                this.resetCounter(cmp, "testAbortableAction_B");
            },
            function(cmp) {
                cmp._testCounter = 2;
                var abortable1 = cmp.get("c.substring");
                abortable1.setParams({
                        testName : "testAbortableAction_A",
                        param1 : 999
                    });
                abortable1.setStorable();
                $A.test.assertTrue(abortable1.isAbortable(), "Storable actions should be abortable by default.");

                var abortable2 = cmp.get("c.string");
                abortable2.setParams({
                        testName : "testAbortableAction_B",
                        param1 : 666
                    });
                abortable2.setAbortable();
                $A.test.assertFalse(abortable2.isStorable(),
                                "The converse is not true. Abortable does not mean its storable.");
                abortable2.setStorable();

                // Why does abortable work only in another action's callback? Gerald?
                // Gordon Answers: Abortable only works for currently enqueued actions.
                var fetch = cmp.get("c.fetchDataRecord");
                fetch.setParams({
                        testName : "testAbortableAction"
                    });
                $A.test.enqueueAction(fetch);
                $A.test.runAfterIf(function() { return $A.test.areActionsComplete([fetch]); }, function() {
                        $A.test.assertEquals("SUCCESS", fetch.getState(), "fetchDataRecord should have succeeded.");
                        $A.test.blockRequests();
                        $A.run(function() { $A.enqueueAction(abortable1); });
                        $A.run(function() { $A.enqueueAction(abortable2); });
                        $A.test.releaseRequests();
                    });
                $A.test.runAfterIf(function() { return $A.test.areActionsComplete([abortable1, abortable2]); },
                    function() {
                        $A.test.assertEquals("ABORTED", abortable1.getState(), "Action was not aborted");
                        $A.test.assertEquals("SUCCESS", abortable2.getState(), "Last abortable group did not complete.");
                        var now = new Date().getTime();
                        // wait for the timer to tick over
                        $A.test.addWaitFor(true, function() { return now < new Date().getTime(); }, function(){});
                    });
            },
            function(cmp) {
                var abortedAction = cmp.get("c.substring");
                abortedAction.setParams({
                        testName : "testAbortableAction_A",
                        param1 : 999
                    });
                abortedAction.setStorable();
                $A.test.enqueueAction(abortedAction);
                $A.test.addWaitFor("SUCCESS", function() {
                        return abortedAction.getState();
                    }, function() {
                        $A.test.assertFalse(abortedAction.isFromStorage(),
                            "Actions aborted before being sent to server should not be stored in cache");
                        $A.test.assertEquals(0, abortedAction.getReturnValue()[0],
                            "Wrong counter value seen in response");
                        $A.test.assertEquals(999, abortedAction.getReturnValue()[1]);
                    });
            }, function(cmp) {
                var successfulAction = cmp.get("c.string");
                successfulAction.setParams({
                        testName : "testAbortableAction_B",
                        param1 : 666
                    });
                successfulAction.setStorable();
                $A.test.enqueueAction(successfulAction);
                $A.test.addWaitFor("SUCCESS", function() {
                        return successfulAction.getState();
                    }, function() {
                        $A.test.assertTrue(successfulAction.isFromStorage(), "failed to fetch action from cache");
                    });
            } ]
    },

    /**
     * If a refresh contains the same response as what is stored, then skip
     * replaying the callback. The callback for the stored response is still
     * executed.
     * Case: Simple action with no components involved
     */
    testRefresh_ResponseSameAsStored : {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            cmp._testName = "testSkipReplayOnIdenticalRefresh";
            this.resetCounter(cmp, "testSkipReplayOnIdenticalRefresh");
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName}, function(a) { a.setStorable(); });
            $A.test.addWaitFor("1", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey())
                    .then(function(item){ cmp._originalExpiration = item.expires; });
                });
        }, function(cmp) {
            // reset so next response will be same as first
            cmp._testName = "testSkipReplayOnIdenticalRefresh";
            this.resetCounter(cmp, "testSkipReplayOnIdenticalRefresh");
            // wait for the timer to tick over
            var now = new Date().getTime();
            $A.test.addWaitFor(true, function() { return now < new Date().getTime(); }, function(){});
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName},
                function(a){a.setStorable({"executeCallbackIfUpdated":true});});
            $A.test.addWaitFor("refreshEnd", function(){return $A.test.getText(cmp.find("refreshEnd").getElement());},
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("2", $A.test.getText(cmp.find("callbackCounter").getElement()));
                    $A.test.assertEquals("true", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            if(item.expires <= cmp._originalExpiration){
                                $A.test.fail("storage expiration was not updated after refresh " +
                                    item.expires+" != "+cmp._originalExpiration);
                            }
                        });
                });
        } ]
    },

    /**
     * If a refresh response differs from what is stored, process the callback.
     */
    testRefresh_ResponseDiffersFromStore : {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            cmp._testName = "testDontSkipReplayOnNonIdenticalRefresh";
            this.resetCounter(cmp, "testDontSkipReplayOnNonIdenticalRefresh");
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecord",
                {testName:cmp._testName}, function(a){a.setStorable();});
            $A.test.addWaitFor("1", function(){return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item) { cmp._originalExpiration = item.expires; });
                });
        }, function(cmp) {
            // this response will be different so callback count should be +2 (for get(), then refresh())
            var a = this.executeAction(cmp, "c.fetchDataRecord",
                {testName:cmp._testName}, function(a){a.setStorable();});
            $A.test.addWaitFor("3", function(){ return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("1", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            if(item.expires <= cmp._originalExpiration){
                                $A.test.fail("storage expiration was not updated after refresh");
                            }
                        });
                });
        } ]
    },

    /**
     * If a refresh contains the same response as what is stored, then skip
     * replaying the callback. The callback for the stored response is still
     * executed.
     * Case: Action returns a component instance in the response
     */
    testRefresh_ResponseWithComponentsSameAsStored : {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            $A.test.setTestTimeout(30000);
            cmp._testName = "testSkipReplayOnIdenticalRefreshWithComponents";
            this.resetCounter(cmp, "testSkipReplayOnIdenticalRefreshWithComponents");
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecordWithComponents", {testName:cmp._testName},
                        function(a){a.setStorable();},
                        function(a){$A.test.clearAndAssertComponentConfigs(a);});
            $A.test.addWaitFor("1", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item) { cmp._originalExpiration = item.expires; });
                });
        }, function(cmp) {
            // reset so next response will be same as first
            cmp._testName = "testSkipReplayOnIdenticalRefreshWithComponents";
            this.resetCounter(cmp, "testSkipReplayOnIdenticalRefreshWithComponents");
            // wait for the timer to tick over
            var now = new Date().getTime();
            $A.test.addWaitFor(true, function() { return now < new Date().getTime(); }, function(){});
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecordWithComponents", {testName:cmp._testName},
                        function(a){a.setStorable();},
                        function(a){$A.test.clearAndAssertComponentConfigs(a);});
            $A.test.addWaitFor("refreshEnd", function(){return $A.test.getText(cmp.find("refreshEnd").getElement());},
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("2", $A.test.getText(cmp.find("callbackCounter").getElement()));
                    $A.test.assertEquals("true", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            if(item.expires <= cmp._originalExpiration){
                                $A.test.fail("storage expiration was not updated after refresh " +
                                    item.expires+" != "+cmp._originalExpiration);
                            }
                        });
                });
        } ]
    },

    /**
     * If a action had the same return value but different components were created during the execution of action,
     * then the response from refresh action replaces the stored response.
     */
    testRefresh_ResponseWithSameReturnValueButAdditionalComponents: {
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            $A.test.setTestTimeout(30000);
            cmp._testName = "testDontSkipReplayOnNonIdenticalComponentsInRefresh";
            this.resetCounter(cmp, "testDontSkipReplayOnNonIdenticalComponentsInRefresh");
        }, function(cmp) {
            var a = this.executeAction(cmp, "c.fetchDataRecordWithComponents",
                    {testName:cmp._testName, extraComponentsCreated:true}, function(a){a.setStorable();},
                        function(a){$A.test.clearAndAssertComponentConfigs(a);});
            $A.test.addWaitFor("1", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item) { cmp._originalExpiration = item.expires; });
                });
        }, function(cmp) {
            // this response will be different(has extra component but same return value) so callback count should be +2 (for get(), then refresh())
            var a = this.executeAction(cmp, "c.fetchDataRecordWithComponents",
                        {testName:cmp._testName, extraComponentsCreated:true},
                        function(a){ a.setStorable(); },
                        function(a){ $A.test.clearAndAssertComponentConfigs(a); });

            var completed = false;
            $A.test.addWaitFor(
                "3",
                function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").get(a.getStorageKey())
                            .then(function(item) {
                                if (item.expires <= cmp._originalExpiration) {
                                    $A.test.fail("storage expiration was not updated after refresh");
                                }

                                completed = true;
                            });
                }
            );

            $A.test.addWaitFor(true, function() { return completed; });
        } ]
    },
    /**
     * Refresh error not stored, so subsequent refresh will still replay.
     */
    testRefreshErrorResponseNotStored : {
        mocks : [{
            type : "ACTION",
                stubs : [{
                    method : { name : "fetchDataRecord" },
                    answers : [{
                        value : "anything really"
                    },{
                        error : "java.lang.IllegalStateException"
                    },{
                        value : "anything really, but something new"
                    }]
                }]
        }],
        attributes : {
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
        	$A.test.setTestTimeout(300000);
            this.resetCounter(cmp, "testRefreshErrorResponseNotStored");
        },function(cmp) {
            var a = cmp.get("c.fetchDataRecord");
            var that = this;
            a.setParams({testName : "testRefreshErrorResponseNotStored"});
            a.setStorable();
            a.setCallback(cmp, function(action){
            	//sanity check
            	$A.test.assertEquals(action.getReturnValue(),"anything really","we are not using the correct stub");
                that.findAndSetText(cmp, "callbackCounter",
                    parseInt(cmp.find("callbackCounter").getElement().innerHTML,10)+1);
            });
            $A.test.enqueueAction(a);
            $A.test.addWaitFor("1", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function() {
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){ cmp._originalExpiration = item.expires; });
                });
        }, function(cmp) {
            var a = cmp.get("c.fetchDataRecord");
            var that = this;
            a.setParams({testName : "testRefreshErrorResponseNotStored"});
            a.setStorable();
            a.setCallback(cmp, function(action){
            	that.findAndSetText(cmp, "callbackCounter",
                    parseInt(cmp.find("callbackCounter").getElement().innerHTML,10)+1);
            });
            $A.test.enqueueAction(a);
            $A.test.addWaitFor("3", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function(){
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            $A.test.assertEquals(cmp._originalExpiration, item.expires,
                                "stored item should not have had expiration modified");
                        });
                });
            // wait for the timer to tick over
            var now = new Date().getTime();
            $A.test.addWaitFor(true, function() { return now < new Date().getTime(); }, function(){});
        }, function(cmp) {
            var a = cmp.get("c.fetchDataRecord");
            var that = this;
            a.setParams({testName : "testRefreshErrorResponseNotStored"});
            a.setStorable();
            a.setCallback(cmp, function(action){
                var newCount = parseInt(cmp.find("callbackCounter").getElement().innerHTML,10) + 1;
                that.findAndSetText(cmp, "callbackCounter", newCount);
                // first action run will be stored refresh action
                if (newCount == 4) {
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(
                        function(item){
                            $A.test.assertEquals(cmp._originalExpiration, item.expires, "Refresh action not run");
                        });
                }
            });
            $A.test.enqueueAction(a);
            $A.test.addWaitFor("5", function() { return $A.test.getText(cmp.find("callbackCounter").getElement()); },
                function(){
                    $A.storageService.getStorage("actions").get(a.getStorageKey()).then(function(){},
                        function(item){
                            // after new action is run, it is stored with new expires time
                            $A.test.assertTrue(cmp._originalExpiration < item.expires,
                                    "storage expiration was not updated after refresh");
                        });
                });
        } ]
    }
})
