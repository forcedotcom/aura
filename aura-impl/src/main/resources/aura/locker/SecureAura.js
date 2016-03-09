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

var SecureAura = (function() {
  "use strict";

  /**
   * Construct a new SecureAura.
   *
   * @public
   * @class
   * @constructor
   *
   * @param {Object}
   *            AuraInstance - the Aura Instance to be secured
   * @param {Object}
   *            key - the key to apply to the secure aura
   */
  function SecureAura(AuraInstance, key) {
    setLockerSecret(this, "key", key);
    setLockerSecret(this, "ref", AuraInstance);
    
    Object.freeze(this);
  }

  SecureAura.prototype = Object.create(null, {
    toString: {
      value: function() {
        return "SecureAura: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
      }
    },
    
    "createComponent": SecureThing.createPassThroughMethod("createComponent"),
    "createComponents": SecureThing.createPassThroughMethod("createComponents"),
    "enqueueAction": SecureThing.createPassThroughMethod("enqueueAction"),
    "error": SecureThing.createPassThroughMethod("error"),
    "get": SecureThing.createFilteredMethod("get"),
    "getCallback": SecureThing.createFilteredMethod("getCallback"),
    "getComponent": SecureThing.createFilteredMethod("getComponent"),
    "getRoot": SecureThing.createFilteredMethod("getRoot"),
    "log": SecureThing.createPassThroughMethod("log"),
    "warning": SecureThing.createPassThroughMethod("warning"),

    "util": SecureThing.createPassThroughProperty("util")
  });

  SecureAura.prototype.constructor = SecureAura;
  
  return SecureAura;
})();
