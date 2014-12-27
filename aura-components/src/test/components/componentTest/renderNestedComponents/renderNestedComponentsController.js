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
        var target = data[0];
        var language = data[1];

        // Build messages
        var targetCmp = cmp.find(target);
        var text;
        if (targetCmp) {
             text = "- Setting " + target + " to " + language;
        } else {
             text = "- Can't set " + target + " to " + language + " (expected if outter was set)";
        }

        // Log action directly in the DOM to avoid rendering cycle

        var log = cmp.find("log").getElement();
        log.appendChild(document.createTextNode(text));
        log.appendChild(document.createElement("br"));

        // Change the DOM via components

        if (targetCmp) {

            var message;
            switch (language) {
                case "Spanish":
                    message = "¡Hola!";
                    break;

                case "French":
                    message = "Bonjour!";
                    break;
            }

            var newCmp = $A.componentService.newComponent({
                "componentDef" : "markup://ui:outputText",
                "attributes": {
                    "values": {
                        "value": message
                    }
                }
            });

            targetCmp.set("v.body", [newCmp]);
        }
    }
})
