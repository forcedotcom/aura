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
    render : function(cmp){
        return cmp.getAttributes().get("value");
    },

    rerender : function(cmp){
        var newValue = cmp.getAttributes().getValue("value");
        if (newValue && newValue.isDirty()) {
            // TODO: This placeholder logic should move up to the rendering service
            var el = cmp.getElement();
            var placeholder = document.createTextNode("");
            $A.util.insertBefore(placeholder, el);

            $A.unrender(cmp);
            var results = $A.render(cmp);
            $A.util.insertBefore(results, placeholder);
            $A.util.removeElement(placeholder);
            $A.afterRender(cmp);
        }
    }
})
