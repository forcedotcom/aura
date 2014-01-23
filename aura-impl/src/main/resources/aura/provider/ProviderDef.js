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
/*jslint sub : true */
/**
 * @namespace Creates a ProviderDef instance with the provide method. An error is displayed if the provider method is not found.
 * @constructor
 * @protected
 */
function ProviderDef(config){
    var code = config["code"];
    $A.assert(code, "provider code not found");
    var obj = aura.util.json.decodeString(code);
    this.provideMethod = obj["provide"];
}

ProviderDef.prototype.auraType = "ProviderDef";

/**
 * Runs the provide method on the component and returns the component definition.
 * Throws an error if the provide method is not found.
 * @param {Component} component 
 * @param {Boolean} localCreation
 * @param {Function} callback
 * @param {Object} ccc
 */
ProviderDef.prototype.provide = function(component, localCreation, callback, ccc) {

    var provideMethod = this.provideMethod;
    $A.assert(provideMethod, "Provide method not found");

    var providedConfig = provideMethod(component, localCreation);

    if (!providedConfig || $A.util.isString(providedConfig)) {
        providedConfig = {
            'componentDef': providedConfig
        };
    }

    if (providedConfig['componentDef']) {
        var def = componentService.getDef(providedConfig['componentDef']);

        if (!def || (def && def.hasRemoteDependencies())) {
            // only go to server when necessary
            if (ccc) {
                var createdProvided = function(returnedCmp) {
                    var newDef = providedConfig;
                    newDef['componentDef'] = returnedCmp.getDef();

                    // TODO: merge returnedCmp attributes into newDef['attributes'] when async component happens

                    callback(newDef['componentDef'], newDef['attributes']);
                };
                // providedConfig must have all required attributes for component or component creation will fail
                ccc.loadComponent(providedConfig, null, false, createdProvided);
            } else {
                $A.error('Client provider is for an unknown component definition or ' +
                    'component has server dependencies: ' + providedConfig['componentDef']);
            }
        } else {
            // set available component def
            providedConfig['componentDef'] = def;
            callback(providedConfig['componentDef'], providedConfig['attributes']);
        }

    } else {
        // no component def provided so set to current component
        providedConfig['componentDef'] = component.getDef();
        callback(providedConfig['componentDef'], providedConfig['attributes']);
    }

};
//#include aura.provider.ProviderDef_export
