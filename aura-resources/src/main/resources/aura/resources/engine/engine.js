/*
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
    block(fn) {
        fn();
    },
    vnode(vnode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode, `${vnode} is not a vnode.`);
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
            console.error(e);
        }
    },
    logWarning(msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            console.warn(e);
        }
    },
    childNode(container, node, msg) {
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || `${node} must be a child node of ${container}`);
    }
};

const { freeze, seal, keys, create, assign, defineProperty, getPrototypeOf, setPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyNames, defineProperties, getOwnPropertySymbols, hasOwnProperty, preventExtensions, isExtensible, } = Object;
const { isArray } = Array;
const { filter: ArrayFilter, slice: ArraySlice, splice: ArraySplice, indexOf: ArrayIndexOf, push: ArrayPush, map: ArrayMap, forEach, } = Array.prototype;
function isUndefined(obj) {
    return obj === undefined;
}
function isNull(obj) {
    return obj === null;
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
function toString$1(obj) {
    if (obj && typeof obj === 'object' && !obj.toString) {
        return OtS.call(obj);
    }
    return obj + '';
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
        msg: 'Using property "dataset" is an anti-pattern. Instead declare \`static observedAttributes = ["data-foo"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes.',
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

const topLevelContextSymbol = Symbol('Top Level Context');
let currentContext = {};
currentContext[topLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

function insert(vnode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    if (vm.idx > 0) {
        assert.isTrue(vnode.isRoot, `${vm} is already inserted.`);
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
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
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
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    assert.isTrue(vm.idx, `${vm} is not inserted.`);
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

let nextTickCallbackQueue = [];
const SPACE_CHAR = 32;
const EmptyObject = seal(create(null));
const EmptyArray = seal([]);
function flushCallbackQueue() {
    assert.invariant(nextTickCallbackQueue.length, `If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of ${nextTickCallbackQueue}.`);
    const callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}
function addCallbackToNextTick(callback) {
    assert.isTrue(isFunction(callback), `addCallbackToNextTick() can only accept a function callback as first argument instead of ${callback}`);
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
    if (!propName) {
        propName = attrName.replace(CAMEL_REGEX, (g) => g[1].toUpperCase());
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}
const CAPS_REGEX = /[A-Z]/g;
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
function getAttrNameFromPropName(propName) {
    let attrName = propNameToAttributeNameMap[propName];
    if (!attrName) {
        attrName = propName.replace(CAPS_REGEX, (match) => '-' + match.toLowerCase());
        propNameToAttributeNameMap[propName] = attrName;
    }
    return attrName;
}
function toAttributeValue(raw) {
    // normalizing attrs from compiler into HTML global attributes
    if (raw === true) {
        raw = '';
    }
    else if (raw === false) {
        raw = null;
    }
    return raw != null ? raw + '' : null; // null and undefined should always produce null
}
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
    assert.block(() => {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    });
    return map;
}

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
    // Try to identify the owner, but for root elements and other special cases, we
    // can just fallback to 0 which means top level creation.
    const uid = vmBeingRendered ? vmBeingRendered.uid : 0;
    const vnode = { sel, data, children, text, elm, key, Ctor, uid };
    assert.block(function devModeCheck() {
        // adding toString to all vnodes for debuggability
        vnode.toString = () => `[object:vnode ${sel}]`;
    });
    return vnode;
}
// [h]tml node
function h(sel, data, children) {
    assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
    assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
    assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling h().`);
    const { classMap, className, style, styleMap } = data;
    assert.isFalse(className && classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
    assert.block(function devModeCheck() {
        if (style && !isString(style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
    });
    data.style = styleMap || (style && style + '');
    assert.block(function devModeCheck() {
        children.forEach((vnode) => {
            if (vnode === null) {
                return;
            }
            assert.vnode(vnode);
        });
    });
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
    assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
    assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
    assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
    const { key, slotset, styleMap, style, attrs, on, className, classMap, props: _props } = data;
    assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    data = { hook: lifeCycleHooks, key, slotset, attrs, on, _props };
    assert.isFalse(className && classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
    assert.block(function devModeCheck() {
        if (style && !isString(style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
    });
    data.style = styleMap || (style && style + '');
    return v(sel, data, EmptyArray, undefined, undefined, Ctor);
}
// [i]terable node
function i(iterable, factory) {
    const list = [];
    if (isUndefined(iterable) || iterable === null) {
        assert.logWarning(`Invalid template iteration for value "${iterable}" in ${vmBeingRendered}, it should be an Array or an iterable Object.`);
        return list;
    }
    assert.isFalse(isUndefined(iterable[SymbolIterator]), `Invalid template iteration for value \`${iterable}\` in ${vmBeingRendered}, it requires an array-like object, not \`null\` or \`undefined\`.`);
    const iterator = iterable[SymbolIterator]();
    assert.isTrue(iterator && isFunction(iterator.next), `Invalid iterator function for "${iterable}" in ${vmBeingRendered}.`);
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
        assert.block(function devModeCheck() {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach((vnode) => {
                if (vnode && isObject(vnode) && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning(`Missing "key" attribute in iteration with child "${toString$1(vnode.Ctor.name)}", index ${i}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`);
                }
            });
        });
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
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
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
    assert.vm(vmBeingRendered);
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

const EmptySlots = create(null);
function getSlotsetValue(slotset, slotName) {
    assert.isTrue(isObject(slotset), `Invalid slotset value ${toString$1(slotset)}`);
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}
const slotsetProxyHandler = {
    get: (slotset, key) => getSlotsetValue(slotset, key),
    set: () => {
        assert.logError(`$slotset object cannot be mutated from template.`);
        return false;
    },
    deleteProperty: () => {
        assert.logError(`$slotset object cannot be mutated from template.`);
        return false;
    },
    apply() {
        assert.fail(`invalid call invocation from slotset`);
    },
    construct() {
        assert.fail(`invalid construction invocation from slotset`);
    },
};
function validateSlots(vm, html) {
    let { cmpSlots = EmptySlots } = vm;
    const { slots = [] } = html;
    for (let slotName in cmpSlots) {
        if (ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: this should never really happen because the compiler should always validate
            console.warn(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
        }
    }
}
function validateFields(vm, html) {
    let { component } = vm;
    // validating identifiers used by template that should be provided by the component
    const { ids = [] } = html;
    ids.forEach((propName) => {
        if (!(propName in component)) {
            console.warn(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
        }
        else if (hasOwnProperty.call(component, propName)) {
            assert.fail(`${component}'s template is accessing \`this.${toString$1(propName)}\` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString$1(propName)}\`.`);
        }
    });
}
function validateTemplate(vm, html) {
    validateSlots(vm, html);
    validateFields(vm, html);
}
function evaluateTemplate(vm, html) {
    assert.vm(vm);
    assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    // TODO: add identity to the html functions
    let { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        context.tplCache = create(null);
        vm.cmpTemplate = html;
        assert.block(function devModeCheck() {
            validateTemplate(vm, html);
        });
    }
    assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    let vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    slotsetRevoke();
    return vnodes;
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
            assert.fail(`The template rendered by ${vm} must return an imported template tag (e.g.: \`import html from "./mytemplate.html"\`) or undefined, instead, it has returned ${html}.`);
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
        component.attributeChangedCallback(attrName, toAttributeValue(oldValue), toAttributeValue(newValue));
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

const hooks = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
/* eslint-enable */
const Services = create(null);
function register(service) {
    assert.isTrue(isObject(service), `Invalid service declaration, ${service}: service must be an object`);
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
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
    assert.vm(vm);
    assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    const { component, vnode: { data }, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
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
    assert.isTrue(membrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
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

/* eslint-enable */
function piercingHook(membrane, target, key, value) {
    const { handler: { vm } } = membrane;
    assert.vm(vm);
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
        assert.vm(vm);
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
        assert.isTrue(newTarget, `construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.`);
        return getReplica(membrane, new targetFn(...argumentsList));
    }
}
function pierce(vm, value) {
    assert.vm(vm);
    let { membrane } = vm;
    if (!membrane) {
        const handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}

/*eslint-enable*/
let vmBeingConstructed = null;
function isBeingConstructed(vm) {
    assert.vm(vm);
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    assert.vm(vm);
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
    assert.isTrue(vm.component === component, `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
}
function linkComponent(vm) {
    assert.vm(vm);
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
    assert.vm(vm);
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
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
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
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
    assert.block(function devModeCheck() {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            assert.logWarning(`${vm} has duplicate listeners for event "${eventName}". Instead add the event listener in the connectedCallback() hook.`);
        }
    });
    ArrayPush.call(cmpEvents[eventName], newHandler);
}
function removeComponentEventListener(vm, eventName, oldHandler) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by removing an event listener for "${eventName}".`);
    const { cmpEvents } = vm;
    if (cmpEvents) {
        const handlers = cmpEvents[eventName];
        const pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            return;
        }
    }
    assert.block(function devModeCheck() {
        assert.logWarning(`Did not find event listener ${oldHandler} for event "${eventName}" on ${vm}. Instead only remove an event listener once.`);
    });
}
function dispatchComponentEvent(vm, event) {
    assert.vm(vm);
    assert.invariant(event instanceof Event, `dispatchComponentEvent() must receive an event instead of ${event}`);
    const { cmpEvents, component } = vm;
    const { type } = event;
    assert.invariant(cmpEvents && cmpEvents[type] && cmpEvents[type].length, `dispatchComponentEvent() should only be invoked if there is at least one listener in queue for ${type} on ${vm}.`);
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
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
    assert.isTrue(isArray(newValue) && newValue.length > 0, `Slots can only be set to a non-empty array, instead received ${toString$1(newValue)} for slot ${slotName} in ${vm}.`);
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
        console.log(`Marking ${vm} as dirty: a new value for slot "${slotName}" was added.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function removeComponentSlot(vm, slotName) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    const { cmpSlots } = vm;
    if (cmpSlots && cmpSlots[slotName]) {
        cmpSlots[slotName] = undefined; // delete will de-opt the cmpSlots, better to set it to undefined
        console.log(`Marking ${vm} as dirty: the value of slot "${slotName}" was removed.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function renderComponent(vm) {
    assert.vm(vm);
    assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    return vnodes;
}
function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    vm.isDirty = true;
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
                assert.vm(vm);
                console.log(`Marking ${vm} as dirty: property "${toString$1(key)}" of ${toString$1(target)} was set to a new value.`);
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration due to mutation.`);
                    scheduleRehydration(vm);
                }
            }
        }
    }
}
function subscribeToSetHook(vm, target, key) {
    assert.vm(vm);
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
const ReactiveMap = new WeakMap();
const ObjectDotPrototype = Object.prototype;
function lockShadowTarget(shadowTarget, originalTarget) {
    const targetKeys = getOwnPropertyNames(originalTarget);
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
        if (isRendering && vmBeingRendered) {
            subscribeToSetHook(vmBeingRendered, originalTarget, key); // eslint-disable-line no-undef
        }
        const observable = isObservable(value);
        assert.block(function devModeCheck() {
            if (!observable && value !== null && isObject(value)) {
                if (isRendering) {
                    assert.logWarning(`Rendering a non-reactive value ${value} from member property ${key} of ${vmBeingRendered} is not common because mutations on that value will not re-render the template.`);
                }
                else {
                    assert.logWarning(`Returning a non-reactive value ${value} to member property ${key} of ${toString$1(originalTarget)} is not common because mutations on that value cannot be observed.`);
                }
            }
        });
        return observable ? getReactiveProxy(value) : value;
    }
    set(shadowTarget, key, value) {
        const { originalTarget } = this;
        if (isRendering) {
            assert.logError(`Setting property "${toString$1(key)}" of ${toString$1(shadowTarget)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
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
        assert.fail(`invalid call invocation for property proxy ${toString$1(target)}`);
    }
    construct(target, argArray, newTarget) {
        assert.fail(`invalid construction invocation for property proxy ${toString$1(target)}`);
    }
    has(shadowTarget, key) {
        const { originalTarget } = this;
        return key in originalTarget;
    }
    ownKeys(shadowTarget) {
        const { originalTarget } = this;
        return getOwnPropertyNames(originalTarget);
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
        assert.fail(`Invalid setPrototypeOf invocation for reactive proxy ${toString$1(this.originalTarget)}. Prototype of reactive objects cannot be changed.`);
    }
    getPrototypeOf(shadowTarget) {
        const { originalTarget } = this;
        return getPrototypeOf(originalTarget);
    }
    getOwnPropertyDescriptor(shadowTarget, key) {
        const { originalTarget } = this;
        let desc = getOwnPropertyDescriptor(originalTarget, key);
        if (!desc) {
            return desc;
        }
        if (!desc.configurable && !hasOwnProperty.call(shadowTarget, key)) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            desc = wrapDescriptor(desc);
            defineProperty(shadowTarget, key, desc);
        }
        return desc;
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
        const unwrappedDescriptor = unwrapDescriptor(descriptor);
        if (configurable === false) {
            defineProperty(shadowTarget, key, unwrappedDescriptor);
        }
        defineProperty(originalTarget, key, unwrappedDescriptor);
        return true;
    }
}
function getReactiveProxy(value) {
    assert.isTrue(isObservable(value), "perf-optimization: avoid calling this method with non-observable values.");
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

// TODO: how to allow symbols as property keys?
function createTrackedPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpTrack[key];
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            const observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;
            if (newValue !== vm.cmpTrack[key]) {
                assert.block(function devModeCheck() {
                    if (!observable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning(`Property "${key}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
                    }
                });
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

// TODO: how to allow symbols as property keys?
function createWiredPropertyDescriptor(proto, key, descriptor) {
    createTrackedPropertyDescriptor(proto, key, descriptor);
}

let vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    assert.vm(vm);
    vmBeingUpdated = vm;
}
// TODO: how to allow symbols as property keys?
function createPublicPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get() {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isBeingConstructed(vm)) {
                assert.logError(`${vm} constructor should not read the value of property "${key}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
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
            assert.vm(vm);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
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
                assert.block(function devModeCheck() {
                    if (!observable && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                });
                vm.cmpProps[key] = newValue;
            }
            else {
                assert.logError(`${vm} can only set a new value for property "${key}" during construction.`);
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
    });
}
function createPublicAccessorDescriptor(proto, key, descriptor) {
    const { get, set, enumerable } = descriptor || EmptyObject;
    defineProperty(proto, key, {
        get() {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (get) {
                return get.call(this);
            }
        },
        set(newValue) {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (!isBeingConstructed(vm) && vmBeingUpdated !== vm) {
                assert.logError(`${vm} can only set a new value for property "${key}" during construction.`);
                return;
            }
            vmBeingUpdated = null; // releasing the lock
            if (set) {
                set.call(this, newValue);
            }
            else {
                assert.fail(`Invalid attempt to set a new value for property ${key} of ${vm} that does not has a setter.`);
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
    assert.vm(vm);
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

const { querySelector, querySelectorAll } = Element.prototype;
function getLinkedElement$2(root) {
    return root[ViewModelReflection].vnode.elm;
}
function shadowRootQuerySelector(shadowRoot, selector) {
    const vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), `this.root.querySelector() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    const elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    const querySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return querySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    const vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), `this.root.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no content has been rendered yet.`);
    const elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    const querySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return querySelectorAll.call(elm, selector);
}
function Root(vm) {
    assert.vm(vm);
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
        assert.block(() => {
            const vm = this[ViewModelReflection];
            if (!node && vm.component.querySelector(selector)) {
                assert.logWarning(`this.root.querySelector() can only return elements from the template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        });
        return node;
    },
    querySelectorAll(selector) {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        assert.block(() => {
            const vm = this[ViewModelReflection];
            if (nodeList.length === 0 && vm.component.querySelectorAll(selector).length) {
                assert.logWarning(`this.root.querySelectorAll() can only return elements from template declaration of ${vm.component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        });
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
    assert.vm(vmBeingConstructed);
    assert.vnode(vmBeingConstructed.vnode);
    const vnode = vmBeingConstructed.vnode;
    assert.invariant(vnode.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vnode}.`);
    vmBeingConstructed.component = this;
    this[ViewModelReflection] = vmBeingConstructed;
}
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
        assert.block(() => {
            const { type: evtName } = event;
            const vm = this[ViewModelReflection];
            assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);
            if (vm.idx === 0) {
                assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
            }
            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        });
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener(type, listener) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.addEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        addComponentEventListener(vm, type, listener);
    },
    removeEventListener(type, listener) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                assert.logWarning(`this.removeEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute(attrName) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        const { vnode: { data: { attrs } } } = vm;
        if (!attrName) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to execute \`getAttribute\` on ${vm}: 1 argument is required, got 0.`);
            }
            return null;
        }
        // logging errors for experimentals and special attributes
        assert.block(function devModeCheck() {
            const propName = getPropNameFromAttrName(attrName);
            const { def: { props: publicPropsConfig } } = vm;
            if (publicPropsConfig[propName]) {
                throw new ReferenceError(`Attribute "${attrName}" corresponds to public property ${propName} from ${vm}. Instead use \`this.${propName}\`. Only use \`getAttribute()\` to access global HTML attributes.`);
            }
            else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, experimental } = GlobalHTMLProperties[propName];
                if (error) {
                    console.error(error);
                }
                else if (experimental) {
                    console.error(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                }
            }
        });
        // normalizing attrs from compiler into HTML global attributes
        let raw = attrs && attrName in attrs ? attrs[attrName] : null;
        return toAttributeValue(raw);
    },
    getBoundingClientRect() {
        const elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        return elm.getBoundingClientRect();
    },
    querySelector(selectors) {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        assert.block(() => {
            if (shadowRootQuerySelector(this.root, selectors)) {
                assert.logWarning(`this.querySelector() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.`);
            }
        });
        return null;
    },
    querySelectorAll(selectors) {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node) => wasNodePassedIntoVM(vm, node));
        assert.block(() => {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(this.root, selectors).length) {
                assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.`);
            }
        });
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
        assert.vm(vm);
        assert.isFalse(isRendering, `Setting property "tabIndex" of ${toString(value)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
        if (isBeingConstructed(vm)) {
            assert.fail(`Setting property "tabIndex" during the construction process of ${vm} is invalid.`);
            return;
        }
        const elm = getLinkedElement(this);
        elm.tabIndex = value;
    },
    get classList() {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
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
        assert.vm(vm);
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    get state() {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        let { cmpState } = vm;
        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getReactiveProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        if (isArray(newState) || !isObservable(newState)) {
            assert.fail(`${vm} failed to set new state to ${newState}. \`this.state\` can only be set to an observable object.`);
            return;
        }
        vm.cmpState = getReactiveProxy(newState); // lazy creation of the cmpState
    },
    toString() {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        const { vnode: { sel, data: { attrs } } } = vm;
        const is = attrs && attrs.is;
        return `<${sel}${is ? ' is="${is}' : ''}>`;
    },
};
// Global HTML Attributes
assert.block(function devModeCheck() {
    getOwnPropertyNames(GlobalHTMLProperties).forEach((propName) => {
        if (propName in ComponentElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function () {
                const vm = this[ViewModelReflection];
                assert.vm(vm);
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
                console.log(msg.join('\n'));
                return; // explicit undefined
            },
            enumerable: false,
        });
    });
});
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
let observableHTMLAttrs;
assert.block(function devModeCheck() {
    observableHTMLAttrs = getOwnPropertyNames(GlobalHTMLProperties).reduce((acc, key) => {
        const globalProperty = GlobalHTMLProperties[key];
        if (globalProperty && globalProperty.attribute) {
            acc[globalProperty.attribute] = true;
        }
        return acc;
    }, create(null));
});
const CtorToDefMap = new WeakMap();
const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;
function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getPrototypeOf(Ctor);
    if (proto === ComponentElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}
function createComponentDef(Ctor) {
    assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`);
    const name = Ctor.name;
    assert.isTrue(name && isString(name), `${toString$1(Ctor)} should have a "name" property with string value, but found ${name}.`);
    assert.isTrue(Ctor.constructor, `Missing ${name}.constructor, ${name} should have a "constructor" property.`);
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    let observedAttrs = getObservedAttributesHash(Ctor);
    let wire = getWireHash(Ctor);
    let track = getTrackHash(Ctor);
    const proto = Ctor.prototype;
    for (let propName in props) {
        const propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        const descriptor = getOwnPropertyDescriptor(proto, propName);
        assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
        const { config } = propDef;
        if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
            assert.block(function devModeCheck() {
                const mustHaveGetter = COMPUTED_GETTER_MASK & config;
                const mustHaveSetter = COMPUTED_SETTER_MASK & config;
                if (mustHaveGetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${propName} decorated with @api in ${name}`);
                }
                if (mustHaveSetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${propName} decorated with @api in ${name}`);
                    assert.isTrue(mustHaveGetter, `Missing getter for property ${propName} decorated with @api in ${name}. You cannot have a setter without the corresponding getter.`);
                }
            });
            createPublicAccessorDescriptor(proto, propName, descriptor);
        }
        else {
            createPublicPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (wire) {
        for (let propName in wire) {
            if (wire[propName].method) {
                // for decorated methods we need to do nothing
                continue;
            }
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            assert.block(function devModeCheck() {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            });
            // initializing getters and setters for each public prop on the target prototype
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track) {
        for (let propName in track) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            assert.block(function devModeCheck() {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            });
            // initializing getters and setters for each public prop on the target prototype
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        }
    }
    const superProto = getPrototypeOf(Ctor);
    if (superProto !== ComponentElement) {
        const superDef = getComponentDef(superProto);
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = (superDef.wire || wire) ? assign(create(null), superDef.wire, wire) : undefined;
    }
    const descriptors = createDescriptorMap(props, methods);
    const def = {
        name,
        wire,
        track,
        props,
        methods,
        observedAttrs,
        descriptors,
    };
    assert.block(function devModeCheck() {
        freeze(Ctor.prototype);
        freeze(wire);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (let key in def) {
            defineProperty(def, key, {
                configurable: false,
                writable: false,
            });
        }
    });
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
            assert.logError(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            return;
        }
        const observable = isObservable(newValue);
        newValue = observable ? getReactiveProxy(newValue) : newValue;
        assert.block(function devModeCheck() {
            if (!observable && newValue !== null && isObject(newValue)) {
                assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
            }
        });
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
    const vm = this[ViewModelReflection];
    assert.vm(vm);
    assert.block(function devModeCheck() {
        const { def: { props: propsConfig } } = vm;
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
        }
    });
    return getAttribute.call(this, attrName);
}
function setAttributePatched(attrName, newValue) {
    const vm = this[ViewModelReflection];
    assert.vm(vm);
    const { def: { props: propsConfig, observedAttrs } } = vm;
    attrName = attrName.toLocaleLowerCase();
    assert.block(function devModeCheck() {
        if (!vm.vnode.isRoot) {
            assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`);
        }
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = value;\`.`);
        }
    });
    const oldValue = getAttribute.call(this, attrName);
    setAttribute.call(this, attrName, newValue);
    newValue = getAttribute.call(this, attrName);
    if (attrName in observedAttrs && oldValue !== newValue) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
