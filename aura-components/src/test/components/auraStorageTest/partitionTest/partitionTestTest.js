({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],
    
    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],
    
    setUp: function (cmp) {
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;
        cmp._appName = "/auraStorageTest/partitionTest.cmp?";
    },

    tearDown: function(cmp) {
        cmp._iframeLib.getIframeRootCmp().deleteStorage();
    },

    addItemAndGetStorage: function(cmp) {
        var iframeCmp = cmp._iframeLib.getIframeRootCmp();
        iframeCmp.addItemToStorage();
        return cmp._iframeLib.waitForStatus("Adding")
        .then(function () {
            iframeCmp.getAdapterFromStorage();
            return cmp._iframeLib.waitForStatus("Getting");
        })
        .catch(function (error) {
            $A.test.fail(error.toString());
        });
    },

    /**
     * Verify indexedDB is scoped by partitionName if partitionName is set
     */
    testIndexedDBWithoutPartition: {
        test: [
            function loadCmpInIframe(cmp) {
                var that = this;
                var frameSrc = cmp._appName.concat("storageItemValue=value");
                return cmp._iframeLib.loadIframe(cmp, frameSrc, "iframeContainer", "first load")
                .then( function() {
                    return that.addItemAndGetStorage(cmp);
                })
                .then (function() {
                    cmp._itemWithoutPartition = cmp._iframeLib.getIframeRootCmp().get("v.item");
                    cmp._objectStoreNames = cmp._iframeLib.getIframeRootCmp().get("v.objectStoreNames")
                })
                .catch(function (error) {
                    $A.test.fail(error.toString());
                });
            },
            function verifyStorages(cmp) {
                $A.test.assertEquals("value", cmp._itemWithoutPartition,
                    "Unexpected value within storage without partition");
                $A.test.assertEquals("auraStorageTest:partitionTest", cmp._objectStoreNames[0],
                    "Unexpected object store name for storage without partition");
            }
        ]
    },

    testIndexedDBScopedByPartitionName: {
        test: [
            function loadCmpInIframeWithPartition(cmp) {
                var that = this;
                var frameSrc = cmp._appName.concat("partitionName=partition", "&storageItemValue=valuePartition");
                return cmp._iframeLib.loadIframe(cmp, frameSrc, "iframeContainer", "second load")
                .then( function (){
                    return that.addItemAndGetStorage(cmp);
                })
                .then( function() {
                    cmp._itemWithPartition = cmp._iframeLib.getIframeRootCmp().get("v.item");
                    cmp._objectStoreNames = cmp._iframeLib.getIframeRootCmp().get("v.objectStoreNames")
                })
                .catch(function (error) {
                    $A.test.fail(error.toString());
                });
            },
            function verifyStorages(cmp) {
                $A.test.assertEquals("valuePartition", cmp._itemWithPartition,
                    "Unexpected value within storage with partition");
                $A.test.assertEquals("partition", cmp._objectStoreNames[0],
                    "Unexpected object store name for storage with partition");
            } 
        ]
    }
})
