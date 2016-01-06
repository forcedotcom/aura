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

var SecureIFrameElement = (function() {
  "use strict";

  // Standard list of iframe's properties from:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
  var IFrameAttributes = ['height', 'name', 'src', 'width'];
  // Note: ignoring 'contentDocument', 'contentWindow', 'sandbox' and 'srcdoc' from the list above.

  function getElement(se) {
    return se._get("el", $A.lockerService.masterKey);
  }

  function getKey(se) {
    return $A.lockerService.util._getKey(se, $A.lockerService.masterKey);
  }

  function SecureIFrameElement(el, key) {
    SecureThing.call(this, key, "el");

    $A.lockerService.util.applyKey(el, key);

    this._set("el", el, $A.lockerService.masterKey);
    // applying standard secure properties
    SecureElement.enableSecureProperties(this);
    // applying iframe's specific attributes
    IFrameAttributes.forEach(function (name) {
      Object.defineProperty(this, name, SecureThing.createPassThroughProperty(name));
    }, this);

    Object.freeze(this);
  }

  SecureIFrameElement.prototype = Object.create(SecureThing.prototype, {
    toString: {
      value : function() {
        return "SecureIFrameElement: " + getElement(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
      }
    },

    // Standard HTMLElement methods
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
    blur: SecureThing.createPassThroughMethod("blur"),
    focus: SecureThing.createPassThroughMethod("focus")
  });

  SecureIFrameElement.prototype.constructor = SecureIFrameElement;

  return SecureIFrameElement;
})();
