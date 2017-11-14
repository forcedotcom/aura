/*
     * Copyright (C) 2017 salesforce.com, inc.
     */
    
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

const topLevelContextSymbol = Symbol('Top Level Context');
let currentContext = {};
currentContext[topLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

const { freeze, seal, keys, create, assign, defineProperty, getPrototypeOf, setPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyNames, defineProperties, getOwnPropertySymbols, hasOwnProperty, preventExtensions, isExtensible, } = Object;
const { isArray } = Array;
const { concat: ArrayConcat, filter: ArrayFilter, slice: ArraySlice, splice: ArraySplice, indexOf: ArrayIndexOf, push: ArrayPush, map: ArrayMap, forEach, } = Array.prototype;
function isUndefined(obj) {
    return obj === undefined;
}
function isNull(obj) {
    return obj === null;
}

function isFunction(obj) {
    return typeof obj === 'function';
}

function isString(obj) {
    return typeof obj === 'string';
}

const EmptySlots = create(null);
function getSlotsetValue(slotset, slotName) {
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}
const slotsetProxyHandler = {
    get: (slotset, key) => getSlotsetValue(slotset, key),
    set: () => {
        return false;
    },
    deleteProperty: () => {
        return false;
    },
    apply() {
    },
    construct() {
    },
};
function applyTokenToHost(vm, html) {
    const { vnode, context } = vm;
    const oldToken = context.tplToken;
    const newToken = html.token;
    if (oldToken !== newToken) {
        const host = vnode.elm;
        // Remove the token currently applied to the host element if different than the one associated
        // with the current template
        if (!isUndefined(oldToken)) {
            host.removeAttribute(oldToken);
        }
        // If the template has a token apply the token to the host element
        if (!isUndefined(newToken)) {
            host.setAttribute(newToken, '');
        }
    }
}
function evaluateTemplate(vm, html) {
    // TODO: add identity to the html functions
    let { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        applyTokenToHost(vm, html);
        vm.cmpTemplate = html;
        context.tplCache = create(null);
        context.tplToken = html.token;
    }
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    let vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    slotsetRevoke();
    return vnodes;
}

// Few more execptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
const HTMLPropertyNamesWithLowercasedReflectiveAttributes = [
    'accessKey',
    'readOnly',
    'tabIndex',
    'bgColor',
    'colSpan',
    'rowSpan',
    'contentEditable',
    'dateTime',
    'formAction',
    'isMap',
    'maxLength',
    'useMap',
];
// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element
// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

let nextTickCallbackQueue = [];
const SPACE_CHAR = 32;
const EmptyObject = seal(create(null));
const EmptyArray = seal([]);
function flushCallbackQueue() {
    const callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}
function addCallbackToNextTick(callback) {
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    // TODO: eventually, we might want to have priority when inserting callbacks
    ArrayPush.call(nextTickCallbackQueue, callback);
}
const attrNameToPropNameMap = create(null);

/**
 * This dictionary contains the mapping between property names
 * and the corresponding attribute name. This helps to trigger observable attributes.
 */
const propNameToAttributeNameMap = {
    // these are exceptions to the rule that cannot be inferred via `CAPS_REGEX`
    className: 'class',
    htmlFor: 'for',
};
// Few more exceptions where the attribute name matches the property in lowercase.
HTMLPropertyNamesWithLowercasedReflectiveAttributes.forEach((propName) => {
    propNameToAttributeNameMap[propName] = propName.toLowerCase();
});

function noop() { }
const classNameToClassMap = create(null);
function getMapFromClassName(className) {
    let map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    let start = 0;
    let i, len = className.length;
    for (i = 0; i < len; i++) {
        if (className.charCodeAt(i) === SPACE_CHAR) {
            if (i > start) {
                map[className.slice(start, i)] = true;
            }
            start = i + 1;
        }
    }
    if (i > start) {
        map[className.slice(start, i)] = true;
    }
    classNameToClassMap[className] = map;
    return map;
}

const hooks$1 = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
/* eslint-enable */
const Services = create(null);
function register(service) {
    for (let i = 0; i < hooks$1.length; ++i) {
        const hookName = hooks$1[i];
        if (hookName in service) {
            let l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            l.push(service[hookName]);
        }
    }
}
function invokeServiceHook(vm, cbs) {
    const { component, vnode: { data }, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

let idx = 0;
let uid = 0;
const OwnerKey = Symbol('key');
function addInsertionIndex(vm) {
    vm.idx = ++idx;
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    const { component: { connectedCallback } } = vm;
    if (connectedCallback && connectedCallback !== noop) {
        invokeComponentMethod(vm, 'connectedCallback');
    }
}
function removeInsertionIndex(vm) {
    vm.idx = 0;
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
    const { component: { disconnectedCallback } } = vm;
    if (disconnectedCallback && disconnectedCallback !== noop) {
        invokeComponentMethod(vm, 'disconnectedCallback');
    }
}
function createVM(vnode) {
    const { elm, Ctor } = vnode;
    const def = getComponentDef(Ctor);
    uid += 1;
    const vm = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        cmpProps: {},
        cmpTrack: {},
        cmpState: undefined,
        cmpSlots: undefined,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpClasses: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        classListObj: undefined,
        component: undefined,
        vnode,
        shadowVNode: createShadowRootVNode(elm, []),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    vnode.vm = vm;
    // linking elm with VM before creating the instance
    elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    createComponent(vm, Ctor);
    linkComponent(vm);
    return vm;
}
function relinkVM(vm, vnode) {
    vnode.vm = vm;
    vm.vnode = vnode;
}
function rehydrate(vm) {
    if (vm.idx && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        const { rendered } = Services;
        if (rendered) {
            invokeServiceHook(vm, rendered);
        }
        const { component: { renderedCallback } } = vm;
        if (renderedCallback && renderedCallback !== noop) {
            invokeComponentMethod(vm, 'renderedCallback');
        }
    }
}
let rehydrateQueue = [];
function flushRehydrationQueue() {
    const vms = rehydrateQueue.sort((a, b) => a.idx > b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        rehydrate(vms[i]);
    }
}
function scheduleRehydration(vm) {
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}
function isNodeOwnedByVM(vm, node) {
    // @ts-ignore
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    const { vnode: { uid: ownerUid } } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    // @ts-ignore
    return node[OwnerKey] === ownerUid;
}
function createShadowRootVNode(elm, children) {
    const sel = elm.tagName.toLocaleLowerCase();
    const vnode = {
        sel,
        data: EmptyObject,
        children,
        elm,
        key: undefined,
        text: undefined,
    };
    return vnode;
}
function patchShadowRoot(vm, children) {
    const { shadowVNode: oldShadowVNode } = vm;
    const shadowVNode = createShadowRootVNode(vm.vnode.elm, children);
    vm.shadowVNode = patch(oldShadowVNode, shadowVNode);
}

const TargetToReactiveRecordMap = new WeakMap();
function notifyListeners(target, key) {
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (reactiveRecord) {
        const value = reactiveRecord[key];
        if (value) {
            const len = value.length;
            for (let i = 0; i < len; i += 1) {
                const vm = value[i];
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    scheduleRehydration(vm);
                }
            }
        }
    }
}
function subscribeToSetHook(vm, target, key) {
    let reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        const newRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    let value = reactiveRecord[key];
    if (isUndefined(value)) {
        value = [];
        reactiveRecord[key] = value;
    }
    else if (value[0] === vm) {
        return; // perf optimization considering that most subscriptions will come from the same vm
    }
    if (ArrayIndexOf.call(value, vm) === -1) {
        ArrayPush.call(value, vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        ArrayPush.call(vm.deps, value);
    }
}

/*eslint-enable*/
const TargetSlot = Symbol();
const MembraneSlot = Symbol();
function isReplicable(value) {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}
function getReplica(membrane, value) {
    if (isNull(value)) {
        return value;
    }
    value = unwrap(value);
    if (!isReplicable(value)) {
        return value;
    }
    let { cells } = membrane;
    const r = cells.get(value);
    if (r) {
        return r;
    }
    const replica = new Proxy(value, membrane); // eslint-disable-line no-undef
    cells.set(value, replica);
    return replica;
}
class Membrane {
    constructor(handler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    get(target, key) {
        if (key === TargetSlot) {
            return target;
        }
        else if (key === MembraneSlot) {
            return this;
        }
        return this.handler.get(this, target, key);
    }
    set(target, key, newValue) {
        return this.handler.set(this, target, key, newValue);
    }
    deleteProperty(target, key) {
        if (key === TargetSlot) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    }
    apply(target, thisArg, argumentsList) {
        thisArg = unwrap(thisArg);
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    }
    construct(target, argumentsList, newTarget) {
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    }
}
// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
const { getKey } = Proxy;
const unwrap = getKey ?
    (replicaOrAny) => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny) => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;

/*eslint-enable*/
const ReactiveMap = new WeakMap();
const ObjectDotPrototype = Object.prototype;
function lockShadowTarget(shadowTarget, originalTarget) {
    const targetKeys = ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    targetKeys.forEach((key) => {
        let descriptor = getOwnPropertyDescriptor(originalTarget, key);
        // We do not need to wrap the descriptor if not configurable
        // Because we can deal with wrapping it when user goes through
        // Get own property descriptor. There is also a chance that this descriptor
        // could change sometime in the future, so we can defer wrapping
        // until we need to
        if (!descriptor.configurable) {
            descriptor = wrapDescriptor(descriptor);
        }
        defineProperty(shadowTarget, key, descriptor);
    });
    preventExtensions(shadowTarget);
}
function wrapDescriptor(descriptor) {
    if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? getReactiveProxy(descriptor.value) : descriptor.value;
    }
    return descriptor;
}
function isObservable(value) {
    if (!value) {
        return false;
    }
    if (isArray(value)) {
        return true;
    }
    const proto = getPrototypeOf(value);
    return (proto === ObjectDotPrototype || proto === null || getPrototypeOf(proto) === null);
}
// Unwrap property descriptors
// We only need to unwrap if value is specified
function unwrapDescriptor(descriptor) {
    if ('value' in descriptor) {
        descriptor.value = unwrap(descriptor.value);
    }
    return descriptor;
}
class ReactiveProxyHandler {
    constructor(value) {
        this.originalTarget = value;
    }
    get(shadowTarget, key) {
        if (key === MembraneSlot) {
            return this;
        }
        const { originalTarget } = this;
        if (key === TargetSlot) {
            return originalTarget;
        }
        const value = originalTarget[key];
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, originalTarget, key); // eslint-disable-line no-undef
        }
        const observable = isObservable(value);
        return observable ? getReactiveProxy(value) : value;
    }
    set(shadowTarget, key, value) {
        const { originalTarget } = this;
        if (isRendering) {
            return false;
        }
        const oldValue = originalTarget[key];
        if (oldValue !== value) {
            originalTarget[key] = value;
            notifyListeners(originalTarget, key);
        }
        else if (key === 'length' && isArray(originalTarget)) {
            // fix for issue #236: push will add the new index, and by the time length
            // is updated, the internal length is already equal to the new length value
            // therefore, the oldValue is equal to the value. This is the forking logic
            // to support this use case.
            notifyListeners(originalTarget, key);
        }
        return true;
    }
    deleteProperty(shadowTarget, key) {
        const { originalTarget } = this;
        delete originalTarget[key];
        notifyListeners(originalTarget, key);
        return true;
    }
    apply(target /*, thisArg: any, argArray?: any*/) {
    }
    construct(target, argArray, newTarget) {
    }
    has(shadowTarget, key) {
        const { originalTarget } = this;
        // make reactive
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, originalTarget, key); // eslint-disable-line no-undef
        }
        return key in originalTarget;
    }
    ownKeys(shadowTarget) {
        const { originalTarget } = this;
        return ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    }
    isExtensible(shadowTarget) {
        const shadowIsExtensible = isExtensible(shadowTarget);
        if (!shadowIsExtensible) {
            return shadowIsExtensible;
        }
        const { originalTarget } = this;
        const targetIsExtensible = isExtensible(originalTarget);
        if (!targetIsExtensible) {
            lockShadowTarget(shadowTarget, originalTarget);
        }
        return targetIsExtensible;
    }
    setPrototypeOf(shadowTarget, prototype) {
    }
    getPrototypeOf(shadowTarget) {
        const { originalTarget } = this;
        return getPrototypeOf(originalTarget);
    }
    getOwnPropertyDescriptor(shadowTarget, key) {
        const { originalTarget } = this;
        // keys looked up via hasOwnProperty need to be reactive
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, originalTarget, key); // eslint-disable-line no-undef
        }
        let desc = getOwnPropertyDescriptor(originalTarget, key);
        if (!desc) {
            return desc;
        }
        let shadowDescriptor = getOwnPropertyDescriptor(shadowTarget, key);
        if (!desc.configurable && !shadowDescriptor) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            desc = wrapDescriptor(desc);
            defineProperty(shadowTarget, key, desc);
        }
        return shadowDescriptor || desc;
    }
    preventExtensions(shadowTarget) {
        const { originalTarget } = this;
        lockShadowTarget(shadowTarget, originalTarget);
        preventExtensions(originalTarget);
        return true;
    }
    defineProperty(shadowTarget, key, descriptor) {
        const { originalTarget } = this;
        const { configurable } = descriptor;
        // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors
        if ('writable' in descriptor && !('value' in descriptor)) {
            const originalDescriptor = getOwnPropertyDescriptor(originalTarget, key);
            descriptor.value = originalDescriptor.value;
        }
        defineProperty(originalTarget, key, unwrapDescriptor(descriptor));
        if (configurable === false) {
            defineProperty(shadowTarget, key, wrapDescriptor(descriptor));
        }
        notifyListeners(originalTarget, key);
        return true;
    }
}
function getReactiveProxy(value) {
    value = unwrap(value);
    let proxy = ReactiveMap.get(value);
    if (proxy) {
        return proxy;
    }
    const handler = new ReactiveProxyHandler(value);
    const shadowTarget = isArray(value) ? [] : {};
    proxy = new Proxy(shadowTarget, handler);
    ReactiveMap.set(value, proxy);
    return proxy;
}

