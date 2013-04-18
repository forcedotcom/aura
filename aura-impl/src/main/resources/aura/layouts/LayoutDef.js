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
 * @namespace Creates a LayoutDef instance with its layoutItemDefs.
 * @param {Object} config
 * @constructor
 * @protected
 */
function LayoutDef(config){
    var items = [];
    this.items = items;
    this.name = config["name"];
    if(config["match"]){
        this.match = new RegExp(config["match"]);
    }
    this.title = valueFactory.create(config["title"]);

    var itemConfigs = config["layoutItemDefs"];
    for(var i=0;i<itemConfigs.length;i++){
        var itemConfig = itemConfigs[i];
        items.push(new LayoutItemDef(itemConfig));
    }
}

LayoutDef.prototype.auraType = "LayoutDef";

/**
 * Returns the name of the Layout.
 */
LayoutDef.prototype.getName = function(){
    return this.name;
};

/**
 * Checks if the given token is a match. Returns false if the token is not a match.
 * @param {String} token The string to resolve.
 */
LayoutDef.prototype.matches = function(token){
    if(this.match !== undefined){
        return this.match.test(token);
    }
    return false;
};

/**
 * Returns the title of the Layout.
 */
LayoutDef.prototype.getTitle = function(){
    return this.title;
};

/**
 * Passes each item into the given function.
 * @param {Function} func The function that is used to resolve the items.
 */
LayoutDef.prototype.each = function(func){
    var items = this.items;
    for(var i=0;i<items.length;i++){
        func(items[i]);
    }
};
