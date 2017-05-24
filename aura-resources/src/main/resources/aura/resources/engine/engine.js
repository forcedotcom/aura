(function (exports) {
'use strict';

var compareDocumentPosition = Node.prototype.compareDocumentPosition;
var _Node = Node;
var DOCUMENT_POSITION_CONTAINS = _Node.DOCUMENT_POSITION_CONTAINS;


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
    },
    block: function block(fn) {
        fn.call();
    },
    vnode: function vnode(_vnode) {
        assert.isTrue(_vnode && "sel" in _vnode && "data" in _vnode && "children" in _vnode && "text" in _vnode && "elm" in _vnode && "key" in _vnode, _vnode + " is not a vnode.");
    },
    vm: function vm(_vm) {
        assert.isTrue(_vm && "component" in _vm, _vm + " is not a vm.");
    },
    fail: function fail(msg) {
        throw new Error(msg);
    },
    logError: function logError(msg) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e);
        }
    },
    logWarning: function logWarning(msg) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.warn(e);
        }
    },
    childNode: function childNode(container, node, msg) {
        console.log(compareDocumentPosition.call(node, container), compareDocumentPosition.call(container, node), 4444);
        assert.isTrue(compareDocumentPosition.call(node, container) & DOCUMENT_POSITION_CONTAINS, msg || node + " must be a child node of " + container);
    }
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var freeze = Object.freeze;
var seal = Object.seal;
var create = Object.create;
var assign = Object.assign;
var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;
var hasOwnProperty = Object.hasOwnProperty;

var isArray = Array.isArray;
var _Array$prototype = Array.prototype;
var ArrayFilter = _Array$prototype.filter;
var ArraySplice = _Array$prototype.splice;
var ArrayIndexOf = _Array$prototype.indexOf;
var ArrayPush = _Array$prototype.push;


function isUndefined(obj) {
    return obj === undefined;
}





function isFunction(obj) {
    return typeof obj === 'function';
}
function isObject(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : _typeof$1(obj)) === 'object';
}

function isString(obj) {
    return typeof obj === 'string';
}



function isPromise(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : _typeof$1(obj)) === 'object' && obj === Promise.resolve(obj);
}

var OtS = {}.toString;
function toString(obj) {
    if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof$1(obj)) === 'object' && !obj.toString) {
        return OtS.call(obj);
    }
    return obj + '';
}

function bind(fn, ctx) {
    function boundFn(a) {
        var l = arguments.length;
        return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
    }
    return boundFn;
}

// Few more execptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
var HTMLPropertyNamesWithLowercasedReflectiveAttributes = ['accessKey', 'readOnly', 'tabIndex', 'bgColor', 'colSpan', 'rowSpan', 'contentEditable', 'dateTime', 'formAction', 'isMap', 'maxLength', 'useMap'];

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
var GlobalHTMLProperties = {
    accessKey: {
        attribute: 'accesskey'
    },
    accessKeyLabel: {
        readOnly: true
    },
    className: {
        attribute: 'class',
        error: 'Using property "className" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property "classList".'
    },
    contentEditable: {
        attribute: 'contenteditable'
    },
    isContentEditable: {
        readOnly: true
    },
    contextMenu: {
        attribute: 'contextmenu'
    },
    dataset: {
        readOnly: true,
        msg: 'Using property "dataset" is an anti-pattern. Instead declare \`static observedAttributes = ["data-foo"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes.'
    },
    dir: {
        attribute: 'dir'
    },
    draggable: {
        attribute: 'draggable',
        experimental: true
    },
    dropzone: {
        attribute: 'dropzone',
        readOnly: true,
        experimental: true
    },
    hidden: {
        attribute: 'hidden'
    },
    itemScope: {
        attribute: 'itemscope',
        experimental: true
    },
    itemType: {
        attribute: 'itemtype',
        readOnly: true,
        experimental: true
    },
    itemId: {
        attribute: 'itemid',
        experimental: true
    },
    itemRef: {
        attribute: 'itemref',
        readOnly: true,
        experimental: true
    },
    itemProp: {
        attribute: 'itemprop',
        readOnly: true,
        experimental: true
    },
    itemValue: {
        experimental: true
    },
    lang: {
        attribute: 'lang'
    },
    offsetHeight: {
        readOnly: true,
        experimental: true
    },
    offsetLeft: {
        readOnly: true,
        experimental: true
    },
    offsetParent: {
        readOnly: true,
        experimental: true
    },
    offsetTop: {
        readOnly: true,
        experimental: true
    },
    offsetWidth: {
        readOnly: true,
        experimental: true
    },
    properties: {
        readOnly: true,
        experimental: true
    },
    spellcheck: {
        experimental: true
    },
    style: {
        attribute: 'style',
        error: 'Using property or attribute "style" is an anti-pattern. Instead use property "classList".'
    },
    tabIndex: {
        attribute: 'tabindex'
    },
    title: {
        attribute: 'title'
    },
    translate: {
        experimental: true
    },
    // additional global attributes that are not present in the link above.
    role: {
        attribute: 'role'
    },
    slot: {
        attribute: 'slot',
        experimental: true,
        error: 'Using property or attribute "slot" is an anti-pattern.'
    }
};

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element

// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

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
        configurable: false
    });
}

