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
 * @description Creates a new AttributeDef instance, including the descriptor.
 * @constructor
 * @param {Object} config
 */
function AttributeDef(config){
    this.descriptor = new DefDescriptor(config["name"]);
    this.typeDefDescriptor = config["type"];
    this.defaultValue = config["default"];
    if(this.defaultValue === undefined){
        // KRIS: So if you specify any data type as an array (Boolean[], String[]) and then don't specify a defaultValue, it should be array.
        // Obviously would be nice if we fixed this on the server.
        // if(this.typeDefDescriptor === "aura://Aura.Component[]" || this.typeDefDescriptor === "aura://Aura.ComponentDefRef[]"){
        //     this.defaultValue=[];
        // }

        // KRIS: GORDON is going to fix this by returning the proper default value.
        // at which point we can remove this whole this.defaultValue === undefined block
        var nativeType = this.getNativeType();
        if(nativeType==="object") {
            this.defaultValue=null;
        } else if(nativeType==="array") {
            this.defaultValue=[];   
        }
    }
    this.required = config["required"] === true;
}

AttributeDef.prototype.auraType = "AttributeDef";

/**
 * Gets the descriptor. Returns a DefDescriptor object that contains the metadata for the attribute.
 * @returns {DefDescriptor} The qualified name for a DefDescriptor object has the format <code>prefix://namespace:name</code>.
 */
AttributeDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Checks whether the attribute definition is required.
 * Returns true by default.
 * @returns {Boolean} True by default.
 */
AttributeDef.prototype.isRequired = function(){
    return this.required === true;
};

/**
 * Gets the type definition. Returns a TypeDef object.
 * 
 * @returns {TypeDef}
 * @private
 */
AttributeDef.prototype.getTypeDef = function(){
    return this.typeDef;
};

/**
 * Gets the default value.
 * @returns {Object}
 */
AttributeDef.prototype.getDefault = function(){
    return $A.util.copy(this.defaultValue);
};

/**
 * Gets the type of the definition descriptor.
 * 
 * @returns {String}
 * @private
 */
AttributeDef.prototype.getTypeDefDescriptor = function(){
    return this.typeDefDescriptor;
};

AttributeDef.prototype.getNativeType = function() {
    $A.assert(this.typeDefDescriptor, "getNativeType() failed as there was no typeDefDescriptor for attribute " + this.getDescriptor() + ". Eacha attribute must have a definition before being set.");
    if(this.typeDefDescriptor.lastIndexOf("[]") === this.typeDefDescriptor.length - 2) {
        return "array";
    }

    switch(this.typeDefDescriptor) {
        case "aura://List": return "array";
        case "aura://Boolean": return "boolean";
        case "aura://String":  return "string";
        case "aura://Decimal": return "number";
        case "aura://Number":  return "number";
        case "aura://Integer": return "number";
        //case "aura://Map": return "object";
    }

    // What would we be missing? Error out?
    return "object";
};

//#include aura.attribute.AttributeDef_export
