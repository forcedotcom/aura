/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

const compareDocumentPosition = Node.prototype.compareDocumentPosition;
const { DOCUMENT_POSITION_CONTAINS } = Node;
const assert = {
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
    vnode(vnode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode && "nt" in vnode, `${vnode} is not a vnode.`);
    },
    vm(vm) {
        assert.isTrue(vm && "component" in vm, `${vm} is not a vm.`);
    },
    fail(msg) {
        throw new Error(msg);
    },
    logError(msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            console.error(e); // tslint:disable-line
        }
    },
    logWarning(msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            const stackTraceLines = e.stack.split('\n');
            console.group(`Warning: ${msg}`); // tslint:disable-line
            stackTraceLines.filter((trace) => {
                // Chrome adds the error message as the first item in the stack trace
                // So we filter it out to prevent logging it twice.
                return trace.replace('Error: ', '') !== msg;
            })
                .forEach((trace) => {
                // We need to format this as a string,
                // because Safari will detect that the string
                // is a stack trace line item and will format it as so
                console.log('%s', trace.trim()); // tslint:disable-line
            });
            console.groupEnd(); // tslint:disable-line
        }
    },
    childNode(container, node, msg) {
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || `${node} must be a child node of ${container}`);
    }
};

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
function isObject(obj) {
    return typeof obj === 'object';
}
function isString(obj) {
    return typeof obj === 'string';
}

const OtS = {}.toString;
function toString(obj) {
    if (obj && obj.toString) {
        return obj.toString();
    }
    else if (typeof obj === 'object') {
        return OtS.call(obj);
    }
    else {
        return obj + '';
    }
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
const GlobalHTMLProperties = {
    id: {
        attribute: 'id',
    },
    accessKey: {
        attribute: 'accesskey',
    },
    accessKeyLabel: {
        readOnly: true,
    },
    className: {
        attribute: 'class',
        error: `Using property "className" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property "classList".`,
    },
    contentEditable: {
        attribute: 'contenteditable',
    },
    isContentEditable: {
        readOnly: true,
    },
    contextMenu: {
        attribute: 'contextmenu',
    },
    dataset: {
        readOnly: true,
        msg: 'Using property "dataset" is an anti-pattern. Instead declare `static observedAttributes = ["data-foo"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes.',
    },
    dir: {
        attribute: 'dir',
    },
    draggable: {
        attribute: 'draggable',
        experimental: true,
    },
    dropzone: {
        attribute: 'dropzone',
        readOnly: true,
        experimental: true,
    },
    hidden: {
        attribute: 'hidden',
    },
    itemScope: {
        attribute: 'itemscope',
        experimental: true,
    },
    itemType: {
        attribute: 'itemtype',
        readOnly: true,
        experimental: true,
    },
    itemId: {
        attribute: 'itemid',
        experimental: true,
    },
    itemRef: {
        attribute: 'itemref',
        readOnly: true,
        experimental: true,
    },
    itemProp: {
        attribute: 'itemprop',
        readOnly: true,
        experimental: true,
    },
    itemValue: {
        experimental: true,
    },
    lang: {
        attribute: 'lang',
    },
    offsetHeight: {
        readOnly: true,
        experimental: true,
    },
    offsetLeft: {
        readOnly: true,
        experimental: true,
    },
    offsetParent: {
        readOnly: true,
        experimental: true,
    },
    offsetTop: {
        readOnly: true,
        experimental: true,
    },
    offsetWidth: {
        readOnly: true,
        experimental: true,
    },
    properties: {
        readOnly: true,
        experimental: true,
    },
    spellcheck: {
        experimental: true,
    },
    style: {
        attribute: 'style',
        error: `Using property or attribute "style" is an anti-pattern. Instead use property "classList".`,
    },
    tabIndex: {
        attribute: 'tabindex',
    },
    title: {
        attribute: 'title',
    },
    translate: {
        experimental: true,
    },
    // additional global attributes that are not present in the link above.
    role: {
        attribute: 'role',
    },
    slot: {
        attribute: 'slot',
        experimental: true,
        error: `Using property or attribute "slot" is an anti-pattern.`
    }
};
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
    {
        assert.invariant(nextTickCallbackQueue.length, `If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of ${nextTickCallbackQueue}.`);
    }
    const callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}
