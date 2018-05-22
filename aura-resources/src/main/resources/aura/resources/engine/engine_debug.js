/* proxy-compat-disable */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

function detect() {
    // Don't apply polyfill when ProxyCompat is enabled.
    if ('getKey' in Proxy) {
        return false;
    }
    const proxy = new Proxy([3, 4], {});
    const res = [1, 2].concat(proxy);
    return res.length !== 4;
}

const { isConcatSpreadable } = Symbol;
const { isArray } = Array;
const { slice: ArraySlice, unshift: ArrayUnshift, shift: ArrayShift } = Array.prototype;
function isObject(O) {
    return typeof O === 'object' ? O !== null : typeof O === 'function';
}
// https://www.ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
function isSpreadable(O) {
    if (!isObject(O)) {
        return false;
    }
    const spreadable = O[isConcatSpreadable];
    return spreadable !== undefined ? Boolean(spreadable) : isArray(O);
}
// https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat
function ArrayConcatPolyfill(...args) {
    const O = Object(this);
    const A = [];
    let N = 0;
    const items = ArraySlice.call(arguments);
    ArrayUnshift.call(items, O);
    while (items.length) {
        const E = ArrayShift.call(items);
        if (isSpreadable(E)) {
            let k = 0;
            const length = E.length;
            for (k; k < length; k += 1, N += 1) {
                if (k in E) {
                    const subElement = E[k];
                    A[N] = subElement;
                }
            }
        }
        else {
            A[N] = E;
            N += 1;
        }
    }
    return A;
}
function apply() {
    Array.prototype.concat = ArrayConcatPolyfill;
}

if (detect()) {
    apply();
}

const { freeze, seal, keys, create, assign, defineProperty, getPrototypeOf, setPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyNames, defineProperties, getOwnPropertySymbols, hasOwnProperty, preventExtensions, isExtensible, } = Object;
const { isArray: isArray$1 } = Array;
const { concat: ArrayConcat, filter: ArrayFilter, slice: ArraySlice$1, splice: ArraySplice, unshift: ArrayUnshift$1, indexOf: ArrayIndexOf, push: ArrayPush, map: ArrayMap, forEach, reduce: ArrayReduce, } = Array.prototype;
const { replace: StringReplace, toLowerCase: StringToLowerCase, indexOf: StringIndexOf, charCodeAt: StringCharCodeAt, slice: StringSlice, split: StringSplit, } = String.prototype;
function isUndefined(obj) {
    return obj === undefined;
}
function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isFunction(obj) {
    return typeof obj === 'function';
}
function isObject$1(obj) {
    return typeof obj === 'object';
}
function isString(obj) {
    return typeof obj === 'string';
}

const compareDocumentPosition = Node.prototype.compareDocumentPosition;

let nextTickCallbackQueue = [];
const SPACE_CHAR = 32;
const EmptyObject = seal(create(null));
const EmptyArray = seal([]);
const ViewModelReflection = Symbol();
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
const CAPS_REGEX = /[A-Z]/g;
/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
function getAttrNameFromPropName(propName) {
    if (!hasOwnProperty.call(PropNameToAttrNameMap, propName)) {
        PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, (match) => '-' + match.toLowerCase());
    }
    return PropNameToAttrNameMap[propName];
}
const usesNativeSymbols = typeof Symbol() === 'symbol';

const { addEventListener, removeEventListener, getAttribute, getAttributeNS, setAttribute, setAttributeNS, removeAttribute, removeAttributeNS, querySelector, querySelectorAll, } = Element.prototype;
const { DOCUMENT_POSITION_CONTAINED_BY } = Node;
const { compareDocumentPosition: compareDocumentPosition$1, } = Node.prototype;
function findShadowRoot(node) {
    let root = node;
    while (isUndefined(root[ViewModelReflection])) {
        root = root.parentNode;
    }
    return root;
}
function findComposedRootNode(node) {
    while (node !== document) {
        const parent = node.parentNode;
        if (isNull(parent)) {
            return node;
        }
        node = parent;
    }
    return node;
}
// TODO: once we start using the real shadowDOM, we can rely on:
// const { getRootNode } = Node.prototype;
// for now, we need to provide a dummy implementation to provide retargeting
function getRootNode(options) {
    const composed = isUndefined(options) ? false : !!options.composed;
    if (!composed) {
        return findShadowRoot(this.parentNode); // this is not quite the root (it is the host), but for us is sufficient
    }
    return findComposedRootNode(this);
}
function isChildNode(root, node) {
    return !!(compareDocumentPosition$1.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}
// These properties get added to LWCElement.prototype publicProps automatically
const defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex'];
// Few more exceptions that are using the attribute name to match the property in lowercase.
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
// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
const ARIA_REGEX = /^aria/;
function attemptAriaAttributeFallback(vm, attrName) {
    // if the map is known (because all AOM attributes are known)
    if (hasOwnProperty.call(AttrNameToPropNameMap, attrName)) {
        const propName = AttrNameToPropNameMap[attrName];
        // and if the corresponding prop is an actual AOM property
        if (hasOwnProperty.call(GlobalAOMProperties, propName)) {
            vm.hostAttrs[attrName] = undefined; // marking the set is needed for the AOM polyfill
            const shadowValue = vm.cmpRoot[propName];
            if (shadowValue !== null) {
                setAttribute.call(vm.elm, attrName, shadowValue);
            }
        }
    }
}
// Global Aria and Role Properties derived from ARIA and Role Attributes with their
// respective default value.
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
const GlobalAOMProperties = {
    ariaAutoComplete: null,
    ariaChecked: null,
    ariaCurrent: null,
    ariaDisabled: null,
    ariaExpanded: null,
    ariaHasPopUp: null,
    ariaHidden: null,
    ariaInvalid: null,
    ariaLabel: null,
    ariaLevel: null,
    ariaMultiLine: null,
    ariaMultiSelectable: null,
    ariaOrientation: null,
    ariaPressed: null,
    ariaReadOnly: null,
    ariaRequired: null,
    ariaSelected: null,
    ariaSort: null,
    ariaValueMax: null,
    ariaValueMin: null,
    ariaValueNow: null,
    ariaValueText: null,
    ariaLive: null,
    ariaRelevant: null,
    ariaAtomic: null,
    ariaBusy: null,
    ariaActiveDescendant: null,
    ariaControls: null,
    ariaDescribedBy: null,
    ariaFlowTo: null,
    ariaLabelledBy: null,
    ariaOwns: null,
    ariaPosInSet: null,
    ariaSetSize: null,
    ariaColCount: null,
    ariaColIndex: null,
    ariaDetails: null,
    ariaErrorMessage: null,
    ariaKeyShortcuts: null,
    ariaModal: null,
    ariaPlaceholder: null,
    ariaRoleDescription: null,
    ariaRowCount: null,
    ariaRowIndex: null,
    ariaRowSpan: null,
    role: null,
};
// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element
// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node
const GlobalHTMLPropDescriptors = create(null);
const AttrNameToPropNameMap = create(null);
const PropNameToAttrNameMap = create(null);
// Synthetic creation of all AOM property descriptors
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName) => {
    const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
    function get() {
        const vm = this[ViewModelReflection];
        if (!hasOwnProperty.call(vm.cmpProps, propName)) {
            return null;
        }
        return vm.cmpProps[propName];
    }
    function set(newValue) {
        // TODO: fallback to the root's AOM default semantics
        const vm = this[ViewModelReflection];
        const value = vm.cmpProps[propName] = isNull(newValue) ? null : newValue + ''; // storing the normalized new value
        if (isNull(value)) {
            newValue = vm.rootProps[propName];
            vm.hostAttrs[attrName] = undefined;
        }
        else {
            vm.hostAttrs[attrName] = 1;
        }
        if (isNull(newValue)) {
            removeAttribute.call(this, attrName);
        }
        else {
            setAttribute.call(this, attrName, newValue);
        }
    }
    // TODO: eventually this descriptors should come from HTMLElement.prototype.*
    GlobalHTMLPropDescriptors[propName] = {
        set,
        get,
        configurable: true,
        enumerable: true,
    };
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});
forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    const descriptor = getOwnPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        GlobalHTMLPropDescriptors[propName] = descriptor;
        const attrName = StringToLowerCase.call(propName);
        AttrNameToPropNameMap[attrName] = propName;
        PropNameToAttrNameMap[propName] = attrName;
    }
});
forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, (propName) => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});
if (isUndefined(GlobalHTMLPropDescriptors.id)) {
    // In IE11, id property is on Element.prototype instead of HTMLElement
    GlobalHTMLPropDescriptors.id = getOwnPropertyDescriptor(Element.prototype, 'id');
    AttrNameToPropNameMap.id = PropNameToAttrNameMap.id = 'id';
}
// https://dom.spec.whatwg.org/#dom-event-composed
// This is a very dummy, simple polyfill for composed
if (!getOwnPropertyDescriptor(Event.prototype, 'composed')) {
    defineProperties(Event.prototype, {
        composed: {
            value: true,
            configurable: true,
            enumerable: true,
            writable: true,
        },
    });
    const { CustomEvent: OriginalCustomEvent } = window;
    window.CustomEvent = function PatchedCustomEvent(type, eventInitDict) {
        const event = new OriginalCustomEvent(type, eventInitDict);
        // support for composed on custom events
        event.composed = !!(eventInitDict && eventInitDict.composed);
        return event;
    };
    window.CustomEvent.prototype = OriginalCustomEvent.prototype;
}
const CustomEvent = window.CustomEvent;

function decorate(Ctor, decorators) {
    // intentionally comparing decorators with null and undefined
    if (!isFunction(Ctor) || decorators == null) {
        throw new TypeError();
    }
    const props = getOwnPropertyNames(decorators);
    // intentionally allowing decoration of classes only for now
    const target = Ctor.prototype;
    for (let i = 0, len = props.length; i < len; i += 1) {
        const propName = props[i];
        const decorator = decorators[propName];
        if (!isFunction(decorator)) {
            throw new TypeError();
        }
        const originalDescriptor = getOwnPropertyDescriptor(target, propName);
        const descriptor = decorator(Ctor, propName, originalDescriptor);
        if (!isUndefined(descriptor)) {
            defineProperty(target, propName, descriptor);
        }
    }
    return Ctor; // chaining
}