ClassList.prototype = {
    add: function add() {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;

        var elm = getLinkedElement$1(this);
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.

        for (var _len = arguments.length, classNames = Array(_len), _key = 0; _key < _len; _key++) {
            classNames[_key] = arguments[_key];
        }

        classNames.forEach(function (className) {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                // this is not only an optimization, it is also needed to avoid adding the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx) {
                    // we intentionally make a sync mutation here and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    elm.classList.add(className);
                }
            }
        });
    },
    remove: function remove() {
        var _this = this;

        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;

        var elm = getLinkedElement$1(this);
        // Remove specified class values.

        for (var _len2 = arguments.length, classNames = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            classNames[_key2] = arguments[_key2];
        }

        classNames.forEach(function (className) {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                // this is not only an optimization, it is also needed to avoid removing the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx) {
                    // we intentionally make a sync mutation here when needed and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    var ownerClass = _this[ViewModelReflection].vnode.data.class;
                    // This is only needed if the owner is not forcing that class to be present in case of conflicts.
                    if (isUndefined(ownerClass) || !ownerClass[className]) {
                        elm.classList.remove(className);
                    }
                }
            }
        });
    },
    item: function item(index) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        // Return class value by index in collection.

        return getOwnPropertyNames(cmpClasses).filter(function (className) {
            return cmpClasses[className + ''];
        })[index] || null;
    },
    toggle: function toggle(className, force) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
        // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.

        if (arguments.length > 1) {
            if (force) {
                this.add(className);
            } else if (!force) {
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
    contains: function contains(className) {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;
        // Checks if specified class value exists in class attribute of the element.

        return !!cmpClasses[className];
    },
    toString: function toString$$1() {
        var vm = this[ViewModelReflection];
        var cmpClasses = vm.cmpClasses;

        return getOwnPropertyNames(cmpClasses).filter(function (className) {
            return cmpClasses[className + ''];
        }).join(' ');
    }
};

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var topLevelContextSymbol = Symbol('Top Level Context');

var currentContext = _defineProperty({}, topLevelContextSymbol, true);

function establishContext(ctx) {
    currentContext = ctx;
}

var nextTickCallbackQueue = [];
var SPACE_CHAR = 32;

var EmptyObject = seal(create(null));

function flushCallbackQueue() {
    assert.invariant(nextTickCallbackQueue.length, "If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of " + nextTickCallbackQueue + ".");
    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (var i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}

function addCallbackToNextTick(callback) {
    assert.isTrue(typeof callback === 'function', "addCallbackToNextTick() can only accept a function callback as first argument instead of " + callback);
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
        propName = attrName.replace(CAMEL_REGEX, function (g) {
            return g[1].toUpperCase();
        });
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
    htmlFor: 'for'
};
// Few more exceptions where the attribute name matches the property in lowercase.
HTMLPropertyNamesWithLowercasedReflectiveAttributes.forEach(function (propName) {
    propNameToAttributeNameMap[propName] = propName.toLowerCase();
});

function getAttrNameFromPropName(propName) {
    var attrName = propNameToAttributeNameMap[propName];
    if (!attrName) {
        attrName = propName.replace(CAPS_REGEX, function (match) {
            return '-' + match.toLowerCase();
        });
        propNameToAttributeNameMap[propName] = attrName;
    }
    return attrName;
}

function toAttributeValue(raw) {
    // normalizing attrs from compiler into HTML global attributes
    if (raw === true) {
        raw = '';
    } else if (raw === false) {
        raw = null;
    }
    return raw !== null ? raw + '' : null;
}

function noop() {}

var classNameToClassMap = create(null);

function getMapFromClassName(className) {
    var map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    var start = 0;
    var i = void 0,
        len = className.length;
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

var hooks = ['rehydrated', 'connected', 'disconnected'];

var services = create(null);

function register(service) {
    assert.isTrue(isObject(service), "Invalid service declaration, " + service + ": service must be an object");
    for (var i = 0; i < hooks.length; ++i) {
        var hookName = hooks[i];
        if (hookName in service) {
            var l = services[hookName];
            if (isUndefined(l)) {
                services[hookName] = l = [];
            }
            l.push(service[hookName]);
        }
    }
}

function invokeServiceHook(vm, cbs) {
    assert.vm(vm);
    assert.isTrue(isArray(cbs) && cbs.length > 0, "Optimize invokeServiceHook() to be invoked only when needed");
    var component = vm.component,
        data = vm.data,
        def = vm.def,
        context = vm.context;

    for (var i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

function insert(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm;

    assert.vm(vm);
    assert.isFalse(vm.idx, vm + " is already inserted.");
    addInsertionIndex(vm);
    var isDirty = vm.isDirty,
        connectedCallback = vm.component.connectedCallback;

    if (isDirty) {
        // this code path guarantess that when patching the custom element for the first time,
        // the body is computed only after the element is in the DOM, otherwise the hooks
        // for any children's vnode are not going to be useful.
        rehydrate(vm);
    }
    var connected = services.connected;

    if (connected) {
        addCallbackToNextTick(function () {
            return invokeServiceHook(vm, connected);
        });
    }
    if (connectedCallback && connectedCallback !== noop) {
        addCallbackToNextTick(function () {
            return invokeComponentMethod(vm, 'connectedCallback');
        });
    }
    console.log("\"" + vm + "\" was inserted.");
}

function destroy(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm;

    assert.vm(vm);
    assert.isTrue(vm.idx, vm + " is not inserted.");
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    var disconnected = services.disconnected;
    var disconnectedCallback = vm.component.disconnectedCallback;

    clearListeners(vm);
    if (disconnected) {
        addCallbackToNextTick(function () {
            return invokeServiceHook(vm, disconnected);
        });
    }
    if (disconnectedCallback && disconnectedCallback !== noop) {
        addCallbackToNextTick(function () {
            return invokeComponentMethod(vm, 'disconnectedCallback');
        });
    }
    console.log("\"" + vm + "\" was destroyed.");
}

function postpatch(oldVnode, vnode) {
    assert.vnode(vnode);
    assert.vm(vnode.vm);
    if (vnode.vm.idx === 0) {
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
}

var lifeCycleHooks = {
    insert: insert,
    destroy: destroy,
    postpatch: postpatch
};

var _typeof$5 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var CHAR_S = 115;
var CHAR_V = 118;
var CHAR_G = 103;
var EmptyData = create(null);
var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';

function addNS(data, children, sel) {
    data.ns = NamespaceAttributeForSVG;
    if (isUndefined(children) || sel === 'foreignObject') {
        return;
    }
    var len = children.length;
    for (var _i = 0; _i < len; ++_i) {
        var child = children[_i];
        var _data = child.data;

        if (_data !== undefined) {
            var grandChildren = child.children;
            addNS(_data, grandChildren, child.sel);
        }
    }
}

// [v]node node
function v(sel, data, children, text, elm, Ctor) {
    data = data || EmptyData;
    var _data2 = data,
        key = _data2.key;
    // we try to identify the owner, but for root elements and other special cases, we
    // can just fallback to 0 which means top level creation.

    var uid = vmBeingRendered ? vmBeingRendered.uid : 0;
    var vnode = { sel: sel, data: data, children: children, text: text, elm: elm, key: key, Ctor: Ctor, uid: uid };
    assert.block(function devModeCheck() {
        // adding toString to all vnodes for debuggability
        vnode.toString = function () {
            return "[object:vnode " + sel + "]";
        };
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
    var classMap = data.classMap,
        className = data.className;

    assert.isFalse(className && classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
    data.class = classMap || className && getMapFromClassName(className);
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
    assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
    assert.isTrue(isFunction(Ctor), "c() 2nd argument Ctor must be a function.");
    assert.isTrue(isObject(data), "c() 3nd argument data must be an object.");
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling c().");
    var _data3 = data,
        key = _data3.key,
        slotset = _data3.slotset,
        attrs = _data3.attrs,
        on = _data3.on,
        className = _data3.className,
        classMap = _data3.classMap,
        _props = _data3.props;

    assert.isTrue(arguments.length < 4, "Compiler Issue: Custom elements expect up to 3 arguments, received " + arguments.length + " instead.");
    data = { hook: lifeCycleHooks, key: key, slotset: slotset, attrs: attrs, on: on, _props: _props };
    assert.isFalse(className && classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
    data.class = classMap || className && getMapFromClassName(className);
    return v(sel, data, [], undefined, undefined, Ctor);
}

// [i]terable node
function i(items, factory) {
    var len = isArray(items) ? items.length : 0;
    var list = [];

    var _loop = function _loop(_i2) {
        var vnode = factory(items[_i2], _i2);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        } else {
            ArrayPush.call(list, vnode);
        }
        assert.block(function devModeCheck() {
            var vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach(function (vnode) {
                if (vnode && (typeof vnode === "undefined" ? "undefined" : _typeof$5(vnode)) === 'object' && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning("Missing \"key\" attribute in iteration with child \"" + toString(vnode.Ctor.name) + "\", index " + _i2 + " of " + len + ". Instead set a unique \"key\" attribute value on all iteration children so internal state can be preserved during rehydration.");
                }
            });
        });
    };

    for (var _i2 = 0; _i2 < len; _i2 += 1) {
        _loop(_i2);
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
    for (var _i3 = 0; _i3 < len; _i3 += 1) {
        var item = items[_i3];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        } else {
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
                console.log("Marking " + vm + " as dirty: property \"" + toString(key) + "\" of " + toString(target) + " was set to a new value.");
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
    if (ArrayIndexOf.call(value, vm) === -1) {
        ArrayPush.call(value, vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        ArrayPush.call(vm.deps, value);
    }
}

var _typeof$6 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ObjectPropertyToProxyCache = new WeakMap();
var ProxyCache = new WeakSet(); // used to identify any proxy created by this piece of logic.

function propertyGetter(target, key) {
    var value = target[key];
    if (isRendering && vmBeingRendered) {
        subscribeToSetHook(vmBeingRendered, target, key);
    }
    return value && (typeof value === "undefined" ? "undefined" : _typeof$6(value)) === 'object' ? getPropertyProxy(value) : value;
}

function propertySetter(target, key, value) {
    if (isRendering) {
        assert.logError("Setting property \"" + toString(key) + "\" of " + toString(target) + " during the rendering process of " + vmBeingRendered + " is invalid. The render phase must have no side effects on the state of any component.");
        return false;
    }
    var oldValue = target[key];
    if (oldValue !== value) {
        target[key] = value;
        notifyListeners(target, key);
    } else if (key === 'length' && isArray(target)) {
        // fix for issue #236: push will add the new index, and by the time length
        // is updated, the internal length is already equal to the new length value
        // therefore, the oldValue is equal to the value. This is the forking logic
        // to support this use case.
        notifyListeners(target, key);
    }
    return true;
}

function propertyDelete(target, key) {
    delete target[key];
    notifyListeners(target, key);
    return true;
}

var propertyProxyHandler = {
    get: propertyGetter,
    set: propertySetter,
    deleteProperty: propertyDelete
};

function getPropertyProxy(value) {
    assert.isTrue((typeof value === "undefined" ? "undefined" : _typeof$6(value)) === "object", "perf-optimization: avoid calling this method for non-object value.");
    if (value === null) {
        return value;
    }
    // TODO: perf opt - we should try to give identity to propertyProxies so we can test
    // them faster than a weakmap lookup.
    if (ProxyCache.has(value)) {
        return value;
    }
    // TODO: optimize this check
    // TODO: and alternative here is to throw a hard error in dev mode so in prod we don't have to do the check
    if (value instanceof Node) {
        assert.logWarning("Do not store references to DOM Nodes. Instead use `this.querySelector()` and `this.querySelectorAll()` to find the nodes when needed.");
        return value;
    }
    var proxy = ObjectPropertyToProxyCache.get(value);
    if (proxy) {
        return proxy;
    }
    proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyCache.set(value, proxy);
    ProxyCache.add(proxy);
    return proxy;
}

var RegularField = 1;
var ExpandoField = 2;
var MutatedField = 3;
var ObjectToFieldsMap = new WeakMap();

function extractOwnFields(target) {
    var fields = ObjectToFieldsMap.get(target);
    var type = ExpandoField;
    if (isUndefined(fields)) {
        // only the first batch are considered private fields
        type = RegularField;
        fields = {};
        ObjectToFieldsMap.set(target, fields);
    }

    var _loop = function _loop(propName) {
        if (hasOwnProperty.call(target, propName) && isUndefined(fields[propName])) {
            fields[propName] = type;
            var value = target[propName];
            // replacing the field with a getter and a setter to track the mutations
            // and provide meaningful errors
            defineProperty(target, propName, {
                get: function get() {
                    return value;
                },
                set: function set(newValue) {
                    value = newValue;
                    fields[propName] = MutatedField;
                },
                configurable: false
            });
        }
    };

    for (var propName in target) {
        _loop(propName);
    }
    return fields;
}

function getOwnFields(target) {
    var fields = ObjectToFieldsMap.get(target);
    if (isUndefined(fields)) {
        fields = {};
    }
    return fields;
}

var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var EmptySlots = create(null);

function getSlotsetValue(slotset, slotName) {
    assert.isTrue(isObject(slotset), "Invalid slotset value " + toString(slotset));
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}

var slotsetProxyHandler = {
    get: function get(slotset, key) {
        return getSlotsetValue(slotset, key);
    },
    set: function set() {
        assert.invariant(false, "$slotset object cannot be mutated from template.");
        return false;
    },
    deleteProperty: function deleteProperty() {
        assert.invariant(false, "$slotset object cannot be mutated from template.");
        return false;
    }
};

// we use inception to track down the memoized object for each value used in a template from a component
var currentMemoized = null;

var cmpProxyHandler = {
    get: function get(cmp, key) {
        assert.invariant(currentMemoized !== null && vmBeingRendered !== null && vmBeingRendered.component === cmp, " getFieldValue() should only be accessible during rendering phase.");
        if (key in currentMemoized) {
            return currentMemoized[key];
        }
        assert.block(function devModeCheck() {
            if (hasOwnProperty.call(cmp, key)) {
                var fields = getOwnFields(cmp);
                switch (fields[key]) {
                    case 1:
                        assert.logError(cmp + "'s template is accessing `this." + toString(key) + "` directly, which is declared in the constructor and considered a private field. Instead access it via a getter or make it reactive by moving it to `this.state." + toString(key) + "`.");
                        break;
                    case 2:
                        assert.logError(cmp + "'s template is accessing `this." + toString(key) + "` directly, which is added as an expando property of the component and considered a private field. Instead access it via a getter or make it reactive by moving it to `this.state." + toString(key) + "`.");
                        break;
                    case 3:
                        assert.logError(cmp + "'s template is accessing `this." + toString(key) + "`, which is considered a mutable private field but mutations cannot be observed. Instead move it to `this.state." + toString(key) + "`.");
                        break;
                    default:
                        // TODO: this should never really happen because the compiler should always validate
                        console.warn(cmp + "'s template is accessing `this." + toString(key) + "`, which is not declared by the component. This is likely a typo in the template.");
                }
            }
        });

        // slow path to access component's properties from template
        var value = void 0;
        var cmpState = vmBeingRendered.cmpState,
            cmpProps = vmBeingRendered.cmpProps,
            publicPropsConfig = vmBeingRendered.def.props;

        if (key === 'state' && cmpState) {
            value = cmpState;
        } else if (key in publicPropsConfig) {
            subscribeToSetHook(vmBeingRendered, cmpProps, key);
            value = cmpProps[key];
        } else {
            value = cmp[key];
        }
        if (isFunction(value)) {
            // binding every function value accessed from template
            value = bind(value, cmp);
        }
        currentMemoized[key] = value;
        return value;
    },
    set: function set(cmp, key) {
        assert.logError("Invalid assignment: " + cmp + " cannot set a new value for property " + key + " during the rendering phase.");
        return false;
    },
    deleteProperty: function deleteProperty(cmp, key) {
        assert.logError("Invalid delete statement: " + cmp + " cannot delete property " + key + " during the rendering phase.");
        return false;
    }
};

function evaluateTemplate(vm, html) {
    assert.vm(vm);
    assert.isTrue(isFunction(html), "evaluateTemplate() second argument must be a function instead of " + html);
    // TODO: add identity to the html functions
    var component = vm.component,
        context = vm.context,
        _vm$cmpSlots = vm.cmpSlots,
        cmpSlots = _vm$cmpSlots === undefined ? EmptySlots : _vm$cmpSlots,
        cmpTemplate = vm.cmpTemplate;
    // reset the cache momizer for template when needed

    if (html !== cmpTemplate) {
        context.tplCache = create(null);
        vm.cmpTemplate = html;
    }
    assert.isTrue(_typeof$4(context.tplCache) === 'object', "vm.context.tplCache must be an object associated to " + cmpTemplate + ".");
    assert.block(function devModeCheck() {
        // before every render, in dev-mode, we will like to know all expandos and
        // all private-fields-like properties, so we can give meaningful errors.
        extractOwnFields(component);

        // validating slot names
        var _html$slots = html.slots,
            slots = _html$slots === undefined ? [] : _html$slots;

        for (var slotName in cmpSlots) {
            if (ArrayIndexOf.call(slots, slotName) === -1) {
                // TODO: this should never really happen because the compiler should always validate
                console.warn("Ignoring unknown provided slot name \"" + slotName + "\" in " + vm + ". This is probably a typo on the slot attribute.");
            }
        }

        // validating identifiers used by template that should be provided by the component
        var _html$ids = html.ids,
            ids = _html$ids === undefined ? [] : _html$ids;

        ids.forEach(function (propName) {
            if (!(propName in component)) {
                // TODO: this should never really happen because the compiler should always validate
                console.warn("The template rendered by " + vm + " references `this." + propName + "`, which is not declared. This is likely a typo in the template.");
            }
        });
    });

    var _Proxy$revocable = Proxy.revocable(cmpSlots, slotsetProxyHandler),
        slotset = _Proxy$revocable.proxy,
        slotsetRevoke = _Proxy$revocable.revoke;

    var _Proxy$revocable2 = Proxy.revocable(component, cmpProxyHandler),
        cmp = _Proxy$revocable2.proxy,
        componentRevoke = _Proxy$revocable2.revoke;

    var outerMemoized = currentMemoized;
    currentMemoized = create(null);
    var vnodes = html.call(undefined, api, cmp, slotset, context.tplCache);
    assert.invariant(isArray(vnodes), "Compiler should produce html functions that always return an array.");
    currentMemoized = outerMemoized; // inception to memoize the accessing of keys from cmp for every render cycle
    slotsetRevoke();
    componentRevoke();
    return vnodes;
}

function attemptToEvaluateResolvedTemplate(vm, html, originalPromise) {
    var context = vm.context;

    if (originalPromise !== context.tplPromise) {
        // resolution of an old promise that is not longer relevant, ignoring it.
        return;
    }
    if (isFunction(html)) {
        context.tplResolvedValue = html;
        assert.block(function devModeCheck() {
            if (html === vm.cmpTemplate) {
                assert.logError("component " + vm.component + " is returning a new promise everytime the render() method is invoked, even though the promise resolves to the same template " + html + ". You should cache the promise outside of the render method, and return the same promise everytime, otherwise you will incurr in some performance penalty.");
            }
        });
        // forcing the vm to be dirty so it can render its content.
        vm.isDirty = true;
        rehydrate(vm);
    } else if (!isUndefined(html)) {
        assert.fail("The template rendered by " + vm + " must return an imported template tag (e.g.: `import html from \"./mytemplate.html\"`) or undefined, instead, it has returned " + html + ".");
    }
    // if the promise resolves to `undefined`, do nothing...
}

function deferredTemplate(vm, html) {
    assert.vm(vm);
    assert.isTrue(isPromise(html), "deferredTemplate() second argument must be a promise instead of " + html);
    var context = vm.context;
    var tplResolvedValue = context.tplResolvedValue,
        tplPromise = context.tplPromise;

    if (html !== tplPromise) {
        context.tplPromise = html;
        context.tplResolvedValue = undefined;
        html.then(function (fn) {
            return attemptToEvaluateResolvedTemplate(vm, fn, html);
        });
    } else if (tplResolvedValue) {
        // if multiple invokes to render() return the same promise, we can rehydrate using the
        // underlaying resolved value of that promise.
        return evaluateTemplate(vm, tplResolvedValue);
    }
    return [];
}

var isRendering = false;
var vmBeingRendered = null;

function invokeComponentCallback(vm, fn, fnCtx, args) {
    var context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var result = void 0,
        error = void 0;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(fnCtx, args);
    } catch (e) {
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
    var component = void 0,
        error = void 0;
    try {
        component = new Ctor();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return component;
}

function invokeComponentRenderMethod(vm) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var isRenderingInception = isRendering;
    var vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    var result = void 0,
        error = void 0;
    try {
        var html = component.render();
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        } else if (isPromise(html)) {
            result = deferredTemplate(vm, html);
        } else if (!isUndefined(html)) {
            assert.fail("The template rendered by " + vm + " must return an imported template tag (e.g.: `import html from \"./mytemplate.html\"`) or undefined, instead, it has returned " + html + ".");
        }
    } catch (e) {
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
    var component = vm.component,
        context = vm.context;

    assert.isTrue(component.attributeChangedCallback, "invokeComponentAttributeChangedCallback() should not be called if `component.attributeChangedCallback()` is not defined.");
    var ctx = currentContext;
    establishContext(context);
    var error = void 0;
    try {
        component.attributeChangedCallback(attrName, oldValue, newValue);
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var vmBeingConstructed = null;

function isBeingConstructed(vm) {
    assert.vm(vm);
    return vmBeingConstructed === vm;
}

function createComponent(vm, Ctor) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        publicMethodsConfig = vm.def.methods;
    // expose public methods as props on the Element

    var _loop = function _loop(methodName) {
        cmpProps[methodName] = function () {
            return invokeComponentMethod(vm, methodName, arguments);
        };
    };

    for (var methodName in publicMethodsConfig) {
        _loop(methodName);
    }
    // create the component instance
    var vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    var component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
    assert.block(function devModeCheck() {
        extractOwnFields(component);
    });
    assert.isTrue(vm.component === component, "Invalid construction for " + vm + ", maybe you are missing the call to super() on classes extending Element.");
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

function updateComponentProp(vm, propName, newValue) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def = vm.def,
        publicPropsConfig = _vm$def.props,
        observedAttrs = _vm$def.observedAttrs;

    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // TODO: this should never really happen because the compiler should always validate
        console.warn("Ignoring unknown public property " + propName + " of " + vm + ". This is likely a typo on the corresponding attribute \"" + getAttrNameFromPropName(propName) + "\".");
        return;
    }
    var oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        assert.block(function devModeCheck() {
            if ((typeof newValue === "undefined" ? "undefined" : _typeof$3(newValue)) === 'object') {
                assert.invariant(getPropertyProxy(newValue) === newValue, "updateComponentProp() should always received proxified object values instead of " + newValue + " in " + vm + ".");
            }
        });
        cmpProps[propName] = newValue;
        var attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
    }
}

function resetComponentProp(vm, propName) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def2 = vm.def,
        publicPropsConfig = _vm$def2.props,
        observedAttrs = _vm$def2.observedAttrs;

    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // not need to log the error here because we will do it on updateComponentProp()
        return;
    }
    var oldValue = cmpProps[propName];
    var newValue = undefined;
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        var attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
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
    var cmpEvents = vm.cmpEvents,
        cmpListener = vm.cmpListener;

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
        if (!vm.isDirty) {
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
    var cmpEvents = vm.cmpEvents,
        component = vm.component;
    var type = event.type;

    assert.invariant(cmpEvents && cmpEvents[type] && cmpEvents[type].length, "dispatchComponentEvent() should only be invoked if there is at least one listener in queue for " + type + " on " + vm + ".");
    var handlers = cmpEvents[type];
    var uninterrupted = true;
    var stopImmediatePropagation = event.stopImmediatePropagation;

    event.stopImmediatePropagation = function () {
        uninterrupted = false;
        stopImmediatePropagation.call(this);
    };
    for (var i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, handlers[i], component, [event]);
    }
    // restoring original methods
    event.stopImmediatePropagation = stopImmediatePropagation;
}

function addComponentSlot(vm, slotName, newValue) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    assert.isTrue(isArray(newValue) && newValue.length > 0, "Slots can only be set to a non-empty array, instead received " + toString(newValue) + " for slot " + slotName + " in " + vm + ".");
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
    vm.fragment = vnodes;
    assert.invariant(isArray(vnodes), vm + ".render() should always return an array of vnodes instead of " + vnodes);
    var renderedCallback = vm.component.renderedCallback;

    if (renderedCallback && renderedCallback !== noop) {
        addCallbackToNextTick(function () {
            return invokeComponentMethod(vm, 'renderedCallback');
        });
    }
    var rehydrated = services.rehydrated;

    if (rehydrated) {
        addCallbackToNextTick(function () {
            return invokeServiceHook(vm, rehydrated);
        });
    }
}

function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, "markComponentAsDirty() for " + vm + " should not be called when the componet is already dirty.");
    assert.isFalse(isRendering, "markComponentAsDirty() for " + vm + " cannot be called during rendering of " + vmBeingRendered + ".");
    vm.isDirty = true;
}

function getLinkedElement$2(root) {
    return root[ViewModelReflection].vnode.elm;
}

function querySelectorAllFromRoot(root, selectors) {
    var elm = getLinkedElement$2(root);
    return elm.querySelectorAll(selectors);
}

function Root(vm) {
    assert.vm(vm);
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

Root.prototype = {
    get mode() {
        return 'closed';
    },
    get host() {
        return this[ViewModelReflection].component;
    },
    querySelector: function querySelector(selectors) {
        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.root.querySelector() cannot be called during the construction of the custom element for " + this + " because no content has been rendered yet.");
        var nodeList = querySelectorAllFromRoot(this, selectors);
        for (var i = 0, len = nodeList.length; i < len; i += 1) {
            if (isNodeOwnedByVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return nodeList[i];
            }
        }
        assert.block(function () {
            if (vm.component.querySelector(selectors)) {
                assert.logWarning("this.root.querySelector() can only return elements from the template declaration of " + vm.component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.");
            }
        });
    },
    querySelectorAll: function querySelectorAll(selectors) {
        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.root.querySelectorAll() cannot be called during the construction of the custom element for " + this + " because no content has been rendered yet.");
        var nodeList = querySelectorAllFromRoot(this, selectors);
        // TODO: locker service might need to do something here
        var filteredNodes = ArrayFilter.call(nodeList, function (node) {
            return isNodeOwnedByVM(vm, node);
        });
        assert.block(function () {
            if (filteredNodes.length === 0 && vm.component.querySelectorAll(selectors).length) {
                assert.logWarning("this.root.querySelectorAll() can only return elements from template declaration of " + vm.component + ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.");
            }
        });
        return filteredNodes;
    },
    toString: function toString$$1() {
        var vm = this[ViewModelReflection];
        return "Current ShadowRoot for " + vm.component;
    }
};

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ViewModelReflection = Symbol('internal');

function getLinkedElement(cmp) {
    return cmp[ViewModelReflection].vnode.elm;
}

function querySelectorAllFromComponent(cmp, selectors) {
    var elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}

function createPublicPropertyDescriptorMap(propName) {
    var descriptors = {};
    function getter() {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        if (isBeingConstructed(vm)) {
            assert.logError(vm + " constructor should not read the value of property \"" + propName + "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties.");
            return;
        }
        var cmpProps = vm.cmpProps;

        if (isRendering) {
            // this is needed because the proxy used by template is not sufficient
            // for public props accessed from within a getter in the component.
            subscribeToSetHook(vmBeingRendered, cmpProps, propName);
        }
        return cmpProps[propName];
    }
    function setter(value) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        if (!isBeingConstructed(vm)) {
            assert.logError(vm + " can only set a new value for property \"" + propName + "\" during construction.");
            return;
        }
        var cmpProps = vm.cmpProps;
        // proxifying before storing it is a must for public props

        cmpProps[propName] = (typeof value === "undefined" ? "undefined" : _typeof$2(value)) === 'object' ? getPropertyProxy(value) : value;
    }
    descriptors[propName] = {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    };
    return descriptors;
}

// This should be as performant as possible, while any initialization should be done lazily
function ComponentElement() {
    assert.vm(vmBeingConstructed, "Invalid construction.");
    assert.vnode(vmBeingConstructed.vnode, "Invalid construction.");
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
    dispatchEvent: function dispatchEvent(event) {
        var elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), "this.dispatchEvent() should not be called during the construction of the custom element for " + this + " because no one is listening for the event " + event + " just yet.");
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener: function addEventListener(type, listener) {
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
    removeEventListener: function removeEventListener(type, listener) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                assert.logWarning("this.removeEventListener() on " + vm + " does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.");
            }
        });
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute: function getAttribute(attrName) {
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
            } else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _GlobalHTMLProperties = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties.error,
                    experimental = _GlobalHTMLProperties.experimental;

                if (error) {
                    console.error(error);
                } else if (experimental) {
                    console.error("Attribute `" + attrName + "` is an experimental attribute that is not standardized or supported by all browsers. Property \"" + propName + "\" and attribute \"" + attrName + "\" are ignored.");
                }
            }
        });
        // normalizing attrs from compiler into HTML global attributes
        var raw = attrs && attrName in attrs ? attrs[attrName] : null;
        return toAttributeValue(raw);
    },
    getBoundingClientRect: function getBoundingClientRect() {
        var elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), "this.getBoundingClientRect() should not be called during the construction of the custom element for " + this + " because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.");
        return elm.getBoundingClientRect();
    },
    querySelector: function querySelector(selectors) {
        var _this = this;

        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.querySelector() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        var nodeList = querySelectorAllFromComponent(this, selectors);
        for (var i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return nodeList[i];
            }
        }
        assert.block(function () {
            if (_this.root.querySelector(selectors)) {
                assert.logWarning("this.querySelector() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.");
            }
        });
    },
    querySelectorAll: function querySelectorAll(selectors) {
        var _this2 = this;

        var vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), "this.querySelectorAll() cannot be called during the construction of the custom element for " + this + " because no children has been added to this element yet.");
        var nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        var filteredNodes = ArrayFilter.call(nodeList, function (node) {
            return wasNodePassedIntoVM(vm, node);
        });
        assert.block(function () {
            if (filteredNodes.length === 0 && _this2.root.querySelectorAll(selectors).length) {
                assert.logWarning("this.querySelectorAll() can only return elements that were passed into " + vm.component + " via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.");
            }
        });
        return filteredNodes;
    },

    get tagName() {
        var elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
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
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState) {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        if (!newState || !isObject(newState) || isArray(newState)) {
            assert.logError(vm + " failed to set new state to " + newState + ". `this.state` can only be set to an object.");
            return;
        }
        var cmpState = vm.cmpState;

        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        if (cmpState !== newState) {
            for (var key in cmpState) {
                if (!(key in newState)) {
                    cmpState[key] = undefined; // prefer setting to undefined over deleting for perf reasons
                }
            }
            for (var _key in newState) {
                cmpState[_key] = newState[_key];
            }
        }
    },
    toString: function toString$$1() {
        var vm = this[ViewModelReflection];
        assert.vm(vm);
        var _vm$vnode = vm.vnode,
            sel = _vm$vnode.sel,
            attrs = _vm$vnode.data.attrs;

        var is = attrs && attrs.is;
        return "<" + sel + (is ? ' is="${is}' : '') + ">";
    }
};

