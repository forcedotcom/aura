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
    setDefaultAttrs: function(cmp) {
        cmp.set('v.updateOnDisabled', true);
    },

    handleUpdate: function() {
        // Override update handler and let inputSmartNumber updates.
        // This calls doUpdate in ui:input.helper and set v.value,
        // which is unwanted because in inputSmartNumber, v.value
        // is internal and needs to be preprocessed before getting set.
    },

    fireEvent: function(component, event) {
        // Override to avoid firing extra events not wanted by inputSmartNumber.
        // With special formatting, there's logic in inputSmartNumber to decide
        // whether a change event should be fired.
        // Without filtering this, ui:input can fire change event in unexpected moment.
        if (event.type !== 'change') {
            this.lib.interactive.fireEvent(component, event);
        }
    }
})//eslint-disable-line semi
