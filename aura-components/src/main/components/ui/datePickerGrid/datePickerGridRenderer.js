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
    afterRender: function(component, helper) {
        helper.renderGrid(component);
        return this.superAfterRender();
    },

    rerender: function(component, helper) {
        var shouldRender = false;
        var attributes = component.getDef().getAttributeDefs();
        attributes.each(function(attributeDef) {
            var name = attributeDef.getDescriptor().getName();
            if (name !== "date" && component.getAttributes().getValue(name).isDirty()) { // if only date changes, no need to rerender
                shouldRender = true;
            }
        });
        if (shouldRender) {
            helper.renderGrid(component);
            this.superRerender();
        }
    }
})