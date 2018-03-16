/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

const { freeze, seal, keys, create, assign, defineProperty, getPrototypeOf, setPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyNames, defineProperties, getOwnPropertySymbols, hasOwnProperty, preventExtensions, isExtensible, } = Object;
const { isArray } = Array;
const { concat: ArrayConcat, filter: ArrayFilter, slice: ArraySlice, splice: ArraySplice, unshift: ArrayUnshift, indexOf: ArrayIndexOf, push: ArrayPush, map: ArrayMap, forEach, } = Array.prototype;
function isUndefined(obj) {
    return obj === undefined;
}
function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isFalse(obj) {
    return obj === false;
}
function isFunction(obj) {
    return typeof obj === 'function';
}

function isString(obj) {
    return typeof obj === 'string';
}

// Few more execptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element
// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

const TopLevelContextSymbol = Symbol();
let currentContext = {};
currentContext[TopLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

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
 * This method maps between property names
 * and the corresponding attribute name.
 */

const usesNativeSymbols = typeof Symbol() === 'symbol';

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
    const { cells } = membrane;
    const r = cells.get(value);
    if (r) {
        return r;
    }
    const replica = new Proxy(value, membrane);
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
// @ts-ignore
const { getKey } = Proxy;
const unwrap = getKey ?
    (replicaOrAny) => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny) => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;

