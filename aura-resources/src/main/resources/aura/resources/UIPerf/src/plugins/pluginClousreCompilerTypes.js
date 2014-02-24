/*
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jshint expr:true*/

/** This file is used for the closure compiler in advanced mode to define custom data types and allows for better minification and type checking */

/**
 * The interface used with any plugins.
 *
 * @interface
 */
function IPlugin() {}

/**
 * @param {?Object.<string, *>=} config
 * @return {!IPlugin}
 */
IPlugin.prototype.init;
/**
 * @return {boolean}
 */
IPlugin.prototype.is_complete;