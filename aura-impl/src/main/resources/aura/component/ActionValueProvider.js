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
function ActionValueProvider(component, controllerDef) {
    this.actions;
    this.component = component;
    this.controllerDef = controllerDef;
}

ActionValueProvider.prototype.get = function(key) {
    // Delay creation of the object for memory purposes.
    if(!this.actions) {
        this.actions = {};
    }
    var actionDef = this.actions[key];
    if (!actionDef) {
        actionDef = this.component['controller'] && this.component['controller'][key];
        if (actionDef) {
            actionDef = new ActionDef({
                "descriptor": this.component.getName() + "$controller$" + key,
                "name": key,
                "actionType": "CLIENT",
                "code": actionDef
            });

            try {
                this.controllerDef.getActionDef(key);
                var message = "Component '" + this.component.getName() + "' has server and client action name conflicts: " + key;
                $A.warning(message);
            } catch(e) {
                // this means there's no such action on the server side
            }
        } else {
            actionDef = this.controllerDef && this.controllerDef.getActionDef(key);
        }

        $A.assert(actionDef, "Unknown controller action '"+key+"'");

        this.actions[key] = actionDef;
    }
    return actionDef.newInstance(this.component);
};
