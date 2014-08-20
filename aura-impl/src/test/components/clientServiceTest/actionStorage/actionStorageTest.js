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
    /** IE & FIREFOX are excluded:The tests try to send out a request to other domains http://invalid.salesforce.com, 
     * IE and Firefox block it by default
     */
    browsers:["GOOGLECHROME","SAFARI"],
    
    /**
     * Sets up the test, caching the component, setting the action storages expiry time and creating an action for
     * testing.
     */
    setUp: function(component) {
        // Store a reference to the component to facilitate the use of the test's helpers. 
        this._component = component;
        this._expiryTime = 10000;
        this._action = component.get("c.getString");
        this._action.setParams({
            param: "TEST_STRING"
        });
        this._action.setStorable(true);
        this._actionDescriptor = "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString";
        this._actionParams = this._action.getParams();
    },
    
    /**
     * Tests to ensure the isInStorage method returns true when an action is being stored.
     */
    testIsInStorage: {
        test : [function(component) {
            this.prepareAction();
        }, function(component) {
            var cacheChecked = false;

            // this._action has been sent and received and should be in storage:
            $A.clientService.isActionInStorage(this._actionDescriptor, this._actionParams, function(isInStorage) {
                $A.test.assertTrue(isInStorage, "Action should be found in storage.");
                cacheChecked = true;
            });
            
            $A.test.addWaitFor(true, function() {
                return cacheChecked;
            });
        }, function(component) {
            var cacheChecked = false;
            
            // The unknown action should not be in storage, ensure isInStorage returns false for it:
            $A.clientService.isActionInStorage("nonexistent", {param: "none"}, function(isInStorage) {
                $A.test.assertFalse(isInStorage, "Non-existent action should not be found in storage.");
                cacheChecked = true;
            });
            
            $A.test.addWaitFor(true, function() {
                return cacheChecked;
            });
        }]
    },
    
    /**
     * Tests to ensure that the errorHandler parameter passed into an action's storableConfig will be invoked
     * when there is an error being added to storage.
     */
    testErrorHandlerHook: {
        test : [function(component) {
            var errorHandled = null;
            var action = component.get("c.getString");
            this._actionParams = action.getParams();
            //actionStorage.app set maxSize to 10, that will give us 10240 bytes, tooLarge has size 40414 after this
            var tooLarge = new Array(10000).join("!");
            
            action.setParams({ param: tooLarge });
            
            action.setStorable({
                errorHandler: function(error) {
                    errorHandled = error;
                }
            });
            
            $A.run(function() {
                $A.enqueueAction(action);
            });
            
            $A.test.addWaitForWithFailureMessage(
                true,
                function() { return errorHandled!=null; },
                "error handler didn't get called",
                function() {
                    $A.test.assertEquals(
                    "MemoryStorageAdapter.setItem() cannot store an item over the maxSize",
                    errorHandled);
                }
            );
         },
        function(component) {
            var actionIsInStorage = null;//init actionIsInStorage to null, make sure it's not at the end of the test
            $A.clientService.isActionInStorage(this._actionDescriptor,this._actionParams,
                    function(isInStorage) {//this call back could be async, depends on the storage
                    actionIsInStorage = isInStorage;
                    $A.test.assertFalse(isInStorage, "Action with error should not be found in storage");
                    }
            );
            
            //because the isActionInStorage's callback could be async, we need to make sure it did get called before test end
            $A.test.addWaitForWithFailureMessage(true,
                function() { return actionIsInStorage!=null; },
                "callback of isActionInStorage did not get run"
            );
        }]
    },
    
    /**
     * Tests to ensure that invalidating an action correctly removes it from storage:
     */
    testInvalidate: {
        test : [function(component) {
            this.prepareAction();
        }, function(component) {
            var isInvalidated = false;
            
            // Invalidate the action:
            $A.clientService.invalidateAction(this._actionDescriptor, this._actionParams);
            
            // Keep checking to see if the action is in storage, set isInvalidated to true as soon as we find its no 
            // longer present:
            function check() {
                $A.clientService.isActionInStorage(this._actionDescriptor, this._actionParams, function(isInStorage) {
                    if (isInStorage) {
                        check(); // not present yet, try again:
                    } else {
                        isInvalidated = true;
                    }
                });            
            }
            
            // start recursing:
            check();
            
            // Wait for the action to be removed from cache:
            $A.test.addWaitFor(true, function() {
                return isInvalidated;
            });
        }]
    },
    
    /**
     * Tests to ensure that revalidate property sets the expiry time of cached actions: 
     */
    testRevalidate: {
        test : [function(component) {
            this.prepareAction();
        }, function(component) {
            var expiryTime = this._expiryTime,
                expiryChecked = false;
            
            // The action is in cache assert that the difference between the time it expires and the time it was added
            // is the expiry time:
            var adapter = this._action.getStorage().adapter;

            adapter.getItem(this._action.getStorageKey())
                .then(function(item) {
                    $A.test.assertEquals(expiryTime, item.expires - item.created, "Expiry time not set properly.");
                    expiryChecked = true;
                });
            
            $A.test.addWaitFor(true, function() { return expiryChecked; });
        }, function(component) {
            var expiryTime = this._expiryTime,
                action = this._action,
                expiryChecked = false;

            // Revalidate the action and when complete, get the time it expires and ensure that it is expiryTime
            // millis after the revalidation time.
            $A.clientService.revalidateAction(this._actionDescriptor, this._actionParams, function() {
                var revalidateTime = new Date().getTime();

                var adapter = action.getStorage().adapter;
                adapter.getItem(action.getStorageKey())
                    .then(function(item) {

                        $A.test.assertTrue(
                            item.expires - revalidateTime - expiryTime <= 1,
                            "Revalidate time mismatch. Expected: ~" + expiryTime + ", received: " + (item.expires - revalidateTime)
                        );

                        expiryChecked = true;
                    });
            });
            
            $A.test.addWaitFor(true, function() {
                return expiryChecked;
            });
        }]
    },
    
    /**
     * Fires this._action and waits for the server's response.
     */
    prepareAction: function(component) {
        var actionReceived = false,
            action = this._action;
        
        action.setCallback(this._component, function() {
            actionReceived = true;
        });
        
        $A.run(function() {
            $A.enqueueAction(action);
        });
        
        $A.test.addWaitFor(true, function() {
            return actionReceived;
        });
    }
})