// stub function to prevent misuse of the @track decorator
function track() {
}
// TODO: how to allow symbols as property keys?
function createTrackedPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = this[ViewModelReflection];
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpTrack[key];
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            const observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;
            if (newValue !== vm.cmpTrack[key]) {
                vm.cmpTrack[key] = newValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyListeners(this, key);
                }
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
        configurable: false,
    });
}

// stub function to prevent misuse of the @wire decorator
function wire() {
}
// TODO: how to allow symbols as property keys?
function createWiredPropertyDescriptor(proto, key, descriptor) {
    createTrackedPropertyDescriptor(proto, key, descriptor);
}

// stub function to prevent misuse of the @api decorator
function api$1() {
}
let vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    vmBeingUpdated = vm;
}
// TODO: how to allow symbols as property keys?
function createPublicPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = this[ViewModelReflection];
            if (isBeingConstructed(vm)) {
                return;
            }
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpProps[key];
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = newValue;
                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyListeners(this, key);
                }
            }
            else if (isBeingConstructed(vm)) {
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                vm.cmpProps[key] = newValue;
            }
            else {
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
    });
}
function createPublicAccessorDescriptor(proto, key, descriptor) {
    const { get, set, enumerable } = descriptor || EmptyObject;
    defineProperty(proto, key, {
        get() {
            if (get) {
                return get.call(this);
            }
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            if (!isBeingConstructed(vm) && vmBeingUpdated !== vm) {
                return;
            }
            vmBeingUpdated = null; // releasing the lock
            if (set) {
                set.call(this, newValue);
            }
            else {
            }
        },
        enumerable,
    });
}