const TopLevelContextSymbol = Symbol();
let currentContext = {};
currentContext[TopLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

const Services = create(null);
const hooks = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
function register(service) {
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        if (hookName in service) {
            let l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            ArrayPush.call(l, service[hookName]);
        }
    }
}
function invokeServiceHook(vm, cbs) {
    const { component, data, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

function createComponent(vm, Ctor) {
    // create the component instance
    invokeComponentConstructor(vm, Ctor);
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
function clearReactiveListeners(vm) {
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
function isValidEvent(event) {
    // TODO: this is only needed if ShadowDOM is not used
    if (event.composed === true) {
        return true;
    }
    // if the closest root contains the currentTarget, the event is valid
    return isChildNode(getRootNode.call(event.target), event.currentTarget);
}
function renderComponent(vm) {
    clearReactiveListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    return vnodes;
}
function markComponentAsDirty(vm) {
    vm.isDirty = true;
}
function getCustomElementComponent(elmOrRoot) {
    return elmOrRoot[ViewModelReflection].component;
}

/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
var isArray$2 = Array.isArray;
var getPrototypeOf$1 = Object.getPrototypeOf, ObjectCreate = Object.create, ObjectDefineProperty = Object.defineProperty, ObjectDefineProperties = Object.defineProperties;
var ObjectDotPrototype = Object.prototype;
function isUndefined$1(obj) {
    return obj === undefined;
}
var TargetSlot = Symbol();
// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
var getKey = Proxy.getKey;
var unwrap = getKey ?
    function (replicaOrAny) { return (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny; }
    : function (replicaOrAny) { return (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny; };
function isObservable(value) {
    if (value == null) {
        return false;
    }
    if (isArray$2(value)) {
        return true;
    }
    var proto = getPrototypeOf$1(value);
    return (proto === ObjectDotPrototype || proto === null || getPrototypeOf$1(proto) === null);
}
function isObject$2(obj) {
    return typeof obj === 'object';
}

var isArray$1$1 = Array.isArray;
var getPrototypeOf$1$1 = Object.getPrototypeOf, isExtensible$1 = Object.isExtensible, getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor, getOwnPropertyNames$1 = Object.getOwnPropertyNames, getOwnPropertySymbols$1 = Object.getOwnPropertySymbols, defineProperty$1 = Object.defineProperty, preventExtensions$1 = Object.preventExtensions;
var ArrayConcat$1$1 = Array.prototype.concat;
// Unwrap property descriptors
// We only need to unwrap if value is specified
function unwrapDescriptor(descriptor) {
    if ('value' in descriptor) {
        descriptor.value = unwrap(descriptor.value);
    }
    return descriptor;
}
function wrapDescriptor(membrane, descriptor) {
    if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? membrane.getProxy(descriptor.value) : descriptor.value;
    }
    return descriptor;
}
function lockShadowTarget(membrane, shadowTarget, originalTarget) {
    var targetKeys = ArrayConcat$1$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
    targetKeys.forEach(function (key) {
        var descriptor = getOwnPropertyDescriptor$1(originalTarget, key);
        // We do not need to wrap the descriptor if not configurable
        // Because we can deal with wrapping it when user goes through
        // Get own property descriptor. There is also a chance that this descriptor
        // could change sometime in the future, so we can defer wrapping
        // until we need to
        if (!descriptor.configurable) {
            descriptor = wrapDescriptor(membrane, descriptor);
        }
        defineProperty$1(shadowTarget, key, descriptor);
    });
    preventExtensions$1(shadowTarget);
}
var ReactiveProxyHandler = /** @class */ (function () {
    function ReactiveProxyHandler(membrane, value) {
        this.originalTarget = value;
        this.membrane = membrane;
    }
    ReactiveProxyHandler.prototype.get = function (shadowTarget, key) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        if (key === TargetSlot) {
            return originalTarget;
        }
        var value = originalTarget[key];
        observeMutation(membrane, originalTarget, key);
        return membrane.getProxy(value);
    };
    ReactiveProxyHandler.prototype.set = function (shadowTarget, key, value) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        var oldValue = originalTarget[key];
        if (oldValue !== value) {
            originalTarget[key] = value;
            notifyMutation(membrane, originalTarget, key);
        }
        else if (key === 'length' && isArray$1$1(originalTarget)) {
            // fix for issue #236: push will add the new index, and by the time length
            // is updated, the internal length is already equal to the new length value
            // therefore, the oldValue is equal to the value. This is the forking logic
            // to support this use case.
            notifyMutation(membrane, originalTarget, key);
        }
        return true;
    };
    ReactiveProxyHandler.prototype.deleteProperty = function (shadowTarget, key) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        delete originalTarget[key];
        notifyMutation(membrane, originalTarget, key);
        return true;
    };
    ReactiveProxyHandler.prototype.apply = function (shadowTarget, thisArg, argArray) {
        /* No op */
    };
    ReactiveProxyHandler.prototype.construct = function (target, argArray, newTarget) {
        /* No op */
    };
    ReactiveProxyHandler.prototype.has = function (shadowTarget, key) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        observeMutation(membrane, originalTarget, key);
        return key in originalTarget;
    };
    ReactiveProxyHandler.prototype.ownKeys = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return ArrayConcat$1$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
    };
    ReactiveProxyHandler.prototype.isExtensible = function (shadowTarget) {
        var shadowIsExtensible = isExtensible$1(shadowTarget);
        if (!shadowIsExtensible) {
            return shadowIsExtensible;
        }
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        var targetIsExtensible = isExtensible$1(originalTarget);
        if (!targetIsExtensible) {
            lockShadowTarget(membrane, shadowTarget, originalTarget);
        }
        return targetIsExtensible;
    };
    ReactiveProxyHandler.prototype.setPrototypeOf = function (shadowTarget, prototype) {
    };
    ReactiveProxyHandler.prototype.getPrototypeOf = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return getPrototypeOf$1$1(originalTarget);
    };
    ReactiveProxyHandler.prototype.getOwnPropertyDescriptor = function (shadowTarget, key) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        // keys looked up via hasOwnProperty need to be reactive
        observeMutation(membrane, originalTarget, key);
        var desc = getOwnPropertyDescriptor$1(originalTarget, key);
        if (isUndefined$1(desc)) {
            return desc;
        }
        var shadowDescriptor = getOwnPropertyDescriptor$1(shadowTarget, key);
        if (!desc.configurable && !shadowDescriptor) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            desc = wrapDescriptor(membrane, desc);
            defineProperty$1(shadowTarget, key, desc);
        }
        return shadowDescriptor || desc;
    };
    ReactiveProxyHandler.prototype.preventExtensions = function (shadowTarget) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        lockShadowTarget(membrane, shadowTarget, originalTarget);
        preventExtensions$1(originalTarget);
        return true;
    };
    ReactiveProxyHandler.prototype.defineProperty = function (shadowTarget, key, descriptor) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        var configurable = descriptor.configurable;
        // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors
        if ('writable' in descriptor && !('value' in descriptor)) {
            var originalDescriptor = getOwnPropertyDescriptor$1(originalTarget, key);
            descriptor.value = originalDescriptor.value;
        }
        defineProperty$1(originalTarget, key, unwrapDescriptor(descriptor));
        if (configurable === false) {
            defineProperty$1(shadowTarget, key, wrapDescriptor(membrane, descriptor));
        }
        notifyMutation(membrane, originalTarget, key);
        return true;
    };
    return ReactiveProxyHandler;
}());