// Global HTML Attributes
assert.block(function devModeCheck() {

    getOwnPropertyNames(GlobalHTMLProperties).forEach(function (propName) {
        if (propName in ComponentElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function get() {
                var vm = this[ViewModelReflection];
                assert.vm(vm);
                var _GlobalHTMLProperties2 = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties2.error,
                    attribute = _GlobalHTMLProperties2.attribute,
                    readOnly = _GlobalHTMLProperties2.readOnly,
                    experimental = _GlobalHTMLProperties2.experimental;

                var msg = [];
                msg.push("Accessing the global HTML property \"" + propName + "\" in " + vm + " is disabled.");
                if (error) {
                    msg.push(error);
                } else {
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
            enumerable: false
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

var CtorToDefMap = new WeakMap();

function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    var proto = Object.getPrototypeOf(Ctor);
    if (proto === ComponentElement) {
        return true;
    }
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}

function createComponentDef(Ctor) {
    assert.isTrue(isElementComponent(Ctor), Ctor + " is not a valid component, or does not extends Element from \"engine\". You probably forgot to add the extend clause on the class declaration.");
    var name = Ctor.name;
    assert.isTrue(name && typeof name === 'string', toString(Ctor) + " should have a \"name\" property with string value, but found " + name + ".");
    assert.isTrue(Ctor.constructor, "Missing " + name + ".constructor, " + name + " should have a \"constructor\" property.");
    var props = getPublicPropertiesHash(Ctor);
    var proto = Ctor.prototype;
    for (var propName in props) {
        // initializing getters and setters for each public prop on the target prototype
        assert.invariant(!getOwnPropertyDescriptor(proto, propName), "Invalid " + name + ".prototype." + propName + " definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.");
        defineProperties(proto, createPublicPropertyDescriptorMap(propName));
    }
    var methods = getPublicMethodsHash(Ctor);
    var observedAttrs = getObservedAttributesHash(Ctor);
    var def = {
        name: name,
        props: props,
        methods: methods,
        observedAttrs: observedAttrs
    };
    assert.block(function devModeCheck() {
        freeze(Ctor.prototype);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (var key in def) {
            defineProperty(def, key, {
                configurable: false,
                writable: false
            });
        }
    });
    return def;
}

function getPublicPropertiesHash(target) {
    var props = target.publicProps || {};
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
        assert.block(function devModeCheck() {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _GlobalHTMLProperties = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties.error,
                    attribute = _GlobalHTMLProperties.attribute,
                    experimental = _GlobalHTMLProperties.experimental;

                var msg = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push("\"" + propName + "\" is an experimental property that is not standardized or supported by all browsers. Property \"" + propName + "\" and attribute \"" + attribute + "\" are ignored.");
                } else {
                    msg.push("\"" + propName + "\" is a global HTML property. Instead access it via the reflective attribute \"" + attribute + "\" with one of these techniques:");
                    msg.push("  * Use `this.getAttribute(\"" + attribute + "\")` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.");
                    msg.push("  * Declare `static observedAttributes = [\"" + attribute + "\"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.");
                }
                console.error(msg.join('\n'));
            }
        });
        propsHash[propName] = 1;
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
            assert.isTrue(typeof target.prototype[methodName] === 'function', "Component \"" + target.name + "\" should have a method `" + methodName + "` instead of " + target.prototype[methodName] + ".");
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}

function getObservedAttributesHash(target) {
    // To match WC semantics, only if you have the callback in the prototype, you
    if (!target.prototype.attributeChangedCallback || !target.observedAttributes || !target.observedAttributes.length) {
        return EmptyObject;
    }
    return target.observedAttributes.reduce(function (observedAttributes, attrName) {
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
}

function removeInsertionIndex(vm) {
    assert.vm(vm);
    assert.invariant(vm.idx > 0, vm + " is not locked to a previously generated idx.");
    vm.idx = 0;
}

function createVM(vnode) {
    assert.vnode(vnode);
    assert.invariant(vnode.elm instanceof HTMLElement, "VM creation requires a DOM element to be associated to vnode " + vnode + ".");
    var Ctor = vnode.Ctor;

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
        // used to store the latest result of the render method
        fragment: [],
        // used to track down all object-key pairs that makes this vm reactive
        deps: []
    };
    assert.block(function devModeCheck() {
        vm.toString = function () {
            return "[object:vm " + def.name + " (" + vm.idx + ")]";
        };
    });
    vnode.vm = vm;
    createComponent(vm, Ctor);
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
        assert.invariant(isArray(vnode.children), "Rendered " + vm + ".children should always have an array of vnodes instead of " + toString(vnode.children));
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode (oldVnode) with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders, but we do so by keeping the vnode originally used by parent
        // as the source of true, in case the parent tries to rehydrate against that one.
        var oldVnode = assign({}, vnode);
        vnode.children = [];
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

var rehydrateQueue = [];

function flushRehydrationQueue() {
    assert.invariant(rehydrateQueue.length, "If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of " + rehydrateQueue + ".");
    var vms = rehydrateQueue.sort(function (a, b) {
        return a.idx > b.idx;
    });
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
    // @ts-ignore

    return node[OwnerKey] === ownerUid;
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
        relinkVM(oldVnode.vm, vnode);
    } else {
        createVM(vnode);
    }
    assert.invariant(vnode.vm.component, "vm " + vnode.vm + " should have a component and element associated to it.");
}

var componentInit = {
    create: initializeComponent,
    update: initializeComponent
};

function syncProps(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }

    var oldProps = oldVnode.data._props;
    var newProps = vnode.data._props;

    // infuse key-value pairs from _props into the component

    if (oldProps !== newProps && (oldProps || newProps)) {
        var key = void 0,
            cur = void 0;
        oldProps = oldProps || EmptyObject;
        newProps = newProps || EmptyObject;
        // removed props should be reset in component's props
        for (key in oldProps) {
            if (!(key in newProps)) {
                resetComponentProp(vm, key);
            }
        }

        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                updateComponentProp(vm, key, cur);
            }
        }
    }

    // TODO: opt out if cmpProps is empty (right now it is never empty)
    vnode.data.props = assign({}, vm.cmpProps);
}

var componentProps = {
    create: syncProps,
    update: syncProps
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


    if (oldAttrs === newAttrs || isUndefined(oldAttrs) && isUndefined(oldAttrs)) {
        return;
    }

    // infuse key-value pairs from _props into the component
    var key = void 0,
        cur = void 0;
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
    update: observeAttributes
};

function removeAllCmpEventListeners(vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }
    var on = vm.cmpEvents,
        listener = vm.listener;

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

    var oldOn = oldVm && oldVm.cmpEvents || EmptyObject;
    var _vm$cmpEvents = vm.cmpEvents,
        on = _vm$cmpEvents === undefined ? EmptyObject : _vm$cmpEvents;


    if (oldOn === on) {
        return;
    }

    var elm = vnode.elm;
    var oldElm = oldVnode.elm;

    var listener = vm.cmpListener = oldVm && oldVm.cmpListener || createComponentListener();
    listener.vm = vm;

    var name = void 0;
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

    var oldClass = oldVm && oldVm.cmpClasses || EmptyObject;
    var _vm$cmpClasses = vm.cmpClasses,
        klass = _vm$cmpClasses === undefined ? EmptyObject : _vm$cmpClasses;


    if (oldClass === klass) {
        return;
    }

    var elm = vnode.elm,
        _vnode$data$class = vnode.data.class,
        ownerClass = _vnode$data$class === undefined ? EmptyObject : _vnode$data$class;


    var name = void 0;
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
    update: syncClassNames
};

function update(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }

    var oldSlots = oldVnode.data.slotset;
    var newSlots = vnode.data.slotset;

    // infuse key-value pairs from slotset into the component

    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        var key = void 0,
            cur = void 0;
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
                } else {
                    removeComponentSlot(vm, key);
                }
            }
        }
    }
}

