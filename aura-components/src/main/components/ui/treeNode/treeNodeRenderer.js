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
    /**
     * After the initial render, add the active DOM attribute if necessary
     */
    afterRender : function(cmp) {
        var active = cmp.get('v.active');
        if (active) {
            cmp.getElement().setAttribute('active', 'true');
        }
        
        return this.superAfterRender(cmp);
    },
    
    /**
     * When the active node changes, we may need to scroll it into view.
     * Expansion changes and the like mean we must wait until rerender time to
     * react to this event.
     */
    rerender : function(cmp) {
        var activeAttr = cmp.getAttributes().getValue("active");
        if (activeAttr.isDirty()) {
            var active = activeAttr.getBooleanValue();
            var elem = cmp.getElement();
            if (active) {
                elem.setAttribute('active', 'true');
                if(elem.scrollIntoViewIfNeeded){
	                elem.scrollIntoViewIfNeeded();                
                }
                else{
					elem.scrollIntoView(false);
                }
            } else {
                elem.removeAttribute('active');
            }
        }
        return this.superRerender(cmp);
    }
}
