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

  function SecureIFrameElement(el, key) {
    setLockerSecret(this, "key", key);
    setLockerSecret(this, "ref", el);
    // applying standard secure element properties
    SecureElement.enableSecureProperties(this);
    Object.freeze(this);
  }

  SecureIFrameElement.prototype = Object.create(null, {
    toString: {
      value : function() {
        return "SecureIFrameElement: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
      }
    },

    // Standard list of iframe's properties from:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
    // Note: ignoring 'contentDocument', 'contentWindow', 'sandbox' and 'srcdoc' from the list above.
    height: SecureThing.createPassThroughProperty("height"),
    width: SecureThing.createPassThroughProperty("width"),
    name: SecureThing.createPassThroughProperty("name"),
    src: SecureThing.createPassThroughProperty("src"),

    // Standard HTMLElement methods
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
    blur: SecureThing.createPassThroughMethod("blur"),
    focus: SecureThing.createPassThroughMethod("focus")

  });

  SecureIFrameElement.prototype.constructor = SecureIFrameElement;

  return SecureIFrameElement;
})();
