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
    var proxy = new Proxy([3, 4], {});
    var res = [1, 2].concat(proxy);
    return res.length !== 4;
}

var isConcatSpreadable = Symbol.isConcatSpreadable;
var isArray = Array.isArray;
var _a = Array.prototype, ArraySlice = _a.slice, ArrayUnshift = _a.unshift, ArrayShift = _a.shift;
function isObject(O) {
    return typeof O === 'object' ? O !== null : typeof O === 'function';
}
// https://www.ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
function isSpreadable(O) {
    if (!isObject(O)) {
        return false;
    }
    var spreadable = O[isConcatSpreadable];
    return spreadable !== undefined ? Boolean(spreadable) : isArray(O);
}
// https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat
function ArrayConcatPolyfill() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var O = Object(this);
    var A = [];
    var N = 0;
    var items = ArraySlice.call(arguments);
    ArrayUnshift.call(items, O);
    while (items.length) {
        var E = ArrayShift.call(items);
        if (isSpreadable(E)) {
            var k = 0;
            var length = E.length;
            for (k; k < length; k += 1, N += 1) {
                if (k in E) {
                    var subElement = E[k];
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

var freeze = Object.freeze, seal = Object.seal, keys = Object.keys, create = Object.create, assign = Object.assign, defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, defineProperties = Object.defineProperties, hasOwnProperty = Object.hasOwnProperty;
var isArray$1 = Array.isArray;
var _a$1 = Array.prototype, ArrayFilter = _a$1.filter, ArraySlice$1 = _a$1.slice, ArraySplice = _a$1.splice, ArrayUnshift$1 = _a$1.unshift, ArrayIndexOf = _a$1.indexOf, ArrayPush = _a$1.push, ArrayMap = _a$1.map, forEach = _a$1.forEach, ArrayReduce = _a$1.reduce;
var _b = String.prototype, StringReplace = _b.replace, StringToLowerCase = _b.toLowerCase, StringIndexOf = _b.indexOf, StringCharCodeAt = _b.charCodeAt, StringSlice = _b.slice, StringSplit = _b.split;
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
function isNumber(obj) {
    return typeof obj === 'number';
}
var OtS = {}.toString;
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
    vnode: function (vnode) {
        assert.isTrue(vnode && "sel" in vnode && "data" in vnode && "children" in vnode && "text" in vnode && "elm" in vnode && "key" in vnode && "nt" in vnode, vnode + " is not a vnode.");
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
            console.error(e); // tslint:disable-line
        }
    },
    logWarning: function (msg) {
        try {
            throw new Error(msg);
        }
        catch (e) {
            var stackTraceLines = StringSplit.call(e.stack, '\n');
            console.group("Warning: " + msg); // tslint:disable-line
            stackTraceLines.filter(function (trace) {
                // Chrome adds the error message as the first item in the stack trace
                // So we filter it out to prevent logging it twice.
                return trace.replace('Error: ', '') !== msg;
            })
                .forEach(function (trace) {
                // We need to format this as a string,
                // because Safari will detect that the string
                // is a stack trace line item and will format it as so
                console.log('%s', trace.trim()); // tslint:disable-line
            });
            console.groupEnd(); // tslint:disable-line
        }
    },
    childNode: function (container, node, msg) {
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || node + " must be a child node of " + container);
    }
};

var nextTickCallbackQueue = [];
var SPACE_CHAR = 32;
var EmptyObject = seal(create(null));
var EmptyArray = seal([]);
var ViewModelReflection = Symbol();
function flushCallbackQueue() {
    {
        assert.invariant(nextTickCallbackQueue.length, "If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of " + nextTickCallbackQueue + ".");
    }
    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (var i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}
function addCallbackToNextTick(callback) {
    {
        assert.isTrue(isFunction(callback), "addCallbackToNextTick() can only accept a function callback as first argument instead of " + callback);
    }
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    // TODO: eventually, we might want to have priority when inserting callbacks
    ArrayPush.call(nextTickCallbackQueue, callback);
}
var CAMEL_REGEX = /-([a-z])/g;
/**
 * This method maps between attribute names
 * and the corresponding property name.
 */
function getPropNameFromAttrName(attrName) {
    if (!hasOwnProperty.call(AttrNameToPropNameMap, attrName)) {
        AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, function (g) { return g[1].toUpperCase(); });
    }
    return AttrNameToPropNameMap[attrName];
}
var CAPS_REGEX = /[A-Z]/g;
/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
function getAttrNameFromPropName(propName) {
    if (!hasOwnProperty.call(PropNameToAttrNameMap, propName)) {
        PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, function (match) { return '-' + match.toLowerCase(); });
    }
    return PropNameToAttrNameMap[propName];
}
// According to the WC spec (https://dom.spec.whatwg.org/#dom-element-attachshadow), certain elements
// are not allowed to attached a shadow dom, and therefore, we need to prevent setting forceTagName to
// those, otherwise we will not be able to use shadowDOM when forceTagName is specified in the future.
function assertValidForceTagName(Ctor) {
    var forceTagName = Ctor.forceTagName;
    if (isUndefined(forceTagName)) {
        return;
    }
    var invalidTags = [
        "article", "aside", "blockquote", "body", "div", "footer", "h1", "h2", "h3", "h4",
        "h5", "h6", "header", "main", "nav", "p", "section", "span"
    ];
    if (ArrayIndexOf.call(invalidTags, forceTagName) !== -1) {
        throw new RangeError("Invalid static forceTagName property set to \"" + forceTagName + "\" in component " + Ctor + ". None of the following tag names can be used: " + invalidTags.join(", ") + ".");
    }
    if (StringIndexOf.call(forceTagName, '-') !== -1) {
        throw new RangeError("Invalid static forceTagName property set to \"" + forceTagName + "\" in component " + Ctor + ". It cannot have a dash (-) on it because that is reserved for existing custom elements.");
    }
}
var usesNativeSymbols = typeof Symbol() === 'symbol';