function piercingHook(membrane, target, key, value) {
    const { vm } = membrane.handler;
    const { piercing } = Services;
    if (piercing) {
        const { component, data, def, context } = vm;
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
        const value = target[key];
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
function getLinkedElement$1(root) {
    return getCustomElementVM(root).elm;
}
function shadowRootQuerySelector(shadowRoot, selector) {
    const vm = getCustomElementVM(shadowRoot);
    const elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    const piercedQuerySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return piercedQuerySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    const vm = getCustomElementVM(shadowRoot);
    const elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    const piercedQuerySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return piercedQuerySelectorAll.call(elm, selector);
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
    toString() {
        const component = getCustomElementComponent(this);
        return `Current ShadowRoot for ${component}`;
    }
}
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
function isIframeContentWindow(key, value) {
    return (key === 'contentWindow') && value.window === value;
}
function wrapIframeWindow(win) {
    return {
        [TargetSlot]: win,
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
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(component, data, def, context, target, key, value, callback) {
        const vm = component[ViewModelReflection];
        const { elm } = vm;
        if (value) {
            if (isIframeContentWindow(key, value)) {
                callback(wrapIframeWindow(value));
            }
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

const { getAttribute: getAttribute$1, getAttributeNS: getAttributeNS$1, removeAttribute: removeAttribute$1, removeAttributeNS: removeAttributeNS$1, setAttribute: setAttribute$1, setAttributeNS: setAttributeNS$1, } = Element.prototype;
function getLinkedElement(cmp) {
    return cmp[ViewModelReflection].elm;
}
function querySelectorAllFromComponent(cmp, selectors) {
    const elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
class LWCElement {
    constructor() {
        if (isNull(vmBeingConstructed)) {
            throw new ReferenceError();
        }
        const vm = vmBeingConstructed;
        const { elm, def } = vm;
        const component = this;
        vm.component = component;
        // TODO: eventually the render method should be a static property on the ctor instead
        // catching render method to match other callbacks
        vm.render = component.render;
        // linking elm and its component with VM
        component[ViewModelReflection] = elm[ViewModelReflection] = vm;
        defineProperties(elm, def.descriptors);
    }
    // HTML Element - The Good Parts
    dispatchEvent(event) {
        const elm = getLinkedElement(this);
        const vm = getCustomElementVM(this);
        pierce(vm, elm);
        const dispatchEvent = piercingHook(vm.membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    }
    addEventListener(type, listener) {
        const vm = getCustomElementVM(this);
        addComponentEventListener(vm, type, listener);
    }
    removeEventListener(type, listener) {
        const vm = getCustomElementVM(this);
        removeComponentEventListener(vm, type, listener);
    }
    setAttributeNS(ns, attrName, value) {
        return setAttributeNS$1.call(getLinkedElement(this), ns, attrName, value);
    }
    removeAttributeNS(ns, attrName) {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS$1.call(getLinkedElement(this), ns, attrName);
    }
    removeAttribute(attrName) {
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        return removeAttribute$1.call(getLinkedElement(this), attrName);
    }
    setAttribute(attrName, value) {
        return setAttribute$1.call(getLinkedElement(this), attrName, value);
    }
    getAttributeNS(ns, attrName) {
        return getAttributeNS$1.call(getLinkedElement(this), ns, attrName);
    }
    getAttribute(attrName) {
        // logging errors for experimentals and special attributes
        return getAttribute$1.apply(getLinkedElement(this), ArraySlice.call(arguments));
    }
    getBoundingClientRect() {
        const elm = getLinkedElement(this);
        return elm.getBoundingClientRect();
    }
    querySelector(selectors) {
        const vm = getCustomElementVM(this);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        return null;
    }
    querySelectorAll(selectors) {
        const vm = getCustomElementVM(this);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node) => wasNodePassedIntoVM(vm, node));
        return pierce(vm, filteredNodes);
    }
    get tagName() {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    }
    get tabIndex() {
        const elm = getLinkedElement(this);
        return elm.tabIndex;
    }
    set tabIndex(value) {
        const vm = getCustomElementVM(this);
        if (isBeingConstructed(vm)) {
            return;
        }
        const elm = getLinkedElement(this);
        elm.tabIndex = value;
    }
    get classList() {
        return getLinkedElement(this).classList;
    }
    get root() {
        const vm = getCustomElementVM(this);
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    }
    toString() {
        const vm = getCustomElementVM(this);
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute$1.call(elm, 'is');
        return `<${tagName.toLowerCase()}${is ? ' is="${is}' : ''}>`;
    }
}
// Global HTML Attributes
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
    let i;
    const len = className.length;
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
    remove(vnode, removeCallback) {
        removeVM(getCustomElementVM(vnode.elm));
        removeCallback();
    }
};
function isVElement(vnode) {
    return vnode.nt === ELEMENT_NODE;
}
function addNS(vnode) {
    const { data, children, sel } = vnode;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray(children) && sel !== 'foreignObject') {
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
    if (sel.length === 3 && sel.charCodeAt(0) === CHAR_S && sel.charCodeAt(1) === CHAR_V && sel.charCodeAt(2) === CHAR_G) {
        addNS(vnode);
    }
    return vnode;
}
// [c]ustom element node
function c(sel, Ctor, data) {
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (Ctor.__circular__) {
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
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        }
        else {
            ArrayPush.call(list, vnode);
        }
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
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, fn, [event]);
    };
}
const objToKeyMap = new WeakMap();
let globalKey = 0;
// [k]ind function
function k(compilerKey, obj) {
    switch (typeof obj) {
        case 'number':
        // TODO: when obj is a numeric key, we might be able to use some
        // other strategy to combine two numbers into a new unique number
        case 'string':
            return compilerKey + ':' + obj;
        case 'object':
            if (isNull(obj)) {
                return;
            }
            // Slow path. We get here when element is inside iterator
            // but no key is specified.
            const unwrapped = unwrap(obj);
            let objKey = objToKeyMap.get(unwrapped);
            if (isUndefined(objKey)) {
                objKey = globalKey++;
                objToKeyMap.set(unwrapped, objKey);
            }
            return compilerKey + ':' + objKey;
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
    const { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
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

let isRendering = false;
let vmBeingRendered = null;
function invokeComponentCallback(vm, fn, args) {
    const { context, component } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result;
    let error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(component, args);
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
    let component;
    let error;
    try {
        component = new Ctor();
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
    return component;
}
function invokeComponentRenderMethod(vm) {
    const { render } = vm;
    if (isUndefined(render)) {
        return [];
    }
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result;
    let error;
    try {
        const html = render.call(component);
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
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result || [];
}
function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    const { attributeChangedCallback } = vm.def;
    if (isUndefined(attributeChangedCallback)) {
        return;
    }
    invokeComponentCallback(vm, attributeChangedCallback, [attrName, oldValue, newValue]);
}

let vmBeingConstructed = null;
function isBeingConstructed(vm) {
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;

}
function linkComponent(vm) {
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
function createComponentListener(vm) {
    return function handler(event) {
        handleComponentEvent(vm, event);
    };
}
function addComponentEventListener(vm, eventName, newHandler) {
    let { cmpEvents, cmpListener } = vm;
    if (isUndefined(cmpEvents)) {
        // this piece of code must be in sync with modules/component-events
        vm.cmpEvents = cmpEvents = create(null);
        vm.cmpListener = cmpListener = createComponentListener(vm);
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
        const { elm } = vm;
        elm.addEventListener(eventName, cmpListener, false);
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
function handleComponentEvent(vm, event) {
    const { cmpEvents = EmptyObject } = vm;
    const { type, stopImmediatePropagation } = event;
    const handlers = cmpEvents[type];
    if (isArray(handlers)) {
        let uninterrupted = true;
        event.stopImmediatePropagation = function () {
            uninterrupted = false;
            stopImmediatePropagation.call(event);
        };
        const e = pierce(vm, event);
        for (let i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
            invokeComponentCallback(vm, handlers[i], [e]);
        }
        // restoring original methods
        event.stopImmediatePropagation = stopImmediatePropagation;
    }
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

const TargetToReactiveRecordMap = new WeakMap();
function notifyMutation(target, key) {
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
function observeMutation(target, key) {
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
        observeMutation(originalTarget, key);
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
            notifyMutation(originalTarget, key);
        }
        else if (key === 'length' && isArray(originalTarget)) {
            // fix for issue #236: push will add the new index, and by the time length
            // is updated, the internal length is already equal to the new length value
            // therefore, the oldValue is equal to the value. This is the forking logic
            // to support this use case.
            notifyMutation(originalTarget, key);
        }
        return true;
    }
    deleteProperty(shadowTarget, key) {
        const { originalTarget } = this;
        delete originalTarget[key];
        notifyMutation(originalTarget, key);
        return true;
    }
    apply(target /*, thisArg: any, argArray?: any*/) {

    }
    construct(target, argArray, newTarget) {

    }
    has(shadowTarget, key) {
        const { originalTarget } = this;
        observeMutation(originalTarget, key);
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
        observeMutation(originalTarget, key);
        let desc = getOwnPropertyDescriptor(originalTarget, key);
        if (isUndefined(desc)) {
            return desc;
        }
        const shadowDescriptor = getOwnPropertyDescriptor(shadowTarget, key);
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
        notifyMutation(originalTarget, key);
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
            const vm = getCustomElementVM(this);
            observeMutation(this, key);
            return vm.cmpTrack[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            const observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;
            if (newValue !== vm.cmpTrack[key]) {
                vm.cmpTrack[key] = newValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, key);
                }
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
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
            const vm = getCustomElementVM(this);
            if (isBeingConstructed(vm)) {
                return;
            }
            observeMutation(this, key);
            return vm.cmpProps[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;

            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = newValue;
                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, key);
                }
            }
            else {}
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
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
            const vm = getCustomElementVM(this);
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;

            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, newValue);
                }
                else {}
            }
            else {}
        },
        enumerable,
    });
}

/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */
const ViewModelReflection = Symbol();
const CtorToDefMap = new WeakMap();
const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;
function createComponentDef(Ctor) {
    const name = Ctor.name;
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    const observedAttrs = getObservedAttributesHash(Ctor);
    let wire$$1 = getWireHash(Ctor);
    const track$$1 = getTrackHash(Ctor);
    const proto = Ctor.prototype;
    for (const propName in props) {
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
        for (const propName in wire$$1) {
            if (wire$$1[propName].method) {
                // for decorated methods we need to do nothing
                continue;
            }
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track$$1) {
        for (const propName in track$$1) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        }
    }
    let { connectedCallback, disconnectedCallback, renderedCallback, errorCallback, attributeChangedCallback, } = proto;
    const superProto = getPrototypeOf(Ctor);
    const superDef = superProto !== LWCElement ? getComponentDef(superProto) : null;
    if (!isNull(superDef)) {
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire$$1 = (superDef.wire || wire$$1) ? assign(create(null), superDef.wire, wire$$1) : undefined;
        connectedCallback = connectedCallback || superDef.connectedCallback;
        disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
        renderedCallback = renderedCallback || superDef.renderedCallback;
        errorCallback = errorCallback || superDef.errorCallback;
        attributeChangedCallback = attributeChangedCallback || superDef.attributeChangedCallback;
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
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        attributeChangedCallback,
    };
    return def;
}
function createGetter(key) {
    return function () {
        return getCustomElementComponent(this)[key];
    };
}
function createSetter(key) {
    return function (newValue) {
        getCustomElementComponent(this)[key] = newValue;
    };
}
function createMethodCaller(key) {
    return function () {
        const component = getCustomElementComponent(this);
        return component[key].apply(component, ArraySlice.call(arguments));
    };
}
const { getAttribute, getAttributeNS, setAttribute, setAttributeNS, removeAttribute, removeAttributeNS } = Element.prototype;
function getAttributePatched(attrName) {
    return getAttribute.apply(this, ArraySlice.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    const vm = getCustomElementVM(this);
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttribute.call(this, attrName) : null;
    setAttribute.apply(this, ArraySlice.call(arguments));
    if (isObserved) {
        newValue = getAttribute.call(this, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}
function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
    const vm = getCustomElementVM(this);
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;
    setAttributeNS.apply(this, ArraySlice.call(arguments));
    if (isObserved) {
        newValue = getAttributeNS.call(this, attrNameSpace, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}
function removeAttributePatched(attrName) {
    const vm = getCustomElementVM(this);
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttribute.call(this, attrName) : null;
    removeAttribute.apply(this, ArraySlice.call(arguments));
    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}
function removeAttributeNSPatched(attrNameSpace, attrName) {
    const vm = getCustomElementVM(this);
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;
    removeAttributeNS.apply(this, ArraySlice.call(arguments));
    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}
function isAttrObserved(vm, attrName) {
    return attrName in vm.def.observedAttrs;
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
            value: createMethodCaller(key),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    const track$$1 = target.track;
    if (!track$$1 || !getOwnPropertyNames(track$$1).length) {
        return EmptyObject;
    }
    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track$$1);
}
function getWireHash(target) {
    const wire$$1 = target.wire;
    if (!wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
    }
    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire$$1);
}
function getPublicPropertiesHash(target) {
    const props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash, propName) => {
        propsHash[propName] = assign({ config: 0, type: 'any' }, props[propName]);
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
    return observedAttributes.reduce((reducer, attrName) => {
        reducer[attrName] = 1;
        return reducer;
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

const { isArray: isArray$2 } = Array;
const ELEMENT_NODE$1 = 1;
const TEXT_NODE$1 = 3;
const COMMENT_NODE$1 = 8;
const DOCUMENT_FRAGMENT_NODE = 11;
function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
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
    return vnode1.nt === vnode2.nt && vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
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
    let i, map = {}, key, ch;
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
const hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
function init$1(modules, api, compareFn) {
    let i, j, cbs = {};
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
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
            }
        }
        if (isElementVNode(vnode)) {
            const { data, tag } = vnode;
            const elm = vnode.elm = isDef(i = data.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (isDef(i = data.hook) && isDef(i.create)) {
                i.create(emptyNode, vnode);
            }
            for (i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, vnode);
            }
            const { children } = vnode;
            if (isArray$2(children)) {
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
            if (isDef(i = data.hook) && isDef(i.insert)) {
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
        let i, j, data = vnode.data;
        if (isDef(i = data.hook) && isDef(i = i.destroy)) {
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
            let i, listeners, rm, ch = vnodes[startIdx];
            // text nodes do not have logic associated to them
            if (isVNode(ch)) {
                if (!isTextVNode(ch)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i = 0; i < cbs.remove.length; ++i) {
                        cbs.remove[i](ch, rm);
                    }
                    if (isDef(i = ch.data.hook) && isDef(i = i.remove)) {
                        i(ch, rm);
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
        if (isDef(i = vnode.data)) {
            hook = i.hook;
        }
        if (isDef(hook) && isDef(i = hook.prepatch)) {
            i(oldVnode, vnode);
        }
        const elm = vnode.elm = oldVnode.elm;
        if (oldVnode === vnode) {
            return;
        }
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i) {
                cbs.update[i](oldVnode, vnode);
            }
            if (isDef(hook) && isDef(i = hook.update)) {
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
        if (isDef(hook) && isDef(i = hook.postpatch)) {
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
        if (!isArray$2(oldCh) || !isArray$2(newCh)) {
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
    const { setAttribute, removeAttribute } = elm;
    let key;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;
    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (isTrue(cur)) {
                setAttribute.call(elm, key, "");
            }
            else if (isFalse(cur)) {
                removeAttribute.call(elm, key);
            }
            else {
                if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    elm.setAttributeNS.call(elm, xmlNS, key, cur);
                }
                else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    elm.setAttributeNS.call(elm, xlinkNS, key, cur);
                }
                else {
                    setAttribute.call(elm, key, cur);
                }
            }
        }
    }
}
const attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

const { removeAttribute: removeAttribute$2 } = Element.prototype;
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
        removeAttribute$2.call(elm, 'style');
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
                if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                    // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
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
            elm.removeEventListener(name, listener, false);
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
        elm.addEventListener(name, listener, false);
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

const { createElement: createElement$1, createElementNS, createTextNode, createComment, } = document;
const { insertBefore: insertBefore$1, removeChild: removeChild$1, appendChild: appendChild$1, } = Node.prototype;
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
        return document.createDocumentFragment();
    },
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
    insertBefore(parent, newNode, referenceNode) {
        insertBefore$1.call(parent, newNode, referenceNode);
    },
    removeChild(node, child) {
        removeChild$1.call(node, child);
    },
    appendChild(node, child) {
        appendChild$1.call(node, child);
    },
    parentNode,
    nextSibling,
    setTextContent,
};
function vnodeCompareFn(vnode1, vnode2) {
    return vnode1.nt === vnode2.nt && vnode1.key === vnode2.key;
}
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
], htmlDomApi, vnodeCompareFn);
const patchChildren = patchVNode.children;

let idx = 0;
let uid = 0;
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
    uid += 1;
    const vm = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot,
        def,
        elm: elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        component: undefined,
        children: EmptyArray,
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
            recoverFromLifecyleError(vm, errorBoundaryVm, error);
            // syncronously render error boundary's alternative view
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
                    ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, i + 1));
                }
                // rethrowing the original error will break the current tick, but since the next tick is
                // already scheduled, it should continue patching the rest.
                throw error; // tslint:disable-line
            }
            // we only recover if error boundary is present in the hierarchy
            recoverFromLifecyleError(vm, errorBoundaryVm, error);
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }
}
function recoverFromLifecyleError(failedVm, errorBoundaryVm, error) {
    if (isUndefined(error.wcStack)) {
        error.wcStack = getComponentStack(failedVm);
    }
    resetShadowRoot(failedVm); // remove offenders
    const { errorCallback } = errorBoundaryVm.def;
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
function createElement(sel, options = {}) {
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

exports.createElement = createElement;
exports.getComponentDef = getComponentDef;
exports.Element = LWCElement;
exports.register = register;
exports.unwrap = unwrap;
exports.api = api$1;
exports.track = track;
exports.wire = wire;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/** version: 0.17.17 */
