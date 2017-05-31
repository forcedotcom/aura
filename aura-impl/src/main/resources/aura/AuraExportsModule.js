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
Aura.ExportsModule = {
    "dispatchGlobalEvent": function (eventName, eventParams) {
        var context = $A.getContext();
        context.setCurrentAccess($A.getRoot());
        try {
            $A.eventService.newEvent(eventName).setParams(eventParams).fire();
        } finally {
            context.releaseCurrentAccess();    
        }
    },
    "labels": function (obj) {
        return Object.keys(obj).reduce(function(r, cmpKey) {
            var key = obj[cmpKey];
            r[cmpKey] = $A.get('$Label.' + key);
            return r;
        }, {});
    },
    "fetchGlobalControllerAction": function (type, params) {
        var normalizeType = type.charAt(0).toUpperCase() + type.slice(1);
        var controllerName = 'c.aura://' + normalizeType + 'Controller.getComponent';
        var action = $A.get(controllerName);

        if (!action) {
            return Promise.reject(new Error('Controller for type: ' + type + ' is not registered'));
        }
        action.setParams(params);

        return new Promise(function (resolve, reject) {
            action.setBackground();
            $A.enqueueAction(action);
            action.setCallback(null, function (response) {
                if (response.getState() !== 'SUCCESS') {
                    reject(new Error('Error fetching component: ' + JSON.stringify(response.getError())));
                }
                resolve(response.getReturnValue());
            });
        });
    },
    "registerModule": function (module) {
        $A.componentService.initModuleDefs([module]);
        return $A.componentService.evaluateModuleDef(module["descriptor"]);
    }
};