function getLinkedElement$1(classList) {
    return classList[ViewModelReflection].vnode.elm;
}
// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
function ClassList(vm) {
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}
ClassList.prototype = {
    add() {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        const elm = getLinkedElement$1(this);
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        forEach.call(arguments, (className) => {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                // this is not only an optimization, it is also needed to avoid adding the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx || vm.vnode.isRoot) {
                    // we intentionally make a sync mutation here and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    elm.classList.add(className);
                }
            }
        });
    },
    remove() {
        const vm = this[ViewModelReflection];
        const { cmpClasses, vnode } = vm;
        const elm = getLinkedElement$1(this);
        // Remove specified class values.
        forEach.call(arguments, (className) => {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                // this is not only an optimization, it is also needed to avoid removing the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx || vnode.isRoot) {
                    // we intentionally make a sync mutation here when needed and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    const ownerClass = vnode.data.class;
                    // This is only needed if the owner is not forcing that class to be present in case of conflicts.
                    if (isUndefined(ownerClass) || !ownerClass[className]) {
                        elm.classList.remove(className);
                    }
                }
            }
        });
    },
    item(index) {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // Return class value by index in collection.
        return getOwnPropertyNames(cmpClasses)
            .filter((className) => cmpClasses[className + ''])[index] || null;
    },
    toggle(className, force) {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
        // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
        if (arguments.length > 1) {
            if (force) {
                this.add(className);
            }
            else if (!force) {
                this.remove(className);
            }
            return !!force;
        }
        if (cmpClasses[className]) {
            this.remove(className);
            return false;
        }
        this.add(className);
        return true;
    },
    contains(className) {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // Checks if specified class value exists in class attribute of the element.
        return !!cmpClasses[className];
    },
    toString() {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        return getOwnPropertyNames(cmpClasses).filter((className) => cmpClasses[className + '']).join(' ');
    }
};

/* eslint-enable */
function piercingHook(membrane, target, key, value) {
    const { handler: { vm } } = membrane;
    const { piercing } = Services;
    if (piercing) {
        const { component, vnode: { data }, def, context } = vm;
        let result = value;
        let next = true;
        const callback = (newValue) => {
            next = false;
            result = newValue;
        };
        for (let i = 0, len = piercing.length; next && i < len; ++i) {
            piercing[i].call(undefined, component, data, def, context, target, key, value, callback);
        }
        return result === value ? getReplica(membrane, result) : result;
    }
}
class PiercingMembraneHandler {
    constructor(vm) {
        this.vm = vm;
    }
    get(membrane, target, key) {
        if (key === OwnerKey) {
            return undefined;
        }
        let value = target[key];
        return piercingHook(membrane, target, key, value);
    }
    set(membrane, target, key, newValue) {
        target[key] = newValue;
        return true;
    }
    deleteProperty(membrane, target, key) {
        delete target[key];
        return true;
    }
    apply(membrane, targetFn, thisArg, argumentsList) {
        return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
    }
    construct(membrane, targetFn, argumentsList, newTarget) {
        return getReplica(membrane, new targetFn(...argumentsList));
    }
}
function pierce(vm, value) {
    let { membrane } = vm;
    if (!membrane) {
        const handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}

const { querySelector, querySelectorAll } = Element.prototype;
function getLinkedElement$2(root) {
    return root[ViewModelReflection].vnode.elm;
}
function shadowRootQuerySelector(shadowRoot, selector) {
    const vm = shadowRoot[ViewModelReflection];
    const elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    const querySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return querySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    const vm = shadowRoot[ViewModelReflection];
    const elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    const querySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return querySelectorAll.call(elm, selector);
}
function Root(vm) {
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}
Root.prototype = {
    get mode() {
        return 'closed';
    },
    get host() {
        return this[ViewModelReflection].component;
    },
    querySelector(selector) {
        const node = shadowRootQuerySelector(this, selector);
        return node;
    },
    querySelectorAll(selector) {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        return nodeList;
    },
    toString() {
        const vm = this[ViewModelReflection];
        return `Current ShadowRoot for ${vm.component}`;
    }
};
function getFirstMatch(vm, elm, selector) {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(vm, nodeList[i]);
        }
    }
    return null;
}
function getAllMatches(vm, elm, selector) {
    const nodeList = querySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node) => isNodeOwnedByVM(vm, node));
    return pierce(vm, filteredNodes);
}
function isParentNodeKeyword(key) {
    return (key === 'parentNode' || key === 'parentElement');
}
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(component, data, def, context, target, key, value, callback) {
        const vm = component[ViewModelReflection];
        const { elm } = vm.vnode; // eslint-disable-line no-undef
        if (value) {
            if (value === querySelector) {
                // TODO: it is possible that they invoke the querySelector() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector) => getFirstMatch(vm, target, selector));
            }
            if (value === querySelectorAll) {
                // TODO: it is possible that they invoke the querySelectorAll() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector) => getAllMatches(vm, target, selector));
            }
            if (isParentNodeKeyword(key)) {
                if (value === elm) {
                    // walking up via parent chain might end up in the shadow root element
                    return callback(component.root);
                }
                else if (target[OwnerKey] !== value[OwnerKey]) {
                    // cutting out access to something outside of the shadow of the current target (usually slots)
                    return callback();
                }
            }
            if (value === elm) {
                // prevent access to the original Host element
                return callback(component);
            }
        }
    }
});

