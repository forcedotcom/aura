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

{
    /**
     * Update the currently selected location in the UI.
     */
    handleLocationChange : function(cmp, event) {
        if (aura.util.isUndefinedOrNull(cmp._activeCmp)) {
            // The current docsLayout catchall is help. It would be better if
            // the layout service exposed a catchall as a separate event for
            // more dynamic handling.
            cmp._activeCmp = cmp.find('help');
        }
        
        // Remove the active css attribute from the currently selected element.
        cmp._activeCmp.getElement().setAttribute('active', false);
        
        // Lookup the new location.
        var token = event.getParam('token');
        var newLocationComp = cmp.find(token);
        if (aura.util.isUndefinedOrNull(newLocationComp)) {
            newLocationComp = cmp.find('help');
        }
        
        // Set the attribute holder to track the active element and set its CSS
        // attribute to render as active.
        cmp._activeCmp = newLocationComp;
        cmp._activeCmp.getElement().setAttribute('active', true);
    }
}
