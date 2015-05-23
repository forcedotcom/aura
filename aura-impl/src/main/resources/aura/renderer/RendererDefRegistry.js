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
/**
 * @description A registry for RendererDefs.
 * @constructor
 * @protected
 */
function RendererDefRegistry(){
    this.rendererDefs = {};
}

/**
 * Returns a RendererDef instance from registry
 * @param {String} descriptor component definition descriptor to lookup on the RendererDef
 * @returns {RendererDef} RendererDef from registry
 */
RendererDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No descriptor specified");
    return this.rendererDefs[descriptor];
};

/**
 * Returns a RendererDef after creating and adding to the registry.
 * @param {String} componentDescriptor descriptor of component
 * @returns {RendererDef}
 */
RendererDefRegistry.prototype.createDef = function(componentDescriptor) {
    $A.assert(componentDescriptor, "Component descriptor is required to create ProviderDef");
    var def = this.getDef(componentDescriptor);
    if (!def) {
        def = new RendererDef(componentDescriptor);
        this.rendererDefs[componentDescriptor] = def;
    }
    return def;
};

Aura.Renderer.RendererDefRegistry = RendererDefRegistry;