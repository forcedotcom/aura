/*
 * Copyright (C) 2015 salesforce.com, inc.
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
        var ret = this.superAfterRender();
        
        // Listen to drag and drop events
        var draggable = component.getElement();
        draggable.addEventListener("dragstart", function(event) {
        	helper.handleDragStart(component, event);
        }, false);
        
        draggable.addEventListener("dragend", function(event) {
        	helper.handleDragEnd(component, event);
        }, false);
        
        return ret;
    }  
})