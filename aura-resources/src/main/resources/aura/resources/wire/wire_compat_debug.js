

/* proxy-compat-disable */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.WireService = {})));
}(this, (function (exports) { 'use strict';

var assert = {
  invariant: function invariant(value, msg) {
    if (!value) {
      throw new Error("Invariant Violation: " + msg);
    }
  },
  isTrue: function isTrue(value, msg) {
    if (!value) {
      throw new Error("Assert Violation: " + msg);
    }
  },
  isFalse: function isFalse(value, msg) {
    if (value) {
      throw new Error("Assert Violation: " + msg);
    }
  }
};

// key in engine service context for wire service context
var CONTEXT_ID = '@wire'; // key in wire service context for updated listener metadata

var CONTEXT_UPDATED = 'updated'; // key in wire service context for connected listener metadata

var CONTEXT_CONNECTED = 'connected'; // key in wire service context for disconnected listener metadata

var CONTEXT_DISCONNECTED = 'disconnected'; // wire event target life cycle connectedCallback hook event type

var CONNECT = "connect"; // wire event target life cycle disconnectedCallback hook event type

var DISCONNECT = "disconnect"; // wire event target life cycle config changed hook event type

var CONFIG = "config";

function _instanceof(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

/*
 * Detects property changes by installing setter/getter overrides on the component
 * instance.
 *
 * TODO - in 216 engine will expose an 'updated' callback for services that is invoked
 * once after all property changes occur in the event loop.
 */

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas list of config listener metadata (config listeners and their context)
 * @param paramValues values for all wire adapter config params
 */
function invokeConfigListeners(configListenerMetadatas, paramValues) {
  configListenerMetadatas.forEach(function (metadata) {
    var listener = metadata.listener,
        statics = metadata.statics,
        params = metadata.params;
    var resolvedParams = Object.create(null);

    if (params) {
      var keys = Object.keys(params);

      for (var j = 0, jlen = keys.length; j < jlen; j++) {
        var key = keys[j];
        var value = paramValues[params[key]];
        resolvedParams[key] = value;
      }
    } // TODO - consider read-only membrane to enforce invariant of immutable config


    var config = Object.assign({}, statics, resolvedParams);
    listener.call(undefined, config);
  });
}

function updated(cmp, prop, configContext) {
  if (!configContext.mutated) {
    configContext.mutated = new Set(); // collect all prop changes via a microtask

    Promise.resolve().then(updatedFuture.bind(undefined, cmp, configContext));
  }

  configContext.mutated.add(prop);
}

function updatedFuture(cmp, configContext) {
  var uniqueListeners = new Set(); // configContext.mutated must be set prior to invoking this function

  var mutated = configContext.mutated;
  delete configContext.mutated;
  mutated.forEach(function (prop) {
    var value = cmp[prop];

    if (configContext.values[prop] === value) {
      return;
    }

    configContext.values[prop] = value;
    var listeners = configContext.listeners[prop];

    for (var i = 0, len = listeners.length; i < len; i++) {
      uniqueListeners.add(listeners[i]);
    }
  });
  invokeConfigListeners(uniqueListeners, configContext.values);
}
/**
 * Installs setter override to trap changes to a property, triggering the config listeners.
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param context The service context
 */


function installTrap(cmp, prop, configContext) {
  var callback = updated.bind(undefined, cmp, prop, configContext);
  var newDescriptor = getOverrideDescriptor(cmp, prop, callback);
  Object.defineProperty(cmp, prop, newDescriptor);
}
/**
 * Finds the descriptor of the named property on the prototype chain
 * @param target The target instance/constructor function
 * @param propName Name of property to find
 * @param protoSet Prototypes searched (to avoid circular prototype chains)
 */

function findDescriptor(target, propName, protoSet) {
  protoSet = protoSet || [];

  if (!target || protoSet.indexOf(target) > -1) {
    return null; // null, undefined, or circular prototype definition
  }

  var descriptor = Object.getOwnPropertyDescriptor(target, propName);

  if (descriptor) {
    return descriptor;
  }

  var proto = Object.getPrototypeOf(target);

  if (!proto) {
    return null;
  }

  protoSet.push(target);
  return findDescriptor(proto, propName, protoSet);
}
/**
 * Gets a property descriptor that monitors the provided property for changes
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param callback a function to invoke when the prop's value changes
 * @return A property descriptor
 */

function getOverrideDescriptor(cmp, prop, callback) {
  var descriptor = findDescriptor(cmp, prop);
  var enumerable;
  var get;
  var set; // TODO: this does not cover the override of existing descriptors at the instance level
  // and that's ok because eventually we will not need to do any of these :)

  if (descriptor === null || descriptor.get === undefined && descriptor.set === undefined) {
    var value_1 = cmp[prop];
    enumerable = true;

    get = function get() {
      return value_1;
    };

    set = function set(newValue) {
      value_1 = newValue;
      callback();
    };
  } else {
    var originalSet_1 = descriptor.set,
        originalGet_1 = descriptor.get;
    enumerable = descriptor.enumerable;

    set = function set(newValue) {
      if (originalSet_1) {
        originalSet_1.call(cmp, newValue);
      }

      callback();
    };

    get = function get() {
      return originalGet_1 ? originalGet_1.call(cmp) : undefined;
    };
  }

  return {
    set: set,
    get: get,
    enumerable: enumerable,
    configurable: true
  };
}

function removeListener(listeners, toRemove) {
  var idx = listeners.indexOf(toRemove);

  if (idx > -1) {
    listeners.splice(idx, 1);
  }
}

function removeConfigListener(configListenerMetadatas, toRemove) {
  for (var i = 0, len = configListenerMetadatas.length; i < len; i++) {
    if (configListenerMetadatas[i].listener === toRemove) {
      configListenerMetadatas.splice(i, 1);
      return;
    }
  }
}

var WireEventTarget =
/** @class */
function () {
  function WireEventTarget(cmp, def, context, wireDef, wireTarget) {
    this._cmp = cmp;
    this._def = def;
    this._context = context;
    this._wireDef = wireDef;
    this._wireTarget = wireTarget;
  }

  WireEventTarget.prototype.addEventListener = function (type, listener) {
    var _this = this;

    switch (type) {
      case CONNECT:
        var connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
        assert.isFalse(connectedListeners.includes(listener), 'must not call addEventListener("connect") with the same listener');
        connectedListeners.push(listener);
        break;

      case DISCONNECT:
        var disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
        assert.isFalse(disconnectedListeners.includes(listener), 'must not call addEventListener("disconnect") with the same listener');
        disconnectedListeners.push(listener);
        break;

      case CONFIG:
        var params_1 = this._wireDef.params;
        var statics = this._wireDef.static;
        var paramsKeys = Object.keys(params_1); // no dynamic params, only static, so fire config once

        if (paramsKeys.length === 0) {
          var config = statics || {};
          listener.call(undefined, config);
          return;
        }

        var configListenerMetadata_1 = {
          listener: listener,
          statics: statics,
          params: params_1
        };
        var configContext_1 = this._context[CONTEXT_ID][CONTEXT_UPDATED];
        paramsKeys.forEach(function (param) {
          var prop = params_1[param];
          var configListenerMetadatas = configContext_1.listeners[prop];

          if (!configListenerMetadatas) {
            configListenerMetadatas = [configListenerMetadata_1];
            configContext_1.listeners[prop] = configListenerMetadatas;
            installTrap(_this._cmp, prop, configContext_1);
          } else {
            configListenerMetadatas.push(configListenerMetadata_1);
          }
        });
        break;

      default:
        throw new Error("unsupported event type " + type);
    }
  };

  WireEventTarget.prototype.removeEventListener = function (type, listener) {
    switch (type) {
      case CONNECT:
        var connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
        removeListener(connectedListeners, listener);
        break;

      case DISCONNECT:
        var disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
        removeListener(disconnectedListeners, listener);
        break;

      case CONFIG:
        var paramToConfigListenerMetadata_1 = this._context[CONTEXT_ID][CONTEXT_UPDATED].listeners;
        var params_2 = this._wireDef.params;

        if (params_2) {
          Object.keys(params_2).forEach(function (param) {
            var prop = params_2[param];
            var configListenerMetadatas = paramToConfigListenerMetadata_1[prop];

            if (configListenerMetadatas) {
              removeConfigListener(configListenerMetadatas, listener);
            }
          });
        }

        break;

      default:
        throw new Error("unsupported event type " + type);
    }
  };

  WireEventTarget.prototype.dispatchEvent = function (evt) {
    if (_instanceof(evt, ValueChangedEvent)) {
      var value = evt.value;

      if (this._wireDef.method) {
        this._cmp[this._wireTarget](value);
      } else {
        this._cmp[this._wireTarget] = value;
      }

      return false; // canceling signal since we don't want this to propagate
    } else if (evt.type === 'WireContextEvent') {
      // NOTE: kill this hack
      // we should only allow ValueChangedEvent
      // however, doing so would require adapter to implement machinery
      // that fire the intended event as DOM event and wrap inside ValueChagnedEvent
      return this._cmp.dispatchEvent(evt);
    } else {
      throw new Error("Invalid event " + evt + ".");
    }
  };

  return WireEventTarget;
}();
/**
 * Event fired by wire adapters to emit a new value.
 */


var ValueChangedEvent =
/** @class */
function () {
  function ValueChangedEvent(value) {
    this.type = 'ValueChangedEvent';
    this.value = value;
  }

  return ValueChangedEvent;
}();

/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

var adapterFactories = new Map();
/**
 * Invokes the specified callbacks.
 * @param listeners functions to call
 */

function invokeListener(listeners) {
  for (var i = 0, len = listeners.length; i < len; ++i) {
    listeners[i].call(undefined);
  }
}
/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle events.
 */


var wireService = {
  wiring: function wiring(cmp, data, def, context) {
    var wireContext = context[CONTEXT_ID] = Object.create(null);
    wireContext[CONTEXT_CONNECTED] = [];
    wireContext[CONTEXT_DISCONNECTED] = [];
    wireContext[CONTEXT_UPDATED] = {
      listeners: {},
      values: {}
    }; // engine guarantees invocation only if def.wire is defined

    var wireStaticDef = def.wire;
    var wireTargets = Object.keys(wireStaticDef);

    for (var i = 0, len = wireTargets.length; i < len; i++) {
      var wireTarget = wireTargets[i];
      var wireDef = wireStaticDef[wireTarget];
      var adapterFactory = adapterFactories.get(wireDef.adapter);

      if (adapterFactory) {
        var wireEventTarget = new WireEventTarget(cmp, def, context, wireDef, wireTarget);
        adapterFactory({
          dispatchEvent: wireEventTarget.dispatchEvent.bind(wireEventTarget),
          addEventListener: wireEventTarget.addEventListener.bind(wireEventTarget),
          removeEventListener: wireEventTarget.removeEventListener.bind(wireEventTarget)
        });
      }
    }
  },
  connected: function connected(cmp, data, def, context) {
    var listeners;

    if (!def.wire || !(listeners = context[CONTEXT_ID][CONTEXT_CONNECTED])) {
      return;
    }

    invokeListener(listeners);
  },
  disconnected: function disconnected(cmp, data, def, context) {
    var listeners;

    if (!def.wire || !(listeners = context[CONTEXT_ID][CONTEXT_DISCONNECTED])) {
      return;
    }

    invokeListener(listeners);
  }
};
/**
 * Registers the wire service.
 */

function registerWireService(registerService) {
  registerService(wireService);
}
/**
 * Registers a wire adapter.
 */

function register(adapterId, adapterFactory) {
  assert.isTrue(adapterId, 'adapter id must be truthy');
  assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a callable');
  adapterFactories.set(adapterId, adapterFactory);
}

exports.registerWireService = registerWireService;
exports.register = register;
exports.ValueChangedEvent = ValueChangedEvent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/** version: 0.20.4 */