function removeAttributePatched(attrName) {
    const vm = this[ViewModelReflection];
    assert.vm(vm);
    const { def: { props: propsConfig, observedAttrs } } = vm;
    attrName = attrName.toLocaleLowerCase();
    assert.block(function devModeCheck() {
        if (!vm.vnode.isRoot) {
            assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to remove attribute "${attrName}" from this element, you can update the state of the component, and let the engine to rehydrate the element accordingly.`);
        }
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = undefined;\`.`);
        }
    });
    const oldValue = getAttribute.call(this, attrName);
    removeAttribute.call(this, attrName);
    const newValue = getAttribute.call(this, attrName);
    if (attrName in observedAttrs && oldValue !== newValue) {
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
    const track = target.track;
    if (!track || !getOwnPropertyNames(track).length) {
        return;
    }
    assert.block(function devModeCheck() {
        // TODO: check that anything in `track` is correctly defined in the prototype
    });
    return assign(create(null), track);
}
function getWireHash(target) {
    const wire = target.wire;
    if (!wire || !getOwnPropertyNames(wire).length) {
        return;
    }
    assert.block(function devModeCheck() {
        // TODO: check that anything in `wire` is correctly defined in the prototype
    });
    return assign(create(null), wire);
}
function getPublicPropertiesHash(target) {
    const props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash, propName) => {
        assert.block(function devModeCheck() {
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
                console.error(msg.join('\n'));
            }
        });
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
        assert.block(function devModeCheck() {
            assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}
function getObservedAttributesHash(target) {
    const observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce((observedAttributes, attrName) => {
        assert.block(function devModeCheck() {
            // Check if it is a regular data or aria attribute
            if (attrName.indexOf('data-') === 0 || attrName.indexOf('aria-') === 0) {
                return;
            }
            // Check if observed attribute is observable HTML Attribute
            if (observableHTMLAttrs[attrName]) {
                return;
            }
            // TODO: all these checks should be done in the compiler
            const propName = getPropNameFromAttrName(attrName);
            // Check if it is a user defined public property
            if (target.publicProps && target.publicProps[propName]) {
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. To observe mutations of the public property "${propName}" you can define a public getter and setter decorated with @api in component ${target.name}.`);
            }
            else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                // Check for misspellings
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. Did you mean "${GlobalHTMLProperties[propName].attribute}"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            }
            else {
                // Attribute is not valid observable HTML Attribute
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            }
        });
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

let idx = 0;
let uid = 0;
const OwnerKey = Symbol('key');
function addInsertionIndex(vm) {
    assert.vm(vm);
    assert.invariant(vm.idx === 0, `${vm} is already locked to a previously generated idx.`);
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
    assert.vm(vm);
    assert.invariant(vm.idx > 0, `${vm} is not locked to a previously generated idx.`);
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
    assert.vnode(vnode);
    const { elm, Ctor } = vnode;
    assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    const def = getComponentDef(Ctor);
    console.log(`[object:vm ${def.name}] is being initialized.`);
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
    assert.block(function devModeCheck() {
        vm.toString = () => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    });
    vnode.vm = vm;
    // linking elm with VM before creating the instance
    elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    createComponent(vm, Ctor);
    linkComponent(vm);
    assert.block(function devModeCheck() {
        const { component: { attributeChangedCallback }, def: { observedAttrs } } = vm;
        if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
            console.warn(`${vm} has static observedAttributes set to ["${keys(observedAttrs).join('", "')}"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.`);
        }
    });
    return vm;
}
function relinkVM(vm, vnode) {
    assert.vm(vm);
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, `Only DOM elements can be linked to their corresponding component.`);
    assert.invariant(vm.component, `vm.component is required to be defined before ${vm} gets linked to ${vnode}.`);
    vnode.vm = vm;
    vm.vnode = vnode;
}
function rehydrate(vm) {
    assert.vm(vm);
    if (vm.idx && vm.isDirty) {
        const { vnode } = vm;
        assert.isTrue(vnode.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
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
    assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    const vms = rehydrateQueue.sort((a, b) => a.idx > b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        rehydrate(vms[i]);
    }
}
function scheduleRehydration(vm) {
    assert.vm(vm);
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}
function isNodeOwnedByVM(vm, node) {
    assert.vm(vm);
    assert.invariant(node instanceof Node, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
    assert.childNode(vm.vnode.elm, node, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${vm}`);
    // @ts-ignore
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    assert.vm(vm);
    assert.invariant(node instanceof Node, `isNodePassedToVM() should be called with a node as the second argument instead of ${node}`);
    assert.childNode(vm.vnode.elm, node, `isNodePassedToVM() should never be called with a node that is not a child node of ${vm}`);
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
    assert.vm(vm);
    const { shadowVNode: oldShadowVNode } = vm;
    const shadowVNode = createShadowRootVNode(vm.vnode.elm, children);
    vm.shadowVNode = patch(oldShadowVNode, shadowVNode);
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
    assert.invariant(vnode.elm, `${vnode}.elm should be ready.`);
    if (oldVnode.vm && oldVnode.Ctor === Ctor) {
        assert.invariant(vnode.elm === oldVnode.elm, `${vnode}.elm should always match the oldVnode's   element.`);
        relinkVM(oldVnode.vm, vnode);
    }
    else {
        createVM(vnode);
    }
    assert.invariant(vnode.vm.component, `vm ${vnode.vm} should have a component and element associated to it.`);
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
                    assert.fail(`Ignoring unknown public property "${key}" of ${vm}. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
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

function observeAttributes(oldVnode, vnode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { def: { observedAttrs } } = vm;
    if (observedAttrs.length === 0) {
        return; // nothing to observe
    }
    let { data: { attrs: oldAttrs } } = oldVnode;
    let { data: { attrs: newAttrs } } = vnode;
    if (oldAttrs === newAttrs || (isUndefined(oldAttrs) && isUndefined(newAttrs))) {
        return;
    }
    // infuse key-value pairs from _props into the component
    let key, cur;
    oldAttrs = oldAttrs || EmptyObject;
    newAttrs = newAttrs || EmptyObject;
    // removed props should be reset in component's props
    for (key in oldAttrs) {
        if (key in observedAttrs && !(key in newAttrs)) {
            invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], null);
        }
    }
    // new or different props should be set in component's props
    for (key in newAttrs) {
        if (key in observedAttrs) {
            cur = newAttrs[key];
            if (!(key in oldAttrs) || oldAttrs[key] != cur) {
                invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], cur);
            }
        }
    }
}
var componentAttrs = {
    create: observeAttributes,
    update: observeAttributes,
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
                assert.block(function devModeCheck() {
                    if (elm[key] === cur && old !== undefined) {
                        console.warn(`Unneccessary update of property "${key}" in ${elm}, it has the same value in ${vnode.vm || vnode}.`);
                    }
                });
                elm[key] = cur;
            }
        }
    }
}
var props = {
    create: update$2,
    update: update$2,
};

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
var hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
// export { h } from './h';
// export { thunk } from './thunk';
function init(modules, domApi) {
    var i$$1, j, cbs = {};
    var api = domApi !== undefined ? domApi : htmlDomApi;
    for (i$$1 = 0; i$$1 < hooks$1.length; ++i$$1) {
        cbs[hooks$1[i$$1]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks$1[i$$1]];
            if (hook !== undefined) {
                cbs[hooks$1[i$$1]].push(hook);
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

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;
const XCharCode = 120;
const { setAttribute: setAttribute$1, removeAttribute: removeAttribute$1, setAttributeNS } = Element.prototype;
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
    let key;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                setAttribute$1.call(elm, key, "");
            }
            else if (cur === false) {
                removeAttribute$1.call(elm, key);
            }
            else {
                if (key.charCodeAt(0) !== XCharCode) {
                    setAttribute$1.call(elm, key, cur);
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
                    setAttribute$1.call(elm, key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            removeAttribute$1.call(elm, key);
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
    componentAttrs,
    // from this point on, we do a series of DOM mutations
    eventListenersModule,
    componentClasses,
    props,
    attributesModule,
    classes,
    styleModule,
    eventListenersModule$1,
    uidModule,
]);

const { removeChild, appendChild, insertBefore, replaceChild } = Node.prototype;
const ConnectingSlot = Symbol();
const DisconnectingSlot = Symbol();
function callNodeSlot(node, slot) {
    assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
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
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element, Ctor) {
    if (isUndefined(Ctor)) {
        throw new TypeError(`Invalid Component Definition: ${Ctor}.`);
    }
    const tagName = element.tagName.toLowerCase();
    const vnode = c(tagName, Ctor, { className: element.className || undefined });
    vnode.isRoot = true;
    patch(element, vnode);
    // providing the hook to detect insertion and removal
    element[ConnectingSlot] = () => {
        insert(vnode);
    };
    element[DisconnectingSlot] = () => {
        forceDisconnection(vnode);
    };
}
// this could happen for two reasons:
// * it is a root, and was removed manually
// * the element was appended to another container which requires disconnection to happen first
function forceDisconnection(vnode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
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
    const element = document.createElement(tagName, Ctor ? null : options);
    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}

exports.createElement = createElement;
exports.getComponentDef = getComponentDef;
exports.Element = ComponentElement;
exports.register = register;
exports.unwrap = unwrap;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/** version: 0.15.1 */
