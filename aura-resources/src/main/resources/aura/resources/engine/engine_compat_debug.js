/**
 * Copyright (C) 2017 salesforce.com, inc.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Engine = {})));
}(this, (function (exports) { 'use strict';

var freeze = Object.freeze;
var seal = Object.seal;
var create = Object.create;
var assign = Object.assign;
var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.hasOwnProperty;
var preventExtensions = Object.preventExtensions;
var isExtensible = Object.isExtensible;
var isArray = Array.isArray;
var _a$1 = Array.prototype;
var ArrayConcat = _a$1.concat;
var ArrayFilter = _a$1.filter;
var ArraySlice = _a$1.slice;
var ArraySplice = _a$1.splice;
var ArrayUnshift = _a$1.unshift;
var ArrayIndexOf = _a$1.indexOf;
var ArrayPush = _a$1.push;
var ArrayMap = _a$1.map;
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

var TopLevelContextSymbol = Symbol();
var currentContext = {};
currentContext[TopLevelContextSymbol] = true;
function establishContext(ctx) {
    currentContext = ctx;
}

var nextTickCallbackQueue = [];
var SPACE_CHAR = 32;
var EmptyObject = seal(create(null));
var EmptyArray = seal([]);
function flushCallbackQueue() {
    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (var i = 0, len = callbacks.length; i < len; i += 1) {
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

/**
 * This method maps between property names
 * and the corresponding attribute name.
 */

var usesNativeSymbols = typeof Symbol() === 'symbol';

