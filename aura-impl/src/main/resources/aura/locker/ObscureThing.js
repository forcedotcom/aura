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
var ObscureThing = (function() {
  "use strict";

  function getThing(o) {
    return o._get("o", $A.lockerService.masterKey);
  }

  function getKey(o) {
    return $A.lockerService.util._getKey(o, $A.lockerService.masterKey);
  }

  /**
   * When a locked down component does not have access to a DOM element
   * or another component, it will instead get access to an ObscureThing
   * instance, this way the element or component cannot be manipulated
   * in user-land, but can be re-piped into the framework, which
   * could unwrap the ObscureThing, and use the underlaying object.
   **/
  function ObscureThing(o, key) {
    SecureThing.call(this, key, "o");
    this._set("o", o, $A.lockerService.masterKey);
    Object.freeze(this);
  }

  ObscureThing.prototype = Object.create(SecureThing.prototype, {
    toString : {
      value : function() {
        return "ObscureThing: " + getThing(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
      }
    },
    unwrap: {
      value: function(mk) {
        if (mk !== $A.lockerService.masterKey) {
          throw new Error("Access denied");
        }
        return getThing(this);
      },
      enumerable: false
    }
  });

  ObscureThing.prototype.constructor = ObscureThing;

  return ObscureThing;

})();
