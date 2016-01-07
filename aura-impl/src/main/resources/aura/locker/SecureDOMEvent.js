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

  function getEvent(se) {
    return se._get("event", $A.lockerService.masterKey);
  }

  function getKey(se) {
    return $A.lockerService.util._getKey(se, $A.lockerService.masterKey);
  }

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
        var event = getEvent(this);
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
                  return SecureDocument.wrap(touch[p]);
                }
                return touch[p];
              }
            });
          }, {});
        });
      }
    };
  }

  function filterTargetDescriptor(propName) {
    // descriptor to produce a new target
    return {
      get: function() {
        // perf hard-wired in case there is not a target to wrap
        var event = getEvent(this);
        var target = event[propName];
        if (!target) {
          return target;
        }
        if (isDOMElementOrNode(target)) {
          $A.lockerService.util.verifyAccess(event, target);
          return SecureDocument.wrap(target);
        }
        return target;
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
    target: filterTargetDescriptor("target"),
    curretTarget: filterTargetDescriptor("currentTarget"),
    relatedTarget: filterTargetDescriptor("relatedTarget"),

    // Touch Events are special on their own:
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch
    touches: filterTouchesDescriptor("touch"),
    targetTouches: filterTouchesDescriptor("targetTouches"),
    changedTouches: filterTouchesDescriptor("changedTouches"),

    // WindowProxy for events like compositionupdate
    // disabling this capability seems to be the right thing to do for now.
    view: throwAccessViolation("view"),

    // non-standard properties and aliases
    srcElement: filterTargetDescriptor("srcElement"),
    explicitOriginalTarget: filterTargetDescriptor("explicitOriginalTarget"),
    originalTarget: filterTargetDescriptor("originalTarget")
  };

  function SecureDOMEvent(event, key) {
    SecureThing.call(this, key, "event");
    $A.lockerService.util.applyKey(event, key);
    // keying the event in case it is passed around by the component logic
    this._set("event", event, $A.lockerService.masterKey);

    // re-exposing externals
    for (var name in event) {
      if (SecureDOMEvent.prototype.hasOwnProperty(name)) {
        // ignoring anything that SecureDOMEvent already implements
        return;
      }
      // every DOM event has a different shape, we apply filters when possible,
      // and bypass when no secure filter is found.
      Object.defineProperty(this, name, DOMEventSecureDescriptors[name] || SecureThing.createPassThroughProperty(name));
    }
    Object.freeze(this);
  }

  SecureDOMEvent.prototype = Object.create(SecureThing.prototype, {
    toString: {
      value: function() {
        return "SecureDOMEvent: " + getEvent(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
      }
    }
  });

  SecureDOMEvent.prototype.constructor = SecureDOMEvent;

  return SecureDOMEvent;
})();