function getLinkedElement(cmp) {
    return cmp[ViewModelReflection].vnode.elm;
}
function querySelectorAllFromComponent(cmp, selectors) {
    const elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
function ComponentElement() {
    vmBeingConstructed.component = this;
    this[ViewModelReflection] = vmBeingConstructed;
}
/*eslint-disable*/
ComponentElement.prototype = {
    // Raptor.Element APIs
    renderedCallback: noop,
    render: noop,
    // Web Component - The Good Parts
    connectedCallback: noop,
    disconnectedCallback: noop,
    // HTML Element - The Good Parts
    dispatchEvent(event) {
        const elm = getLinkedElement(this);
        const vm = this[ViewModelReflection];
        // Pierce dispatchEvent so locker service has a chance to overwrite
        pierce(vm, elm);
        const dispatchEvent = piercingHook(vm.membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    },
    addEventListener(type, listener) {
        const vm = this[ViewModelReflection];
        addComponentEventListener(vm, type, listener);
    },
    removeEventListener(type, listener) {
        const vm = this[ViewModelReflection];
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute(attrName) {
        const elm = getLinkedElement(this);
        return elm.getAttribute.apply(elm, ArraySlice.call(arguments));
    },
    getBoundingClientRect() {
        const elm = getLinkedElement(this);
        return elm.getBoundingClientRect();
    },
    querySelector(selectors) {
        const vm = this[ViewModelReflection];
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        return null;
    },
    querySelectorAll(selectors) {
        const vm = this[ViewModelReflection];
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node) => wasNodePassedIntoVM(vm, node));
        return pierce(vm, filteredNodes);
    },
    get tagName() {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get tabIndex() {
        const elm = getLinkedElement(this);
        return elm.tabIndex;
    },
    set tabIndex(value) {
        const vm = this[ViewModelReflection];
        if (isBeingConstructed(vm)) {
            return;
        }
        const elm = getLinkedElement(this);
        elm.tabIndex = value;
    },
    get classList() {
        const vm = this[ViewModelReflection];
        let { classListObj } = vm;
        // lazy creation of the ClassList Object the first time it is accessed.
        if (isUndefined(classListObj)) {
            vm.cmpClasses = {};
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    },
    get root() {
        const vm = this[ViewModelReflection];
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    toString() {
        const vm = this[ViewModelReflection];
        const { vnode: { sel, data: { attrs } } } = vm;
        const is = attrs && attrs.is;
        return `<${sel}${is ? ' is="${is}' : ''}>`;
    },
};
// Global HTML Attributes
freeze(ComponentElement);
seal(ComponentElement.prototype);

/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */
/*eslint-enable*/
const ViewModelReflection = Symbol('internal');
const CtorToDefMap = new WeakMap();
const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;
function createComponentDef(Ctor) {
    const name = Ctor.name;
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    let observedAttrs = getObservedAttributesHash(Ctor);
    let wire$$1 = getWireHash(Ctor);
    let track$$1 = getTrackHash(Ctor);
    const proto = Ctor.prototype;
    for (let propName in props) {
        const propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        const descriptor = getOwnPropertyDescriptor(proto, propName);
        const { config } = propDef;
        if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
            createPublicAccessorDescriptor(proto, propName, descriptor);
        }
        else {
            createPublicPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (wire$$1) {
        for (let propName in wire$$1) {
            if (wire$$1[propName].method) {
                // for decorated methods we need to do nothing
                continue;
            }
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            // initializing getters and setters for each public prop on the target prototype
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track$$1) {
        for (let propName in track$$1) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            // initializing getters and setters for each public prop on the target prototype
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        }
    }
    const superProto = getPrototypeOf(Ctor);
    if (superProto !== ComponentElement) {
        const superDef = getComponentDef(superProto);
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire$$1 = (superDef.wire || wire$$1) ? assign(create(null), superDef.wire, wire$$1) : undefined;
    }
    const descriptors = createDescriptorMap(props, methods);
    const def = {
        name,
        wire: wire$$1,
        track: track$$1,
        props,
        methods,
        observedAttrs,
        descriptors,
    };
    return def;
}
function createGetter(key) {
    return function () {
        const vm = this[ViewModelReflection];
        return vm.component[key];
    };
}
function createSetter(key) {
    return function (newValue) {
        const vm = this[ViewModelReflection];
        // logic for setting new properties of the element directly from the DOM
        // will only be allowed for root elements created via createElement()
        if (!vm.vnode.isRoot) {
            return;
        }
        const observable = isObservable(newValue);
        newValue = observable ? getReactiveProxy(newValue) : newValue;
        prepareForPropUpdate(vm);
        vm.component[key] = newValue;
    };
}
function createMethodCaller(key) {
    return function () {
        const vm = this[ViewModelReflection];
        return vm.component[key].apply(vm.component, ArraySlice.call(arguments));
    };
}
const { getAttribute, setAttribute, removeAttribute } = Element.prototype;
function getAttributePatched(attrName) {
    return getAttribute.apply(this, ArraySlice.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    const vm = this[ViewModelReflection];
    const { def: { props: propsConfig, observedAttrs } } = vm;
    attrName = isString(attrName) ? attrName.toLocaleLowerCase() : null;
    const oldValue = getAttribute.call(this, attrName);
    setAttribute.call(this, attrName, newValue);
    newValue = getAttribute.call(this, attrName);
    if (!isNull(attrName) && attrName in observedAttrs && oldValue !== newValue) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
function removeAttributePatched(attrName) {
    const vm = this[ViewModelReflection];
    const { def: { props: propsConfig, observedAttrs } } = vm;
    attrName = isString(attrName) ? attrName.toLocaleLowerCase() : null;
    const oldValue = getAttribute.call(this, attrName);
    removeAttribute.call(this, attrName);
    const newValue = getAttribute.call(this, attrName);
    if (!isNull(attrName) && attrName in observedAttrs && oldValue !== newValue) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
function createDescriptorMap(publicProps, publicMethodsConfig) {
    // replacing mutators and accessors on the element itself to catch any mutation
    const descriptors = {
        getAttribute: {
            value: getAttributePatched,
            configurable: true,
        },
        setAttribute: {
            value: setAttributePatched,
            configurable: true,
        },
        removeAttribute: {
            value: removeAttributePatched,
            configurable: true,
        },
    };
    // expose getters and setters for each public props on the Element
    for (let key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
        };
    }
    // expose public methods as props on the Element
    for (let key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(key),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    const track$$1 = target.track;
    if (!track$$1 || !getOwnPropertyNames(track$$1).length) {
        return;
    }
    return assign(create(null), track$$1);
}
function getWireHash(target) {
    const wire$$1 = target.wire;
    if (!wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
    }
    return assign(create(null), wire$$1);
}
function getPublicPropertiesHash(target) {
    const props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash, propName) => {
        propsHash[propName] = assign({ config: 0 }, props[propName]);
        return propsHash;
    }, create(null));
}
function getPublicMethodsHash(target) {
    const publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash, methodName) => {
        methodsHash[methodName] = 1;
        return methodsHash;
    }, create(null));
}
function getObservedAttributesHash(target) {
    const observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce((observedAttributes, attrName) => {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}
function getComponentDef(Ctor) {
    let def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}

let isRendering = false;
let vmBeingRendered = null;
function invokeComponentCallback(vm, fn, fnCtx, args) {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result, error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(fnCtx, args);
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        error.wcStack = getComponentStack(vm);
        throw error; // rethrowing the original error after restoring the context
    }
    return result;
}
function invokeComponentMethod(vm, methodName, args) {
    const { component } = vm;
    return invokeComponentCallback(vm, component[methodName], component, args);
}
function invokeComponentConstructor(vm, Ctor) {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let component, error;
    try {
        component = new Ctor();
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        error.wcStack = getComponentStack(vm);
        throw error; // rethrowing the original error after restoring the context
    }
    return component;
}
function invokeComponentRenderMethod(vm) {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result, error;
    try {
        const html = component.render();
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        }
        else if (!isUndefined(html)) {
        }
    }
    catch (e) {
        error = e;
    }
    isRendering = isRenderingInception;
    vmBeingRendered = vmBeingRenderedInception;
    establishContext(ctx);
    if (error) {
        error.wcStack = getComponentStack(vm);
        throw error; // rethrowing the original error after restoring the context
    }
    return result || [];
}
function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    const { component, context } = vm;
    const { attributeChangedCallback } = component;
    if (isUndefined(attributeChangedCallback)) {
        return;
    }
    const ctx = currentContext;
    establishContext(context);
    let error;
    try {
        component.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        error.wcStack = getComponentStack(vm);
        throw error; // rethrowing the original error after restoring the context
    }
}
function getComponentStack(vm) {
    const wcStack = [];
    let elm = vm.vnode.elm;
    do {
        const vm = elm[ViewModelReflection];
        if (!isUndefined(vm)) {
            wcStack.push(vm.component.toString());
        }
        elm = elm.parentElement;
    } while (elm);
    return wcStack.reverse().join('\n\t');
}

/*eslint-enable*/
let vmBeingConstructed = null;
function isBeingConstructed(vm) {
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
}
function linkComponent(vm) {
    // wiring service
    const { def: { wire } } = vm;
    if (wire) {
        const { wiring } = Services;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}
function clearListeners(vm) {
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            ArraySplice.call(set, pos, 1);
        }
        deps.length = 0;
    }
}
function createComponentListener() {
    return function handler(event) {
        dispatchComponentEvent(handler.vm, event);
    };
}
function addComponentEventListener(vm, eventName, newHandler) {
    let { cmpEvents, cmpListener, idx: vmIdx } = vm;
    if (isUndefined(cmpEvents)) {
        // this piece of code must be in sync with modules/component-events
        vm.cmpEvents = cmpEvents = create(null);
        vm.cmpListener = cmpListener = createComponentListener();
        cmpListener.vm = vm;
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
        // this is not only an optimization, it is also needed to avoid adding the same
        // listener twice when the initial diffing algo kicks in without an old vm to track
        // what was already added to the DOM.
        if (!vm.isDirty || vmIdx > 0) {
            // if the element is already in the DOM and rendered, we intentionally make a sync mutation
            // here and also keep track of the mutation for a possible rehydration later on without having
            // to rehydrate just now.
            const { vnode: { elm } } = vm;
            elm.addEventListener(eventName, cmpListener, false);
        }
    }
    ArrayPush.call(cmpEvents[eventName], newHandler);
}
function removeComponentEventListener(vm, eventName, oldHandler) {
    const { cmpEvents } = vm;
    if (cmpEvents) {
        const handlers = cmpEvents[eventName];
        const pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            return;
        }
    }
}
function dispatchComponentEvent(vm, event) {
    const { cmpEvents, component } = vm;
    const { type } = event;
    const handlers = cmpEvents[type];
    let uninterrupted = true;
    const { stopImmediatePropagation } = event;
    event.stopImmediatePropagation = function () {
        uninterrupted = false;
        stopImmediatePropagation.call(this);
    };
    const e = pierce(vm, event);
    for (let i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, handlers[i], component, [e]);
    }
    // restoring original methods
    event.stopImmediatePropagation = stopImmediatePropagation;
}
function addComponentSlot(vm, slotName, newValue) {
    let { cmpSlots } = vm;
    let oldValue = cmpSlots && cmpSlots[slotName];
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    // TODO: Issue #133
    if (!isArray(newValue)) {
        newValue = undefined;
    }
    if (oldValue !== newValue) {
        if (isUndefined(cmpSlots)) {
            vm.cmpSlots = cmpSlots = create(null);
        }
        cmpSlots[slotName] = newValue;
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function removeComponentSlot(vm, slotName) {
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    const { cmpSlots } = vm;
    if (cmpSlots && cmpSlots[slotName]) {
        cmpSlots[slotName] = undefined; // delete will de-opt the cmpSlots, better to set it to undefined
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function renderComponent(vm) {
    clearListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    return vnodes;
}
function markComponentAsDirty(vm) {
    vm.isDirty = true;
}

function insert(vnode) {
    const { vm } = vnode;
    if (vm.idx > 0) {
        destroy(vnode); // moving the element from one place to another is observable via life-cycle hooks
    }
    addInsertionIndex(vm);
    if (vm.isDirty) {
        // this code path guarantess that when patching the custom element for the first time,
        // the body is computed only after the element is in the DOM, otherwise the hooks
        // for any children's vnode are not going to be useful.
        rehydrate(vm);
    }
}
function update(oldVnode, vnode) {
    const { vm } = vnode;
    // TODO: we don't really need this block anymore, but it will require changes
    // on many tests that are just patching the element directly.
    if (vm.idx === 0 && !vnode.isRoot) {
        // when inserting a root element, or when reusing a DOM element for a new
        // component instance, the insert() hook is never called because the element
        // was already in the DOM before creating the instance, and diffing the
        // vnode, for that, we wait until the patching process has finished, and we
        // use the postpatch() hook to trigger the connectedCallback logic.
        insert(vnode);
        // Note: we don't have to worry about destroy() hook being called before this
        // one because they never happen in the same patching mechanism, only one
        // of them is called. In the case of the insert() hook, we use the value of `idx`
        // to dedupe the calls since they both can happen in the same patching process.
    }
    if (vm.isDirty) {
        // this code path guarantess that when patching the custom element the body is computed only after the element is in the DOM
        rehydrate(vm);
    }
}
function destroy(vnode) {
    const { vm } = vnode;
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    clearListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use realm custom elements, we can remove this.
    patchShadowRoot(vm, []);
}
const lifeCycleHooks = {
    insert,
    update,
    destroy,
};

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const EmptyData = create(null);
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;
function addNS(data, children, sel) {
    data.ns = NamespaceAttributeForSVG;
    if (isUndefined(children) || sel === 'foreignObject') {
        return;
    }
    const len = children.length;
    for (let i = 0; i < len; ++i) {
        const child = children[i];
        let { data } = child;
        if (data !== undefined) {
            const grandChildren = child.children;
            addNS(data, grandChildren, child.sel);
        }
    }
}
// [v]node node
function v(sel, data, children, text, elm, Ctor) {
    data = data || EmptyData;
    let { key } = data;
    let uid = 0;
    // For root elements and other special cases the vm is not set.
    if (!isNull(vmBeingRendered)) {
        uid = vmBeingRendered.uid;
        data.token = vmBeingRendered.context.tplToken;
    }
    const vnode = { sel, data, children, text, elm, key, Ctor, uid };
    return vnode;
}
// [h]tml node
function h(sel, data, children) {
    // checking reserved internal data properties
    const { classMap, className, style, styleMap } = data;
    data.class = classMap || (className && getMapFromClassName(className));
    data.style = styleMap || (style && style + '');
    if (sel.length === 3 && sel.charCodeAt(0) === CHAR_S && sel.charCodeAt(1) === CHAR_V && sel.charCodeAt(2) === CHAR_G) {
        addNS(data, children, sel);
    }
    return v(sel, data, children);
}
// [c]ustom element node
function c(sel, Ctor, data) {
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (Ctor.__circular__) {
        Ctor = Ctor();
    }
    // checking reserved internal data properties
    const { key, slotset, styleMap, style, on, className, classMap, props: _props } = data;
    let { attrs } = data;
    // hack to allow component authors to force the usage of the "is" attribute in their components
    const { forceTagName } = Ctor;
    if (!isUndefined(forceTagName) && (isUndefined(attrs) || isUndefined(attrs.is))) {
        attrs = attrs || {};
        attrs.is = sel;
        sel = forceTagName;
    }
    data = { hook: lifeCycleHooks, key, slotset, attrs, on, _props };
    data.class = classMap || (className && getMapFromClassName(className));
    data.style = styleMap || (style && style + '');
    return v(sel, data, EmptyArray, undefined, undefined, Ctor);
}
// [i]terable node
function i(iterable, factory) {
    const list = [];
    if (isUndefined(iterable) || iterable === null) {
        return list;
    }
    const iterator = iterable[SymbolIterator]();
    let next = iterator.next();
    let i = 0;
    let { value, done: last } = next;
    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;
        // template factory logic based on the previous collected value
        const vnode = factory(value, i, i === 0, last);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        }
        else {
            ArrayPush.call(list, vnode);
        }
        // preparing next value
        i += 1;
        value = next.value;
    }
    return list;
}
/**
 * [f]lattening
 */
function f(items) {
    const len = items.length;
    const flattened = [];
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        }
        else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}
// [t]ext node
function t(value) {
    return v(undefined, undefined, undefined, value);
}
// [d]ynamic value to produce a text vnode
function d(value) {
    if (value === undefined || value === null) {
        return null;
    }
    return v(undefined, undefined, undefined, value);
}
// [b]ind function
function b(fn) {
    function handler(event) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(handler.vm, handler.fn, handler.vm.component, [event]);
    }
    handler.vm = vmBeingRendered;
    handler.fn = fn;
    return handler;
}