var getOwnPropertyDescriptor$1$1 = Object.getOwnPropertyDescriptor, getOwnPropertyNames$1$1 = Object.getOwnPropertyNames, getOwnPropertySymbols$1$1 = Object.getOwnPropertySymbols, defineProperty$1$1 = Object.defineProperty;
var ArrayConcat$2 = Array.prototype.concat;
function wrapDescriptor$1(membrane, descriptor) {
    if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? membrane.getReadOnlyProxy(descriptor.value) : descriptor.value;
    }
    return descriptor;
}
var ReadOnlyHandler = /** @class */ (function () {
    function ReadOnlyHandler(membrane, value) {
        this.originalTarget = value;
        this.membrane = membrane;
    }
    ReadOnlyHandler.prototype.get = function (shadowTarget, key) {
        var _a = this, membrane = _a.membrane, originalTarget = _a.originalTarget;
        if (key === TargetSlot) {
            return originalTarget;
        }
        var value = originalTarget[key];
        observeMutation(membrane, originalTarget, key);
        return membrane.getReadOnlyProxy(value);
    };
    ReadOnlyHandler.prototype.set = function (shadowTarget, key, value) {
        
        return false;
    };
    ReadOnlyHandler.prototype.deleteProperty = function (shadowTarget, key) {
        
        return false;
    };
    ReadOnlyHandler.prototype.apply = function (shadowTarget, thisArg, argArray) {
        /* No op */
    };
    ReadOnlyHandler.prototype.construct = function (target, argArray, newTarget) {
        /* No op */
    };
    ReadOnlyHandler.prototype.has = function (shadowTarget, key) {
        var _a = this, membrane = _a.membrane, originalTarget = _a.originalTarget;
        observeMutation(membrane, originalTarget, key);
        return key in originalTarget;
    };
    ReadOnlyHandler.prototype.ownKeys = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return ArrayConcat$2.call(getOwnPropertyNames$1$1(originalTarget), getOwnPropertySymbols$1$1(originalTarget));
    };
    ReadOnlyHandler.prototype.setPrototypeOf = function (shadowTarget, prototype) {
        
    };
    ReadOnlyHandler.prototype.getOwnPropertyDescriptor = function (shadowTarget, key) {
        var _a = this, originalTarget = _a.originalTarget, membrane = _a.membrane;
        // keys looked up via hasOwnProperty need to be reactive
        observeMutation(membrane, originalTarget, key);
        var desc = getOwnPropertyDescriptor$1$1(originalTarget, key);
        if (isUndefined$1(desc)) {
            return desc;
        }
        var shadowDescriptor = getOwnPropertyDescriptor$1$1(shadowTarget, key);
        if (!desc.configurable && !shadowDescriptor) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            desc = wrapDescriptor$1(membrane, desc);
            defineProperty$1$1(shadowTarget, key, desc);
        }
        return shadowDescriptor || desc;
    };
    ReadOnlyHandler.prototype.preventExtensions = function (shadowTarget) {
        
        return false;
    };
    ReadOnlyHandler.prototype.defineProperty = function (shadowTarget, key, descriptor) {
        
        return false;
    };
    return ReadOnlyHandler;
}());
function invokeDistortion(membrane, value) {
    return membrane.distortion(value);
}
function createShadowTarget(value) {
    var shadowTarget = undefined;
    if (isArray$2(value)) {
        shadowTarget = [];
    }
    else if (isObject$2(value)) {
        shadowTarget = {};
    }
    return shadowTarget;
}
function getReactiveState(membrane, value) {
    var objectGraph = membrane.objectGraph;
    value = unwrap(value);
    var reactiveState = objectGraph.get(value);
    if (reactiveState) {
        return reactiveState;
    }
    reactiveState = ObjectDefineProperties(ObjectCreate(null), {
        shadowTarget: {
            get: function () {
                var shadowTarget = createShadowTarget(value);
                ObjectDefineProperty(this, 'shadowTarget', { value: shadowTarget });
                return shadowTarget;
            },
            configurable: true,
        },
        reactive: {
            get: function () {
                var shadowTarget = this.shadowTarget;
                var reactiveHandler = new ReactiveProxyHandler(membrane, value);
                var proxy = new Proxy(shadowTarget, reactiveHandler);
                ObjectDefineProperty(this, 'reactive', { value: proxy });
                return proxy;
            },
            configurable: true,
        },
        readOnly: {
            get: function () {
                var shadowTarget = this.shadowTarget;
                var readOnlyHandler = new ReadOnlyHandler(membrane, value);
                var proxy = new Proxy(shadowTarget, readOnlyHandler);
                ObjectDefineProperty(this, 'readOnly', { value: proxy });
                return proxy;
            },
            configurable: true,
        }
    });
    objectGraph.set(value, reactiveState);
    return reactiveState;
}
function notifyMutation(membrane, obj, key) {
    membrane.propertyMemberChange(obj, key);
}
function observeMutation(membrane, obj, key) {
    membrane.propertyMemberAccess(obj, key);
}
var ReactiveMembrane = /** @class */ (function () {
    function ReactiveMembrane(distortion, eventMap) {
        this.objectGraph = new WeakMap();
        this.distortion = distortion;
        this.propertyMemberChange = eventMap.propertyMemberChange;
        this.propertyMemberAccess = eventMap.propertyMemberAccess;
    }
    ReactiveMembrane.prototype.getProxy = function (value) {
        var distorted = invokeDistortion(this, value);
        if (isObservable(distorted)) {
            var o = getReactiveState(this, distorted);
            // when trying to extract the writable version of a readonly
            // we return the readonly.
            return o.readOnly === value ? value : o.reactive;
        }
        return distorted;
    };
    ReactiveMembrane.prototype.getReadOnlyProxy = function (value) {
        var distorted = invokeDistortion(this, value);
        if (isObservable(distorted)) {
            return getReactiveState(this, distorted).readOnly;
        }
        return distorted;
    };
    return ReactiveMembrane;
}());
/** version: 0.20.4 */