var componentSlotset = {
    create: update,
    update: update
};

function rerender(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }
    var children = vnode.children;
    // if diffing is against an inserted VM, it means the element is already
    // in the DOM and we can compute its body.

    if (vm.idx && vm.isDirty) {
        assert.invariant(oldVnode.children !== children, "If component is dirty, the children collections must be different. In theory this should never happen.");
        renderComponent(vm);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.length = 0;
    ArrayPush.apply(children, vm.fragment);
}

var componentChildren = {
    create: rerender,
    update: rerender
};

// TODO: eventually use the one shipped by snabbdom directly
function update$1(oldVnode, vnode) {
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

    var key = void 0,
        cur = void 0,
        old = void 0;
    var elm = vnode.elm;


    for (key in oldProps) {
        if (!(key in props)) {
            if (vnode.isRoot) {
                // custom elements created programatically prevent you from
                // deleting the property because it has a set/get to update
                // the corresponding component, in this case, we just set it
                // to undefined, which has the same effect.
                elm[key] = undefined;
            } else {
                delete elm[key];
            }
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                assert.block(function devModeCheck() {
                    if (elm[key] === cur && old !== undefined && !vnode.isRoot) {
                        console.warn("Unneccessary update of property \"" + key + "\" in " + elm + ", it has the same value in " + (vnode.vm || vnode) + ".");
                    }
                });
                elm[key] = cur;
            }
        }
    }
}