var api = Object.freeze({
	v: v,
	h: h,
	c: c,
	i: i,
	f: f,
	t: t,
	d: d,
	b: b
});

var array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}

const { createElement: createElement$1, createElementNS, createTextNode, createComment, } = document;
const { insertBefore: insertBefore$1, removeChild: removeChild$1, appendChild: appendChild$1, } = Node.prototype;
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.nodeValue = text;
}
function getTextContent(node) {
    return node.nodeValue;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    // Performance optimization over `return node.nodeType === 3;`
    return node.splitText !== undefined;
}
function isComment(node) {
    return node.nodeType === 8;
}
var htmlDomApi = {
    createElement(tagName) {
        return createElement$1.call(document, tagName);
    },
    createElementNS(namespaceURI, qualifiedName) {
        return createElementNS.call(document, namespaceURI, qualifiedName);
    },
    createTextNode(text) {
        return createTextNode.call(document, text);
    },
    createComment(text) {
        return createComment.call(document, text);
    },
    insertBefore(parentNode, newNode, referenceNode) {
        insertBefore$1.call(parentNode, newNode, referenceNode);
    },
    removeChild(node, child) {
        removeChild$1.call(node, child);
    },
    appendChild(node, child) {
        appendChild$1.call(node, child);
    },
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment,
};