const TargetToReactiveRecordMap = new WeakMap();
function notifyMutation$1(target, key) {
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
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
function observeMutation$1(target, key) {
    if (isNull(vmBeingRendered)) {
        return; // nothing to subscribe to
    }
    const vm = vmBeingRendered;
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

function format(value) {
    return value;
}
const reactiveMembrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation$1,
    propertyMemberAccess: observeMutation$1,
});
// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
function dangerousObjectMutation(obj) {
    return reactiveMembrane.getProxy(unwrap$1(obj));
}
const TargetSlot$1 = Symbol();
const MembraneSlot = Symbol();
function isReplicable(value) {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}
// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey: ProxyGetKey } = Proxy;
const getKey$1 = ProxyGetKey ? ProxyGetKey : (o, key) => o[key];
function replicaUnwrap(value) {
    // observable membrane goes first because it is in the critical path
    return (value && getKey$1(value, TargetSlot$1)) || value;
}
function getReplica(piercingMembrane, value) {
    if (isNull(value)) {
        return value;
    }
    const replicaRawValue = replicaUnwrap(value);
    if (!isReplicable(replicaRawValue)) {
        return replicaRawValue;
    }
    const reactiveRawValue = unwrap(replicaRawValue);
    if (replicaRawValue !== reactiveRawValue) {
        // user is accessing a reactive membrane via a piercing membrane
        // in which case we return a readonly version of the reactive one
        return reactiveMembrane.getReadOnlyProxy(reactiveRawValue);
    }
    const { cells } = piercingMembrane;
    const r = cells.get(replicaRawValue);
    if (r) {
        return r;
    }
    const replica = new Proxy(replicaRawValue, piercingMembrane);
    cells.set(replicaRawValue, replica);
    return replica;
}
class Membrane {
    constructor(handler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    get(target, key) {
        if (key === TargetSlot$1) {
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
        if (key === TargetSlot$1) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    }
    apply(target, thisArg, argumentsList) {
        thisArg = unwrap$1(thisArg);
        argumentsList = unwrap$1(argumentsList);
        if (isArray$1(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap$1);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    }
    construct(target, argumentsList, newTarget) {
        argumentsList = unwrap$1(argumentsList);
        if (isArray$1(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap$1);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    }
}
// Universal unwrap mechanism that works for any type of membrane
function unwrap$1(value) {
    // observable membrane goes first because it is in the critical path
    let unwrapped = unwrap(value);
    if (unwrapped !== value) {
        return unwrapped;
    }
    // piercing membrane is not that important, it goes second
    unwrapped = replicaUnwrap(value);
    if (unwrapped !== value) {
        return unwrapped;
    }
    return value;
}

function piercingHook(membrane, target, key, value) {
    const { piercing } = Services;
    if (piercing) {
        let result = value;
        let next = true;
        const callback = (newValue) => {
            next = false;
            result = newValue;
        };
        for (let i = 0, len = piercing.length; next && i < len; ++i) {
            piercing[i].call(undefined, target, key, value, callback);
        }
        return result === value ? getReplica(membrane, result) : result;
    }
}
let piercingMembrane;
function createPiercingMembrane() {
    return new Membrane({
        get(membrane, target, key) {
            if (key === OwnerKey) {
                return undefined;
            }
            const value = target[key];
            return piercingHook(membrane, target, key, value);
        },
        set(membrane, target, key, newValue) {
            target[key] = newValue;
            return true;
        },
        deleteProperty(membrane, target, key) {
            delete target[key];
            return true;
        },
        apply(membrane, targetFn, thisArg, argumentsList) {
            return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
        },
        construct(membrane, targetFn, argumentsList, newTarget) {
            return getReplica(membrane, new targetFn(...argumentsList));
        },
    });
}
function pierce(value) {
    if (isUndefined(piercingMembrane)) {
        piercingMembrane = createPiercingMembrane();
    }
    return getReplica(piercingMembrane, value);
}
// TODO: this is only really needed by locker, eventually we can remove this
function pierceProperty(target, key) {
    if (isUndefined(piercingMembrane)) {
        piercingMembrane = createPiercingMembrane();
    }
    return piercingHook(piercingMembrane, target, key, target[key]);
}

const rootEventListenerMap = new WeakMap();
function getWrappedRootListener(vm, listener) {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let wrappedListener = rootEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function (event) {
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            const { composed, target, currentTarget } = event;
            if (
            // it is composed and was not dispatched onto the custom element directly
            (composed === true && target !== currentTarget) ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget) ||
                // it is not composed and its is coming from from shadow
                (composed === false && getRootNode.call(event.target) === currentTarget)) {
                const e = pierce(event);
                invokeEventListener(vm, EventListenerContext.ROOT_LISTENER, listener, e);
            }
        };
        wrappedListener.placement = EventListenerContext.ROOT_LISTENER;
        rootEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}
const cmpEventListenerMap = new WeakMap();
function getWrappedComponentsListener(vm, listener) {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let wrappedListener = cmpEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function (event) {
            const { composed, target, currentTarget } = event;
            if (
            // it is composed, and we should always get it
            composed === true ||
                // it is dispatched onto the custom element directly
                target === currentTarget ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget)) {
                const e = pierce(event);
                invokeEventListener(vm, EventListenerContext.COMPONENT_LISTENER, listener, e);
            }
        };
        wrappedListener.placement = EventListenerContext.COMPONENT_LISTENER;
        cmpEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}
function createElementEventListener(vm) {
    return function (evt) {
        let interrupted = false;
        const { type, stopImmediatePropagation } = evt;
        const { cmpEvents } = vm;
        const listeners = cmpEvents[type]; // it must have listeners at this point
        const len = listeners.length;
        evt.stopImmediatePropagation = function () {
            interrupted = true;
            stopImmediatePropagation.call(this);
        };
        for (let i = 0; i < len; i += 1) {
            if (listeners[i].placement === EventListenerContext.ROOT_LISTENER) {
                // all handlers on the custom element should be called with undefined 'this'
                listeners[i].call(undefined, evt);
                if (interrupted) {
                    return;
                }
            }
        }
        for (let i = 0; i < len; i += 1) {
            if (listeners[i].placement === EventListenerContext.COMPONENT_LISTENER) {
                // all handlers on the custom element should be called with undefined 'this'
                listeners[i].call(undefined, evt);
                if (interrupted) {
                    return;
                }
            }
        }
    };
}
function attachDOMListener(vm, type, wrappedListener) {
    let { cmpListener, cmpEvents } = vm;
    if (isUndefined(cmpListener)) {
        cmpListener = vm.cmpListener = createElementEventListener(vm);
    }
    if (isUndefined(cmpEvents)) {
        cmpEvents = vm.cmpEvents = create(null);
    }
    let cmpEventHandlers = cmpEvents[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = cmpEvents[type] = [];
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (cmpEventHandlers.length === 0) {
        addEventListener.call(vm.elm, type, cmpListener);
    }
    else {}
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}
function detachDOMListener(vm, type, wrappedListener) {
    const { cmpEvents } = vm;
    let p;
    let listeners;
    if (!isUndefined(cmpEvents) && !isUndefined(listeners = cmpEvents[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
        ArraySplice.call(listeners, p, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners.length === 0) {
            removeEventListener.call(vm.elm, type, vm.cmpListener);
        }
    }
    else {}
}
function addCmpEventListener(vm, type, listener, options) {
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}
function addRootEventListener(vm, type, listener, options) {
    const wrappedListener = getWrappedRootListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}
function removeCmpEventListener(vm, type, listener, options) {
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}
function removeRootEventListener(vm, type, listener, options) {
    const wrappedListener = getWrappedRootListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}

function getLinkedElement(root) {
    return getCustomElementVM(root).elm;
}
function createAccessibilityDescriptorForShadowRoot(propName, attrName, defaultValue) {
    // we use value as the storage mechanism and as the default value for the property
    return {
        enumerable: false,
        get() {
            const vm = getCustomElementVM(this);
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            vm.rootProps[propName] = newValue;
            if (!isUndefined(vm.hostAttrs[attrName])) {
                return;
            }
            if (isNull(newValue)) {
                removeAttribute.call(vm.elm, attrName);
                return;
            }
            setAttribute.call(vm.elm, attrName, newValue);
        }
    };
}
const RootDescriptors = create(null);
// This routine will build a descriptor map for all AOM properties to be added
// to ShadowRoot prototype to polyfill AOM capabilities.
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName) => RootDescriptors[propName] = createAccessibilityDescriptorForShadowRoot(propName, getAttrNameFromPropName(propName), GlobalAOMProperties[propName]));
function shadowRootQuerySelector(shadowRoot, selector) {
    const vm = getCustomElementVM(shadowRoot);
    const elm = getLinkedElement(shadowRoot);
    return getFirstMatch(vm, elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    const vm = getCustomElementVM(shadowRoot);
    const elm = getLinkedElement(shadowRoot);
    return getAllMatches(vm, elm, selector);
}
class Root {
    constructor(vm) {
        defineProperty(this, ViewModelReflection, {
            value: vm,
        });
    }
    get mode() {
        return 'closed';
    }
    get host() {
        return getCustomElementVM(this).component;
    }
    get innerHTML() {
        // TODO: should we add this only in dev mode? or wrap this in dev mode?
        throw new Error();
    }
    querySelector(selector) {
        const node = shadowRootQuerySelector(this, selector);
        return node;
    }
    querySelectorAll(selector) {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        return nodeList;
    }
    addEventListener(type, listener, options) {
        const vm = getCustomElementVM(this);
        addRootEventListener(vm, type, listener, options);
    }
    removeEventListener(type, listener, options) {
        const vm = getCustomElementVM(this);
        removeRootEventListener(vm, type, listener, options);
    }
    toString() {
        const component = getCustomElementComponent(this);
        return `Current ShadowRoot for ${component}`;
    }
}
defineProperties(Root.prototype, RootDescriptors);
function getFirstMatch(vm, elm, selector) {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(nodeList[i]);
        }
    }
    return null;
}
function getAllMatches(vm, elm, selector) {
    const nodeList = querySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node) => isNodeOwnedByVM(vm, node));
    return pierce(filteredNodes);
}
function getElementOwnerVM(elm) {
    if (!(elm instanceof Node)) {
        return;
    }
    let node = elm;
    let ownerKey;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = node[OwnerKey]))) {
        node = node.parentNode;
    }
    if (isUndefined(ownerKey) || isNull(node)) {
        return;
    }
    let vm;
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(node) && (isUndefined(vm = node[ViewModelReflection]) || vm.uid !== ownerKey)) {
        node = node.parentNode;
    }
    return isNull(node) ? undefined : vm;
}
function isParentNodeKeyword(key) {
    return (key === 'parentNode' || key === 'parentElement');
}
function isIframeContentWindow(key, value) {
    return (key === 'contentWindow') && value.window === value;
}
function wrapIframeWindow(win) {
    return {
        [TargetSlot$1]: win,
        postMessage() {
            return win.postMessage.apply(win, arguments);
        },
        blur() {
            return win.blur.apply(win, arguments);
        },
        close() {
            return win.close.apply(win, arguments);
        },
        focus() {
            return win.focus.apply(win, arguments);
        },
        get closed() {
            return win.closed;
        },
        get frames() {
            return win.frames;
        },
        get length() {
            return win.length;
        },
        get location() {
            return win.location;
        },
        set location(value) {
            win.location = value;
        },
        get opener() {
            return win.opener;
        },
        get parent() {
            return win.parent;
        },
        get self() {
            return win.self;
        },
        get top() {
            return win.top;
        },
        get window() {
            return win.window;
        },
    };
}
const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(target, key, value, callback) {
        if (value) {
            if (isIframeContentWindow(key, value)) {
                callback(wrapIframeWindow(value));
            }
            if (value === querySelector) {
                return callback((selector) => {
                    const vm = getElementOwnerVM(target);
                    return isUndefined(vm) ? null : getFirstMatch(vm, target, selector);
                });
            }
            if (value === querySelectorAll) {
                return callback((selector) => {
                    const vm = getElementOwnerVM(target);
                    return isUndefined(vm) ? [] : getAllMatches(vm, target, selector);
                });
            }
            if (isParentNodeKeyword(key)) {
                const vm = getElementOwnerVM(target);
                if (!isUndefined(vm) && value === vm.elm) {
                    // walking up via parent chain might end up in the shadow root element
                    return callback(vm.component.template);
                }
                else if (target instanceof Element && value instanceof Element && target[OwnerKey] !== value[OwnerKey]) {
                    // cutting out access to something outside of the shadow of the current target (usually slots)
                    return callback(); // TODO: this should probably be `null`
                }
            }
            if (target instanceof Event) {
                const event = target;
                switch (key) {
                    case 'currentTarget':
                        // intentionally return the host element pierced here otherwise the general role below
                        // will kick in and return the cmp, which is not the intent.
                        return callback(pierce(value));
                    case 'target':
                        const { currentTarget } = event;
                        // Executing event listener on component, target is always currentTarget
                        if (componentEventListenerType === EventListenerContext.COMPONENT_LISTENER) {
                            return callback(pierce(currentTarget));
                        }
                        // Event is coming from an slotted element
                        if (isChildNode(getRootNode.call(value, GET_ROOT_NODE_CONFIG_FALSE), currentTarget)) {
                            return;
                        }
                        // target is owned by the VM
                        const vm = currentTarget ? getElementOwnerVM(currentTarget) : undefined;
                        if (!isUndefined(vm)) {
                            let node = value;
                            while (!isNull(node) && vm.uid !== node[OwnerKey]) {
                                node = node.parentNode;
                            }
                            return callback(pierce(node));
                        }
                }
            }
        }
    }
});

