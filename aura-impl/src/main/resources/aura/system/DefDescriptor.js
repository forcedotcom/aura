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
 * @description Creates a new DefDescriptor (definition descriptor) instance, including the prefix and namespace.
 * @constructor
 * @param {Object} config Throws an error if config is null or undefined.
 */
function DefDescriptor(config){
    aura.assert(config, "DefDescriptor config undefined");

    var descriptor="descriptor";
    if(config[descriptor]){
        config=config[descriptor];
    }
    this.qualifiedName=config;
    var prefix=config.split("://");
    if(prefix.length>1){
        this.prefix=prefix[0];
        config=prefix[1];
    }else{
        this.prefix="markup";
    }
    var nameSpace=config.split(':');
    if(nameSpace.length==1){
        nameSpace=config.split('.');
    }
    var hasNamespace=nameSpace.length>1;
    this.namespace=hasNamespace?nameSpace[0]:'';
    this.name=nameSpace[hasNamespace?1:0];
}

DefDescriptor.prototype.auraType = "DefDescriptor";

/**
 * Gets the qualified name.
 * @returns {String}
 */
DefDescriptor.prototype.getQualifiedName = function(){
    return this.qualifiedName;
};

/**
 * Gets the namespace.
 * @returns {String} namespace
 */
DefDescriptor.prototype.getNamespace = function(){
    return this.namespace;
};

/**
 * Gets the name part of the qualified name.
 * @returns {String}
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
 * @returns {Array}
 * @private
 */
DefDescriptor.prototype.parse = function(config){
};

//#include aura.system.DefDescriptor_export
