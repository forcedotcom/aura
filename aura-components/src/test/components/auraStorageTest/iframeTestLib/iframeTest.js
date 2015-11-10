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
        getIframeRootCmp: function() {
            return document.getElementById("myFrame").contentWindow.$A.getRoot();
        },

        /**
         * Create a new iframe and insert into DOM at component containing the provided aura:id.
         */
        loadIframe: function(cmp, src, iframeAuraId) {
            cmp._frameLoaded = false;
            var frame = document.createElement("iframe");
            frame.src = src;
            frame.scrolling = "auto";
            frame.id = "myFrame";
            $A.util.on(frame, "load", function () {
                cmp._frameLoaded = true;
            });
            var content = cmp.find(iframeAuraId);
            $A.util.insertFirst(frame, content.getElement());
            this.waitForIframeLoad(cmp);
        },

        reloadIframe: function(cmp) {
            cmp._frameLoaded = false;
            document.getElementById("myFrame").contentWindow.location.reload();
            this.waitForIframeLoad(cmp);
        },

        waitForIframeLoad: function(cmp) {
            var iframeWindow = document.getElementById("myFrame").contentWindow;
            $A.test.addWaitFor(true, function() {
                return cmp._frameLoaded
                    && iframeWindow.$A
                    && iframeWindow.$A.getRoot() !== undefined
                    && !$A.test.isActionPending()
            });
        },

        /**
         * Wait for the iframe component to update it's status. First wait for the initial message to not be present
         * anymore, then verify the expected new status is present. This pattern, as opposed to simply waiting for the
         * final message, is used to fail fast and prevent long timeouts.
         */
        waitForStatus: function(initialMessage, finalMessage) {
            var iframeCmp = this.getIframeRootCmp();
            $A.test.addWaitFor(true, function() {
                return iframeCmp.get("v.status") !== initialMessage;
            }, function() {
                $A.test.assertEquals(finalMessage, iframeCmp.get("v.status"));
            });
        }
    }
}