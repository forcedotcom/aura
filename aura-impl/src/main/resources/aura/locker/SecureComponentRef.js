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
/*jslint sub: true*/

var SecureComponentRef = (function() {
  "use strict";

  function SecureComponentRef(component, key) {
    setLockerSecret(this, "key", key);
    setLockerSecret(this, "ref", component);
    Object.freeze(this);
  }

  SecureComponentRef.prototype = Object.create(null, {
    toString: {
      value : function() {
        return "SecureComponentRef: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
      }
    },

    "isValid": SecureThing.createPassThroughMethod("isValid"),
    "isInstanceOf": SecureThing.createPassThroughMethod("isInstanceOf"),
    "isRendered": SecureThing.createPassThroughMethod("isRendered"),
    "getGlobalId": SecureThing.createPassThroughMethod("getGlobalId"),
    "getLocalId": SecureThing.createPassThroughMethod("getLocalId"),
    "addValueProvider": SecureThing.createPassThroughMethod("addValueProvider"),
    "set": SecureThing.createFilteredMethod("set"),
    "get": SecureThing.createFilteredMethod("get")

  });

  SecureComponentRef.prototype.constructor = SecureComponentRef;

  return SecureComponentRef;
})();