var Services = create(null);
var hooks = ['wiring', 'rendered', 'connected', 'disconnected', 'piercing'];
function register(service) {
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
    var component = vm.component, data = vm.data, def = vm.def, context = vm.context;
    for (var i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}

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
    var cells = membrane.cells;
    var r = cells.get(value);
    if (r) {
        return r;
    }
    var replica = new Proxy(value, membrane);
    cells.set(value, replica);
    return replica;
}
var Membrane = /** @class */ (function () {
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
// @ts-ignore
var getKey = Proxy.getKey;
var unwrap = getKey ?
    function (replicaOrAny) { return (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny; }
    : function (replicaOrAny) { return (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny; };

function piercingHook(membrane, target, key, value) {
    var vm = membrane.handler.vm;
    var piercing = Services.piercing;
    if (piercing) {
        var component = vm.component, data = vm.data, def = vm.def, context = vm.context;
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
var PiercingMembraneHandler = /** @class */ (function () {
    function PiercingMembraneHandler(vm) {
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
        return getReplica(membrane, new (targetFn.bind.apply(targetFn, [void 0].concat(argumentsList)))());
    };
    return PiercingMembraneHandler;
}());
function pierce(vm, value) {
    var membrane = vm.membrane;
    if (!membrane) {
        var handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}

var _a$4 = Element.prototype;
var querySelector = _a$4.querySelector;
var querySelectorAll = _a$4.querySelectorAll;
function getLinkedElement$1(root) {
    return getCustomElementVM(root).elm;
}
function shadowRootQuerySelector(shadowRoot, selector) {
    var vm = getCustomElementVM(shadowRoot);
    var elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    var piercedQuerySelector = piercingHook(vm.membrane, elm, 'querySelector', elm.querySelector);
    return piercedQuerySelector.call(elm, selector);
}
function shadowRootQuerySelectorAll(shadowRoot, selector) {
    var vm = getCustomElementVM(shadowRoot);
    var elm = getLinkedElement$1(shadowRoot);
    pierce(vm, elm);
    var piercedQuerySelectorAll = piercingHook(vm.membrane, elm, 'querySelectorAll', elm.querySelectorAll);
    return piercedQuerySelectorAll.call(elm, selector);
}
var Root = /** @class */ (function () {
    function Root(vm) {
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
        return node;
    };
    Root.prototype.querySelectorAll = function (selector) {
        var nodeList = shadowRootQuerySelectorAll(this, selector);
        return nodeList;
    };
    Root.prototype.toString = function () {
        var component = getCustomElementComponent(this);
        return "Current ShadowRoot for " + component;
    };
    return Root;
}());
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
function isIframeContentWindow(key, value) {
    return (key === 'contentWindow') && value.window === value;
}
function wrapIframeWindow(win) {
    return _a = {},
        _a[TargetSlot] = win,
        _a.postMessage = function () {
            return win.postMessage.apply(win, arguments);
        },
        _a.blur = function () {
            return win.blur.apply(win, arguments);
        },
        _a.close = function () {
            return win.close.apply(win, arguments);
        },
        _a.focus = function () {
            return win.focus.apply(win, arguments);
        },
        Object.defineProperty(_a, "closed", {
            get: function () {
                return win.closed;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "frames", {
            get: function () {
                return win.frames;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "length", {
            get: function () {
                return win.length;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "location", {
            get: function () {
                return win.location;
            },
            set: function (value) {
                win.location = value;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "opener", {
            get: function () {
                return win.opener;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "parent", {
            get: function () {
                return win.parent;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "self", {
            get: function () {
                return win.self;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "top", {
            get: function () {
                return win.top;
            },
            enumerable: true,
            configurable: true
        }),
        Object.defineProperty(_a, "window", {
            get: function () {
                return win.window;
            },
            enumerable: true,
            configurable: true
        }),
        _a;
    var _a;
}
// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing: function (component, data, def, context, target, key, value, callback) {
        var vm = component[ViewModelReflection];
        var elm = vm.elm;
        if (value) {
            if (isIframeContentWindow(key, value)) {
                callback(wrapIframeWindow(value));
            }
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

var _a$3 = Element.prototype;
var getAttribute$1 = _a$3.getAttribute;
var getAttributeNS$1 = _a$3.getAttributeNS;
var removeAttribute$1 = _a$3.removeAttribute;
var removeAttributeNS$1 = _a$3.removeAttributeNS;
var setAttribute$1 = _a$3.setAttribute;
var setAttributeNS$1 = _a$3.setAttributeNS;
function getLinkedElement(cmp) {
    return cmp[ViewModelReflection].elm;
}
function querySelectorAllFromComponent(cmp, selectors) {
    var elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}
// This should be as performant as possible, while any initialization should be done lazily
var LWCElement = /** @class */ (function () {
    function LWCElement() {
        if (isNull(vmBeingConstructed)) {
            throw new ReferenceError();
        }
        var vm = vmBeingConstructed;
        var elm = vm.elm, def = vm.def;
        var component = this;
        vm.component = component;
        // TODO: eventually the render method should be a static property on the ctor instead
        // catching render method to match other callbacks
        vm.render = component.render;
        // linking elm and its component with VM
        component[ViewModelReflection] = elm[ViewModelReflection] = vm;
        defineProperties(elm, def.descriptors);
    }
    // HTML Element - The Good Parts
    LWCElement.prototype.dispatchEvent = function (event) {
        var elm = getLinkedElement(this);
        var vm = getCustomElementVM(this);
        pierce(vm, elm);
        var dispatchEvent = piercingHook(vm.membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    };
    LWCElement.prototype.addEventListener = function (type, listener) {
        var vm = getCustomElementVM(this);
        addComponentEventListener(vm, type, listener);
    };
    LWCElement.prototype.removeEventListener = function (type, listener) {
        var vm = getCustomElementVM(this);
        removeComponentEventListener(vm, type, listener);
    };
    LWCElement.prototype.setAttributeNS = function (ns, attrName, value) {
        return setAttributeNS$1.call(getLinkedElement(this), ns, attrName, value);
    };
    LWCElement.prototype.removeAttributeNS = function (ns, attrName) {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS$1.call(getLinkedElement(this), ns, attrName);
    };
    LWCElement.prototype.removeAttribute = function (attrName) {
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        return removeAttribute$1.call(getLinkedElement(this), attrName);
    };
    LWCElement.prototype.setAttribute = function (attrName, value) {
        return setAttribute$1.call(getLinkedElement(this), attrName, value);
    };
    LWCElement.prototype.getAttributeNS = function (ns, attrName) {
        return getAttributeNS$1.call(getLinkedElement(this), ns, attrName);
    };
    LWCElement.prototype.getAttribute = function (attrName) {
        // logging errors for experimentals and special attributes
        return getAttribute$1.apply(getLinkedElement(this), ArraySlice.call(arguments));
    };
    LWCElement.prototype.getBoundingClientRect = function () {
        var elm = getLinkedElement(this);
        return elm.getBoundingClientRect();
    };
    LWCElement.prototype.querySelector = function (selectors) {
        var vm = getCustomElementVM(this);
        var nodeList = querySelectorAllFromComponent(this, selectors);
        for (var i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }
        return null;
    };
    LWCElement.prototype.querySelectorAll = function (selectors) {
        var vm = getCustomElementVM(this);
        var nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        var filteredNodes = ArrayFilter.call(nodeList, function (node) { return wasNodePassedIntoVM(vm, node); });
        return pierce(vm, filteredNodes);
    };
    Object.defineProperty(LWCElement.prototype, "tagName", {
        get: function () {
            var elm = getLinkedElement(this);
            return elm.tagName + ''; // avoiding side-channeling
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LWCElement.prototype, "tabIndex", {
        get: function () {
            var elm = getLinkedElement(this);
            return elm.tabIndex;
        },
        set: function (value) {
            var vm = getCustomElementVM(this);
            if (isBeingConstructed(vm)) {
                return;
            }
            var elm = getLinkedElement(this);
            elm.tabIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LWCElement.prototype, "classList", {
        get: function () {
            return getLinkedElement(this).classList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LWCElement.prototype, "root", {
        get: function () {
            var vm = getCustomElementVM(this);
            var cmpRoot = vm.cmpRoot;
            // lazy creation of the ShadowRoot Object the first time it is accessed.
            if (isUndefined(cmpRoot)) {
                cmpRoot = new Root(vm);
                vm.cmpRoot = cmpRoot;
            }
            return cmpRoot;
        },
        enumerable: true,
        configurable: true
    });
    LWCElement.prototype.toString = function () {
        var vm = getCustomElementVM(this);
        var elm = vm.elm;
        var tagName = elm.tagName;
        var is = getAttribute$1.call(elm, 'is');
        return "<" + tagName.toLowerCase() + (is ? ' is="${is}' : '') + ">";
    };
    return LWCElement;
}());
// Global HTML Attributes
freeze(LWCElement);
seal(LWCElement.prototype);
function getCustomElementVM(elmOrCmp) {
    return elmOrCmp[ViewModelReflection];
}

var CHAR_S = 115;
var CHAR_V = 118;
var CHAR_G = 103;
var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
var SymbolIterator = Symbol.iterator;
var ELEMENT_NODE = Node.ELEMENT_NODE;
var TEXT_NODE = Node.TEXT_NODE;
var COMMENT_NODE = Node.COMMENT_NODE;
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
    var i;
    var len = className.length;
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
    remove: function (vnode, removeCallback) {
        removeVM(getCustomElementVM(vnode.elm));
        removeCallback();
    }
};
function isVElement(vnode) {
    return vnode.nt === ELEMENT_NODE;
}
function addNS(vnode) {
    var data = vnode.data, children = vnode.children, sel = vnode.sel;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray(children) && sel !== 'foreignObject') {
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
        return list;
    }
    var iterator = iterable[SymbolIterator]();
    var next = iterator.next();
    var j = 0;
    var value = next.value, last = next.done;
    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;
        // template factory logic based on the previous collected value
        var vnode = factory(value, j, j === 0, last);
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
    var len = items.length;
    var flattened = [];
    for (var j = 0; j < len; j += 1) {
        var item = items[j];
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
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, fn, [event]);
    };
}
var objToKeyMap = new WeakMap();
var globalKey = 0;
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
            var unwrapped = unwrap(obj);
            var objKey = objToKeyMap.get(unwrapped);
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

var EmptySlots = create(null);
function getSlotsetValue(slotset, slotName) {
    return slotset && slotset[slotName];
}
var slotsetProxyHandler = {
    get: function (slotset, key) { return getSlotsetValue(slotset, key); },
    set: function () {
        return false;
    },
    deleteProperty: function () {
        return false;
    },
};
{
    assign(slotsetProxyHandler, {
        apply: function (target, thisArg, argArray) {
            throw new Error("invalid call invocation from slotset");
        },
        construct: function (target, argArray, newTarget) {
            throw new Error("invalid construction invocation from slotset");
        },
    });
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
            host.removeAttribute(oldToken);
        }
        // If the template has a token apply the token to the host element
        if (!isUndefined(newToken)) {
            host.setAttribute(newToken, '');
        }
    }
}
function evaluateTemplate(vm, html) {
    var component = vm.component, context = vm.context, _a = vm.cmpSlots, cmpSlots = _a === void 0 ? EmptySlots : _a, cmpTemplate = vm.cmpTemplate;
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
    var _b = Proxy.revocable(cmpSlots, slotsetProxyHandler), slotset = _b.proxy, slotsetRevoke = _b.revoke;
    var vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    slotsetRevoke();
    return vnodes;
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs

var isRendering = false;
var vmBeingRendered = null;
function invokeComponentCallback(vm, fn, args) {
    var context = vm.context, component = vm.component;
    var ctx = currentContext;
    establishContext(context);
    var result;
    var error;
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
    var context = vm.context;
    var ctx = currentContext;
    establishContext(context);
    var component;
    var error;
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
    var render = vm.render;
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
    try {
        var html = render.call(component);
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
    var attributeChangedCallback = vm.def.attributeChangedCallback;
    if (isUndefined(attributeChangedCallback)) {
        return;
    }
    invokeComponentCallback(vm, attributeChangedCallback, [attrName, oldValue, newValue]);
}

var vmBeingConstructed = null;
function isBeingConstructed(vm) {
    return vmBeingConstructed === vm;
}
function createComponent(vm, Ctor) {
    var vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    var component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;

}
function linkComponent(vm) {
    var wire = vm.def.wire;
    if (wire) {
        var wiring = Services.wiring;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}
function clearReactiveListeners(vm) {
    var deps = vm.deps;
    var len = deps.length;
    if (len) {
        for (var i = 0; i < len; i += 1) {
            var set = deps[i];
            var pos = ArrayIndexOf.call(deps[i], vm);
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
    var cmpEvents = vm.cmpEvents, cmpListener = vm.cmpListener;
    if (isUndefined(cmpEvents)) {
        // this piece of code must be in sync with modules/component-events
        vm.cmpEvents = cmpEvents = create(null);
        vm.cmpListener = cmpListener = createComponentListener(vm);
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
        var elm = vm.elm;
        elm.addEventListener(eventName, cmpListener, false);
    }
    ArrayPush.call(cmpEvents[eventName], newHandler);
}
function removeComponentEventListener(vm, eventName, oldHandler) {
    var cmpEvents = vm.cmpEvents;
    if (cmpEvents) {
        var handlers = cmpEvents[eventName];
        var pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            return;
        }
    }

}
function handleComponentEvent(vm, event) {
    var _a = vm.cmpEvents, cmpEvents = _a === void 0 ? EmptyObject : _a;
    var type = event.type, stopImmediatePropagation = event.stopImmediatePropagation;
    var handlers = cmpEvents[type];
    if (isArray(handlers)) {
        var uninterrupted_1 = true;
        event.stopImmediatePropagation = function () {
            uninterrupted_1 = false;
            stopImmediatePropagation.call(event);
        };
        var e = pierce(vm, event);
        for (var i = 0, len = handlers.length; uninterrupted_1 && i < len; i += 1) {
            invokeComponentCallback(vm, handlers[i], [e]);
        }
        // restoring original methods
        event.stopImmediatePropagation = stopImmediatePropagation;
    }
}
function renderComponent(vm) {
    clearReactiveListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    return vnodes;
}
function markComponentAsDirty(vm) {
    vm.isDirty = true;
}
function getCustomElementComponent(elmOrRoot) {
    return elmOrRoot[ViewModelReflection].component;
}

var TargetToReactiveRecordMap = new WeakMap();
function notifyMutation(target, key) {
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        var value = reactiveRecord[key];
        if (value) {
            var len = value.length;
            for (var i = 0; i < len; i += 1) {
                var vm = value[i];
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

var ReactiveMap = new WeakMap();
var ObjectDotPrototype = Object.prototype;
function lockShadowTarget(shadowTarget, originalTarget) {
    var targetKeys = ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
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
var ReactiveProxyHandler = /** @class */ (function () {
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
        observeMutation(originalTarget, key);
        var observable = isObservable(value);
        return observable ? getReactiveProxy(value) : value;
    };
    ReactiveProxyHandler.prototype.set = function (shadowTarget, key, value) {
        var originalTarget = this.originalTarget;
        if (isRendering) {
            return false;
        }
        var oldValue = originalTarget[key];
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
    };
    ReactiveProxyHandler.prototype.deleteProperty = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        delete originalTarget[key];
        notifyMutation(originalTarget, key);
        return true;
    };
    ReactiveProxyHandler.prototype.apply = function (target /*, thisArg: any, argArray?: any*/) {

    };
    ReactiveProxyHandler.prototype.construct = function (target, argArray, newTarget) {

    };
    ReactiveProxyHandler.prototype.has = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        observeMutation(originalTarget, key);
        return key in originalTarget;
    };
    ReactiveProxyHandler.prototype.ownKeys = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
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

    };
    ReactiveProxyHandler.prototype.getPrototypeOf = function (shadowTarget) {
        var originalTarget = this.originalTarget;
        return getPrototypeOf(originalTarget);
    };
    ReactiveProxyHandler.prototype.getOwnPropertyDescriptor = function (shadowTarget, key) {
        var originalTarget = this.originalTarget;
        // keys looked up via hasOwnProperty need to be reactive
        observeMutation(originalTarget, key);
        var desc = getOwnPropertyDescriptor(originalTarget, key);
        if (isUndefined(desc)) {
            return desc;
        }
        var shadowDescriptor = getOwnPropertyDescriptor(shadowTarget, key);
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
        // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors
        if ('writable' in descriptor && !('value' in descriptor)) {
            var originalDescriptor = getOwnPropertyDescriptor(originalTarget, key);
            descriptor.value = originalDescriptor.value;
        }
        defineProperty(originalTarget, key, unwrapDescriptor(descriptor));
        if (configurable === false) {
            defineProperty(shadowTarget, key, wrapDescriptor(descriptor));
        }
        notifyMutation(originalTarget, key);
        return true;
    };
    return ReactiveProxyHandler;
}());
function getReactiveProxy(value) {
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

// stub function to prevent misuse of the @track decorator
function track() {

}
// TODO: how to allow symbols as property keys?
function createTrackedPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get: function () {
            var vm = getCustomElementVM(this);
            observeMutation(this, key);
            return vm.cmpTrack[key];
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            var observable = isObservable(newValue);
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
var vmBeingUpdated = null;
function prepareForPropUpdate(vm) {
    vmBeingUpdated = vm;
}
// TODO: how to allow symbols as property keys?
function createPublicPropertyDescriptor(proto, key, descriptor) {
    defineProperty(proto, key, {
        get: function () {
            var vm = getCustomElementVM(this);
            if (isBeingConstructed(vm)) {
                return;
            }
            observeMutation(this, key);
            return vm.cmpProps[key];
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                var observable = isObservable(newValue);
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
    var _a = descriptor || EmptyObject, get = _a.get, set = _a.set, enumerable = _a.enumerable;
    defineProperty(proto, key, {
        get: function () {
            if (get) {
                return get.call(this);
            }
        },
        set: function (newValue) {
            var vm = getCustomElementVM(this);
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                var observable = isObservable(newValue);
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
        enumerable: enumerable,
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
var ViewModelReflection = Symbol();
var CtorToDefMap = new WeakMap();
var COMPUTED_GETTER_MASK = 1;
var COMPUTED_SETTER_MASK = 2;
function createComponentDef(Ctor) {
    var name = Ctor.name;
    var props = getPublicPropertiesHash(Ctor);
    var methods = getPublicMethodsHash(Ctor);
    var observedAttrs = getObservedAttributesHash(Ctor);
    var wire$$1 = getWireHash(Ctor);
    var track$$1 = getTrackHash(Ctor);
    var proto = Ctor.prototype;
    for (var propName in props) {
        var propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        var descriptor = getOwnPropertyDescriptor(proto, propName);
        var config = propDef.config;
        if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
            createPublicAccessorDescriptor(proto, propName, descriptor);
        }
        else {
            createPublicPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (wire$$1) {
        for (var propName in wire$$1) {
            if (wire$$1[propName].method) {
                // for decorated methods we need to do nothing
                continue;
            }
            var descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track$$1) {
        for (var propName in track$$1) {
            var descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        }
    }
    var connectedCallback = proto.connectedCallback, disconnectedCallback = proto.disconnectedCallback, renderedCallback = proto.renderedCallback, errorCallback = proto.errorCallback, attributeChangedCallback = proto.attributeChangedCallback;
    var superProto = getPrototypeOf(Ctor);
    var superDef = superProto !== LWCElement ? getComponentDef(superProto) : null;
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
    var descriptors = createDescriptorMap(props, methods);
    var def = {
        name: name,
        wire: wire$$1,
        track: track$$1,
        props: props,
        methods: methods,
        observedAttrs: observedAttrs,
        descriptors: descriptors,
        connectedCallback: connectedCallback,
        disconnectedCallback: disconnectedCallback,
        renderedCallback: renderedCallback,
        errorCallback: errorCallback,
        attributeChangedCallback: attributeChangedCallback,
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
        var component = getCustomElementComponent(this);
        return component[key].apply(component, ArraySlice.call(arguments));
    };
}
var _a$2 = Element.prototype;
var getAttribute = _a$2.getAttribute;
var getAttributeNS = _a$2.getAttributeNS;
var setAttribute = _a$2.setAttribute;
var setAttributeNS = _a$2.setAttributeNS;
var removeAttribute = _a$2.removeAttribute;
var removeAttributeNS = _a$2.removeAttributeNS;
function getAttributePatched(attrName) {
    return getAttribute.apply(this, ArraySlice.call(arguments));
}
function setAttributePatched(attrName, newValue) {
    var vm = getCustomElementVM(this);
    var isObserved = isAttrObserved(vm, attrName);
    var oldValue = isObserved ? getAttribute.call(this, attrName) : null;
    setAttribute.apply(this, ArraySlice.call(arguments));
    if (isObserved) {
        newValue = getAttribute.call(this, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}
function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
    var vm = getCustomElementVM(this);
    var isObserved = isAttrObserved(vm, attrName);
    var oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;
    setAttributeNS.apply(this, ArraySlice.call(arguments));
    if (isObserved) {
        newValue = getAttributeNS.call(this, attrNameSpace, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}
function removeAttributePatched(attrName) {
    var vm = getCustomElementVM(this);
    var isObserved = isAttrObserved(vm, attrName);
    var oldValue = isObserved ? getAttribute.call(this, attrName) : null;
    removeAttribute.apply(this, ArraySlice.call(arguments));
    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}
function removeAttributeNSPatched(attrNameSpace, attrName) {
    var vm = getCustomElementVM(this);
    var isObserved = isAttrObserved(vm, attrName);
    var oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;
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
            value: createMethodCaller(key),
            configurable: true,
        };
    }
    return descriptors;
}
function getTrackHash(target) {
    var track$$1 = target.track;
    if (!track$$1 || !getOwnPropertyNames(track$$1).length) {
        return EmptyObject;
    }
    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track$$1);
}
function getWireHash(target) {
    var wire$$1 = target.wire;
    if (!wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
    }
    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire$$1);
}
function getPublicPropertiesHash(target) {
    var props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
        propsHash[propName] = assign({ config: 0, type: 'any' }, props[propName]);
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
        return methodsHash;
    }, create(null));
}
function getObservedAttributesHash(target) {
    var observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce(function (reducer, attrName) {
        reducer[attrName] = 1;
        return reducer;
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
    if (!isUndefined(TagNameToCtor[tagName])) {
        if (TagNameToCtor[tagName] === Ctor) {
            return;
        }
        else {}
    }
    TagNameToCtor[tagName] = Ctor;
}

var isArray$2 = Array.isArray;
var ELEMENT_NODE$1 = 1;
var TEXT_NODE$1 = 3;
var COMMENT_NODE$1 = 8;
var DOCUMENT_FRAGMENT_NODE = 11;
function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
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
    var i, map = {}, key, ch;
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
var hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
function init$1(modules, api, compareFn) {
    var i, j, cbs = {};
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
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
            }
        }
        if (isElementVNode(vnode)) {
            var data_1 = vnode.data, tag = vnode.tag;
            var elm = vnode.elm = isDef(i = data_1.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (isDef(i = data_1.hook) && isDef(i.create)) {
                i.create(emptyNode, vnode);
            }
            for (i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, vnode);
            }
            var children = vnode.children;
            if (isArray$2(children)) {
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
            if (isDef(i = data_1.hook) && isDef(i.insert)) {
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
        var i, j, data = vnode.data;
        if (isDef(i = data.hook) && isDef(i = i.destroy)) {
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
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
            // text nodes do not have logic associated to them
            if (isVNode(ch)) {
                if (!isTextVNode(ch)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1) {
                        cbs.remove[i_1](ch, rm);
                    }
                    if (isDef(i_1 = ch.data.hook) && isDef(i_1 = i_1.remove)) {
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
        if (isDef(i = vnode.data)) {
            hook = i.hook;
        }
        if (isDef(hook) && isDef(i = hook.prepatch)) {
            i(oldVnode, vnode);
        }
        var elm = vnode.elm = oldVnode.elm;
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
        if (isDef(hook) && isDef(i = hook.postpatch)) {
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
        if (!isArray$2(oldCh) || !isArray$2(newCh)) {
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
    var key;
    var cur;
    var old;
    var elm = vnode.elm;
    var vm = elm[ViewModelReflection];
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
    var elm = vnode.elm;
    var setAttribute = elm.setAttribute, removeAttribute = elm.removeAttribute;
    var key;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;
    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
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
var attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

var removeAttribute$2 = Element.prototype.removeAttribute;
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
    var name;
    var elm = vnode.elm;
    var style = elm.style;
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
            var cur = newStyle[name];
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
    var on = vnode.data.on;
    if (isUndefined(on)) {
        return;
    }
    var elm = vnode.elm;
    var listener = vnode.listener = createListener();
    listener.vnode = vnode;
    var name;
    for (name in on) {
        elm.addEventListener(name, listener, false);
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
        elm.removeAttribute(oldToken);
    }
    if (!isUndefined(newToken)) {
        elm.setAttribute(newToken, '');
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

var createElement$1 = document.createElement;
var createElementNS = document.createElementNS;
var createTextNode = document.createTextNode;
var createComment = document.createComment;
var _a$5 = Node.prototype;
var insertBefore$1 = _a$5.insertBefore;
var removeChild$1 = _a$5.removeChild;
var appendChild$1 = _a$5.appendChild;
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
        return document.createDocumentFragment();
    },
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
    insertBefore: function (parent, newNode, referenceNode) {
        insertBefore$1.call(parent, newNode, referenceNode);
    },
    removeChild: function (node, child) {
        removeChild$1.call(node, child);
    },
    appendChild: function (node, child) {
        appendChild$1.call(node, child);
    },
    parentNode: parentNode,
    nextSibling: nextSibling,
    setTextContent: setTextContent,
};
function vnodeCompareFn(vnode1, vnode2) {
    return vnode1.nt === vnode2.nt && vnode1.key === vnode2.key;
}
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
], htmlDomApi, vnodeCompareFn);
var patchChildren = patchVNode.children;

var idx = 0;
var uid = 0;
var OwnerKey = usesNativeSymbols ? Symbol('key') : '$$OwnerKey$$';
function addInsertionIndex(vm) {
    vm.idx = ++idx;
    var connected = Services.connected;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    var connectedCallback = vm.def.connectedCallback;
    if (!isUndefined(connectedCallback)) {
        invokeComponentCallback(vm, connectedCallback);

    }
}
function removeInsertionIndex(vm) {
    vm.idx = 0;
    var disconnected = Services.disconnected;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
    var disconnectedCallback = vm.def.disconnectedCallback;
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
    var Ctor = getCtorByTagName(tagName);
    var def = getComponentDef(Ctor);
    var isRoot = arguments.length === 2; // root elements can't provide slotset
    uid += 1;
    var vm = {
        uid: uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot: isRoot,
        def: def,
        elm: elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots: cmpSlots,
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
        var children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}
function patchErrorBoundaryVm(errorBoundaryVm) {
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
    var oldCh = vm.children;
    vm.children = children; // caching the new children collection
    if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
    }
    var error;
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
            var errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);
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
    var rendered = Services.rendered;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    var renderedCallback = vm.def.renderedCallback;
    if (!isUndefined(renderedCallback)) {
        invokeComponentCallback(vm, renderedCallback);

    }
}
var rehydrateQueue = [];
function flushRehydrationQueue() {
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
    var errorCallback = errorBoundaryVm.def.errorCallback;
    invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);

}
function resetShadowRoot(vm) {
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
    var elm = vm.elm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    return node[OwnerKey] === elm[OwnerKey];
}
function getErrorBoundaryVMFromParentElement(vm) {
    var elm = vm.elm;
    var parentElm = elm && elm.parentElement;
    return getErrorBoundaryVM(parentElm);
}
function getErrorBoundaryVMFromOwnElement(vm) {
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

var _a = Node.prototype;
var removeChild = _a.removeChild;
var appendChild = _a.appendChild;
var insertBefore = _a.insertBefore;
var replaceChild = _a.replaceChild;
var ConnectingSlot = Symbol();
var DisconnectingSlot = Symbol();
function callNodeSlot(node, slot) {
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
function createElement(sel, options) {
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
