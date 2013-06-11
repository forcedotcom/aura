({
	setUp : function(component) {
            $A.storageService.getStorage("actions").clear();
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
            exceptionsAllowedDuringInit : ["Storage named 'dupNamedStorage' already exists!"],
            attributes : {
                dupNamedStorage : true
            },
            test : [
                function(cmp) {
                    $A.test.expectAuraError("Storage named 'dupNamedStorage' already exists!");
                    $A.test.assertTruthy(cmp.find("dupNamedStorage1"));
                    $A.test.assertTruthy(cmp.find("dupNamedStorage2"),
                                    "Duplicate named storage not registered using auraStorage:init");
                },
                function(cmp) {
                    var storage = $A.storageService.getStorage("dupNamedStorage");
                    //FIXME: W-1689002
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

	/**
	 * Verify Action.setStorable() and auto refresh setStorage() accepts
	 * configuration. These configuration are helpful for follow up actions but
	 * not the first action to be stored.
	 * 
	 * {ignoreExisting: "Ignore existing stored response, but cache my response
	 * after the action is complete" "refresh": "Time in seconds to override
	 * action's current storage expiration"}
	 */
	testSetStorableAPI : {
		attributes : {
			defaultExpiration : "60",
			defaultAutoRefreshInterval : "60"
		},
		test : [ function(cmp) {
			cmp.getDef().getHelper().testSetStorableAPIStage1.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testSetStorableAPIStage2.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testSetStorableAPIStage3.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testSetStorableAPIStage4.call(this, cmp);
		} ]
	},
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
					$A.enqueueAction(a);
					$A.eventService.finishFiring();
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
					$A.enqueueAction(aSecond);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return aSecond.getState()
					}, function() {
						$A.test.assertTrue(aSecond.isFromStorage(), "failed to fetch cached response");
						$A.test.assertEquals("", $A.test.getText(cmp.find("refreshBegin").getElement()),
								"refreshBegin fired unexpectedly");
						$A.test.assertEquals("", $A.test.getText(cmp.find("refreshEnd").getElement()),
								"refreshEnd fired unexpectedly");
					});
				} ]
	},
	testSetStorableAPI_Undefined : {
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
					var aUndefined = cmp.get("c.fetchDataRecord");
					aUndefined.setParams({
						testName : "testSetStorableAPI_Undefined"
					});
					// Undefined
					aUndefined.setStorable(undefined);
					$A.test.assertTrue(aUndefined.isStorable());
					$A.enqueueAction(aUndefined);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return aUndefined.getState()
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
						testName : "testSetStorableAPI_Undefined"
					});
					aUndefinedSecond.setStorable(undefined);
					$A.test.assertTrue(aUndefinedSecond.isStorable());
					$A.enqueueAction(aUndefinedSecond);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return aUndefinedSecond.getState()
					}, function() {
						$A.test.assertTrue(aUndefinedSecond.isFromStorage(), "failed to fetch cached response");

					}, function() {
						$A.test.addWaitFor("refreshEnd", function() {
							return $A.test.getText(cmp.find("refreshEnd").getElement())
						}, function() {
							var aUndefinedThird = cmp.get("c.fetchDataRecord");
							aUndefinedThird.setParams({
								testName : "testSetStorableAPI_Undefined"
							});
							aUndefinedThird.setStorable(undefined);
							$A.enqueueAction(aUndefinedThird);
							$A.eventService.finishFiring();
							$A.test.addWaitFor("SUCCESS", function() {
								return aUndefinedThird.getState()
							}, function() {
								$A.test.assertTrue(aUndefinedThird.isFromStorage(),
										"aUndefinedThird should have been from storage");
								$A.test.assertEquals(1, aUndefinedThird.getReturnValue().Counter,
										"aUndefinedThird should have fetched refreshed response");
							});

						})
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
					$A.enqueueAction(aUndefined);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return aUndefined.getState()
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
					$A.enqueueAction(aUndefinedSecond);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return aUndefinedSecond.getState()
					}, function() {
						$A.test.assertTrue(aUndefinedSecond.isFromStorage(), "failed to fetch cached response");

					}, function() {
						$A.test.addWaitFor("refreshEnd", function() {
							return $A.test.getText(cmp.find("refreshEnd").getElement())
						}, function() {
							var aUndefinedThird = cmp.get("c.fetchDataRecord");
							aUndefinedThird.setParams({
								testName : "testSetStorableAPI_UndefinedProps"
							});
							aUndefinedThird.setStorable({
								"IgnoreExisting" : undefined,
								"refresh" : undefined
							});
							$A.enqueueAction(aUndefinedThird);
							$A.eventService.finishFiring();
							$A.test.addWaitFor("SUCCESS", function() {
								return aUndefinedThird.getState()
							}, function() {
								$A.test.assertTrue(aUndefinedThird.isFromStorage(),
										"aUndefinedThird should have been from storage");
								$A.test.assertEquals(1, aUndefinedThird.getReturnValue().Counter,
										"aUndefinedThird should have fetched refreshed response");
							});

						})
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
					evt.fire();
					$A.test.addWaitFor(false, $A.test.isActionPending, function() {
						$A.test.assertTrue($A.storageService.getStorage("actions").getSize() > 0,
								"Expected first action to be stored in storage service.");
						$A.test.assertEquals("StorageController", $A.test
								.getText(cmp.find("responseData").getElement()));
						$A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
						$A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
						$A.test.assertEquals("1", $A.test.getText(cmp.find("callbackCounter").getElement()));
					});
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
						return $A.test.getText(cmp.find("staticCounter").getElement())
					}, function() {
						$A.test.assertEquals("true", $A.test.getText(cmp.find("isFromStorage").getElement()));
						$A.test.assertEquals("3", $A.test.getText(cmp.find("callbackCounter").getElement()));
					});
				} ]
	},
	testUnmarkedActionAreNotStored : {
		test : [
				function(cmp) {
					cmp._testName = "testUnmarkedActionAreNotStored";
					this.resetCounter(cmp, "testUnmarkedActionAreNotStored");
					$A.test.assertEquals(0, $A.storageService.getStorage("actions").getSize());
				},
				function(cmp) {
					// Run the action without marking it as storable.
					var btn = cmp.find("ForceActionAtServer");
					var evt = btn.get("e.press");
					evt.fire();
					$A.test.addWaitFor(false, $A.test.isActionPending, function() {
						$A.test.assertEquals("StorageController", $A.test
								.getText(cmp.find("responseData").getElement()));
						$A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()),
								"Failed to inoke server action.");
						$A.test.assertEquals(0, $A.storageService.getStorage("actions").getSize(),
								"Storage service saw an increase in size.");
					});
				}, function(cmp) {
					var btn = cmp.find("ForceActionAtServer");
					var evt = btn.get("e.press");
					evt.fire();
					$A.test.addWaitFor("1", function() {
						return $A.test.getText(cmp.find("staticCounter").getElement())
					});
				} ]
	},
	/**
	 * Verify cache sweeping(expiration check). defaultExpiration settings
	 * trumps defaultAutoRefreshInterval setting
	 */
	testCacheExpiration : {
		attributes : {
			defaultExpiration : 5, // I am king
			defaultAutoRefreshInterval : 60
		// Very high but doesn't matter
		},
		test : [ function(cmp) {
			cmp.getDef().getHelper().testCacheExpirationStage1.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testCacheExpirationStage2.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testCacheExpirationStage3.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testCacheExpirationStage4.call(this, cmp);
		} ]
	},
	/**
	 * When offline, should not purge cached data.
	 * 
	 */
	testCacheDataNotPurgedWhenOffline : {
		attributes : {
			defaultExpiration : 5, // I am king
			defaultAutoRefreshInterval : 60
		// Very high but doesn't matter
		},
		test : [
				function(cmp) {
					$A.test.setTestTimeout(30000);
					this.resetCounter(cmp, "testCacheDataNotPurgedWhenOffline");
				},
				function(cmp) {
					// Run the action and mark it as storable.
					var a = cmp.get("c.fetchDataRecord");
					a.setParams({
						testName : "testCacheDataNotPurgedWhenOffline"
					});
					a.setStorable();
					$A.enqueueAction(a);
					$A.eventService.finishFiring();
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
					$A.enqueueAction(a);
					$A.eventService.finishFiring();
					$A.test.addWaitFor("SUCCESS", function() {
						return a.getState()
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
			$A.enqueueAction(a);
			$A.eventService.finishFiring();
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
			$A.enqueueAction(a);
			$A.eventService.finishFiring();
			$A.test.addWaitFor("SUCCESS", function() {
				return a.getState()
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
			cmp.getDef().getHelper().testActionKeyOverloadingStage1.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionKeyOverloadingStage2.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionKeyOverloadingStage3.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionKeyOverloadingStage4.call(this, cmp);
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
			cmp.getDef().getHelper().testActionGroupingStage1.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionGroupingStage2.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionGroupingStage3.call(this, cmp);
		}, function(cmp) {
			cmp.getDef().getHelper().testActionGroupingStage4.call(this, cmp);
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
                    $A.test.assertTrue(abortable1.isAbortable(), "Storable actions should be abortable by default.")

                    var abortable2 = cmp.get("c.string");
                    abortable2.setParams({
                            testName : "testAbortableAction_B",
                            param1 : 666
                        });
                    abortable2.setAbortable();
                    $A.test.assertFalse(abortable2.isStorable(),
                                    "The converse is not true. Abortable does not mean its storable.")
                    abortable2.setStorable();

                    // Why does abortable work only in another action's
                    // callback? Gerald?
                    var a = cmp.get("c.fetchDataRecord");
                    a.setParams({
                            testName : "testSetStorableAPI"
                        });
                    a.setCallback(cmp, function(a) {
                            $A.clientService.runActions([ abortable1 ], cmp, function() {
                                    cmp._testCounter--;
                            });
                            $A.clientService.runActions([ abortable2 ], cmp, function() {
                                    cmp._testCounter--;
                            });
                        })
                    $A.enqueueAction(a);
                    $A.eventService.finishFiring();

                    $A.test.runAfterIf(function() {
                        return cmp._testCounter == 0;
                    }, function() {
                        $A.test.assertEquals("ABORTED", abortable1.getState(), "Action was not aborted");
                        $A.test.assertEquals("SUCCESS", abortable2.getState(),
                            "Last abortable group did not complete.");
                    });
                },
                function(cmp) {
                    var abortedAction = cmp.get("c.substring");
                    abortedAction.setParams({
                            testName : "testAbortableAction_A",
                            param1 : 999
                        });
                    abortedAction.setStorable();
                    $A.enqueueAction(abortedAction);
                    $A.eventService.finishFiring();
                    $A.test.addWaitFor("SUCCESS", function() {
                            return abortedAction.getState()
                        }, function() {
                            $A.test.assertFalse(abortedAction.isFromStorage(),
                                "Aborted actions should not be stored in cache");
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
                    $A.enqueueAction(successfulAction);
                    $A.eventService.finishFiring();
                    $A.test.addWaitFor("SUCCESS", function() {
                            return successfulAction.getState()
                        }, function() {
                            $A.test.assertTrue(successfulAction.isFromStorage(), "failed to fetch action from cache");
                        });
                } ]
	},

	resetCounter : function(cmp, testName) {
            cmp.getDef().getHelper().resetCounters(cmp, testName);
	},

	/**
	 * If a refresh contains the same response as what is stored, then skip
	 * replaying the callback. The callback for the stored response is still
	 * executed.
	 */
	testRefreshResponseSameAsStored : {
            attributes : {
                defaultExpiration : 60,
                defaultAutoRefreshInterval : 0 // refresh every action
            },
            test : [function(cmp) {
                    cmp._testName = "testSkipReplayOnIdenticalRefresh";
                    this.resetCounter(cmp, "testSkipReplayOnIdenticalRefresh");
                    $A.test.addWaitFor(false, $A.test.isActionPending);
            }, function(cmp) {
                var a = $A.run(function(){
                    return cmp.getDef().getHelper()
                        .executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName},
                            function(a){a.setStorable();})
                });
                $A.test.addWaitFor("1", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())},
                    function() {
                        $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                        $A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
                        $A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(),
                            function(item){cmp._originalExpiration = item.expires});
                    });
            }, function(cmp) {
                // reset so next response will be same as first
                cmp._testName = "testSkipReplayOnIdenticalRefresh";
                this.resetCounter(cmp, "testSkipReplayOnIdenticalRefresh");
                $A.test.addWaitFor(false, $A.test.isActionPending);
            }, function(cmp) {
                var a = $A.run(function(){
                    return cmp.getDef().getHelper().executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName},
                        function(a){a.setStorable();})
                });
                $A.test.addWaitFor("2", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function() {
                    $A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
                    $A.test.assertEquals("true", $A.test.getText(cmp.find("isFromStorage").getElement()));
                    $A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){
                            if(item.expires <= cmp._originalExpiration){
                                    $A.test.fail("storage expiration was not updated after refresh");
                            }
                        });
                });
            } ]
	},

	/**
	 * If a refresh response differs from what is stored, process the callback.
	 */
	testRefreshResponseDiffersFromStore : {
		attributes : {
			defaultExpiration : 60,
			defaultAutoRefreshInterval : 0 // refresh every action
		},
		test : [function(cmp) {
				cmp._testName = "testSkipReplayOnIdenticalRefresh";
				this.resetCounter(cmp, "testSkipReplayOnIdenticalRefresh");
				$A.test.addWaitFor(false, $A.test.isActionPending);
			}, function(cmp) {
				var a = $A.run(function(){
					return cmp.getDef().getHelper().executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName}, function(a){a.setStorable();})
				});
				$A.test.addWaitFor("1", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function() {
					$A.test.assertEquals("0", $A.test.getText(cmp.find("staticCounter").getElement()));
					$A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
					$A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){cmp._originalExpiration = item.expires});
				});
			}, function(cmp) {
				// this response will be different so callback count should be +2 (for get(), then refresh())
				var a = $A.run(function(){
					return cmp.getDef().getHelper().executeAction(cmp, "c.fetchDataRecord", {testName:cmp._testName}, function(a){a.setStorable();})
				});
				$A.test.addWaitFor("3", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function() {
					$A.test.assertEquals("1", $A.test.getText(cmp.find("staticCounter").getElement()));
					$A.test.assertEquals("false", $A.test.getText(cmp.find("isFromStorage").getElement()));
					$A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){
						if(item.expires <= cmp._originalExpiration){
							$A.test.fail("storage expiration was not updated after refresh");
						}
					});
				});
			}
		]
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
					value : "anything really"
				}]
			}]
		}],
		attributes : {
			defaultExpiration : 60,
			defaultAutoRefreshInterval : 0 // refresh every action
		},
		test : [function(cmp) {
				var a = cmp.get("c.fetchDataRecord");
				a.setStorable();
				a.setCallback(cmp, function(action){
		            cmp.getDef().getHelper().findAndSetText(cmp, "callbackCounter", parseInt(cmp.find("callbackCounter").getElement().innerHTML)+1);
				});
				$A.run(function(){$A.enqueueAction(a);});
				$A.test.addWaitFor("1", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function(){
					$A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){cmp._originalExpiration = item.expires});
				});
			}, function(cmp) {
				var a = cmp.get("c.fetchDataRecord");
				a.setStorable();
				a.setCallback(cmp, function(action){
		            cmp.getDef().getHelper().findAndSetText(cmp, "callbackCounter", parseInt(cmp.find("callbackCounter").getElement().innerHTML)+1);
				});
				$A.run(function(){$A.enqueueAction(a);});
				$A.test.addWaitFor("3", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function(){
					$A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){
						$A.test.assertEquals(cmp._originalExpiration, item.expires, "stored item should not have had expiration modified");
					});
				});
			}, function(cmp) {
				var a = cmp.get("c.fetchDataRecord");
				a.setStorable();
				a.setCallback(cmp, function(action){
		            cmp.getDef().getHelper().findAndSetText(cmp, "callbackCounter", parseInt(cmp.find("callbackCounter").getElement().innerHTML)+1);
				});
				$A.run(function(){$A.enqueueAction(a);});
				$A.test.addWaitFor("4", function(){return $A.test.getText(cmp.find("callbackCounter").getElement())}, function(){
					$A.storageService.getStorage("actions").adapter.getItem(a.getStorageKey(), function(item){
						if(item.expires <= cmp._originalExpiration){
							$A.test.fail("storage expiration was not updated after refresh");
						}
					});
				});
			}
		]
	}
})