function addCallbackToNextTick(callback) {
    {
        assert.isTrue(isFunction(callback), `addCallbackToNextTick() can only accept a function callback as first argument instead of ${callback}`);
    }
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    // TODO: eventually, we might want to have priority when inserting callbacks
    ArrayPush.call(nextTickCallbackQueue, callback);
}
const CAMEL_REGEX = /-([a-z])/g;
const attrNameToPropNameMap = create(null);
function getPropNameFromAttrName(attrName) {
    let propName = attrNameToPropNameMap[attrName];
    if (isUndefined(propName)) {
        propName = attrName.replace(CAMEL_REGEX, (g) => g[1].toUpperCase());
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}
const CAPS_REGEX = /[A-Z]/g;
/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
function getAttrNameFromPropName(propName) {
    switch (propName) {
        case 'className':
            return 'class';
        case 'htmlFor':
            return 'for';
        default:
            // Few more exceptions where the attribute name matches the property in lowercase.
            if (ArrayIndexOf.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, propName) >= 0) {
                propName.toLocaleLowerCase();
            }
    }
    // otherwise we do the regular canonical transformation.
    return propName.replace(CAPS_REGEX, (match) => '-' + match.toLowerCase());
}
const usesNativeSymbols = typeof Symbol() === 'symbol';

