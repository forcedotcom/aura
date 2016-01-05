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

//#include aura.locker.SecureThing
var SecureAura = (function() {
  "use strict";

  function getAuraInstance(sa) {
		return sa._get("aura", $A.lockerService.masterKey);
	}

  function getKey(sa) {
    return $A.lockerService.util._getKey(sa, $A.lockerService.masterKey);
  }

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
    SecureThing.call(this, key, "aura");
    this._set("aura", AuraInstance, $A.lockerService.masterKey);
    // Creating a proxy of the Aura Instance to preserve backward compatibility, but
    // eventually we want to ignore any API that is not a public API in Aura. For now,
    // we settle on only enumerable properties (whether they are own or inherited).
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
    for (var name in AuraInstance) {
      if (SecureAura.prototype.hasOwnProperty(name)) {
        // ignoring anything that SecureAura already implements
        return;
      }
      Object.defineProperty(this, name, SecureThing.createPassThroughProperty(name));
    }
    Object.freeze(this);
  }

  SecureAura.prototype = Object.create(SecureThing.prototype, {
    toString: {
      value: function() {
        return "SecureAura: " + getAuraInstance(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
      }
    },
    getComponent: {
      value: function(globalId) {
        var key = getKey(this);
        var c = getAuraInstance(this).getComponent(globalId);
        $A.lockerService.util.verifyAccess(key, c);
        return $A.lockerService.wrapComponent(c);
      }
    }
  });

  SecureAura.prototype.constructor = SecureAura;

  return SecureAura;
})();