function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
var emptyNode = { sel: "", data: {}, children: [] };
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i$$1, map = {}, key, ch;
    for (i$$1 = beginIdx; i$$1 <= endIdx; ++i$$1) {
        ch = children[i$$1];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined)
                map[key] = i$$1;
        }
    }
    return map;
}
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
// export { h } from './h';
// export { thunk } from './thunk';
function init(modules, domApi) {
    var i$$1, j, cbs = {};
    var api = domApi !== undefined ? domApi : htmlDomApi;
    for (i$$1 = 0; i$$1 < hooks.length; ++i$$1) {
        cbs[hooks[i$$1]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks[i$$1]];
            if (hook !== undefined) {
                cbs[hooks[i$$1]].push(hook);
            }
        }
    }
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c$$1 = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return v(api.tagName(elm).toLowerCase() + id + c$$1, {}, [], undefined, elm);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent_1 = api.parentNode(childElm);
                api.removeChild(parent_1, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i$$1, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i$$1 = data.hook) && isDef(i$$1 = i$$1.init)) {
                i$$1(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children, sel = vnode.sel;
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i$$1 = data.ns) ? api.createElementNS(i$$1, tag)
                : api.createElement(tag);
            if (hash < dot)
                elm.id = sel.slice(hash + 1, dot);
            if (dotIdx > 0)
                elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
            for (i$$1 = 0; i$$1 < cbs.create.length; ++i$$1)
                cbs.create[i$$1](emptyNode, vnode);
            if (array(children)) {
                for (i$$1 = 0; i$$1 < children.length; ++i$$1) {
                    var ch = children[i$$1];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            i$$1 = vnode.data.hook; // Reuse variable
            if (isDef(i$$1)) {
                if (i$$1.create)
                    i$$1.create(emptyNode, vnode);
                if (i$$1.insert)
                    insertedVnodeQueue.push(vnode);
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var i$$1, j, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i$$1 = data.hook) && isDef(i$$1 = i$$1.destroy))
                i$$1(vnode);
            for (i$$1 = 0; i$$1 < cbs.destroy.length; ++i$$1)
                cbs.destroy[i$$1](vnode);
            if (vnode.children !== undefined) {
                for (j = 0; j < vnode.children.length; ++j) {
                    i$$1 = vnode.children[j];
                    if (i$$1 != null && typeof i$$1 !== "string") {
                        invokeDestroyHook(i$$1);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                        cbs.remove[i_1](ch, rm);
                    if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0, newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        }
        else if (newStartIdx > newEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i$$1, hook;
        if (isDef(i$$1 = vnode.data) && isDef(hook = i$$1.hook) && isDef(i$$1 = hook.prepatch)) {
            i$$1(oldVnode, vnode);
        }
        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (i$$1 = 0; i$$1 < cbs.update.length; ++i$$1)
                cbs.update[i$$1](oldVnode, vnode);
            i$$1 = vnode.data.hook;
            if (isDef(i$$1) && isDef(i$$1 = i$$1.update))
                i$$1(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        }
        else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i$$1 = hook.postpatch)) {
            i$$1(oldVnode, vnode);
        }
    }
    return function patch(oldVnode, vnode) {
        var i$$1, elm, parent;
        var insertedVnodeQueue = [];
        for (i$$1 = 0; i$$1 < cbs.pre.length; ++i$$1)
            cbs.pre[i$$1]();
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i$$1 = 0; i$$1 < insertedVnodeQueue.length; ++i$$1) {
            insertedVnodeQueue[i$$1].data.hook.insert(insertedVnodeQueue[i$$1]);
        }
        for (i$$1 = 0; i$$1 < cbs.post.length; ++i$$1)
            cbs.post[i$$1]();
        return vnode;
    };
}

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode, vnode) {
    const { Ctor } = vnode;
    if (isUndefined(Ctor)) {
        return;
    }
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    if (oldVnode.vm && oldVnode.Ctor === Ctor) {
        relinkVM(oldVnode.vm, vnode);
    }
    else {
        createVM(vnode);
    }
}
var componentInit = {
    create: initializeComponent,
    update: initializeComponent,
};

