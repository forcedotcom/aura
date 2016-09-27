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
         * Creates and inserts an iframe to load.
         * @param {Component} cmp the component that will host the iframe.
         * @param {String} url the URL to load in the iframe.
         * @param {String} iframeAuraId the aura:id in cmp in which the iframe is inserted.
         * @param {String} errorMsg message prefix displayed when an error occurs.
         * @return {Promise} a Promise that resolves once Aura has finished initializing inside the iframe.
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
            return this.waitForIframeLoad(cmp, errorMsg);
        },

        /**
         * Reloads the iframe.
         * @param {Component} cmp the component that will host the iframe.
         * @param {Boolean} saveLogs true to save the logs before reload so they're store after load.
         * @param {String} errorMsg message prefix displayed when an error occurs.
         * @return {Promise} a Promise that resolves once Aura has finished initializing inside the iframe.
         */
        reloadIframe: function(cmp, saveLogs, errorMsg) {
            cmp._frameLoaded = false;
            if (saveLogs) {
                this.getIframeRootCmp().saveLog();
            }
            this.getIframe().location.reload();
            return this.waitForIframeLoad(cmp, errorMsg);
        },

        /**
         * Waits for an iframe and Aura within it to load.
         * @param {Component} cmp the component that will host the iframe.
         * @param {String} errorMsg message prefix displayed when an error occurs.
         * @return {Promise} a Promise that resolves once Aura has finished initializing inside the iframe.
         */
        waitForIframeLoad: function(cmp, errorMsg) {
            var that = this;
            return new Promise(function(resolve, reject) {
                function checkIframeLoaded() {
                    var iframe = that.getIframe();
                    if ($A.test.isComplete()) {
                        reject(new Error("Test timed out"));
                    }

                    if (iframe.$A && iframe.$A.util && iframe.$A.util.hasClass(iframe.document.body, "auraError")) {
                        var error = iframe.$A.util.getText(iframe.$A.util.getElement("auraErrorMessage"));
                        reject("Error during iframe load: " + errorMsg + "\n" + error);
                    }

                    if (cmp._frameLoaded && iframe.$A && iframe.$A.finishedInit === true) {
                        resolve();
                        return;
                    }

                    // pause then recurse
                    window.setTimeout(function() { checkIframeLoaded(); }, 250);
                }

                checkIframeLoaded();
            });
        },

        /** Clears caches and logs. */
        clearCachesAndLogAndWait: function() {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.clearCachesAndLog();
            return this.waitForStatus("Clearing Caches and Logs");
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
         * @return {Promise} a Promise that resolves once client receives fetched component.
         */
        fetchCmpAndWait: function(desc) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");
            this.fetchCmp(desc);
            return this.waitForStatus("Fetching: " + desc);
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
         * @return {Promise} a promise that resolves when iframe reports component has been created
         */
        createComponentFromConfig: function(desc) {
            var iframeCmp = this.getIframeRootCmp();
            iframeCmp.set("v.load", desc);
            iframeCmp.createComponentFromConfig();
            return this.waitForStatus("Creating: " + desc);
        },

        /**
         * Waits for a def to be in storage.
         * @param {String} desc Component name, in format namespace:name.
         * @return {Promise} a promise that resolves when the def is in storage
         */
        waitForDefInStorage : function(desc) {
            var iframe = this.getIframe();
            return storageContents.waitForDefInStorage(desc, iframe);
        },

        /**
         * Waits for a def to be absent from storage.
         * @param {String} desc Component name, in format namespace:name.
         * @return {Promise} a promise that resolves when the def is in removed from storage
         */
        waitForDefRemovedFromStorage : function(desc) {
            var iframe = this.getIframe();
            return storageContents.waitForDefNotInStorage(desc, iframe);
        },

        /**
         * Waits for the iframe component to update its status.
         * @param {String} initialMessage initial message to wait for removal.
         * @return {Promise} a promise that resolves when the iframe's status has changed
         */
        waitForStatus: function(initialMessage) {
            var iframeCmp = this.getIframeRootCmp();
            return new Promise(function(resolve, reject) {
                function checkStatus() {
                    if ($A.test.isComplete()) {
                        reject(new Error("Test timed out"));
                    }

                    if (iframeCmp.get("v.status") !== initialMessage) {
                        resolve();
                        return;
                    }

                    // pause then recurse
                    window.setTimeout(function() { checkStatus(); }, 250);
                }

                checkStatus();
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
         * @return {Promise} a promise that resolves when GVPs are present in storage
         */
        waitForGvpsInStorage: function() {
            var iframe = this.getIframe();
            var storage = iframe.$A.storageService.getStorage("actions");
            return storageContents.waitForKeyInStorage(storage, "globalValueProviders");
        },

        /**
         * Waits for an action to be present in the actions store.
         * @param {String} key action descriptor.
         * @return {Promise} a promise that resolves when action is present in storage
         */
        waitForActionInStorage: function(key) {
            var iframe = this.getIframe();
            return storageContents.waitForActionInStorage(key, false, iframe);
        }
    };
}
