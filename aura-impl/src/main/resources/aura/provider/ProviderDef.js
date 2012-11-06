/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @param {Object} component
 */
ProviderDef.prototype.provide = function(component, localCreation){
    var provideMethod = this.provideMethod;
    $A.assert(provideMethod, "Provide method not found");

    var ret = provideMethod(component, localCreation);
    if (!ret || $A.util.isString(ret)) {
        ret = {
            "componentDef": ret
        };
    }
    if (ret["componentDef"]) {
        ret["componentDef"] = componentService.getDef(ret["componentDef"]);
    } else {
        ret["componentDef"] = component.getDef();
    }
    return ret;
};
//#include aura.provider.ProviderDef_export
