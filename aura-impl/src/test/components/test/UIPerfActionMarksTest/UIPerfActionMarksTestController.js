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
    backgroundAction : function(cmp, evt, helper) {
        var a = helper.getAction(cmp, "c.echoTextBackground", "Background action complete");
        $A.enqueueAction(a);
    },

    foregroundAction: function(cmp, evt, helper) {
        var a = helper.getAction(cmp, "c.echoText", "Foreground action complete");
        $A.enqueueAction(a);
    },

    multipleForegroundActions: function(cmp, evt, helper) {
        var a1 = helper.getAction(cmp, "c.echoText", "Fore1");
        var a2 = helper.getAction(cmp, "c.echoText", "Fore2");
        var a3 = helper.getAction(cmp, "c.echoText", "Fore3");
        $A.enqueueAction(a1);
        $A.enqueueAction(a2);
        $A.enqueueAction(a3);
    }
})
