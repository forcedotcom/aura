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
    create: function create(valueConfig, def, component, expected) {
        if (aura.util.isObject(valueConfig)) {
            var source = undefined;
            if (valueConfig.getSourceValue) {
                // Object is already wrapped by a MapValue
                source = valueConfig.getSourceValue();
            } else if (valueConfig._arrayValueRef) {
                // Object is already wrapped by an ArrayValue
                source = valueConfig._arrayValueRef;
            }
            // If we have an existing wrapper and it's the source of this value,
            // then this is really a fancy setValue, not a new creation.  But
            // if it's a different wrapper, or we don't have one, we do need a
            // new wrapper.
            if (source && source === expected) {
                source._setValue(valueConfig);
                return source;
            }

            // If we get to here, we need a new wrapper of some sort....
            if (valueConfig.auraType) {
                if (valueConfig.auraType === "ActionDef") {
                    return new ActionReferenceValue(valueConfig, def, component);
                }

                return valueConfig;
            } else if (valueConfig["exprType"] === "PROPERTY") {
                return new PropertyChain(valueConfig["path"]);
            } else if (valueConfig["exprType"] === "FUNCTION") {
                return new FunctionCallValue(valueConfig, def, component);
            } else {
                return new MapValue(valueConfig, def, component);
            }
        } else if (aura.util.isArray(valueConfig)) {
            return new ArrayValue(valueConfig, def, component);
        } else if (valueConfig && valueConfig.indexOf && valueConfig.indexOf("{!") === 0) {
        	// Property expressions
        	valueConfig = valueConfig.substring(2, valueConfig.length - 1);
            return new PropertyChain(valueConfig.split("."));
        } else {
            return new SimpleValue(valueConfig, def, component);
        }
    },

    parsePropertyReference: function(str) {
        // TODO: add [] support
        if (str.charAt(0) === "{") {
            str = str.slice(2, str.length - 1);
        }
        
        var path = str.split('.');
        return new PropertyChain(path);
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
