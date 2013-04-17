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
 * @namespace Creates a new StyleDef instance, including the class name and descriptor.
 * @constructor
 * @param {Object} config
 */
function StyleDef(config){
    this.code = config["code"];
    this.className = config["className"];
    this.descriptor = new DefDescriptor(config["descriptor"]);
}

StyleDef.prototype.auraType = "StyleDef";

/**
 * Applies style to element. If this StyleDef's style has not been added to the DOM, add it to the DOM.
 */
StyleDef.prototype.apply = function(){
    if(!$A.getContext().isPreloaded(this.descriptor.getNamespace().toLowerCase())){
        var element = this.element;
        var code = this.code;
        if (!element && code) {
            element = aura.util.style.apply(code);
            this.element = element;
        }
    }
    delete this.code;
};

StyleDef.prototype.remove = function(){
    //TODO
};

/**
 * Gets class name from the style definition.
 * @param {Object} className
 *
 */
StyleDef.prototype.getClassName = function(){
    return this.className;
};
