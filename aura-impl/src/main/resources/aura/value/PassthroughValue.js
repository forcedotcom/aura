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
 * @namespace A value provider that resolves against a few primary providers first, then falls back on a component.
 * @constructor
 * @protected
 */
function PassthroughValue(primaryProviders, cmp) {
    this.primaryProviders = primaryProviders;
    this.cmp = cmp;
}

PassthroughValue.prototype.auraType = "Value";

/**
 * Returns the Component.
 */
PassthroughValue.prototype.getComponent = function() {
    return this.cmp;
};

/**
 * Returns the primary providers associated with the given key or the Component.
 * @param {String} key The data key to look up on the primary providers.
 */
PassthroughValue.prototype.getValue = function(key) {
    var v = this.primaryProviders[key];
    if (!aura.util.isUndefinedOrNull(v)) {
        return v;
    }
    return this.cmp.getValue(key);
};

//#include aura.value.PassthroughValue_export
