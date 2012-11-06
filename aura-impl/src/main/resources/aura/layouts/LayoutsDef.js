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
/*jslint sub: true */
/**
 * @namespace Creates a LayoutsDef instance with a collection of layouts and layoutDefs.
 * @param {Object} config
 * @constructor
 * @protected
 */
function LayoutsDef(config){
    var layoutsByName = {};
    var layouts = [];
    this.layoutsByName = layoutsByName;
    this.layouts = layouts;
    this.catchall = config["catchall"];
    this.defaultLayout = config["defaultLayout"];

    var layoutDefs = config["layoutDefs"];
    for(var i=0;i<layoutDefs.length;i++){
        var layoutDef = layoutDefs[i];
        var name = layoutDef.name;
        var l = new LayoutDef(layoutDef);
        layoutsByName[name] = l;
        layouts.push(l);
    }
}

LayoutsDef.prototype.auraType = "LayoutsDef";

/**
 * Returns the Layout based on the given name.
 * @param {String} name The name of the Layout.
 */
LayoutsDef.prototype.getLayout = function(name){
    var ret = this.layoutsByName[name];
    if(!ret){
        for(var i=0;i<this.layouts.length;i++){
            var layout = this.layouts[i];
            if(layout.matches(name)){
                return layout;
            }
        }
    }
    return ret;
};

/**
 * Returns the Layout that serves as a catchall.
 */
LayoutsDef.prototype.getCatchall = function(){
    return this.getLayout(this.catchall);
};

/**
 * Returns the default Layout.
 */
LayoutsDef.prototype.getDefault = function(){
    return this.getLayout(this.defaultLayout);
};
