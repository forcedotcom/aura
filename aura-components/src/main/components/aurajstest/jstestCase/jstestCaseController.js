/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    runTest : function(cmp, evt, helper){
        helper.runTest(cmp);
    },

    rerun : function(cmp){
        var frame = cmp.find("content").getElement().firstChild;
        cmp.find("results").getElement().innerHTML = "";

        var rerun = cmp.find("rerun").getElement();
        $A.util.swapClass(rerun,["pass", "fail"], "spin");
        var win = frame.contentWindow?frame.contentWindow:frame.contentDocument.window;
        win.location.reload(true);
    }
})