var props = {
    create: update$1,
    update: update$1
};

var array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}

function createElement$1(tagName) {
    return document.createElement(tagName);
}
function createElementNS(namespaceURI, qualifiedName) {
    return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
    node.appendChild(child);
}
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
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
var htmlDomApi = {
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment
};

function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
var emptyNode = { sel: "", data: {}, children: [] };
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i$$1,
        map = {},
        key,
        ch;
    for (i$$1 = beginIdx; i$$1 <= endIdx; ++i$$1) {
        ch = children[i$$1];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined) map[key] = i$$1;
        }
    }
    return map;
}
var hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
// export { h } from './h';
// export { thunk } from './thunk';
function init(modules, domApi) {
    var i$$1,
        j,
        cbs = {};
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
        var i$$1,
            data = vnode.data;
        if (data !== undefined) {
            if (isDef(i$$1 = data.hook) && isDef(i$$1 = i$$1.init)) {
                i$$1(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children,
            sel = vnode.sel;
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        } else if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i$$1 = data.ns) ? api.createElementNS(i$$1, tag) : api.createElement(tag);
            if (hash < dot) elm.id = sel.slice(hash + 1, dot);
            if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
            for (i$$1 = 0; i$$1 < cbs.create.length; ++i$$1) {
                cbs.create[i$$1](emptyNode, vnode);
            }if (array(children)) {
                for (i$$1 = 0; i$$1 < children.length; ++i$$1) {
                    var ch = children[i$$1];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            } else if (primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            i$$1 = vnode.data.hook; // Reuse variable
            if (isDef(i$$1)) {
                if (i$$1.create) i$$1.create(emptyNode, vnode);
                if (i$$1.insert) insertedVnodeQueue.push(vnode);
            }
        } else {
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
        var i$$1,
            j,
            data = vnode.data;
        if (data !== undefined) {
            if (isDef(i$$1 = data.hook) && isDef(i$$1 = i$$1.destroy)) i$$1(vnode);
            for (i$$1 = 0; i$$1 < cbs.destroy.length; ++i$$1) {
                cbs.destroy[i$$1](vnode);
            }if (vnode.children !== undefined) {
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
            var i_1 = void 0,
                listeners = void 0,
                rm = void 0,
                ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1) {
                        cbs.remove[i_1](ch, rm);
                    }if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    } else {
                        rm();
                    }
                } else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0,
            newStartIdx = 0;
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
            } else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            } else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            } else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    } else {
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
        } else if (newStartIdx > newEndIdx) {
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
        if (oldVnode === vnode) return;
        if (vnode.data !== undefined) {
            for (i$$1 = 0; i$$1 < cbs.update.length; ++i$$1) {
                cbs.update[i$$1](oldVnode, vnode);
            }i$$1 = vnode.data.hook;
            if (isDef(i$$1) && isDef(i$$1 = i$$1.update)) i$$1(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            } else if (isDef(ch)) {
                if (isDef(oldVnode.text)) api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            } else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            } else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        } else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i$$1 = hook.postpatch)) {
            i$$1(oldVnode, vnode);
        }
    }
    return function patch(oldVnode, vnode) {
        var i$$1, elm, parent;
        var insertedVnodeQueue = [];
        for (i$$1 = 0; i$$1 < cbs.pre.length; ++i$$1) {
            cbs.pre[i$$1]();
        }if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
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
        for (i$$1 = 0; i$$1 < cbs.post.length; ++i$$1) {
            cbs.post[i$$1]();
        }return vnode;
    };
}

