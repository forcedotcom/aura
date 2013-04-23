({
    browsers: ['IPADCONTAINER', '-FIREFOX', '-GOOGLECHROME', '-SAFARI', '-IE7', '-IE8', '-IE9', '-IE10'],
    
    /**
     * Verify the smartstore adapter is selected for actions when auraStorage:init is used without
     * any specification.
     */
    testAdapterSelection : {
       testLabels: ['hybridContainer'],
       test : function(cmp) {
                        var storage = $A.storageService.getStorage("actions");
                        $A.test.assertTruthy(storage, "Failed to fetch named storage.");
                        $A.test.assertEquals("smartstore", storage.getName());
                }
    },
    /**
     * Verify Action.setStorable() and auto refresh
     * setStorage() accepts configuration. These configuration are helpful for follow up actions 
     * but not the first action to be stored. 
     * 
     * {ignoreExisting: "Ignore existing stored response, but cache my response after the action is complete"
     *  "refresh": "Time in seconds to override action's current storage expiration"}
     */
     testSetStorableAPI:{
        testLabels: ['hybridContainer'],
        attributes:{
            defaultExpiration : "60",
            defaultAutoRefreshInterval : "60"
        },
        test:[function(cmp) { cmp.getDef().getHelper().testSetStorableAPIStage1.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testSetStorableAPIStage2.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testSetStorableAPIStage3.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testSetStorableAPIStage4.call(this,cmp);}
        ]
    },
    /**
     * Verify cache sweeping(expiration check).
     * defaultExpiration settings trumps defaultAutoRefreshInterval setting
     */
    /**
     * TODO:Fix cache expiration for smartStore with asynch story
     * testCacheExpiration:{
     *    attributes:{
     *        defaultExpiration : 5, //I am king
     *        defaultAutoRefreshInterval : 60 //Very high but doesn't matter
     *    },
     *    testLabels: ['hybridContainer'],
     *    test:[function(cmp) { cmp.getDef().getHelper().testCacheExpirationStage1.call(this,cmp);},
     *          function(cmp) { cmp.getDef().getHelper().testCacheExpirationStage2.call(this,cmp);},
     *          function(cmp) { cmp.getDef().getHelper().testCacheExpirationStage3.call(this,cmp);},
     *          function(cmp) { cmp.getDef().getHelper().testCacheExpirationStage4.call(this,cmp);}]
     *},
     */
    /**
     * Verify stored items are overwritten with identical action keys
     */

    testActionKeyOverloading:{
        testLabels: ['hybridContainer'],
        test:[function(cmp) { cmp.getDef().getHelper().testActionKeyOverloadingStage1.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionKeyOverloadingStage2.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionKeyOverloadingStage3.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionKeyOverloadingStage4.call(this,cmp);}
        ]
    },

    /**
     * Grouping multiple actions and setting them to be storable.
     */
    testActionGrouping:{
        testLabels: ['hybridContainer'],
        attributes:{
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 60
        },
        test:[function(cmp) { cmp.getDef().getHelper().testActionGroupingStage1.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionGroupingStage2.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionGroupingStage3.call(this,cmp);},
              function(cmp) { cmp.getDef().getHelper().testActionGroupingStage4.call(this,cmp);}
        ]
    },

    resetCounter:function(cmp, testName){
        cmp.getDef().getHelper().resetCounters(cmp, testName);
    }
})
