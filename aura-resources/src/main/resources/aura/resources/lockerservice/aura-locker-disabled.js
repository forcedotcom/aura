/**
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Bundle from LockerService-Core
 * Generated: 2018-05-18
 * Version: 0.4.12
 */

(function (exports) {
'use strict';

/* eslint-disable no-unused-vars, prefer-template */
/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This is a mock for non-compliant browsers, in particular for IE11.

// All methods have the same API as AuraLocker.js and it's norman to
// expect unused variables.

// DO NOT USE ES6 METHODS IN THIS FILE.

function evaluate(src) {
  return (0, eval)('(function(){\n' + src + '\n})()');
}

function create(src, key, sourceURL) {
  return {
    globals: window,
    returnValue: evaluate(src)
  };
}

function createForClass(src, defDescriptor) {
  return evaluate('return (\n' + src + '\n)');
}

// @deprecated
function createForDef(src, def) {
  return evaluate(src);
}

function createForModule(src, defDescriptor) {
  return evaluate('return (\n' + src + '\n)');
}

function getEnv(key) {
  return window;
}

function getEnvForSecureObject(st) {
  return window;
}

function getKeyForNamespace(namespace) {
  /* Do Nothing */
}

function getRaw(value) {
  return value;
}

function initialize(types) {
  /* Do Nothing */
}

function isEnabled() {
  return false;
}

// @deprecated
function instanceOf(value, type) {
  return value instanceof type;
}

function runScript(src, namespace) {
  return evaluate(src);
}

function trust(from, thing) {
  /* Do Nothing */
}

function unwrap(from, st) {
  return st;
}

function wrapComponent(component) {
  return component;
}

function wrapComponentEvent(component, event) {
  return event;
}

function wrapEngine(engine) {
  return engine;
}

exports.create = create;
exports.createForClass = createForClass;
exports.createForDef = createForDef;
exports.createForModule = createForModule;
exports.getEnv = getEnv;
exports.getEnvForSecureObject = getEnvForSecureObject;
exports.getKeyForNamespace = getKeyForNamespace;
exports.getRaw = getRaw;
exports.initialize = initialize;
exports.isEnabled = isEnabled;
exports.instanceOf = instanceOf;
exports.runScript = runScript;
exports.trust = trust;
exports.unwrap = unwrap;
exports.wrapComponent = wrapComponent;
exports.wrapComponentEvent = wrapComponentEvent;
exports.wrapEngine = wrapEngine;

}((this.AuraLockerDisabled = this.AuraLockerDisabled || {})));
