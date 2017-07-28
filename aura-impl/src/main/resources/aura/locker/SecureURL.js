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

// For URL, we only need to tame one static method. That method is on the
// window.URL primordial and disappears from instances of URL. We only create
// the secure object and we will let the deep freeze operation make it tamper
// proof.

// Taming of URL createObjectURL will not be necessary on webkit
// "CSP rules ignored when a page navigates to a blob URL" is declassified,
// https://bugs.webkit.org/show_bug.cgi?id=174883

// and once the correct behavior on Edge is confirmed (curently in development)
// https://developer.microsoft.com/en-us/microsoft-edge/platform/status/urlapi/

// Only FireFox implements the correct behavior.

var unsecureURL = URL;

var SecureURLMethods = Object.create(null,{
  'createObjectURL': {
    value: function(object) {
      if (Object.prototype.toString.call(object) === '[object Blob]') {
        if (object.type === 'text/html') {
          // There are no relible ways to convert syncronously
          // a blob back to a string. Disallow until
          // <rdar://problem/33575448> is declassified
          throw new TypeError("SecureURL does not allow creation of Object URL from blob type " + object.type);
        }
      }
      // IMPORTANT: thisArg is the target of the proxy.
      return unsecureURL.createObjectURL(object);
    }
  },
  'toString': {
    value: function() {
      return "SecureURL: " + Object.prototype.toString.call(unsecureURL);
    }
  }
});

var SecureURL = new Proxy(unsecureURL, {
  get: function (target, name) {
    // Give priority to the overritten methods.
    var desc = Object.getOwnPropertyDescriptor(SecureURLMethods, name);
    if (desc === undefined) {
      desc = Object.getOwnPropertyDescriptor(target, name);
    }
    if (desc === undefined || desc.value === undefined) {
      return undefined;
    }
    // Properties not found the object are not static.
    if (Object.keys(target).indexOf(name) < 0) {
      return desc.value;
    }
    // Prevent static methods from executing in the context of the proxy.
    return function() {
      return desc.value.apply(undefined, arguments);
    };
}
});


