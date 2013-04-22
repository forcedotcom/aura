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
 * @namespace Creates a new DefDescriptor (definition descriptor) instance, including the prefix and namespace.
 * @constructor
 * @param {Object} config Throws an error if config is null or undefined.
 */
function DefDescriptor(config){
    aura.assert(config, "DefDescriptor config undefined");

    var split = this.parse(config);
    this.prefix = split[0];
    this.namespace = split[1];
    this.name = split[2];
    this.qualifiedName = config;
}

DefDescriptor.prototype.auraType = "DefDescriptor";

/**
 * Gets the qualified name.
 * @returns {Object}
 */
DefDescriptor.prototype.getQualifiedName = function(){
    return this.qualifiedName;
};

/**
 * Gets the namespace.
 * @returns {Object} namespace
 */
DefDescriptor.prototype.getNamespace = function(){
    return this.namespace;
};

/**
 * Gets the name part of the qualified name.
 * @returns {Object}
 */
DefDescriptor.prototype.getName = function(){
    return this.name;
};

/**
 * Gets the prefix of the DefDescriptor.
 * @returns {String}
 */
DefDescriptor.prototype.getPrefix = function(){
    return this.prefix;
};

/**
 * Returns the qualified name in string format.
 * @returns {String}
 */
DefDescriptor.prototype.toString = function(){
    return this.getQualifiedName();
};

/**
 * Parses a definition descriptor to be split into prefix and names.
 * Not public.
 * @returns {Object}
 * @private
 */
DefDescriptor.prototype.parse = function(config){
    var prefixSplit = config.split("://");
    if(prefixSplit.length != 2){
        prefixSplit.unshift("markup");
    }
    var nameSplit = prefixSplit[1].split(":");
    if(nameSplit.length == 1){
        nameSplit = prefixSplit[1].split(".");
    }
    if(nameSplit.length == 1){
        return [prefixSplit[0], "", nameSplit[0]];
    }else{
        return [prefixSplit[0], nameSplit[0], nameSplit[1]];
    }
};

//#include aura.system.DefDescriptor_export
