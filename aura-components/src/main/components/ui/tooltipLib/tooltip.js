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
function lib() { //eslint-disable-line no-unused-vars
    'use strict';

    var l = { //eslint-disable-line no-shadow, no-unused-vars

        getClassList: function(component) {
             var fadeInDuration     = component.get('v.fadeInDuration'),
                fadeOutDuration    = component.get('v.fadeOutDuration'),
                extraClass         = component.get('v.class'),
                direction          = component.get('v.direction'),

                advanced           = component.get('v.advanced'),
                disabled           = component.get('v.disabled');

            var classList = ['tooltip'];
            
            if(advanced) {
                classList.push('advanced-wrapper');
            }

            if(extraClass) {
                classList.push(extraClass);
            }

            if(direction) {
                classList.push(direction);
            }

            if(fadeInDuration > 0) {
                classList.push('fade-in');
            }
            if(fadeOutDuration > 0) {
                classList.push('fade-out');
            }

            if(disabled) {
                classList.push('disabled');
            }

            return classList;
        },


        computeTooltipStyle: function(component) {

            var domId = component.get('v.domId');


            if(!domId) {
                domId = component.getConcreteComponent().getGlobalId();
            }
            var fadeInDuration     = component.get('v.fadeInDuration'),
                fadeOutDuration    = component.get('v.fadeOutDuration'),
                delay              = component.get('v.delay');


            if(!fadeInDuration) {
                fadeInDuration = 0;
            }

            if(!fadeOutDuration) {
                fadeOutDuration = 0;
            }

            var classList = this.getClassList(component);

            if(fadeInDuration > fadeOutDuration) {
                fadeOutDuration = fadeInDuration;
            } else {
                fadeInDuration = fadeOutDuration;
            }

            var styleDeclaration = [
                '-webkit-transtion-duration:' + fadeInDuration + 'ms',
                'transition-duration:' + fadeInDuration  + 'ms',
                '-webkit-transition-delay:' + delay  + 'ms', 
                'transition-delay:' + delay  + 'ms'
            ];


            component.set('v.tooltipStyle', styleDeclaration.join(';'));
            component.set('v.domId', domId);

            
            component.set('v.classList', classList.join(' '));
        }

    };

    return l;
}
