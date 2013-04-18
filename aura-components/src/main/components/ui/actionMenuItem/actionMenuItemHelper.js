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
    preEventFiring : function(component, event){
        var isSpaceKeydown = event.type === "keydown" && event.keyCode === 32;
        if ((isSpaceKeydown || event.type == "click") && 
            component.get("v.disabled") !== true) { // dismiss the parent menu
            var parent = component.getValue("v.parent");
            if (parent && !parent.isEmpty()) {
                p = parent.getValue(0);
                p.setValue("v.visible", false);
            }
            // put the focus back to menu trigger
            this.setFocusToTrigger(component);
        }
        this.supportKeyboardInteraction(component, event);
    }
 })