function syncProps(oldVnode, vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { component, def: { props: publicProps } } = vm;
    let { data: { _props: oldProps } } = oldVnode;
    let { data: { _props: newProps } } = vnode;
    // infuse key-value pairs from _props into the component
    if (oldProps !== newProps && (oldProps || newProps)) {
        let key, cur;
        oldProps = oldProps || EmptyObject;
        newProps = newProps || EmptyObject;
        // removed props should be reset in component's props
        for (key in oldProps) {
            if (!(key in newProps)) {
                prepareForPropUpdate(vm);
                component[key] = undefined;
            }
        }
        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                if (isUndefined(publicProps[key])) {
                    // TODO: this should never really happen because the compiler should always validate
                    return;
                }
                prepareForPropUpdate(vm);
                component[key] = cur;
            }
        }
    }
    // Note: _props, which comes from api.c()'s data.props, is only used to populate
    //       public props, and any other alien key added to it by the compiler will be
    //       ignored, and a warning is shown.
}
var componentProps = {
    create: syncProps,
    update: syncProps,
};

function removeAllCmpEventListeners(vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { cmpEvents: on, listener } = vm;
    if (on && listener) {
        const { elm } = vnode;
        let name;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vm.listener = undefined;
    }
}
function updateCmpEventListeners(oldVnode, vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { vm: oldVm } = oldVnode;
    if (oldVm === vm) {
        return;
    }
    const oldOn = (oldVm && oldVm.cmpEvents) || EmptyObject;
    const { cmpEvents: on = EmptyObject } = vm;
    if (oldOn === on) {
        return;
    }
    const { elm } = vnode;
    const { elm: oldElm } = oldVnode;
    const listener = vm.cmpListener = (oldVm && oldVm.cmpListener) || createComponentListener();
    listener.vm = vm;
    let name;
    for (name in on) {
        if (isUndefined(oldOn[name])) {
            elm.addEventListener(name, listener, false);
        }
    }
    for (name in oldOn) {
        if (isUndefined(on[name])) {
            oldElm.removeEventListener(name, listener, false);
        }
    }
}
const eventListenersModule = {
    create: updateCmpEventListeners,
    update: updateCmpEventListeners,
    destroy: removeAllCmpEventListeners
};

function syncClassNames(oldVnode, vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { vm: oldVm } = oldVnode;
    if (oldVm === vm) {
        return;
    }
    const oldClass = (oldVm && oldVm.cmpClasses) || EmptyObject;
    const { cmpClasses: klass = EmptyObject } = vm;
    if (oldClass === klass) {
        return;
    }
    const { elm, data: { class: ownerClass = EmptyObject } } = vnode;
    let name;
    for (name in oldClass) {
        // remove only if it was removed from within the instance and it is not set from owner
        if (oldClass[name] && !klass[name] && !ownerClass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        if (klass[name] && !oldClass[name]) {
            elm.classList.add(name);
        }
    }
}
var componentClasses = {
    create: syncClassNames,
    update: syncClassNames,
};

function update$1(oldVnode, vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    let { data: { slotset: oldSlots } } = oldVnode;
    let { data: { slotset: newSlots } } = vnode;
    // infuse key-value pairs from slotset into the component
    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        let key, cur;
        oldSlots = oldSlots || EmptyObject;
        newSlots = newSlots || EmptyObject;
        // removed slots should be removed from component's slotset
        for (key in oldSlots) {
            if (!(key in newSlots)) {
                removeComponentSlot(vm, key);
            }
        }
        // new or different slots should be set in component's slotset
        for (key in newSlots) {
            cur = newSlots[key];
            if (!(key in oldSlots) || oldSlots[key] != cur) {
                if (cur && cur.length) {
                    addComponentSlot(vm, key, cur);
                }
                else {
                    removeComponentSlot(vm, key);
                }
            }
        }
    }
}
var componentSlotset = {
    create: update$1,
    update: update$1,
};

