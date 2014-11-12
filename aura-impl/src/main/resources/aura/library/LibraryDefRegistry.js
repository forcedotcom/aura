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
 * @description A registry for libraryDefs.
 * @constructor
 */
$A.ns.LibraryDefRegistry = function LibraryDefRegistry() {
    this.libraryDefs = {};
};

$A.ns.LibraryDefRegistry.prototype.auraType = "LibraryDefRegistry";

/**
 * Returns an evaluated module or evaluates one.
 * @param {String} descriptor locator in the form namespace:libraryName:jsLibraryName or a libraryDefConfig
 * @param {Object} libraryDef if provided and the locator does not resolve to an evaluated module, the libraryDef
 *     is evaluated and registered. 
 * @returns {Object} Evaluated module instance.
 */
$A.ns.LibraryDefRegistry.prototype.getDef = function(descriptor, libraryDef) {
	if ($A.util.isObject(descriptor)) {
		libraryDef = descriptor;
		descriptor = descriptor["descriptor"];
	}
	
    aura.assert(descriptor, "library locator is required");
    
    if (libraryDef) {
        this.libraryDefs[descriptor] = this.libraryDefs[descriptor] || {};
        var registered = this.libraryDefs[descriptor];
        
	    $A.util.forEach($A.util.keys(libraryDef["includes"]), function(libName) {
	        if (!(libName in registered)) {
	            libraryDef["includes"][libName]($A.util.bind(this.define, this)); // adds to the registry 
	        }
	    }, this);
    }
    
    return this.libraryDefs[descriptor];
};

$A.ns.LibraryDefRegistry.prototype.define = function(/*var args*/) {
    var args = Array.prototype.slice.call(arguments);
    var identifier = $A.ns.LibraryDefRegistry.parseLocator(args.shift());
    var module = args.pop();
    var imports = $A.util.map(args, function(arg) {
        // Externally located definitions are already fully qualified:
        if ($A.ns.LibraryDefRegistry.isLocator(arg)) {
            return this.require(arg);
        }
        
        return this.require(identifier.library + ":" + arg);
    }, this);
    
    this.libraryDefs[identifier.library] = this.libraryDefs[identifier.library] || {};
    this.libraryDefs[identifier.library][identifier.name] = module.apply({}, imports);
};

$A.ns.LibraryDefRegistry.prototype.require = function(locator) {
    var identifier = $A.ns.LibraryDefRegistry.parseLocator(locator);
    if (this.libraryDefs[identifier.library] && this.libraryDefs[identifier.library][identifier.name]) {
        return this.libraryDefs[identifier.library][identifier.name];
    } else {
        throw "Library with locator: " + locator + " is not registered";
    }
};

$A.ns.LibraryDefRegistry.isLocator = function(locator) {
    return (locator.split(":").length === 3);
};

$A.ns.LibraryDefRegistry.parseLocator = function(locator) {
    var tokens = locator.split(":");
    if (tokens.length !== 3) {
        throw "Library locator must be in the form: 'namespace:libraryName:fileName'";
    }
    return {
        library: tokens[0] + ":" + tokens[1],
        name: tokens[2]
    };
};