function getHTMLPropDescriptor(propName, descriptor) {
    const { get, set, enumerable, configurable } = descriptor;
    if (!isFunction(get)) {
        throw new TypeError();
    }
    if (!isFunction(set)) {
        throw new TypeError();
    }
    return {
        enumerable,
        configurable,
        get() {
            const vm = this[ViewModelReflection];
            if (isBeingConstructed(vm)) {
                return;
            }
            observeMutation$1(this, propName);
            return get.call(vm.elm);
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            if (newValue !== vm.cmpProps[propName]) {
                vm.cmpProps[propName] = newValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation$1(this, propName);
                }
            }
            return set.call(vm.elm, newValue);
        }
    };
}
const htmlElementDescriptors = ArrayReduce.call(getOwnPropertyNames(GlobalHTMLPropDescriptors), (seed, propName) => {
    seed[propName] = getHTMLPropDescriptor(propName, GlobalHTMLPropDescriptors[propName]);
    return seed;
}, {});
function getLinkedElement$1(cmp) {
    return cmp[ViewModelReflection].elm;
}
function querySelectorAllFromComponent(cmp, selectors) {
    const elm = getLinkedElement$1(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
function LWCElement() {
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
    }
    const vm = vmBeingConstructed;
    const { elm, def } = vm;
    const component = this;
    vm.component = component;
    // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        const { callHook, setHook, getHook } = arguments[0];
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
    }
    // linking elm and its component with VM
    component[ViewModelReflection] = elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
}
LWCElement.prototype = {
    constructor: LWCElement,
    // HTML Element - The Good Parts
    dispatchEvent(event) {
        const elm = getLinkedElement$1(this);
        const vm = getCustomElementVM(this);
        // Pierce dispatchEvent so locker service has a chance to overwrite
        const dispatchEvent = pierceProperty(elm, 'dispatchEvent');
        return dispatchEvent.call(elm, event);
    },
    addEventListener(type, listener, options) {
        const vm = getCustomElementVM(this);
        addCmpEventListener(vm, type, listener, options);
    },
    removeEventListener(type, listener, options) {
        const vm = getCustomElementVM(this);
        removeCmpEventListener(vm, type, listener, options);
    },
    setAttributeNS(ns, attrName, value) {
        // use cached setAttributeNS, because elm.setAttribute throws
        // when not called in template
        return setAttributeNS.call(getLinkedElement$1(this), ns, attrName, value);
    },
    removeAttributeNS(ns, attrName) {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS.call(getLinkedElement$1(this), ns, attrName);
    },
    removeAttribute(attrName) {
        const vm = getCustomElementVM(this);
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        removeAttribute.call(vm.elm, attrName);
        attemptAriaAttributeFallback(vm, attrName);
    },
    setAttribute(attrName, value) {
        const vm = getCustomElementVM(this);
        // marking the set is needed for the AOM polyfill
        vm.hostAttrs[attrName] = 1;
        // use cached setAttribute, because elm.setAttribute throws
        // when not called in template
        return setAttribute.call(getLinkedElement$1(this), attrName, value);
    },
    getAttributeNS(ns, attrName) {
        return getAttributeNS.call(getLinkedElement$1(this), ns, attrName);
    },
    getAttribute(attrName) {
        return getAttribute.apply(getLinkedElement$1(this), ArraySlice$1.call(arguments));
    },
    getBoundingClientRect() {
        const elm = getLinkedElement$1(this);
        return elm.getBoundingClientRect();
    },
    querySelector(selectors) {
        const vm = getCustomElementVM(this);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(nodeList[i]);
            }
        }
        return null;
    },
    querySelectorAll(selectors) {
        const vm = getCustomElementVM(this);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node) => wasNodePassedIntoVM(vm, node));
        return pierce(filteredNodes);
    },
    get tagName() {
        const elm = getLinkedElement$1(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get classList() {
        return getLinkedElement$1(this).classList;
    },
    get template() {
        const vm = getCustomElementVM(this);
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    get root() {
        return this.template;
    },
    toString() {
        const vm = getCustomElementVM(this);
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute.call(elm, 'is');
        return `<${tagName.toLowerCase()}${is ? ' is="${is}' : ''}>`;
    },
};
defineProperties(LWCElement.prototype, htmlElementDescriptors);
freeze(LWCElement);
seal(LWCElement.prototype);
function getCustomElementVM(elmOrCmp) {
    return elmOrCmp[ViewModelReflection];
}

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;
const { ELEMENT_NODE, TEXT_NODE, COMMENT_NODE } = Node;
const classNameToClassMap = create(null);
function getMapFromClassName(className) {
    if (className === undefined) {
        return;
    }
    let map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    let start = 0;
    let o;
    const len = className.length;
    for (o = 0; o < len; o++) {
        if (StringCharCodeAt.call(className, o) === SPACE_CHAR) {
            if (o > start) {
                map[StringSlice.call(className, start, o)] = true;
            }
            start = o + 1;
        }
    }
    if (o > start) {
        map[StringSlice.call(className, start, o)] = true;
    }
    classNameToClassMap[className] = map;
    return map;
}
// insert is called after postpatch, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use postpatch as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
const hook = {
    postpatch(oldVNode, vnode) {
        const vm = getCustomElementVM(vnode.elm);
        vm.cmpSlots = vnode.data.slotset;
        // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
        // one of those is changed, the vm should be marked as dirty.
        // TODO: Issue #133
        if (vm.cmpSlots !== oldVNode.data.slotset && !vm.isDirty) {
            markComponentAsDirty(vm);
        }
        renderVM(vm);
    },
    insert(vnode) {
        const vm = getCustomElementVM(vnode.elm);
        appendVM(vm);
        renderVM(vm);
    },
    create(oldVNode, vnode) {
        createVM(vnode.sel, vnode.elm, vnode.data.slotset);
    },
    destroy(vnode) {
        removeVM(getCustomElementVM(vnode.elm));
    }
};
function isVElement(vnode) {
    return vnode.nt === ELEMENT_NODE;
}
function addNS(vnode) {
    const { data, children, sel } = vnode;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray$1(children) && sel !== 'foreignObject') {
        for (let j = 0, n = children.length; j < n; ++j) {
            const childNode = children[j];
            if (childNode != null && isVElement(childNode)) {
                addNS(childNode);
            }
        }
    }
}
function getCurrentOwnerId() {
    return isNull(vmBeingRendered) ? 0 : vmBeingRendered.uid;
}
function getCurrentTplToken() {
    // For root elements and other special cases the vm is not set.
    if (isNull(vmBeingRendered)) {
        return;
    }
    return vmBeingRendered.context.tplToken;
}
function normalizeStyleString(value) {
    if (value == null || value === false) {
        return;
    }
    if (isString(value)) {
        return value;
    }
    return value + '';
}
// [h]tml node
function h(sel, data, children) {
    const { classMap, className, style, styleMap, key } = data;
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentTplToken();
    data.uid = getCurrentOwnerId();
    let text, elm; // tslint:disable-line
    const vnode = {
        nt: ELEMENT_NODE,
        tag: sel,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
    if (sel.length === 3 && StringCharCodeAt.call(sel, 0) === CHAR_S && StringCharCodeAt.call(sel, 1) === CHAR_V && StringCharCodeAt.call(sel, 2) === CHAR_G) {
        addNS(vnode);
    }
    return vnode;
}
// [c]ustom element node
function c(sel, Ctor, data) {
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (hasOwnProperty.call(Ctor, '__circular__')) {
        Ctor = Ctor();
    }
    const { key, slotset, styleMap, style, on, className, classMap, props } = data;
    let { attrs } = data;
    // hack to allow component authors to force the usage of the "is" attribute in their components
    const { forceTagName } = Ctor;
    let tag = sel, text, elm; // tslint:disable-line
    if (!isUndefined(attrs) && !isUndefined(attrs.is)) {
        tag = sel;
        sel = attrs.is;
    }
    else if (!isUndefined(forceTagName)) {
        tag = forceTagName;
        attrs = assign({}, attrs);
        attrs.is = sel;
    }
    registerComponent(sel, Ctor);
    data = { hook, key, slotset, attrs, on, props };
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentTplToken();
    data.uid = getCurrentOwnerId();
    const vnode = {
        nt: ELEMENT_NODE,
        tag,
        sel,
        data,
        children: EmptyArray,
        text,
        elm,
        key,
    };
    return vnode;
}
// [i]terable node
function i(iterable, factory) {
    const list = [];
    if (isUndefined(iterable) || iterable === null) {
        return list;
    }
    const iterator = iterable[SymbolIterator]();
    let next = iterator.next();
    let j = 0;
    let { value, done: last } = next;
    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;
        // template factory logic based on the previous collected value
        const vnode = factory(value, j, j === 0, last);
        if (isArray$1(vnode)) {
            ArrayPush.apply(list, vnode);
        }
        else {
            ArrayPush.call(list, vnode);
        }
        // preparing next value
        j += 1;
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
    for (let j = 0; j < len; j += 1) {
        const item = items[j];
        if (isArray$1(item)) {
            ArrayPush.apply(flattened, item);
        }
        else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}
// [t]ext node
function t(text) {
    let sel, data = {}, children, key, elm; // tslint:disable-line
    return {
        nt: TEXT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
}
function p(text) {
    let sel = '!', data = {}, children, key, elm; // tslint:disable-line
    return {
        nt: COMMENT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
}
// [d]ynamic value to produce a text vnode
function d(value) {
    if (value === undefined || value === null) {
        return null;
    }
    return t(value);
}
// [b]ind function
function b(fn) {
    if (isNull(vmBeingRendered)) {
        throw new Error();
    }
    const vm = vmBeingRendered;
    return function handler(event) {
        if (!isValidEvent(event)) {
            return;
        }
        const e = pierce(event);
        invokeComponentCallback(vm, fn, [e]);
    };
}
// [k]ey function
function k(compilerKey, obj) {
    switch (typeof obj) {
        case 'number':
        // TODO: when obj is a numeric key, we might be able to use some
        // other strategy to combine two numbers into a new unique number
        case 'string':
            return compilerKey + ':' + obj;
        case 'object':

    }
}


var api = Object.freeze({
	h: h,
	c: c,
	i: i,
	f: f,
	t: t,
	p: p,
	d: d,
	b: b,
	k: k
});

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
};
{
    assign(slotsetProxyHandler, {
        apply(target, thisArg, argArray) {
            throw new Error(`invalid call invocation from slotset`);
        },
        construct(target, argArray, newTarget) {
            throw new Error(`invalid construction invocation from slotset`);
        },
    });
}
function applyTokenToHost(vm, html) {
    const { context } = vm;
    const oldToken = context.tplToken;
    const newToken = html.token;
    if (oldToken !== newToken) {
        const host = vm.elm;
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
    const { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache memoizer for template when needed
    if (html !== cmpTemplate) {
        if (!isUndefined(cmpTemplate)) {
            resetShadowRoot(vm);
        }
        applyTokenToHost(vm, html);
        vm.cmpTemplate = html;
        context.tplCache = create(null);
        context.tplToken = html.token;
    }
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    const vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    slotsetRevoke();
    return vnodes;
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs
const isUserTimingSupported = typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

let vmBeingRendered = null;
let vmBeingConstructed = null;
function isBeingConstructed(vm) {
    return vmBeingConstructed === vm;
}
function invokeComponentCallback(vm, fn, args) {
    const { context, component, callHook } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result;
    let error;
    try {
        result = callHook(component, fn, args);
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result;
}
function invokeComponentConstructor(vm, Ctor) {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    let error;
    try {
        new Ctor(); // tslint:disable-line
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        establishContext(ctx);
        vmBeingConstructed = vmBeingConstructedInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
}
function invokeComponentRenderMethod(vm) {
    const { def: { render }, callHook } = vm;
    if (isUndefined(render)) {
        return [];
    }
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const vmBeingRenderedInception = vmBeingRendered;
    vmBeingRendered = vm;
    let result;
    let error;
    try {
        const html = callHook(component, render);
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        }
        else if (!isUndefined(html)) {
        }
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        establishContext(ctx);
        vmBeingRendered = vmBeingRenderedInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result || [];
}
var EventListenerContext;
(function (EventListenerContext) {
    EventListenerContext[EventListenerContext["COMPONENT_LISTENER"] = 1] = "COMPONENT_LISTENER";
    EventListenerContext[EventListenerContext["ROOT_LISTENER"] = 2] = "ROOT_LISTENER";
})(EventListenerContext || (EventListenerContext = {}));
let componentEventListenerType = null;
function invokeEventListener(vm, listenerContext, fn, event) {
    const { context, callHook } = vm;
    const ctx = currentContext;
    establishContext(context);
    let error;
    const componentEventListenerTypeInception = componentEventListenerType;
    componentEventListenerType = listenerContext;
    try {
        callHook(undefined, fn, [event]);
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        establishContext(ctx);
        componentEventListenerType = componentEventListenerTypeInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
}

function track(target, prop, descriptor) {
    if (arguments.length === 1) {
        return reactiveMembrane.getProxy(target);
    }
    return createTrackedPropertyDescriptor(target, prop, isUndefined(descriptor) ? true : descriptor.enumerable === true);
}
function createTrackedPropertyDescriptor(Ctor, key, enumerable) {
    return {
        get() {
            const vm = getCustomElementVM(this);
            observeMutation$1(this, key);
            return vm.cmpTrack[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            const reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);
            if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
                vm.cmpTrack[key] = reactiveOrAnyValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation$1(this, key);
                }
            }
        },
        enumerable,
        configurable: true,
    };
}

function wireDecorator(target, prop, descriptor) {
    // TODO: eventually this decorator should have its own logic
    return createTrackedPropertyDescriptor(target, prop, isObject$1(descriptor) ? descriptor.enumerable === true : true);
}
// @wire is a factory that when invoked, returns the wire decorator
function wire(adapter, config) {
    const len = arguments.length;
    if (len > 0 && len < 3) {
        return wireDecorator;
    }
    else {
        throw new TypeError();
    }
}

const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;
function api$1(target, propName, descriptor) {
    const meta = target.publicProps;
    // publicProps must be an own property, otherwise the meta is inherited.
    const config = (!isUndefined(meta) && hasOwnProperty.call(target, 'publicProps') && hasOwnProperty.call(meta, propName)) ? meta[propName].config : 0;
    // initializing getters and setters for each public prop on the target prototype
    if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
        // if it is configured as an accessor it must have a descriptor
        return createPublicAccessorDescriptor(target, propName, descriptor);
    }
    else {
        return createPublicPropertyDescriptor(target, propName, descriptor);
    }
}
let vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    vmBeingUpdated = vm;
}
function createPublicPropertyDescriptor(proto, key, descriptor) {
    return {
        get() {
            const vm = getCustomElementVM(this);
            if (isBeingConstructed(vm)) {
                return;
            }
            observeMutation$1(this, key);
            return vm.cmpProps[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = reactiveMembrane.getReadOnlyProxy(newValue);
                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation$1(this, key);
                }
            }
            else {}
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    };
}
function createPublicAccessorDescriptor(Ctor, key, descriptor) {
    const { get, set, enumerable } = descriptor;
    if (!isFunction(get)) {
        throw new TypeError();
    }
    return {
        get() {
            return get.call(this);
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
                }
                else {}
            }
            else {}
        },
        enumerable,
    };
}

/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */
const CtorToDefMap = new WeakMap();
function propertiesReducer(seed, propName) {
    seed[propName] = {
        config: 3,
        type: 'any',
        attr: getAttrNameFromPropName(propName),
    };
    return seed;
}
const reducedDefaultHTMLPropertyNames = ArrayReduce.call(defaultDefHTMLPropertyNames, propertiesReducer, create(null));
const HTML_PROPS = ArrayReduce.call(getOwnPropertyNames(GlobalAOMProperties), propertiesReducer, reducedDefaultHTMLPropertyNames);
function getCtorProto(Ctor) {
    let proto = getPrototypeOf(Ctor);
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (hasOwnProperty.call(proto, '__circular__')) {
        proto = proto();
    }
    return proto;
}
function createComponentDef(Ctor) {
    const name = Ctor.name;
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    let wire$$1 = getWireHash(Ctor);
    const track$$1 = getTrackHash(Ctor);
    const proto = Ctor.prototype;
    const decoratorMap = create(null);
    // TODO: eventually, the compiler should do this work
    {
        for (const propName in props) {
            decoratorMap[propName] = api$1;
        }
        if (wire$$1) {
            for (const propName in wire$$1) {
                const wireDef = wire$$1[propName];
                if (wireDef.method) {
                    // for decorated methods we need to do nothing
                    continue;
                }
                decoratorMap[propName] = wire(wireDef.adapter, wireDef.params);
            }
        }
        if (track$$1) {
            for (const propName in track$$1) {
                decoratorMap[propName] = track;
            }
        }
        decorate(Ctor, decoratorMap);
    }
    let { connectedCallback, disconnectedCallback, renderedCallback, errorCallback, render, } = proto;
    const superProto = getCtorProto(Ctor);
    const superDef = superProto !== LWCElement ? getComponentDef(superProto) : null;
    if (!isNull(superDef)) {
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire$$1 = (superDef.wire || wire$$1) ? assign(create(null), superDef.wire, wire$$1) : undefined;
        connectedCallback = connectedCallback || superDef.connectedCallback;
        disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
        renderedCallback = renderedCallback || superDef.renderedCallback;
        errorCallback = errorCallback || superDef.errorCallback;
        render = render || superDef.render;
    }
    props = assign(create(null), HTML_PROPS, props);
    const descriptors = createCustomElementDescriptorMap(props, methods);
    const def = {
        name,
        wire: wire$$1,
        track: track$$1,
        props,
        methods,
        descriptors,
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render,
    };
    return def;
}
function createGetter(key) {
    return function () {
        const vm = getCustomElementVM(this);
        const { getHook } = vm;
        return getHook(vm.component, key);
    };
}
function createSetter(key) {
    return function (newValue) {
        const vm = getCustomElementVM(this);
        const { setHook } = vm;
        setHook(vm.component, key, newValue);
    };
}
function createMethodCaller(method) {
    return function () {
        const vm = getCustomElementVM(this);
        const { callHook } = vm;
        return callHook(vm.component, method, ArraySlice$1.call(arguments));
    };
}
function getAttributePatched(attrName) {
    return getAttribute.apply(this, ArraySlice$1.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    const vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    vm.hostAttrs[attrName] = 1; // marking the set is needed for the AOM polyfill
    setAttribute.apply(this, ArraySlice$1.call(arguments));
}
function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
    const vm = getCustomElementVM(this);
    setAttributeNS.apply(this, ArraySlice$1.call(arguments));
}
function removeAttributePatched(attrName) {
    const vm = getCustomElementVM(this);
    removeAttribute.apply(this, ArraySlice$1.call(arguments));
    attemptAriaAttributeFallback(vm, attrName);
}
function removeAttributeNSPatched(attrNameSpace, attrName) {
    const vm = getCustomElementVM(this);
    removeAttributeNS.apply(this, ArraySlice$1.call(arguments));
}
function createCustomElementDescriptorMap(publicProps, publicMethodsConfig) {
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
        setAttributeNS: {
            value: setAttributeNSPatched,
            configurable: true,
        },
        removeAttribute: {
            value: removeAttributePatched,
            configurable: true,
        },
        removeAttributeNS: {
            value: removeAttributeNSPatched,
            configurable: true,
        },
    };
    // expose getters and setters for each public props on the Element
    for (const key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
        };
    }
    // expose public methods as props on the Element
    for (const key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(publicMethodsConfig[key]),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    const track$$1 = target.track;
    if (!getOwnPropertyDescriptor(target, 'track') || !track$$1 || !getOwnPropertyNames(track$$1).length) {
        return EmptyObject;
    }
    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track$$1);
}
function getWireHash(target) {
    const wire$$1 = target.wire;
    if (!getOwnPropertyDescriptor(target, 'wire') || !wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
    }
    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire$$1);
}
function getPublicPropertiesHash(target) {
    const props = target.publicProps;
    if (!getOwnPropertyDescriptor(target, 'publicProps') || !props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash, propName) => {
        const attrName = getAttrNameFromPropName(propName);
        propsHash[propName] = assign({
            config: 0,
            type: 'any',
            attr: attrName,
        }, props[propName]);
        return propsHash;
    }, create(null));
}
function getPublicMethodsHash(target) {
    const publicMethods = target.publicMethods;
    if (!getOwnPropertyDescriptor(target, 'publicMethods') || !publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash, methodName) => {
        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
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
const TagNameToCtor = create(null);
function getCtorByTagName(tagName) {
    return TagNameToCtor[tagName];
    /////// TODO: what is this?
}
function registerComponent(tagName, Ctor) {
    if (!isUndefined(TagNameToCtor[tagName])) {
        if (TagNameToCtor[tagName] === Ctor) {
            return;
        }
        else {}
    }
    TagNameToCtor[tagName] = Ctor;
}

/* tslint:disable:one-variable-per-declaration no-shadowed-variable */
const { isArray: isArray$3 } = Array;
const ELEMENT_NODE$1 = 1, TEXT_NODE$1 = 3, COMMENT_NODE$1 = 8, DOCUMENT_FRAGMENT_NODE = 11;
function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
const emptyNode = {
    nt: 0,
    sel: '',
    data: {},
    children: undefined,
    text: undefined,
    elm: undefined,
    key: undefined,
};
function defaultCompareFn(vnode1, vnode2) {
    return (vnode1.nt === vnode2.nt &&
        vnode1.key === vnode2.key &&
        vnode1.sel === vnode2.sel);
}
function isVNode(vnode) {
    return vnode != null;
}
function isElementVNode(vnode) {
    return vnode.nt === ELEMENT_NODE$1;
}
function isFragmentVNode(vnode) {
    return vnode.nt === DOCUMENT_FRAGMENT_NODE;
}
function isTextVNode(vnode) {
    return vnode.nt === TEXT_NODE$1;
}
function isCommentVNode(vnode) {
    return vnode.nt === COMMENT_NODE$1;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    const map = {};
    let i, key, ch;
    for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (isVNode(ch)) {
            key = ch.key;
            if (key !== undefined) {
                map[key] = i;
            }
        }
    }
    return map;
}
const hooks$1 = [
    'create',
    'update',
    'remove',
    'destroy',
    'pre',
    'post',
];
function init$1(modules, api, compareFn) {
    const cbs = {};
    let i, j;
    const sameVnode = isUndef(compareFn) ? defaultCompareFn : compareFn;
    for (i = 0; i < hooks$1.length; ++i) {
        cbs[hooks$1[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            const hook = modules[j][hooks$1[i]];
            if (hook !== undefined) {
                cbs[hooks$1[i]].push(hook);
            }
        }
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                const parent = api.parentNode(childElm);
                api.removeChild(parent, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        let i;
        const { data } = vnode;
        if (!isUndef(data)) {
            if (isDef((i = data.hook)) && isDef((i = i.init))) {
                i(vnode);
            }
        }
        if (isElementVNode(vnode)) {
            const { data, tag } = vnode;
            const elm = (vnode.elm = isDef((i = data.ns))
                ? api.createElementNS(i, tag)
                : api.createElement(tag));
            if (isDef((i = data.hook)) && isDef(i.create)) {
                i.create(emptyNode, vnode);
            }
            for (i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, vnode);
            }
            const { children } = vnode;
            if (isArray$3(children)) {
                for (i = 0; i < children.length; ++i) {
                    const ch = children[i];
                    if (isVNode(ch)) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (!isUndef(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            if (isDef((i = data.hook)) && isDef(i.insert)) {
                insertedVnodeQueue.push(vnode);
            }
        }
        else if (isTextVNode(vnode)) {
            vnode.elm = api.createTextNode(vnode.text);
        }
        else if (isCommentVNode(vnode)) {
            vnode.elm = api.createComment(vnode.text);
        }
        else if (isFragmentVNode(vnode)) {
            vnode.elm = api.createFragment();
        }
        else {
            throw new TypeError();
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (isVNode(ch)) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        const { data } = vnode;
        let i, j;
        if (isDef((i = data.hook)) && isDef((i = i.destroy))) {
            i(vnode);
        }
        for (i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](vnode);
        }
        const { children } = vnode;
        if (isUndef(children)) {
            return;
        }
        for (j = 0; j < children.length; ++j) {
            const n = children[j];
            if (isVNode(n) && !isTextVNode(n)) {
                invokeDestroyHook(n);
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            let i, listeners, rm;
            // text nodes do not have logic associated to them
            if (isVNode(ch)) {
                if (!isTextVNode(ch)) {
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i = 0; i < cbs.remove.length; ++i) {
                        cbs.remove[i](ch, rm);
                    }
                    if (isDef((i = ch.data.hook)) && isDef((i = i.remove))) {
                        i(ch, rm);
                    }
                    else {
                        rm();
                    }
                    invokeDestroyHook(ch);
                }
                else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        let oldStartIdx = 0, newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (!isVNode(oldStartVnode)) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (!isVNode(oldEndVnode)) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (!isVNode(newStartVnode)) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (!isVNode(newEndVnode)) {
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
                // Vnode moved right
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
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
                    // New element
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (isVNode(elmToMove)) {
                        if (elmToMove.sel !== newStartVnode.sel) {
                            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                        }
                        else {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                        }
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                const n = newCh[newEndIdx + 1];
                before = isVNode(n) ? n.elm : null;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        let i, hook;
        if (isDef((i = vnode.data))) {
            hook = i.hook;
        }
        if (isDef(hook) && isDef((i = hook.prepatch))) {
            i(oldVnode, vnode);
        }
        const elm = (vnode.elm = oldVnode.elm);
        if (oldVnode === vnode) {
            return;
        }
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i) {
                cbs.update[i](oldVnode, vnode);
            }
            if (isDef(hook) && isDef((i = hook.update))) {
                i(oldVnode, vnode);
            }
        }
        const oldCh = oldVnode.children;
        const ch = vnode.children;
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) {
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
                }
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text)) {
                    api.setTextContent(elm, '');
                }
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
        if (isDef(hook) && isDef((i = hook.postpatch))) {
            i(oldVnode, vnode);
        }
    }
    const patch = function patch(oldVnode, vnode) {
        if (!isVNode(oldVnode) || !isVNode(vnode)) {
            throw new TypeError();
        }
        let i, n, elm, parent;
        const { pre, post } = cbs;
        const insertedVnodeQueue = [];
        for (i = 0, n = pre.length; i < n; ++i) {
            pre[i]();
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
        for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
            // if a vnode is in this queue, it must have the insert hook defined
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0, n = post.length; i < n; ++i) {
            post[i]();
        }
        return vnode;
    };
    patch.children = function children(parentElm, oldCh, newCh) {
        if (!isArray$3(oldCh) || !isArray$3(newCh)) {
            throw new TypeError();
        }
        let i, n;
        const { pre, post } = cbs;
        const insertedVnodeQueue = [];
        for (i = 0, n = pre.length; i < n; ++i) {
            pre[i]();
        }
        if (oldCh !== newCh) {
            updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue);
        }
        for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
            // if a vnode is in this queue, it must have the insert hook defined
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0, n = post.length; i < n; ++i) {
            post[i]();
        }
        return newCh;
    };
    return patch;
}

function update(oldVnode, vnode) {
    const props = vnode.data.props;
    if (isUndefined(props)) {
        return;
    }
    let oldProps = oldVnode.data.props;
    if (oldProps === props) {
        return;
    }
    let key;
    let cur;
    let old;
    const elm = vnode.elm;
    const vm = elm[ViewModelReflection];
    oldProps = isUndefined(oldProps) ? EmptyObject : oldProps;
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        if (old !== cur && (key in elm) && (key !== 'value' || elm[key] !== cur)) {
            if (!isUndefined(vm)) {
                prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
            }
            // touching the dom if the prop really changes.
            elm[key] = cur;
        }
    }
}
const propsModule = {
    create: update,
    update,
};

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;
function updateAttrs(oldVnode, vnode) {
    const { data: { attrs } } = vnode;
    if (isUndefined(attrs)) {
        return;
    }
    let { data: { attrs: oldAttrs } } = oldVnode;
    if (oldAttrs === attrs) {
        return;
    }
    const elm = vnode.elm;
    let key;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;
    // update modified attributes, add new attributes
    // this routine is only useful for data-* attributes in all kind of elements
    // and aria-* in standard elements (custom elements will use props for these)
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
                // Assume xml namespace
                elm.setAttributeNS(xmlNS, key, cur);
            }
            else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
                // Assume xlink namespace
                elm.setAttributeNS(xlinkNS, key, cur);
            }
            else if (isNull(cur)) {
                elm.removeAttribute(key);
            }
            else {
                elm.setAttribute(key, cur);
            }
        }
    }
}
const attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

