({
    resetCounters:function(cmp, _testName){
        var a = cmp.get('c.resetCounter');
        a.setParams({
            testName: _testName
        }),
        a.setExclusive();
        a.runAfter(a);
    },
    executeAction:function(cmp, actionName, actionParam, additionalProperties){
        var a = cmp.get(actionName);
        if(actionParam) a.setParams(actionParam);
        a.setCallback(cmp, function(a){
            var returnValue = a.getReturnValue();
            cmp.getDef().getHelper().findAndSetText(cmp, "staticCounter", returnValue.Counter); 
            cmp.getDef().getHelper().findAndSetText(cmp, "responseData", returnValue.Data);
            cmp.getDef().getHelper().findAndSetText(cmp, "isFromStorage", a.isFromStorage());
        });
        if(additionalProperties){
            additionalProperties(a);
        }
        a.runAfter(a);
    },
    findAndSetText:function(cmp, targetCmpId, msg){
        cmp.find(targetCmpId).getElement().innerHTML = msg;
    },
    
    // The sequential stages of testSetStorableAPI
    testSetStorableAPIStage1:function(cmp){
        $A.test.setTestTimeout(30000);
        this.resetCounter(cmp, "testSetStorableAPI");
    },
    testSetStorableAPIStage2:function(cmp){
        var mycmp = cmp;
            //Run the action and mark it as storable.
        var a = cmp.get("c.fetchDataRecord");
        a.setParams({testName : "testSetStorableAPI"});
        a.setStorable();
        a.runAfter(a);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, 
            $A.test.isActionPending,
            function(){
                    $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                $A.test.assertEquals(0, a.getReturnValue().Counter, "Wrong counter value seen in response");
                //Set response stored time
                mycmp._requestStoredTime = new Date().getTime();
            });
    },
    testSetStorableAPIStage3:function(cmp){//Test case 1: No refresh Override, default is 60 seconds
            var mycmp = cmp;
        var aSecond = cmp.get("c.fetchDataRecord");
        aSecond.setParams({testName : "testSetStorableAPI"});
        aSecond.setStorable();
        aSecond.runAfter(aSecond);
        $A.eventService.finishFiring();
        $A.test.addWaitFor("SUCCESS", 
            function(){return aSecond.getState()},
            function(){
                var refreshBeginCmp = mycmp.find("refreshBegin");
                if($A.util.isUndefinedOrNull (refreshBeginCmp)) {
                refreshBeginCmp = mycmp.getSuper().find("refreshBegin");
                }
                var refreshEndCmp = mycmp.find("refreshEnd");
                if($A.util.isUndefinedOrNull (refreshEndCmp)) {
                refreshEndCmp = mycmp.getSuper().find("refreshEnd");
                }
                $A.test.assertEquals(0, aSecond.getReturnValue().Counter, "aSecond response invalid.");
                $A.test.assertTrue(aSecond.isFromStorage(), "failed to fetch cached response");
                $A.test.assertEquals("", $A.test.getText(refreshBeginCmp.getElement()), "refreshBegin fired unexpectedly");
                $A.test.assertEquals("", $A.test.getText(refreshEndCmp.getElement()), "refreshEnd fired unexpectedly");
            });
    },
    testSetStorableAPIStage4:function(cmp){
        //Test case 2: Override auto refresh time, default is 60 seconds
        var block = cmp.get("c.block");
        block.setParams({testName : "testSetStorableAPI"});
        $A.test.callServerAction(block, true);
        var requestTime;
        //Wait till the block action is executed
        $A.test.addWaitFor(false, $A.test.isActionPending,
            function(){
                var aThird = cmp.get("c.fetchDataRecord");
                aThird.setParams({testName : "testSetStorableAPI"});
                //Keeping the auto refresh time to 0, helps testing the override
                aThird.setStorable({"refresh": 0});
                aThird.runAfter(aThird);
                requestTime = new Date().getTime();
                //Make sure we haven't reached the autorefresh timeout already. Default is set to 60, so 30 is quite conservative
                $A.test.assertTrue( ((requestTime-cmp._requestStoredTime)/1000<30), "Test setup failure, increase defaultAutoRefreshInterval time.");
                $A.eventService.finishFiring();
                $A.test.addWaitFor("SUCCESS", 
                    function(){return aThird.getState()},
                    function(){
                        $A.test.assertTrue(aThird.isFromStorage(), "failed to fetch cached response");
                    });
            });
        //Verify that refreshBegin was fired
        $A.test.addWaitFor("refreshBegin", 
            function(){
                var refreshBeginCmp = cmp.find("refreshBegin");
                if($A.util.isUndefinedOrNull (refreshBeginCmp)) {
                    refreshBeginCmp = cmp.getSuper().find("refreshBegin");
                }
                return $A.test.getText(refreshBeginCmp.getElement());
            },
            function(){
                var refreshTime = new Date().getTime();
                //Verify that the refresh begin event kicked off
                $A.test.assertTrue( ((refreshTime-requestTime)/1000)< 5 );
                //resume controller only after refreshBegin
                var resume = cmp.get("c.resume");
                resume.setParams({testName : "testSetStorableAPI"});
                $A.test.callServerAction(resume, true);
            });
        //Verify that refreshEnd was fired
        $A.test.addWaitFor("refreshEnd", 
            function(){
                    var refreshEndCmp = cmp.find("refreshEnd");
                    if($A.util.isUndefinedOrNull (refreshEndCmp)) {
                        refreshEndCmp = cmp.getSuper().find("refreshEnd");
                    }
                    return $A.test.getText(refreshEndCmp.getElement())
            },
            function(){
                var aFourth = cmp.get("c.fetchDataRecord");
                aFourth.setParams({testName : "testSetStorableAPI"});
                aFourth.setStorable();
                aFourth.runAfter(aFourth);
                $A.eventService.finishFiring();
                $A.test.addWaitFor("SUCCESS", 
                    function(){return aFourth.getState()},
                    function(){
                        $A.test.assertTrue(aFourth.isFromStorage(), 
                            "aFourth should have been from storage");
                        $A.test.assertEquals(1, aFourth.getReturnValue().Counter, 
                            "aFourth should have fetched refreshed response");
                        });
            });
    },
    
    // The sequential stages of testCacheExpiration
    testCacheExpirationStage1:function(cmp){
        $A.test.setTestTimeout(30000);
        this.resetCounter(cmp, "testCacheExpiration");
    },
    testCacheExpirationStage2:function(cmp){
        //Run the action and mark it as storable.
        var a = cmp.get("c.fetchDataRecord");
        a.setParams({testName : "testCacheExpiration"});
        a.setStorable();
        a.runAfter(a);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, 
            $A.test.isActionPending,
            function(){
                $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                $A.test.assertEquals(0, a.getReturnValue().Counter, "Wrong counter value seen in response");
            });
    },
    testCacheExpirationStage3:function(cmp){
        //Wait for atleast 5 seconds after the response has been stored
        $A.test.addWaitFor(true, 
            function(){ 
                var now = new Date().getTime();
                var storageModifiedCmp = cmp.find("storageModified");
                if($A.util.isUndefinedOrNull(storageModifiedCmp)) {
                    storageModifiedCmp = cmp.getSuper().find("storageModified");
                }                    
                var storageModified = $A.test.getText(storageModifiedCmp.getElement());
                return ((now - parseInt(storageModified))/1000) > 5;
            });
    },
    testCacheExpirationStage4:function(cmp){
        //Run the action and verify that new response was fetched from server
        var aSecond = cmp.get("c.fetchDataRecord");
        aSecond.setParams({testName : "testCacheExpiration"});
        aSecond.setStorable();
        aSecond.runAfter(aSecond);
        $A.eventService.finishFiring();
        $A.test.addWaitFor("SUCCESS", 
            function(){return aSecond.getState()},
            function(){
                $A.test.assertEquals(1, aSecond.getReturnValue().Counter, "aSecond response invalid.");
                $A.test.assertFalse(aSecond.isFromStorage(), "expected cache expiration");
            });
    },
    
    // The sequential stages of testActionKeyOverloading
    testActionKeyOverloadingStage1:function(cmp){
        $A.test.setTestTimeout(30000);
        this.resetCounter(cmp, "testActionKeyOverloading");
    },
    testActionKeyOverloadingStage2:function(cmp){
        var a = cmp.get("c.substring");
        a.setParams({testName : "testActionKeyOverloading", param1 : 999});
        a.setStorable();
        a.runAfter(a);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, $A.test.isActionPending,
            function(){
                $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                $A.test.assertEquals(0, a.getReturnValue()[0], "Wrong counter value seen in response");
                $A.test.assertEquals(999, a.getReturnValue()[1]);
            });
    },
    testActionKeyOverloadingStage3:function(cmp){
        //Controller name is a substring of previous controller
        var a = cmp.get("c.string");
        a.setParams({testName : "testActionKeyOverloading", param1 : 999});
        a.setStorable();
        a.runAfter(a);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, $A.test.isActionPending,
            function(){
                $A.test.assertFalse(a.isFromStorage(), "should not have fetched from cache");
                $A.test.assertEquals(1, a.getReturnValue()[0], "Wrong counter value seen in response");
                $A.test.assertEquals(999, a.getReturnValue()[1]);
            });
    },
    testActionKeyOverloadingStage4:function(cmp){
        //Controller name is the same as previous controller but different parameter value
        var a = cmp.get("c.string");
        a.setParams({testName : "testActionKeyOverloading", param1 : 9999});
        a.setStorable();
        a.runAfter(a);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, $A.test.isActionPending,
            function(){
                $A.test.assertFalse(a.isFromStorage(), "Failed to excute action at server");
                $A.test.assertEquals(2, a.getReturnValue()[0], "Wrong counter value seen in response");
                $A.test.assertEquals(9999, a.getReturnValue()[1]);
            });
    },    
    
    // The sequential stages of testActionGrouping
    testActionGroupingStage1:function(cmp){
        $A.test.setTestTimeout(30000);
        this.resetCounter(cmp, "testActionGrouping_A");
        this.resetCounter(cmp, "testActionGrouping_B");
        this.resetCounter(cmp, "testActionGrouping_notStored");
    },
    testActionGroupingStage2:function(cmp){
        //2 Stored actions
        var a1 = cmp.get("c.substring");
        a1.setParams({testName : "testActionGrouping_A", param1 : 999});
        a1.setStorable();
        a1.runAfter(a1);
        var b1 = cmp.get("c.string");
        b1.setParams({testName : "testActionGrouping_B", param1 : 666});
        b1.setStorable();
        b1.runAfter(b1);
        //1 Unstored action
        var notStored = cmp.get("c.fetchDataRecord");
        notStored.setParams({testName : "testActionGrouping_notStored"});
        notStored.runAfter(notStored);
        $A.eventService.finishFiring();
        $A.test.addWaitFor(false, $A.test.isActionPending);
    },
    testActionGroupingStage3:function(cmp){
        //Run a action whose response has been previously stored
        var a2 = cmp.get("c.substring");
        a2.setParams({testName : "testActionGrouping_A", param1 : 999});
        a2.setStorable();
        a2.runAfter(a2);
        $A.eventService.finishFiring();
        $A.test.addWaitFor("SUCCESS", function(){return a2.getState()},
            function(){
                $A.log($A.storageService.getStorage("actions"));
                $A.test.assertTrue(a2.isFromStorage(), "Failed to fetch action from storage");
                $A.test.assertEquals(0, a2.getReturnValue()[0], "Wrong counter value seen in response");
                $A.test.assertEquals(999, a2.getReturnValue()[1]);
            });
    },
    testActionGroupingStage4:function(cmp){
            //Run a action whose response has been previously stored
        var b2 = cmp.get("c.string");
        b2.setParams({testName : "testActionGrouping_B", param1 : 666});
        b2.setStorable();
        b2.runAfter(b2);
        //Run a action which was previously not marked to be stored and group it with the one above
        var notStoredAgain = cmp.get("c.fetchDataRecord");
        notStoredAgain.setParams({testName : "testActionGrouping_notStored"});
        notStoredAgain.runAfter(notStoredAgain);
        $A.eventService.finishFiring();
        $A.test.addWaitFor("SUCCESS", function(){return b2.getState()},
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
    }
})