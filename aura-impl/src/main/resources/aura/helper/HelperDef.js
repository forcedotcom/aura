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
/*jslint sub: true */
/**
 * @description Creates a HelperDef instance.
 * @constructor
 * @protected
 * @export
 */
function HelperDef(componentDef, libraries){
    var functions = [];
    var descriptor = componentDef.getDescriptor().getQualifiedName();
    var _constructor = $A.componentService.getComponentClass(descriptor);
    if(_constructor && _constructor.prototype["helper"]) {
        functions = _constructor.prototype["helper"];
    }

    if (libraries) {
        $A.util.forEach(Object.keys(libraries), function(importName) {
            var definition = libraries[importName];
            functions.constructor.prototype[importName] = {};

            $A.util.forEach(Object.keys(definition || []), function(key) {
                functions.constructor.prototype[importName][key] = definition[key];
            });
        });
    }

    this.functions = functions;
}

/**
 * Returns the functions for HelperDef.
 *
 * @public
 * @export
 */
HelperDef.prototype.getFunctions = function HelperDef$getFunctions(){
    return this.functions;
};

HelperDef.prototype.toJSON = function() {
    var output = {};
    for(var method in this.functions) {
        if(method !== "constructor"){
            output[method] = this.functions[method];
        }
    }
    return output;
};

Aura.Helper.HelperDef = HelperDef;
