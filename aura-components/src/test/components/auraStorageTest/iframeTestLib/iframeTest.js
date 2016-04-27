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
function iframeTest() {

    return {
        /**
         * Must match ComponentDefStorage.prototype.TRANSACTION_SENTINEL_KEY;
         * TODO W-2365447 - eliminate this and its checks when bulk remove + put is added
         */
        TRANSACTION_SENTINEL_KEY: "sentinel_key",

        /** Gets the iframe window. */
        getIframe: function() {
            return document.getElementById("myFrame").contentWindow;
        },

        /** Gets the root Aura component in the iframe. */
        getIframeRootCmp: function() {
            return this.getIframe().$A.getRoot();
        },

        /**
         * Creates, inserts and waits for an iframe to load.
         * @param {Component} cmp the component that will host the iframe
         * @param {String} url the URL to load in the iframe
         * @param {String} iframeAuraId the aura:id in cmp in which the iframe is inserted
         * @param {String} errorMsg message prefix displayed when an error occurs
         */
        loadIframe: function(cmp, url, iframeAuraId, errorMsg) {
            cmp._frameLoaded = false;
            var frame = document.createElement("iframe");
            frame.src = url;
            frame.scrolling = "auto";
            frame.id = "myFrame";
            frame.width = "100%";
            frame.height = "600";
            $A.util.on(frame, "load", function () {
                cmp._frameLoaded = true;
            });
            var content = cmp.find(iframeAuraId);
            $A.util.insertFirst(frame, content.getElement());
            this.waitForIframeLoad(cmp, errorMsg);
        },

        /**
         * Reloads the iframe.
         * @param {Component} cmp the component that will host the iframe
         * @param {Boolean} saveLogs true to save the logs before reload so they're store after load
         * @param {String} errorMsg message prefix displayed when an error occurs
         */
        reloadIframe: function(cmp, saveLogs, errorMsg) {
            cmp._frameLoaded = false;
            if (saveLogs) {
                this.getIframeRootCmp().saveLog();
            }
            this.getIframe().location.reload();
            this.waitForIframeLoad(cmp, errorMsg);
        },

        /**
         * Waits for the iframe and Aura within it to load.
         * @param {Component} cmp the component that will host the iframe
         * @param {String} errorMsg message prefix displayed when an error occurs
         */
        waitForIframeLoad: function(cmp, errorMsg) {
            var iframe = this.getIframe();
            $A.test.addWaitFor(true,
                function() {
                    return cmp._frameLoaded
                        && iframe.$A
                        && iframe.$A.finishedInit === true;
                },
                function() {
                    if (iframe.$A.util.hasClass(iframe.document.body, "auraError")) {
                        var error = iframe.$A.util.getText(iframe.$A.util.getElement("auraErrorMessage"))
                        $A.test.fail("Error during iframe load: " + errorMsg + "\n" + error);
                    }
                }
            );
        },

        /** Clears caches and logs. */
        clearCachesAndLogAndWait: function() {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.clearCachesAndLog();
            this.waitForStatus("Clearing Caches and Logs", "Cleared Caches and Logs");
        },

        /** Fetches the specified component (format is namespace:name). */
        fetchCmpAndWait: function(desc) {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.set("v.load", desc);
            iframeCmp.fetchCmp();
            this.waitForStatus("Fetching: " + desc, "Fetched: " + desc);
        },

        /** Creates the specified component (format is namespace:name) using $A.createComponentFromConfig. */
        createComponentFromConfig: function(desc) {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.set("v.load", desc);
            iframeCmp.createComponentFromConfig();
            this.waitForStatus("Creating: " + desc, "Created: " + desc);
        },

        /** Waits for a def (format is namespace:name) to be present in ComponentDefStorage, with an optional error message. */
        waitForDefInStorage : function(desc, msg) {
            var iframe = this.getIframe();
            var found = false;
            var that = this;

            function checkDefStorage(desc) {
                // short-circuit once the test times out
                if ($A.test.isComplete()) {
                    return;
                }

                iframe.$A.storageService.getStorage("ComponentDefStorage").getAll().then(function(items) {
                    items = items || [];
                    for (var i = 0; i < items.length; i++) {
                        // wait for transaction key to disappear
                        if (items[i]["key"] === that.TRANSACTION_SENTINEL_KEY) {
                            checkDefStorage(desc);
                            return;
                        }
                    }

                    for (var i = 0; i < items.length; i++) {
                        if (items[i]["key"] === "markup://" + desc) {
                            found = true;
                            return;
                        }
                    }

                    checkDefStorage(desc);
                });
            }

            checkDefStorage(desc);

            msg = msg || "Def " + desc + " never present in ComponentDefStorage";
            $A.test.addWaitForWithFailureMessage(true,
                function() { return found; },
                msg
            );
        },

        /** Waits for a def (format is namespace:name) to be absent from ComponentDefStorage, with an optional error message. */
        waitForDefRemovedFromStorage : function(desc, msg) {
            var iframe = this.getIframe();
            var removed = false;
            var that = this;

            function checkDefStorage(desc) {
                // short-circuit once the test times out
                if ($A.test.isComplete()) {
                    return;
                }


                iframe.$A.storageService.getStorage("ComponentDefStorage").getAll().then(function(items) {
                    items = items || [];
                    for (var i = 0; i < items.length; i++) {
                        // if transaction key or def is present, recurse
                        if (items[i]["key"] === that.TRANSACTION_SENTINEL_KEY || items[i]["key"] === "markup://" + desc) {
                            checkDefStorage(desc);
                            return;
                        }
                    }

                    removed = true;
                });
            }

            checkDefStorage(desc);

            msg = msg || "Def " + desc + " never removed from ComponentDefStorage";
            $A.test.addWaitForWithFailureMessage(true,
                function() { return removed; },
                msg
            );
        },

        /**
         * Waits for the iframe component to update its status. First wait for the initial message to not be present
         * anymore, then verify the expected new status is present. This pattern, as opposed to simply waiting for the
         * final message, is used to fail fast and prevent long timeouts.
         */
        waitForStatus: function(initialMessage, finalMessage) {
            var iframeCmp = this.getIframeRootCmp();
            $A.test.addWaitFor(true, function() {
                return iframeCmp.get("v.status") !== initialMessage;
            }, function() {
                var actual = iframeCmp.get("v.status");
                $A.test.assertEquals(finalMessage, actual, "Expected (" + finalMessage + ") !== Actual (" + actual + ").\n" + iframeCmp.get("v.log"));
            });
        },

        /**
         * Verifies a def (format is namespace:name) is not present in $A.context.loaded, with an optional error message.
         */
        verifyDefNotInLoaded: function(desc, msg) {
            var loaded = $A.getContext().loaded;
            var cmpDescriptor = "COMPONENT@markup://"+desc;
            msg = msg || "Def " + desc + " should not have been in Aura.context.loaded";
            $A.test.assertUndefined(loaded[cmpDescriptor], msg);
        }
    }
}
