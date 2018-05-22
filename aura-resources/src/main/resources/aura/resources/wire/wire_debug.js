/* proxy-compat-disable */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.WireService = {})));
}(this, (function (exports) { 'use strict';

var assert = {
    invariant(value, msg) {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    },
    isTrue(value, msg) {
        if (!value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    isFalse(value, msg) {
        if (value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
};

// key in engine service context for wire service context
const CONTEXT_ID = '@wire';
// key in wire service context for updated listener metadata
const CONTEXT_UPDATED = 'updated';
// key in wire service context for connected listener metadata
const CONTEXT_CONNECTED = 'connected';
// key in wire service context for disconnected listener metadata
const CONTEXT_DISCONNECTED = 'disconnected';
// wire event target life cycle connectedCallback hook event type
const CONNECT = "connect";
// wire event target life cycle disconnectedCallback hook event type
const DISCONNECT = "disconnect";
// wire event target life cycle config changed hook event type
const CONFIG = "config";

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
    configListenerMetadatas.forEach((metadata) => {
        const { listener, statics, params } = metadata;
        const resolvedParams = Object.create(null);
        if (params) {
            const keys = Object.keys(params);
            for (let j = 0, jlen = keys.length; j < jlen; j++) {
                const key = keys[j];
                const value = paramValues[params[key]];
                resolvedParams[key] = value;
            }
        }
        // TODO - consider read-only membrane to enforce invariant of immutable config
        const config = Object.assign({}, statics, resolvedParams);
        listener.call(undefined, config);
    });
}
function updated(cmp, prop, configContext) {
    if (!configContext.mutated) {
        configContext.mutated = new Set();
        // collect all prop changes via a microtask
        Promise.resolve().then(updatedFuture.bind(undefined, cmp, configContext));
    }
    configContext.mutated.add(prop);
}
function updatedFuture(cmp, configContext) {
    const uniqueListeners = new Set();
    // configContext.mutated must be set prior to invoking this function
    const mutated = configContext.mutated;
    delete configContext.mutated;
    mutated.forEach(prop => {
        const value = cmp[prop];
        if (configContext.values[prop] === value) {
            return;
        }
        configContext.values[prop] = value;
        const listeners = configContext.listeners[prop];
        for (let i = 0, len = listeners.length; i < len; i++) {
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
    const callback = updated.bind(undefined, cmp, prop, configContext);
    const newDescriptor = getOverrideDescriptor(cmp, prop, callback);
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
    const descriptor = Object.getOwnPropertyDescriptor(target, propName);
    if (descriptor) {
        return descriptor;
    }
    const proto = Object.getPrototypeOf(target);
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
    const descriptor = findDescriptor(cmp, prop);
    let enumerable;
    let get;
    let set;
    // TODO: this does not cover the override of existing descriptors at the instance level
    // and that's ok because eventually we will not need to do any of these :)
    if (descriptor === null || (descriptor.get === undefined && descriptor.set === undefined)) {
        let value = cmp[prop];
        enumerable = true;
        get = function () {
            return value;
        };
        set = function (newValue) {
            value = newValue;
            callback();
        };
    }
    else {
        const { set: originalSet, get: originalGet } = descriptor;
        enumerable = descriptor.enumerable;
        set = function (newValue) {
            if (originalSet) {
                originalSet.call(cmp, newValue);
            }
            callback();
        };
        get = function () {
            return originalGet ? originalGet.call(cmp) : undefined;
        };
    }
    return {
        set,
        get,
        enumerable,
        configurable: true,
    };
}

function removeListener(listeners, toRemove) {
    const idx = listeners.indexOf(toRemove);
    if (idx > -1) {
        listeners.splice(idx, 1);
    }
}
function removeConfigListener(configListenerMetadatas, toRemove) {
    for (let i = 0, len = configListenerMetadatas.length; i < len; i++) {
        if (configListenerMetadatas[i].listener === toRemove) {
            configListenerMetadatas.splice(i, 1);
            return;
        }
    }
}
class WireEventTarget {
    constructor(cmp, def, context, wireDef, wireTarget) {
        this._cmp = cmp;
        this._def = def;
        this._context = context;
        this._wireDef = wireDef;
        this._wireTarget = wireTarget;
    }
    addEventListener(type, listener) {
        switch (type) {
            case CONNECT:
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                assert.isFalse(connectedListeners.includes(listener), 'must not call addEventListener("connect") with the same listener');
                connectedListeners.push(listener);
                break;
            case DISCONNECT:
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                assert.isFalse(disconnectedListeners.includes(listener), 'must not call addEventListener("disconnect") with the same listener');
                disconnectedListeners.push(listener);
                break;
            case CONFIG:
                const params = this._wireDef.params;
                const statics = this._wireDef.static;
                const paramsKeys = Object.keys(params);
                // no dynamic params, only static, so fire config once
                if (paramsKeys.length === 0) {
                    const config = statics || {};
                    listener.call(undefined, config);
                    return;
                }
                const configListenerMetadata = {
                    listener,
                    statics,
                    params
                };
                const configContext = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                paramsKeys.forEach(param => {
                    const prop = params[param];
                    let configListenerMetadatas = configContext.listeners[prop];
                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[prop] = configListenerMetadatas;
                        installTrap(this._cmp, prop, configContext);
                    }
                    else {
                        configListenerMetadatas.push(configListenerMetadata);
                    }
                });
                break;
            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }
    removeEventListener(type, listener) {
        switch (type) {
            case CONNECT:
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                removeListener(connectedListeners, listener);
                break;
            case DISCONNECT:
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                removeListener(disconnectedListeners, listener);
                break;
            case CONFIG:
                const paramToConfigListenerMetadata = this._context[CONTEXT_ID][CONTEXT_UPDATED].listeners;
                const { params } = this._wireDef;
                if (params) {
                    Object.keys(params).forEach(param => {
                        const prop = params[param];
                        const configListenerMetadatas = paramToConfigListenerMetadata[prop];
                        if (configListenerMetadatas) {
                            removeConfigListener(configListenerMetadatas, listener);
                        }
                    });
                }
                break;
            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }
    dispatchEvent(evt) {
        if (evt instanceof ValueChangedEvent) {
            const value = evt.value;
            if (this._wireDef.method) {
                this._cmp[this._wireTarget](value);
            }
            else {
                this._cmp[this._wireTarget] = value;
            }
            return false; // canceling signal since we don't want this to propagate
        }
        else if (evt.type === 'WireContextEvent') {
            // NOTE: kill this hack
            // we should only allow ValueChangedEvent
            // however, doing so would require adapter to implement machinery
            // that fire the intended event as DOM event and wrap inside ValueChagnedEvent
            return this._cmp.dispatchEvent(evt);
        }
        else {
            throw new Error(`Invalid event ${evt}.`);
        }
    }
}
/**
 * Event fired by wire adapters to emit a new value.
 */
class ValueChangedEvent {
    constructor(value) {
        this.type = 'ValueChangedEvent';
        this.value = value;
    }
}

/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */
// wire adapters: wire adapter id => adapter ctor
const adapterFactories = new Map();
/**
 * Invokes the specified callbacks.
 * @param listeners functions to call
 */
function invokeListener(listeners) {
    for (let i = 0, len = listeners.length; i < len; ++i) {
        listeners[i].call(undefined);
    }
}
/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle events.
 */
const wireService = {
    wiring: (cmp, data, def, context) => {
        const wireContext = context[CONTEXT_ID] = Object.create(null);
        wireContext[CONTEXT_CONNECTED] = [];
        wireContext[CONTEXT_DISCONNECTED] = [];
        wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };
        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        for (let i = 0, len = wireTargets.length; i < len; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            const adapterFactory = adapterFactories.get(wireDef.adapter);
            if (adapterFactory) {
                const wireEventTarget = new WireEventTarget(cmp, def, context, wireDef, wireTarget);
                adapterFactory({
                    dispatchEvent: wireEventTarget.dispatchEvent.bind(wireEventTarget),
                    addEventListener: wireEventTarget.addEventListener.bind(wireEventTarget),
                    removeEventListener: wireEventTarget.removeEventListener.bind(wireEventTarget)
                });
            }
        }
    },
    connected: (cmp, data, def, context) => {
        let listeners;
        if (!def.wire || !(listeners = context[CONTEXT_ID][CONTEXT_CONNECTED])) {
            return;
        }
        invokeListener(listeners);
    },
    disconnected: (cmp, data, def, context) => {
        let listeners;
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
