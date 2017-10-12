/*
 * Copyright (C) 2017 salesforce.com, inc.
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

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

var compareDocumentPosition = Node.prototype.compareDocumentPosition;
var DOCUMENT_POSITION_CONTAINS = Node.DOCUMENT_POSITION_CONTAINS;
var assert = {
    invariant: function (value, msg) {
        if (!value) {
            throw new Error("Invariant Violation: " + msg);
        }
    },
    isTrue: function (value, msg) {
        if (!value) {
            throw new Error("Assert Violation: " + msg);
        }
    },
    isFalse: function (value, msg) {
        if (value) {
            throw new Error("Assert Violation: " + msg);
        }
    },
    block: function (fn) {
        fn();
    },
    vnode: function (vnode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode, vnode + " is not a vnode.");
    },
    vm: function (vm) {
        assert.isTrue(vm && "component" in vm, vm + " is not a vm.");
    },
    fail: function (msg) {
        throw new Error(msg);
    },
    logError: function (msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            console.error(e);
        }
    },
    logWarning: function (msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            console.warn(e);
        }
    },
    childNode: function (container, node, msg) {
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || node + " must be a child node of " + container);
    }
};

var freeze = Object.freeze;
var seal = Object.seal;
var keys = Object.keys;
var create = Object.create;
var assign = Object.assign;
var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;
var hasOwnProperty = Object.hasOwnProperty;
var preventExtensions = Object.preventExtensions;
var isExtensible = Object.isExtensible;
var isArray = Array.isArray;
var _a$2 = Array.prototype;
var ArrayFilter = _a$2.filter;
var ArraySlice = _a$2.slice;
var ArraySplice = _a$2.splice;
var ArrayIndexOf = _a$2.indexOf;
var ArrayPush = _a$2.push;
var ArrayMap = _a$2.map;
var forEach = _a$2.forEach;
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

var OtS = {}.toString;
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
var HTMLPropertyNamesWithLowercasedReflectiveAttributes = [
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
var GlobalHTMLProperties = {
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
        error: "Using property \"className\" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property \"classList\".",
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
        error: "Using property or attribute \"style\" is an anti-pattern. Instead use property \"classList\".",
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
        error: "Using property or attribute \"slot\" is an anti-pattern."
    }
};
// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element
// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

var topLevelContextSymbol = Symbol('Top Level Context');
var currentContext = {};
currentContext[topLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

function insert(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm;
    assert.vm(vm);
    if (vm.idx > 0) {
        assert.isTrue(vnode.isRoot, vm + " is already inserted.");
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
    var vm = vnode.vm;
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
    var vm = vnode.vm;
    assert.vm(vm);
    assert.isTrue(vm.idx, vm + " is not inserted.");
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    clearListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use realm custom elements, we can remove this.
    patchShadowRoot(vm, []);
}
var lifeCycleHooks = {
    insert: insert,
    update: update,
    destroy: destroy,
};

var nextTickCallbackQueue = [];
var SPACE_CHAR = 32;
var EmptyObject = seal(create(null));
var EmptyArray = seal([]);
function flushCallbackQueue() {
    assert.invariant(nextTickCallbackQueue.length, "If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of " + nextTickCallbackQueue + ".");
    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (var i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}
function addCallbackToNextTick(callback) {
    assert.isTrue(isFunction(callback), "addCallbackToNextTick() can only accept a function callback as first argument instead of " + callback);
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    // TODO: eventually, we might want to have priority when inserting callbacks
    ArrayPush.call(nextTickCallbackQueue, callback);
}
var CAMEL_REGEX = /-([a-z])/g;
var attrNameToPropNameMap = create(null);
function getPropNameFromAttrName(attrName) {
    var propName = attrNameToPropNameMap[attrName];
    if (!propName) {
        propName = attrName.replace(CAMEL_REGEX, function (g) { return g[1].toUpperCase(); });
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}
var CAPS_REGEX = /[A-Z]/g;
/**
 * This dictionary contains the mapping between property names
 * and the corresponding attribute name. This helps to trigger observable attributes.
 */