// TODO: eventually use the one shipped by snabbdom directly
function update$2(oldVnode, vnode) {
    let oldProps = oldVnode.data.props;
    let props = vnode.data.props;
    if (isUndefined(oldProps) && isUndefined(props)) {
        return;
    }
    if (oldProps === props) {
        return;
    }
    oldProps = oldProps || EmptyObject;
    props = props || EmptyObject;
    let key, cur, old;
    const { elm } = vnode;
    for (key in oldProps) {
        if (!(key in props)) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                elm[key] = cur;
            }
        }
    }
}
var props = {
    create: update$2,
    update: update$2,
};

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;
const XCharCode = 120;
function updateAttrs(oldVnode, vnode) {
    let { data: { attrs: oldAttrs } } = oldVnode;
    let { data: { attrs } } = vnode;
    if (!oldAttrs && !attrs) {
        return;
    }
    if (oldAttrs === attrs) {
        return;
    }
    const { elm } = vnode;
    const { setAttribute, removeAttribute, setAttributeNS } = elm;
    let key;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                setAttribute.call(elm, key, "");
            }
            else if (cur === false) {
                removeAttribute.call(elm, key);
            }
            else {
                if (key.charCodeAt(0) !== XCharCode) {
                    setAttribute.call(elm, key, cur);
                }
                else if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    setAttributeNS.call(elm, xmlNS, key, cur);
                }
                else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    setAttributeNS.call(elm, xlinkNS, key, cur);
                }
                else {
                    setAttribute.call(elm, key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            removeAttribute.call(elm, key);
        }
    }
}
const attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

const DashCharCode = 45;
function updateStyle(oldVnode, vnode) {
    let { data: { style: oldStyle } } = oldVnode;
    let { data: { style } } = vnode;
    if (!oldStyle && !style) {
        return;
    }
    if (oldStyle === style) {
        return;
    }
    oldStyle = oldStyle || {};
    style = style || {};
    let name;
    const { elm } = vnode;
    if (isString(style)) {
        elm.style.cssText = style;
    }
    else {
        if (isString(oldStyle)) {
            elm.style.cssText = '';
        }
        else {
            for (name in oldStyle) {
                if (!(name in style)) {
                    elm.style.removeProperty(name);
                }
            }
        }
        for (name in style) {
            const cur = style[name];
            if (cur !== oldStyle[name]) {
                if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                    // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
                    elm.style.setProperty(name, cur);
                }
                else {
                    elm.style[name] = cur;
                }
            }
        }
    }
}
const styleModule = {
    create: updateStyle,
    update: updateStyle,
};

function updateClass(oldVnode, vnode) {
    const { data: { class: oldClass = EmptyObject } } = oldVnode;
    const { elm, data: { class: klass = EmptyObject } } = vnode;
    if (oldClass === klass) {
        return;
    }
    const innerClass = (vnode.vm && vnode.vm.cmpClasses) || EmptyObject;
    let name;
    for (name in oldClass) {
        // remove only if it is not in the new class collection and it is not set from within the instance
        if (!klass[name] && !innerClass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        if (!oldClass[name]) {
            elm.classList.add(name);
        }
    }
}
var classes = {
    create: updateClass,
    update: updateClass
};

function handleEvent(event, vnode) {
    const { type } = event;
    const { data: { on } } = vnode;
    let handler = on && on[type];
    // call event handler if exists
    if (handler) {
        handler.call(undefined, event);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function removeAllEventListeners(vnode) {
    const { data: { on }, listener } = vnode;
    if (on && listener) {
        const { elm } = vnode;
        let name;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vnode.listener = undefined;
    }
}
function updateEventListeners(oldVnode, vnode) {
    const { data: { on: oldOn = EmptyObject } } = oldVnode;
    const { data: { on = EmptyObject } } = vnode;
    if (oldOn === on) {
        return;
    }
    const { elm } = vnode;
    const { elm: oldElm } = oldVnode;
    const listener = vnode.listener = oldVnode.listener || createListener();
    listener.vnode = vnode;
    let name;
    for (name in on) {
        if (isUndefined(oldOn[name])) {
            elm.addEventListener(name, listener, false);
        }
    }
    for (name in oldOn) {
        if (isUndefined(on[name])) {
            oldElm.removeEventListener(name, listener, false);
        }
    }
}
const eventListenersModule$1 = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: removeAllEventListeners
};

function updateToken(oldVnode, vnode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken }, elm } = vnode;
    if (oldToken === newToken) {
        return;
    }
    if (!isUndefined(oldToken)) {
        elm.removeAttribute(oldToken);
    }
    if (!isUndefined(newToken)) {
        elm.setAttribute(newToken, '');
    }
}
const tokenModule = {
    create: updateToken,
    update: updateToken,
};

function updateUID(oldVnode, vnode) {
    const { uid: oldUid } = oldVnode;
    const { elm, uid } = vnode;
    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    elm[OwnerKey] = uid;
}
const uidModule = {
    create: updateUID,
    update: updateUID,
};

const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    // from this point on, we do a series of DOM mutations
    eventListenersModule,
    componentClasses,
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    // See https://git.soma.salesforce.com/raptor/raptor/issues/791 for more
    attributesModule,
    props,
    classes,
    styleModule,
    eventListenersModule$1,
    tokenModule,
    uidModule,
]);

const { removeChild, appendChild, insertBefore, replaceChild } = Node.prototype;
const ConnectingSlot = Symbol();
const DisconnectingSlot = Symbol();
function callNodeSlot(node, slot) {
    if (!isUndefined(node[slot])) {
        node[slot]();
    }
    return node; // for convenience
}
// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
assign(Node.prototype, {
    appendChild(newChild) {
        const appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild, referenceNode) {
        const insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild) {
        const removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild, oldChild) {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    }
});
// this could happen for two reasons:
// * it is a root, and was removed manually
// * the element was appended to another container which requires disconnection to happen first
function forceDisconnection(vnode) {
    const { vm } = vnode;
    vm.isDirty = true;
    removeInsertionIndex(vm);
    clearListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use realm custom elements, we can remove this.
    patchShadowRoot(vm, []);
}
/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then we fallback to the normal Web-Components workflow.
 */
function createElement(tagName, options = {}) {
    const Ctor = isFunction(options.is) ? options.is : null;
    let vnode = undefined;
    // If we have a Ctor, create our VNode
    if (Ctor) {
        vnode = c(tagName, Ctor, {});
        vnode.isRoot = true;
        // If Ctor defines forceTagName
        // vnode.sel will be the tagname we should use
        tagName = vnode.sel;
    }
    // Create element with correct tagName
    const element = document.createElement(tagName);
    // If we created a vnode
    if (vnode) {
        // patch that guy
        patch(element, vnode); // eslint-disable-line no-undef
        // Handle insertion and removal from the DOM
        element[ConnectingSlot] = () => {
            insert(vnode); // eslint-disable-line no-undef
        };
        element[DisconnectingSlot] = () => {
            forceDisconnection(vnode); // eslint-disable-line no-undef
        };
    }
    return element;
}

exports.createElement = createElement;
exports.getComponentDef = getComponentDef;
exports.Element = ComponentElement;
exports.register = register;
exports.unwrap = unwrap;
exports.api = api$1;
exports.track = track;
exports.wire = wire;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/** version: 0.16.3 */
