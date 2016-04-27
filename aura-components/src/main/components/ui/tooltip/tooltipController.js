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
    init: function(component) {

        var domId = component.get('v.domId');
        if(!domId) {
            domId = 'tt-for-' + component.getGlobalId();
            component.set('v.domId', domId);
        }
    },

    show: function(component, event, helper) {
        if(component.isValid() && $A.util.getBooleanValue(component.get('v.advanced'))) {
            helper.show(component);
        }
    },

    hide: function(component, event, helper) {
    	if(component.isValid() && $A.util.getBooleanValue(component.get('v.advanced'))) {
            helper.hide(component);
        }
    },

    handleBodyChange: function(component, event, helper) {
        if($A.util.getBooleanValue(component.get('v.advanced'))) {
            helper.updateBodyText(component);
        }
    },

    handleMouseOver: function(component, event, helper) {
        if(component.get('v.trigger') === 'hover') {
            helper.show(component);
        }
        
    },

    handleMouseDown: function(component) {
        component._midclick = true;
    },

    handleFocus: function(component, event, helper) {

        // if the mouse was down, this is
        // a click, so let's let the click
        // handler handle this one.
        if(component._midclick) {
            return;
        }


        //focus always works unless trigger is none
        //because of accessibility
        
        var trigger = component.get('v.trigger');
        if(trigger && trigger !== 'none') {
            event.preventDefault();
            helper.show(component);
        } 
    },

    handleBlur: function(component, event, helper) {
        helper.hide(component);
    },

    handleClick: function(component, event, helper) {
        component._midclick = false;
        event.preventDefault();
        if(component.get('v.trigger') === 'click') {
            helper.toggle(component);
        }
    },

    handleMouseOut: function(component, event, helper) {
        if(component.get('v.trigger') === 'hover') {
            helper.hide(component);
        }
    },

    handleKeyPress: function(component, event, helper) {
    	if(event.keyCode === 13) {
    		helper.toggle(component);
    	}
    }
})// eslint-disable-line semi
