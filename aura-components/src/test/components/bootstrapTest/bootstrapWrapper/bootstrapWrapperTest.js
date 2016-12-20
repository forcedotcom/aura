({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels: ["threadHostile"],

    // must match AuraClientService.BOOTSTRAP_KEY
    BOOTSTRAP_KEY: "$AuraClientService.bootstrap$",

    // from AuraClientService.TOKEN_KEY
    CSRF_STORAGE_KEY: "$AuraClientService.token$",

    testBootstrapMd5ConsistentAcrossReloads: {
        test: [
            function loadIframe(cmp) {
                var iframeSrc = "/bootstrapTest/bootTest.app";
                return cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (first reload)");
            },
            function captureCachedBootstrapAction(cmp) {
                var iframe = cmp.helper.lib.iframeTest.getIframe();
                var completed = false;
                iframe.$A.storageService.getStorage("actions").get(this.BOOTSTRAP_KEY)
                    .then(function(item) {
                        if (!item.md5) {
                            $A.test.fail("Expected alphanumeric md5 hash value on stored bootstrap action after first" +
                                    " reload but got [" + item.md5 + "]");
                        }
                        cmp._firstBootstrapAction = item;
                        completed = true;
                    })
                    ["catch"](function(e) { $A.test.fail("Error getting bootstrap action from storage: " + e)});
                $A.test.addWaitFor(true, function(){ return completed });
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "second reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (second reload)");
            },
            function captureCachedBootstrapActionAgain(cmp) {
                var iframe = cmp.helper.lib.iframeTest.getIframe();
                var completed = false;
                iframe.$A.storageService.getStorage("actions").get(this.BOOTSTRAP_KEY)
                    .then(function(item) {
                        if (!item.md5) {
                            $A.test.fail("Expected alphanumeric md5 hash value on stored bootstrap action after second" +
                                    " reload but got [" + item.md5 + "]");
                        }
                        cmp._secondBootstrapAction = item;
                        completed = true;
                    })
                    ["catch"](function(e) { $A.test.fail("Error getting bootstrap action from storage: " + e)});
                $A.test.addWaitFor(true, function(){ return completed });
            },
            function compareBootstrapActions(cmp) {
                $A.test.assertEquals(cmp._firstBootstrapAction.md5, cmp._secondBootstrapAction.md5);
            }
        ]
    },

    // TODO(W-3231791): Update test accordingly when work to handle md5 mismatches is complete
    testDifferentBootstrapMd5OnReload: {
        test: [
            function loadIframe(cmp) {
                var iframeSrc = "/bootstrapTest/bootTest.app";
                return cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (first reload)");
            },
            function modifyCachedBootstrapAction(cmp) {
                var that = this;
                var iframe = cmp.helper.lib.iframeTest.getIframe();
                var completed = false;
                var storage = iframe.$A.storageService.getStorage("actions");
                storage.get(this.BOOTSTRAP_KEY)
                    .then(function(item) {
                        item.md5 = "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ";
                        return storage.set(that.BOOTSTRAP_KEY, item);
                    })
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(e) { $A.test.fail("Error modifying bootstrap action in storage: " + e)});
                $A.test.addWaitFor(true, function(){ return completed });
            },
            function reloadPage(cmp) {
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "second reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (second reload)");
            }
        ]
    }
})
