({
    /**
     * Important note about the asynchronous nature of these tests:
     * 
     * Although individual tests have been written in a very readable way, you may notice that most tests are broken into separate functions.  
     * This is because of the asynchronous nature of the SmartStoreAdapter.  Many of the operations are asynchronous and require that we
     * break out of the current execution context in order to be invoked.  Breaking up the tests into separate functions and making
     * appropriate calls to $A.test.addWaitFor(...) allows us to work in this asynchronous environment.
     * 
     * Tests Not Included:
     * - size boundaries of key/values: According to the Sqlite docs (http://sqlite.org/limits.html#max_length) the max length
     *   is dependent on a compile time parameter. Unfortunately, i could not find specific info for ios or android, but
     *   I believe it's safe to assume that these are large enough to hold our keys and objects. to be 100% sure we would need
     *   to have tests running on the devices
     */
	//we have a white-list of browsers('GOOGLECHROME', 'SAFARI') in this test because we only support webkit browser for smart store adapter.the smart store is only accessible via our mobile SDK. 
	browsers: ['GOOGLECHROME', 'SAFARI'],
    setUp:function(cmp){
        this.adapter = new $A.storageService.createAdapter("smartstore", "test");
        this.setItemCallCounter = 0;
        this.removeItemCallCounter = 0;
        
        // store references to some functions for the purpose of restoring mocks later
        this.overrides = [];
    },
    tearDown:function(cmp){
        // restore any references to mocked functions that might not have been restored due to test error
        for(var i = 0; i < this.overrides.length; i++){
            this.overrides[i].restore();
        }
    },
    /**
     * Test status when the storage is empty.
     */
    testEmpty:{
        test:
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize(), "empty adapter has a non-zero size");
                this.assertNumItems(this.adapter, 0);
                this.assertGetUndefinedOrNull(this.adapter, "the key");
        }
    },
    /**
     * Test basic set and get of a non-Object item.  It should fail fast.
     */
    testSetAndGetNonObject:{
        test:[
            function(cmp){
                try{
                    // we don't support this 
                    this.setAndWaitForItem(this.adapter, "the key", "the value");
                    $A.test.fail("Expected exception not thrown.");
                } catch(err) {
                    // expect an error here
                    $A.test.assertEquals("Item is not an object", err, "Did not get expected error.");
                }
            }]
    },
    /**
     * Test basic set and get of a undefined item.  It should fail fast.
     */
    testSetAndGetUndefined:{
        test:[
            function(cmp){
                try{
                    // we don't support this 
                    this.setAndWaitForItem(this.adapter, "the key", undefined);
                    $A.test.fail("Expected exception not thrown.");
                } catch(err) {
                    // expect an error here
                    $A.test.assertEquals("Item is not an object", err, "Did not get expected error.");
                }
            }]
    },    
    /**
     * Test basic set and get of a null item.  It should fail fast.
     */
    testSetAndGetNull:{
        test:[
            function(cmp){
                try{
                    // we don't support this 
                    this.setAndWaitForItem(this.adapter, "the key", null);
                    $A.test.fail("Expected exception not thrown.");
                } catch(err) {
                    // expect an error here
                    $A.test.assertEquals("Item is not an object", err, "Did not get expected error.");
                }
            }]
    },    
    /**
     * Test basic set and get where the value is an Object.
     */
    testSetAndGet:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "a key", {"value":{"oh":"hey", "I":{"am":"an", "object":"what"}}});
            },
            function(cmp){
                $A.test.assertTrue(this.adapter.getSize() > 0, "size did not increase");
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "a key", {"value":{"oh":"hey", "I":{"am":"an", "object":"what"}}});
            }]
    },
    /**
     * Test that only "well-known" properties are returned in getItem() calls.
     */
    testSetAndGetWellKnownProperties:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "a key", {
                            "value": "v",
                            "created": "c",
                            "something": "s",
                            "expires": "e"
                        });
            },
            function(cmp){
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "a key", {
                    "value": "v",
                    "created": "c",
                    "expires": "e"
                });
            }]
    },
    /**
     * Test basic set and get of an item when using the same key.
     */
    testSetAndGetSameKey:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "key1", {"value":{"oh":"hey"}});
            },
            function(cmp){
                cmp.originalSize = this.adapter.getSize();
                // must wait for first setItem operation to finish before attempting to 
                // execute this second one.
                this.setAndWaitForItem(this.adapter, "key1", {"value":{"hello":"there"}});
            },
            function(cmp){
                $A.test.assertTrue(cmp.originalSize != this.adapter.getSize(), "size did not change");
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "key1", {"value":{"hello":"there"}});
            },
            function(cmp){
                // reset to original value
                this.setAndWaitForItem(this.adapter, "key1", {"value":{"oh":"hey"}});
            },
            function(cmp){
                // ensure size is being properly adjusted and not just being constantly augmented.
                $A.test.assertEquals(cmp.originalSize, this.adapter.getSize(), "size is not same as original");
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "key1", {"value":{"oh":"hey"}});
            }]
    },
    /**
     * Test get of non-existing key when storage is non-empty
     */
    testGetKeyDoesNotExist:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "key1", {"oh":"hey"});
            },
            function(cmp){
                this.assertGetUndefinedOrNull(this.adapter, "key2");
            }]
    },
    /**
     * Test set and get with multiple entries in storage.
     */
    testSetAndGetMultiple:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "key1", {"value":{"oh":"hey"}});
                this.setItem(this.adapter, "key2", {"value":{"good":"bye"}});
                this.setItem(this.adapter, "key3", {"value":{"memory":"bad"}});
                this.waitForSetItems();
            },
            function(cmp){
                this.setAndWaitForItem(this.adapter, "key2", {"value":{"good":"overriden bye"}});
            },
            function(cmp){
                this.assertNumItems(this.adapter, 3);
                this.assertGet(this.adapter, "key1", {"value":{"oh":"hey"}});
                this.assertGet(this.adapter, "key2", {"value":{"good":"overriden bye"}});
                this.assertGet(this.adapter, "key3", {"value":{"memory":"bad"}});
            },
            function(cmp) {
                this.setAndWaitForItem(this.adapter, "key3", {"value":{"memory": "overridden"}});
            },
            function(cmp) {
                this.assertNumItems(this.adapter, 3);
                this.assertGet(this.adapter, "key3", {"value":{"memory":"overridden"}});
            }
        ]
    },
    /**
     * Tests the key-sanitization logic.
     */
    testSetAndGetWithSimilarKeys:{
        test:[
            function(cmp){
                // use something that approximates a real-life scenario.
                // action keys are of the form java://some.package.ClassName/Action$operation
                this.setItem(this.adapter, "j://o.a.i.j.c.A/A$f", {"value": "value1"});
                this.setItem(this.adapter, "j://o.a.i.j.c.A/Af", {"value": "value2"});
                this.setItem(this.adapter, "j:/o.a.i.j.c.A/A$f", {"value": "value3"});
                this.setItem(this.adapter, "j://oai.j.c.A/A$f", {"value": "value4"});
                this.setItem(this.adapter, "j//o.a.i.j.c.A/A$f", {"value": "value5"});
                this.waitForSetItems();
            },
            function(cmp){
                this.assertGetUndefinedOrNull(this.adapter, "joaijcAAf");
                this.assertGet(this.adapter, "j://o.a.i.j.c.A/A$f", {"value": "value1"});
                this.assertGet(this.adapter, "j://o.a.i.j.c.A/Af", {"value": "value2"});
                this.assertGet(this.adapter, "j:/o.a.i.j.c.A/A$f", {"value": "value3"});
                this.assertGet(this.adapter, "j://oai.j.c.A/A$f", {"value": "value4"});
                this.assertGet(this.adapter, "j//o.a.i.j.c.A/A$f", {"value": "value5"});
            }
        ]
    },
    /**
     * The SmartStoreAdapter encodes the key, and adds special logic to include the '.' char
     * This tests adds coverage for 
     * -non-Latin characters (永田)
     * -special connecting chars eg: '‿'
     * -underscore (which is not encoded with javascript encode)
     * Note: we should run these on the devices too
     */
    testEncodingKeyWithSpecialChars:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "test永田", {"value": "key non latin"});
                this.setItem(this.adapter, "test‿", {"value": "key connecting"});
                this.setItem(this.adapter, "test_", {"value": "key underscore"});
                this.waitForSetItems();
            },
            function(cmp){
                this.assertGet(this.adapter, "test永田", {"value": "key non latin"});
                this.assertGet(this.adapter, "test‿",  {"value": "key connecting"});
                this.assertGet(this.adapter, "test_",  {"value": "key underscore"});
            }]
    },    
    /**
     * Similar to the key test, but for values we don't special encode anything, so no need to test '_'
     */
    testValuesWithSpecialChars:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "test non latin", {"value": "key永田"});
                this.setItem(this.adapter, "test connecting", {"value": "key‿"});
                this.waitForSetItems();
            },
            function(cmp){
                this.assertGet(this.adapter, "test non latin", {"value": "key永田"});
                this.assertGet(this.adapter, "test connecting",  {"value": "key‿"});
            }]
    },    
    testRemoveItem:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "the key", {"the": "value"});
            },
            function(cmp){
                this.removeAndWaitForItem(this.adapter, "the key");
            },
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize());
                this.assertGetUndefinedOrNull(this.adapter, "the key");
                this.assertNumItems(this.adapter, 0);
            }]
    },
    testRemoveItemDoesNotExist:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "the key", {"value":{"the": "value"}});
            },
            function(cmp){
                this.removeAndWaitForItem(this.adapter, "not the key");
            },
            function(cmp){
                this.assertNumItems(this.adapter, 1);
                this.assertGetUndefinedOrNull(this.adapter, "not the key");
                this.assertGet(this.adapter, "the key", {"value":{"the": "value"}});
            }]
    },
    testRemoveMultipleItems:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "key1", {"value":{"the": "value1"}});
                this.setItem(this.adapter, "key2", {"value":{"the": "value2"}}),
                this.setAndWaitForItem(this.adapter, "key3", {"value":{"the": "value3"}});
            },
            function(cmp){
                this.removeItem(this.adapter, "key3");
                this.removeAndWaitForItem(this.adapter, "key1");
            },
            function(cmp){
                this.assertNumItems(this.adapter, 1);
                this.assertGetUndefinedOrNull(this.adapter, "key1");
                this.assertGet(this.adapter, "key2", {"value":{"the": "value2"}});
                this.assertGetUndefinedOrNull(this.adapter, "key3");
            }]
    },
    testRemoveThenSetItem:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "the key", {"value":{"the": "value"}});
            },
            function(cmp){
                this.removeAndWaitForItem(this.adapter, "the key");
            },
            function(cmp){
                this.setAndWaitForItem(this.adapter, "the key", {"value":{"another":"value"}});
            },
            function(cmp){
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "the key", {"value":{"another":"value"}});
            }]
    },
    /**
     * The Storage interface doesn't define a return value for remove. so we just make sure things don't explode
     */
    testRemoveItemWhenEmpty:{
        test:[
            function(cmp){
                this.removeAndWaitForItem(this.adapter, "the key");
            },
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize());
                this.assertGetUndefinedOrNull(this.adapter, "the key");
                this.assertNumItems(this.adapter, 0);
            }]
    },
    /**
     * Test constructor when the storage is not empty.
     */
    testNewConstructorIsNotClear:{
        test:[
            function(cmp){
                    this.setAndWaitForItem(this.adapter, "key1", {"value":{"oh":"hey"}});
            },
            function(cmp){
                this.assertNumItems(this.adapter, 1, "SetItem should have set 1 item");
            },
            function(cmp){
                this.adapter = new $A.storageService.createAdapter("smartstore", "test");
                this.assertGet(this.adapter, "key1", {"value":{"oh":"hey"}});
            }
        ]
    },
    /**
     * Test clear when the storage is already empty.
     */
    testClearWhenEmpty:{
        test:[
            function(cmp){
                this.clear(this.adapter);
            },
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize(), "cleared storage is not empty");
                this.assertNumItems(this.adapter, 0);
            }
        ]
    },
    /**
     * Test clear
     */
    testClear:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "key1", {"oh":"hey"});
                this.setItem(this.adapter, "key_a", {"oh":"no"});
                this.waitForSetItems();
            },
            function(cmp){
                // sanity
                this.assertNumItems(this.adapter, 2);
            },
            function(cmp){
                // clear
                this.clear(this.adapter);
            },
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize(), "cleared storage is not empty");
                this.assertNumItems(this.adapter, 0);
                this.assertGetUndefinedOrNull(this.adapter, "key1");
                this.assertGetUndefinedOrNull(this.adapter, "key_a");
            }
        ]
    },
    /**
     * It's not clear when 'clear' will be invoked during user interactions. But whenever it is,
     * we should be able to store items afterward
     * 
     */
    testClearAndSet:{
        test:[
            function(cmp){
                this.setItem(this.adapter, "key1", {"oh":"hey"});
                this.setItem(this.adapter, "key_a", {"oh":"no"});
                this.waitForSetItems();
            },
            function(cmp){
                this.clear(this.adapter);
            },
            function(cmp){
                this.setAndWaitForItem(this.adapter, "afterkey1", {"value":"clear"});
            },            
            function(cmp){
                this.assertNumItems(this.adapter, 1);
                this.assertGet(this.adapter, "afterkey1",{"value":"clear"});
            }
        ]
    },
    testClearMultipleTimes:{
        test:[
            function(cmp){
                this.setAndWaitForItem(this.adapter, "key1", {"oh":"hey"});
            },
            function(cmp){
                this.clear(this.adapter);
                this.clear(this.adapter);
            },
            function(cmp){
                $A.test.assertEquals(0, this.adapter.getSize(), "cleared storage is not empty");
                this.assertNumItems(this.adapter, 0);
                this.assertGetUndefinedOrNull(this.adapter, "key1");
            }
        ]
    },
    
    /**
     * The name used when creating a SmartStoreAdapter should map to a dedicated soup.
     * Hence, when writing objects with the same key to adapters with different names, they should
     * be stored in different soups and thus not overwrite each other and both be accessible by the 
     * appropriate adapter.
     */
    testMultiAdapterSetItem:{
        test:[
            function(cmp){
            	this._adapters = {
                    test: new $A.storageService.createAdapter("smartstore", "test"),
                    test2: new $A.storageService.createAdapter("smartstore", "test2")
            	}
            	
            	// Write key1 to two adapters with different names:
                this.setAndWaitForItem(this._adapters.test, "key1", {"value":"in test"});
                this.setAndWaitForItem(this._adapters.test2, "key1", {"value":"in test2"});
            },
            
            function(cmp){
            	// Both values written in the previous step should be accessible from
            	// their respective adapters even though they have the same key.
                this.assertGet(this._adapters.test, "key1", {"value":"in test"});
                this.assertGet(this._adapters.test2, "key1", {"value":"in test2"});
            },
            
            function(cmp) {
            	// Test overwriting values for multiple soups works:
            	this.setAndWaitForItem(this._adapters.test, "key1", {"value":"in test updated"});
                this.setAndWaitForItem(this._adapters.test2, "key1", {"value":"in test2 updated"});
            }, 
            
            function(cmp){
            	// Both values updated in the previous step should be accessible from
            	// their respective adapters even though they have the same key.
                this.assertGet(this._adapters.test, "key1", {"value":"in test updated"});
                this.assertGet(this._adapters.test2, "key1", {"value":"in test2 updated"});
            },
        ]
    },
    
    /**
     * When writing objects with the same key to adapters with different names, they should
     * be removed individually and not across soups.
     */
    testMultiAdapterRemoveItem:{
        test:[
            function(cmp){
            	this._adapters = {
                    test: new $A.storageService.createAdapter("smartstore", "test"),
                    test2: new $A.storageService.createAdapter("smartstore", "test2")
            	}
            	
            	// Write key1 to two adapters with different names:
                this.setAndWaitForItem(this._adapters.test, "key1", {"value":"in test"});
                this.setAndWaitForItem(this._adapters.test2, "key1", {"value":"in test2"});
            },
            
            function(cmp){
            	// Remove key1 from the test adapter:
            	this.removeAndWaitForItem(this._adapters.test, "key1");
            },
            
            function(cmp){
            	// Test had key1 removed, test2 should be unaffected:
                this.assertGetUndefinedOrNull(this._adapters.test, "key1");
                this.assertGet(this._adapters.test2, "key1", {"value":"in test2"});
            },
            
            function(cmp){
            	// Remove the item from the test2 adapter:
            	this.removeAndWaitForItem(this._adapters.test2, "key1");
            },
            
            function(cmp){
            	// Both adapters should now have nothing for key1:
                this.assertGetUndefinedOrNull(this._adapters.test, "key1");
                this.assertGetUndefinedOrNull(this._adapters.test2, "key1");
            }
        ]
    },
    
    /**
     * When writing objects with the same key to adapters with different names, clearing a single adapter should
     * only affect it's soup and not the soup
     */
    testMultiAdapterClear:{
        test:[
            function(cmp){
            	this._adapters = {
                    test: new $A.storageService.createAdapter("smartstore", "test"),
                    test2: new $A.storageService.createAdapter("smartstore", "test2")
            	}
            	
            	// Write key1 to two adapters with different names:
                this.setAndWaitForItem(this._adapters.test, "key1", {"value":"in test"});
                this.setAndWaitForItem(this._adapters.test2, "key1", {"value":"in test2"});
            },
            
            function(cmp){
            	// clear the test adapter:
            	this.clear(this._adapters.test);
            },
            
            function(cmp){
            	// The test adapters has been cleared, it should have no items:
                this.assertNumItems(this._adapters.test, 0);
                this.assertNumItems(this._adapters.test2, 1);
            },
            
            function(cmp){
            	// Clear the test2 adapter:
            	this.clear(this._adapters.test2);
            },
            
            function(cmp){
            	// Both adapters are now empty:
                this.assertNumItems(this._adapters.test, 0);
                this.assertNumItems(this._adapters.test2, 0);
            }
        ]
    },
    
    /**
     * When writing objects with the same key to adapters with different names, getting the number of items should
     * correspond to the specific adapter.
     */
    testMultiAdapterCounting:{
        test:[
            function(cmp){
            	this._adapters = {
                    test: new $A.storageService.createAdapter("smartstore", "test"),
                    test2: new $A.storageService.createAdapter("smartstore", "test2")
            	}
            	
            	// Write 2 items to the test adapter:
                this.setAndWaitForItem(this._adapters.test, "key1", {"value":"in test"});
                this.setAndWaitForItem(this._adapters.test, "key2", {"value2":"in test"});
            },
            
            function(cmp){
            	// Counts the items in the adapters:
            	this.assertNumItems(this._adapters.test, 2);
            	this.assertNumItems(this._adapters.test2, 0);
            },
            
            function(cmp){
            	// Add items to just test2
                this.setAndWaitForItem(this._adapters.test2, "key1", {"value":"in test2"});
                this.setAndWaitForItem(this._adapters.test2, "key2", {"value2":"in test2"});
                this.setAndWaitForItem(this._adapters.test2, "key3", {"value3":"in test2"});
            },
            
            function(cmp){
            	// Counts the items in the adapters:
            	this.assertNumItems(this._adapters.test, 2);
            	this.assertNumItems(this._adapters.test2, 3);
            }
        ]
    },

    /**
     * Test that getExpired does not return an item that is in the future.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testGetExpiredReturnsNoItems:{
        test:[
            function(cmp){
                //set expiration date for way in the future
                   this.setAndWaitForItem(this.adapter, "key1", {"expires": new Date().getTime() + new Date().getTime() });
            },
            function(cmp){
                this.assertGetExpired(this.adapter, []);
            }
        ]
    },
    */
    /**
     * Test that getExpired returns an item that is expired.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testGetExpired:{
        test:[
            function(cmp){
                   this.setAndWaitForItem(this.adapter, "key1", {"expires": new Date().getTime() - 1000 });
            },
            function(cmp){
                var expected = ["key1"];
                this.assertGetExpired(this.adapter, expected);
            }
        ]
    },
    */
    /**
     * Test that getExpired returns an item that is expired.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testGetExpiredSpecialCharactersInKey:{
        test:[
            function(cmp){
                   this.setAndWaitForItem(this.adapter, "key1.{}$%()", {"expires": new Date().getTime() - 1000 });
            },
            function(cmp){
                var expected = ["key1.{}$%()"];
                this.assertGetExpired(this.adapter, expected);
            }
        ]
    },
    */

    /**
     * Test behaviour of getExpired with many expired and not-expired items.
     * The set of expired items is large enough to exercise the underlying iterator and its handling
     * of multiple pages.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testGetExpiredManyItems:{
        test:[
            function(cmp){
                var numExpiredItems = this.adapter.QUERY_PAGE_SIZE * 2 + 3;
                var numOtherItems = 10;

                for(var i = 0; i < numExpiredItems; i++){
                    this.setAndWaitForItem(this.adapter, "key" + i, {"expires": new Date().getTime() - 1000});
                }
                for(var j = numExpiredItems; j < numExpiredItems + numOtherItems; j++){
                    this.setAndWaitForItem(this.adapter, "key" + j, {"expires": new Date().getTime() + 100000});
                }
            },
            function(cmp){
                var numExpiredItems = this.adapter.QUERY_PAGE_SIZE * 2 + 3;
                var numOtherItems = 10;
                
                this.assertNumItems(this.adapter, numExpiredItems + numOtherItems);
                var expected = [];
                for(var i = 0; i < numExpiredItems; i++){
                    expected.push("key" + i);
                }
                this.assertGetExpired(this.adapter, expected);
            }
        ]
    },
    */
    
    /**
     * Test behaviour of getExpired (and getNumItems) when dealing with cursor borders.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testGetExpiredCursorBorder:{
        test:[
            function(cmp){
                var numExpiredItems = this.adapter.QUERY_PAGE_SIZE * 2;

                for(var i = 0; i < numExpiredItems; i++){
                    this.setAndWaitForItem(this.adapter, "key" + i, {"expires": new Date(1000).getTime() - 1000});
                }
            },
            function(cmp){
                var numExpiredItems = this.adapter.QUERY_PAGE_SIZE * 2;
                
                this.assertNumItems(this.adapter, numExpiredItems);
                var expected = [];
                for(var i = 0; i < numExpiredItems; i++){
                    expected.push("key" + i);
                }
                this.assertGetExpired(this.adapter, expected);
            }
        ]
    },
    */
    
    /**
     * Test handling of all non-fatal error scenarios in the interaction between the SmartStoreAdapter and the SmartStore.
     * The SmartStore is mocked out for each test.
     */
    testErrorHandling:{
        test:[
            function(cmp){
                // run one operation to ensure SmartStoreAdapter has been properly initialized
                this.setAndWaitForItem(this.adapter, "a_key_to_remove", {"value": {"original":"value"}});
            },
            function(cmp){
                this.mockQuerySoupError();
                this.assertSetItemFailure(
            		this.adapter, 
            		"key", 
            		{"value": {"new":"value"}}, 
            		"Error in setItem on call to SmartStore.querySoup: querySoup Mock Error"
        		);
            },
            function(cmp){
                this.mockUpsertSoupEntriesWithExternalIdError();
                this.assertSetItemFailure(
            		this.adapter, 
            		"key", 
            		{"value": {"new":"value"}}, 
            		"Error in setItem on call to SmartStore.upsertSoupEntriesWithExternalId: upsertSoupEntriesWithExternalId Mock Error"
        		);
            },
            function(cmp){
                this.mockQuerySoupError();
                this.assertGetItemFailure(
            		this.adapter, 
            		"key", 
            		"Error in getItem on call to SmartStore.querySoup: querySoup Mock Error"
        		);
            },
            function(cmp){
                this.mockQuerySoupError();
                this.assertRemoveItemFailure(
            		this.adapter, 
            		"a_key_to_remove", 
            		"Error in removeItem on call to SmartStore.querySoup: querySoup Mock Error"
        		);
            },
            function(cmp){
                this.mockRemoveFromSoupError();
                this.assertRemoveItemFailure(
            		this.adapter, 
            		"a_key_to_remove", 
            		"Error in removeItem on call to SmartStore.removeFromSoup: removeFromSoup Mock Error"
        		);
            },
            function(cmp){
                this.mockRemoveSoupError();
                this.assertClearFailure(
            		this.adapter, 
            		"Error in clear on call to SmartStore.removeSoup: removeSoup Mock Error"
        		);
            },
            /* TODO: Uncomment and fix after getExpired is properly fixed. */
            /*
            function(cmp){
                this.mockQuerySoupError();
                this.assertGetExpiredFailure(this.adapter, "Error in getExpired on call to SmartStore.querySoup: querySoup Mock Error");
            },
            */
            function(cmp){
                // despite all the errors, we can still do operations afterwards if the smartstore is behaving properly
                this.assertGet(this.adapter, "a_key_to_remove", {"value": {"original":"value"}});
            }
        ]
    },
    /**
     * Test the case where cursor moves generate errors.  This test is separated simply from the other
     * error handling tests because it requires a bit more setup.
     */
    /* TODO: Uncomment and fix after getExpired is properly fixed. */
    /*
    testErrorOnGetExpiredCursorMove:{
        test:[
            function(cmp){
                // put enough expired items into the store to require a cursor move.
                var numExpiredItems = this.adapter.QUERY_PAGE_SIZE + 1;

                for(var i = 0; i < numExpiredItems; i++){
                    this.setAndWaitForItem(this.adapter, "key" + i, {"expires": new Date().getTime() - 1000});
                }
            },
            function(cmp){
                this.mockMoveCursorToNextPageError();
                this.assertGetExpiredFailure(this.adapter, "Error in getExpired on call to SmartStore.moveCursorToNextPage: moveCursorToNextPage Mock Error");
            }
        ]
    },
    */
    /**
     * Test the special error scenario where the clear fails when attempting to re-register the soup.
     * This puts the app in a weird state so all other operations fail fast.
     */
    testErrorOnClearRegisterSoup:{
        test:[
            function(cmp){
                // perform some operation to ensure setup is bypassed
                this.assertGetUndefinedOrNull(this.adapter, "key");
            },
            function(cmp){
                this.mockRegisterSoupError();
                this.assertClearFailure(
            		this.adapter, 
            		"Error in clear on call to SmartStore.registerSoup: registerSoup Mock Error"
        		);
            },
            function(cmp){
                // subsequent calls to SmartStoreAdapter operations should fail fast
                this.assertSetItemFailure(
            		this.adapter, 
            		"key", 
            		{"value": {"oh":"my"}}, 
            		"SmartStoreAdapter was improperly cleared."
        		);
                this.assertGetItemFailure(this.adapter, "key", "SmartStoreAdapter was improperly cleared.");
                this.assertRemoveItemFailure(this.adapter, "a key", "SmartStoreAdapter was improperly cleared.");
                this.assertClearFailure(this.adapter, "SmartStoreAdapter was improperly cleared.");
                /* TODO: Uncomment and fix after getExpired is properly fixed. */
//                this.assertGetExpiredFailure(this.adapter, "SmartStoreAdapter was improperly cleared.");
            }
        ]
    },
    /**
     * Test handling of error on setup.
     * All subsequent operations should fail fast.
     */
    testErrorOnSetup:{
        test:[
            function(cmp){
                // a failure in setup is considered a fatal error.
                this.mockRegisterSoupError();
                // load the adapter after registerSoup error mocked
                this.adapter = new $A.storageService.createAdapter("smartstore", "test");
                
                this.assertSetItemFailure(
            		this.adapter, 
            		"key", 
            		{"value": {"oh":"my"}}, 
            		"SmartStoreAdapter was not properly initialized."
        		);

                // subsequent calls to SmartStoreAdapter operations should fail fast
                this.assertSetItemFailure(
            		this.adapter, 
            		"key", 
            		{"value": {"oh":"my"}}, 
            		"SmartStoreAdapter was not properly initialized."
        		);
                this.assertGetItemFailure(this.adapter, "key", "SmartStoreAdapter was not properly initialized.");
                this.assertRemoveItemFailure(this.adapter, "a key", "SmartStoreAdapter was not properly initialized.");
                this.assertClearFailure(this.adapter, "SmartStoreAdapter was not properly initialized.");
                /* TODO: Uncomment and fix after getExpired is properly fixed. */
//                this.assertGetExpiredFailure(this.adapter, "SmartStoreAdapter was not properly initialized.");
            }
        ]
    },
    
    //    
    // Assertion Methods
    //
    
    /**
     * Assert the number of items in the store.
     * An asynchronous call is issued and the result checked in the callback.
     */
    assertNumItems:function(adapter, expected){
        this.getAndWaitForNumItems(
            adapter,
            function(result) {
                $A.test.assertEquals(expected, result, "unexpected number of items");
            }
        );
    },
    /**
     * Assert the item retrieved in a getItem() call.
     * An asynchronous call is issued and the result checked in the callback.
     */
    assertGet:function(adapter, key, expected){
        var that = this;
        this.getAndWaitForItem(
    		adapter,
    		key,
            function(result) {
                    that.assertObjectEquals(expected, result, "Object value for " + key + " incorrect");
            }
		);
    },
    /**
     * Assert an item retrieved in a getItem() call is undefined or null.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertGetUndefinedOrNull:function(adapter, key){
        this.getAndWaitForItem(
    		adapter,
    		key,
            function(result) {
                $A.test.assertUndefinedOrNull(result, "Null or undefined value for " + key + " incorrect");
            }
		);
    },
    /**
     * Assert the results of a getExpired call.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertGetExpired:function(adapter, expected){
        var that = this;
        this.getAndWaitForExpired(
    		adapter,
            function(result) {
                var expectedAsJson = $A.util.json.encode(expected);
                var resultAsJson = $A.util.json.encode(result);
                var errorMessageSuffix = "expected [" + expectedAsJson + "], result [" + resultAsJson + "]";
                // we can't do a straight-up Array comparison because we can't guarantee the order of items returned
                $A.test.assertEquals(expected.length, result.length, "Unexpected number of expired items: " + errorMessageSuffix);
                for(var i in expected){
                    var foundItem = false;
                    for(var j in result){
                        if(expected[i] === result[j]){
                            foundItem = true;
                        }
                    }
                    if(foundItem === false){
                        $A.test.fail("Did not find expected item " + expected[i] + ": " + errorMessageSuffix);
                    }
                }
            }
		);
    },
    /**
     * Assert that an operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertOperationFailure:function(operation, expectedFailureMessage){
        var unexpectedSuccess = false;
        var failure = false;
        var failureMessage;
        
        // run a first operation, it should fail
        operation(
            function() {
                unexpectedSuccess = true;
            },
            function(err) {
                failure = true;
                failureMessage = err;
            }
        );
        
        // wait either for success or failure
        $A.test.addWaitFor(true,
            function() {
                return unexpectedSuccess || failure;
            },
            function() {
                // verify it was a failure
                $A.test.assertFalse(unexpectedSuccess, "The operation was unexpectedly successful");
                $A.test.assertTrue(failure, "The operation did not fail");
                $A.test.assertEquals(expectedFailureMessage, failureMessage, "Did not get the expected error message");
            }
        );
    },
    /**
     * Assert that the setItem operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertSetItemFailure:function(adapter, key, value, expectedFailureMessage){
        this.assertOperationFailure(
            function(successCallback, errorCallback) {
                adapter.setItem(key, value, successCallback, errorCallback);
            }, 
            expectedFailureMessage
        );
    },
    /**
     * Assert that the getItem operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertGetItemFailure:function(adapter, key, expectedFailureMessage){
        this.assertOperationFailure(
            function(successCallback, errorCallback) {
                adapter.getItem(key, successCallback, errorCallback);
            }, 
            expectedFailureMessage
        );
    },
    /**
     * Assert that the removeItem operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertRemoveItemFailure:function(adapter, key, expectedFailureMessage){
        this.assertOperationFailure(
            function(successCallback, errorCallback) {
                adapter.removeItem(key, successCallback, errorCallback);
            }, 
            expectedFailureMessage
        );
    },
    /**
     * Assert that the clear operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertClearFailure:function(adapter, expectedFailureMessage){
        this.assertOperationFailure(
            function(successCallback, errorCallback) {
                adapter.clear(successCallback, errorCallback);
            }, 
            expectedFailureMessage
        );
    },
    /**
     * Assert that the getExpired operation fails.
     * An asynchronous call is issued and the result checked in a callback.
     */
    assertGetExpiredFailure:function(adapter, expectedFailureMessage){
        this.assertOperationFailure(
            function(successCallback, errorCallback) {
                adapter.getExpired(successCallback, errorCallback);
            }, 
            expectedFailureMessage
        );
    },
    
    //
    // SmartStore operation helpers.
    //
    
    /**
     * A convenience method for the setItem() call.  The call is asynchronous.  It should be followed by
     * a waitForSetItems() or setAndWaitForItem() call as well.  The calling test subfunction must terminate for
     * the operation to complete.
     */
    setItem:function(adapter, key, value){
    	this.setItemCallCounter++;
        var that = this;
        adapter.setItem(
            key,
            value,
            function() {
                that.setItemCallCounter--; 
            },
            function(err) {
                $A.test.fail("Error on setItem: " + err);
            }
        );
    },
    
    /**
     * Indicate to the test framework to wait for all outstanding setItem calls to complete.
     * The wait is performed after the current subfunction terminates.
     */
    waitForSetItems:function(){
        var that = this;
        $A.test.addWaitFor(
            true, 
            function() {
                return (that.setItemCallCounter === 0); 
            }
        );
    },
    /**
     * A convenience method for one setItem() call and one waitForSetItems() call.
     */
    setAndWaitForItem:function(adapter, key, value){
        this.setItem(adapter, key, value);
        this.waitForSetItems();
    },
    
    /**
     * A convenience method for the getItem() call.  The call is asynchronous.
     * The function accepts a callback in a parameter, which can be used to inspect or assert the result.
     * The calling test subfunction must terminate for the operation to complete.
     */
    getAndWaitForItem:function(adapter, key, callback){
    	var getItemComplete = false;
        var getItemResult = null;
        // invoke the getItem call asynchronously
        adapter.getItem(
            key, 
            function(result) {
                getItemComplete = true; 
                getItemResult = result;
            },
            function(err) {
                $A.test.fail("Error on getItem: " + err);
            }
        
        );
        // notify the test that it must wait for the result of the async call
        // and delegate the result to the callback
        $A.test.addWaitFor(
            true, 
            function() {
                return getItemComplete; 
            }, 
            function() {
                callback(getItemResult);
            }
        );
    },

    /**
     * A convenience method for the removeItem() call for the tests adapter.  The call is asynchronous.  
     * It should be followed by a waitForRemoveItems() or removeAndWaitForItem() call.  
     * The calling test subfunction must terminate for the operation to complete.
     */
    removeItem:function(adapter, key){
        this.removeItemCallCounter++;
        var that = this;
        // invoke the removeItem call asynchronously
        adapter.removeItem(key,
            function() {
                that.removeItemCallCounter--;
            },
            function(err) {
                $A.test.fail("Error on removeItem: " + err);
            }
        );
    },
    /**
     * Indicate to the test framework to wait for all outstanding removeItem calls to complete.  
     * The wait is performed after the current subfunction terminates.
     */
    waitForRemoveItems:function(){
        var that = this;
        $A.test.addWaitFor(
            true, 
            function() {
                return (that.removeItemCallCounter === 0); 
            }
        );
    },
    /**
     * A convenience method for one removeItem() call and one waitForRemoveItems() call.
     */
    removeAndWaitForItem:function(adapter, key){
        this.removeItem(adapter, key);
        this.waitForRemoveItems();
    },
    
    /**
     * A convenience method for the getExpired() call.  The call is asynchronous.
     * The function accepts a callback in a parameter, which can be used to inspect or assert the result.
     * The calling test subfunction must terminate for the operation to complete.
     */
    getAndWaitForExpired:function(adapter, callback){
        var getExpiredComplete = false;
        var getExpiredResult = undefined;
        adapter.getExpired(
            function(result) {
                getExpiredComplete = true;
                getExpiredResult = result;
            },
            function(err) {
                $A.test.fail("Error on getExpired: " + err);
            }
        );
        
        $A.test.addWaitFor(
            true,
            function() {
                return getExpiredComplete;
            },
            function() {
                callback(getExpiredResult);
            }
        );
    },

    /**
     * A convenience method for the getNumItems() call.  The call is asynchronous.
     * The function accepts a callback in a parameter, which can be used to inspect or assert the result.
     * The calling test subfunction must terminate for the operation to complete.
     */
    getAndWaitForNumItems:function(adapter, callback){
        var getNumItemsComplete = false;
        var getNumItemsResult = undefined;
        // invoke the getNumItems call asynchronously
        adapter.getNumItems(
            function(result) {
                getNumItemsComplete = true;
                getNumItemsResult = result;
            },
            function(err) {
                $A.test.fail("Error on getNumItems: " + err);
            }
        );
        // notify the test that it must wait for the result of the async call
        // and delegate the result to the callback
        $A.test.addWaitFor(
            true,
            function() {
                return getNumItemsComplete;
            },
            function() {
                callback(getNumItemsResult);
            }
        );
    },
    /**
     * A convenience method for the clear() call.  The call is asynchronous.
     * The calling test subfunction must terminate for the operation to complete.
     */
    clear:function(adapter){
        var clearComplete = false;
        // invoke the clear call asynchronously
        adapter.clear(
            function(){
                clearComplete = true;
            },
            function(err) {
                $A.test.fail("Error on clear" + err);
            }
        );
        // notify the test that it must wait for the result of the clear call
        $A.test.addWaitFor(
            true,
            function() {
                return clearComplete;
            }
        );
    },
    /**
     * A convenience method to determine if two objects are rougly structurally equal from a 
     * JSON perspective.  Admittedly this method is not perfect (it doesn't differentiate 
     * boolean true from string "true", for instance)
     */
    assertObjectEquals:function(expected, actual, assertMessage){
        // first ensure that we actually have objects here
        $A.test.assertTrue($A.util.isObject(expected), "expected is not an Object");
        $A.test.assertTrue($A.util.isObject(actual), "actual is not an Object");
        $A.test.assertEquals(
            $A.util.json.encode(expected),
            $A.util.json.encode(actual),
            assertMessage
        );
    },
    /**
     * A convenience method to determine if two arrays are rougly equal from a JSON perspective.
     * Admittedly this method is not perfect (it doesn't differentiate boolean true from string 
     * "true", for instance).
     */
    assertArrayEquals:function(expected, actual, assertMessage){
        // first ensure that we actually have arrays here
        $A.test.assertTrue($A.util.isArray(expected), "expected is not an Array");
        $A.test.assertTrue($A.util.isArray(actual), "actual is not an Array");
        $A.test.assertEquals(
            $A.util.json.encode(expected),
            $A.util.json.encode(actual),
            assertMessage
        );
    },
    
    
    //
    // Mock-related operations
    //

    /**
     * Get the SmartStore singleton. Handy for mocking operations.
     */
    getSmartStore:function(){
        if($A.util.isUndefinedOrNull(this.smartstore)){
            this.smartstore = cordova["require"]("salesforce/plugin/smartstore");
        }
        return this.smartstore;
    },
    /**
     * Replace a SmartStore method on the singleton with a mock.  The original method is
     * restored automatically after the current subtest, even if a fatal error happens
     * during the subtest.
     */
    mockSmartStoreMethod:function(methodNameToMock, replacement){
        // override the specified SmartStore method
        var override = $A.test.overrideFunction(
            this.getSmartStore(), 
            methodNameToMock,
            replacement
        );
        // keep as to-be-restored in case this test fails and we can't restore it ourselves
        this.overrides.push(override);

        // want to restore the method after the existing subtest 
        // to clean up for any subtests and tests that come next
        var that = this;
        $A.test.addWaitFor(
            true,
            function() {
                return true;
            },
            function() {
                override.restore();
                this.overrides.shift();
            }
        );
    },
    /**
     * Replace SmartStore.querySoup with a mock that invokes the error callback.
     */
    mockQuerySoupError:function(){
        this.mockSmartStoreMethod( 
            "querySoup",
            function(soupName, querySpec, successCallback, errorCallback){
                errorCallback("querySoup Mock Error");
            }
        );
    },
    /**
     * Replace SmartStore.upsertSoupEntriesWithExternalIdError with a mock that invokes the error callback.
     */
    mockUpsertSoupEntriesWithExternalIdError:function(){
        this.mockSmartStoreMethod( 
            "upsertSoupEntriesWithExternalId",
            function(soupName, entriesToUpsert, externalId, successCallback, errorCallback){
                errorCallback("upsertSoupEntriesWithExternalId Mock Error");
            }
        );
    },
    /**
     * Replace SmartStore.removeFromSoup with a mock that invokes the error callback.
     */
    mockRemoveFromSoupError:function(){
        this.mockSmartStoreMethod(
            "removeFromSoup",
            function(soupName, id, successCallback, errorCallback){
                errorCallback("removeFromSoup Mock Error");
            }
        );
    },
    /**
     * Replace SmartStore.registerSoup with a mock that invokes the error callback.
     */
    mockRegisterSoupError:function(){
        this.mockSmartStoreMethod(
            "registerSoup",
            function(soupName, indeces, successCallback, errorCallback){
                errorCallback("registerSoup Mock Error");
            }
        );
    },
    /**
     * Replace SmartStore.removeSoup with a mock that invokes the error callback.
     */
    mockRemoveSoupError:function(){
        this.mockSmartStoreMethod(
            "removeSoup",
            function(soupName, successCallback, errorCallback){
                errorCallback("removeSoup Mock Error");
            }
        );
    },
    /**
     * Replace SmartStore.querySoup with a mock that invokes the error callback.
     */
    mockMoveCursorToNextPageError:function(){
        this.mockSmartStoreMethod( 
            "moveCursorToNextPage",
            function(cursor, successCallback, errorCallback){
                errorCallback("moveCursorToNextPage Mock Error");
            }
        );
    }
})