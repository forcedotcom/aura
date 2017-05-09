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
    add: function(component, event, helper) {
        var count = component.get('v.count');
        component.set('v.count', ++count);
        $A.createComponent(
            'renderingTest:renderingOrderItem',
            {
                value: count
            },
            function(newCmp) {
                var facet = component.get('v.facet');
                facet.push(newCmp);
                component.set('v.facet', facet);
            }
        );
    },


    remove: function(component, event, helper) {
        var count = component.get('v.count');

        var facet = component.get('v.facet');
        facet.pop();
        component.set('v.facet', facet);


        component.set('v.count', facet.length);
    }
})