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
    init: function(cmp) {
        var action = $A.get("c.aura://ComponentController.getDefinitions");
        action.setParams({
            "names": null,
        });

        action.setCallback(this, function() {
            throw new Error("testing from action callback");
        });
        $A.clientService.enqueueAction(action);
        /* expect log line: 
         * Unhandled Exception 'AuraError: testing from action callback': Error cause descriptor: markup://reportErrorTest:actionCallbackThrowTest
         */
    }
})