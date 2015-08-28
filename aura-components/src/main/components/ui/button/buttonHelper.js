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
    catchAndFireEvent: function (cmp, event, eventName) {

        if (eventName === 'press' && $A.util.getBooleanValue(cmp.get("v.stopPropagation"))) {
            $A.util.squash(event);
        }

        if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
            event.preventDefault();
            return false;
        }

        var eventObj = cmp.getEvent(eventName).fire({"domEvent": event});
        return true;
    },

    getClassList: function (cmp) {
        var vclass = cmp.get('v.class');
        var stateful = cmp.get('v.stateful');
        if(stateful) {
            return this.updateStatefulClasses(cmp);
        } else if (vclass) {
            return vclass;
        } else {
            return '';
        }
    },

    updateStatefulClasses: function (cmp, event) {
        var classList = [];
        var stateful = cmp.get('v.stateful');
        var selected = cmp.get('v.selected');
        var vClass = cmp.get('v.class');

        if(vClass) {
            classList.push(vClass);
        }

        if(selected) {
            classList.push('is-selected');
        } else {
            classList.push('not-selected');
        }

        return classList.join(' ');
    }
// eslint-disable-line semi
})