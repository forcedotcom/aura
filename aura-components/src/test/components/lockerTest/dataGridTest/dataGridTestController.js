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
    testSecureCallHandler: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        // Fire the addRemove event.
        helper.fireAddRemove(cmp, {
            last: true,
            count: 1
        });
        var secureComponent = $A.getComponent(cmp.find("grid").getGlobalId());

        // Retrieve the value from secure component, and put into attribute.
        // When secure component is passed in, _lastCall will be set at secure component.
        // Then secureComponent.get("v.lastCall") will be the actual value, otherwise it will be [init].
        secureComponent.getLastCall();

        testUtils.assertEquals("addRemoveInHelper", secureComponent.get("v.lastCall"), "Expected dataGrid handleAddRemove is invoked with secure component");
    },

    testSecureCallHandlerUseMethod: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        helper.fireRefresh(cmp, {
            last: true,
            count: 1
        });


        var secureComponent = $A.getComponent(cmp.find("grid").getGlobalId());

        secureComponent.getLastCall();

        testUtils.assertEquals("refreshInController", secureComponent.get("v.lastCall"), "Expected dataGrid handleAddRemove is invoked with secure component");
    }
})