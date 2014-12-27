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
    press: function(cmp, event, helper) {
        var localId = event.source.getLocalId();

        // Extract flags

        var data = localId.split(" ");
        var order = data[0];

        var flag = data[1];
        var outer = flag[0] === "T";
        var inner = flag[1] === "T";

        // Log action directly in the Dom to avoid rendering cycle

        var text;
        switch (order) {
            case "io":
            text = "- Setting inner to " + flag[0] + " then outer to " + flag[1];
            break;

            case "oi":
            text = "- Setting outer to " + flag[1] + " then inner to " + flag[0];
            break;
        }
        var log = cmp.find("log").getElement();
        log.appendChild(document.createTextNode(text));
        log.appendChild(document.createElement("br"));

        // Change attributes

        switch (order) {
            case "io":
            cmp.set("v.inner", inner);
            cmp.set("v.outer", outer);
            break;

            case "oi":
            cmp.set("v.outer", outer);
            cmp.set("v.inner", inner);
            break;
        }

    }
});
