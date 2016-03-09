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

var SecureDOMEvent = (function() {
  "use strict";

  function isDOMElementOrNode(o) {
    return typeof o === "object" &&
        ((typeof HTMLElement === "object" && o instanceof HTMLElement) ||
        (typeof Node === "object" && o instanceof Node) ||
        (typeof o.nodeType === "number" && typeof o.nodeName === "string"));
  }

  function filterTouchesDescriptor(propName) {
    // descriptor to produce a new collection of touches where the target of each
    // touch is a secure element
    return {
      get: function() {
        // perf hard-wired in case there is not a touches to wrap
        var event = getLockerSecret(this, "event");
        var touches = event[propName];
        if (!touches) {
          return touches;
        }
        return touches.map(function (touch) {
          // touches is normally a big big collection of touch objects,
          // we do not want to pre-process them all, just create a the getters
          // and process the accessor on the spot. e.g.:
          // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
          return Object.keys(touch).reduce(function (o, p) {
            Object.defineProperty(o, p, {
              // all props in a touch object are readonly by spec:
              // https://developer.mozilla.org/en-US/docs/Web/API/Touch
              get: function () {
                if (isDOMElementOrNode(touch[p])) {
                  $A.lockerService.util.verifyAccess(event, touch[p]);
                  return new SecureElement(touch[p], getLockerSecret(event, "key"));
                }
                return touch[p];
              }
            });
          }, {});
        });
      }
    };
  }

  function throwAccessViolation(propName) {
    return {
      get: function() {
        throw Error("Access denied for insecure " + propName);
      }
    };
  }

  var DOMEventSecureDescriptors = {
    // Events properties that are DOM Elements were compiled from
    // https://developer.mozilla.org/en-US/docs/Web/Events
    target: SecureThing.createFilteredProperty("target"),
    currentTarget: SecureThing.createFilteredProperty("currentTarget"),
    relatedTarget: SecureThing.createFilteredProperty("relatedTarget"),

    // Touch Events are special on their own:
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch
    touches: filterTouchesDescriptor("touch"),
    targetTouches: filterTouchesDescriptor("targetTouches"),
    changedTouches: filterTouchesDescriptor("changedTouches"),

    // WindowProxy for events like compositionupdate
    // disabling this capability seems to be the right thing to do for now.
    view: throwAccessViolation("view"),

    // non-standard properties and aliases
    srcElement: SecureThing.createFilteredProperty("srcElement"),
    explicitOriginalTarget: SecureThing.createFilteredProperty("explicitOriginalTarget"),
    originalTarget: SecureThing.createFilteredProperty("originalTarget")
  };

  function SecureDOMEvent(event, key) {
    setLockerSecret(this, "key", key);
    setLockerSecret(this, "ref", event);
    
    // re-exposing externals
    for (var name in event) {
      if (name in SecureDOMEvent.prototype) {
        // ignoring anything that SecureDOMEvent already implements
        return;
      }
      
      // every DOM event has a different shape, we apply filters when possible,
      // and bypass when no secure filter is found.
      Object.defineProperty(this, name, DOMEventSecureDescriptors[name] || SecureThing.createFilteredProperty(name));
    }
    
    Object.freeze(this);
  }

  SecureDOMEvent.prototype = Object.create(null, {
    toString: {
      value: function() {
        return "SecureDOMEvent: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
      }
    }
  });

  SecureDOMEvent.prototype.constructor = SecureDOMEvent;

  return SecureDOMEvent;
})();
