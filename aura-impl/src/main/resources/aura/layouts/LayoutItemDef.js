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
 * @namespace A LayoutItemDef instance that is created with LayoutDef.
 * @param {Object} config
 * @constructor
 * @protected
 */
function LayoutItemDef(config){
    this.container = config["container"];
    this.body = config["body"];
    this.cache = config["cache"];
    this.action = valueFactory.create(config["action"]);
}

LayoutItemDef.prototype.auraType = "LayoutItemDef";

/**
 * Returns the container.
 */
LayoutItemDef.prototype.getContainer = function(){
    return this.container;
};

/**
 * Returns the body.
 */
LayoutItemDef.prototype.getBody = function(){
    return this.body;
};

/**
 * Returns the cache.
 */
LayoutItemDef.prototype.getCache = function(){
    return this.cache;
};

/**
 *
 * @param {Object} valueProvider
 */
LayoutItemDef.prototype.getAction = function(valueProvider){
    var body = this.body;
    if(body && body.length > 0){
        var action = $A.get("c.aura://ComponentController.getComponents");
        var components = [];

        for(var i=0;i<body.length;i++){
            var cdr = body[i];
            var config = {"descriptor" : cdr["componentDef"]["descriptor"]};
            var attributes = cdr["attributes"];
            if(attributes){
                var attConfigs = attributes["values"];
                var atts = {};
                config["attributes"] = atts;
                for(var key in attConfigs){
                    var value = attConfigs[key];
                    if(value !== undefined){
                        atts[key] = value.value;
                    }
                }
            }
            components.push(config);
        }
        action.setParams({"components" : components});
        return action;
    }else{
        return expressionService.get(valueProvider, this.action);
    }
};

LayoutItemDef.prototype.setCachedBody = function(inst){
    this.cachedBody = inst;
};

LayoutItemDef.prototype.getCachedBody = function(){
    return this.cachedBody;
};
