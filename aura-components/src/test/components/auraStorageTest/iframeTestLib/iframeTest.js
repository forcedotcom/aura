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
function iframeTest(storageContents) {

    return {
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
         * @param {Component} cmp the component that will host the iframe.
         * @param {String} url the URL to load in the iframe.
         * @param {String} iframeAuraId the aura:id in cmp in which the iframe is inserted.
         * @param {String} errorMsg message prefix displayed when an error occurs.
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
         * @param {Component} cmp the component that will host the iframe.
         * @param {Boolean} saveLogs true to save the logs before reload so they're store after load.
         * @param {String} errorMsg message prefix displayed when an error occurs.
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
         * Waits for an iframe and Aura within it to load.
         * @param {Component} cmp the component that will host the iframe.
         * @param {String} errorMsg message prefix displayed when an error occurs.
         */
        waitForIframeLoad: function(cmp, errorMsg) {
            var iframe = this.getIframe();
            $A.test.addWaitFor(true,
                function() {
                    return cmp._frameLoaded &&
                        iframe.$A &&
                        iframe.$A.finishedInit === true;
                },
                function() {
                    if (iframe.$A.util.hasClass(iframe.document.body, "auraError")) {
                        var error = iframe.$A.util.getText(iframe.$A.util.getElement("auraErrorMessage"));
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

        /**
         * Initiates fetching a component. Does not wait for fetch or storage to complete.
         * @param {String} desc Component name, in format namespace:name.
         */
        fetchCmp: function(desc) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.set("v.load", desc);
            iframeCmp.fetchCmp();
        },

        /**
         * Fetches a component and waits for the client to receive it. Does not wait for the
         * component def to be stored.
         * @param {String} desc Component name, in format namespace:name.
         */
        fetchCmpAndWait: function(desc) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");
            this.fetchCmp(desc);
            this.waitForStatus("Fetching: " + desc, "Fetched: " + desc);
        },

        /**
         * Fetches a component and waits for component to be stored in storage.
         * @param {String} desc Component name, in format namespace:name.
         * @return {Promise} a promise that resolves when the component is placed in storage.
         */
        fetchCmpAndWaitAsPromise: function(desc) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            var that = this;
            return new Promise(function(resolve) {
                    that.fetchCmp(desc);
                    resolve(desc);
                })
                .then(function(desc) {
                    var iframe = that.getIframe();
                    return storageContents.waitForDefInStorage(desc, iframe);
                });
        },

        /**
         * Gets whether a def is in storage.
         * @param {String} desc Component name, in format namespace:name.
         * @return {Promise} a promise that resolves with whether the def is in storage.
         */
        checkDefInStorage: function(desc) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            var iframe = this.getIframe();
            return storageContents.isDefInStorage(desc, iframe);
        },

        /**
         * Creates a component using $A.createComponentFromConfig.
         * @param {String} desc Component name, in format namespace:name.
         */
        createComponentFromConfig: function(desc) {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.set("v.load", desc);
            iframeCmp.createComponentFromConfig();
            this.waitForStatus("Creating: " + desc, "Created: " + desc);
        },

        /**
         * Waits for a def to be in storage.
         * @param {String} desc Component name, in format namespace:name.
         * @param {String=} msg error message.
         */
        waitForDefInStorage : function(desc, msg) {
            var iframe = this.getIframe();
            var found = false;
            storageContents.waitForDefInStorage(desc, iframe)
                .then(
                    function() {
                        found = true;
                    },
                    function(e) {
                        $A.test.fail("waitForDefInStorage(" + desc + ") failed: " + e);
                    }
                );

            $A.test.addWaitForWithFailureMessage(
                true,
                function() { return found; },
                msg || "Def " + desc + " never present in ComponentDefStorage"
            );
        },

        /**
         * Waits for a def to be absent from storage.
         * @param {String} desc Component name, in format namespace:name.
         * @param {String=} msg error message.
         */
        waitForDefRemovedFromStorage : function(desc, msg) {
            var iframe = this.getIframe();
            var found = false;
            storageContents.waitForDefNotInStorage(desc, iframe)
                .then(
                    function() {
                        found = true;
                    },
                    function(e) {
                        $A.test.fail("waitForDefInStorage(" + desc + ") failed: " + e);
                    }
                );

            $A.test.addWaitForWithFailureMessage(
                true,
                function() { return found; },
                msg || "Def " + desc + " never removed from ComponentDefStorage"
            );
        },

        /**
         * Waits for the iframe component to update its status. First wait for the initial message to not be present
         * anymore, then verify the expected new status is present. This pattern, as opposed to simply waiting for the
         * final message, is used to fail fast and prevent long timeouts.
         * @param {String} initialMessage initial message to wait for removal.
         * @param {String} finalMessage expected message after initial message is removed.
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
        },

        /**
         * Global value providers (GVP) are stored in the actions storage. On bootstrap we only load component defs from
         * storage if we find GVPs in storage. Thus, it may be necessary to wait for GVPs to be stored before reloading
         * if we are counting on defs being restored from storage on load.
         */
        waitForGvpsInStorage: function() {
            var iframe = this.getIframe();
            var storage = iframe.$A.storageService.getStorage("actions");
            var found = false;
            storageContents.waitForKeyInStorage(storage, "globalValueProviders", iframe)
                .then(
                    function() {
                        found = true;
                    },
                    function(e) {
                        $A.test.fail("waitForGvpsInStorage() failed: " + e);
                    }
                );

            $A.test.addWaitForWithFailureMessage(
                true,
                function() { return found; },
                "GVPs never persisted to actions store"
            );
        },

        /**
         * Waits for an action to be present in the actions store.
         * @param {String} key action descriptor.
         * @param {String=} msg error message.
         */
        waitForActionInStorage : function(key, msg) {
            var iframe = this.getIframe();
            var found = false;
            storageContents.waitForActionInStorage(key, false, iframe)
                .then(
                    function() {
                        found = true;
                    },
                    function(e) {
                        $A.test.fail("waitForActionInStorage(" + key + ") failed: " + e);
                    }
                );

            $A.test.addWaitForWithFailureMessage(
                true,
                function() { return found; },
                msg || "Action " + key + " never present in action store"
            );
        }
    };
}
