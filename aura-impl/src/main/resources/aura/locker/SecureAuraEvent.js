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

var SecureAuraEvent = (function() {
  "use strict";

  function getEvent(ae) {
    return ae._get("event", $A.lockerService.masterKey);
  }

  function getKey(ae) {
    return $A.lockerService.util._getKey(ae, $A.lockerService.masterKey);
  }

  function SecureAuraEvent(event, key) {
    SecureThing.call(this, key, "event");
    $A.lockerService.util.applyKey(event, key);
    // keying the event in case it is passed around by the component logic
    this._set("event", event, $A.lockerService.masterKey);
    Object.freeze(this);
  }

  SecureAuraEvent.prototype = Object.create(SecureThing.prototype, {
    toString: {
      value: function() {
        return "SecureAuraEvent: " + getEvent(this).getName() + " { key: " + JSON.stringify(getKey(this)) + " }";
      }
    },
    "fire": SecureThing.createPassThroughMethod("fire"),
    "getName": SecureThing.createPassThroughMethod("getName"),
    "getParam": SecureThing.createFilteredMethod("getParam"),
    "getParams": SecureThing.createFilteredMethod("getParams"),
    "getSource": SecureThing.createFilteredMethod('getSource'),
    "setParam": SecureThing.createPassThroughMethod("setParam"),
    "setParams": SecureThing.createPassThroughMethod("setParams")
  });

  SecureAuraEvent.prototype.constructor = SecureAuraEvent;

  return SecureAuraEvent;
})();