var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var ColonCharCode = 58;
var XCharCode = 120;

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

    var key = void 0;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};

    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            } else if (cur === false) {
                elm.removeAttribute(key);
            } else {
                if (key.charCodeAt(0) !== XCharCode) {
                    elm.setAttribute(key, cur);
                } else if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                } else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                } else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
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

    var name = void 0;
    var elm = vnode.elm;

    for (name in oldStyle) {
        if (!(name in style)) {
            elm.style.removeProperty(name);
        }
    }
    for (name in style) {
        var cur = style[name];
        if (cur !== oldStyle[name]) {
            if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
                elm.style.setProperty(name, cur);
            } else {
                elm.style[name] = cur;
            }
        }
    }
}

var styleModule = {
    create: updateStyle,
    update: updateStyle
};

function updateClass(oldVnode, vnode) {
    var _oldVnode$data$class = oldVnode.data.class,
        oldClass = _oldVnode$data$class === undefined ? EmptyObject : _oldVnode$data$class;
    var elm = vnode.elm,
        _vnode$data$class = vnode.data.class,
        klass = _vnode$data$class === undefined ? EmptyObject : _vnode$data$class;


    if (oldClass === klass) {
        return;
    }

    var innerClass = vnode.vm && vnode.vm.cmpClasses || EmptyObject;

    var name = void 0;
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

var classModule = {
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
    var on = vnode.data.on,
        listener = vnode.listener;

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
    var _oldVnode$data$on = oldVnode.data.on,
        oldOn = _oldVnode$data$on === undefined ? EmptyObject : _oldVnode$data$on;
    var _vnode$data$on = vnode.data.on,
        on = _vnode$data$on === undefined ? EmptyObject : _vnode$data$on;


    if (oldOn === on) {
        return;
    }

    var elm = vnode.elm;
    var oldElm = oldVnode.elm;

    var listener = vnode.listener = oldVnode.listener || createListener();
    listener.vnode = vnode;

    var name = void 0;
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
    var elm = vnode.elm,
        uid = vnode.uid;

    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    elm[OwnerKey] = uid;
}

var uidModule = {
    create: updateUID,
    update: updateUID
};

var patch = init([componentInit, componentSlotset, componentProps, componentAttrs, eventListenersModule, componentClasses, componentChildren, props, attributesModule, classModule, styleModule, eventListenersModule$1, uidModule]);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Element$prototype = Element.prototype;
var getAttribute = _Element$prototype.getAttribute;
var setAttribute = _Element$prototype.setAttribute;
var removeAttribute = _Element$prototype.removeAttribute;


function linkAttributes(element, vm) {
    assert.vm(vm);
    var _vm$def = vm.def,
        propsConfig = _vm$def.props,
        observedAttrs = _vm$def.observedAttrs;
    // replacing mutators and accessors on the element itself to catch any mutation

    element.getAttribute = function (attrName) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead access the public property with `element." + propName + ";`.");
            return;
        }
        return getAttribute.call(element, attrName);
    };
    element.setAttribute = function (attrName, newValue) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.error("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead update the public property with `element." + propName + " = value;`.");
            return;
        }
        var oldValue = getAttribute.call(element, attrName);
        setAttribute.call(element, attrName, newValue);
        newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
    element.removeAttribute = function (attrName) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError("Invalid attribute \"" + attrName + "\" for " + vm + ". Instead update the public property with `element." + propName + " = undefined;`.");
            return;
        }

        assert.block(function devModeCheck() {
            var propName = getPropNameFromAttrName(attrName);
            if (propsConfig[propName]) {
                updateComponentProp(vm, propName, newValue);
                if (vm.isDirty) {
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            }
        });
        var oldValue = getAttribute.call(element, attrName);
        removeAttribute.call(element, attrName);
        var newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
}