var propNameToAttributeNameMap = {
    // these are exceptions to the rule that cannot be inferred via `CAPS_REGEX`
    className: 'class',
    htmlFor: 'for',
};
// Few more exceptions where the attribute name matches the property in lowercase.
HTMLPropertyNamesWithLowercasedReflectiveAttributes.forEach(function (propName) {
    propNameToAttributeNameMap[propName] = propName.toLowerCase();
});
function getAttrNameFromPropName(propName) {
    var attrName = propNameToAttributeNameMap[propName];
    if (!attrName) {
        attrName = propName.replace(CAPS_REGEX, function (match) { return '-' + match.toLowerCase(); });
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
var classNameToClassMap = create(null);
function getMapFromClassName(className) {
    var map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    var start = 0;
    var i, len = className.length;
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
    assert.block(function () {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    });
    return map;
}

var CHAR_S = 115;
var CHAR_V = 118;
var CHAR_G = 103;
var EmptyData = create(null);
var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
var SymbolIterator = Symbol.iterator;
function addNS(data, children, sel) {
    data.ns = NamespaceAttributeForSVG;
    if (isUndefined(children) || sel === 'foreignObject') {
        return;
    }
    var len = children.length;
    for (var i_1 = 0; i_1 < len; ++i_1) {
        var child = children[i_1];
        var data_1 = child.data;
        if (data_1 !== undefined) {
            var grandChildren = child.children;
            addNS(data_1, grandChildren, child.sel);
        }
    }
}
// [v]node node
function v(sel, data, children, text, elm, Ctor) {
    data = data || EmptyData;
    var key = data.key;
    // Try to identify the owner, but for root elements and other special cases, we
    // can just fallback to 0 which means top level creation.
    var uid = vmBeingRendered ? vmBeingRendered.uid : 0;
    var vnode = { sel: sel, data: data, children: children, text: text, elm: elm, key: key, Ctor: Ctor, uid: uid };
    assert.block(function devModeCheck() {
        // adding toString to all vnodes for debuggability
        vnode.toString = function () { return "[object:vnode " + sel + "]"; };
    });
    return vnode;
}
// [h]tml node
function h(sel, data, children) {
    assert.isTrue(isString(sel), "h() 1st argument sel must be a string.");
    assert.isTrue(isObject(data), "h() 2nd argument data must be an object.");
    assert.isTrue(isArray(children), "h() 3rd argument children must be an array.");
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling h().");
    var classMap = data.classMap, className = data.className, style = data.style, styleMap = data.styleMap;
    assert.isFalse(className && classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");
    assert.block(function devModeCheck() {
        if (style && !isString(style)) {
            assert.logWarning("Invalid 'style' attribute passed to <" + sel + "> should be a string value, and will be ignored.");
        }
    });
    data.style = styleMap || (style && style + '');
    assert.block(function devModeCheck() {
        children.forEach(function (vnode) {
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
    assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
    assert.isTrue(isFunction(Ctor), "c() 2nd argument Ctor must be a function.");
    assert.isTrue(isObject(data), "c() 3nd argument data must be an object.");
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling c().");
    var key = data.key, slotset = data.slotset, styleMap = data.styleMap, style = data.style, attrs = data.attrs, on = data.on, className = data.className, classMap = data.classMap, _props = data.props;
    assert.isTrue(arguments.length < 4, "Compiler Issue: Custom elements expect up to 3 arguments, received " + arguments.length + " instead.");
    data = { hook: lifeCycleHooks, key: key, slotset: slotset, attrs: attrs, on: on, _props: _props };
    assert.isFalse(className && classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");
    assert.block(function devModeCheck() {
        if (style && !isString(style)) {
            assert.logWarning("Invalid 'style' attribute passed to <" + sel + "> should be a string value, and will be ignored.");
        }
    });
    data.style = styleMap || (style && style + '');
    return v(sel, data, EmptyArray, undefined, undefined, Ctor);
}
// [i]terable node
function i(iterable, factory) {
    var list = [];
    if (isUndefined(iterable) || iterable === null) {
        assert.logWarning("Invalid template iteration for value \"" + iterable + "\" in " + vmBeingRendered + ", it should be an Array or an iterable Object.");
        return list;
    }
    assert.isFalse(isUndefined(iterable[SymbolIterator]), "Invalid template iteration for value `" + iterable + "` in " + vmBeingRendered + ", it requires an array-like object, not `null` or `undefined`.");
    var iterator = iterable[SymbolIterator]();
    assert.isTrue(iterator && isFunction(iterator.next), "Invalid iterator function for \"" + iterable + "\" in " + vmBeingRendered + ".");
    var next = iterator.next();
    var i = 0;
    var value = next.value, last = next.done;
    var _loop_1 = function () {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;
        // template factory logic based on the previous collected value
        var vnode = factory(value, i, i === 0, last);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        }
        else {
            ArrayPush.call(list, vnode);
        }
        assert.block(function devModeCheck() {
            var vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach(function (vnode) {
                if (vnode && isObject(vnode) && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning("Missing \"key\" attribute in iteration with child \"" + toString$1(vnode.Ctor.name) + "\", index " + i + ". Instead set a unique \"key\" attribute value on all iteration children so internal state can be preserved during rehydration.");
                }
            });
        });
        // preparing next value
        i += 1;
        value = next.value;
    };
    while (last === false) {
        _loop_1();
    }
    return list;
}
/**
 * [f]lattening
 */
function f(items) {
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    var len = items.length;
    var flattened = [];
    for (var i_2 = 0; i_2 < len; i_2 += 1) {
        var item = items[i_2];
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

var EmptySlots = create(null);
function getSlotsetValue(slotset, slotName) {
    assert.isTrue(isObject(slotset), "Invalid slotset value " + toString$1(slotset));
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}
var slotsetProxyHandler = {
    get: function (slotset, key) { return getSlotsetValue(slotset, key); },
    set: function () {
        assert.logError("$slotset object cannot be mutated from template.");
        return false;
    },
    deleteProperty: function () {
        assert.logError("$slotset object cannot be mutated from template.");
        return false;
    },
    apply: function () {
        assert.fail("invalid call invocation from slotset");
    },
    construct: function () {
        assert.fail("invalid construction invocation from slotset");
    },
};
function validateSlots(vm, html) {
    var _a = vm.cmpSlots, cmpSlots = _a === void 0 ? EmptySlots : _a;
    var _b = html.slots, slots = _b === void 0 ? [] : _b;
    for (var slotName in cmpSlots) {
        if (ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: this should never really happen because the compiler should always validate
            console.warn("Ignoring unknown provided slot name \"" + slotName + "\" in " + vm + ". This is probably a typo on the slot attribute.");
        }
    }
}
function validateFields(vm, html) {
    var component = vm.component;
    // validating identifiers used by template that should be provided by the component
    var _a = html.ids, ids = _a === void 0 ? [] : _a;
    ids.forEach(function (propName) {
        if (!(propName in component)) {
            console.warn("The template rendered by " + vm + " references `this." + propName + "`, which is not declared. This is likely a typo in the template.");
        }
        else if (hasOwnProperty.call(component, propName)) {
            assert.fail(component + "'s template is accessing `this." + toString$1(propName) + "` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to `this.state." + toString$1(propName) + "`.");
        }
    });
}
function validateTemplate(vm, html) {
    validateSlots(vm, html);
    validateFields(vm, html);
}
function evaluateTemplate(vm, html) {
    assert.vm(vm);
    assert.isTrue(isFunction(html), "evaluateTemplate() second argument must be a function instead of " + html);
    // TODO: add identity to the html functions
    var component = vm.component, context = vm.context, _a = vm.cmpSlots, cmpSlots = _a === void 0 ? EmptySlots : _a, cmpTemplate = vm.cmpTemplate;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        context.tplCache = create(null);
        vm.cmpTemplate = html;
        assert.block(function devModeCheck() {
            validateTemplate(vm, html);
        });
    }
    assert.isTrue(isObject(context.tplCache), "vm.context.tplCache must be an object associated to " + cmpTemplate + ".");
    var _b = Proxy.revocable(cmpSlots, slotsetProxyHandler), slotset = _b.proxy, slotsetRevoke = _b.revoke;
    var vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    assert.invariant(isArray(vnodes), "Compiler should produce html functions that always return an array.");
    slotsetRevoke();
    return vnodes;
}

var isRendering = false;
var vmBeingRendered = null;
function invokeComponentCallback(vm, fn, fnCtx, args) {
    var context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var result, error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(fnCtx, args);
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result;
}
function invokeComponentMethod(vm, methodName, args) {
    var component = vm.component;
    return invokeComponentCallback(vm, component[methodName], component, args);
}
function invokeComponentConstructor(vm, Ctor) {
    var context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var component, error;
    try {
        component = new Ctor();
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return component;
}
function invokeComponentRenderMethod(vm) {
    var component = vm.component, context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var isRenderingInception = isRendering;
    var vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    var result, error;
    try {
        var html = component.render();
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        }
        else if (!isUndefined(html)) {
            assert.fail("The template rendered by " + vm + " must return an imported template tag (e.g.: `import html from \"./mytemplate.html\"`) or undefined, instead, it has returned " + html + ".");
        }
    }
    catch (e) {
        error = e;
    }
    isRendering = isRenderingInception;
    vmBeingRendered = vmBeingRenderedInception;
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result || [];
}
function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    var component = vm.component, context = vm.context;
    var attributeChangedCallback = component.attributeChangedCallback;
    if (isUndefined(attributeChangedCallback)) {
        return;
    }
    var ctx = currentContext;
    establishContext(context);
    var error;
    try {
        component.attributeChangedCallback(attrName, toAttributeValue(oldValue), toAttributeValue(newValue));
    }
    catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

var hooks = ['wiring', 'rehydrated', 'connected', 'disconnected', 'piercing'];
/* eslint-enable */
var Services = create(null);
function register(service) {
    assert.isTrue(isObject(service), "Invalid service declaration, " + service + ": service must be an object");
    for (var i = 0; i < hooks.length; ++i) {
        var hookName = hooks[i];
        if (hookName in service) {
            var l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            l.push(service[hookName]);
        }
    }
}
function invokeServiceHook(vm, cbs) {
    assert.vm(vm);
    assert.isTrue(isArray(cbs) && cbs.length > 0, "Optimize invokeServiceHook() to be invoked only when needed");
    var component = vm.component, data = vm.vnode.data, def = vm.def, context = vm.context;
    for (var i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

/*eslint-enable*/
var TargetSlot = Symbol();
var MembraneSlot = Symbol();
function isReplicable(value) {
    var type = typeof value;
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
    assert.isTrue(membrane instanceof Membrane, "getReplica() first argument must be a membrane.");
    var cells = membrane.cells;
    var r = cells.get(value);
    if (r) {
        return r;
    }
    var replica = new Proxy(value, membrane); // eslint-disable-line no-undef
    cells.set(value, replica);
    return replica;
}
var Membrane = (function () {
    function Membrane(handler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    Membrane.prototype.get = function (target, key) {
        if (key === TargetSlot) {
            return target;
        }
        else if (key === MembraneSlot) {
            return this;
        }
        return this.handler.get(this, target, key);
    };
    Membrane.prototype.set = function (target, key, newValue) {
        return this.handler.set(this, target, key, newValue);
    };
    Membrane.prototype.deleteProperty = function (target, key) {
        if (key === TargetSlot) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    };
    Membrane.prototype.apply = function (target, thisArg, argumentsList) {
        thisArg = unwrap(thisArg);
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    };
    Membrane.prototype.construct = function (target, argumentsList, newTarget) {
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    };
    return Membrane;
}());
// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
var getKey = Proxy.getKey;
var unwrap = getKey ?
    function (replicaOrAny) { return (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny; }
    : function (replicaOrAny) { return (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny; };

/* eslint-enable */
function piercingHook(membrane, target, key, value) {
    var vm = membrane.handler.vm;
    assert.vm(vm);
    var piercing = Services.piercing;
    if (piercing) {
        var component = vm.component, data = vm.vnode.data, def = vm.def, context = vm.context;
        var result_1 = value;
        var next_1 = true;
        var callback = function (newValue) {
            next_1 = false;
            result_1 = newValue;
        };
        for (var i = 0, len = piercing.length; next_1 && i < len; ++i) {
            piercing[i].call(undefined, component, data, def, context, target, key, value, callback);
        }
        return result_1 === value ? getReplica(membrane, result_1) : result_1;
    }
}
var PiercingMembraneHandler = (function () {
    function PiercingMembraneHandler(vm) {
        assert.vm(vm);
        this.vm = vm;
    }
    PiercingMembraneHandler.prototype.get = function (membrane, target, key) {
        if (key === OwnerKey) {
            return undefined;
        }
        var value = target[key];
        return piercingHook(membrane, target, key, value);
    };
    PiercingMembraneHandler.prototype.set = function (membrane, target, key, newValue) {
        target[key] = newValue;
        return true;
    };
    PiercingMembraneHandler.prototype.deleteProperty = function (membrane, target, key) {
        delete target[key];
        return true;
    };
    PiercingMembraneHandler.prototype.apply = function (membrane, targetFn, thisArg, argumentsList) {
        return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
    };
    PiercingMembraneHandler.prototype.construct = function (membrane, targetFn, argumentsList, newTarget) {
        assert.isTrue(newTarget, "construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.");
        return getReplica(membrane, new (targetFn.bind.apply(targetFn, [void 0].concat(argumentsList)))());
    };
    return PiercingMembraneHandler;
}());
function pierce(vm, value) {
    assert.vm(vm);
    var membrane = vm.membrane;
    if (!membrane) {
        var handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}

/*eslint-enable*/
var vmBeingConstructed = null;
function isBeingConstructed(vm) {
    assert.vm(vm);
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    assert.vm(vm);
    // create the component instance
    var vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    var component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
    assert.isTrue(vm.component === component, "Invalid construction for " + vm + ", maybe you are missing the call to super() on classes extending Element.");
}
function linkComponent(vm) {
    assert.vm(vm);
    // wiring service
    var wire = vm.def.wire;
    if (wire) {
        var wiring = Services.wiring;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}
function clearListeners(vm) {
    assert.vm(vm);
    var deps = vm.deps;
    var len = deps.length;
    if (len) {
        for (var i = 0; i < len; i += 1) {
            var set = deps[i];
            var pos = ArrayIndexOf.call(deps[i], vm);
            assert.invariant(pos > -1, "when clearing up deps, the vm must be part of the collection.");
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
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by adding a new event listener for \"" + eventName + "\".");
    var cmpEvents = vm.cmpEvents, cmpListener = vm.cmpListener, vmIdx = vm.idx;
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
            var elm = vm.vnode.elm;
            elm.addEventListener(eventName, cmpListener, false);
        }
    }
    assert.block(function devModeCheck() {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            assert.logWarning(vm + " has duplicate listeners for event \"" + eventName + "\". Instead add the event listener in the connectedCallback() hook.");
        }
    });
    ArrayPush.call(cmpEvents[eventName], newHandler);
}
function removeComponentEventListener(vm, eventName, oldHandler) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by removing an event listener for \"" + eventName + "\".");
    var cmpEvents = vm.cmpEvents;
    if (cmpEvents) {
        var handlers = cmpEvents[eventName];
        var pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            return;
        }
    }
    assert.block(function devModeCheck() {
        assert.logWarning("Did not find event listener " + oldHandler + " for event \"" + eventName + "\" on " + vm + ". Instead only remove an event listener once.");
    });
}
function dispatchComponentEvent(vm, event) {
    assert.vm(vm);
    assert.invariant(event instanceof Event, "dispatchComponentEvent() must receive an event instead of " + event);
    var cmpEvents = vm.cmpEvents, component = vm.component;
    var type = event.type;
    assert.invariant(cmpEvents && cmpEvents[type] && cmpEvents[type].length, "dispatchComponentEvent() should only be invoked if there is at least one listener in queue for " + type + " on " + vm + ".");
    var handlers = cmpEvents[type];
    var uninterrupted = true;
    var stopImmediatePropagation = event.stopImmediatePropagation;
    event.stopImmediatePropagation = function () {
        uninterrupted = false;
        stopImmediatePropagation.call(this);
    };
    var e = pierce(vm, event);
    for (var i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, handlers[i], component, [e]);
    }
    // restoring original methods
    event.stopImmediatePropagation = stopImmediatePropagation;
}
function addComponentSlot(vm, slotName, newValue) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    assert.isTrue(isArray(newValue) && newValue.length > 0, "Slots can only be set to a non-empty array, instead received " + toString$1(newValue) + " for slot " + slotName + " in " + vm + ".");
    var cmpSlots = vm.cmpSlots;
    var oldValue = cmpSlots && cmpSlots[slotName];
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
        console.log("Marking " + vm + " as dirty: a new value for slot \"" + slotName + "\" was added.");
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function removeComponentSlot(vm, slotName) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    var cmpSlots = vm.cmpSlots;
    if (cmpSlots && cmpSlots[slotName]) {
        cmpSlots[slotName] = undefined; // delete will de-opt the cmpSlots, better to set it to undefined
        console.log("Marking " + vm + " as dirty: the value of slot \"" + slotName + "\" was removed.");
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}
function renderComponent(vm) {
    assert.vm(vm);
    assert.invariant(vm.isDirty, vm + " is not dirty.");
    console.log(vm + " is being updated.");
    clearListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    assert.invariant(isArray(vnodes), vm + ".render() should always return an array of vnodes instead of " + vnodes);
    var rehydrated = Services.rehydrated;
    if (rehydrated) {
        addCallbackToNextTick(function () { return invokeServiceHook(vm, rehydrated); });
    }
    return vnodes;
}
function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, "markComponentAsDirty() for " + vm + " should not be called when the componet is already dirty.");
    assert.isFalse(isRendering, "markComponentAsDirty() for " + vm + " cannot be called during rendering of " + vmBeingRendered + ".");
    vm.isDirty = true;
}

var TargetToReactiveRecordMap = new WeakMap();
function notifyListeners(target, key) {
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (reactiveRecord) {
        var value = reactiveRecord[key];
        if (value) {
            var len = value.length;
            for (var i = 0; i < len; i += 1) {
                var vm = value[i];
                assert.vm(vm);
                console.log("Marking " + vm + " as dirty: property \"" + toString$1(key) + "\" of " + toString$1(target) + " was set to a new value.");
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log("Scheduling " + vm + " for rehydration due to mutation.");
                    scheduleRehydration(vm);
                }
            }
        }
    }
}
function subscribeToSetHook(vm, target, key) {
    assert.vm(vm);
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        var newRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    var value = reactiveRecord[key];
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
var ReactiveMap = new WeakMap();
var ObjectDotPrototype = Object.prototype;
function lockShadowTarget(shadowTarget, originalTarget) {
    var targetKeys = getOwnPropertyNames(originalTarget);
    targetKeys.forEach(function (key) {
        var descriptor = getOwnPropertyDescriptor(originalTarget, key);
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
    var proto = getPrototypeOf(value);
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
var ReactiveProxyHandler = (function () {
    function ReactiveProxyHandler(value) {
        this.originalTarget = value;
    }
    ReactiveProxyHandler.prototype.get = function (shadowTarget, key) {
        if (key === MembraneSlot) {
            return this;
        }
        var originalTarget = this.originalTarget;
        if (key === TargetSlot) {
            return originalTarget;
        }
        var value = originalTarget[key];
        if (isRendering && vmBeingRendered) {
            subscribeToSetHook(vmBeingRendered, originalTarget, key); // eslint-disable-line no-undef
        }
        var observable = isObservable(value);
        assert.block(function devModeCheck() {
            if (!observable && isObject(value)) {
                if (isRendering) {
                    assert.logWarning("Rendering a non-reactive value " + value + " from member property " + key + " of " + vmBeingRendered + " is not common because mutations on that value will not re-render the template.");
                }
                else {
                    assert.logWarning("Returning a non-reactive value " + value + " to member property " + key + " of " + originalTarget + " is not common because mutations on that value cannot be observed.");
                }
            }
        });
        return observable ? getReactiveProxy(value) : value;
    };
    ReactiveProxyHandler.prototype.set = function (shadowTarget, key, value) {
        var originalTarget = this.originalTarget;
        if (isRendering) {
            assert.logError("Setting property \"" + toString$1(key) + "\" of " + toString$1(shadowTarget) + " during the rendering process of " + vmBeingRendered + " is invalid. The render phase must have no side effects on the state of any component.");
            return false;
        }
        var oldValue = originalTarget[key];
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
    };
    ReactiveProxyHandler.prototype.deleteProperty = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        delete originalTarget[key];
        notifyListeners(originalTarget, key);
        return true;
    };
    ReactiveProxyHandler.prototype.apply = function (target /*, thisArg: any, argArray?: any*/) {
        assert.fail("invalid call invocation for property proxy " + target);
    };
    ReactiveProxyHandler.prototype.construct = function (target, argArray, newTarget) {
        assert.fail("invalid construction invocation for property proxy " + target);
    };
    ReactiveProxyHandler.prototype.has = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        return key in originalTarget;
    };
    ReactiveProxyHandler.prototype.ownKeys = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return getOwnPropertyNames(originalTarget);
    };
    ReactiveProxyHandler.prototype.isExtensible = function (shadowTarget) {
        var shadowIsExtensible = isExtensible(shadowTarget);
        if (!shadowIsExtensible) {
            return shadowIsExtensible;
        }
        var originalTarget = this.originalTarget;
        var targetIsExtensible = isExtensible(originalTarget);
        if (!targetIsExtensible) {
            lockShadowTarget(shadowTarget, originalTarget);
        }
        return targetIsExtensible;
    };
    ReactiveProxyHandler.prototype.setPrototypeOf = function (shadowTarget, prototype) {
        assert.fail("Invalid setPrototypeOf invocation for reactive proxy " + this.originalTarget + ". Prototype of reactive objects cannot be changed.");
    };
    ReactiveProxyHandler.prototype.getPrototypeOf = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return getPrototypeOf(originalTarget);
    };
    ReactiveProxyHandler.prototype.getOwnPropertyDescriptor = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        var desc = getOwnPropertyDescriptor(originalTarget, key);
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
    };
    ReactiveProxyHandler.prototype.preventExtensions = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        lockShadowTarget(shadowTarget, originalTarget);
        preventExtensions(originalTarget);
        return true;
    };
    ReactiveProxyHandler.prototype.defineProperty = function (shadowTarget, key, descriptor) {
        var originalTarget = this.originalTarget;
        var configurable = descriptor.configurable;
        var unwrappedDescriptor = unwrapDescriptor(descriptor);
        if (configurable === false) {
            defineProperty(shadowTarget, key, unwrappedDescriptor);
        }
        defineProperty(originalTarget, key, unwrappedDescriptor);
        return true;
    };
    return ReactiveProxyHandler;
}());
function getReactiveProxy(value) {
    assert.isTrue(isObservable(value), "perf-optimization: avoid calling this method with non-observable values.");
    value = unwrap(value);
    var proxy = ReactiveMap.get(value);
    if (proxy) {
        return proxy;
    }
    var handler = new ReactiveProxyHandler(value);
    var shadowTarget = isArray(value) ? [] : {};
    proxy = new Proxy(shadowTarget, handler);
    ReactiveMap.set(value, proxy);
    return proxy;
}

// TODO: how to allow symbols as property keys?
function createTrackedPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get: function () {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpTrack[key];
        },
        set: function (newValue) {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + key);
            var observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;
            if (newValue !== vm.cmpTrack[key]) {
                assert.block(function devModeCheck() {
                    if (!observable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning("Property \"" + key + "\" of " + vm + " is set to a non-trackable object, which means changes into that object cannot be observed.");
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

var vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    assert.vm(vm);
    vmBeingUpdated = vm;
}
// TODO: how to allow symbols as property keys?
function createPublicPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get: function () {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isBeingConstructed(vm)) {
                assert.logError(vm + " constructor should not read the value of property \"" + key + "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties.");
                return;
            }
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpProps[key];
        },
        set: function (newValue) {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + key);
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
                var observable_1 = isObservable(newValue);
                newValue = observable_1 ? getReactiveProxy(newValue) : newValue;
                assert.block(function devModeCheck() {
                    if (!observable_1 && isObject(newValue)) {
                        assert.logWarning("Assigning a non-reactive value " + newValue + " to member property " + key + " of " + vm + " is not common because mutations on that value cannot be observed.");
                    }
                });
                vm.cmpProps[key] = newValue;
            }
            else {
                assert.logError(vm + " can only set a new value for property \"" + key + "\" during construction.");
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
    });
}
function createPublicAccessorDescriptor(proto, key, descriptor) {
    var _a = descriptor || EmptyObject, get = _a.get, set = _a.set, enumerable = _a.enumerable;
    defineProperty(proto, key, {
        get: function () {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            if (get) {
                return get.call(this);
            }
        },
        set: function (newValue) {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            if (!isBeingConstructed(vm) && vmBeingUpdated !== vm) {
                assert.logError(vm + " can only set a new value for property \"" + key + "\" during construction.");
                return;
            }
            vmBeingUpdated = null; // releasing the lock
            if (set) {
                set.call(this, newValue);
            }
            else {
                assert.fail("Invalid attempt to set a new value for property " + key + " of " + vm + " that does not has a setter.");
            }
        },
        enumerable: enumerable,
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
    add: function () {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        var elm = getLinkedElement$1(this);
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        forEach.call(arguments, function (className) {
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
    remove: function () {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses, vnode = vm.vnode;
        var elm = getLinkedElement$1(this);
        // Remove specified class values.
        forEach.call(arguments, function (className) {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                // this is not only an optimization, it is also needed to avoid removing the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx || vnode.isRoot) {
                    // we intentionally make a sync mutation here when needed and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    var ownerClass = vnode.data.class;
                    // This is only needed if the owner is not forcing that class to be present in case of conflicts.
                    if (isUndefined(ownerClass) || !ownerClass[className]) {
                        elm.classList.remove(className);
                    }
                }
            }
        });
    },
    item: function (index) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        // Return class value by index in collection.
        return getOwnPropertyNames(cmpClasses)
            .filter(function (className) { return cmpClasses[className + '']; })[index] || null;
    },
    toggle: function (className, force) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
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
    contains: function (className) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        // Checks if specified class value exists in class attribute of the element.
        return !!cmpClasses[className];
    },
    toString: function () {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        return getOwnPropertyNames(cmpClasses).filter(function (className) { return cmpClasses[className + '']; }).join(' ');
    }
};

var _a$3 = Element.prototype;
var querySelector = _a$3.querySelector;
var querySelectorAll = _a$3.querySelectorAll;
function getLinkedElement$2(root) {
    return root[ViewModelReflection].vnode.elm;
}
function shadowRootQuerySelector(shadowRoot, selector) {
    var vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), "this.root.querySelector() cannot be called during the construction of the custom element for " + this + " because no content has been rendered yet.");
    var elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    var querySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return querySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    var vm = shadowRoot[ViewModelReflection];
    assert.isFalse(isBeingConstructed(vm), "this.root.querySelectorAll() cannot be called during the construction of the custom element for " + this + " because no content has been rendered yet.");
    var elm = getLinkedElement$2(shadowRoot);
    pierce(vm, elm);
    var querySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
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
    querySelector: function (selector) {
        var _this = this;
        var node = shadowRootQuerySelector(this, selector);
        assert.block(function () {
            var vm = _this[ViewModelReflection];
            if (!node && vm.component.querySelector(selector)) {
                assert.logWarning("this.root.querySelector() can only return elements from the template declaration of " + vm.component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.");
            }
        });
        return node;
    },
    querySelectorAll: function (selector) {
        var _this = this;
        var nodeList = shadowRootQuerySelectorAll(this, selector);
        assert.block(function () {
            var vm = _this[ViewModelReflection];
            if (nodeList.length === 0 && vm.component.querySelectorAll(selector).length) {
                assert.logWarning("this.root.querySelectorAll() can only return elements from template declaration of " + vm.component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.");
            }
        });
        return nodeList;
    },
    toString: function () {
        var vm = this[ViewModelReflection];
        return "Current ShadowRoot for " + vm.component;
    }
};
function getFirstMatch(vm, elm, selector) {
    var nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (var i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(vm, nodeList[i]);
        }
    }
    return null;
}
function getAllMatches(vm, elm, selector) {
    var nodeList = querySelectorAll.call(elm, selector);
    var filteredNodes = ArrayFilter.call(nodeList, function (node) { return isNodeOwnedByVM(vm, node); });
    return pierce(vm, filteredNodes);
}
function isParentNodeKeyword(key) {
    return (key === 'parentNode' || key === 'parentElement');
}
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing: function (component, data, def, context, target, key, value, callback) {
        var vm = component[ViewModelReflection];
        var elm = vm.vnode.elm; // eslint-disable-line no-undef
        if (value) {
            if (value === querySelector) {
                // TODO: it is possible that they invoke the querySelector() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback(function (selector) { return getFirstMatch(vm, target, selector); });
            }
            if (value === querySelectorAll) {
                // TODO: it is possible that they invoke the querySelectorAll() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback(function (selector) { return getAllMatches(vm, target, selector); });
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
    var elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
function ComponentElement() {
    assert.vm(vmBeingConstructed);
    assert.vnode(vmBeingConstructed.vnode);
    var vnode = vmBeingConstructed.vnode;
    assert.invariant(vnode.elm instanceof HTMLElement, "Component creation requires a DOM element to be associated to " + vnode + ".");
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
    dispatchEvent: function (event) {
        var _this = this;
        var elm = getLinkedElement(this);
        assert.block(function () {
            var evtName = event.type;
            var vm = _this[ViewModelReflection];
            assert.isFalse(isBeingConstructed(vm), "this.dispatchEvent() should not be called during the construction of the custom element for " + _this + " because no one is listening for the event \"" + evtName + "\" just yet.");
            if (vm.idx === 0) {
                assert.logWarning("Unreachable event \"" + evtName + "\" dispatched from disconnected element " + _this + ". Events can only reach the parent element after the element is connected(via connectedCallback) and before the element is disconnected(via disconnectedCallback).");
            }
            if (!evtName.match(/^[a-z]+$/)) {
                assert.logWarning("Invalid event type:" + evtName + " dispatched in element " + _this + ". Event name should only contain lowercase alphabetic characters");
            }
        });
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener: function (type, listener) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning("this.addEventListener() on " + vm + " does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.");
            }
        });
        addComponentEventListener(vm, type, listener);
    },
    removeEventListener: function (type, listener) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                assert.logWarning("this.removeEventListener() on " + vm + " does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.");
            }
        });
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute: function (attrName) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var attrs = vm.vnode.data.attrs;
        if (!attrName) {
            if (arguments.length === 0) {
                throw new TypeError("Failed to execute `getAttribute` on " + vm + ": 1 argument is required, got 0.");
            }
            return null;
        }
        // logging errors for experimentals and special attributes
        assert.block(function devModeCheck() {
            var propName = getPropNameFromAttrName(attrName);
            var publicPropsConfig = vm.def.props;
            if (publicPropsConfig[propName]) {
                throw new ReferenceError("Attribute \"" + attrName + "\" corresponds to public property " + propName + " from " + vm + ". Instead use `this." + propName + "`. Only use `getAttribute()` to access global HTML attributes.");
            }
            else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _a = GlobalHTMLProperties[propName], error = _a.error, experimental = _a.experimental;
                if (error) {
                    console.error(error);
                }
                else if (experimental) {
                    console.error("Attribute `" + attrName + "` is an experimental attribute that is not standardized or supported by all browsers. Property \"" + propName + "\" and attribute \"" + attrName + "\" are ignored.");
                }
            }
        });
        // normalizing attrs from compiler into HTML global attributes
        var raw = attrs && attrName in attrs ? attrs[attrName] : null;
        return toAttributeValue(raw);
    },
    getBoundingClientRect: function () {
        var elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), "this.getBoundingClientRect() should not be called during the construction of the custom element for " + this + " because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.");
        return elm.getBoundingClientRect();
    },
    querySelector: function (selectors) {
        var _this = this;
        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.querySelector() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        var nodeList = querySelectorAllFromComponent(this, selectors);
        for (var i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        assert.block(function () {
            if (shadowRootQuerySelector(_this.root, selectors)) {
                assert.logWarning("this.querySelector() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.");
            }
        });
        return null;
    },
    querySelectorAll: function (selectors) {
        var _this = this;
        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.querySelectorAll() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        var nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        var filteredNodes = ArrayFilter.call(nodeList, function (node) { return wasNodePassedIntoVM(vm, node); });
        assert.block(function () {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(_this.root, selectors).length) {
                assert.logWarning("this.querySelectorAll() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.");
            }
        });
        return pierce(vm, filteredNodes);
    },
    get tagName() {
        var elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get tabIndex() {
        var elm = getLinkedElement(this);
        return elm.tabIndex;
    },
    set tabIndex(value) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.isFalse(isRendering, "Setting property \"tabIndex\" of " + toString(value) + " during the rendering process of " + vmBeingRendered + " is invalid. The render phase must have no side effects on the state of any component.");
        if (isBeingConstructed(vm)) {
            assert.fail("Setting property \"tabIndex\" during the construction process of " + vm + " is invalid.");
            return;
        }
        var elm = getLinkedElement(this);
        elm.tabIndex = value;
    },
    get classList() {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var classListObj = vm.classListObj;
        // lazy creation of the ClassList Object the first time it is accessed.
        if (isUndefined(classListObj)) {
            vm.cmpClasses = {};
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    },
    get root() {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var cmpRoot = vm.cmpRoot;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    get state() {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var cmpState = vm.cmpState;
        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getReactiveProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        if (isArray(newState) || !isObservable(newState)) {
            assert.fail(vm + " failed to set new state to " + newState + ". `this.state` can only be set to an observable object.");
            return;
        }
        vm.cmpState = getReactiveProxy(newState); // lazy creation of the cmpState
    },
    toString: function () {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var _a = vm.vnode, sel = _a.sel, attrs = _a.data.attrs;
        var is = attrs && attrs.is;
        return "<" + sel + (is ? ' is="${is}' : '') + ">";
    },
};
// Global HTML Attributes
assert.block(function devModeCheck() {
    getOwnPropertyNames(GlobalHTMLProperties).forEach(function (propName) {
        if (propName in ComponentElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function () {
                var vm = this[ViewModelReflection];
                assert.vm(vm);
                var _a = GlobalHTMLProperties[propName], error = _a.error, attribute = _a.attribute, readOnly = _a.readOnly, experimental = _a.experimental;
                var msg = [];
                msg.push("Accessing the global HTML property \"" + propName + "\" in " + vm + " is disabled.");
                if (error) {
                    msg.push(error);
                }
                else {
                    if (experimental) {
                        msg.push("This is an experimental property that is not standardized or supported by all browsers. Property \"" + propName + "\" and attribute \"" + attribute + "\" are ignored.");
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push("Property is read-only.");
                    }
                    if (attribute) {
                        msg.push("\"Instead access it via the reflective attribute \"" + attribute + "\" with one of these techniques:");
                        msg.push("  * Use `this.getAttribute(\"" + attribute + "\")` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.");
                        msg.push("  * Declare `static observedAttributes = [\"" + attribute + "\"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.");
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
var ViewModelReflection = Symbol('internal');
var observableHTMLAttrs;
assert.block(function devModeCheck() {
    observableHTMLAttrs = getOwnPropertyNames(GlobalHTMLProperties).reduce(function (acc, key) {
        var globalProperty = GlobalHTMLProperties[key];
        if (globalProperty && globalProperty.attribute) {
            acc[globalProperty.attribute] = true;
        }
        return acc;
    }, create(null));
});
var CtorToDefMap = new WeakMap();
var COMPUTED_GETTER_MASK = 1;
var COMPUTED_SETTER_MASK = 2;
function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    var proto = getPrototypeOf(Ctor);
    if (proto === ComponentElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}
function createComponentDef(Ctor) {
    assert.isTrue(isElementComponent(Ctor), Ctor + " is not a valid component, or does not extends Element from \"engine\". You probably forgot to add the extend clause on the class declaration.");
    var name = Ctor.name;
    assert.isTrue(name && isString(name), toString$1(Ctor) + " should have a \"name\" property with string value, but found " + name + ".");
    assert.isTrue(Ctor.constructor, "Missing " + name + ".constructor, " + name + " should have a \"constructor\" property.");
    var props = getPublicPropertiesHash(Ctor);
    var methods = getPublicMethodsHash(Ctor);
    var observedAttrs = getObservedAttributesHash(Ctor);
    var wire = getWireHash(Ctor);
    var track = getTrackHash(Ctor);
    var proto = Ctor.prototype;
    var _loop_1 = function (propName) {
        var propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        var descriptor = getOwnPropertyDescriptor(proto, propName);
        assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), "Invalid " + name + ".prototype." + propName + " definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.");
        var config = propDef.config;
        if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
            assert.block(function devModeCheck() {
                var mustHaveGetter = COMPUTED_GETTER_MASK & config;
                var mustHaveSetter = COMPUTED_SETTER_MASK & config;
                if (mustHaveGetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), "Missing getter for property " + propName + " decorated with @api in " + name);
                }
                if (mustHaveSetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), "Missing setter for property " + propName + " decorated with @api in " + name);
                    assert.isTrue(mustHaveGetter, "Missing getter for property " + propName + " decorated with @api in " + name + ". You cannot have a setter without the corresponding getter.");
                }
            });
            createPublicAccessorDescriptor(proto, propName, descriptor);
        }
        else {
            createPublicPropertyDescriptor(proto, propName, descriptor);
        }
    };
    for (var propName in props) {
        _loop_1(propName);
    }
    if (wire) {
        var _loop_2 = function (propName) {
            if (wire[propName].method) {
                return "continue";
            }
            var descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            assert.block(function devModeCheck() {
                var _a = descriptor || EmptyObject, get = _a.get, set = _a.set, configurable = _a.configurable, writable = _a.writable;
                assert.isTrue(!get && !set, "Compiler Error: A decorator can only be applied to a public field.");
                assert.isTrue(configurable !== false, "Compiler Error: A decorator can only be applied to a configurable property.");
                assert.isTrue(writable !== false, "Compiler Error: A decorator can only be applied to a writable property.");
            });
            // initializing getters and setters for each public prop on the target prototype
            createWiredPropertyDescriptor(proto, propName, descriptor);
        };
        for (var propName in wire) {
            _loop_2(propName);
        }
    }
    if (track) {
        var _loop_3 = function (propName) {
            var descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            assert.block(function devModeCheck() {
                var _a = descriptor || EmptyObject, get = _a.get, set = _a.set, configurable = _a.configurable, writable = _a.writable;
                assert.isTrue(!get && !set, "Compiler Error: A decorator can only be applied to a public field.");
                assert.isTrue(configurable !== false, "Compiler Error: A decorator can only be applied to a configurable property.");
                assert.isTrue(writable !== false, "Compiler Error: A decorator can only be applied to a writable property.");
            });
            // initializing getters and setters for each public prop on the target prototype
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        };
        for (var propName in track) {
            _loop_3(propName);
        }
    }
    var superProto = getPrototypeOf(Ctor);
    if (superProto !== ComponentElement) {
        var superDef = getComponentDef(superProto);
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = (superDef.wire || wire) ? assign(create(null), superDef.wire, wire) : undefined;
    }
    var descriptors = createDescriptorMap(props, methods);
    var def = {
        name: name,
        wire: wire,
        track: track,
        props: props,
        methods: methods,
        observedAttrs: observedAttrs,
        descriptors: descriptors,
    };
    assert.block(function devModeCheck() {
        freeze(Ctor.prototype);
        freeze(wire);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (var key in def) {
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
        var vm = this[ViewModelReflection];
        return vm.component[key];
    };
}
function createSetter(key) {
    return function (newValue) {
        var vm = this[ViewModelReflection];
        // logic for setting new properties of the element directly from the DOM
        // will only be allowed for root elements created via createElement()
        if (!vm.vnode.isRoot) {
            assert.logError("Invalid attempt to set property " + key + " from " + vm + " to " + newValue + ". This property was decorated with @api, and can only be changed via the template.");
            return;
        }
        var observable = isObservable(newValue);
        newValue = observable ? getReactiveProxy(newValue) : newValue;
        assert.block(function devModeCheck() {
            if (!observable && newValue !== null && isObject(newValue)) {
                assert.logWarning("Assigning a non-reactive value " + newValue + " to member property " + key + " of " + vm + " is not common because mutations on that value cannot be observed.");
            }
        });
        prepareForPropUpdate(vm);
        vm.component[key] = newValue;
    };
}
function createMethodCaller(key) {
    return function () {
        var vm = this[ViewModelReflection];
        return vm.component[key].apply(vm.component, ArraySlice.call(arguments));
    };
}
var _a$1 = Element.prototype;
var getAttribute = _a$1.getAttribute;
var setAttribute = _a$1.setAttribute;
var removeAttribute = _a$1.removeAttribute;
function getAttributePatched(attrName) {
    var vm = this[ViewModelReflection];
    assert.vm(vm);
    assert.block(function devModeCheck() {
        var propsConfig = vm.def.props;
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead access the public property with `element." + propName + ";`.");
        }
    });
    return getAttribute.call(this, attrName);
}
function setAttributePatched(attrName, newValue) {
    var vm = this[ViewModelReflection];
    assert.vm(vm);
    var _a = vm.def, propsConfig = _a.props, observedAttrs = _a.observedAttrs;
    attrName = attrName.toLocaleLowerCase();
    assert.block(function devModeCheck() {
        if (!vm.vnode.isRoot) {
            assert.logError("Invalid operation on Element " + vm + ". Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute \"" + attrName + "\", you can update the state of the component, and let the engine to rehydrate the element accordingly.");
        }
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead update the public property with `element." + propName + " = value;`.");
        }
    });
    var oldValue = getAttribute.call(this, attrName);
    setAttribute.call(this, attrName, newValue);
    newValue = getAttribute.call(this, attrName);
    if (attrName in observedAttrs && oldValue !== newValue) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
function removeAttributePatched(attrName) {
    var vm = this[ViewModelReflection];
    assert.vm(vm);
    var _a = vm.def, propsConfig = _a.props, observedAttrs = _a.observedAttrs;
    attrName = attrName.toLocaleLowerCase();
    assert.block(function devModeCheck() {
        if (!vm.vnode.isRoot) {
            assert.logError("Invalid operation on Element " + vm + ". Elements created via a template should not be mutated using DOM APIs. Instead of attempting to remove attribute \"" + attrName + "\" from this element, you can update the state of the component, and let the engine to rehydrate the element accordingly.");
        }
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead update the public property with `element." + propName + " = undefined;`.");
        }
    });
    var oldValue = getAttribute.call(this, attrName);
    removeAttribute.call(this, attrName);
    var newValue = getAttribute.call(this, attrName);
    if (attrName in observedAttrs && oldValue !== newValue) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
function createDescriptorMap(publicProps, publicMethodsConfig) {
    // replacing mutators and accessors on the element itself to catch any mutation
    var descriptors = {
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
    for (var key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
        };
    }
    // expose public methods as props on the Element
    for (var key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(key),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    var track = target.track;
    if (!track || !getOwnPropertyNames(track).length) {
        return;
    }
    assert.block(function devModeCheck() {
        // TODO: check that anything in `track` is correctly defined in the prototype
    });
    return assign(create(null), track);
}
function getWireHash(target) {
    var wire = target.wire;
    if (!wire || !getOwnPropertyNames(wire).length) {
        return;
    }
    assert.block(function devModeCheck() {
        // TODO: check that anything in `wire` is correctly defined in the prototype
    });
    return assign(create(null), wire);
}
function getPublicPropertiesHash(target) {
    var props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
        assert.block(function devModeCheck() {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _a = GlobalHTMLProperties[propName], error = _a.error, attribute = _a.attribute, experimental = _a.experimental;
                var msg = [];
                if (error) {
                    msg.push(error);
                }
                else if (experimental) {
                    msg.push("\"" + propName + "\" is an experimental property that is not standardized or supported by all browsers. You should not use \"" + propName + "\" and attribute \"" + attribute + "\" in your component.");
                }
                else {
                    msg.push("\"" + propName + "\" is a global HTML property. Instead access it via the reflective attribute \"" + attribute + "\" with one of these techniques:");
                    msg.push("  * Use `this.getAttribute(\"" + attribute + "\")` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.");
                    msg.push("  * Declare `static observedAttributes = [\"" + attribute + "\"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.");
                }
                console.error(msg.join('\n'));
            }
        });
        propsHash[propName] = assign({ config: 0 }, props[propName]);
        return propsHash;
    }, create(null));
}
function getPublicMethodsHash(target) {
    var publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce(function (methodsHash, methodName) {
        methodsHash[methodName] = 1;
        assert.block(function devModeCheck() {
            assert.isTrue(isFunction(target.prototype[methodName]), "Component \"" + target.name + "\" should have a method `" + methodName + "` instead of " + target.prototype[methodName] + ".");
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}
function getObservedAttributesHash(target) {
    var observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce(function (observedAttributes, attrName) {
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
            var propName = getPropNameFromAttrName(attrName);
            // Check if it is a user defined public property
            if (target.publicProps && target.publicProps[propName]) {
                assert.fail("Invalid entry \"" + attrName + "\" in component " + target.name + " observedAttributes. To observe mutations of the public property \"" + propName + "\" you can define a public getter and setter decorated with @api in component " + target.name + ".");
            }
            else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                // Check for misspellings
                assert.fail("Invalid entry \"" + attrName + "\" in component " + target.name + " observedAttributes. \"" + attrName + "\" is not a valid global HTML Attribute. Did you mean \"" + GlobalHTMLProperties[propName].attribute + "\"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes");
            }
            else {
                // Attribute is not valid observable HTML Attribute
                assert.fail("Invalid entry \"" + attrName + "\" in component " + target.name + " observedAttributes. \"" + attrName + "\" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes");
            }
        });
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}
function getComponentDef(Ctor) {
    var def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}

var idx = 0;
var uid = 0;
var OwnerKey = Symbol('key');
function addInsertionIndex(vm) {
    assert.vm(vm);
    assert.invariant(vm.idx === 0, vm + " is already locked to a previously generated idx.");
    vm.idx = ++idx;
    var connectedCallback = vm.component.connectedCallback;
    if (connectedCallback && connectedCallback !== noop) {
        invokeComponentMethod(vm, 'connectedCallback');
    }
    var connected = Services.connected;
    if (connected) {
        addCallbackToNextTick(function () { return invokeServiceHook(vm, connected); });
    }
}
function removeInsertionIndex(vm) {
    assert.vm(vm);
    assert.invariant(vm.idx > 0, vm + " is not locked to a previously generated idx.");
    vm.idx = 0;
    var disconnectedCallback = vm.component.disconnectedCallback;
    if (disconnectedCallback && disconnectedCallback !== noop) {
        invokeComponentMethod(vm, 'disconnectedCallback');
    }
    var disconnected = Services.disconnected;
    if (disconnected) {
        addCallbackToNextTick(function () { return invokeServiceHook(vm, disconnected); });
    }
}
function createVM(vnode) {
    assert.vnode(vnode);
    var elm = vnode.elm, Ctor = vnode.Ctor;
    assert.invariant(elm instanceof HTMLElement, "VM creation requires a DOM element to be associated to vnode " + vnode + ".");
    var def = getComponentDef(Ctor);
    console.log("[object:vm " + def.name + "] is being initialized.");
    uid += 1;
    var vm = {
        uid: uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        def: def,
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
        vnode: vnode,
        shadowVNode: createShadowRootVNode(elm, []),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    assert.block(function devModeCheck() {
        vm.toString = function () {
            return "[object:vm " + def.name + " (" + vm.idx + ")]";
        };
    });
    vnode.vm = vm;
    // linking elm with VM before creating the instance
    elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    createComponent(vm, Ctor);
    linkComponent(vm);
    assert.block(function devModeCheck() {
        var attributeChangedCallback = vm.component.attributeChangedCallback, observedAttrs = vm.def.observedAttrs;
        if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
            console.warn(vm + " has static observedAttributes set to [\"" + keys(observedAttrs).join('", "') + "\"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.");
        }
    });
    return vm;
}
function relinkVM(vm, vnode) {
    assert.vm(vm);
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, "Only DOM elements can be linked to their corresponding component.");
    assert.invariant(vm.component, "vm.component is required to be defined before " + vm + " gets linked to " + vnode + ".");
    vnode.vm = vm;
    vm.vnode = vnode;
}
function rehydrate(vm) {
    assert.vm(vm);
    if (vm.idx && vm.isDirty) {
        var vnode = vm.vnode;
        assert.isTrue(vnode.elm instanceof HTMLElement, "rehydration can only happen after " + vm + " was patched the first time.");
        var children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        var renderedCallback = vm.component.renderedCallback;
        if (renderedCallback && renderedCallback !== noop) {
            invokeComponentMethod(vm, 'renderedCallback');
        }
    }
}
var rehydrateQueue = [];
function flushRehydrationQueue() {
    assert.invariant(rehydrateQueue.length, "If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of " + rehydrateQueue + ".");
    var vms = rehydrateQueue.sort(function (a, b) { return a.idx > b.idx; });
    rehydrateQueue = []; // reset to a new queue
    for (var i = 0, len = vms.length; i < len; i += 1) {
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
    assert.invariant(node instanceof Node, "isNodeOwnedByVM() should be called with a node as the second argument instead of " + node);
    assert.childNode(vm.vnode.elm, node, "isNodeOwnedByVM() should never be called with a node that is not a child node of " + vm);
    // @ts-ignore
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    assert.vm(vm);
    assert.invariant(node instanceof Node, "isNodePassedToVM() should be called with a node as the second argument instead of " + node);
    assert.childNode(vm.vnode.elm, node, "isNodePassedToVM() should never be called with a node that is not a child node of " + vm);
    var ownerUid = vm.vnode.uid;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    // @ts-ignore
    return node[OwnerKey] === ownerUid;
}
function createShadowRootVNode(elm, children) {
    var sel = elm.tagName.toLocaleLowerCase();
    var vnode = {
        sel: sel,
        data: EmptyObject,
        children: children,
        elm: elm,
        key: undefined,
        text: undefined,
    };
    return vnode;
}
function patchShadowRoot(vm, children) {
    assert.vm(vm);
    var oldShadowVNode = vm.shadowVNode;
    var shadowVNode = createShadowRootVNode(vm.vnode.elm, children);
    vm.shadowVNode = patch(oldShadowVNode, shadowVNode);
}

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode, vnode) {
    var Ctor = vnode.Ctor;
    if (isUndefined(Ctor)) {
        return;
    }
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, vnode + ".elm should be ready.");
    if (oldVnode.vm && oldVnode.Ctor === Ctor) {
        assert.invariant(vnode.elm === oldVnode.elm, vnode + ".elm should always match the oldVnode's   element.");
        relinkVM(oldVnode.vm, vnode);
    }
    else {
        createVM(vnode);
    }
    assert.invariant(vnode.vm.component, "vm " + vnode.vm + " should have a component and element associated to it.");
}
var componentInit = {
    create: initializeComponent,
    update: initializeComponent,
};

function syncProps(oldVnode, vnode) {
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var component = vm.component, publicProps = vm.def.props;
    var oldProps = oldVnode.data._props;
    var newProps = vnode.data._props;
    // infuse key-value pairs from _props into the component
    if (oldProps !== newProps && (oldProps || newProps)) {
        var key = void 0, cur = void 0;
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
                    assert.fail("Ignoring unknown public property \"" + key + "\" of " + vm + ". This is likely a typo on the corresponding attribute \"" + getAttrNameFromPropName(key) + "\".");
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
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var observedAttrs = vm.def.observedAttrs;
    if (observedAttrs.length === 0) {
        return; // nothing to observe
    }
    var oldAttrs = oldVnode.data.attrs;
    var newAttrs = vnode.data.attrs;
    if (oldAttrs === newAttrs || (isUndefined(oldAttrs) && isUndefined(newAttrs))) {
        return;
    }
    // infuse key-value pairs from _props into the component
    var key, cur;
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
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var on = vm.cmpEvents, listener = vm.listener;
    if (on && listener) {
        var elm = vnode.elm;
        var name = void 0;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vm.listener = undefined;
    }
}
function updateCmpEventListeners(oldVnode, vnode) {
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var oldVm = oldVnode.vm;
    if (oldVm === vm) {
        return;
    }
    var oldOn = (oldVm && oldVm.cmpEvents) || EmptyObject;
    var _a = vm.cmpEvents, on = _a === void 0 ? EmptyObject : _a;
    if (oldOn === on) {
        return;
    }
    var elm = vnode.elm;
    var oldElm = oldVnode.elm;
    var listener = vm.cmpListener = (oldVm && oldVm.cmpListener) || createComponentListener();
    listener.vm = vm;
    var name;
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
var eventListenersModule = {
    create: updateCmpEventListeners,
    update: updateCmpEventListeners,
    destroy: removeAllCmpEventListeners
};

function syncClassNames(oldVnode, vnode) {
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var oldVm = oldVnode.vm;
    if (oldVm === vm) {
        return;
    }
    var oldClass = (oldVm && oldVm.cmpClasses) || EmptyObject;
    var _a = vm.cmpClasses, klass = _a === void 0 ? EmptyObject : _a;
    if (oldClass === klass) {
        return;
    }
    var elm = vnode.elm, _b = vnode.data.class, ownerClass = _b === void 0 ? EmptyObject : _b;
    var name;
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
    var vm = vnode.vm;
    if (isUndefined(vm)) {
        return;
    }
    var oldSlots = oldVnode.data.slotset;
    var newSlots = vnode.data.slotset;
    // infuse key-value pairs from slotset into the component
    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        var key = void 0, cur = void 0;
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
    var oldProps = oldVnode.data.props;
    var props = vnode.data.props;
    if (isUndefined(oldProps) && isUndefined(props)) {
        return;
    }
    if (oldProps === props) {
        return;
    }
    oldProps = oldProps || EmptyObject;
    props = props || EmptyObject;
    var key, cur, old;
    var elm = vnode.elm;
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
                        console.warn("Unneccessary update of property \"" + key + "\" in " + elm + ", it has the same value in " + (vnode.vm || vnode) + ".");
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

var createElement$1 = document.createElement;
var createElementNS = document.createElementNS;
var createTextNode = document.createTextNode;
var createComment = document.createComment;
var _a$4 = Node.prototype;
var insertBefore$1 = _a$4.insertBefore;
var removeChild$1 = _a$4.removeChild;
var appendChild$1 = _a$4.appendChild;
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
    createElement: function (tagName) {
        return createElement$1.call(document, tagName);
    },
    createElementNS: function (namespaceURI, qualifiedName) {
        return createElementNS.call(document, namespaceURI, qualifiedName);
    },
    createTextNode: function (text) {
        return createTextNode.call(document, text);
    },
    createComment: function (text) {
        return createComment.call(document, text);
    },
    insertBefore: function (parentNode, newNode, referenceNode) {
        insertBefore$1.call(parentNode, newNode, referenceNode);
    },
    removeChild: function (node, child) {
        removeChild$1.call(node, child);
    },
    appendChild: function (node, child) {
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

var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var ColonCharCode = 58;
var XCharCode = 120;
var _a$5 = Element.prototype;
var setAttribute$1 = _a$5.setAttribute;
var removeAttribute$1 = _a$5.removeAttribute;
var setAttributeNS = _a$5.setAttributeNS;
function updateAttrs(oldVnode, vnode) {
    var oldAttrs = oldVnode.data.attrs;
    var attrs = vnode.data.attrs;
    if (!oldAttrs && !attrs) {
        return;
    }
    if (oldAttrs === attrs) {
        return;
    }
    var elm = vnode.elm;
    var key;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
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
var attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

var DashCharCode = 45;
function updateStyle(oldVnode, vnode) {
    var oldStyle = oldVnode.data.style;
    var style = vnode.data.style;
    if (!oldStyle && !style) {
        return;
    }
    if (oldStyle === style) {
        return;
    }
    oldStyle = oldStyle || {};
    style = style || {};
    var name;
    var elm = vnode.elm;
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
            var cur = style[name];
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
var styleModule = {
    create: updateStyle,
    update: updateStyle,
};

function updateClass(oldVnode, vnode) {
    var _a = oldVnode.data.class, oldClass = _a === void 0 ? EmptyObject : _a;
    var elm = vnode.elm, _b = vnode.data.class, klass = _b === void 0 ? EmptyObject : _b;
    if (oldClass === klass) {
        return;
    }
    var innerClass = (vnode.vm && vnode.vm.cmpClasses) || EmptyObject;
    var name;
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
    var type = event.type;
    var on = vnode.data.on;
    var handler = on && on[type];
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
    var on = vnode.data.on, listener = vnode.listener;
    if (on && listener) {
        var elm = vnode.elm;
        var name = void 0;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vnode.listener = undefined;
    }
}
function updateEventListeners(oldVnode, vnode) {
    var _a = oldVnode.data.on, oldOn = _a === void 0 ? EmptyObject : _a;
    var _b = vnode.data.on, on = _b === void 0 ? EmptyObject : _b;
    if (oldOn === on) {
        return;
    }
    var elm = vnode.elm;
    var oldElm = oldVnode.elm;
    var listener = vnode.listener = oldVnode.listener || createListener();
    listener.vnode = vnode;
    var name;
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
var eventListenersModule$1 = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: removeAllEventListeners
};

function updateUID(oldVnode, vnode) {
    var oldUid = oldVnode.uid;
    var elm = vnode.elm, uid = vnode.uid;
    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    elm[OwnerKey] = uid;
}
var uidModule = {
    create: updateUID,
    update: updateUID,
};

var patch = init([
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

var _a = Node.prototype;
var removeChild = _a.removeChild;
var appendChild = _a.appendChild;
var insertBefore = _a.insertBefore;
var replaceChild = _a.replaceChild;
var ConnectingSlot = Symbol();
var DisconnectingSlot = Symbol();
function callNodeSlot(node, slot) {
    assert.isTrue(node, "callNodeSlot() should not be called for a non-object");
    if (!isUndefined(node[slot])) {
        node[slot]();
    }
    return node; // for convenience
}
// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
assign(Node.prototype, {
    appendChild: function (newChild) {
        var appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore: function (newChild, referenceNode) {
        var insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild: function (oldChild) {
        var removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild: function (newChild, oldChild) {
        var replacedNode = replaceChild.call(this, newChild, oldChild);
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
        throw new TypeError("Invalid Component Definition: " + Ctor + ".");
    }
    var tagName = element.tagName.toLowerCase();
    var vnode = c(tagName, Ctor, { className: element.className || undefined });
    vnode.isRoot = true;
    patch(element, vnode);
    // providing the hook to detect insertion and removal
    element[ConnectingSlot] = function () {
        insert(vnode);
    };
    element[DisconnectingSlot] = function () {
        forceDisconnection(vnode);
    };
}
// this could happen for two reasons:
// * it is a root, and was removed manually
// * the element was appended to another container which requires disconnection to happen first
function forceDisconnection(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm;
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
function createElement(tagName, options) {
    if (options === void 0) { options = {}; }
    var Ctor = isFunction(options.is) ? options.is : null;
    var element = document.createElement(tagName, Ctor ? null : options);
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
/** version: 0.14.10 */
