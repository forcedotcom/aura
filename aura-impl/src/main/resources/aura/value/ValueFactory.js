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
 * creates the right value object based on whats passed in
 */
var valueFactory = {
    create: function create(valueConfig, def, component) {
        if (aura.util.isObject(valueConfig)) {
            if (valueConfig.auraType) {
                if (valueConfig.auraType === "ActionDef") {
                    return new ActionReferenceValue(valueConfig, def, component);
                }
            } else if (valueConfig["exprType"] === "PROPERTY") {
                return new PropertyReferenceValue(valueConfig["path"], component);
            } else if (valueConfig["exprType"] === "FUNCTION") {
                return new FunctionCallValue(valueConfig, component);
            }else{
                // Recurse over child objects to create Actions, PropertyReferences, and FunctionCalls
                var childConfig={};
                for(var key in valueConfig){
                    childConfig[key]=valueFactory.create(valueConfig[key], def, component);
                }
                valueConfig=childConfig;
            }
        } else if (aura.util.isString(valueConfig) && valueConfig.charAt(0)==='{' && component) {
            // Property Expressions:
            switch(valueConfig.charAt(1)){
                // By Value
                case '#':
                    return component.get(valueConfig.substring(2, valueConfig.length - 1));
                // By Reference
                case '!':
                    var isGlobal=valueConfig.charAt(2)==='$';
                    if(!isGlobal&&$A.util.isComponent(component)){
                        return component.getReference(valueConfig);
                    }
                    //JBUCH: HALO: FIXME: FIND A BETTER WAY TO HANDLE DEFAULT EXPRESSIONS
                    valueConfig = valueConfig.substring(2, valueConfig.length - 1);
                    return new PropertyReferenceValue(valueConfig.split("."), isGlobal?$A:component);
            }
        }
        return valueConfig;
    }

//#if {"modes" : ["STATS"]}
    ,nextId : -1,

    index : function(value) {
        if(!value){
            return;
        }

        var index = this.getIndex(value.toString());
        var id = this.nextId++;
        value.id = id;

        index[id] = value;
    },

    getIndex : function(type){
        var index = this.valueIndex;
        if(!index){
            index = {};
            this.valueIndex = index;
        }

        if(type){
            var typeIndex = index[type];
            if(!typeIndex){
                typeIndex = {};
                index[type] = typeIndex;
            }
            index = typeIndex;
        }

        return index;
    },

    clearIndex : function(){
        delete this.valueIndex;
    },

    deIndex : function(value) {
        var index = this.getIndex(value.toString());
        delete index[value.id];
    }
//#end
};