function linkProperties(element, vm) {
    assert.vm(vm);
    var component = vm.component,
        _vm$def2 = vm.def,
        propsConfig = _vm$def2.props,
        methods = _vm$def2.methods;

    var descriptors = {};
    // linking public methods

    var _loop = function _loop(methodName) {
        descriptors[methodName] = {
            value: function value() {
                return component[methodName].apply(component, arguments);
            },
            configurable: false,
            writable: false,
            enumerable: false
        };
    };

    for (var methodName in methods) {
        _loop(methodName);
    }
    // linking reflective properties

    var _loop2 = function _loop2(propName) {
        descriptors[propName] = {
            get: function get() {
                return component[propName];
            },
            set: function set(value) {
                // proxifying before storing it is a must for public props
                value = (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' ? getPropertyProxy(value) : value;
                updateComponentProp(vm, propName, value);
                if (vm.isDirty) {
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            },
            configurable: false,
            enumerable: true
        };
    };

    for (var propName in propsConfig) {
        _loop2(propName);
    }
    defineProperties(element, descriptors);
}

function getInitialProps(element, Ctor) {
    var _getComponentDef = getComponentDef(Ctor),
        config = _getComponentDef.props;

    var props = {};
    for (var propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    return props;
}

function getInitialSlots(element, Ctor) {
    var _getComponentDef2 = getComponentDef(Ctor),
        slotNames = _getComponentDef2.slotNames;

    if (isUndefined(slotNames)) {
        return;
    }
    // TODO: implement algo to resolve slots
    return undefined;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element, Ctor) {
    if (isUndefined(Ctor)) {
        throw new TypeError("Invalid Component Definition: " + Ctor + ".");
    }
    var props = getInitialProps(element, Ctor);
    var slotset = getInitialSlots(element, Ctor);
    var tagName = element.tagName.toLowerCase();
    var vnode = c(tagName, Ctor, { props: props, slotset: slotset, className: element.className || undefined });
    vnode.isRoot = true;
    // TODO: eventually after updating snabbdom we can use toVNode(element)
    // as the first argument to reconstruct the vnode that represents the
    // current state.

    var _patch = patch(element, vnode),
        vm = _patch.vm;

    linkAttributes(element, vm);
    // TODO: for vnode with element we might not need to do any of these.
    linkProperties(element, vm);
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
function createElement(tagName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var Ctor = typeof options.is === 'function' ? options.is : null;
    var element = document.createElement(tagName, Ctor ? null : options);

    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}

// TODO: how can a user dismount a component and kick in the destroy mechanism?

exports.createElement = createElement;
exports.getComponentDef = getComponentDef;
exports.Element = ComponentElement;
exports.register = register;

}((this.Engine = this.Engine || {})));
/** version: 0.10.3 */