const DashCharCode = 45;
function updateStyle(oldVnode, vnode) {
    const { data: { style: newStyle } } = vnode;
    if (isUndefined(newStyle)) {
        return;
    }
    let { data: { style: oldStyle } } = oldVnode;
    if (oldStyle === newStyle) {
        return;
    }
    let name;
    const elm = vnode.elm;
    const { style } = elm;
    if (isUndefined(newStyle) || newStyle === '') {
        removeAttribute.call(elm, 'style');
    }
    else if (isString(newStyle)) {
        style.cssText = newStyle;
    }
    else {
        if (!isUndefined(oldStyle)) {
            for (name in oldStyle) {
                if (!(name in newStyle)) {
                    style.removeProperty(name);
                }
            }
        }
        else {
            oldStyle = EmptyObject;
        }
        for (name in newStyle) {
            const cur = newStyle[name];
            if (cur !== oldStyle[name]) {
                if (StringCharCodeAt.call(name, 0) === DashCharCode && StringCharCodeAt.call(name, 1) === DashCharCode) {
                    // if the name is prefixed with --, it will be considered a variable, and setProperty() is needed
                    style.setProperty(name, cur);
                }
                else {
                    // @ts-ignore
                    style[name] = cur;
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
    const { elm, data: { class: klass } } = vnode;
    if (isUndefined(klass)) {
        return;
    }
    let { data: { class: oldClass } } = oldVnode;
    if (oldClass === klass) {
        return;
    }
    const { classList } = elm;
    let name;
    oldClass = isUndefined(oldClass) ? EmptyObject : oldClass;
    for (name in oldClass) {
        // remove only if it is not in the new class collection and it is not set from within the instance
        if (isUndefined(klass[name])) {
            classList.remove(name);
        }
    }
    for (name in klass) {
        if (isUndefined(oldClass[name])) {
            classList.add(name);
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
    const handler = on && on[type];
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
        const elm = vnode.elm;
        let name;
        for (name in on) {
            removeEventListener.call(elm, name, listener, false);
        }
        vnode.listener = undefined;
    }
}
function updateAllEventListeners(oldVnode, vnode) {
    if (isUndefined(oldVnode.listener)) {
        createAllEventListeners(oldVnode, vnode);
    }
    else {
        vnode.listener = oldVnode.listener;
        vnode.listener.vnode = vnode;
    }
}
function createAllEventListeners(oldVnode, vnode) {
    const { data: { on } } = vnode;
    if (isUndefined(on)) {
        return;
    }
    const elm = vnode.elm;
    const listener = vnode.listener = createListener();
    listener.vnode = vnode;
    let name;
    for (name in on) {
        addEventListener.call(elm, name, listener, false);
    }
}
// @ts-ignore
const eventListenersModule = {
    update: updateAllEventListeners,
    create: createAllEventListeners,
    destroy: removeAllEventListeners
};

function updateToken(oldVnode, vnode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken } } = vnode;
    if (oldToken === newToken) {
        return;
    }
    const elm = vnode.elm;
    if (!isUndefined(oldToken)) {
        removeAttribute.call(elm, oldToken);
    }
    if (!isUndefined(newToken)) {
        setAttribute.call(elm, newToken, '');
    }
}
const tokenModule = {
    create: updateToken,
    update: updateToken,
};

function updateUID(oldVnode, vnode) {
    const { data: { uid: oldUid } } = oldVnode;
    const { data: { uid } } = vnode;
    if (uid === oldUid) {
        return;
    }
    vnode.elm[OwnerKey] = uid;
}
// TODO: we might not need to do this in update, only in create!
const uidModule = {
    create: updateUID,
    update: updateUID,
};

const { createElement, createElementNS, createTextNode, createComment, createDocumentFragment, } = document;
const { insertBefore, removeChild, appendChild, } = Node.prototype;
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function setTextContent(node, text) {
    node.nodeValue = text;
}
const htmlDomApi = {
    createFragment() {
        return createDocumentFragment.call(document);
    },
    createElement(tagName) {
        return createElement.call(document, tagName);
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
    insertBefore(parent, newNode, referenceNode) {
        insertBefore.call(parent, newNode, referenceNode);
    },
    removeChild(node, child) {
        if (!isNull(node)) {
            removeChild.call(node, child);
        }
    },
    appendChild(node, child) {
        appendChild.call(node, child);
    },
    parentNode,
    nextSibling,
    setTextContent,
};
const patchVNode = init$1([
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    attributesModule,
    propsModule,
    classes,
    styleModule,
    eventListenersModule,
    tokenModule,
    uidModule,
], htmlDomApi);
const patchChildren = patchVNode.children;

let idx = 0;
let uid$1 = 0;
function callHook(cmp, fn, args) {
    return fn.apply(cmp, args);
}
function setHook(cmp, prop, newValue) {
    cmp[prop] = newValue;
}
function getHook(cmp, prop) {
    return cmp[prop];
}
const OwnerKey = usesNativeSymbols ? Symbol('key') : '$$OwnerKey$$';
function addInsertionIndex(vm) {
    vm.idx = ++idx;
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    const { connectedCallback } = vm.def;
    if (!isUndefined(connectedCallback)) {
        invokeComponentCallback(vm, connectedCallback);
    }
}
function removeInsertionIndex(vm) {
    vm.idx = 0;
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
    const { disconnectedCallback } = vm.def;
    if (!isUndefined(disconnectedCallback)) {
        invokeComponentCallback(vm, disconnectedCallback);
    }
}
function renderVM(vm) {
    if (vm.isDirty) {
        rehydrate(vm);
    }
}
function appendVM(vm) {
    if (vm.idx !== 0) {
        return; // already appended
    }
    addInsertionIndex(vm);
}
function removeVM(vm) {
    if (vm.idx === 0) {
        return; // already removed
    }
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    clearReactiveListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use Custom Element APIs, we can remove this
    // because the disconnectedCallback will be triggered automatically when
    // removed from the DOM.
    patchShadowRoot(vm, []);
}
function createVM(tagName, elm, cmpSlots) {
    if (hasOwnProperty.call(elm, ViewModelReflection)) {
        return; // already created
    }
    const Ctor = getCtorByTagName(tagName);
    const def = getComponentDef(Ctor);
    const isRoot = arguments.length === 2; // root elements can't provide slotset
    uid$1 += 1;
    const vm = {
        uid: uid$1,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot,
        def,
        elm: elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        rootProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        callHook,
        setHook,
        getHook,
        component: undefined,
        children: EmptyArray,
        hostAttrs: create(null),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    createComponent(vm, Ctor);
    linkComponent(vm);
}
function rehydrate(vm) {
    if (vm.idx > 0 && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}
function patchErrorBoundaryVm(errorBoundaryVm) {
    const children = renderComponent(errorBoundaryVm);
    const { elm, children: oldCh } = errorBoundaryVm;
    errorBoundaryVm.isScheduled = false;
    errorBoundaryVm.children = children; // caching the new children collection
    // patch function mutates vnodes by adding the element reference,
    // however, if patching fails it contains partial changes.
    // patch failures are caught in flushRehydrationQueue
    patchChildren(elm, oldCh, children);
    processPostPatchCallbacks(errorBoundaryVm);
}
function patchShadowRoot(vm, children) {
    const { children: oldCh } = vm;
    vm.children = children; // caching the new children collection
    if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
    }
    let error;
    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(vm.elm, oldCh, children);
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        if (!isUndefined(error)) {
            const errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);
            if (isUndefined(errorBoundaryVm)) {
                throw error; // tslint:disable-line
            }
            recoverFromLifeCycleError(vm, errorBoundaryVm, error);
            // synchronously render error boundary's alternative view
            // to recover in the same tick
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }
}
function processPostPatchCallbacks(vm) {
    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    const { renderedCallback } = vm.def;
    if (!isUndefined(renderedCallback)) {
        invokeComponentCallback(vm, renderedCallback);
    }
}
let rehydrateQueue = [];
function flushRehydrationQueue() {
    const vms = rehydrateQueue.sort((a, b) => a.idx - b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        const vm = vms[i];
        try {
            rehydrate(vm);
        }
        catch (error) {
            const errorBoundaryVm = getErrorBoundaryVMFromParentElement(vm);
            if (isUndefined(errorBoundaryVm)) {
                if (i + 1 < len) {
                    // pieces of the queue are still pending to be rehydrated, those should have priority
                    if (rehydrateQueue.length === 0) {
                        addCallbackToNextTick(flushRehydrationQueue);
                    }
                    ArrayUnshift$1.apply(rehydrateQueue, ArraySlice$1.call(vms, i + 1));
                }
                // rethrowing the original error will break the current tick, but since the next tick is
                // already scheduled, it should continue patching the rest.
                throw error; // tslint:disable-line
            }
            // we only recover if error boundary is present in the hierarchy
            recoverFromLifeCycleError(vm, errorBoundaryVm, error);
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }
}
function recoverFromLifeCycleError(failedVm, errorBoundaryVm, error) {
    if (isUndefined(error.wcStack)) {
        error.wcStack = getComponentStack(failedVm);
    }
    resetShadowRoot(failedVm); // remove offenders
    const { errorCallback } = errorBoundaryVm.def;
    // error boundaries must have an ErrorCallback
    invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);
}
function resetShadowRoot(vm) {
    const { elm, children: oldCh } = vm;
    vm.children = EmptyArray;
    if (oldCh.length === 0) {
        return; // optimization for the common case
    }
    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(elm, oldCh, EmptyArray);
    }
    catch (e) {
        // in the event of patch failure force offender removal
        vm.elm.innerHTML = "";
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
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    const { elm } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    return node[OwnerKey] === elm[OwnerKey];
}
function getErrorBoundaryVMFromParentElement(vm) {
    const { elm } = vm;
    const parentElm = elm && elm.parentElement;
    return getErrorBoundaryVM(parentElm);
}
function getErrorBoundaryVMFromOwnElement(vm) {
    const { elm } = vm;
    return getErrorBoundaryVM(elm);
}
function getErrorBoundaryVM(startingElement) {
    let elm = startingElement;
    let vm;
    while (!isNull(elm)) {
        vm = elm[ViewModelReflection];
        if (!isUndefined(vm) && !isUndefined(vm.def.errorCallback)) {
            return vm;
        }
        // TODO: if shadowDOM start preventing this walking process, we will
        // need to find a different way to find the right boundary
        elm = elm.parentElement;
    }
}
function getComponentStack(vm) {
    const wcStack = [];
    let elm = vm.elm;
    do {
        const currentVm = elm[ViewModelReflection];
        if (!isUndefined(currentVm)) {
            ArrayPush.call(wcStack, currentVm.component.toString());
        }
        elm = elm.parentElement;
    } while (!isNull(elm));
    return wcStack.reverse().join('\n\t');
}

const { removeChild: removeChild$1, appendChild: appendChild$1, insertBefore: insertBefore$1, replaceChild } = Node.prototype;
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
        const appendedNode = appendChild$1.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild, referenceNode) {
        const insertedNode = insertBefore$1.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild) {
        const removedNode = removeChild$1.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild, oldChild) {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    }
});
/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then it throws a TypeError.
 */
function createElement$1(sel, options = {}) {
    if (isUndefined(options) || !isFunction(options.is)) {
        throw new TypeError();
    }
    registerComponent(sel, options.is);
    // extracting the registered constructor just in case we need to force the tagName
    const Ctor = getCtorByTagName(sel);
    const { forceTagName } = Ctor;
    const tagName = isUndefined(forceTagName) ? sel : forceTagName;
    // Create element with correct tagName
    const element = document.createElement(tagName);
    if (hasOwnProperty.call(element, ViewModelReflection)) {
        return element;
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element);
    // Handle insertion and removal from the DOM manually
    element[ConnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm); // moving the element from one place to another is observable via life-cycle hooks
        appendVM(vm);
        // TODO: this is the kind of awkwardness introduced by "is" attribute
        // We don't want to do this during construction because it breaks another
        // WC invariant.
        if (!isUndefined(forceTagName)) {
            element.setAttribute('is', sel);
        }
        renderVM(vm);
    };
    element[DisconnectingSlot] = () => {
        const vm = getCustomElementVM(element);
        removeVM(vm);
    };
    return element;
}

// when used with exactly one argument, we assume it is a function invocation.
function readonly(obj) {
    return reactiveMembrane.getReadOnlyProxy(obj);
}

exports.createElement = createElement$1;
exports.getComponentDef = getComponentDef;
exports.Element = LWCElement;
exports.register = register;
exports.unwrap = unwrap$1;
exports.dangerousObjectMutation = dangerousObjectMutation;
exports.api = api$1;
exports.track = track;
exports.readonly = readonly;
exports.wire = wire;
exports.decorate = decorate;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/** version: 0.20.4 */
