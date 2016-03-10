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
        /** Gets the iframe window. */
        getIframe: function() {
            return document.getElementById("myFrame").contentWindow;
        },

        /** Gets the root Aura component in the iframe. */
        getIframeRootCmp: function() {
            return this.getIframe().$A.getRoot();
        },

        /** Creates a new iframe and insert into DOM at component containing the provided aura:id. */
        loadIframe: function(cmp, src, iframeAuraId) {
            cmp._frameLoaded = false;
            var frame = document.createElement("iframe");
            frame.src = src;
            frame.scrolling = "auto";
            frame.id = "myFrame";
            frame.width = "100%";
            frame.height = "600";
            $A.util.on(frame, "load", function () {
                cmp._frameLoaded = true;
            });
            var content = cmp.find(iframeAuraId);
            $A.util.insertFirst(frame, content.getElement());
            this.waitForIframeLoad(cmp);
        },

        /** Reloads the iframe, optionally saving the logs before reload so they're restored on load. */
        reloadIframe: function(cmp, saveLogs) {
            cmp._frameLoaded = false;
            if (saveLogs) {
                this.getIframeRootCmp().saveLog();
            }
            this.getIframe().location.reload();
            this.waitForIframeLoad(cmp);
        },

        /** Waits for the iframe and Aura within it to load. */
        waitForIframeLoad: function(cmp) {
            var iframe = this.getIframe();
            $A.test.addWaitFor(true, function() {
                return cmp._frameLoaded
                    && iframe.$A
                    && iframe.$A.finishedInit === true;
            });
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

        /** Verifies a def (format is namespace:name) is present or missing in ComponentDefStorage, with an optional error message. */
        verifyDefStorage : function(desc, present, msg) {
            var iframe = this.getIframe();
            var iframeCmp = this.getIframeRootCmp();

            // use a map so multiple search can concurrently happen
            iframe.defContained = iframe.defContained || {};
            iframe.defContained[desc] = undefined;
            iframe.$A.storageService.getStorage("ComponentDefStorage").getAll().then(function(items) {
                items = items || [];
                for (var i = 0; i < items.length; i++) {
                    if (items[i]["key"] === "markup://" + desc) {
                        iframe.defContained[desc] = true;
                        return;
                    }
                }
                iframe.defContained[desc] = false;
            });

            msg = msg || "Unable to determine whether " + desc + " is in ComponentDefStorage";
            $A.test.addWaitForWithFailureMessage(true,
                function() { return iframe.defContained[desc] !== undefined; },
                msg,
                function() {
                    $A.test.assertEquals(present, iframe.defContained[desc], desc + " def should " + (present ? "" : "not") + " have been present in ComponentDefStorage.\n" + iframeCmp.get("v.log"));
                }
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
        }
    }
}
