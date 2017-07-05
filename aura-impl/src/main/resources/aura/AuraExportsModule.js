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
        $A.clientService.setCurrentAccess($A.getRoot());
        try {
            $A.eventService.newEvent(eventName).setParams(eventParams).fire();
        } finally {
            $A.clientService.releaseCurrentAccess();
        }
    },

    "labels": function (obj) {
        return Object.keys(obj).reduce(function(r, cmpKey) {
            var key = obj[cmpKey];
            r[cmpKey] = $A.get('$Label.' + key);
            return r;
        }, {});
    },

    /**
     * Execute a global controller action.
     * @param {String} endpoint the controller and method to invoke.
     * @param {Object} params parameters to pass to the controller.
     * @return {Promise} promise that resolves when the action completes.
     */
    "executeGlobalController": function (endpoint, params) {
        var controllerName = 'c.aura://' + endpoint;
        var action = $A.get(controllerName);

        if (!action) {
            return Promise.reject(new Error('Controller for endpoint ' + endpoint + ' is not registered'));
        }
        action.setParams(params);

        return new Promise(function (resolve, reject) {
            action.setBackground();
            action.setCallback(null, function (response) {
                if (response.getState() !== 'SUCCESS') {
                    var actionErrors = response.getError();
                    if (actionErrors.length > 0) {
                        reject(actionErrors[0]);
                    } else {
                        reject(new Error('Error fetching component'));
                    }

                    return;
                }
                resolve(response.getReturnValue());
            });

            $A.run(function() { $A.enqueueAction(action); });
        });
    },

    "registerModule": function (module) {
        $A.componentService.initModuleDefs([module]);
        return $A.componentService.evaluateModuleDef(module["descriptor"]);
    },
    "sanitizeDOM": function (dirty, config) {
        return $A.util.sanitizeDOM(dirty, config);
    },
    "createComponent" : function (componentName, attributes, callback) {
        $A.clientService.setCurrentAccess($A.getRoot());
        try {
            $A.createComponent(componentName, attributes, $A.getCallback(callback));
        } finally {
            $A.clientService.releaseCurrentAccess();
        }
    }
};
