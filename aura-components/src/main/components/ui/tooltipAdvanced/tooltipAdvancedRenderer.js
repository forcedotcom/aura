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

    render: function(component, helper) {
        helper.initStyle(component);

        return this.superRender();
    },

    rerender: function(component, helper) {
        var isDirty = false;

        // any of these attributes being dirty
        // requires re-calculating classes and styles
        var attrToCheck = [
            'v.fadeInDuration',
            'v.fadeOutDuration',
            'v.triggerClass',
            'v.class',
            'v.delay',
            'v.target',
            'v.tooltipBody',
            'v.direction',
            'v.disabled'
        ];


        for (var i = 0; i < attrToCheck.length; i++) {
           if(component.isDirty(attrToCheck[i])){
                isDirty = true;
           }
        }

        if(isDirty) {
            helper.initStyle(component);
            helper.setStyle(component);
        }
        return this.superRerender();
    },
    
    afterRender: function(component, helper) {
        helper.setStyle(component);
    }

})// eslint-disable-line semi