var _a$2 = Element.prototype, addEventListener = _a$2.addEventListener, removeEventListener = _a$2.removeEventListener, getAttribute = _a$2.getAttribute, getAttributeNS = _a$2.getAttributeNS, setAttribute = _a$2.setAttribute, setAttributeNS = _a$2.setAttributeNS, removeAttribute = _a$2.removeAttribute, removeAttributeNS = _a$2.removeAttributeNS, querySelector = _a$2.querySelector, querySelectorAll = _a$2.querySelectorAll;
var DOCUMENT_POSITION_CONTAINED_BY = Node.DOCUMENT_POSITION_CONTAINED_BY;
var compareDocumentPosition$1 = Node.prototype.compareDocumentPosition;
function findShadowRoot(node) {
    var root = node;
    while (isUndefined(root[ViewModelReflection])) {
        root = root.parentNode;
    }
    return root;
}
function findComposedRootNode(node) {
    while (node !== document) {
        var parent = node.parentNode;
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
    var composed = isUndefined(options) ? false : !!options.composed;
    if (!composed) {
        return findShadowRoot(this.parentNode); // this is not quite the root (it is the host), but for us is sufficient
    }
    return findComposedRootNode(this);
}
function isChildNode(root, node) {
    return !!(compareDocumentPosition$1.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}
// These properties get added to LWCElement.prototype publicProps automatically
var defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex'];
// Few more exceptions that are using the attribute name to match the property in lowercase.
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
// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
var ARIA_REGEX = /^aria/;
function attemptAriaAttributeFallback(vm, attrName) {
    {
        assert.vm(vm);
    }
    // if the map is known (because all AOM attributes are known)
    if (hasOwnProperty.call(AttrNameToPropNameMap, attrName)) {
        var propName = AttrNameToPropNameMap[attrName];
        // and if the corresponding prop is an actual AOM property
        if (hasOwnProperty.call(GlobalAOMProperties, propName)) {
            vm.hostAttrs[attrName] = undefined; // marking the set is needed for the AOM polyfill
            var shadowValue = vm.cmpRoot[propName];
            if (shadowValue !== null) {
                setAttribute.call(vm.elm, attrName, shadowValue);
            }
        }
    }
}
// Global Aria and Role Properties derived from ARIA and Role Attributes with their
// respective default value.
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
var GlobalAOMProperties = {
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
var OffsetPropertiesError = 'This property will round the value to an integer, and it is considered an anti-pattern. Instead, you can use \`this.getBoundingClientRect()\` to obtain `left`, `top`, `right`, `bottom`, `x`, `y`, `width`, and `height` fractional values describing the overall border-box in pixels.';
// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
function getGlobalHTMLPropertiesInfo() {
    return {
        id: {
            attribute: 'id',
            reflective: true,
        },
        accessKey: {
            attribute: 'accesskey',
            reflective: true,
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
            reflective: true,
        },
        isContentEditable: {
            readOnly: true,
        },
        contextMenu: {
            attribute: 'contextmenu',
        },
        dataset: {
            readOnly: true,
            error: 'Using property "dataset" is an anti-pattern. Components should not rely on dataset to implement its internal logic, nor use that as a communication channel.',
        },
        dir: {
            attribute: 'dir',
            reflective: true,
        },
        draggable: {
            attribute: 'draggable',
            experimental: true,
            reflective: true,
        },
        dropzone: {
            attribute: 'dropzone',
            readOnly: true,
            experimental: true,
        },
        hidden: {
            attribute: 'hidden',
            reflective: true,
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
            reflective: true,
        },
        offsetHeight: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetLeft: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetParent: {
            readOnly: true,
        },
        offsetTop: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetWidth: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        properties: {
            readOnly: true,
            experimental: true,
        },
        spellcheck: {
            experimental: true,
            reflective: true,
        },
        style: {
            attribute: 'style',
            error: "Using property or attribute \"style\" is an anti-pattern. Instead use property \"classList\".",
        },
        tabIndex: {
            attribute: 'tabindex',
            reflective: true,
        },
        title: {
            attribute: 'title',
            reflective: true,
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
}
// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element
// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node
var GlobalHTMLPropDescriptors = create(null);
var AttrNameToPropNameMap = create(null);
var PropNameToAttrNameMap = create(null);
// Synthetic creation of all AOM property descriptors
forEach.call(getOwnPropertyNames(GlobalAOMProperties), function (propName) {
    var attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
    function get() {
        var vm = this[ViewModelReflection];
        if (!hasOwnProperty.call(vm.cmpProps, propName)) {
            return null;
        }
        return vm.cmpProps[propName];
    }
    function set(newValue) {
        // TODO: fallback to the root's AOM default semantics
        var vm = this[ViewModelReflection];
        var value = vm.cmpProps[propName] = isNull(newValue) ? null : newValue + ''; // storing the normalized new value
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
        set: set,
        get: get,
        configurable: true,
        enumerable: true,
    };
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});
forEach.call(defaultDefHTMLPropertyNames, function (propName) {
    var descriptor = getOwnPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        GlobalHTMLPropDescriptors[propName] = descriptor;
        var attrName = StringToLowerCase.call(propName);
        AttrNameToPropNameMap[attrName] = propName;
        PropNameToAttrNameMap[propName] = attrName;
    }
});
forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, function (propName) {
    var attrName = StringToLowerCase.call(propName);
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
    var OriginalCustomEvent_1 = window.CustomEvent;
    window.CustomEvent = function PatchedCustomEvent(type, eventInitDict) {
        var event = new OriginalCustomEvent_1(type, eventInitDict);
        // support for composed on custom events
        event.composed = !!(eventInitDict && eventInitDict.composed);
        return event;
    };
    window.CustomEvent.prototype = OriginalCustomEvent_1.prototype;
}
var CustomEvent = window.CustomEvent;

function decorate(Ctor, decorators) {
    // intentionally comparing decorators with null and undefined
    if (!isFunction(Ctor) || decorators == null) {
        throw new TypeError();
    }
    var props = getOwnPropertyNames(decorators);
    // intentionally allowing decoration of classes only for now
    var target = Ctor.prototype;
    for (var i = 0, len = props.length; i < len; i += 1) {
        var propName = props[i];
        var decorator = decorators[propName];
        if (!isFunction(decorator)) {
            throw new TypeError();
        }
        var originalDescriptor = getOwnPropertyDescriptor(target, propName);
        var descriptor = decorator(Ctor, propName, originalDescriptor);
        if (!isUndefined(descriptor)) {
            defineProperty(target, propName, descriptor);
        }
    }
    return Ctor; // chaining
}

var TopLevelContextSymbol = Symbol();
var currentContext = {};
currentContext[TopLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

var Services = create(null);
var hooks = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
function register(service) {
    {
        assert.isTrue(isObject$1(service), "Invalid service declaration, " + service + ": service must be an object");
    }
    for (var i = 0; i < hooks.length; ++i) {
        var hookName = hooks[i];
        if (hookName in service) {
            var l = Services[hookName];
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
        assert.isTrue(isArray$1(cbs) && cbs.length > 0, "Optimize invokeServiceHook() to be invoked only when needed");
    }
    var component = vm.component, data = vm.data, def = vm.def, context = vm.context;
    for (var i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

function createComponent(vm, Ctor) {
    {
        assert.vm(vm);
    }
    // create the component instance
    invokeComponentConstructor(vm, Ctor);
    {
        assert.isTrue(isObject$1(vm.component), "Invalid construction for " + vm + ", maybe you are missing the call to super() on classes extending Element.");
        var track = getComponentDef(Ctor).track;
        if ('state' in vm.component && (!track || !track.state)) {
            assert.logWarning("Non-trackable component state detected in " + vm.component + ". Updates to state property will not be reactive. To make state reactive, add @track decorator.");
        }
    }
}
function linkComponent(vm) {
    {
        assert.vm(vm);
    }
    // wiring service
    var wire = vm.def.wire;
    if (wire) {
        var wiring = Services.wiring;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}
function clearReactiveListeners(vm) {
    {
        assert.vm(vm);
    }
    var deps = vm.deps;
    var len = deps.length;
    if (len) {
        for (var i = 0; i < len; i += 1) {
            var set = deps[i];
            var pos = ArrayIndexOf.call(deps[i], vm);
            {
                assert.invariant(pos > -1, "when clearing up deps, the vm must be part of the collection.");
            }
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
    {
        assert.vm(vm);
        assert.invariant(vm.isDirty, vm + " is not dirty.");
    }
    clearReactiveListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    {
        assert.invariant(isArray$1(vnodes), vm + ".render() should always return an array of vnodes instead of " + vnodes);
    }
    return vnodes;
}
function markComponentAsDirty(vm) {
    {
        assert.vm(vm);
        assert.isFalse(vm.isDirty, "markComponentAsDirty() for " + vm + " should not be called when the component is already dirty.");
        assert.isFalse(isRendering, "markComponentAsDirty() for " + vm + " cannot be called during rendering of " + vmBeingRendered + ".");
    }
    vm.isDirty = true;
}
function getCustomElementComponent(elmOrRoot) {
    {
        assert.vm(elmOrRoot[ViewModelReflection]);
    }
    return elmOrRoot[ViewModelReflection].component;
}

/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
var isArray$2 = Array.isArray;
var getPrototypeOf$1 = Object.getPrototypeOf, ObjectCreate = Object.create, ObjectDefineProperty = Object.defineProperty, ObjectDefineProperties = Object.defineProperties;
var _a$3 = Array.prototype, ArrayPush$1 = _a$3.push, ArrayConcat$1 = _a$3.concat;
var ObjectDotPrototype = Object.prototype;
var OtS$1 = {}.toString;
function toString$1(obj) {
    if (obj && obj.toString) {
        return obj.toString();
    }
    else if (typeof obj === 'object') {
        return OtS$1.call(obj);
    }
    else {
        return obj + '';
    }
}
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
        {
            throw new Error("Invalid setPrototypeOf invocation for reactive proxy " + toString$1(this.originalTarget) + ". Prototype of reactive objects cannot be changed.");
        }
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
        {
            var originalTarget = this.originalTarget;
            throw new Error("Invalid mutation: Cannot set \"" + key + "\" on \"" + originalTarget + "\". \"" + originalTarget + "\" is read-only.");
        }
        return false;
    };
    ReadOnlyHandler.prototype.deleteProperty = function (shadowTarget, key) {
        {
            var originalTarget = this.originalTarget;
            throw new Error("Invalid mutation: Cannot delete \"" + key + "\" on \"" + originalTarget + "\". \"" + originalTarget + "\" is read-only.");
        }
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
        {
            var originalTarget = this.originalTarget;
            throw new Error("Invalid prototype mutation: Cannot set prototype on \"" + originalTarget + "\". \"" + originalTarget + "\" prototype is read-only.");
        }
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
        {
            var originalTarget = this.originalTarget;
            throw new Error("Invalid mutation: Cannot preventExtensions on " + originalTarget + "\". \"" + originalTarget + " is read-only.");
        }
        return false;
    };
    ReadOnlyHandler.prototype.defineProperty = function (shadowTarget, key, descriptor) {
        {
            var originalTarget = this.originalTarget;
            throw new Error("Invalid mutation: Cannot defineProperty \"" + key + "\" on \"" + originalTarget + "\". \"" + originalTarget + "\" is read-only.");
        }
        return false;
    };
    return ReadOnlyHandler;
}());

var create$1 = Object.create, getPrototypeOf$2 = Object.getPrototypeOf, getOwnPropertyNames$2 = Object.getOwnPropertyNames, getOwnPropertySymbols$2 = Object.getOwnPropertySymbols;
var isArray$2$1 = Array.isArray;
function getTarget(item) {
    return item && item[TargetSlot];
}
function extract(objectOrArray) {
    if (isArray$2$1(objectOrArray)) {
        return objectOrArray.map(function (item) {
            var original = getTarget(item);
            if (original) {
                return extract(original);
            }
            return item;
        });
    }
    var obj = create$1(getPrototypeOf$2(objectOrArray));
    var names = getOwnPropertyNames$2(objectOrArray);
    return ArrayConcat$1.call(names, getOwnPropertySymbols$2(objectOrArray))
        .reduce(function (seed, key) {
        var item = objectOrArray[key];
        var original = getTarget(item);
        if (original) {
            seed[key] = extract(original);
        }
        else {
            seed[key] = item;
        }
        return seed;
    }, obj);
}
var formatter = {
    header: function (plainOrProxy) {
        var originalTarget = plainOrProxy[TargetSlot];
        if (!originalTarget) {
            return null;
        }
        var obj = extract(plainOrProxy);
        return ['object', { object: obj }];
    },
    hasBody: function () {
        return false;
    },
    body: function () {
        return null;
    }
};
function init() {
    // Custom Formatter for Dev Tools
    // To enable this, open Chrome Dev Tools
    // Go to Settings,
    // Under console, select "Enable custom formatters"
    // For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
    var devWindow = window;
    var devtoolsFormatters = devWindow.devtoolsFormatters || [];
    ArrayPush$1.call(devtoolsFormatters, formatter);
    devWindow.devtoolsFormatters = devtoolsFormatters;
}

{
    init();
}
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

var TargetToReactiveRecordMap = new WeakMap();
function notifyMutation$1(target, key) {
    {
        assert.invariant(!isRendering, "Mutating property " + toString(key) + " of " + toString(target) + " is not allowed during the rendering life-cycle of " + vmBeingRendered + ".");
    }
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        var value = reactiveRecord[key];
        if (value) {
            var len = value.length;
            for (var i = 0; i < len; i += 1) {
                var vm = value[i];
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
function observeMutation$1(target, key) {
    if (isNull(vmBeingRendered)) {
        return; // nothing to subscribe to
    }
    var vm = vmBeingRendered;
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

function format(value) {
    {
        // For now, if we determine that value is a piercing membrane
        // we want to throw a big error.
        if (replicaUnwrap(value) !== value) {
            throw new ReferenceError("Invalid attempt to get access to a piercing membrane " + toString(value) + " via a reactive membrane.");
        }
    }
    return value;
}
var reactiveMembrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation$1,
    propertyMemberAccess: observeMutation$1,
});
// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
function dangerousObjectMutation(obj) {
    {
        assert.logWarning("Dangerously Mutating Object " + toString(obj) + ". This object was passed to you from a parent component, and should not be mutated here. This will be removed in the near future.");
    }
    return reactiveMembrane.getProxy(unwrap$1(obj));
}
var TargetSlot$1 = Symbol();
var MembraneSlot = Symbol();
function isReplicable(value) {
    var type = typeof value;
    return value && (type === 'object' || type === 'function');
}
// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
var ProxyGetKey = Proxy.getKey;
var getKey$1 = ProxyGetKey ? ProxyGetKey : function (o, key) { return o[key]; };
function replicaUnwrap(value) {
    // observable membrane goes first because it is in the critical path
    return (value && getKey$1(value, TargetSlot$1)) || value;
}
function getReplica(piercingMembrane, value) {
    if (isNull(value)) {
        return value;
    }
    var replicaRawValue = replicaUnwrap(value);
    if (!isReplicable(replicaRawValue)) {
        return replicaRawValue;
    }
    var reactiveRawValue = unwrap(replicaRawValue);
    if (replicaRawValue !== reactiveRawValue) {
        // user is accessing a reactive membrane via a piercing membrane
        // in which case we return a readonly version of the reactive one
        return reactiveMembrane.getReadOnlyProxy(reactiveRawValue);
    }
    {
        assert.isTrue(piercingMembrane instanceof Membrane, "getReplica() first argument must be a membrane.");
    }
    var cells = piercingMembrane.cells;
    var r = cells.get(replicaRawValue);
    if (r) {
        return r;
    }
    var replica = new Proxy(replicaRawValue, piercingMembrane);
    cells.set(replicaRawValue, replica);
    return replica;
}
var Membrane = /** @class */ (function () {
    function Membrane(handler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    Membrane.prototype.get = function (target, key) {
        if (key === TargetSlot$1) {
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
        if (key === TargetSlot$1) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    };
    Membrane.prototype.apply = function (target, thisArg, argumentsList) {
        thisArg = unwrap$1(thisArg);
        argumentsList = unwrap$1(argumentsList);
        if (isArray$1(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap$1);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    };
    Membrane.prototype.construct = function (target, argumentsList, newTarget) {
        argumentsList = unwrap$1(argumentsList);
        if (isArray$1(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap$1);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    };
    return Membrane;
}());
// Universal unwrap mechanism that works for any type of membrane
function unwrap$1(value) {
    // observable membrane goes first because it is in the critical path
    var unwrapped = unwrap(value);
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
    var piercing = Services.piercing;
    if (piercing) {
        var result_1 = value;
        var next_1 = true;
        var callback = function (newValue) {
            next_1 = false;
            result_1 = newValue;
        };
        for (var i = 0, len = piercing.length; next_1 && i < len; ++i) {
            piercing[i].call(undefined, target, key, value, callback);
        }
        return result_1 === value ? getReplica(membrane, result_1) : result_1;
    }
}
var piercingMembrane;
function createPiercingMembrane() {
    return new Membrane({
        get: function (membrane, target, key) {
            if (key === OwnerKey) {
                return undefined;
            }
            var value = target[key];
            return piercingHook(membrane, target, key, value);
        },
        set: function (membrane, target, key, newValue) {
            target[key] = newValue;
            return true;
        },
        deleteProperty: function (membrane, target, key) {
            delete target[key];
            return true;
        },
        apply: function (membrane, targetFn, thisArg, argumentsList) {
            return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
        },
        construct: function (membrane, targetFn, argumentsList, newTarget) {
            {
                assert.isTrue(newTarget, "construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.");
            }
            return getReplica(membrane, new (targetFn.bind.apply(targetFn, [void 0].concat(argumentsList)))());
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

var rootEventListenerMap = new WeakMap();
function getWrappedRootListener(vm, listener) {
    {
        assert.vm(vm);
    }
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    var wrappedListener = rootEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function (event) {
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            var _a = event, composed = _a.composed, target = _a.target, currentTarget = _a.currentTarget;
            if (
            // it is composed and was not dispatched onto the custom element directly
            (composed === true && target !== currentTarget) ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget) ||
                // it is not composed and its is coming from from shadow
                (composed === false && getRootNode.call(event.target) === currentTarget)) {
                var e = pierce(event);
                invokeEventListener(vm, EventListenerContext.ROOT_LISTENER, listener, e);
            }
        };
        wrappedListener.placement = EventListenerContext.ROOT_LISTENER;
        {
            wrappedListener.original = listener; // for logging purposes
        }
        rootEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}
var cmpEventListenerMap = new WeakMap();
function getWrappedComponentsListener(vm, listener) {
    {
        assert.vm(vm);
    }
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    var wrappedListener = cmpEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function (event) {
            var _a = event, composed = _a.composed, target = _a.target, currentTarget = _a.currentTarget;
            if (
            // it is composed, and we should always get it
            composed === true ||
                // it is dispatched onto the custom element directly
                target === currentTarget ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget)) {
                var e = pierce(event);
                invokeEventListener(vm, EventListenerContext.COMPONENT_LISTENER, listener, e);
            }
        };
        wrappedListener.placement = EventListenerContext.COMPONENT_LISTENER;
        {
            wrappedListener.original = listener; // for logging purposes
        }
        cmpEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}
function createElementEventListener(vm) {
    {
        assert.vm(vm);
    }
    return function (evt) {
        var interrupted = false;
        var type = evt.type, stopImmediatePropagation = evt.stopImmediatePropagation;
        var cmpEvents = vm.cmpEvents;
        var listeners = cmpEvents[type]; // it must have listeners at this point
        var len = listeners.length;
        evt.stopImmediatePropagation = function () {
            interrupted = true;
            stopImmediatePropagation.call(this);
        };
        for (var i = 0; i < len; i += 1) {
            if (listeners[i].placement === EventListenerContext.ROOT_LISTENER) {
                // all handlers on the custom element should be called with undefined 'this'
                listeners[i].call(undefined, evt);
                if (interrupted) {
                    return;
                }
            }
        }
        for (var i = 0; i < len; i += 1) {
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
    {
        assert.vm(vm);
    }
    var cmpListener = vm.cmpListener, cmpEvents = vm.cmpEvents;
    if (isUndefined(cmpListener)) {
        cmpListener = vm.cmpListener = createElementEventListener(vm);
    }
    if (isUndefined(cmpEvents)) {
        cmpEvents = vm.cmpEvents = create(null);
    }
    var cmpEventHandlers = cmpEvents[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = cmpEvents[type] = [];
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (cmpEventHandlers.length === 0) {
        addEventListener.call(vm.elm, type, cmpListener);
    }
    else {
        if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
            assert.logWarning(vm + " has duplicate listener " + wrappedListener.original + " for event \"" + type + "\". Instead add the event listener in the connectedCallback() hook.");
        }
    }
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}
function detachDOMListener(vm, type, wrappedListener) {
    {
        assert.vm(vm);
    }
    var cmpEvents = vm.cmpEvents;
    var p;
    var listeners;
    if (!isUndefined(cmpEvents) && !isUndefined(listeners = cmpEvents[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
        ArraySplice.call(listeners, p, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners.length === 0) {
            removeEventListener.call(vm.elm, type, vm.cmpListener);
        }
    }
    else {
        assert.logError("Did not find event listener " + wrappedListener.original + " for event \"" + type + "\" on " + vm + ". This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.");
    }
}
function addCmpEventListener(vm, type, listener, options) {
    {
        assert.vm(vm);
        assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by adding an event listener for \"" + type + "\".");
        assert.invariant(isFunction(listener), "Invalid second argument for this.template.addEventListener() in " + vm + " for event \"" + type + "\". Expected an EventListener but received " + listener + ".");
    }
    var wrappedListener = getWrappedComponentsListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}
function addRootEventListener(vm, type, listener, options) {
    {
        assert.vm(vm);
        assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by adding an event listener for \"" + type + "\".");
        assert.invariant(isFunction(listener), "Invalid second argument for this.template.addEventListener() in " + vm + " for event \"" + type + "\". Expected an EventListener but received " + listener + ".");
    }
    var wrappedListener = getWrappedRootListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}
function removeCmpEventListener(vm, type, listener, options) {
    {
        assert.vm(vm);
    }
    var wrappedListener = getWrappedComponentsListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}
function removeRootEventListener(vm, type, listener, options) {
    {
        assert.vm(vm);
    }
    var wrappedListener = getWrappedRootListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}

function getLinkedElement(root) {
    return getCustomElementVM(root).elm;
}
function createAccessibilityDescriptorForShadowRoot(propName, attrName, defaultValue) {
    // we use value as the storage mechanism and as the default value for the property
    return {
        enumerable: false,
        get: function () {
            var vm = getCustomElementVM(this);
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
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
var RootDescriptors = create(null);
// This routine will build a descriptor map for all AOM properties to be added
// to ShadowRoot prototype to polyfill AOM capabilities.
forEach.call(getOwnPropertyNames(GlobalAOMProperties), function (propName) { return RootDescriptors[propName] = createAccessibilityDescriptorForShadowRoot(propName, getAttrNameFromPropName(propName), GlobalAOMProperties[propName]); });
function shadowRootQuerySelector(shadowRoot, selector) {
    var vm = getCustomElementVM(shadowRoot);
    {
        assert.isFalse(isBeingConstructed(vm), "this.template.querySelector() cannot be called during the construction of the custom element for " + vm + " because no content has been rendered yet.");
    }
    var elm = getLinkedElement(shadowRoot);
    return getFirstMatch(vm, elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    var vm = getCustomElementVM(shadowRoot);
    {
        assert.isFalse(isBeingConstructed(vm), "this.template.querySelectorAll() cannot be called during the construction of the custom element for " + vm + " because no content has been rendered yet.");
    }
    var elm = getLinkedElement(shadowRoot);
    return getAllMatches(vm, elm, selector);
}
var Root = /** @class */ (function () {
    function Root(vm) {
        {
            assert.vm(vm);
        }
        defineProperty(this, ViewModelReflection, {
            value: vm,
        });
    }
    Object.defineProperty(Root.prototype, "mode", {
        get: function () {
            return 'closed';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Root.prototype, "host", {
        get: function () {
            return getCustomElementVM(this).component;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Root.prototype, "innerHTML", {
        get: function () {
            // TODO: should we add this only in dev mode? or wrap this in dev mode?
            throw new Error();
        },
        enumerable: true,
        configurable: true
    });
    Root.prototype.querySelector = function (selector) {
        var node = shadowRootQuerySelector(this, selector);
        {
            // TODO: this invocation into component is invalid, and should be eventually removed
            var component = getCustomElementComponent(this);
            if (isNull(node) && component.querySelector(selector)) {
                assert.logWarning("this.template.querySelector() can only return elements from the template declaration of " + component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.");
            }
        }
        return node;
    };
    Root.prototype.querySelectorAll = function (selector) {
        var nodeList = shadowRootQuerySelectorAll(this, selector);
        {
            // TODO: this invocation into component is invalid, and should be eventually removed
            var component = getCustomElementComponent(this);
            if (nodeList.length === 0 && component.querySelectorAll(selector).length) {
                assert.logWarning("this.template.querySelectorAll() can only return elements from template declaration of " + component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.");
            }
        }
        return nodeList;
    };
    Root.prototype.addEventListener = function (type, listener, options) {
        var vm = getCustomElementVM(this);
        addRootEventListener(vm, type, listener, options);
    };
    Root.prototype.removeEventListener = function (type, listener, options) {
        var vm = getCustomElementVM(this);
        removeRootEventListener(vm, type, listener, options);
    };
    Root.prototype.toString = function () {
        var component = getCustomElementComponent(this);
        return "Current ShadowRoot for " + component;
    };
    return Root;
}());
defineProperties(Root.prototype, RootDescriptors);
function getFirstMatch(vm, elm, selector) {
    var nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (var i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(nodeList[i]);
        }
    }
    return null;
}
function getAllMatches(vm, elm, selector) {
    var nodeList = querySelectorAll.call(elm, selector);
    var filteredNodes = ArrayFilter.call(nodeList, function (node) { return isNodeOwnedByVM(vm, node); });
    return pierce(filteredNodes);
}
function getElementOwnerVM(elm) {
    if (!(elm instanceof Node)) {
        return;
    }
    var node = elm;
    var ownerKey;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = node[OwnerKey]))) {
        node = node.parentNode;
    }
    if (isUndefined(ownerKey) || isNull(node)) {
        return;
    }
    var vm;
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
    return _a = {}, _a[TargetSlot$1] = win, _a.postMessage = function () {
            return win.postMessage.apply(win, arguments);
        }, _a.blur = function () {
            return win.blur.apply(win, arguments);
        }, _a.close = function () {
            return win.close.apply(win, arguments);
        }, _a.focus = function () {
            return win.focus.apply(win, arguments);
        }, Object.defineProperty(_a, "closed", {
            get: function () {
                return win.closed;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "frames", {
            get: function () {
                return win.frames;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "length", {
            get: function () {
                return win.length;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "location", {
            get: function () {
                return win.location;
            },
            set: function (value) {
                win.location = value;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "opener", {
            get: function () {
                return win.opener;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "parent", {
            get: function () {
                return win.parent;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "self", {
            get: function () {
                return win.self;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "top", {
            get: function () {
                return win.top;
            },
            enumerable: true,
            configurable: true
        }), Object.defineProperty(_a, "window", {
            get: function () {
                return win.window;
            },
            enumerable: true,
            configurable: true
        }), _a;
    var _a;
}
var GET_ROOT_NODE_CONFIG_FALSE = { composed: false };
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing: function (target, key, value, callback) {
        if (value) {
            if (isIframeContentWindow(key, value)) {
                callback(wrapIframeWindow(value));
            }
            if (value === querySelector) {
                return callback(function (selector) {
                    var vm = getElementOwnerVM(target);
                    return isUndefined(vm) ? null : getFirstMatch(vm, target, selector);
                });
            }
            if (value === querySelectorAll) {
                return callback(function (selector) {
                    var vm = getElementOwnerVM(target);
                    return isUndefined(vm) ? [] : getAllMatches(vm, target, selector);
                });
            }
            if (isParentNodeKeyword(key)) {
                var vm = getElementOwnerVM(target);
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
                var event = target;
                switch (key) {
                    case 'currentTarget':
                        // intentionally return the host element pierced here otherwise the general role below
                        // will kick in and return the cmp, which is not the intent.
                        return callback(pierce(value));
                    case 'target':
                        var currentTarget = event.currentTarget;
                        // Executing event listener on component, target is always currentTarget
                        if (componentEventListenerType === EventListenerContext.COMPONENT_LISTENER) {
                            return callback(pierce(currentTarget));
                        }
                        // Event is coming from an slotted element
                        if (isChildNode(getRootNode.call(value, GET_ROOT_NODE_CONFIG_FALSE), currentTarget)) {
                            return;
                        }
                        // target is owned by the VM
                        var vm = currentTarget ? getElementOwnerVM(currentTarget) : undefined;
                        if (!isUndefined(vm)) {
                            var node = value;
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
    var get = descriptor.get, set = descriptor.set, enumerable = descriptor.enumerable, configurable = descriptor.configurable;
    if (!isFunction(get)) {
        {
            assert.fail("Detected invalid public property descriptor for HTMLElement.prototype." + propName + " definition. Missing the standard getter.");
        }
        throw new TypeError();
    }
    if (!isFunction(set)) {
        {
            assert.fail("Detected invalid public property descriptor for HTMLElement.prototype." + propName + " definition. Missing the standard setter.");
        }
        throw new TypeError();
    }
    return {
        enumerable: enumerable,
        configurable: configurable,
        get: function () {
            var vm = this[ViewModelReflection];
            {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                {
                    assert.logError(vm + " constructor should not read the value of property \"" + propName + "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties.");
                }
                return;
            }
            observeMutation$1(this, propName);
            return get.call(vm.elm);
        },
        set: function (newValue) {
            var vm = this[ViewModelReflection];
            {
                assert.vm(vm);
                assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + propName);
                assert.isFalse(isBeingConstructed(vm), "Failed to construct '" + this + "': The result must not have attributes.");
                assert.invariant(!isObject$1(newValue) || isNull(newValue), "Invalid value \"" + newValue + "\" for \"" + propName + "\" of " + vm + ". Value cannot be an object, must be a primitive value.");
            }
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
var htmlElementDescriptors = ArrayReduce.call(getOwnPropertyNames(GlobalHTMLPropDescriptors), function (seed, propName) {
    seed[propName] = getHTMLPropDescriptor(propName, GlobalHTMLPropDescriptors[propName]);
    return seed;
}, {});
function getLinkedElement$1(cmp) {
    return cmp[ViewModelReflection].elm;
}
function querySelectorAllFromComponent(cmp, selectors) {
    var elm = getLinkedElement$1(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
function LWCElement() {
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
    }
    {
        assert.vm(vmBeingConstructed);
        assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, "Component creation requires a DOM element to be associated to " + vmBeingConstructed + ".");
    }
    var vm = vmBeingConstructed;
    var elm = vm.elm, def = vm.def;
    var component = this;
    vm.component = component;
    // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        var _a = arguments[0], callHook = _a.callHook, setHook = _a.setHook, getHook = _a.getHook;
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
    dispatchEvent: function (event) {
        var elm = getLinkedElement$1(this);
        var vm = getCustomElementVM(this);
        {
            if (arguments.length === 0) {
                throw new Error("Failed to execute 'dispatchEvent' on " + this + ": 1 argument required, but only 0 present.");
            }
            if (!(event instanceof CustomEvent) && !(event instanceof Event)) {
                throw new Error("Failed to execute 'dispatchEvent' on " + this + ": parameter 1 is not of type 'Event'.");
            }
            var evtName = event.type, composed = event.composed, bubbles = event.bubbles;
            assert.isFalse(isBeingConstructed(vm), "this.dispatchEvent() should not be called during the construction of the custom element for " + this + " because no one is listening for the event \"" + evtName + "\" just yet.");
            if (bubbles && ('composed' in event && !composed)) {
                assert.logWarning("Invalid event \"" + evtName + "\" dispatched in element " + this + ". Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.");
            }
            if (vm.idx === 0) {
                assert.logWarning("Unreachable event \"" + evtName + "\" dispatched from disconnected element " + this + ". Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).");
            }
            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning("Invalid event type: '" + evtName + "' dispatched in element " + this + ". Event name should only contain lowercase alphanumeric characters.");
            }
        }
        // Pierce dispatchEvent so locker service has a chance to overwrite
        var dispatchEvent = pierceProperty(elm, 'dispatchEvent');
        return dispatchEvent.call(elm, event);
    },
    addEventListener: function (type, listener, options) {
        var vm = getCustomElementVM(this);
        {
            assert.vm(vm);
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning("this.addEventListener() on " + vm + " does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.");
            }
        }
        addCmpEventListener(vm, type, listener, options);
    },
    removeEventListener: function (type, listener, options) {
        var vm = getCustomElementVM(this);
        removeCmpEventListener(vm, type, listener, options);
    },
    setAttributeNS: function (ns, attrName, value) {
        {
            assert.isFalse(isBeingConstructed(this[ViewModelReflection]), "Failed to construct '" + this + "': The result must not have attributes.");
        }
        // use cached setAttributeNS, because elm.setAttribute throws
        // when not called in template
        return setAttributeNS.call(getLinkedElement$1(this), ns, attrName, value);
    },
    removeAttributeNS: function (ns, attrName) {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS.call(getLinkedElement$1(this), ns, attrName);
    },
    removeAttribute: function (attrName) {
        var vm = getCustomElementVM(this);
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        removeAttribute.call(vm.elm, attrName);
        attemptAriaAttributeFallback(vm, attrName);
    },
    setAttribute: function (attrName, value) {
        var vm = getCustomElementVM(this);
        {
            assert.isFalse(isBeingConstructed(vm), "Failed to construct '" + this + "': The result must not have attributes.");
        }
        // marking the set is needed for the AOM polyfill
        vm.hostAttrs[attrName] = 1;
        // use cached setAttribute, because elm.setAttribute throws
        // when not called in template
        return setAttribute.call(getLinkedElement$1(this), attrName, value);
    },
    getAttributeNS: function (ns, attrName) {
        return getAttributeNS.call(getLinkedElement$1(this), ns, attrName);
    },
    getAttribute: function (attrName) {
        // logging errors for experimental and special attributes
        {
            var vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isString(attrName)) {
                var propName = getPropNameFromAttrName(attrName);
                var info = getGlobalHTMLPropertiesInfo();
                if (info[propName] && info[propName].attribute) {
                    var _a = info[propName], error = _a.error, experimental = _a.experimental;
                    if (error) {
                        assert.logError(error);
                    }
                    else if (experimental) {
                        assert.logError("Attribute `" + attrName + "` is an experimental attribute that is not standardized or supported by all browsers. Property \"" + propName + "\" and attribute \"" + attrName + "\" are ignored.");
                    }
                }
            }
        }
        return getAttribute.apply(getLinkedElement$1(this), ArraySlice$1.call(arguments));
    },
    getBoundingClientRect: function () {
        var elm = getLinkedElement$1(this);
        {
            var vm = getCustomElementVM(this);
            assert.isFalse(isBeingConstructed(vm), "this.getBoundingClientRect() should not be called during the construction of the custom element for " + this + " because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.");
        }
        return elm.getBoundingClientRect();
    },
    querySelector: function (selectors) {
        var vm = getCustomElementVM(this);
        {
            assert.isFalse(isBeingConstructed(vm), "this.querySelector() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        }
        var nodeList = querySelectorAllFromComponent(this, selectors);
        for (var i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(nodeList[i]);
            }
        }
        {
            if (shadowRootQuerySelector(this.template, selectors)) {
                assert.logWarning("this.querySelector() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.template.querySelector() instead.");
            }
        }
        return null;
    },
    querySelectorAll: function (selectors) {
        var vm = getCustomElementVM(this);
        {
            assert.isFalse(isBeingConstructed(vm), "this.querySelectorAll() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        }
        var nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        var filteredNodes = ArrayFilter.call(nodeList, function (node) { return wasNodePassedIntoVM(vm, node); });
        {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(this.template, selectors).length) {
                assert.logWarning("this.querySelectorAll() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.template.querySelectorAll() instead.");
            }
        }
        return pierce(filteredNodes);
    },
    get tagName() {
        var elm = getLinkedElement$1(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get classList() {
        {
            var vm = getCustomElementVM(this);
            // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(isBeingConstructed(vm), "Failed to construct " + vm + ": The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.");
        }
        return getLinkedElement$1(this).classList;
    },
    get template() {
        var vm = getCustomElementVM(this);
        {
            assert.vm(vm);
        }
        var cmpRoot = vm.cmpRoot;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    get root() {
        {
            var vm = getCustomElementVM(this);
            assert.logWarning("\"this.root\" access in " + vm.component + " has been deprecated and will be removed. Use \"this.template\" instead.");
        }
        return this.template;
    },
    toString: function () {
        var vm = getCustomElementVM(this);
        {
            assert.vm(vm);
        }
        var elm = vm.elm;
        var tagName = elm.tagName;
        var is = getAttribute.call(elm, 'is');
        return "<" + tagName.toLowerCase() + (is ? ' is="${is}' : '') + ">";
    },
};
defineProperties(LWCElement.prototype, htmlElementDescriptors);
// Global HTML Attributes
{
    var info_1 = getGlobalHTMLPropertiesInfo();
    forEach.call(getOwnPropertyNames(info_1), function (propName) {
        if (propName in LWCElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(LWCElement.prototype, propName, {
            get: function () {
                var vm = getCustomElementVM(this);
                var _a = info_1[propName], error = _a.error, attribute = _a.attribute, readOnly = _a.readOnly, experimental = _a.experimental;
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
                console.log(msg.join('\n')); // tslint:disable-line
                return; // explicit undefined
            },
            // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
            set: function () { },
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

var CHAR_S = 115;
var CHAR_V = 118;
var CHAR_G = 103;
var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
var SymbolIterator = Symbol.iterator;
var ELEMENT_NODE = Node.ELEMENT_NODE, TEXT_NODE = Node.TEXT_NODE, COMMENT_NODE = Node.COMMENT_NODE;
var classNameToClassMap = create(null);
function getMapFromClassName(className) {
    if (className === undefined) {
        return;
    }
    var map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    var start = 0;
    var o;
    var len = className.length;
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
var hook = {
    postpatch: function (oldVNode, vnode) {
        var vm = getCustomElementVM(vnode.elm);
        vm.cmpSlots = vnode.data.slotset;
        // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
        // one of those is changed, the vm should be marked as dirty.
        // TODO: Issue #133
        if (vm.cmpSlots !== oldVNode.data.slotset && !vm.isDirty) {
            markComponentAsDirty(vm);
        }
        renderVM(vm);
    },
    insert: function (vnode) {
        var vm = getCustomElementVM(vnode.elm);
        appendVM(vm);
        renderVM(vm);
    },
    create: function (oldVNode, vnode) {
        createVM(vnode.sel, vnode.elm, vnode.data.slotset);
    },
    destroy: function (vnode) {
        removeVM(getCustomElementVM(vnode.elm));
    }
};
function isVElement(vnode) {
    return vnode.nt === ELEMENT_NODE;
}
function addNS(vnode) {
    var data = vnode.data, children = vnode.children, sel = vnode.sel;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray$1(children) && sel !== 'foreignObject') {
        for (var j = 0, n = children.length; j < n; ++j) {
            var childNode = children[j];
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
        assert.isTrue(isString(sel), "h() 1st argument sel must be a string.");
        assert.isTrue(isObject$1(data), "h() 2nd argument data must be an object.");
        assert.isTrue(isArray$1(children), "h() 3rd argument children must be an array.");
        assert.isTrue(('key' in data) || !!data.key, " <" + sel + "> \"key\" attribute is invalid or missing for " + vmBeingRendered + ". Key inside iterator is either undefined or null.");
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling h().");
        assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
        assert.isFalse(data.styleMap && data.style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");
        if (data.style && !isString(data.style)) {
            assert.logWarning("Invalid 'style' attribute passed to <" + sel + "> should be a string value, and will be ignored.");
        }
        forEach.call(children, function (childVnode) {
            if (childVnode != null) {
                assert.vnode(childVnode);
            }
        });
    }
    var classMap = data.classMap, className = data.className, style = data.style, styleMap = data.styleMap, key = data.key;
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentTplToken();
    data.uid = getCurrentOwnerId();
    var text, elm; // tslint:disable-line
    var vnode = {
        nt: ELEMENT_NODE,
        tag: sel,
        sel: sel,
        data: data,
        children: children,
        text: text,
        elm: elm,
        key: key,
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
    {
        assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
        assert.isTrue(isFunction(Ctor), "c() 2nd argument Ctor must be a function.");
        assert.isTrue(isObject$1(data), "c() 3nd argument data must be an object.");
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling c().");
        assert.isTrue(arguments.length < 4, "Compiler Issue: Custom elements expect up to 3 arguments, received " + arguments.length + " instead.");
        assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
        assert.isFalse(data.styleMap && data.style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");
        if (data.style && !isString(data.style)) {
            assert.logWarning("Invalid 'style' attribute passed to <" + sel + "> should be a string value, and will be ignored.");
        }
    }
    var key = data.key, slotset = data.slotset, styleMap = data.styleMap, style = data.style, on = data.on, className = data.className, classMap = data.classMap, props = data.props;
    var attrs = data.attrs;
    // hack to allow component authors to force the usage of the "is" attribute in their components
    var forceTagName = Ctor.forceTagName;
    var tag = sel, text, elm; // tslint:disable-line
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
    data = { hook: hook, key: key, slotset: slotset, attrs: attrs, on: on, props: props };
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentTplToken();
    data.uid = getCurrentOwnerId();
    var vnode = {
        nt: ELEMENT_NODE,
        tag: tag,
        sel: sel,
        data: data,
        children: EmptyArray,
        text: text,
        elm: elm,
        key: key,
    };
    return vnode;
}
// [i]terable node
function i(iterable, factory) {
    var list = [];
    if (isUndefined(iterable) || iterable === null) {
        {
            assert.logWarning("Invalid template iteration for value \"" + iterable + "\" in " + vmBeingRendered + ", it should be an Array or an iterable Object.");
        }
        return list;
    }
    {
        assert.isFalse(isUndefined(iterable[SymbolIterator]), "Invalid template iteration for value `" + iterable + "` in " + vmBeingRendered + ", it requires an array-like object, not `null` or `undefined`.");
    }
    var iterator = iterable[SymbolIterator]();
    {
        assert.isTrue(iterator && isFunction(iterator.next), "Invalid iterator function for \"" + iterable + "\" in " + vmBeingRendered + ".");
    }
    var next = iterator.next();
    var j = 0;
    var value = next.value, last = next.done;
    var keyMap;
    var iterationError;
    {
        keyMap = create(null);
    }
    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;
        // template factory logic based on the previous collected value
        var vnode = factory(value, j, j === 0, last);
        if (isArray$1(vnode)) {
            ArrayPush.apply(list, vnode);
        }
        else {
            ArrayPush.call(list, vnode);
        }
        {
            var vnodes = isArray$1(vnode) ? vnode : [vnode];
            forEach.call(vnodes, function (childVnode) {
                if (!isNull(childVnode) && isObject$1(childVnode) && !isUndefined(childVnode.sel)) {
                    var key = childVnode.key;
                    if (isString(key) || isNumber(key)) {
                        if (keyMap[key] === 1 && isUndefined(iterationError)) {
                            iterationError = "Duplicated \"key\" attribute value for \"<" + childVnode.sel + ">\" in " + vmBeingRendered + " for item number " + j + ". Key with value \"" + childVnode.key + "\" appears more than once in iteration. Key values must be unique numbers or strings.";
                        }
                        keyMap[key] = 1;
                    }
                    else if (isUndefined(iterationError)) {
                        iterationError = "Invalid \"key\" attribute value in \"<" + childVnode.sel + ">\" in " + vmBeingRendered + " for item number " + j + ". Instead set a unique \"key\" attribute value on all iteration children so internal state can be preserved during rehydration.";
                    }
                }
            });
        }
        // preparing next value
        j += 1;
        value = next.value;
    }
    {
        if (!isUndefined(iterationError)) {
            assert.logError(iterationError);
        }
    }
    return list;
}
/**
 * [f]lattening
 */
function f(items) {
    {
        assert.isTrue(isArray$1(items), 'flattening api can only work with arrays.');
    }
    var len = items.length;
    var flattened = [];
    for (var j = 0; j < len; j += 1) {
        var item = items[j];
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
    var sel, data = {}, children, key, elm; // tslint:disable-line
    return {
        nt: TEXT_NODE,
        sel: sel,
        data: data,
        children: children,
        text: text,
        elm: elm,
        key: key,
    };
}
function p(text) {
    var sel = '!', data = {}, children, key, elm; // tslint:disable-line
    return {
        nt: COMMENT_NODE,
        sel: sel,
        data: data,
        children: children,
        text: text,
        elm: elm,
        key: key,
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
    var vm = vmBeingRendered;
    return function handler(event) {
        if (!isValidEvent(event)) {
            return;
        }
        var e = pierce(event);
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
            {
                assert.fail("Invalid key value \"" + obj + "\" in " + vmBeingRendered + ". Key must be a string or number.");
            }
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

var EmptySlots = create(null);
function getSlotsetValue(slotset, slotName) {
    {
        assert.isTrue(isObject$1(slotset), "Invalid slotset value " + toString(slotset));
    }
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}
var slotsetProxyHandler = {
    get: function (slotset, key) { return getSlotsetValue(slotset, key); },
    set: function () {
        {
            assert.logError("$slotset object cannot be mutated from template.");
        }
        return false;
    },
    deleteProperty: function () {
        {
            assert.logError("$slotset object cannot be mutated from template.");
        }
        return false;
    },
};
function validateSlots(vm, html) {
    {
        var _a = vm.cmpSlots, cmpSlots = _a === void 0 ? EmptySlots : _a;
        var _b = html.slots, slots = _b === void 0 ? EmptyArray : _b;
        for (var slotName in cmpSlots) {
            assert.isTrue(isArray$1(cmpSlots[slotName]), "Slots can only be set to an array, instead received " + toString(cmpSlots[slotName]) + " for slot " + slotName + " in " + vm + ".");
            if (ArrayIndexOf.call(slots, slotName) === -1) {
                // TODO: this should never really happen because the compiler should always validate
                assert.logWarning("Ignoring unknown provided slot name \"" + slotName + "\" in " + vm + ". This is probably a typo on the slot attribute.");
            }
        }
    }
}
function validateFields(vm, html) {
    {
        var component_1 = vm.component;
        // validating identifiers used by template that should be provided by the component
        var _a = html.ids, ids = _a === void 0 ? [] : _a;
        forEach.call(ids, function (propName) {
            if (!(propName in component_1)) {
                assert.logWarning("The template rendered by " + vm + " references `this." + propName + "`, which is not declared. This is likely a typo in the template.");
            }
            else if (hasOwnProperty.call(component_1, propName)) {
                {
                    assert.fail(component_1 + "'s template is accessing `this." + toString(propName) + "` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to `this.state." + toString(propName) + "`.");
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
    var context = vm.context;
    var oldToken = context.tplToken;
    var newToken = html.token;
    if (oldToken !== newToken) {
        var host = vm.elm;
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
        assert.isTrue(isFunction(html), "evaluateTemplate() second argument must be a function instead of " + html);
    }
    // TODO: add identity to the html functions
    var component = vm.component, context = vm.context, _a = vm.cmpSlots, cmpSlots = _a === void 0 ? EmptySlots : _a, cmpTemplate = vm.cmpTemplate;
    // reset the cache memoizer for template when needed
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
        assert.isTrue(isObject$1(context.tplCache), "vm.context.tplCache must be an object associated to " + cmpTemplate + ".");
    }
    var _b = Proxy.revocable(cmpSlots, slotsetProxyHandler), slotset = _b.proxy, slotsetRevoke = _b.revoke;
    var vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    {
        assert.invariant(isArray$1(vnodes), "Compiler should produce html functions that always return an array.");
    }
    slotsetRevoke();
    return vnodes;
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs
var isUserTimingSupported = typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';
function getMarkName(vm, phase) {
    return "<" + vm.def.name + " (" + vm.uid + ")> - " + phase;
}
function startMeasure(vm, phase) {
    if (!isUserTimingSupported) {
        return;
    }
    var name = getMarkName(vm, phase);
    performance.mark(name);
}
function endMeasure(vm, phase) {
    if (!isUserTimingSupported) {
        return;
    }
    var name = getMarkName(vm, phase);
    performance.measure(name, name);
    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}

var isRendering = false;
var vmBeingRendered = null;
var vmBeingConstructed = null;
function isBeingConstructed(vm) {
    {
        assert.vm(vm);
    }
    return vmBeingConstructed === vm;
}
function invokeComponentCallback(vm, fn, args) {
    var context = vm.context, component = vm.component, callHook = vm.callHook;
    var ctx = currentContext;
    establishContext(context);
    var result;
    var error;
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
    var context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    {
        startMeasure(vm, 'constructor');
    }
    var error;
    try {
        new Ctor(); // tslint:disable-line
    }
    catch (e) {
        error = Object(e);
    }
    finally {
        {
            endMeasure(vm, 'constructor');
        }
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
    var render = vm.def.render, callHook = vm.callHook;
    if (isUndefined(render)) {
        return [];
    }
    var component = vm.component, context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var isRenderingInception = isRendering;
    var vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    var result;
    var error;
    {
        startMeasure(vm, 'render');
    }
    try {
        var html = callHook(component, render);
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        }
        else if (!isUndefined(html)) {
            {
                assert.fail("The template rendered by " + vm + " must return an imported template tag (e.g.: `import html from \"./mytemplate.html\"`) or undefined, instead, it has returned " + html + ".");
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
var EventListenerContext;
(function (EventListenerContext) {
    EventListenerContext[EventListenerContext["COMPONENT_LISTENER"] = 1] = "COMPONENT_LISTENER";
    EventListenerContext[EventListenerContext["ROOT_LISTENER"] = 2] = "ROOT_LISTENER";
})(EventListenerContext || (EventListenerContext = {}));
var componentEventListenerType = null;
function invokeEventListener(vm, listenerContext, fn, event) {
    var context = vm.context, callHook = vm.callHook;
    var ctx = currentContext;
    establishContext(context);
    var error;
    var componentEventListenerTypeInception = componentEventListenerType;
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
    {
        if (arguments.length !== 3) {
            assert.fail("@track decorator can only be used with one argument to return a trackable object, or as a decorator function.");
        }
        if (!isUndefined(descriptor)) {
            var get = descriptor.get, set = descriptor.set, configurable = descriptor.configurable, writable = descriptor.writable;
            assert.isTrue(!get && !set, "Compiler Error: A @track decorator can only be applied to a public field.");
            assert.isTrue(configurable !== false, "Compiler Error: A @track decorator can only be applied to a configurable property.");
            assert.isTrue(writable !== false, "Compiler Error: A @track decorator can only be applied to a writable property.");
        }
    }
    return createTrackedPropertyDescriptor(target, prop, isUndefined(descriptor) ? true : descriptor.enumerable === true);
}
function createTrackedPropertyDescriptor(Ctor, key, enumerable) {
    return {
        get: function () {
            var vm = getCustomElementVM(this);
            {
                assert.vm(vm);
            }
            observeMutation$1(this, key);
            return vm.cmpTrack[key];
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + key);
            }
            var reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);
            if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
                {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    var isObservable = reactiveOrAnyValue !== newValue;
                    if (!isObservable && newValue !== null && (isObject$1(newValue) || isArray$1(newValue))) {
                        assert.logWarning("Property \"" + key + "\" of " + vm + " is set to a non-trackable object, which means changes into that object cannot be observed.");
                    }
                }
                vm.cmpTrack[key] = reactiveOrAnyValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation$1(this, key);
                }
            }
        },
        enumerable: enumerable,
        configurable: true,
    };
}

function wireDecorator(target, prop, descriptor) {
    {
        if (!isUndefined(descriptor)) {
            var get = descriptor.get, set = descriptor.set, configurable = descriptor.configurable, writable = descriptor.writable;
            assert.isTrue(!get && !set, "Compiler Error: A @wire decorator can only be applied to a public field.");
            assert.isTrue(configurable !== false, "Compiler Error: A @wire decorator can only be applied to a configurable property.");
            assert.isTrue(writable !== false, "Compiler Error: A @wire decorator can only be applied to a writable property.");
        }
    }
    // TODO: eventually this decorator should have its own logic
    return createTrackedPropertyDescriptor(target, prop, isObject$1(descriptor) ? descriptor.enumerable === true : true);
}
// @wire is a factory that when invoked, returns the wire decorator
function wire(adapter, config) {
    var len = arguments.length;
    if (len > 0 && len < 3) {
        return wireDecorator;
    }
    else {
        {
            assert.fail("@wire(adapter, config?) may only be used as a decorator.");
        }
        throw new TypeError();
    }
}

var COMPUTED_GETTER_MASK = 1;
var COMPUTED_SETTER_MASK = 2;
function api$1(target, propName, descriptor) {
    {
        if (arguments.length !== 3) {
            assert.fail("@api decorator can only be used as a decorator function.");
        }
    }
    var meta = target.publicProps;
    // publicProps must be an own property, otherwise the meta is inherited.
    var config = (!isUndefined(meta) && hasOwnProperty.call(target, 'publicProps') && hasOwnProperty.call(meta, propName)) ? meta[propName].config : 0;
    // initializing getters and setters for each public prop on the target prototype
    if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
        {
            assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), "Invalid property " + propName + " definition in " + target + ", it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.");
            var mustHaveGetter = COMPUTED_GETTER_MASK & config;
            var mustHaveSetter = COMPUTED_SETTER_MASK & config;
            if (mustHaveGetter) {
                assert.isTrue(isObject$1(descriptor) && isFunction(descriptor.get), "Missing getter for property " + propName + " decorated with @api in " + target);
            }
            if (mustHaveSetter) {
                assert.isTrue(isObject$1(descriptor) && isFunction(descriptor.set), "Missing setter for property " + propName + " decorated with @api in " + target);
                assert.isTrue(mustHaveGetter, "Missing getter for property " + propName + " decorated with @api in " + target + ". You cannot have a setter without the corresponding getter.");
            }
        }
        // if it is configured as an accessor it must have a descriptor
        return createPublicAccessorDescriptor(target, propName, descriptor);
    }
    else {
        return createPublicPropertyDescriptor(target, propName, descriptor);
    }
}
var vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    {
        assert.vm(vm);
    }
    vmBeingUpdated = vm;
}
function createPublicPropertyDescriptor(proto, key, descriptor) {
    return {
        get: function () {
            var vm = getCustomElementVM(this);
            {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                {
                    assert.logError(vm + " constructor should not read the value of property \"" + key + "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties.");
                }
                return;
            }
            observeMutation$1(this, key);
            return vm.cmpProps[key];
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + key);
            }
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    var isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject$1(newValue)) {
                        assert.logWarning("Assigning a non-reactive value " + newValue + " to member property " + key + " of " + vm + " is not common because mutations on that value cannot be observed.");
                    }
                }
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
            else {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.logError("Invalid attempt to set property " + key + " from " + vm + " to " + newValue + ". This property was decorated with @api, and can only be changed via the template.");
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    };
}
function createPublicAccessorDescriptor(Ctor, key, descriptor) {
    var get = descriptor.get, set = descriptor.set, enumerable = descriptor.enumerable;
    if (!isFunction(get)) {
        {
            assert.fail("Invalid attempt to create public property descriptor " + key + " in " + Ctor + ". It is missing the getter declaration with @api get " + key + "() {} syntax.");
        }
        throw new TypeError();
    }
    return {
        get: function () {
            {
                var vm = getCustomElementVM(this);
                assert.vm(vm);
            }
            return get.call(this);
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            {
                assert.vm(vm);
                assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + key);
            }
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    var isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject$1(newValue)) {
                        assert.logWarning("Assigning a non-reactive value " + newValue + " to member property " + key + " of " + vm + " is not common because mutations on that value cannot be observed.");
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
                }
                else {
                    assert.fail("Invalid attempt to set a new value for property " + key + " of " + vm + " that does not has a setter decorated with @api.");
                }
            }
            else {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.fail("Invalid attempt to set property " + key + " from " + vm + " to " + newValue + ". This property was decorated with @api, and can only be changed via the template.");
            }
        },
        enumerable: enumerable,
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
var CtorToDefMap = new WeakMap();
function propertiesReducer(seed, propName) {
    seed[propName] = {
        config: 3,
        type: 'any',
        attr: getAttrNameFromPropName(propName),
    };
    return seed;
}
var reducedDefaultHTMLPropertyNames = ArrayReduce.call(defaultDefHTMLPropertyNames, propertiesReducer, create(null));
var HTML_PROPS = ArrayReduce.call(getOwnPropertyNames(GlobalAOMProperties), propertiesReducer, reducedDefaultHTMLPropertyNames);
function getCtorProto(Ctor) {
    var proto = getPrototypeOf(Ctor);
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (hasOwnProperty.call(proto, '__circular__')) {
        proto = proto();
    }
    return proto;
}
function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    var proto = getCtorProto(Ctor);
    if (proto === LWCElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}
function createComponentDef(Ctor) {
    {
        assert.isTrue(isElementComponent(Ctor), Ctor + " is not a valid component, or does not extends Element from \"engine\". You probably forgot to add the extend clause on the class declaration.");
        // local to dev block
        var ctorName = Ctor.name;
        assert.isTrue(ctorName && isString(ctorName), toString(Ctor) + " should have a \"name\" property with string value, but found " + ctorName + ".");
        assert.isTrue(Ctor.constructor, "Missing " + ctorName + ".constructor, " + ctorName + " should have a \"constructor\" property.");
    }
    var name = Ctor.name;
    var props = getPublicPropertiesHash(Ctor);
    var methods = getPublicMethodsHash(Ctor);
    var wire$$1 = getWireHash(Ctor);
    var track$$1 = getTrackHash(Ctor);
    var proto = Ctor.prototype;
    var decoratorMap = create(null);
    // TODO: eventually, the compiler should do this work
    {
        for (var propName in props) {
            decoratorMap[propName] = api$1;
        }
        if (wire$$1) {
            for (var propName in wire$$1) {
                var wireDef = wire$$1[propName];
                if (wireDef.method) {
                    // for decorated methods we need to do nothing
                    continue;
                }
                decoratorMap[propName] = wire(wireDef.adapter, wireDef.params);
            }
        }
        if (track$$1) {
            for (var propName in track$$1) {
                decoratorMap[propName] = track;
            }
        }
        decorate(Ctor, decoratorMap);
    }
    var connectedCallback = proto.connectedCallback, disconnectedCallback = proto.disconnectedCallback, renderedCallback = proto.renderedCallback, errorCallback = proto.errorCallback, render = proto.render;
    var superProto = getCtorProto(Ctor);
    var superDef = superProto !== LWCElement ? getComponentDef(superProto) : null;
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
    var descriptors = createCustomElementDescriptorMap(props, methods);
    var def = {
        name: name,
        wire: wire$$1,
        track: track$$1,
        props: props,
        methods: methods,
        descriptors: descriptors,
        connectedCallback: connectedCallback,
        disconnectedCallback: disconnectedCallback,
        renderedCallback: renderedCallback,
        errorCallback: errorCallback,
        render: render,
    };
    {
        freeze(Ctor.prototype);
        freeze(wire$$1);
        freeze(props);
        freeze(methods);
        for (var key in def) {
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
        var vm = getCustomElementVM(this);
        var getHook = vm.getHook;
        return getHook(vm.component, key);
    };
}
function createSetter(key) {
    return function (newValue) {
        var vm = getCustomElementVM(this);
        var setHook = vm.setHook;
        setHook(vm.component, key, newValue);
    };
}
function createMethodCaller(method) {
    return function () {
        var vm = getCustomElementVM(this);
        var callHook = vm.callHook;
        return callHook(vm.component, method, ArraySlice$1.call(arguments));
    };
}
function getAttributePatched(attrName) {
    {
        var vm = getCustomElementVM(this);
        assertPublicAttributeCollision(vm, attrName);
    }
    return getAttribute.apply(this, ArraySlice$1.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    var vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    vm.hostAttrs[attrName] = 1; // marking the set is needed for the AOM polyfill
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    setAttribute.apply(this, ArraySlice$1.call(arguments));
}
function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
    var vm = getCustomElementVM(this);
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    setAttributeNS.apply(this, ArraySlice$1.call(arguments));
}
function removeAttributePatched(attrName) {
    var vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    removeAttribute.apply(this, ArraySlice$1.call(arguments));
    attemptAriaAttributeFallback(vm, attrName);
}
function removeAttributeNSPatched(attrNameSpace, attrName) {
    var vm = getCustomElementVM(this);
    {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    removeAttributeNS.apply(this, ArraySlice$1.call(arguments));
}
function assertPublicAttributeCollision(vm, attrName) {
    var propName = isString(attrName) ? getPropNameFromAttrName(attrName.toLocaleLowerCase()) : null;
    var propsConfig = vm.def.props;
    if (propsConfig && propName && propsConfig[propName]) {
        assert.logError("Invalid attribute \"" + attrName.toLocaleLowerCase() + "\" for " + vm + ". Instead access the public property with `element." + propName + ";`.");
    }
}
function assertTemplateMutationViolation(vm, attrName) {
    var elm = vm.elm;
    if (!isAttributeChangeControlled(attrName) && !isUndefined(elm[OwnerKey])) {
        assert.logError("Invalid operation on Element " + vm + ". Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute \"" + attrName + "\", you can update the state of the component, and let the engine to rehydrate the element accordingly.");
    }
    // attribute change control must be released every time its value is checked
    resetAttributeChangeControl();
}
var controlledAttributeChange = false;
var controlledAttributeName;
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
function createCustomElementDescriptorMap(publicProps, publicMethodsConfig) {
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
    for (var key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
        };
    }
    // expose public methods as props on the Element
    for (var key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(publicMethodsConfig[key]),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    var track$$1 = target.track;
    if (!getOwnPropertyDescriptor(target, 'track') || !track$$1 || !getOwnPropertyNames(track$$1).length) {
        return EmptyObject;
    }
    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track$$1);
}
function getWireHash(target) {
    var wire$$1 = target.wire;
    if (!getOwnPropertyDescriptor(target, 'wire') || !wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
    }
    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire$$1);
}
function getPublicPropertiesHash(target) {
    var props = target.publicProps;
    if (!getOwnPropertyDescriptor(target, 'publicProps') || !props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
        var attrName = getAttrNameFromPropName(propName);
        {
            var globalHTMLProperty = getGlobalHTMLPropertiesInfo()[propName];
            if (globalHTMLProperty && globalHTMLProperty.attribute && globalHTMLProperty.reflective === false) {
                var error = globalHTMLProperty.error, attribute = globalHTMLProperty.attribute, experimental = globalHTMLProperty.experimental;
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
                console.error(msg.join('\n')); // tslint:disable-line
            }
        }
        propsHash[propName] = assign({
            config: 0,
            type: 'any',
            attr: attrName,
        }, props[propName]);
        return propsHash;
    }, create(null));
}
function getPublicMethodsHash(target) {
    var publicMethods = target.publicMethods;
    if (!getOwnPropertyDescriptor(target, 'publicMethods') || !publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce(function (methodsHash, methodName) {
        {
            assert.isTrue(isFunction(target.prototype[methodName]), "Component \"" + target.name + "\" should have a method `" + methodName + "` instead of " + target.prototype[methodName] + ".");
        }
        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
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
var TagNameToCtor = create(null);
function getCtorByTagName(tagName) {
    return TagNameToCtor[tagName];
    /////// TODO: what is this?
}
function registerComponent(tagName, Ctor) {
    {
        assertValidForceTagName(Ctor);
    }
    if (!isUndefined(TagNameToCtor[tagName])) {
        if (TagNameToCtor[tagName] === Ctor) {
            return;
        }
        else {
            // TODO: eventually we should throw, this is only needed for the tests today
            assert.logWarning("Different component class cannot be registered to the same tagName=\"" + tagName + "\".");
        }
    }
    TagNameToCtor[tagName] = Ctor;
}

/* tslint:disable:one-variable-per-declaration no-shadowed-variable */
var isArray$3 = Array.isArray;
var ELEMENT_NODE$1 = 1, TEXT_NODE$1 = 3, COMMENT_NODE$1 = 8, DOCUMENT_FRAGMENT_NODE = 11;
function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
var emptyNode = {
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
    var map = {};
    var i, key, ch;
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
var hooks$1 = [
    'create',
    'update',
    'remove',
    'destroy',
    'pre',
    'post',
];
function init$1(modules, api, compareFn) {
    var cbs = {};
    var i, j;
    var sameVnode = isUndef(compareFn) ? defaultCompareFn : compareFn;
    for (i = 0; i < hooks$1.length; ++i) {
        cbs[hooks$1[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks$1[i]];
            if (hook !== undefined) {
                cbs[hooks$1[i]].push(hook);
            }
        }
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent = api.parentNode(childElm);
                api.removeChild(parent, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i;
        var data = vnode.data;
        if (!isUndef(data)) {
            if (isDef((i = data.hook)) && isDef((i = i.init))) {
                i(vnode);
            }
        }
        if (isElementVNode(vnode)) {
            var data_1 = vnode.data, tag = vnode.tag;
            var elm = (vnode.elm = isDef((i = data_1.ns))
                ? api.createElementNS(i, tag)
                : api.createElement(tag));
            if (isDef((i = data_1.hook)) && isDef(i.create)) {
                i.create(emptyNode, vnode);
            }
            for (i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, vnode);
            }
            var children = vnode.children;
            if (isArray$3(children)) {
                for (i = 0; i < children.length; ++i) {
                    var ch = children[i];
                    if (isVNode(ch)) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (!isUndef(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            if (isDef((i = data_1.hook)) && isDef(i.insert)) {
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
            var ch = vnodes[startIdx];
            if (isVNode(ch)) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var data = vnode.data;
        var i, j;
        if (isDef((i = data.hook)) && isDef((i = i.destroy))) {
            i(vnode);
        }
        for (i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](vnode);
        }
        var children = vnode.children;
        if (isUndef(children)) {
            return;
        }
        for (j = 0; j < children.length; ++j) {
            var n = children[j];
            if (isVNode(n) && !isTextVNode(n)) {
                invokeDestroyHook(n);
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            var i_1 = void 0, listeners = void 0, rm = void 0;
            // text nodes do not have logic associated to them
            if (isVNode(ch)) {
                if (!isTextVNode(ch)) {
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1) {
                        cbs.remove[i_1](ch, rm);
                    }
                    if (isDef((i_1 = ch.data.hook)) && isDef((i_1 = i_1.remove))) {
                        i_1(ch, rm);
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
                var n = newCh[newEndIdx + 1];
                before = isVNode(n) ? n.elm : null;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;
        if (isDef((i = vnode.data))) {
            hook = i.hook;
        }
        if (isDef(hook) && isDef((i = hook.prepatch))) {
            i(oldVnode, vnode);
        }
        var elm = (vnode.elm = oldVnode.elm);
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
        var oldCh = oldVnode.children;
        var ch = vnode.children;
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
    var patch = function patch(oldVnode, vnode) {
        if (!isVNode(oldVnode) || !isVNode(vnode)) {
            throw new TypeError();
        }
        var i, n, elm, parent;
        var pre = cbs.pre, post = cbs.post;
        var insertedVnodeQueue = [];
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
        var i, n;
        var pre = cbs.pre, post = cbs.post;
        var insertedVnodeQueue = [];
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
    var props = vnode.data.props;
    if (isUndefined(props)) {
        return;
    }
    var oldProps = oldVnode.data.props;
    if (oldProps === props) {
        return;
    }
    {
        assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), "vnode.data.props cannot change shape.");
    }
    var key;
    var cur;
    var old;
    var elm = vnode.elm;
    var vm = elm[ViewModelReflection];
    oldProps = isUndefined(oldProps) ? EmptyObject : oldProps;
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        {
            if (old !== cur && !(key in elm)) {
                // TODO: this should never really happen because the compiler should always validate
                assert.fail("Unknown public property \"" + key + "\" of element <" + StringToLowerCase.call(elm.tagName) + ">. This is likely a typo on the corresponding attribute \"" + getAttrNameFromPropName(key) + "\".");
            }
        }
        if (old !== cur && (key in elm) && (key !== 'value' || elm[key] !== cur)) {
            {
                if (elm[key] === cur && old !== undefined) {
                    console.warn("Unnecessary update of property \"" + key + "\" in element <" + StringToLowerCase.call(elm.tagName) + ">."); // tslint:disable-line
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
var propsModule = {
    create: update,
    update: update,
};

var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var ColonCharCode = 58;
function updateAttrs(oldVnode, vnode) {
    var attrs = vnode.data.attrs;
    if (isUndefined(attrs)) {
        return;
    }
    var oldAttrs = oldVnode.data.attrs;
    if (oldAttrs === attrs) {
        return;
    }
    {
        assert.invariant(isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','), "vnode.data.attrs cannot change shape.");
    }
    var elm = vnode.elm;
    var key;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;
    // update modified attributes, add new attributes
    // this routine is only useful for data-* attributes in all kind of elements
    // and aria-* in standard elements (custom elements will use props for these)
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
        if (old !== cur) {
            {
                prepareForAttributeMutationFromTemplate(elm, key);
            }
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
var attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

var DashCharCode = 45;
function updateStyle(oldVnode, vnode) {
    var newStyle = vnode.data.style;
    if (isUndefined(newStyle)) {
        return;
    }
    var oldStyle = oldVnode.data.style;
    if (oldStyle === newStyle) {
        return;
    }
    {
        assert.invariant(isUndefined(oldStyle) || typeof newStyle === typeof oldStyle, "vnode.data.style cannot change types.");
    }
    var name;
    var elm = vnode.elm;
    var style = elm.style;
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
            var cur = newStyle[name];
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
var styleModule = {
    create: updateStyle,
    update: updateStyle,
};

function updateClass(oldVnode, vnode) {
    var elm = vnode.elm, klass = vnode.data.class;
    if (isUndefined(klass)) {
        return;
    }
    var oldClass = oldVnode.data.class;
    if (oldClass === klass) {
        return;
    }
    {
        assert.invariant(isUndefined(oldClass) || typeof oldClass === typeof klass, "vnode.data.class cannot change types.");
    }
    var classList = elm.classList;
    var name;
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
    var on = vnode.data.on;
    if (isUndefined(on)) {
        return;
    }
    var elm = vnode.elm;
    var listener = vnode.listener = createListener();
    listener.vnode = vnode;
    var name;
    for (name in on) {
        addEventListener.call(elm, name, listener, false);
    }
}
// @ts-ignore
var eventListenersModule = {
    update: updateAllEventListeners,
    create: createAllEventListeners,
    destroy: removeAllEventListeners
};

function updateToken(oldVnode, vnode) {
    var oldToken = oldVnode.data.token;
    var newToken = vnode.data.token;
    if (oldToken === newToken) {
        return;
    }
    var elm = vnode.elm;
    if (!isUndefined(oldToken)) {
        {
            prepareForAttributeMutationFromTemplate(elm, oldToken);
        }
        removeAttribute.call(elm, oldToken);
    }
    if (!isUndefined(newToken)) {
        {
            prepareForAttributeMutationFromTemplate(elm, newToken);
        }
        setAttribute.call(elm, newToken, '');
    }
}
var tokenModule = {
    create: updateToken,
    update: updateToken,
};

function updateUID(oldVnode, vnode) {
    var oldUid = oldVnode.data.uid;
    var uid = vnode.data.uid;
    if (uid === oldUid) {
        return;
    }
    vnode.elm[OwnerKey] = uid;
}
// TODO: we might not need to do this in update, only in create!
var uidModule = {
    create: updateUID,
    update: updateUID,
};

var createElement = document.createElement, createElementNS = document.createElementNS, createTextNode = document.createTextNode, createComment = document.createComment, createDocumentFragment = document.createDocumentFragment;
var _a$4 = Node.prototype, insertBefore = _a$4.insertBefore, removeChild = _a$4.removeChild, appendChild = _a$4.appendChild;
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function setTextContent(node, text) {
    node.nodeValue = text;
}
var htmlDomApi = {
    createFragment: function () {
        return createDocumentFragment.call(document);
    },
    createElement: function (tagName) {
        return createElement.call(document, tagName);
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
    insertBefore: function (parent, newNode, referenceNode) {
        insertBefore.call(parent, newNode, referenceNode);
    },
    removeChild: function (node, child) {
        if (!isNull(node)) {
            removeChild.call(node, child);
        }
    },
    appendChild: function (node, child) {
        appendChild.call(node, child);
    },
    parentNode: parentNode,
    nextSibling: nextSibling,
    setTextContent: setTextContent,
};
var patchVNode = init$1([
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
var patchChildren = patchVNode.children;

var idx = 0;
var uid$1 = 0;
function callHook(cmp, fn, args) {
    return fn.apply(cmp, args);
}
function setHook(cmp, prop, newValue) {
    cmp[prop] = newValue;
}
function getHook(cmp, prop) {
    return cmp[prop];
}
var OwnerKey = usesNativeSymbols ? Symbol('key') : '$$OwnerKey$$';
function addInsertionIndex(vm) {
    {
        assert.vm(vm);
        assert.invariant(vm.idx === 0, vm + " is already locked to a previously generated idx.");
    }
    vm.idx = ++idx;
    var connected = Services.connected;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    var connectedCallback = vm.def.connectedCallback;
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
        assert.invariant(vm.idx > 0, vm + " is not locked to a previously generated idx.");
    }
    vm.idx = 0;
    var disconnected = Services.disconnected;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
    var disconnectedCallback = vm.def.disconnectedCallback;
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
        assert.invariant(elm instanceof HTMLElement, "VM creation requires a DOM element instead of " + elm + ".");
    }
    if (hasOwnProperty.call(elm, ViewModelReflection)) {
        return; // already created
    }
    var Ctor = getCtorByTagName(tagName);
    var def = getComponentDef(Ctor);
    var isRoot = arguments.length === 2; // root elements can't provide slotset
    uid$1 += 1;
    var vm = {
        uid: uid$1,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot: isRoot,
        def: def,
        elm: elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        rootProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots: cmpSlots,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        callHook: callHook,
        setHook: setHook,
        getHook: getHook,
        component: undefined,
        children: EmptyArray,
        hostAttrs: create(null),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    {
        vm.toString = function () {
            return "[object:vm " + def.name + " (" + vm.idx + ")]";
        };
    }
    createComponent(vm, Ctor);
    linkComponent(vm);
}
function rehydrate(vm) {
    {
        assert.vm(vm);
        assert.isTrue(vm.elm instanceof HTMLElement, "rehydration can only happen after " + vm + " was patched the first time.");
    }
    if (vm.idx > 0 && vm.isDirty) {
        var children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}
function patchErrorBoundaryVm(errorBoundaryVm) {
    {
        assert.vm(errorBoundaryVm);
        assert.isTrue(errorBoundaryVm.elm instanceof HTMLElement, "rehydration can only happen after " + errorBoundaryVm + " was patched the first time.");
        assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
    }
    var children = renderComponent(errorBoundaryVm);
    var elm = errorBoundaryVm.elm, oldCh = errorBoundaryVm.children;
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
    var oldCh = vm.children;
    vm.children = children; // caching the new children collection
    if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
    }
    var error;
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
            var errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);
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
    {
        assert.vm(vm);
    }
    var rendered = Services.rendered;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    var renderedCallback = vm.def.renderedCallback;
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
var rehydrateQueue = [];
function flushRehydrationQueue() {
    {
        assert.invariant(rehydrateQueue.length, "If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of " + rehydrateQueue + ".");
    }
    var vms = rehydrateQueue.sort(function (a, b) { return a.idx - b.idx; });
    rehydrateQueue = []; // reset to a new queue
    for (var i = 0, len = vms.length; i < len; i += 1) {
        var vm = vms[i];
        try {
            rehydrate(vm);
        }
        catch (error) {
            var errorBoundaryVm = getErrorBoundaryVMFromParentElement(vm);
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
    var errorCallback = errorBoundaryVm.def.errorCallback;
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
    var elm = vm.elm, oldCh = vm.children;
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
        assert.invariant(node instanceof Node, "isNodeOwnedByVM() should be called with a node as the second argument instead of " + node);
        assert.childNode(vm.elm, node, "isNodeOwnedByVM() should never be called with a node that is not a child node of " + vm);
    }
    return node[OwnerKey] === vm.uid;
}
function wasNodePassedIntoVM(vm, node) {
    {
        assert.vm(vm);
        assert.invariant(node instanceof Node, "isNodePassedToVM() should be called with a node as the second argument instead of " + node);
        assert.childNode(vm.elm, node, "isNodePassedToVM() should never be called with a node that is not a child node of " + vm);
    }
    var elm = vm.elm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    return node[OwnerKey] === elm[OwnerKey];
}
function getErrorBoundaryVMFromParentElement(vm) {
    {
        assert.vm(vm);
    }
    var elm = vm.elm;
    var parentElm = elm && elm.parentElement;
    return getErrorBoundaryVM(parentElm);
}
function getErrorBoundaryVMFromOwnElement(vm) {
    {
        assert.vm(vm);
    }
    var elm = vm.elm;
    return getErrorBoundaryVM(elm);
}
function getErrorBoundaryVM(startingElement) {
    var elm = startingElement;
    var vm;
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
    var wcStack = [];
    var elm = vm.elm;
    do {
        var currentVm = elm[ViewModelReflection];
        if (!isUndefined(currentVm)) {
            ArrayPush.call(wcStack, currentVm.component.toString());
        }
        elm = elm.parentElement;
    } while (!isNull(elm));
    return wcStack.reverse().join('\n\t');
}

var _a$5 = Node.prototype, removeChild$1 = _a$5.removeChild, appendChild$1 = _a$5.appendChild, insertBefore$1 = _a$5.insertBefore, replaceChild = _a$5.replaceChild;
var ConnectingSlot = Symbol();
var DisconnectingSlot = Symbol();
function callNodeSlot(node, slot) {
    {
        assert.isTrue(node, "callNodeSlot() should not be called for a non-object");
    }
    if (!isUndefined(node[slot])) {
        node[slot]();
    }
    return node; // for convenience
}
// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
assign(Node.prototype, {
    appendChild: function (newChild) {
        var appendedNode = appendChild$1.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore: function (newChild, referenceNode) {
        var insertedNode = insertBefore$1.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild: function (oldChild) {
        var removedNode = removeChild$1.call(this, oldChild);
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
function createElement$1(sel, options) {
    if (options === void 0) { options = {}; }
    if (isUndefined(options) || !isFunction(options.is)) {
        throw new TypeError();
    }
    registerComponent(sel, options.is);
    // extracting the registered constructor just in case we need to force the tagName
    var Ctor = getCtorByTagName(sel);
    var forceTagName = Ctor.forceTagName;
    var tagName = isUndefined(forceTagName) ? sel : forceTagName;
    // Create element with correct tagName
    var element = document.createElement(tagName);
    if (hasOwnProperty.call(element, ViewModelReflection)) {
        return element;
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element);
    // Handle insertion and removal from the DOM manually
    element[ConnectingSlot] = function () {
        var vm = getCustomElementVM(element);
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
    element[DisconnectingSlot] = function () {
        var vm = getCustomElementVM(element);
        removeVM(vm);
    };
    return element;
}

// when used with exactly one argument, we assume it is a function invocation.
function readonly(obj) {
    {
        // TODO: enable the usage of this function as @readonly decorator
        if (arguments.length !== 1) {
            assert.fail("@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.");
        }
    }
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
