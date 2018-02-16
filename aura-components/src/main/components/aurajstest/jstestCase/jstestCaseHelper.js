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
({
    loadTest: function (cmp) {
        if (!cmp._testLoaded) {
            cmp._testLoaded = true;
            var frame = document.createElement("iframe");
            frame.src = cmp.get("v.url") + "&aura.nonce=" + new Date().getTime();
            frame.scrolling = "auto";
            $A.util.on(frame, "load", function () {
                cmp.getDef().getHelper().runTest(cmp);
            });
            var content = cmp.find("content");
            $A.util.insertFirst(frame, content.getElement());
        }
    },

    runTest : function (cmp) {
        var frame = cmp.find("content").getElement().firstChild;
        var win = frame.contentWindow ? frame.contentWindow : frame.contentDocument.window;
        try {
            var root = win.$A.getRoot();
        } catch (e) {
            // empty
        }

        if (!root) {
            if(!win.$A || !win.$A.test || !win.$A.test.isComplete()){
                cmp.set("v.status", "spin");
                setTimeout(function () {
                    cmp.getDef().getHelper().runTest(cmp);
                }, 10);
                return;
            }
        }
        cmp._startTime = new Date().getTime();
        cmp.getDef().getHelper().displayResults(cmp, win);
    },

    displayResults : function(cmp, win){
        if(!win.$A || !win.$A.test || !win.$A.test.isComplete()){
            setTimeout(function(){
                cmp.getDef().getHelper().displayResults(cmp, win);
            }, 50);
            return;
        }
        //IF there were any errors in the test case (excluding assertions in callback functions)
        var testErrors = win.$A.test.getErrors();
        if (testErrors !== "") {
            cmp.set("v.status", "fail");
            var msg = "";
            var errorsInCallbackFunc = testErrors && testErrors.length ? JSON.parse(testErrors) : [];
            var error = null;
            for (var i = 0; i < errorsInCallbackFunc.length; i++) {
                error = errorsInCallbackFunc[i];
                msg += error.message;
                if (error["testState"]) {
                    msg += "<pre class='testState'>" + error.testState + "</pre>";
                }
            }
            cmp.find("results").getElement().innerHTML = msg;
        } else {
            cmp.set("v.status", "pass");
        }

        cmp.set("v.runTime", " in " + (new Date().getTime() - cmp._startTime) + "ms");

        cmp.get("e.done").fire();
    }
})// eslint-disable-line semi
