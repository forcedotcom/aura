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
 * @description Creates a FlavorDefaultDef instance.
 * @param {Object} config
 * @constructor
 * @protected
 */
function FlavorDefaultDef(config) {
    this.map = {};

    for (var key in config) {
        if (config.hasOwnProperty(key)) {
            this.map[key] = {
                flavor: config[key]["flavor"],
                context: config[key]["context"]
            };
        }
    }
}

FlavorDefaultDef.prototype.auraType = "FlavorDefaultDef";

/**
 * Returns a flavor for the given component descriptor.
 * @param {DefDescriptor} componentDescriptor The component descriptor, e.g., "ui:button".
 */
FlavorDefaultDef.prototype.getFlavor = function(componentDescriptor) {
    var entry = this.map[componentDescriptor.getQualifiedName()];

    if (entry && entry.context) {
        var value = valueFactory.create(entry.context, null, $A);
        $A.assert(value && value.evaluate, "unable to parse expression for aura:flavor override");

        var result = value.evaluate();
        $A.assert($A.util.isBoolean(result), "expressions for aura:flavor overrides must result in a boolean value");

        return result ? entry.flavor : null;
    } else if (entry) {
        return entry.flavor;
    }

    return null;
};
