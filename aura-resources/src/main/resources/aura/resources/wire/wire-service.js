/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WireService = factory());
}(this, (function () { 'use strict';

/** Maximum number of wire adapter provides after observable complete */
const MAX_PROVIDE_AFTER_COMPLETE = 1;

/**
 * A wired value.
 */
class WiredValue {
    /**
     * Constructor
     * @param {Function} adapter The adapter that provides the data.
     * @param {Object} config Configuration for the adapter.
     * @param {Boolean} isMethod True if wiring to a method, false otherwise.
     * @param {*} cmp The component to which this value is wired.
     * @param {String} propName Property on the component to which this value is wired.
     */
    constructor(adapter, config, isMethod, cmp, propName) {
        this.adapter = adapter;
        this.config = config;
        this.cmp = cmp;
        this.propName = propName;
        this.isMethod = isMethod;

        // subscription to wire adapter's observable
        this.subscription = undefined;

        // count of wire adapter provides caused by receiving observable complete
        this.completeHandled = 0;

        // debounce multiple param updates so adapter is invoked only once.
        // use promise's microtask semantics.
        this.providePromise = undefined;
    }

    /**
     * Updates a configuration value.
     * @param {String} param Configuraton parameter.
     * @param {Object} value New configuration value.
     */
    update(param, value) {
        // invariant: wired value doesn't change if params don't change
        if (this.config[param] === value) {
            return;
        }

        // disconnect from previous observable
        this.release();

        this.config[param] = value;
        this.provide();
    }

    /**
     * Queues a request for the adapter to provide a new value.
     */
    provide() {
        if (!this.providePromise) {
            this.providePromise = Promise.resolve().then(() => this._provide());
        }
    }

    /**
     * Installs the WiredValue onto the target component.
     */
    install() {
        if (!this.isMethod) {
            this.cmp[this.propName] = {
                data: undefined,
                error: undefined
            };
        }
        this._provide();
    }

    /**
     * Provides a new value from the adapter.
     */
    _provide() {
        this.providePromise = undefined;

        const observable = this.adapter(this.config);
        // adapter returns falsey if config is insufficient
        if (!observable) {
            return;
        }

        const observer = this.getObserver();
        this.subscription = observable.subscribe(observer);
    }

    /**
     * Handles observable's complete signal.
     *
     * After an existing observable emits complete, conditionally re-request the
     * adapter to provide a new value. The conditions prevent a storm against the
     * adapter by limiting loops of provide, subscribe, complete, provide, repeat.
     */
    completeHandler() {
        this.release();

        this.completeHandled++;
        if (this.completeHandled > MAX_PROVIDE_AFTER_COMPLETE) {
            // TODO #15 - add telemetry so this occurrence is sent to the server
            return;
        }

        this.provide();
    }


    /**
     * Gets an observer for the adapter's observable.
     * @returns {Object} observer.
     */
    getObserver() {
        if (!this.observer) {
            if (this.isMethod) {
                const wireMethod = this.cmp[this.propName];
                this.observer = {
                    next: value => {
                        // TODO: deprecate (error, data) args
                        if (wireMethod.length === 2) {
                            // eslint-disable-next-line no-console
                            console.warn('[DEPRECATE] @wire function no longer supports two arguments (error, data), please update your code to use ({error, data}) instead.');
                            wireMethod.call(this.cmp, null, value);
                        } else {
                            wireMethod.call(this.cmp, { data: value, error: null });
                        }
                    },
                    error: err => {
                        // TODO: deprecate (error, data) args
                        if (wireMethod.length === 2) {
                            // eslint-disable-next-line no-console
                            console.warn('[DEPRECATE] @wire function no longer supports two arguments (error, data), please update your code to use ({error, data}) instead.');
                            wireMethod.call(this.cmp, err, undefined);
                        } else {
                            wireMethod.call(this.cmp, { data: undefined, error: err });
                        }
                    },
                    complete: () => {
                        this.completeHandler();
                    }
                };
            } else {
                this.observer = {
                    next: value => {
                        this.cmp[this.propName] = { 'data': value, 'error': undefined };
                    },
                    error: err => {
                        this.cmp[this.propName] = { 'data': undefined, 'error': err };
                    },
                    complete: () => {
                        this.completeHandler();
                    }
                };
            }
        }
        return this.observer;
    }

    /**
     * Release all resources.
     */
    release() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }
}

/**
 * This module provides utilities for managing wire adapters.
 */

/**
 * Populates a target map from a source object.
 * @param {Map} target The map to populate.
 * @param {Object<String, Function>} source The source of key-values to populate.
 */
function populateMap(target, source) {
    Object.keys(source).forEach(key => {
        const value = source[key];
        if (typeof value !== 'function') {
            throw new Error(`Invalid wire adapter: value must be a function, found ${typeof value}.`);
        } else if (target.has(key)) {
            throw new Error(`Duplicate wire adapter id ${key}'.`);
        }
        target.set(key, value);
    });
}

/**
 * Returns a map of wire adapter id to handler.
 * @param {Array<Object<String, Function>>} adapters The wire adapters.
 * @return {Map} A map of wire adapter id to handler.
 */
function buildWireAdapterMap(adapters) {
    const map = new Map();
    adapters.forEach(a => {
        populateMap(map, a());
    });
    return map;
}

/**
 * The @wire service.
 *
 * Provides data binding between services and LWC modules decorated with @wire.
 * This service is Salesforce-agnostic. The data-providing services must be provided
 * to this module.
 */


/** Map of wire adapter id to handler */
let ADAPTERS;


/**
 * Gets a mapping of component prop to wire config dynamic params. In other words,
 * the wire config's parameter set that updates whenever a prop changes.
 * @param {*} wireDef The wire definition.
 * @param {String} wireTarget Component property that is the target of the wire.
 * @returns {Object<String,String[]>} Map of prop name to wire config dynamic params.
 */
function getPropToParams(wireDef, wireTarget) {
    const map = Object.create(null);
    const { params } = wireDef;
    if (params) {
        Object.keys(params).forEach(param => {
            const prop = params[param];

            if (param in wireDef.static) {
                throw new Error(`${wireTarget}'s @wire('${wireDef.type}') parameter ${param} specified multiple times.`);
            }

            // attribute change handlers use hyphenated case
            let set = map[prop];
            if (!set) {
                set = map[prop] = [];
            }
            set.push(param);
        });
    }
    return map;
}

/**
 * Gets the wire adapter for a wire.
 * @param {*} wireDef The wire definition
 * @param {String} wireTarget Component property that is the target of the wire.
 * @returns {Function} The wire adapter.
 */
function getAdapter(wireDef, wireTarget) {
    let adapter;
    // TODO: deprecate type once consumers have migrate to use function identifier for adapter id.
    if (wireDef.type) {
        adapter = ADAPTERS.get(wireDef.type);
        if (!adapter) {
            throw new Error(`Unknown wire adapter id '${wireDef.type}' in ${wireTarget}'s @wire('${wireDef.type}', ...)`);
        }
    } else if (wireDef.adapter) {
        adapter = ADAPTERS.get(wireDef.adapter.name);
        if (!adapter) {
            throw new Error(`Unknown wire adapter id '${wireDef.adapter.name}' in ${wireTarget}'s @wire(${wireDef.adapter.name}, ...)`);
        }
    }

    return adapter;
}

/**
 * Gets the non-dynamic wire config.
 * @param {*} wireDef The wire definition
 * @returns {Object} The non-dynamic portions of the wire config.
 */
function getStaticConfig(wireDef) {
    const config = Object.create(null);
    Object.assign(config, wireDef.static);
    return config;
}

/**
 * Gets whether the wiring is to a method or property.
 * @param {*} wireDef The wire definition
 * @returns {Boolean} True if wired to a method, false otherwise.
 */
function getIsMethod(wireDef) {
    return wireDef.method === 1;
}

/**
 * Gets the config bags for all wires on a component.
 * @param {*} def The component definition.
 * @return {Object<String,Object>} Map of wire configs.
 */
function getWireConfigs(def) {
    const wires = def.wire;
    const wireConfigs = Object.create(null);
    Object.keys(wires).forEach(wireTarget => {
        const wireDef = wires[wireTarget];
        const propToParams = getPropToParams(wireDef, wireTarget);
        const adapter = getAdapter(wireDef, wireTarget);
        const staticConfig = getStaticConfig(wireDef);
        const isMethod = getIsMethod(wireDef);
        wireConfigs[wireTarget] = { propToParams, adapter, staticConfig, isMethod };
    });
    return wireConfigs;
}

/**
 * Gets the WiredValue instances for the wire config bags.
 * @param {*} wireConfigs The wire config bags.
 * @param {*} cmp The component whose wiring is being created.
 * @returns {Object<String,WiredValue>} The WiredValue instances.
 */
function getWiredValues(wireConfigs, cmp) {
    const wiredValues = Object.create(null);
    Object.keys(wireConfigs).forEach(wireTarget => {
        const { adapter, staticConfig, isMethod } = wireConfigs[wireTarget];
        wiredValues[wireTarget] = new WiredValue(adapter, staticConfig, isMethod, cmp, wireTarget);
    });
    return wiredValues;
}

/**
 * Gets the WiredValue handlers for property changes.
 * @param {*} wireConfigs The wire config bags.
 * @param {Object<String,WiredValue>} wiredValues The WiredValue instances.
 * @return {Object<String,Function[]>} Map of props to change handlers.
 */
function getPropChangeHandlers(wireConfigs, wiredValues) {
    const map = Object.create(null);
    Object.keys(wireConfigs).forEach(wireTarget => {
        const { propToParams } = wireConfigs[wireTarget];
        const wiredValue = wiredValues[wireTarget];

        Object.keys(propToParams).forEach(prop => {
            let set = map[prop];
            if (!set) {
                set = map[prop] = [];
            }

            const boundUpdate = propToParams[prop].map(param => {
                return wiredValue.update.bind(wiredValue, param);
            });

            set.push(...boundUpdate);
        });
    });
    return map;
}

/**
 * Installs property setters to listen for changes to property-based params.
 * @param {Object} cmp The component.
 * @param {Object<String,Function[]>} propsToListeners Map of prop names to change handler functions.
 */
function installSetterOverrides(cmp, propsToListeners) {
    const props = Object.keys(propsToListeners);

    // do not modify cmp if not required
    if (props.length === 0) {
        return;
    }

    props.forEach(prop => {
        const newDescriptor = getOverrideDescriptor(cmp, prop, propsToListeners[prop]);
        Object.defineProperty(cmp, prop, newDescriptor);
    });
}

/**
 * Gets a property descriptor that monitors the provided property for changes.
 * @param {Object} cmp The component.
 * @param {String} prop The name of the property to be monitored.
 * @param {Function[]} listeners List of functions to invoke when the prop's value changes.
 * @return {Object} A property descriptor.
 */
function getOverrideDescriptor(cmp, prop, listeners) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(cmp.constructor.prototype, prop);

    let newDescriptor;
    if (originalDescriptor) {
        newDescriptor = Object.assign({}, originalDescriptor, {
            set(value) {
                originalDescriptor.set.call(cmp, value);
                // re-fetch the value to handle asymmetry between setter and getter values
                listeners.forEach(f => f(cmp[prop]));
            }
        });
    } else {
        const propSymbol = Symbol(prop);
        newDescriptor = {
            get() {
                return cmp[propSymbol];
            },
            set(value) {
                cmp[propSymbol] = value;
                listeners.forEach(f => f(value));
            }
        };
        // grab the existing value
        cmp[propSymbol] = cmp[prop];
    }
    return newDescriptor;
}

/**
 * Installs the WiredValue instances onto the component.
 * @param {Object<String,WiredValue>} wiredValues The WiredValue instances.
 */
function installWiredValues(wiredValues) {
    Object.keys(wiredValues).forEach(wiredTarget => {
        const wiredValue = wiredValues[wiredTarget];
        wiredValue.install();
    });
}

/**
 * Installs wiring for a component.
 * @param {*} cmp The component to wire.
 * @param {*} def The component's definition.
 * @returns {Object<String,WiredValue>} The installed WiredValues.
 */
function installWiring(cmp, def) {
    const wireConfigs = getWireConfigs(def);
    const wiredValues = getWiredValues(wireConfigs, cmp);
    const propChangeHandlers = getPropChangeHandlers(wireConfigs, wiredValues);
    installSetterOverrides(cmp, propChangeHandlers);
    // TODO - handle when config values have only defaults and thus don't trigger setter overrides
    installWiredValues(wiredValues);

    return wiredValues;
}

/**
 * Sets the wire adapters.
 * @param {Function[]} adapterGenerators Wire adapter generators. Each function
 * must return an object whose keys are adapter ids, values are the adapter
 * function.
 */
function setWireAdapters(adapterGenerators) {
    ADAPTERS = buildWireAdapterMap(adapterGenerators);
}

/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * This service is Salesforce-agnostic. The wire adapters must be provided to this module.
 */

/**
 * The wire service.
 */
const wireService = {
    // TODO W-4072588 - support connected + disconnected (repeated) cycles
    wiring: (cmp, data, def, context) => {
        // engine guarantees invocation only if def.wire is defined
        const wiredValues = installWiring(cmp, def);
        context['@wire'] = wiredValues;
    },
    disconnected: (cmp, data, def, context) => {
        if (!def.wire) {
            return;
        }
        const wiredValues = context['@wire'];
        if (!wiredValues) {
            return;
        }
        Object.keys(wiredValues).forEach(wireTarget => {
            const wiredValue = wiredValues[wireTarget];
            wiredValue.release();
        });
    }
};

/**
 * Registers the wire service with the provided wire adapters.
 * @param {Function} register Function to register an engine service.
 * @param {...Function} adapterGenerators Wire adapter generators. Each function
 * must return an object whose keys are adapter ids, values are the adapter
 * function.
 */
function registerWireService(register, ...adapterGenerators) {
    setWireAdapters(adapterGenerators);
    register(wireService);
}

return registerWireService;

})));
/** version: 0.18.1 */