const Services = create(null);
const hooks = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
function register(service) {
    {
        assert.isTrue(isObject(service), `Invalid service declaration, ${service}: service must be an object`);
    }
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
    {
        assert.vm(vm);
        assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    }
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
    {
        assert.isTrue(membrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
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
    {
        assert.vm(vm);
    }
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
        {
            assert.vm(vm);
        }
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
        {
            assert.isTrue(newTarget, `construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.`);
        }
        return getReplica(membrane, new targetFn(...argumentsList));
    }
}
function pierce(vm, value) {
    {
        assert.vm(vm);
    }
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
    {
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    const elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    const piercedQuerySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return piercedQuerySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    const vm = getCustomElementVM(shadowRoot);
    {
        assert.isFalse(isBeingConstructed(vm), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    const elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    const piercedQuerySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return piercedQuerySelectorAll.call(elm, selector);
}
class Root {
    constructor(vm) {
        {
            assert.vm(vm);
        }
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
        {
            const component = getCustomElementComponent(this);
            if (isNull(node) && component.querySelector(selector)) {
                assert.logWarning(`this.root.querySelector() can only return elements from the template declaration of ${component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        }
        return node;
    }
    querySelectorAll(selector) {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        {
            const component = getCustomElementComponent(this);
            if (nodeList.length === 0 && component.querySelectorAll(selector).length) {
                assert.logWarning(`this.root.querySelectorAll() can only return elements from template declaration of ${component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        }
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
        {
            assert.vm(vmBeingConstructed);
            assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
            const { def: { observedAttrs, attributeChangedCallback } } = vmBeingConstructed;
            if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
                assert.logError(`${vmBeingConstructed} has static observedAttributes set to ["${keys(observedAttrs).join('", "')}"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.`);
            }
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
        {
            const { type: evtName, composed, bubbles } = event;
            assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);
            if (bubbles && ('composed' in event && !composed)) {
                assert.logWarning(`Invalid event "${evtName}" dispatched in element ${this}. Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.`);
            }
            if (vm.idx === 0) {
                assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
            }
            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        }
        // Pierce dispatchEvent so locker service has a chance to overwrite
        pierce(vm, elm);
        const dispatchEvent = piercingHook(vm.membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    }
    addEventListener(type, listener) {
        const vm = getCustomElementVM(this);
        {
            assert.vm(vm);
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.addEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        }
        addComponentEventListener(vm, type, listener);
    }
    removeEventListener(type, listener) {
        const vm = getCustomElementVM(this);
        {
            assert.vm(vm);
            if (arguments.length > 2) {
                assert.logWarning(`this.removeEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        }
        removeComponentEventListener(vm, type, listener);
    }
    setAttributeNS(ns, attrName, value) {
        {
            assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // use cached setAttributeNS, because elm.setAttribute throws
        // when not called in template
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
        {
            assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // use cached setAttribute, because elm.setAttribute throws
        // when not called in template
        return setAttribute$1.call(getLinkedElement(this), attrName, value);
    }
    getAttributeNS(ns, attrName) {
        return getAttributeNS$1.call(getLinkedElement(this), ns, attrName);
    }
    getAttribute(attrName) {
        // logging errors for experimentals and special attributes
        {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isString(attrName)) {
                const propName = getPropNameFromAttrName(attrName);
                const { def: { props: publicPropsConfig } } = vm;
                if (propName && publicPropsConfig[propName]) {
                    throw new ReferenceError(`Attribute "${attrName}" corresponds to public property ${propName} from ${vm}. Instead use \`this.${propName}\`. Only use \`getAttribute()\` to access global HTML attributes.`);
                }
                else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                    const { error, experimental } = GlobalHTMLProperties[propName];
                    if (error) {
                        assert.logError(error);
                    }
                    else if (experimental) {
                        assert.logError(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                    }
                }
            }
        }
        return getAttribute$1.apply(getLinkedElement(this), ArraySlice.call(arguments));
    }
    getBoundingClientRect() {
        const elm = getLinkedElement(this);
        {
            const vm = getCustomElementVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }
        return elm.getBoundingClientRect();
    }
    querySelector(selectors) {
        const vm = getCustomElementVM(this);
        {
            assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        {
            if (shadowRootQuerySelector(this.root, selectors)) {
                assert.logWarning(`this.querySelector() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.`);
            }
        }
        return null;
    }
    querySelectorAll(selectors) {
        const vm = getCustomElementVM(this);
        {
            assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node) => wasNodePassedIntoVM(vm, node));
        {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(this.root, selectors).length) {
                assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.`);
            }
        }
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
        {
            assert.isFalse(isRendering, `Setting property "tabIndex" of ${toString(value)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
            if (isBeingConstructed(vm)) {
                assert.fail(`Setting property "tabIndex" during the construction process of ${vm} is invalid.`);
            }
        }
        if (isBeingConstructed(vm)) {
            return;
        }
        const elm = getLinkedElement(this);
        elm.tabIndex = value;
    }
    get classList() {
        {
            const vm = getCustomElementVM(this);
            // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(isBeingConstructed(vm), `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`);
        }
        return getLinkedElement(this).classList;
    }
    get root() {
        const vm = getCustomElementVM(this);
        {
            assert.vm(vm);
        }
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
        {
            assert.vm(vm);
        }
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute$1.call(elm, 'is');
        return `<${tagName.toLowerCase()}${is ? ' is="${is}' : ''}>`;
    }
}
// Global HTML Attributes
{
    getOwnPropertyNames(GlobalHTMLProperties).forEach((propName) => {
        if (propName in LWCElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(LWCElement.prototype, propName, {
            get() {
                const vm = getCustomElementVM(this);
                const { error, attribute, readOnly, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                msg.push(`Accessing the global HTML property "${propName}" in ${vm} is disabled.`);
                if (error) {
                    msg.push(error);
                }
                else {
                    if (experimental) {
                        msg.push(`This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push(`Property is read-only.`);
                    }
                    if (attribute) {
                        msg.push(`"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                        msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                        msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                    }
                }
                console.log(msg.join('\n')); // tslint:disable-line
                return; // explicit undefined
            },
            enumerable: false,
        });
    });
}
freeze(LWCElement);
seal(LWCElement.prototype);
function getCustomElementVM(elmOrCmp) {
    {
        assert.vm(elmOrCmp[ViewModelReflection]);
    }
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
    {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    }
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
    {
        assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
        assert.isTrue(('key' in data) || !!data.key, ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`);
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling h().`);
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
        if (data.style && !isString(data.style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
        children.forEach((childVnode) => {
            if (childVnode != null) {
                assert.vnode(childVnode);
            }
        });
    }
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
    {
        assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
        assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
        assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
        assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
        if (data.style && !isString(data.style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
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
        {
            assert.logWarning(`Invalid template iteration for value "${iterable}" in ${vmBeingRendered}, it should be an Array or an iterable Object.`);
        }
        return list;
    }
    {
        assert.isFalse(isUndefined(iterable[SymbolIterator]), `Invalid template iteration for value \`${iterable}\` in ${vmBeingRendered}, it requires an array-like object, not \`null\` or \`undefined\`.`);
    }
    const iterator = iterable[SymbolIterator]();
    {
        assert.isTrue(iterator && isFunction(iterator.next), `Invalid iterator function for "${iterable}" in ${vmBeingRendered}.`);
    }
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
        {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach((childVnode) => {
                if (!isNull(childVnode) && isObject(childVnode) && !isUndefined(childVnode.sel) && childVnode.sel.indexOf('-') > 0 && isUndefined(childVnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning(`Missing "key" attribute in iteration with child "<${childVnode.sel}>", index ${i}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`);
                }
            });
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
    {
        assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    }
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
    {
        assert.isTrue(isObject(slotset), `Invalid slotset value ${toString(slotset)}`);
    }
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}
const slotsetProxyHandler = {
    get: (slotset, key) => getSlotsetValue(slotset, key),
    set: () => {
        {
            assert.logError(`$slotset object cannot be mutated from template.`);
        }
        return false;
    },
    deleteProperty: () => {
        {
            assert.logError(`$slotset object cannot be mutated from template.`);
        }
        return false;
    },
};
function validateSlots(vm, html) {
    {
        const { cmpSlots = EmptySlots } = vm;
        const { slots = EmptyArray } = html;
        for (const slotName in cmpSlots) {
            assert.isTrue(isArray(cmpSlots[slotName]), `Slots can only be set to an array, instead received ${toString(cmpSlots[slotName])} for slot ${slotName} in ${vm}.`);
            if (ArrayIndexOf.call(slots, slotName) === -1) {
                // TODO: this should never really happen because the compiler should always validate
                assert.logWarning(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
            }
        }
    }
}
function validateFields(vm, html) {
    {
        const component = vm.component;
        // validating identifiers used by template that should be provided by the component
        const { ids = [] } = html;
        ids.forEach((propName) => {
            if (!(propName in component)) {
                assert.logWarning(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
            }
            else if (hasOwnProperty.call(component, propName)) {
                {
                    assert.fail(`${component}'s template is accessing \`this.${toString(propName)}\` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString(propName)}\`.`);
                }
            }
        });
    }
}
function validateTemplate(vm, html) {
    validateSlots(vm, html);
    validateFields(vm, html);
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
            {
                prepareForAttributeMutationFromTemplate(host, oldToken);
            }
            host.removeAttribute(oldToken);
        }
        // If the template has a token apply the token to the host element
        if (!isUndefined(newToken)) {
            {
                prepareForAttributeMutationFromTemplate(host, newToken);
            }
            host.setAttribute(newToken, '');
        }
    }
}
function evaluateTemplate(vm, html) {
    {
        assert.vm(vm);
        assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    }
    // TODO: add identity to the html functions
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
        {
            validateTemplate(vm, html);
        }
    }
    {
        assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    }
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    const vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    }
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
function getMarkName(vm, phase) {
    return `<${vm.def.name} (${vm.uid})> - ${phase}`;
}
function startMeasure(vm, phase) {
    if (!isUserTimingSupported) {
        return;
    }
    const name = getMarkName(vm, phase);
    performance.mark(name);
}
function endMeasure(vm, phase) {
    if (!isUserTimingSupported) {
        return;
    }
    const name = getMarkName(vm, phase);
    performance.measure(name, name);
    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}

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
    {
        startMeasure(vm, 'constructor');
    }
    let component;
    let error;
    try {
        component = new Ctor();
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        {
            endMeasure(vm, 'constructor');
        }
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
    {
        startMeasure(vm, 'render');
    }
    try {
        const html = render.call(component);
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        }
        else if (!isUndefined(html)) {
            {
                assert.fail(`The template rendered by ${vm} must return an imported template tag (e.g.: \`import html from "./mytemplate.html"\`) or undefined, instead, it has returned ${html}.`);
            }
        }
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        {
            endMeasure(vm, 'render');
        }
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
    {
        assert.vm(vm);
    }
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    {
        assert.vm(vm);
    }
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
    {
        assert.isTrue(vm.component === component, `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
        const { track } = getComponentDef(Ctor);
        if ('state' in component && (!track || !track.state)) {
            assert.logWarning(`Non-trackable component state detected in ${component}. Updates to state property will not be reactive. To make state reactive, add @track decorator.`);
        }
    }
}
function linkComponent(vm) {
    {
        assert.vm(vm);
    }
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
    {
        assert.vm(vm);
    }
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            {
                assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
            }
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
    {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
    }
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
    {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            assert.logWarning(`${vm} has duplicate listeners for event "${eventName}". Instead add the event listener in the connectedCallback() hook.`);
        }
    }
    ArrayPush.call(cmpEvents[eventName], newHandler);
}
function removeComponentEventListener(vm, eventName, oldHandler) {
    {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by removing an event listener for "${eventName}".`);
    }
    const { cmpEvents } = vm;
    if (cmpEvents) {
        const handlers = cmpEvents[eventName];
        const pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            return;
        }
    }
    {
        assert.logWarning(`Did not find event listener ${oldHandler} for event "${eventName}" on ${vm}. Instead only remove an event listener once.`);
    }
}
function handleComponentEvent(vm, event) {
    {
        assert.vm(vm);
        assert.invariant(event instanceof Event, `dispatchComponentEvent() must receive an event instead of ${event}`);
        assert.invariant(vm.cmpEvents && vm.cmpEvents[event.type] && vm.cmpEvents[event.type].length, `handleComponentEvent() should only be invoked if there is at least one listener in queue for ${event.type} on ${vm}.`);
    }
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
    {
        assert.vm(vm);
        assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    }
    clearReactiveListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    {
        assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    }
    return vnodes;
}
function markComponentAsDirty(vm) {
    {
        assert.vm(vm);
        assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the componet is already dirty.`);
        assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    }
    vm.isDirty = true;
}
function getCustomElementComponent(elmOrRoot) {
    {
        assert.vm(elmOrRoot[ViewModelReflection]);
    }
    return elmOrRoot[ViewModelReflection].component;
}

const TargetToReactiveRecordMap = new WeakMap();
function notifyMutation(target, key) {
    {
        assert.invariant(!isRendering, `Mutating property ${toString(key)} of ${toString(target)} is not allowed during the rendering life-cycle of ${vmBeingRendered}.`);
    }
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        const value = reactiveRecord[key];
        if (value) {
            const len = value.length;
            for (let i = 0; i < len; i += 1) {
                const vm = value[i];
                {
                    assert.vm(vm);
                }
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

const { create: create$1, getPrototypeOf: getPrototypeOf$1, getOwnPropertyNames: getOwnPropertyNames$1, getOwnPropertySymbols: getOwnPropertySymbols$1 } = Object;
const { isArray: isArray$1 } = Array;
function getTarget(item) {
    return item && item[TargetSlot];
}
function extract(objectOrArray) {
    if (isArray$1(objectOrArray)) {
        return objectOrArray.map((item) => {
            const original = getTarget(item);
            if (original) {
                return extract(original);
            }
            return item;
        });
    }
    const obj = create$1(getPrototypeOf$1(objectOrArray));
    const names = getOwnPropertyNames$1(objectOrArray);
    return ArrayConcat.call(names, getOwnPropertySymbols$1(objectOrArray))
        .reduce((seed, key) => {
        const item = objectOrArray[key];
        const original = getTarget(item);
        if (original) {
            seed[key] = extract(original);
        }
        else {
            seed[key] = item;
        }
        return seed;
    }, obj);
}
const formatter = {
    header: (plainOrProxy) => {
        const originalTarget = plainOrProxy[TargetSlot];
        if (!originalTarget) {
            return null;
        }
        const obj = extract(plainOrProxy);
        return ['object', { object: obj }];
    },
    hasBody: () => {
        return false;
    },
    body: () => {
        return null;
    }
};
function init() {
    const devWindow = window;
    const devtoolsFormatters = devWindow.devtoolsFormatters || [];
    ArrayPush.call(devtoolsFormatters, formatter);
    devWindow.devtoolsFormatters = devtoolsFormatters;
}

{
    init();
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
        {
            if (!observable && value !== null && isObject(value)) {
                if (isRendering) {
                    assert.logWarning(`Rendering a non-reactive value ${value} from member property ${key} of ${vmBeingRendered} is not common because mutations on that value will not re-render the template.`);
                }
                else {
                    assert.logWarning(`Returning a non-reactive value ${value} to member property ${key} of ${toString(originalTarget)} is not common because mutations on that value cannot be observed.`);
                }
            }
        }
        return observable ? getReactiveProxy(value) : value;
    }
    set(shadowTarget, key, value) {
        const { originalTarget } = this;
        if (isRendering) {
            {
                assert.logError(`Setting property "${toString(key)}" of ${toString(shadowTarget)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
            }
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
        {
            assert.fail(`invalid call invocation for property proxy ${toString(target)}`);
        }
    }
    construct(target, argArray, newTarget) {
        {
            assert.fail(`invalid construction invocation for property proxy ${toString(target)}`);
        }
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
        {
            assert.fail(`Invalid setPrototypeOf invocation for reactive proxy ${toString(this.originalTarget)}. Prototype of reactive objects cannot be changed.`);
        }
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
    {
        assert.isTrue(isObservable(value), "perf-optimization: avoid calling this method with non-observable values.");
    }
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
    {
        assert.fail("@track may only be used as a decorator.");
    }
}
// TODO: how to allow symbols as property keys?
function createTrackedPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = getCustomElementVM(this);
            {
                assert.vm(vm);
            }
            observeMutation(this, key);
            return vm.cmpTrack[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            const observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;
            if (newValue !== vm.cmpTrack[key]) {
                {
                    if (!observable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning(`Property "${key}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
                    }
                }
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
    {
        assert.fail("@wire may only be used as a decorator.");
    }
}
// TODO: how to allow symbols as property keys?
function createWiredPropertyDescriptor(proto, key, descriptor) {
    createTrackedPropertyDescriptor(proto, key, descriptor);
}

// stub function to prevent misuse of the @api decorator
function api$1() {
    {
        assert.fail("@api may only be used as a decorator.");
    }
}
let vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    {
        assert.vm(vm);
    }
    vmBeingUpdated = vm;
}
// TODO: how to allow symbols as property keys?
function createPublicPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = getCustomElementVM(this);
            {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                {
                    assert.logError(`${vm} constructor should not read the value of property "${key}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
                }
                return;
            }
            observeMutation(this, key);
            return vm.cmpProps[key];
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                {
                    if (!observable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
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
            else {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.logError(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    });
}
function createPublicAccessorDescriptor(proto, key, descriptor) {
    const { get, set, enumerable } = descriptor || EmptyObject;
    defineProperty(proto, key, {
        get() {
            {
                const vm = getCustomElementVM(this);
                assert.vm(vm);
            }
            if (get) {
                return get.call(this);
            }
        },
        set(newValue) {
            const vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                {
                    if (!observable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, newValue);
                }
                else {
                    assert.fail(`Invalid attempt to set a new value for property ${key} of ${vm} that does not has a setter decorated with @api.`);
                }
            }
            else {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.fail(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            }
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
let observableHTMLAttrs;
{
    observableHTMLAttrs = getOwnPropertyNames(GlobalHTMLProperties).reduce((acc, key) => {
        const globalProperty = GlobalHTMLProperties[key];
        if (globalProperty && globalProperty.attribute) {
            acc[globalProperty.attribute] = 1;
        }
        return acc;
    }, create(null));
}
const CtorToDefMap = new WeakMap();
const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;
function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getPrototypeOf(Ctor);
    if (proto === LWCElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}
function createComponentDef(Ctor) {
    {
        assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`);
        // local to dev block
        const ctorName = Ctor.name;
        assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(Ctor.constructor, `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`);
    }
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
            {
                assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
                const mustHaveGetter = COMPUTED_GETTER_MASK & config;
                const mustHaveSetter = COMPUTED_SETTER_MASK & config;
                if (mustHaveGetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${propName} decorated with @api in ${name}`);
                }
                if (mustHaveSetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${propName} decorated with @api in ${name}`);
                    assert.isTrue(mustHaveGetter, `Missing getter for property ${propName} decorated with @api in ${name}. You cannot have a setter without the corresponding getter.`);
                }
            }
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
            {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            }
            // initializing getters and setters for each public prop on the target prototype
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track$$1) {
        for (const propName in track$$1) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            }
            // initializing getters and setters for each public prop on the target prototype
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
    {
        freeze(Ctor.prototype);
        freeze(wire$$1);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (const key in def) {
            defineProperty(def, key, {
                configurable: false,
                writable: false,
            });
        }
    }
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
    {
        const vm = getCustomElementVM(this);
        assertPublicAttributeColission(vm, attrName);
    }
    return getAttribute.apply(this, ArraySlice.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    const vm = getCustomElementVM(this);
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
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
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
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
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttribute.call(this, attrName) : null;
    removeAttribute.apply(this, ArraySlice.call(arguments));
    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}
function removeAttributeNSPatched(attrNameSpace, attrName) {
    const vm = getCustomElementVM(this);
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;
    removeAttributeNS.apply(this, ArraySlice.call(arguments));
    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}
function assertPublicAttributeColission(vm, attrName) {
    const propName = isString(attrName) ? getPropNameFromAttrName(attrName.toLocaleLowerCase()) : null;
    const { def: { props: propsConfig } } = vm;
    if (propsConfig && propName && propsConfig[propName]) {
        assert.logError(`Invalid attribute "${attrName.toLocaleLowerCase()}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
    }
}
function assertTemplateMutationViolation(vm, attrName) {
    const { elm } = vm;
    if (!isAttributeChangeControlled(attrName) && !isUndefined(elm[OwnerKey])) {
        assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`);
    }
    // attribute change control must be released every time its value is checked
    resetAttributeChangeControl();
}
function isAttrObserved(vm, attrName) {
    return attrName in vm.def.observedAttrs;
}
let controlledAttributeChange = false;
let controlledAttributeName;
function isAttributeChangeControlled(attrName) {
    return controlledAttributeChange && attrName === controlledAttributeName;
}
function resetAttributeChangeControl() {
    controlledAttributeChange = false;
    controlledAttributeName = undefined;
}
function prepareForAttributeMutationFromTemplate(elm, key) {
    if (elm[ViewModelReflection]) {
        // TODO: we should guarantee that the methods of the element are all patched
        controlledAttributeChange = true;
        controlledAttributeName = key;
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
        {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, attribute, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                if (error) {
                    msg.push(error);
                }
                else if (experimental) {
                    msg.push(`"${propName}" is an experimental property that is not standardized or supported by all browsers. You should not use "${propName}" and attribute "${attribute}" in your component.`);
                }
                else {
                    msg.push(`"${propName}" is a global HTML property. Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                    msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                    msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                }
                console.error(msg.join('\n')); // tslint:disable-line
            }
        }
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
        {
            assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        }
        return methodsHash;
    }, create(null));
}
function getObservedAttributesHash(target) {
    const observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce((reducer, attrName) => {
        {
            const propName = getPropNameFromAttrName(attrName);
            // Check if it is a user defined public property
            if (target.publicProps && target.publicProps[propName]) {
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. To observe mutations of the public property "${propName}" you can define a public getter and setter decorated with @api in component ${target.name}.`);
            }
            else if (!observableHTMLAttrs[attrName] && (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute)) {
                // Check for misspellings
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. Did you mean "${GlobalHTMLProperties[propName].attribute}"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            }
            else if (!observableHTMLAttrs[attrName] && (attrName.indexOf('data-') === -1 && attrName.indexOf('aria-') === -1)) {
                // Attribute is not valid observable HTML Attribute
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            }
        }
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
        else {
            // TODO: eventually we should throw, this is only needed for the tests today
            assert.logWarning(`Different component class cannot be registered to the same tagName="${tagName}".`);
        }
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
    {
        assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), `vnode.data.props cannot change shape.`);
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
        {
            if (old !== cur && !(key in elm)) {
                // TODO: this should never really happen because the compiler should always validate
                assert.fail(`Unknown public property "${key}" of ${elm}. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
            }
        }
        if (old !== cur && (key in elm) && (key !== 'value' || elm[key] !== cur)) {
            {
                if (elm[key] === cur && old !== undefined) {
                    console.warn(`Unneccessary update of property "${key}" in ${elm}.`); // tslint:disable-line
                }
            }
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
    {
        assert.invariant(isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','), `vnode.data.attrs cannot change shape.`);
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
            {
                prepareForAttributeMutationFromTemplate(elm, key);
            }
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
    {
        assert.invariant(isUndefined(oldStyle) || typeof newStyle === typeof oldStyle, `vnode.data.style cannot change types.`);
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
    {
        assert.invariant(isUndefined(oldClass) || typeof oldClass === typeof klass, `vnode.data.class cannot change types.`);
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
        {
            prepareForAttributeMutationFromTemplate(elm, oldToken);
        }
        elm.removeAttribute(oldToken);
    }
    if (!isUndefined(newToken)) {
        {
            prepareForAttributeMutationFromTemplate(elm, newToken);
        }
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
    {
        assert.vm(vm);
        assert.invariant(vm.idx === 0, `${vm} is already locked to a previously generated idx.`);
    }
    vm.idx = ++idx;
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    const { connectedCallback } = vm.def;
    if (!isUndefined(connectedCallback)) {
        {
            startMeasure(vm, 'connectedCallback');
        }
        invokeComponentCallback(vm, connectedCallback);
        {
            endMeasure(vm, 'connectedCallback');
        }
    }
}
function removeInsertionIndex(vm) {
    {
        assert.vm(vm);
        assert.invariant(vm.idx > 0, `${vm} is not locked to a previously generated idx.`);
    }
    vm.idx = 0;
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
    const { disconnectedCallback } = vm.def;
    if (!isUndefined(disconnectedCallback)) {
        {
            startMeasure(vm, 'disconnectedCallback');
        }
        invokeComponentCallback(vm, disconnectedCallback);
        {
            endMeasure(vm, 'disconnectedCallback');
        }
    }
}
function renderVM(vm) {
    {
        assert.vm(vm);
    }
    if (vm.isDirty) {
        rehydrate(vm);
    }
}
function appendVM(vm) {
    {
        assert.vm(vm);
    }
    if (vm.idx !== 0) {
        return; // already appended
    }
    addInsertionIndex(vm);
}
function removeVM(vm) {
    {
        assert.vm(vm);
    }
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
    {
        assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element instead of ${elm}.`);
    }
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
    {
        vm.toString = () => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }
    createComponent(vm, Ctor);
    linkComponent(vm);
}
function rehydrate(vm) {
    {
        assert.vm(vm);
        assert.isTrue(vm.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
    }
    if (vm.idx > 0 && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}
function patchErrorBoundaryVm(errorBoundaryVm) {
    {
        assert.vm(errorBoundaryVm);
        assert.isTrue(errorBoundaryVm.elm instanceof HTMLElement, `rehydration can only happen after ${errorBoundaryVm} was patched the first time.`);
        assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
    }
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
    {
        assert.vm(vm);
    }
    const { children: oldCh } = vm;
    vm.children = children; // caching the new children collection
    if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
    }
    let error;
    {
        startMeasure(vm, 'patch');
    }
    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(vm.elm, oldCh, children);
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        {
            endMeasure(vm, 'patch');
        }
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
    {
        assert.vm(vm);
    }
    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    const { renderedCallback } = vm.def;
    if (!isUndefined(renderedCallback)) {
        {
            startMeasure(vm, 'renderedCallback');
        }
        invokeComponentCallback(vm, renderedCallback);
        {
            endMeasure(vm, 'renderedCallback');
        }
    }
}
let rehydrateQueue = [];
function flushRehydrationQueue() {
    {
        assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    }
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
    {
        startMeasure(errorBoundaryVm, 'errorCallback');
    }
    // error boundaries must have an ErrorCallback
    invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);
    {
        endMeasure(errorBoundaryVm, 'errorCallback');
    }
}
function resetShadowRoot(vm) {
    {
        assert.vm(vm);
    }
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
        {
            assert.logError("Swallow Error: Failed to reset component's shadow with an empty list of children: " + e);
        }
        // in the event of patch failure force offender removal
        vm.elm.innerHTML = "";
    }
}
function scheduleRehydration(vm) {
    {
        assert.vm(vm);
    }
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}
function isNodeOwnedByVM(vm, node) {
    {
        assert.vm(vm);
        assert.invariant(node instanceof Node, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
        assert.childNode(vm.elm, node, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${vm}`);
    }
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    {
        assert.vm(vm);
        assert.invariant(node instanceof Node, `isNodePassedToVM() should be called with a node as the second argument instead of ${node}`);
        assert.childNode(vm.elm, node, `isNodePassedToVM() should never be called with a node that is not a child node of ${vm}`);
    }
    const { elm } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    return node[OwnerKey] === elm[OwnerKey];
}
function getErrorBoundaryVMFromParentElement(vm) {
    {
        assert.vm(vm);
    }
    const { elm } = vm;
    const parentElm = elm && elm.parentElement;
    return getErrorBoundaryVM(parentElm);
}
function getErrorBoundaryVMFromOwnElement(vm) {
    {
        assert.vm(vm);
    }
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
    {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }
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
            {
                prepareForAttributeMutationFromTemplate(element, 'is');
            }
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
