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
                cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (first reload)");
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
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "second reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (second reload)");
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
                cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (first reload)");
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
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "second reload");
            },
            function waitForBootstrapActionInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForActionInStorage(this.BOOTSTRAP_KEY, "Bootstrap action never present in storage (second reload)");
            }
        ]
    },

    testDisablesParallelBootstrapOnNextLoadWhenFailedToLoadCsrfTokenFromStorage: {
        test: [
            function loadApplication(cmp) {
                cmp._iframeLib = cmp.helper.lib.iframeTest;
                cmp._iframeLib.loadIframe(cmp, "/bootstrapTest/bootTest.app",
                        "iframeContainer", "first load");
            },
            function enableParallelBootstrapLoad(cmp) {
                cmp._iframeLib.getIframe().$A.clientService.setParallelBootstrapLoad(true);
                cmp._iframeLib.reloadIframe(cmp, false, "first reload");
            },
            function removeCsrfTokenStorage(cmp) {
                var completed = false;
                var targetWindow = cmp._iframeLib.getIframe();
                $A.test.assertFalse(this.hasDisableBootstrapCacheCookie(targetWindow.document),
                        "[Test Setup Failed] The test expects DisableBootstrapCacheCookie is not set.");

                // Removing csrf token from storage doesn't work for the case, since csrf token from
                // server will be stored back into storage during reloading.
                // Deleting storage to let csrf token fail to be loaded from storage.
                targetWindow.$A.storageService.deleteStorage("actions")
                    .then(function() { completed = true; })
                    .catch(function(e) { $A.test.fail(e); });
                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function reloadIframe(cmp) {
                cmp._iframeLib.reloadIframe(cmp, false, "second reload");
            },
            function verifyParallelBootstrapIsDisabledOnNextLoad(cmp) {
                var targetDocument = cmp._iframeLib.getIframe().document;
                $A.test.assertTrue(this.hasDisableBootstrapCacheCookie(targetDocument),
                        "setParallel bootstrap load is not disabled");
            }
        ]
    },

    /**
     * Check if auraDisableBootstrapCache is set in cookie.
     *
     * When parallel bootstrap load is enabled, the cookie is to switch on/off bootstrap cache.
     * See AuraClientService.getParallelBootstrapLoad
     */
    hasDisableBootstrapCacheCookie: function(document) {
        return document.cookie.indexOf("auraDisableBootstrapCache=") >= 0;
    }
})
