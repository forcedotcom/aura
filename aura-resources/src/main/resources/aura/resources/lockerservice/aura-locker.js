/**
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Bundle from LockerService-Core
 * Generated: 2018-11-16
 * Version: 0.5.32
 */

(function (exports) {
'use strict';

// Declare shorthand functions. Sharing these declarations accross modules
// improves both consitency and minification. Unused declarations are dropped
// by the tree shaking process.

const { stringify } = JSON;

const { isArray } = Array;

const {
  assign,
  create: create$1,
  defineProperties,
  freeze,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  isFrozen,
  entries: ObjectEntries,
  keys: ObjectKeys,
  values: ObjectValues,
  seal
} = Object;

const {
  apply,
  construct,
  defineProperty,
  deleteProperty,
  get,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  has,
  isExtensible,
  ownKeys,
  preventExtensions,
  set,
  setPrototypeOf
} = Reflect;

/**
 * Currying is the process of transforming a function that takes multiple
 * arguments into a function that takes just a single argument and returns
 * another function if any arguments are still needed.
 *
 * Here we create such a function that take one argument, a function that needs
 * to be applied on an object, and return a new function that encapsulates
 * the function and can be applied on an object.
 *
 * Without uncurryThis():
 * hasOwnProperty = Object.prototype.hasOwnProperty;
 * hasOwnProperty.apply(someObject);
 *
 * With uncurryThis():
 * hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
 * hasOwnProperty(someObject);
 *
 * Using uncurryThis(), more than just a syntactic sugar, is an effective
 * defense mechanism which prevents .call() and .apply() from been tampered
 * by any code that loads after uncurryThis() and before freezing.
 */
const uncurryThis = fn => (thisArg, ...args) => apply(fn, thisArg, args);

const ObjectToString = uncurryThis(Object.prototype.toString);
const ObjectHasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
const FunctionBind = uncurryThis(Function.prototype.bind);

const ArrayMap = uncurryThis(Array.prototype.map);
const ArraySlice = uncurryThis(Array.prototype.slice);


function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !isArray(obj);
}

/**
 * Return a prototype which looks like an Object
 * Create prototype to allow basic object operations like hasOwnProperty etc
 */
function getObjectLikeProto() {
  const props = getOwnPropertyDescriptors(Object.prototype);
  // Do not want to leak access to the raw Object constructor
  delete props.constructor;
  // To keep it configurable in any extensions of this prototype
  // Note: This does no affect the original Object.prototype
  props.toString.configurable = true;
  const emptyProto = create$1(null, props);
  return emptyProto;
}

/**
 * Prevent shape-shifting by stringifying HTML markup!
 */
function asString(html) {
  try {
    return `${html}`;
  } catch (e) {
    return '';
  }
}

function asString$1(arg) {
  try {
    return `${arg}`;
  } catch (e) {
    return '';
  }
}

// SVG TAGS
// taken from DOMPurifier source code
// maintain a map for quick O(1) lookups of tags
const svgTagsMap = {
  svg: true,
  a: true,
  altglyph: true,
  altglyphdef: true,
  altglyphitem: true,
  animatecolor: true,
  animatemotion: true,
  animatetransform: true,
  audio: true,
  canvas: true,
  circle: true,
  clippath: true,
  defs: true,
  desc: true,
  ellipse: true,
  filter: true,
  font: true,
  g: true,
  glyph: true,
  glyphref: true,
  hkern: true,
  image: true,
  line: true,
  lineargradient: true,
  marker: true,
  mask: true,
  mpath: true,
  path: true,
  pattern: true,
  polygon: true,
  polyline: true,
  radialgradient: true,
  rect: true,
  stop: true,
  switch: true,
  symbol: true,
  text: true,
  textpath: true,
  title: true,
  tref: true,
  tspan: true,
  video: true,
  view: true,
  vkern: true,
  use: true
};

// create Array<String> of tags for DOMPurify config
const svgTags = Object.keys(svgTagsMap);

// HTML TAGS SECTION
// must be kept in sync with https://git.soma.salesforce.com/aura/aura/blob/master/aura-impl/src/main/resources/aura/component/HtmlComponent.js
const htmlTagsMap = {
  a: true,
  abbr: true,
  acronym: true,
  address: true,
  area: true,
  article: true,
  aside: true,
  audio: true,
  b: true,
  bdi: true,
  bdo: true,
  big: true,
  blockquote: true,
  body: true,
  br: true,
  button: true,
  caption: true,
  canvas: true,
  center: true,
  cite: true,
  code: true,
  col: true,
  colgroup: true,
  command: true,
  datalist: true,
  dd: true,
  del: true,
  details: true,
  dfn: true,
  dir: true,
  div: true,
  dl: true,
  dt: true,
  em: true,
  fieldset: true,
  figure: true,
  figcaption: true,
  footer: true,
  form: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  head: true,
  header: true,
  hgroup: true,
  hr: true,
  i: true,
  iframe: true,
  img: true,
  input: true,
  ins: true,
  keygen: true,
  kbd: true,
  label: true,
  legend: true,
  li: true,
  map: true,
  mark: true,
  menu: true,
  meter: true,
  nav: true,
  ol: true,
  optgroup: true,
  option: true,
  output: true,
  p: true,
  pre: true,
  progress: true,
  q: true,
  rp: true,
  rt: true,
  ruby: true,
  s: true,
  samp: true,
  section: true,
  select: true,
  small: true,
  source: true,
  span: true,
  strike: true,
  strong: true,
  sub: true,
  summary: true,
  sup: true,
  table: true,
  tbody: true,
  td: true,
  textarea: true,
  tfoot: true,
  th: true,
  thead: true,
  time: true,
  tr: true,
  track: true,
  tt: true,
  u: true,
  ul: true,
  var: true,
  video: true,
  wbr: true
};
const htmlTags = Object.keys(htmlTagsMap);

// ATTRIBUTES
const attrs = [
  'aria-activedescendant',
  'aria-atomic',
  'aria-autocomplete',
  'aria-busy',
  'aria-checked',
  'aria-controls',
  'aria-describedby',
  'aria-disabled',
  'aria-readonly',
  'aria-dropeffect',
  'aria-expanded',
  'aria-flowto',
  'aria-grabbed',
  'aria-haspopup',
  'aria-hidden',
  'aria-disabled',
  'aria-invalid',
  'aria-label',
  'aria-labelledby',
  'aria-level',
  'aria-live',
  'aria-multiline',
  'aria-multiselectable',
  'aria-orientation',
  'aria-owns',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-relevant',
  'aria-required',
  'aria-selected',
  'aria-setsize',
  'aria-sort',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
  'aria-valuetext',
  'role',
  'target'
];

// define sanitizers functions
// these functions should be PURE

// sanitize a str representing an href SVG attribute value
function sanitizeHrefAttribute(str) {
  if (str.startsWith('#')) {
    return asString$1(str);
  }
  return '';
}

function uponSanitizeAttribute(node, data) {
  const nodeName = node.nodeName.toUpperCase();
  if (nodeName === 'USE' && ['href', 'xlink:href'].includes(data.attrName)) {
    data.attrValue = sanitizeHrefAttribute(data.attrValue);
  }
  return data;
}

// Detect global object. Magically references a jsdom instance created in the bundled version
// JSDom and DOMPurify are packaged only in the bundled version of locker-sanitize
// eslint-disable-next-line
const root = typeof window !== 'undefined' ? window : jsdom.window;

// floating element used for purification of strings in Locker
// create a dummy floating element that stores text if document is not found
const floating = root.document.createElement('template');

// cache DOMPurify instances to avoid reparsing configs
// improves performance of DOMPurify.sanitize for repeated usage with same config
const instances = new WeakMap();

// DOMPurify preset configurations
// configuration objects are also used as keys in the WeakMap to retrieve a DOMPurify instance

// precompile a list of all whitelisted tags
const allTags = Array.from(new Set([].concat(svgTags).concat(htmlTags)));

// use only SVG tags, sanitizer attempts in place sanitization
const RETURN_NODE_SVG_INPLACE = {
  ALLOWED_TAGS: svgTags,
  ADD_ATTR: attrs,
  IN_PLACE: true,
  hooks: {
    uponSanitizeAttribute
  }
};

// use only svg tags, sanitizer returns a document fragment
const RETURN_NODE_SVG_NEWNODE = {
  ALLOWED_TAGS: svgTags,
  ADD_ATTR: attrs,
  RETURN_DOM_FRAGMENT: true,
  RETURN_DOM_IMPORT: true,
  hooks: {
    uponSanitizeAttribute
  }
};

// generic, sanitizer returns string
const RETURN_STRING_ALL = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  hooks: {
    uponSanitizeAttribute
  }
};

// generic, sanitizer attempts in place sanitization
const RETURN_NODE_ALL_INPLACE = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  IN_PLACE: true,
  hooks: {
    uponSanitizeAttribute
  }
};

// generic, sanitizer returns a document fragment
const RETURN_NODE_ALL_NEWNODE = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  RETURN_DOM_FRAGMENT: true,
  RETURN_DOM_IMPORT: true,
  hooks: {
    uponSanitizeAttribute
  }
};

/**
 * use global DOMPurify if provided as global
 *  defaults to package depedency otherwise
 */
function getSanitizerForConfig(config) {
  let sanitizer = instances.get(config);
  if (sanitizer) {
    return sanitizer;
  }

  if (typeof DOMPurify !== 'undefined') {
    sanitizer = new DOMPurify(root);
  } else {
    throw new Error('Missing dependency on DOMPurify');
  }

  sanitizer.setConfig(config);
  if (config.hooks) {
    Object.keys(config.hooks).forEach(key => {
      sanitizer.addHook(key, config.hooks[key]);
    });
  }
  instances.set(config, sanitizer);
  return sanitizer;
}

/**
 * Sanitize a node with strict SVG rules
 * @param {Node} node
 */
function sanitizeSvgElement(node) {
  let sanitizer = getSanitizerForConfig(RETURN_NODE_SVG_INPLACE);
  try {
    return sanitizer.sanitize(node);
  } catch (e) {
    sanitizer = getSanitizerForConfig(RETURN_NODE_SVG_NEWNODE);
  }
  return sanitizer.sanitize(node);
}

/**
 * Sanitize a node with generic rules
 * @param {Node} node
 */
function sanitizeElement(node) {
  let sanitizer = getSanitizerForConfig(RETURN_NODE_ALL_INPLACE);
  try {
    return sanitizer.sanitize(node);
  } catch (e) {
    sanitizer = getSanitizerForConfig(RETURN_NODE_ALL_NEWNODE);
  }
  return sanitizer.sanitize(node);
}

/**
 * Sanitize a string with strict SVG rules. Uses internal SVG configuration
 * For compatibility reasons this method acts as a passthrough to DOMPurify
 * @param {String} input
 */


/**
 * Will sanitize a string.
 * If passed a configuration object it will use that to cache the new DOMPurify instance
 * Defaults to internal generic configuration otherwise
 * For compatibility reasons this method acts as a passthrough to DOMPurify
 * @param {String} input
 * @param {Object} cfg - DOMPurify compatible configuration object
 */
function sanitize(input, cfg) {
  cfg = cfg || RETURN_STRING_ALL;
  const sanitizer = getSanitizerForConfig(cfg);
  return sanitizer.sanitize(input);
}

/**
 * Will sanitize a string. Uses internal Locker configuration
 * Uses a template floating element to avoid https://github.com/cure53/DOMPurify/issues/190
 * @param {String} input
 */
function sanitizeDefault(input) {
  floating.innerHTML = asString$1(input);
  const sanitizer = getSanitizerForConfig(RETURN_STRING_ALL);
  return sanitizer.sanitize(floating.content);
}

/**
 * Utility to validate if an SVG tag is whitelisted
 * @param {String} tag
 * @returns {boolean}
 */
function isAllowedSvgTag(tag) {
  return !!svgTagsMap[tag];
}

/**
 * Utility to validate if an HTML tag is whitelisted
 * @param {String} tag
 * @returns {boolean}
 */

/**
 * Sanitizes a URL string . Will prevent:
 * - usage of UTF-8 control characters. Update BLACKLIST constant to support more
 * - usage of \n, \t in url strings
 * @param {String} urlString
 * @returns {String}
 */
function sanitizeURLString(urlString) {
  const BLACKLIST = /[\u2029\u2028\n\r\t]/gi;

  // false, '', undefined, null
  if (!urlString) {
    return urlString;
  }

  if (typeof urlString !== 'string') {
    throw new TypeError('URL argument is not a string');
  }

  return urlString.replace(BLACKLIST, '');
}

/**
 * Sanitizes for a DOM element. Typical use would be when wanting to sanitize for
 * an href or src attribute of an element or window.open
 * @param {*} url
 */
function sanitizeURLForElement(url) {
  const normalized = document.createElement('a');
  normalized.href = url;
  return sanitizeURLString(normalized.href);
}

const DEFAULT = {};
const FUNCTION = { type: 'function' };
const FUNCTION_TRUST_RETURN_VALUE = { type: 'function', trustReturnValue: true };
const EVENT = { type: '@event' };
const SKIP_OPAQUE = { skipOpaque: true };
const SKIP_OPAQUE_ASCENDING = { skipOpaque: true, propertyName: 'parentNode' };
const FUNCTION_RAW_ARGS = { type: 'function', rawArguments: true };

const CTOR = { type: '@ctor' };
const RAW = { type: '@raw' };
const READ_ONLY_PROPERTY = { writable: false };

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// TODO: remove these functions. Our filtering mechanism should not
// rely on the more expensive operation.

function isObjectObject(value) {
  return typeof value === 'object' && value !== null && ObjectToString(value) === '[object Object]';
}

// https://github.com/jonschlinkert/is-plain-object
// Copyright © 2017, Jon Schlinkert. Released under the MIT License.
function isPlainObject(value) {
  if (isObjectObject(value) === false) {
    return false;
  }

  // If has modified constructor
  const ctor = value.constructor;
  if (typeof ctor !== 'function') {
    return false;
  }

  try {
    // If has modified prototype
    const proto = ctor.prototype;
    if (isObjectObject(proto) === false) {
      return false;
    }
    // If constructor does not have an Object-specific method
    if (proto.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }
  } catch (e) {
    /* Assume is  object when throws */
  }

  // Most likely a plain Object
  return true;
}

/**
 * Basic URL Scheme checking utility.
 * Checks for http: and https: url schemes.
 * @param {String} url
 * @return {Boolean}
 */
function isValidURLScheme(url) {
  const normalized = document.createElement('a');
  normalized.href = url;
  return normalized.protocol === 'https:' || normalized.protocol === 'http:';
}

/**
 * Displays a popup asking if the user wants to exit the current domain.
 * Returns a boolean of the result of that popup.
 * @return {Boolean}
 */


/**
 * Determines if a link points to a third-party domain.
 * @param {Object} currentDomain
 * @param {Object} newDomain
 * @return {Boolean}
 */

function isCustomElement(el) {
  return el.tagName && el.tagName.indexOf('-') > 0;
}

function isNode(el) {
  try {
    return el instanceof Node;
  } catch (e) {
    return false;
  }
}

function isSharedElement(el) {
  return el === document.body || el === document.head || el === document.documentElement;
}

function isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes) {
  if (typeof name !== 'string') {
    return false;
  }

  const lcName = name.toLowerCase();
  const tagName = raw.tagName && raw.tagName.toUpperCase();

  // Reason: [W-4210397] Locker does not allow setting custom HTTP headers.
  if (tagName === 'META' && lcName === 'http-equiv') {
    return false;
  }

  // Always allow names with the form a-b.* (e.g. data-foo, x-foo, ng-repeat, etc)
  if (name.indexOf('-') >= 0) {
    return true;
  }

  if (name in caseInsensitiveAttributes) {
    return true;
  }

  if (raw instanceof SVGElement) {
    return true;
  }

  if (name in prototype) {
    return true;
  }

  // Special case Label element's 'for' attribute. It called 'htmlFor' on prototype but
  // needs to be addressable as 'for' via accessors like .attributes/getAttribute()/setAtribute()
  if (tagName === 'LABEL' && lcName === 'for') {
    return true;
  }

  // Special case Meta element's custom 'property' attribute. It used by the Open Graph protocol.
  if (tagName === 'META' && lcName === 'property') {
    return true;
  }

  return false;
}

/**
 * Is the given node a shadowRoot?
 * @param {Node} node
 */
const isShadowRoot =
  typeof window.ShadowRoot !== 'undefined' ? node => node instanceof ShadowRoot : () => false;

/**
 * Detect if the parameter is a primitive.
 * - NaN and Infinity are 'numbers'.
 * - null is object but we detect it and return early.
 */
function isPrimitive(value) {
  if (value === null || value === undefined) {
    return true;
  }
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      return true;
    case 'object':
    case 'function':
      return false;
    default:
      throw new TypeError(`Type not supported ${value}`);
  }
}

function isKey(key) {
  // Key is detected by duck typing.
  return typeof key === 'object' && typeof key.namespace === 'string';
}

function getProperyValues(obj) {
  return ObjectValues(getOwnPropertyDescriptors(obj)).map(desc => desc.value);
}

/**
 * List of unfiltered objects.
 */
// TODO: W-5529670 augment the list of unfiltered types for performance.
const whitelistedObjects$1 = [
  // Function, // unsafe
  Object,
  Array,
  Function.prototype,
  ...getProperyValues(Function.prototype),
  Object.prototype,
  ...getProperyValues(Object.prototype),
  Array.prototype
];

function isWhitelistedObject(obj) {
  // Key is detected by duck typing.
  return whitelistedObjects$1.includes(obj);
}

var assert$1 = {
  block: fn => fn(),
  isTrue: (condition, message) => {
    if (!condition) {
      throw new TypeError(`Assertion failed: ${message}`);
    }
  },
  isFalse: (condition, message) => {
    if (condition) {
      throw new TypeError(`Assertion failed: ${message}`);
    }
  },
  invariant: (condition, message) => {
    if (!condition) {
      throw new TypeError(`Invariant violation: ${message}`);
    }
  },
  fail: message => {
    throw new TypeError(message);
  }
};

// Keyed objects can only have one owner. We prevent "null" and "undefined"
// keys by guarding all set operations.
const keychain = new WeakMap();
// Map to store <key> to <Weakmap of <raw> to <Secure> pairs>, this is the primary cache
const rawToSecurePrimaryCacheByKey = new Map();
// Map to store <key> to <Map of <raw> to <Secure> pairs>, will be used for raw objects that cannot be stored in a WeakMap, this is the secondary cache
const rawToSecureSecondaryCacheByKey = new Map();
const secureToRaw = new WeakMap();
const objectToKeyedData = new WeakMap();

const opaqueSecure = new WeakSet();
const secureProxy = new WeakSet();
const filteringProxy = new WeakSet();
const secureFunction = new WeakSet();

function getKey(thing) {
  return keychain.get(thing);
}

function isOpaque(st) {
  return opaqueSecure.has(st);
}

function setKey(thing, key) {
  if (!thing) {
    return;
  }
  if (!key) {
    throw new Error('Setting an empty key is prohibited.');
  }
  const hasKey = keychain.get(thing);
  if (hasKey === undefined) {
    keychain.set(thing, key);
  } else if (hasKey === key) {
    // noop.
  } else {
    // Prevent keyed objects from being keyed again.
    throw new Error('Re-setting of key is prohibited.');
  }
}

function trust$1(from, thing) {
  if (from) {
    const key = keychain.get(from);
    if (key) {
      setKey(thing, key);
    }
  }
}

function hasAccess(from, to) {
  return keychain.get(from) === keychain.get(to);
}

function verifyAccess(from, to, skipOpaque) {
  const fromKey = keychain.get(from);
  const toKey = keychain.get(to);
  if (fromKey !== toKey || (skipOpaque && isOpaque(to))) {
    throw new Error(
      `Access denied: ${JSON.stringify({
        from: fromKey,
        to: toKey
      })}`
    );
  }
}

function getRef(st, key, skipOpaque) {
  const toKey = keychain.get(st);
  if (toKey !== key || (skipOpaque && opaqueSecure.has(st))) {
    throw new Error(
      `Access denied: ${JSON.stringify({
        from: key,
        to: toKey
      })}`
    );
  }

  return secureToRaw.get(st);
}

function setRef(st, raw, key, isOpaque) {
  if (!st) {
    throw new Error('Setting an empty reference is prohibited.');
  }
  if (!key) {
    throw new Error('Setting an empty key is prohibited.');
  }
  setKey(st, key);
  secureToRaw.set(st, raw);
  if (isOpaque) {
    opaqueSecure.add(st);
  }
}

function getData(object, key) {
  const keyedData = objectToKeyedData.get(object);
  return keyedData ? keyedData.get(key) : undefined;
}

function setData(object, key, data) {
  let keyedData = objectToKeyedData.get(object);
  if (!keyedData) {
    keyedData = new WeakMap();
    objectToKeyedData.set(object, keyedData);
  }

  keyedData.set(key, data);
}

function registerProxy(st) {
  secureProxy.add(st);
}

function isProxy(st) {
  return secureProxy.has(st);
}

function registerFilteringProxy(st) {
  filteringProxy.add(st);
}

function isFilteringProxy(st) {
  return filteringProxy.has(st);
}

function registerSecureFunction(st) {
  secureFunction.add(st);
}

function isSecureFunction(st) {
  return secureFunction.has(st);
}

function unwrap$1(from, st) {
  if (!st) {
    return st;
  }

  const key = keychain.get(from);
  let ref;

  if (isArray(st)) {
    // Only getRef on "secure" arrays
    if (secureToRaw.get(st)) {
      // Secure array - reconcile modifications to the filtered clone with the actual array
      ref = getRef(st, key);

      const originalLength = ref.length;
      let insertIndex = 0;
      for (let n = 0; n < st.length; n++) {
        // Find the next available location that corresponds to the filtered projection of the array
        while (insertIndex < originalLength && getKey(ref[insertIndex]) !== key) {
          insertIndex++;
        }

        ref[insertIndex++] = unwrap$1(from, st[n]);
      }
    } else {
      ref = [];
    }
  } else {
    ref = getRef(st, key);
  }

  return ref;
}

function addToCache(raw, st, key) {
  if (!raw) {
    throw new Error('Caching an empty reference is prohibited.');
  }

  if (!key) {
    throw new Error('Caching with an empty key is prohibited.');
  }

  let rawToSecurePrimary = rawToSecurePrimaryCacheByKey.get(key);
  let rawToSecureSecondary;
  if (!rawToSecurePrimary) {
    rawToSecurePrimary = new WeakMap();
    rawToSecurePrimaryCacheByKey.set(key, rawToSecurePrimary);
  }
  try {
    rawToSecurePrimary.set(raw, st);
  } catch (e) {
    /**
     * If caching raw object fails in a weakmap,
     * then create a secondary cache implemented using a Map(which is more fault tolerant).
     */
    rawToSecureSecondary = rawToSecureSecondaryCacheByKey.get(key);
    if (!rawToSecureSecondary) {
      // Created on demand
      rawToSecureSecondary = new Map();
      rawToSecureSecondaryCacheByKey.set(key, rawToSecureSecondary);
    }
    rawToSecureSecondary.set(raw, st);
  }
}

function getFromCache(raw, key) {
  const rawToSecurePrimaryCache = rawToSecurePrimaryCacheByKey.get(key);
  if (rawToSecurePrimaryCache) {
    let secureThing = rawToSecurePrimaryCache.get(raw);
    // If raw object was cached in primary WeakMap and we have used the secondary cache, look there
    if (!secureThing && rawToSecureSecondaryCacheByKey.size > 0) {
      const rawToSecureSecondary = rawToSecureSecondaryCacheByKey.get(key);
      secureThing = rawToSecureSecondary && rawToSecureSecondary.get(raw);
    }
    return secureThing;
  }
  return undefined;
}

function getRawThis(so) {
  const raw = getRef(so, getKey(so));
  if (!raw) {
    throw new Error('Blocked attempt to invoke secure method with altered this!');
  }
  return raw;
}

function getRaw$1(value) {
  if (isProxy(value)) {
    const key = getKey(value);
    const ref = getRef(value, key);
    value = ref;
  }
  return value;
}

function getRawArray(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(getRaw$1(arr[i]));
  }
  return result;
}

const defaultKey = {
  namespace: 'default'
};

const systemKey = {
  namespace: 'system'
};

const convertOptions = {
  useNewSecureFunction: true
};

/**
 * Ensure a value from the source graph is converted to the
 * destination graph.
 */
function convert(value, fromKey, toKey) {
  assert$1.invariant(isKey(fromKey), `Convert() requires a source key: ${stringify(fromKey)}`);
  assert$1.invariant(isKey(toKey), `Convert() requires a destination key: ${stringify(toKey)}`);
  assert$1.invariant(
    fromKey !== toKey,
    `Convert() requires two different keys: ${stringify(fromKey)} to ${stringify(toKey)}`
  );

  if (isPrimitive(value) || isWhitelistedObject(value)) {
    // Do not proxy primitives.
    return value;
  }

  if (secureToRaw.has(value)) {
    // 1. The value is a secure proxy.
    const raw = secureToRaw.get(value);
    const rawKey = keychain.get(raw);
    if (rawKey === toKey) {
      // 1a. The raw object belongs to the destination graph.
      return raw;
    }
    // 1b. Create (or reuse) a secure proxy in the destination graph.
    return toKey === systemKey
      ? deepUnfilter(fromKey, [], [value])[0]
      : filter(toKey, value, convertOptions);
  }

  // 2. The value is not a proxy.
  const valueKey = keychain.get(value);
  if (!valueKey) {
    // 2a. The value has no key, it's new to the membrane.
    // It can only come from the source graph.
    // Assign it to the source graph.
    keychain.set(value, fromKey);
  }
  // 2b. Create a secure proxy in the destination graph.
  return toKey === systemKey
    ? deepUnfilter(fromKey, [], [value])[0]
    : filter(toKey, value, convertOptions);
}

/**
 * Ensure all values in an array (an argument list)
 * are converted to the destionation namespace.
 */
function convertArgs(args, fromKey, toKey) {
  return args.map(arg => convert(arg, fromKey, toKey));
}

function convertDescriptor(desc, fromKey, toKey) {
  if (desc) {
    if ('value' in desc) {
      desc.value = convert(desc.value, fromKey, toKey);
    } else {
      const { get: get$$1, set: set$$1 } = desc;
      if (get$$1) {
        desc.get = convert(get$$1, fromKey, toKey);
      }
      if (set$$1) {
        desc.set = convert(set$$1, fromKey, toKey);
      }
    }
  }
  return desc;
}

/* eslint-disable no-use-before-define */

function SecureObject(thing, key) {
  let o = getFromCache(thing, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureObject: ${thing}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  setRef(o, thing, key, true);
  addToCache(thing, o, key);
  registerProxy(o);

  return seal(o);
}

/**
 * Creates an array of unique values from two arrays.
 * This is 33% faster than Array.concat() on 2x100 arrays.
 * Dedupe using a Set is 14x slower: Array.from(new Set([...a, ...b])).
 */
function ArrayMerge(a, b) {
  assert$1.invariant(isArray(a), 'ArrayMerge() first parameter should be array');
  assert$1.invariant(isArray(b), 'ArrayMerge() first parameter should be array');

  const unique = {};
  const result = [];
  for (let i = 2; i--; a = b) {
    for (let j = 0, n = a.length; j < n; j++) {
      const value = a[j];
      unique[value] = unique[value] || result.push(value);
    }
  }
  return result;
}

/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

function createShadowTarget(raw) {
  switch (typeof raw) {
    case 'function':
      return function() {};
    case 'object':
      return isArray(raw) ? [] : {};
    default:
      throw new TypeError('Unsupported proxy target type.');
  }
}

function lockShadow(shadow, raw, fromKey, toKey) {
  const props = ownKeys(shadow);
  props.forEach(prop => {
    if (!has(shadow, prop)) {
      const desc = getOwnPropertyDescriptor(raw, prop);
      const wrapped = convertDescriptor(desc, fromKey, toKey);
      defineProperty(shadow, prop, wrapped);
    }
  });
}

/**
 * A generic handler with support for:
 * - filtered function invocation
 * - filtered constructor invocation
 * - read only filtered prototype
 * - read only filtered properties
 * - expando for new properties (unfiltered)
 * Decisions:
 * - raw properties have authority over expandos
 */
class SecureFunctionHandler {
  constructor(raw, fromKey, toKey) {
    // The raw value to proxy.
    this.raw = raw;
    // The raw value's object graph.
    this.fromKey = fromKey;
    // The proxy's object graph.
    this.toKey = toKey;
  }

  apply(_shadow, thisArg, args) {
    // Both 'this' and arguments are filtered from the graph where the
    // proxy beling sto the graph where the function was originally defined.
    thisArg = convert(thisArg, this.toKey, this.fromKey);
    args = convertArgs(args, this.toKey, this.fromKey);
    // Always try to invoke raw as a function.
    const value = apply(this.raw, thisArg, args);
    return convert(value, this.fromKey, this.toKey);
  }

  construct(_shadow, args, newTarget) {
    args = convertArgs(args, this.toKey, this.fromKey);
    newTarget = convert(newTarget, this.toKey, this.fromKey);
    // Always try to invoke raw as a constructor.
    const value = construct(this.raw, args, newTarget);
    return convert(value, this.fromKey, this.toKey);
  }

  defineProperty(shadow, prop, desc) {
    // Always invoke raw first.
    if (has(this.raw, prop)) {
      // Only set data properties on the raw object.
      if ('value' in desc) {
        // Only set existing data properties on the raw object.
        const descriptor = getOwnPropertyDescriptor(this.raw, prop);
        if ('value' in descriptor && descriptor.writable) {
          // Prevent changes to configuration of data properties.
          descriptor.value = desc.value;
          return defineProperty(this.raw, prop, descriptor);
        }
      }

      throw new TypeError(`Cannot redefine property '${prop}' of ${this.raw}`);
    }
    // Expando is unfiltered.
    return defineProperty(shadow, prop, desc);
  }

  deleteProperty(shadow, prop) {
    // Check on shadow first.
    if (shadow.hasOwnProperty(prop)) {
      // Expando is unfiltered.
      return deleteProperty(shadow, prop);
    }
    // Never delete a property raw on the raw object.
    // Behave as if the raw object is frozen.
    throw new TypeError(`Cannot delete property '${prop}' of ${this.raw}`);
  }

  get(shadow, prop, receiver) {
    if (prop === '__proto__') {
      return getPrototypeOf(receiver);
    }
    // Always invoke raw first.
    if (has(this.raw, prop)) {
      // Always filter the results returned by the raw object.
      const value = get(this.raw, prop, receiver);
      return convert(value, this.fromKey, this.toKey);
    }
    // Expando is unfiltered.
    return get(shadow, prop, receiver);
  }

  getOwnPropertyDescriptor(shadow, prop) {
    // Always invoke raw first.
    const desc = getOwnPropertyDescriptor(this.raw, prop);
    if (!desc) {
      return getOwnPropertyDescriptor(shadow, prop);
    }
    const wrapped = convertDescriptor(desc, this.fromKey, this.toKey);
    if (!desc.configurable) {
      // Proxy invariant: non-configurable properties must exist on target.
      // If descriptor of raw property is non-configurable,
      // define the property on the shadow using the wrapped descriptor.
      defineProperty(shadow, prop, wrapped);
    }
    return wrapped;
  }

  getPrototypeOf(_shadow) {
    return convert(getPrototypeOf(this.raw), this.fromKey, this.toKey);
  }

  has(shadow, prop) {
    if (!isExtensible(shadow)) {
      // If shadow isn't extensible, it's because raw isn't,
      // and all properties have already been copied.
      return shadow.hasOwnProperty(prop);
    }
    return has(this.raw, prop) || shadow.hasOwnProperty(prop);
  }

  isExtensible(shadow) {
    const extensibleShadow = isExtensible(shadow);
    if (!extensibleShadow) {
      // Proxy invariant: must report non-extensibility of target.
      // If shadow isn't extensible, we must report it.
      return extensibleShadow;
    }
    const extensible = isExtensible(this.raw);
    if (!extensible) {
      // Proxy invariant: to report non-extensibility, target must be non-extensibile.
      lockShadow(shadow, this.raw, this.fromKey, this.toKey);
      preventExtensions(shadow);
    }
    return extensible;
  }

  ownKeys(shadow) {
    if (!isExtensible(shadow)) {
      // If shadow isn't extensible, it's because raw isn't,
      // and all properties have already been copied.
      return ownKeys(shadow);
    }
    // Must remove duplicates between raw and shadow.
    return ArrayMerge(ownKeys(this.raw), ownKeys(shadow));
  }

  preventExtensions(shadow) {
    if (isExtensible(shadow)) {
      // Never freeze or change the extensibility of raw objects.
      // Proxy invariant: can't report non-extensibility of extensible target.
      // Making shadow non-extensible prevents the addition of any
      // non-configurable property of raw which appears at a later stage.
      lockShadow(shadow, this.raw, this.fromKey, this.toKey);
    }
    return preventExtensions(shadow);
  }

  set(shadow, prop, value, receiver) {
    // Always invoke raw first.
    if (has(this.raw, prop)) {
      value = convert(value, this.toKey, this.fromKey);
      return set(this.raw, prop, value, receiver);
    }
    // If raw doesn't have the property, define it on shadow.
    // Expando is unfiltered.
    return set(shadow, prop, value, receiver);
  }

  setPrototypeOf(_shadow, proto) {
    // Never change the prototype of a raw object.
    // Behave as if the raw object is frozen.
    if (proto === getPrototypeOf(this.raw)) {
      // No failure if no change if value, even if property is non-configurable.
      return true;
    }
    throw new TypeError(`Cannot set the prototyope of ${this.raw}`);
  }
}

function SecureFunction(raw, fromKey, toKey) {
  assert$1.invariant(isKey(fromKey), `SecureFunction() requires a raw toKey: ${stringify(fromKey)}`);
  assert$1.invariant(
    isKey(toKey),
    `SecureFunction() requires a destination toKey: ${stringify(toKey)}`
  );
  assert$1.invariant(
    fromKey !== toKey,
    `SecureFunction() requires two different keys: ${stringify(fromKey)} to ${stringify(toKey)}`
  );

  const shadow = createShadowTarget(raw);
  const handler = new SecureFunctionHandler(raw, fromKey, toKey);
  return new Proxy(shadow, handler);
}

const metadata$1 = {
  prototypes: {
    CanvasRenderingContext2D: {
      addHitRegion: FUNCTION,
      arc: FUNCTION,
      arcTo: FUNCTION,
      beginPath: FUNCTION,
      bezierCurveTo: FUNCTION,
      canvas: READ_ONLY_PROPERTY,
      clearHitRegions: FUNCTION,
      clearRect: FUNCTION,
      clip: FUNCTION,
      closePath: FUNCTION,
      createImageData: FUNCTION,
      createLinearGradient: FUNCTION,
      createPattern: FUNCTION_RAW_ARGS,
      createRadialGradient: FUNCTION,
      currentTransform: RAW,
      direction: DEFAULT,
      drawFocusIfNeeded: FUNCTION_RAW_ARGS,
      drawImage: FUNCTION_RAW_ARGS,
      ellipse: FUNCTION,
      fill: FUNCTION_RAW_ARGS,
      fillRect: FUNCTION,
      fillStyle: DEFAULT,
      fillText: FUNCTION,
      font: DEFAULT,
      getImageData: FUNCTION,
      getLineDash: FUNCTION,
      globalAlpha: DEFAULT,
      globalCompositeOperation: DEFAULT,
      imageSmoothingEnabled: DEFAULT,
      isPointInPath: FUNCTION,
      isPointInStroke: FUNCTION,
      lineCap: DEFAULT,
      lineDashOffset: DEFAULT,
      lineJoin: DEFAULT,
      lineTo: FUNCTION,
      lineWidth: DEFAULT,
      measureText: FUNCTION,
      miterLimit: DEFAULT,
      moveTo: FUNCTION,
      putImageData: FUNCTION_RAW_ARGS,
      quadraticCurveTo: FUNCTION,
      rect: FUNCTION,
      removeHitRegion: FUNCTION,
      restore: FUNCTION,
      resetTransform: FUNCTION,
      rotate: FUNCTION,
      save: FUNCTION,
      scale: FUNCTION,
      setLineDash: FUNCTION,
      setTransform: FUNCTION,
      scrollPathIntoView: FUNCTION_RAW_ARGS,
      strokeRect: FUNCTION,
      strokeStyle: DEFAULT,
      strokeText: FUNCTION,
      shadowBlur: DEFAULT,
      shadowColor: DEFAULT,
      shadowOffsetX: DEFAULT,
      shadowOffsetY: DEFAULT,
      stroke: FUNCTION_RAW_ARGS,
      textAlign: DEFAULT,
      textBaseline: DEFAULT,
      translate: FUNCTION,
      transform: FUNCTION
    }
  }
};

function SecureCanvasRenderingContext2D(ctx, key) {
  let o = getFromCache(ctx, key);
  if (o) {
    return o;
  }
  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureCanvasRenderingContext2D: ${ctx}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  addPrototypeMethodsAndProperties(metadata$1, o, ctx, key);

  setRef(o, ctx, key);
  addToCache(ctx, o, key);
  registerProxy(o);

  return o;
}

/**
 * Get all intrinsics:
 *
 * 1. Named intrinsics: available as data properties of
 * the global object.
 *
 * 2. Anonymous intrinsics: not otherwise reachable by own property
 * name traversal.
 *
 * https://tc39.github.io/ecma262/#table-7
 */
function getIntrinsics(realmRec) {
  const { unsafeGlobal: _ } = realmRec;

  // Anonymous intrinsics.

  const SymbolIterator = (typeof _.Symbol && _.Symbol.iterator) || '@@iterator';

  const ArrayIteratorInstance = new _.Array()[SymbolIterator]();
  const ArrayIteratorPrototype = getPrototypeOf(ArrayIteratorInstance);
  const IteratorPrototype = getPrototypeOf(ArrayIteratorPrototype);

  const AsyncFunctionInstance = _.eval('(async function(){})');
  const AsyncFunction = AsyncFunctionInstance.constructor;
  const AsyncFunctionPrototype = AsyncFunction.prototype;

  // Ensure parsing doesn't fail on platforms that don't support Generator Functions.
  let GeneratorFunctionInstance;
  try {
    GeneratorFunctionInstance = _.eval('(function*(){})');
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      // Re-throw
      throw e;
    }
  }
  const GeneratorFunction = GeneratorFunctionInstance && GeneratorFunctionInstance.constructor;
  const Generator = GeneratorFunctionInstance && GeneratorFunction.prototype;
  const GeneratorPrototype = GeneratorFunctionInstance && Generator.prototype;

  // Ensure parsing doesn't fail on platforms that don't support Async Generator Functions.
  let AsyncGeneratorFunctionInstance;
  try {
    AsyncGeneratorFunctionInstance = _.eval('(async function*(){})');
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      // Re-throw
      throw e;
    }
  }
  const AsyncGeneratorFunction =
    AsyncGeneratorFunctionInstance && AsyncGeneratorFunctionInstance.constructor;
  const AsyncGenerator = AsyncGeneratorFunctionInstance && AsyncGeneratorFunction.prototype;
  const AsyncGeneratorPrototype = AsyncGeneratorFunctionInstance && AsyncGenerator.prototype;

  // const AsyncFromSyncIteratorPrototype = undefined // not reacheable
  const AsyncIteratorPrototype =
    AsyncGeneratorFunctionInstance && getPrototypeOf(AsyncGeneratorPrototype);

  const MapIteratorObject = new _.Map()[SymbolIterator]();
  const MapIteratorPrototype = getPrototypeOf(MapIteratorObject);

  const SetIteratorObject = new _.Set()[SymbolIterator]();
  const SetIteratorPrototype = getPrototypeOf(SetIteratorObject);

  const StringIteratorObject = new _.String()[SymbolIterator]();
  const StringIteratorPrototype = getPrototypeOf(StringIteratorObject);

  const ThrowTypeError = _.eval(
    '(function () { "use strict"; return Object.getOwnPropertyDescriptor(arguments, "callee").get; })()'
  );

  const TypedArray = getPrototypeOf(Int8Array);
  const TypedArrayPrototype = TypedArray.prototype;

  // Named intrinsics

  return {
    // *** Table 7

    // %Array%
    Array: _.Array,
    // %ArrayBuffer%
    ArrayBuffer: _.ArrayBuffer,
    // %ArrayBufferPrototype%
    ArrayBufferPrototype: _.ArrayBuffer.prototype,
    // %ArrayIteratorPrototype%
    ArrayIteratorPrototype,
    // %ArrayPrototype%
    ArrayPrototype: _.Array.prototype,
    // %ArrayProto_entries%
    ArrayProto_entries: _.Array.prototype.entries,
    // %ArrayProto_foreach%
    ArrayProto_foreach: _.Array.prototype.forEach,
    // %ArrayProto_keys%
    ArrayProto_keys: _.Array.prototype.forEach,
    // %ArrayProto_values%
    ArrayProto_values: _.Array.prototype.values,
    // %AsyncFromSyncIteratorPrototype%
    // AsyncFromSyncIteratorPrototype, // Not reacheable
    // %AsyncFunction%
    AsyncFunction,
    // %AsyncFunctionPrototype%
    AsyncFunctionPrototype,
    // %AsyncGenerator%
    AsyncGenerator,
    // %AsyncGeneratorFunction%
    AsyncGeneratorFunction,
    // %AsyncGeneratorPrototype%
    AsyncGeneratorPrototype,
    // %AsyncIteratorPrototype%
    AsyncIteratorPrototype,
    // %Boolean%
    Boolean: _.Boolean,
    // %BooleanPrototype%
    BooleanPrototype: _.Boolean.prototype,
    // %DataView%
    DataView: _.DataView,
    // %DataViewPrototype%
    DataViewPrototype: _.DataView.prototype,
    // %Date%
    Date: _.Date,
    // %DatePrototype%
    DatePrototype: _.Date.prototype,
    // %decodeURI%
    decodeURI: _.decodeURI,
    // %decodeURIComponent%
    decodeURIComponent: _.decodeURIComponent,
    // %encodeURI%
    encodeURI: _.encodeURI,
    // %encodeURIComponent%
    encodeURIComponent: _.encodeURIComponent,
    // %Error%
    Error: _.Error,
    // %ErrorPrototype%
    ErrorPrototype: _.Error.prototype,
    // %eval%
    // eval: sandbox.eval,
    // %EvalError%
    EvalError: _.EvalError,
    // %EvalErrorPrototype%
    EvalErrorPrototype: _.EvalError.prototype,
    // %Float32Array%
    Float32Array: _.Float32Array,
    // %Float32ArrayPrototype%
    Float32ArrayPrototype: _.Float32Array.prototype,
    // %Float64Array%
    Float64Array: _.Float64Array,
    // %Float64ArrayPrototype%
    Float64ArrayPrototype: _.Float64Array.prototype,
    // %Function%
    Function: _.Function,
    // %FunctionPrototype%
    FunctionPrototype: Function.prototype,
    // %Generator%
    Generator,
    // %GeneratorFunction%
    GeneratorFunction,
    // %GeneratorPrototype%
    GeneratorPrototype,
    // %Int8Array%
    Int8Array: _.Int8Array,
    // %Int8ArrayPrototype%
    Int8ArrayPrototype: _.Int8Array.prototype,
    // %Int16Array%
    Int16Array: _.Int16Array,
    // %Int16ArrayPrototype%,
    Int16ArrayPrototype: _.Int16Array.prototype,
    // %Int32Array%
    Int32Array: _.Int32Array,
    // %Int32ArrayPrototype%
    Int32ArrayPrototype: _.Int32Array.prototype,
    // %isFinite%
    isFinite: _.isFinite,
    // %isNaN%
    isNaN: _.isNaN,
    // %IteratorPrototype%
    IteratorPrototype,
    // %JSON%
    JSON: _.JSON,
    // %JSONParse%
    JSONParse: _.JSON.parse,
    // %Map%
    Map: _.Map,
    // %MapIteratorPrototype%
    MapIteratorPrototype,
    // %MapPrototype%
    MapPrototype: _.Map.prototype,
    // %Math%
    Math: _.Math,
    // %Number%
    Number: _.Number,
    // %NumberPrototype%
    NumberPrototype: _.Number.prototype,
    // %Object%
    Object: _.Object,
    // %ObjectPrototype%
    ObjectPrototype: _.Object.prototype,
    // %ObjProto_toString%
    ObjProto_toString: _.Object.prototype.toString,
    // %ObjProto_valueOf%
    ObjProto_valueOf: _.Object.prototype.valueOf,
    // %parseFloat%
    parseFloat: _.parseFloat,
    // %parseInt%
    parseInt: _.parseInt,
    // %Promise%
    Promise: _.Promise,
    // %Promise_all%
    Promise_all: _.Promise.all,
    // %Promise_reject%
    Promise_reject: _.Promise.reject,
    // %Promise_resolve%
    Promise_resolve: _.Promise.resolve,
    // %PromiseProto_then%
    PromiseProto_then: _.Promise.prototype.then,
    // %PromisePrototype%
    PromisePrototype: _.Promise.prototype,
    // %Proxy%
    Proxy: _.Proxy,
    // %RangeError%
    RangeError: _.RangeError,
    // %RangeErrorPrototype%
    RangeErrorPrototype: _.RangeError.prototype,
    // %ReferenceError%
    ReferenceError: _.ReferenceError,
    // %ReferenceErrorPrototype%
    ReferenceErrorPrototype: _.ReferenceError.prototype,
    // %Reflect%
    Reflect: _.Reflect,
    // %RegExp%
    RegExp: _.RegExp,
    // %RegExpPrototype%
    RegExpPrototype: _.RegExp.prototype,
    // %Set%
    Set: _.Set,
    // %SetIteratorPrototype%
    SetIteratorPrototype,
    // %SetPrototype%
    SetPrototype: _.Set.prototype,
    // %SharedArrayBuffer%
    // SharedArrayBuffer: undefined, // Deprecated on Jan 5, 2018
    // %SharedArrayBufferPrototype%
    // SharedArrayBufferPrototype: undefined, // Deprecated on Jan 5, 2018
    // %String%
    String: _.String,
    // %StringIteratorPrototype%
    StringIteratorPrototype,
    // %StringPrototype%
    StringPrototype: _.String.prototype,
    // %Symbol%
    Symbol: _.Symbol,
    // %SymbolPrototype%
    SymbolPrototype: _.Symbol.prototype,
    // %SyntaxError%
    SyntaxError: _.SyntaxError,
    // %SyntaxErrorPrototype%
    SyntaxErrorPrototype: _.SyntaxError.prototype,
    // %ThrowTypeError%
    ThrowTypeError,
    // %TypedArray%
    TypedArray,
    // %TypedArrayPrototype%
    TypedArrayPrototype,
    // %TypeError%
    TypeError: _.TypeError,
    // %TypeErrorPrototype%
    TypeErrorPrototype: _.TypeError.prototype,
    // %Uint8Array%
    Uint8Array: _.Uint8Array,
    // %Uint8ArrayPrototype%
    Uint8ArrayPrototype: _.Uint8Array.prototype,
    // %Uint8ClampedArray%
    Uint8ClampedArray: _.Uint8ClampedArray,
    // %Uint8ClampedArrayPrototype%
    Uint8ClampedArrayPrototype: _.Uint8ClampedArray.prototype,
    // %Uint16Array%
    Uint16Array: _.Uint16Array,
    // %Uint16ArrayPrototype%
    Uint16ArrayPrototype: Uint16Array.prototype,
    // %Uint32Array%
    Uint32Array: _.Uint32Array,
    // %Uint32ArrayPrototype%
    Uint32ArrayPrototype: _.Uint32Array.prototype,
    // %URIError%
    URIError: _.URIError,
    // %URIErrorPrototype%
    URIErrorPrototype: _.URIError.prototype,
    // %WeakMap%
    WeakMap: _.WeakMap,
    // %WeakMapPrototype%
    WeakMapPrototype: _.WeakMap.prototype,
    // %WeakSet%
    WeakSet: _.WeakSet,
    // %WeakSetPrototype%
    WeakSetPrototype: _.WeakSet.prototype,

    // *** Annex B

    // %escape%
    escape: _.escape,
    // %unescape%
    unescape: _.unescape

    // TODO: other special cases
  };
}

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

// Mitigate proxy-related security issues
// https://github.com/tc39/ecma262/issues/272

// Objects that are deeply frozen
const frozenSet = new WeakSet();

/**
 * "deepFreeze()" acts like "Object.freeze()", except that:
 *
 * To deepFreeze an object is to freeze it and all objects transitively
 * reachable from it via transitive reflective property and prototype
 * traversal.
 */
function deepFreeze(node) {
  if (frozenSet.has(node)) {
    return;
  }

  // Objects that we're attempting to freeze.
  const freezingSet = new Set();

  // If val is something we should be freezing but aren't yet,
  // add it to freezingSet.
  function enqueue(val) {
    if (Object(val) !== val) {
      // ignore primitives
      return;
    }
    const type = typeof val;
    if (type !== 'object' && type !== 'function') {
      // future proof: break until someone figures out what it should do
      throw new TypeError(`Unexpected typeof: ${type}`);
    }
    if (frozenSet.has(val) || freezingSet.has(val)) {
      // Ignore if already frozen or freezing
      return;
    }
    freezingSet.add(val);
  }

  function doFreeze(obj) {
    // Immediately freeze the object to ensure reactive
    // objects such as proxies won't add properties
    // during traversal, before they get frozen.

    // Object are verified before being enqueued,
    // therefore this is a valid candidate.
    // Throws if this fails (strict mode).
    freeze(obj);

    // get stable/immutable outbound links before a Proxy has a chance to do
    // something sneaky.
    const proto = getPrototypeOf(obj);
    const descs = getOwnPropertyDescriptors(obj);
    enqueue(proto);
    ownKeys(descs).forEach(name => {
      const desc = descs[name];
      if ('value' in desc) {
        enqueue(desc.value);
      } else {
        enqueue(desc.get);
        enqueue(desc.set);
      }
    });
  }

  function dequeue() {
    // New values added before forEach() has finished will be visited.
    freezingSet.forEach(doFreeze);
  }

  function commit() {
    // "Committing" the changes upon exit guards against exceptions aborting
    // the deep freeze process, which could leave the system in a state
    // where unfrozen objects are never frozen when no longer discoverable by
    // subsequent invocations of deep-freeze because all object owning a reference
    // to them are frozen.
    freezingSet.forEach(frozenSet.add, frozenSet);
  }

  enqueue(node);
  dequeue();
  commit();
}

/**
 * This whilelist represents properties of the global object
 * which, by definition, do not provide authority or access to globals.
 *
 * We want to declare these globals as constants to prevent de-optimization
 * by the with() and the Proxy() of the  evaluator.
 */
const stdlib = [
  // *** 18.2 Function Properties of the Global Object

  // 'eval', // This property must be sanitized.
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',

  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  // *** 18.3 Constructor Properties of the Global Object

  'Array',
  'ArrayBuffer',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'Float32Array',
  'Float64Array',
  // 'Function', // This property must be sanitized.
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  // 'SharedArrayBuffer', / Deprecated on Jan 5, 2018
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakSet',

  // *** 18.4 Other Properties of the Global Object

  'Atomics',
  'JSON',
  'Math',
  'Reflect',

  // *** Annex B

  'escape',
  'unescape',

  // *** ECMA-402

  'Intl'
];

let evalEvaluatorFactory;

// Remove when SecureWindow is refactored to use sandbox
let unfrozenSet;
function setUnfrozenSet(names) {
  unfrozenSet = new Set(names);
}

/**
 * This ecaluator declares commonly used references like
 * "window" and the JS standard lib as constants to allow
 * the JIT optimizer to link to static references.
 */
function createEvalEvaluatorFactory(sandbox) {
  const { realmRec: { unsafeFunction } } = sandbox;

  // Function and eval are not in our standard lib. Only Function
  // is added here since eval needs to context switch and can't be
  // a constant.
  return unsafeFunction(`
    with (arguments[0]) {
      const {${stdlib.join(',')}, Function, window, document} = arguments[0];
      return function() {
        'use strict';
        return eval(arguments[0]);
      };
    }
  `);
}

class FreezingHandler {
  constructor(sandbox) {
    const { realmRec: { unsafeGlobal, unsafeEval } } = sandbox;
    this.unsafeGlobal = unsafeGlobal;
    this.unsafeEval = unsafeEval;
  }
  setInternalEval() {
    // This sentinel allows one scoped direct eval.
    this.isInternalEval = true;
  }
  clearInternalEval() {
    // Return to safe eval.
    this.isInternalEval = false;
  }
  get(target, prop) {
    // Special treatment for eval.
    if (prop === 'eval') {
      if (this.isInternalEval) {
        this.isInternalEval = false;
        return this.unsafeEval;
      }
      return target.eval;
    }
    if (prop === Symbol.unscopables) {
      return undefined;
    }
    // Properties of global.
    if (prop in target) {
      const value = target[prop];
      if (unfrozenSet && unfrozenSet.has(prop)) {
        deepFreeze(value);
        unfrozenSet.delete(prop);
      }
      return value;
    }
    // Prevent a lookup for other properties.
    return undefined;
  }
  has(target, prop) {
    if (prop === 'eval') {
      return true;
    }
    if (prop === 'arguments') {
      return false;
    }
    if (prop in target) {
      return true;
    }
    if (prop in this.unsafeGlobal) {
      return true;
    }
    return false;
  }
}

function createEvalEvaluator(sandbox) {
  const { globalObject } = sandbox;

  // This proxy has several functions:
  // 1. works with the sentinel to alternate between direct eval and confined eval.
  // 2. shadows all properties of the hidden global by declaring them as undefined.
  // 3. resolves all existing properties of the secure global.
  const handler = new FreezingHandler(sandbox);
  const proxy = new Proxy(globalObject, handler);

  // Lazy define and use the factory.
  if (!evalEvaluatorFactory) {
    evalEvaluatorFactory = createEvalEvaluatorFactory(sandbox);
  }
  const scopedEvaluator = evalEvaluatorFactory(proxy);

  function evaluator(src) {
    handler.setInternalEval();
    // Ensure that "this" resolves to the secure global.
    const result = scopedEvaluator.call(globalObject, src);
    handler.clearInternalEval();
    return result;
  }

  // Mimic the native eval() function. New properties are
  // by default non-writable and non-configurable.
  defineProperties(evaluator, {
    name: {
      value: 'eval'
    }
  });

  // This instance is namespace-specific, and therefore doesn't
  // need to be frozen (only the objects reachable from it).
  return evaluator;
}

/**
 * A safe version of the native Function which relies on
 * the safety of evalEvaluator for confinement.
 */
function createFunctionEvaluator(sandbox) {
  const { realmRec: { unsafeFunction, unsafeGlobal } } = sandbox;

  const evaluator = function(...params) {
    const functionBody = `${params.pop() || ''}`;
    let functionParams = `${params.join(',')}`;

    // Is this a real functionBody, or is someone attempting an injection
    // attack? This will throw a SyntaxError if the string is not actually a
    // function body. We coerce the body into a real string above to prevent
    // someone from passing an object with a toString() that returns a safe
    // string the first time, but an evil string the second time.
    // eslint-disable-next-line no-new, new-cap
    new unsafeFunction(functionBody);

    if (functionParams.includes(')')) {
      // If the formal parameters string include ) - an illegal
      // character - it may make the combined function expression
      // compile. We avoid this problem by checking for this early on.

      // note: v8 throws just like this does, but chrome accepts e.g. 'a = new Date()'
      throw new unsafeGlobal.SyntaxError('Function arg string contains parenthesis');
      // todo: shim integrity threat if they change SyntaxError
    }

    if (functionParams.length > 0) {
      // If the formal parameters include an unbalanced block comment, the
      // function must be rejected. Since JavaScript does not allow nested
      // comments we can include a trailing block comment to catch this.
      functionParams += '\n/*``*/';
    }

    const src = `(function(${functionParams}){\n${functionBody}\n})`;

    return sandbox.evalEvaluator(src);
  };

  // Ensure that the different Function instances of the different
  // sandboxes all answer properly when used with the instanceof
  // operator to preserve indentity.
  const FunctionPrototype = unsafeFunction.prototype;

  // Mimic the native signature. New properties are
  // by default non-writable and non-configurable.
  defineProperties(evaluator, {
    name: {
      value: 'Function'
    },
    prototype: {
      value: FunctionPrototype
    }
  });

  // This instance is namespace-specific, and therefore doesn't
  // need to be frozen (only the objects reachable from it).
  return evaluator;
}

let warn = typeof console !== 'undefined' ? console.warn : function() {}; // eslint-disable-line no-console
let error = Error;
let severity = {
  QUIET: 'QUIET',
  FATAL: 'FATAL',
  ALERT: 'ALERT'
};

function registerReportAPI(api) {
  if (api) {
    warn = api.warn;
    error = api.error;
    severity = api.severity;
  }
}

function SecureScriptElement() {}

// TODO: this should be removed once Locker has a proper configuration mechanism in place
const TRUSTED_DOMAINS = /\.(force|salesforce|visualforce)\.com$/;

SecureScriptElement.setOverrides = function(elementOverrides, prototype) {
  function getAttributeName(name) {
    const lowercasedName = name.toLowerCase();
    switch (lowercasedName) {
      case 'src':
        return 'data-locker-src';
      case 'href':
        return 'data-locker-href';
      default:
        return name;
    }
  }

  function isAttributeAllowed(name) {
    // null, undefined, ''
    // allow a passthrough of these values
    if (!name) {
      return true;
    }

    const BLACKLIST = ['xlink:href'];
    const lowercasedName = name.toLowerCase();
    return BLACKLIST.indexOf(lowercasedName) === -1;
  }

  elementOverrides['src'] = {
    enumerable: true,
    get: function() {
      return this.getAttribute.apply(this, ['src']);
    },
    set: function(value) {
      this.setAttribute.apply(this, ['src', value]);
    }
  };

  const orignalGetAttribute = prototype.getAttribute;
  elementOverrides['getAttribute'] = {
    value: function(name) {
      return orignalGetAttribute.apply(this, [getAttributeName(name)]);
    }
  };

  const orignalSetAttribute = prototype.setAttribute;
  elementOverrides['setAttribute'] = {
    value: function(name, value) {
      if (isAttributeAllowed(name)) {
        orignalSetAttribute.apply(this, [getAttributeName(name), value]);
      }
    }
  };

  const orignalGetAttributeNS = prototype.getAttributeNS;
  elementOverrides['getAttributeNS'] = {
    value: function(ns, name) {
      return orignalGetAttributeNS.apply(this, [ns, getAttributeName(name)]);
    }
  };

  const orignalSetAttributeNS = prototype.setAttributeNS;
  elementOverrides['setAttributeNS'] = {
    value: function(ns, name, value) {
      if (isAttributeAllowed(name)) {
        orignalSetAttributeNS.apply(this, [ns, getAttributeName(name), value]);
      }
    }
  };

  const orignalGetAttributeNode = prototype.getAttributeNode;
  elementOverrides['getAttributeNode'] = {
    value: function(name) {
      return orignalGetAttributeNode.apply(this, [getAttributeName(name)]);
    }
  };

  const orignalGetAttributeNodeNS = prototype.getAttributeNodeNS;
  elementOverrides['getAttributeNodeNS'] = {
    value: function(ns, name) {
      return orignalGetAttributeNodeNS.apply(this, [ns, getAttributeName(name)]);
    }
  };

  const orignalSetAttributeNode = prototype.setAttributeNode;
  elementOverrides['setAttributeNode'] = {
    value: function(attr) {
      let raw = unwrap$1(this, attr);
      if (!raw) {
        // this will allow the browser to throw TypeError using native error messages
        orignalGetAttributeNode.call(this, raw);
      }

      /* We are interested in the value of the given attribute but we want
            to avoid executing any getters so we will clone it and attach it
            to a floating element which is not going to be a script tag.
            According to https://dev.w3.org/html5/spec-preview/the-script-element.html section 14
            some browsers may initiate fetching the script before it has been
            added to the DOM. Not using a script tag will prevent that. */
      const clone = raw.cloneNode();
      const normalizer = document.createElement('span');
      normalizer.setAttributeNode(clone);

      const attrNode = normalizer.attributes[0];
      switch (attrNode.name) {
        case 'xlink:href': {
          return undefined;
        }
        case 'src':
        case 'href': {
          raw = document.createAttribute(getAttributeName(attrNode.name));
          raw.value = attrNode.value;
          break;
        }
        default: {
          break;
        }
      }

      const replacedAttr = orignalSetAttributeNode.call(this, raw);
      return filterEverything(this, replacedAttr);
    }
  };

  elementOverrides['attributes'] = createFilteredPropertyStateless('attributes', prototype, {
    writable: false,
    afterGetCallback: function(attributes) {
      if (!attributes) {
        return attributes;
      }
      // Secure attributes
      const secureAttributes = [];
      const raw = getRawThis(this);
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];

        // Only add supported attributes
        if (isValidAttributeName(raw, attribute.name, prototype)) {
          let attributeName = attribute.name;
          if (attribute.name === 'src') {
            continue;
          }
          if (attribute.name === 'data-locker-src') {
            attributeName = 'src';
          }

          if (attribute.name === 'data-locker-href') {
            attributeName = 'href';
          }

          secureAttributes.push({
            name: attributeName,
            value: filterEverything(this, attribute.value)
          });
        }
      }
      return secureAttributes;
    }
  });
};

SecureScriptElement.run = function(st) {
  const src = st.getAttribute('src');
  const href = st.getAttribute('href');
  const scriptUrl = src || href;

  if (!scriptUrl) {
    return;
  }

  // TODO:JS Revisit if right call
  const el = getRawThis(st);
  document.head.appendChild(el);

  if (href && !(el instanceof SVGScriptElement)) {
    return;
  }

  // Get source using XHR and secure it using
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    const key = getKey(st);
    if (xhr.status === 200) {
      const code = xhr.responseText;
      try {
        evaluate(code, key, scriptUrl);
        el.dispatchEvent(new Event('load'));
      } catch (e) {
        warn(`Failed to load script at ${scriptUrl}: ${e.message}`);
        el.dispatchEvent(new Event('error'));
      }
    }
    // DCHASMAN TODO W-2837800 Add in error handling for 404's etc
  };

  xhr.open('GET', scriptUrl, true);

  // send credentials only when performing CORS requests
  // TODO: this should be revisited once Locker has a proper configuration mechanism
  const normalized = document.createElement('a');
  normalized.href = scriptUrl;
  if (normalized.hostname.match(TRUSTED_DOMAINS)) {
    xhr.withCredentials = true;
  }

  xhr.send();
};

const SecureIFrameElement = {
  addMethodsAndProperties: function(prototype) {
    defineProperties(prototype, {
      // Standard HTMLElement methods
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
      blur: createFilteredMethodStateless('blur', prototype),
      focus: createFilteredMethodStateless('focus', prototype),
      contentWindow: {
        get: function() {
          const raw = getRawThis(this);
          return raw.contentWindow
            ? SecureIFrameElement.SecureIFrameContentWindow(raw.contentWindow, getKey(this))
            : raw.contentWindow;
        }
      },
      // Reason: [W-4437391] Cure53 Report SF-04-004: Window access via encoded path segments.
      src: {
        get: function() {
          const raw = getRawThis(this);
          return raw.src;
        },
        set: function(url) {
          const urlString = sanitizeURLForElement(url);
          if (urlString.length > 0) {
            if (!isValidURLScheme(urlString)) {
              warn(
                'SecureIframeElement.src supports http://, https:// schemes and relative urls.'
              );
            } else {
              const raw = getRawThis(this);
              raw.src = urlString;
            }
          }
        }
      }
    });

    // Standard list of iframe's properties from:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
    // Note: Ignoring 'contentDocument', 'sandbox' and 'srcdoc' from the list above.
    ['height', 'width', 'name'].forEach(name =>
      defineProperty(prototype, name, createFilteredPropertyStateless(name, prototype))
    );
  },

  // TODO: Move this function into a separate file
  SecureIFrameContentWindow: function(w, key) {
    let sicw = getFromCache(w, key);
    if (sicw) {
      return sicw;
    }
    sicw = create$1(null, {
      toString: {
        value: function() {
          return `SecureIFrameContentWindow: ${w}{ key: ${JSON.stringify(key)} }`;
        }
      }
    });

    defineProperties(sicw, {
      postMessage: createFilteredMethod(sicw, w, 'postMessage', { rawArguments: true })
    });

    setRef(sicw, w, key);
    addToCache(w, sicw, key);
    registerProxy(sicw);

    return sicw;
  }
};

const metadata$3 = {
  ATTRIBUTE_NODE: DEFAULT,
  CDATA_SECTION_NODE: DEFAULT,
  COMMENT_NODE: DEFAULT,
  DOCUMENT_FRAGMENT_NODE: DEFAULT,
  DOCUMENT_NODE: DEFAULT,
  DOCUMENT_POSITION_CONTAINED_BY: DEFAULT,
  DOCUMENT_POSITION_CONTAINS: DEFAULT,
  DOCUMENT_POSITION_DISCONNECTED: DEFAULT,
  DOCUMENT_POSITION_FOLLOWING: DEFAULT,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: DEFAULT,
  DOCUMENT_POSITION_PRECEDING: DEFAULT,
  DOCUMENT_TYPE_NODE: DEFAULT,
  ELEMENT_NODE: DEFAULT,
  ENTITY_NODE: DEFAULT,
  ENTITY_REFERENCE_NODE: DEFAULT,
  NOTATION_NODE: DEFAULT,
  PROCESSING_INSTRUCTION_NODE: DEFAULT,
  TEXT_NODE: DEFAULT,
  appendChild: FUNCTION,
  baseURI: DEFAULT,
  childNodes: DEFAULT,
  cloneNode: FUNCTION,
  compareDocumentPosition: FUNCTION_RAW_ARGS,
  contains: FUNCTION_RAW_ARGS,
  firstChild: SKIP_OPAQUE,
  hasChildNodes: FUNCTION,
  insertBefore: FUNCTION,
  isDefaultNamespace: FUNCTION,
  isEqualNode: FUNCTION_RAW_ARGS,
  isSameNode: FUNCTION_RAW_ARGS,
  lastChild: SKIP_OPAQUE,
  lookupNamespaceURI: FUNCTION,
  lookupPrefix: FUNCTION,
  nextSibling: SKIP_OPAQUE,
  nodeName: DEFAULT,
  nodeType: DEFAULT,
  nodeValue: DEFAULT,
  normalize: FUNCTION,
  ownerDocument: DEFAULT,
  parentElement: SKIP_OPAQUE,
  parentNode: SKIP_OPAQUE,
  previousSibling: SKIP_OPAQUE,
  removeChild: FUNCTION,
  replaceChild: FUNCTION,
  textContent: DEFAULT
};

const metadata$4 = {
  addEventListener: FUNCTION,
  dispatchEvent: FUNCTION,
  removeEventListener: FUNCTION
};

const CALLBACK_ERROR = `Failed to execute 'addEventListener' on 'EventTarget': The callback provided as parameter 2 is not an object.`;

function getWrappedEvent(e, key) {
  if (!e) {
    return e;
  }
  // If e is a wrapped event
  if (isProxy(e)) {
    // Wrapped with the required key, then nothing to do further
    if (getKey(e) === key) {
      return e;
    }
    assert$1.fail(
      `Received a wrapped event(key: ${getKey(e)}) from a different locker(key: ${key})`
    );
    // If the browser is calling your listener, then you have access to the event
    e = getRawThis(e);
  }
  return SecureDOMEvent(e, key);
}

function createSecureListener(st, listener, key) {
  // If the listener is a function, we need to ignore any
  // handleEvent property set on it.
  if (typeof listener === 'function') {
    return function(e) {
      verifyAccess(st, listener, true);
      const se = getWrappedEvent(e, key);
      listener.call(st, se);
    };
  }

  if (typeof listener === 'object') {
    // capture the pointer to prevent shape-shifting
    const handleEvent = listener.handleEvent;
    if (typeof handleEvent === 'function') {
      return function(e) {
        verifyAccess(st, listener, true);
        const se = getWrappedEvent(e, key);
        handleEvent.call(listener, se);
      };
    }
  }

  return undefined;
}

function getSecureListener(st, listener, key) {
  let sListener = getFromCache(listener, key);
  if (!sListener) {
    sListener = createSecureListener(st, listener, key);
    addToCache(listener, sListener, key);
    setKey(listener, key);
  }
  return sListener;
}

function createAddEventListenerDescriptor(st, el, key) {
  return {
    writable: true,
    value: function(event, listener, useCapture) {
      if (!listener) {
        return; // by spec, missing callback argument does not throw,
        // just ignores it.
      }
      if (Object(listener) !== listener) {
        throw new TypeError(CALLBACK_ERROR);
      }

      const sListener = getSecureListener(st, listener, key);
      el.addEventListener(event, sListener, useCapture);
    }
  };
}

function addEventTargetMethods(st, raw, key) {
  defineProperties(st, {
    addEventListener: createAddEventListenerDescriptor(st, raw, key),
    dispatchEvent: createFilteredMethod(st, raw, 'dispatchEvent', {
      rawArguments: true
    }),

    // removeEventListener() is special in that we do not want to
    // unfilter/unwrap the listener argument or it will not match what
    // was actually wired up originally
    removeEventListener: {
      writable: true,
      value: function(type, listener, options) {
        const sCallback = getFromCache(listener, key);
        raw.removeEventListener(type, sCallback, options);
      }
    }
  });
}

function createAddEventListenerDescriptorStateless() {
  return {
    value: function(event, listener, useCapture) {
      if (!listener) {
        return; // by spec, missing callback argument does not throw,
        // just ignores it.
      }
      if (Object(listener) !== listener) {
        throw new TypeError(CALLBACK_ERROR);
      }

      const so = this;
      const el = getRawThis(so);
      const key = getKey(so);

      const sListener = getSecureListener(so, listener, key);
      el.addEventListener(event, sListener, useCapture);
    }
  };
}

function createEventTargetMethodsStateless(config, prototype) {
  config['addEventListener'] = createAddEventListenerDescriptorStateless(prototype);

  config['dispatchEvent'] = createFilteredMethodStateless('dispatchEvent', prototype, {
    rawArguments: true
  });

  // removeEventListener() is special in that we do not want to
  // unfilter/unwrap the listener argument or it will not match what
  // was actually wired up originally
  config['removeEventListener'] = {
    value: function(type, listener, options) {
      const raw = getRawThis(this);
      const sCallback = getFromCache(listener, getKey(this));
      raw.removeEventListener(type, sCallback, options);
    }
  };
}

let lwcUnwrap = value => value;
let lwcGetComponentDef = () => undefined;
let lwcGetComponentConstructor = () => undefined;
let lwcIsNodeFromTemplate = () => false;

function registerLWCAPI(api) {
  if (api) {
    if (api.lwcUnwrap) {
      lwcUnwrap = api.lwcUnwrap;
    }
    if (api.lwcGetComponentDef) {
      lwcGetComponentDef = api.lwcGetComponentDef;
    }
    if (api.lwcGetComponentConstructor) {
      lwcGetComponentConstructor = api.lwcGetComponentConstructor;
    }
    if (api.lwcIsNodeFromTemplate) {
      lwcIsNodeFromTemplate = api.lwcIsNodeFromTemplate;
    }
  }
}

/**
 * Add additional properties for custom elements
 * @param {*} el DOM element
 * @param {*} prototype Represents the psuedo protototype that will be used to create wrapped element
 * @param {*} tagNameSpecificConfig Temporary holder of tag specific config
 */
function customElementHook$1(el, prototype, tagNameSpecificConfig) {
  assert$1.invariant(isCustomElement(el), 'Cannot call custom element hook on a non custom element');
  const methodOptions = {
    unfilterEverything: function(args) {
      const st = this;
      return deepUnfilterMethodArguments(st, [], args);
    }
  };
  const elComponentConstructor = lwcGetComponentConstructor(el);
  if (elComponentConstructor) {
    const elComponentMethods = lwcGetComponentDef(elComponentConstructor).methods;
    if (elComponentMethods) {
      ObjectKeys(elComponentMethods).forEach(method => {
        tagNameSpecificConfig[method] = createFilteredMethodStateless(
          method,
          prototype,
          methodOptions
        );
      });
    }
    const elComponentProps = lwcGetComponentDef(elComponentConstructor).props;
    if (elComponentProps) {
      ObjectKeys(elComponentProps).forEach(prop => {
        tagNameSpecificConfig[prop] = {
          enumerable: true,
          get() {
            // When the secure parent is accessing a value on the child element
            const raw = getRawThis(this);
            const value = raw[prop];
            return filter(getKey(this), value);
          },
          set(newValue) {
            // When the secure parent is setting a value on the child component
            const raw = getRawThis(this);
            // Deep unfilter the value and let the setHook() filter the value at the destination
            raw[prop] = deepUnfilter(getKey(this), [], [newValue])[0];
          }
        };
      });
    }
  }
}

/**
 * Was node created by lwc?
 * Will return true for all nodes in an LWC component's template and shadowRoot nodes of LWC components
 * @param {Node} node node to check
 */
function isAnLWCNode(node) {
  assert$1.invariant(node, 'Checking an undefined value to be node');
  if (
    lwcIsNodeFromTemplate(node) ||
    (ShadowRoot && node instanceof ShadowRoot && lwcIsNodeFromTemplate(node.host))
  ) {
    return true;
  }
  return false;
}

/**
 * Is an LWC Data proxy
 * Note: Looks similar to isAnLWCNode() above, but that function is going to change after
 * LWC removes traverse-membrane.
 * @param {*} value
 */
function isDataProxy(value) {
  assert$1.invariant(value, 'Checking an undefined value to be data proxy');
  if (value !== lwcUnwrap(value)) {
    return true;
  }
  return false;
}

/**
 * Determine the host element for a given node and the path to the host
 * @param {Node} node The node being accessed
 */
function getHost(node) {
  if (!node) {
    return node;
  }
  // Traverse up until we have reached the shadowRoot of the node
  // or document(this is the case when the given node is host element of an interop component)
  while (node && !isShadowRoot(node)) {
    node = node.parentNode;
  }
  return node ? node.host : node;
}

/**
 * Get the locker key for a given host element's component class
 * Note: Not using a weak map here to cache this information locally because that would be slower
 * asking LWC. LWC does a Symbol property lookup directly on the element.
 * lookup to get the information.
 * @param {HTMLElement} el
 */
function getKeyFromComponentConstructor(el) {
  const elComponentConstructor = lwcGetComponentConstructor(el);
  return getKey(elComponentConstructor);
}

/**
 * Can the given node be accessed with this key
 * @param {Object} key locker key of the thing trying to access the node
 * @param {Node} node
 * @return Boolean
 */
function isAccessibleLWCNode(key, node) {
  if (!key) {
    throw new TypeError(`Unexpected value receved for key: ${key}`);
  }
  // Check if the node was created by LWC, this is a fast symbol look up by LWC
  if (!isAnLWCNode(node)) {
    return false;
  }

  // Find the host in whose template the node was declared
  const host = getHost(node);
  if (!host) {
    return false;
  }

  const hostComponentKey = getKeyFromComponentConstructor(host);
  // If the host is an instance of a lockerized component class
  if (hostComponentKey) {
    // Check if accessor key is same as node's key
    return hostComponentKey === key;
  }
  return false;
}

const proxyMap = new WeakMap();
function addProxy(proxy, raw) {
  proxyMap.set(proxy, raw);
}

const lsProxyFormatter = {
  header: proxy => {
    const raw = proxyMap.get(proxy);
    if (!raw) {
      return null;
    }
    // If SecureElement proxy, show the original element
    if (raw instanceof Element) {
      return ['object', { object: raw }];
    }
    // TODO: If Array proxy or HTMLCollection/NodeList proxy, we need to filter the elements and display only the raw values of those elements
    return null;
  },
  // let the browser display the object in its native format
  hasBody: () => false,
  body: () => null
};

/** Custom Formatter for Dev Tools
 * To enable this, open Chrome Dev Tools
 * Go to Settings,
 * Under console, select "Enable custom formatters"
 * For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
 */
if (typeof window !== 'undefined') {
  window.devtoolsFormatters = window.devtoolsFormatters || [];
  window.devtoolsFormatters.push(lsProxyFormatter);
}

let customElementHook$$1;
function registerCustomElementHook(hook) {
  customElementHook$$1 = hook;
}

const REGEX_CONTAINS_IMPORT = /import/i;

// Remove when SecureElement is refactored to use sandbox
let shouldFreeze;
function setElementRealm(realmRec) {
  shouldFreeze = realmRec.shouldFreeze;
}

/* import { isValidURLScheme } from '../utils/checks';
import { sanitizeURLForElement } from '../utils/sanitize';
 */
const metadata$2 = {
  prototypes: {
    DocumentFragment: {
      childElementCount: DEFAULT,
      children: DEFAULT,
      firstElementChild: SKIP_OPAQUE,
      getElementById: FUNCTION,
      lastElementChild: SKIP_OPAQUE,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION
    },
    HTMLAnchorElement: {
      charset: DEFAULT,
      coords: DEFAULT,
      download: DEFAULT,
      hash: DEFAULT,
      host: DEFAULT,
      hostname: DEFAULT,
      href: DEFAULT,
      hreflang: DEFAULT,
      name: DEFAULT,
      origin: DEFAULT,
      password: DEFAULT,
      pathname: DEFAULT,
      ping: DEFAULT,
      port: DEFAULT,
      protocol: DEFAULT,
      referrerPolicy: DEFAULT,
      rel: DEFAULT,
      rev: DEFAULT,
      search: DEFAULT,
      shape: DEFAULT,
      target: DEFAULT,
      text: DEFAULT,
      type: DEFAULT,
      username: DEFAULT
    },
    HTMLAreaElement: {
      alt: DEFAULT,
      coords: DEFAULT,
      hash: DEFAULT,
      host: DEFAULT,
      hostname: DEFAULT,
      href: DEFAULT,
      noHref: DEFAULT,
      origin: DEFAULT,
      password: DEFAULT,
      pathname: DEFAULT,
      ping: DEFAULT,
      port: DEFAULT,
      protocol: DEFAULT,
      referrerPolicy: DEFAULT,
      search: DEFAULT,
      shape: DEFAULT,
      target: DEFAULT,
      username: DEFAULT
    },
    HTMLAudioElement: {},
    HTMLMediaElement: {
      HAVE_CURRENT_DATA: DEFAULT,
      HAVE_ENOUGH_DATA: DEFAULT,
      HAVE_FUTURE_DATA: DEFAULT,
      HAVE_METADATA: DEFAULT,
      HAVE_NOTHING: DEFAULT,
      NETWORK_EMPTY: DEFAULT,
      NETWORK_IDLE: DEFAULT,
      NETWORK_LOADING: DEFAULT,
      NETWORK_NO_SOURCE: DEFAULT,
      addTextTrack: FUNCTION,
      autoplay: DEFAULT,
      buffered: DEFAULT,
      canPlayType: FUNCTION,
      controls: DEFAULT,
      crossOrigin: DEFAULT,
      currentSrc: DEFAULT,
      currentTime: DEFAULT,
      defaultMuted: DEFAULT,
      defaultPlaybackRate: DEFAULT,
      disableRemotePlayback: DEFAULT,
      duration: DEFAULT,
      ended: DEFAULT,
      error: DEFAULT,
      load: FUNCTION,
      loop: DEFAULT,
      mediaKeys: DEFAULT,
      muted: DEFAULT,
      networkState: DEFAULT,
      onencrypted: EVENT,
      pause: FUNCTION,
      paused: DEFAULT,
      play: FUNCTION,
      playbackRate: DEFAULT,
      played: DEFAULT,
      preload: DEFAULT,
      readyState: DEFAULT,
      seekable: DEFAULT,
      seeking: DEFAULT,
      setMediaKeys: FUNCTION,
      setSinkId: FUNCTION,
      sinkId: DEFAULT,
      src: DEFAULT,
      srcObject: DEFAULT,
      textTracks: DEFAULT,
      volume: DEFAULT,
      webkitAudioDecodedByteCount: DEFAULT,
      webkitVideoDecodedByteCount: DEFAULT
    },
    HTMLBaseElement: {
      href: DEFAULT,
      target: DEFAULT
    },
    HTMLButtonElement: {
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      form: DEFAULT,
      formAction: DEFAULT,
      formEnctype: DEFAULT,
      formMethod: DEFAULT,
      formNoValidate: DEFAULT,
      formTarget: DEFAULT,
      labels: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLCanvasElement: {
      captureStream: FUNCTION,
      getContext: FUNCTION,
      height: DEFAULT,
      toBlob: FUNCTION,
      toDataURL: FUNCTION,
      width: DEFAULT
    },
    HTMLTableColElement: {
      align: DEFAULT,
      ch: DEFAULT,
      chOff: DEFAULT,
      span: DEFAULT,
      vAlign: DEFAULT,
      width: DEFAULT
    },
    HTMLUnknownElement: {},
    HTMLModElement: {
      cite: DEFAULT,
      dateTime: DEFAULT
    },
    HTMLDetailsElement: {
      open: DEFAULT
    },
    HTMLEmbedElement: {
      align: DEFAULT,
      getSVGDocument: FUNCTION,
      height: DEFAULT,
      name: DEFAULT,
      src: DEFAULT,
      type: DEFAULT,
      width: DEFAULT
    },
    HTMLFieldSetElement: {
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      elements: DEFAULT,
      form: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLFormElement: {
      acceptCharset: DEFAULT,
      action: DEFAULT,
      autocomplete: DEFAULT,
      checkValidity: FUNCTION,
      elements: DEFAULT,
      encoding: DEFAULT,
      enctype: DEFAULT,
      length: DEFAULT,
      method: DEFAULT,
      name: DEFAULT,
      noValidate: DEFAULT,
      reportValidity: FUNCTION,
      requestAutocomplete: FUNCTION,
      reset: FUNCTION,
      submit: FUNCTION,
      target: DEFAULT
    },
    HTMLIFrameElement: {
      align: DEFAULT,
      allowFullscreen: DEFAULT,
      frameBorder: DEFAULT,
      height: DEFAULT,
      longDesc: DEFAULT,
      marginHeight: DEFAULT,
      marginWidth: DEFAULT,
      name: DEFAULT,
      referrerPolicy: DEFAULT,
      scrolling: DEFAULT,
      src: DEFAULT,
      width: DEFAULT
    },
    HTMLImageElement: {
      align: DEFAULT,
      alt: DEFAULT,
      border: DEFAULT,
      complete: DEFAULT,
      crossOrigin: DEFAULT,
      currentSrc: DEFAULT,
      height: DEFAULT,
      hspace: DEFAULT,
      isMap: DEFAULT,
      longDesc: DEFAULT,
      lowsrc: DEFAULT,
      name: DEFAULT,
      naturalHeight: DEFAULT,
      naturalWidth: DEFAULT,
      referrerPolicy: DEFAULT,
      sizes: DEFAULT,
      src: DEFAULT,
      srcset: DEFAULT,
      useMap: DEFAULT,
      vspace: DEFAULT,
      width: DEFAULT,
      x: DEFAULT,
      y: DEFAULT
    },
    HTMLInputElement: {
      accept: DEFAULT,
      align: DEFAULT,
      alt: DEFAULT,
      autocapitalize: DEFAULT,
      autocomplete: DEFAULT,
      autocorrect: DEFAULT,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      checked: DEFAULT,
      defaultChecked: DEFAULT,
      defaultValue: DEFAULT,
      dirName: DEFAULT,
      disabled: DEFAULT,
      files: DEFAULT,
      form: DEFAULT,
      formAction: DEFAULT,
      formEnctype: DEFAULT,
      formMethod: DEFAULT,
      formNoValidate: DEFAULT,
      formTarget: DEFAULT,
      height: DEFAULT,
      incremental: DEFAULT,
      indeterminate: DEFAULT,
      labels: DEFAULT,
      list: DEFAULT,
      max: DEFAULT,
      maxLength: DEFAULT,
      min: DEFAULT,
      minLength: DEFAULT,
      multiple: DEFAULT,
      name: DEFAULT,
      pattern: DEFAULT,
      placeholder: DEFAULT,
      readOnly: DEFAULT,
      reportValidity: FUNCTION,
      required: DEFAULT,
      results: DEFAULT,
      select: FUNCTION,
      selectionDirection: DEFAULT,
      selectionEnd: DEFAULT,
      selectionStart: DEFAULT,
      setCustomValidity: FUNCTION,
      setRangeText: FUNCTION,
      setSelectionRange: FUNCTION,
      size: DEFAULT,
      src: DEFAULT,
      step: DEFAULT,
      stepDown: FUNCTION,
      stepUp: FUNCTION,
      type: DEFAULT,
      useMap: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      valueAsDate: DEFAULT,
      valueAsNumber: DEFAULT,
      webkitEntries: DEFAULT,
      webkitdirectory: DEFAULT,
      width: DEFAULT,
      willValidate: DEFAULT,
      'x-moz-errormessage': DEFAULT
    },
    HTMLLabelElement: {
      control: DEFAULT,
      form: DEFAULT,
      htmlFor: DEFAULT
    },
    HTMLLIElement: {
      type: DEFAULT,
      value: DEFAULT
    },
    HTMLLinkElement: {
      as: DEFAULT,
      charset: DEFAULT,
      crossOrigin: DEFAULT,
      disabled: DEFAULT,
      href: DEFAULT,
      hreflang: DEFAULT,
      import: DEFAULT,
      integrity: DEFAULT,
      media: DEFAULT,
      rel: DEFAULT,
      relList: DEFAULT,
      rev: DEFAULT,
      sheet: DEFAULT,
      sizes: DEFAULT,
      target: DEFAULT,
      type: DEFAULT
    },
    HTMLMapElement: {
      areas: DEFAULT,
      name: DEFAULT
    },
    HTMLMetaElement: {
      content: DEFAULT,
      httpEquiv: DEFAULT,
      name: DEFAULT,
      scheme: DEFAULT
    },
    HTMLMeterElement: {
      high: DEFAULT,
      labels: DEFAULT,
      low: DEFAULT,
      max: DEFAULT,
      min: DEFAULT,
      optimum: DEFAULT,
      value: DEFAULT
    },
    HTMLObjectElement: {
      align: DEFAULT,
      archive: DEFAULT,
      border: DEFAULT,
      checkValidity: FUNCTION,
      code: DEFAULT,
      codeBase: DEFAULT,
      codeType: DEFAULT,
      contentDocument: DEFAULT,
      data: DEFAULT,
      declare: DEFAULT,
      form: DEFAULT,
      getSVGDocument: FUNCTION,
      height: DEFAULT,
      hspace: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      standby: DEFAULT,
      type: DEFAULT,
      useMap: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      vspace: DEFAULT,
      width: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLOListElement: {
      compact: DEFAULT,
      reversed: DEFAULT,
      start: DEFAULT,
      type: DEFAULT
    },
    HTMLOptGroupElement: {
      disabled: DEFAULT,
      label: DEFAULT
    },
    HTMLOptionElement: {
      defaultSelected: DEFAULT,
      disabled: DEFAULT,
      form: DEFAULT,
      index: DEFAULT,
      label: DEFAULT,
      selected: DEFAULT,
      text: DEFAULT,
      value: DEFAULT
    },
    HTMLOutputElement: {
      checkValidity: FUNCTION,
      defaultValue: DEFAULT,
      form: DEFAULT,
      htmlFor: DEFAULT,
      labels: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLParamElement: {
      name: DEFAULT,
      type: DEFAULT,
      value: DEFAULT,
      valueType: DEFAULT
    },
    HTMLProgressElement: {
      labels: DEFAULT,
      max: DEFAULT,
      position: DEFAULT,
      value: DEFAULT
    },
    HTMLQuoteElement: {
      cite: DEFAULT
    },
    HTMLScriptElement: {
      src: DEFAULT,
      type: DEFAULT
    },
    HTMLSelectElement: {
      add: FUNCTION,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      form: DEFAULT,
      item: FUNCTION,
      labels: DEFAULT,
      length: DEFAULT,
      multiple: DEFAULT,
      name: DEFAULT,
      namedItem: FUNCTION,
      options: DEFAULT,
      remove: FUNCTION,
      reportValidity: FUNCTION,
      required: DEFAULT,
      selectedIndex: DEFAULT,
      selectedOptions: DEFAULT,
      setCustomValidity: FUNCTION,
      size: DEFAULT,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLSlotElement: {
      assignedElements: FUNCTION,
      assignedNodes: FUNCTION,
      name: DEFAULT
    },
    HTMLSourceElement: {
      media: DEFAULT,
      sizes: DEFAULT,
      src: DEFAULT,
      srcset: DEFAULT,
      type: DEFAULT
    },
    HTMLTableCellElement: {
      abbr: DEFAULT,
      align: DEFAULT,
      axis: DEFAULT,
      bgColor: DEFAULT,
      cellIndex: DEFAULT,
      ch: DEFAULT,
      chOff: DEFAULT,
      colSpan: DEFAULT,
      headers: DEFAULT,
      height: DEFAULT,
      noWrap: DEFAULT,
      rowSpan: DEFAULT,
      scope: DEFAULT,
      vAlign: DEFAULT,
      width: DEFAULT
    },
    HTMLTableElement: {
      caption: DEFAULT,
      tHead: SKIP_OPAQUE,
      tFoot: SKIP_OPAQUE,
      tBodies: DEFAULT,
      createTHead: FUNCTION_TRUST_RETURN_VALUE,
      deleteTHead: FUNCTION,
      createTFoot: FUNCTION_TRUST_RETURN_VALUE,
      deleteTFoot: FUNCTION,
      createCaption: FUNCTION_TRUST_RETURN_VALUE,
      deleteCaption: FUNCTION,
      rows: DEFAULT,
      insertRow: FUNCTION_TRUST_RETURN_VALUE,
      deleteRow: FUNCTION,
      width: DEFAULT
    },
    HTMLTableRowElement: {
      cells: DEFAULT,
      rowIndex: DEFAULT,
      sectionRowIndex: DEFAULT,
      insertCell: FUNCTION_TRUST_RETURN_VALUE,
      deleteCell: FUNCTION
    },
    HTMLTableSectionElement: {
      rows: DEFAULT,
      insertRow: FUNCTION_TRUST_RETURN_VALUE,
      deleteRow: FUNCTION
    },
    HTMLTemplateElement: {
      content: DEFAULT
    },
    HTMLTextAreaElement: {
      autocapitalize: DEFAULT,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      cols: DEFAULT,
      defaultValue: DEFAULT,
      dirName: DEFAULT,
      disabled: DEFAULT,
      form: DEFAULT,
      labels: DEFAULT,
      maxLength: DEFAULT,
      minLength: DEFAULT,
      name: DEFAULT,
      placeholder: DEFAULT,
      readOnly: DEFAULT,
      reportValidity: FUNCTION,
      required: DEFAULT,
      rows: DEFAULT,
      select: FUNCTION,
      selectionDirection: DEFAULT,
      selectionEnd: DEFAULT,
      selectionStart: DEFAULT,
      setCustomValidity: FUNCTION,
      setRangeText: FUNCTION,
      setSelectionRange: FUNCTION,
      textLength: DEFAULT,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT,
      wrap: DEFAULT
    },
    HTMLTrackElement: {
      ERROR: DEFAULT,
      LOADED: DEFAULT,
      LOADING: DEFAULT,
      NONE: DEFAULT,
      default: DEFAULT,
      kind: DEFAULT,
      label: DEFAULT,
      readyState: DEFAULT,
      src: DEFAULT,
      srclang: DEFAULT,
      track: DEFAULT
    },
    HTMLVideoElement: {
      height: DEFAULT,
      poster: DEFAULT,
      videoHeight: DEFAULT,
      videoWidth: DEFAULT,
      width: DEFAULT
    },
    HTMLElement: {
      accessKey: DEFAULT,
      assignedSlot: DEFAULT,
      blur: FUNCTION,
      click: FUNCTION,
      contentEditable: DEFAULT,
      dataset: DEFAULT,
      dir: DEFAULT,
      draggable: DEFAULT,
      focus: FUNCTION,
      hidden: DEFAULT,
      innerText: DEFAULT,
      isContentEditable: DEFAULT,
      lang: DEFAULT,
      offsetHeight: DEFAULT,
      offsetLeft: DEFAULT,
      offsetParent: DEFAULT,
      offsetTop: DEFAULT,
      offsetWidth: DEFAULT,
      onabort: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      outerText: DEFAULT,
      slot: DEFAULT,
      spellcheck: DEFAULT,
      style: DEFAULT,
      tabIndex: DEFAULT,
      title: DEFAULT,
      translate: DEFAULT,
      webkitdropzone: DEFAULT
    },
    SVGAngle: {
      unitType: DEFAULT,
      value: DEFAULT,
      valueInSpecifiedUnits: DEFAULT,
      valueAsString: DEFAULT,
      newValueSpecifiedUnits: FUNCTION,
      convertToSpecifiedUnits: FUNCTION
    },
    SVGAnimatedAngle: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedBoolean: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedEnumeration: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedInteger: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedLength: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedLengthList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedNumber: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedNumberList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedPreserveAspectRatio: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedRect: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedString: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedTransformList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimationElement: {
      targetElement: SKIP_OPAQUE,
      getCurrentTime: FUNCTION,
      getSimpleDuration: FUNCTION
    },
    SVGCircleElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      r: DEFAULT
    },
    SVGClipPathElement: {
      clipPathUnits: DEFAULT
    },
    SVGEllipseElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      rx: DEFAULT,
      ry: DEFAULT
    },
    SVGFilterElement: {
      filterUnits: DEFAULT,
      primitiveUnits: DEFAULT,
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      filterResX: DEFAULT,
      fitlerResY: DEFAULT
    },
    SVGForeignObjectElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGGeometryElement: {
      pathLength: DEFAULT,
      isPointInFill: FUNCTION,
      isPointInStroke: FUNCTION,
      getTotalLength: FUNCTION,
      getPointAtLength: FUNCTION
    },
    SVGGradientElement: {
      gradientUnits: DEFAULT,
      gradientTransform: DEFAULT,
      spreadMethod: DEFAULT
    },
    SVGGraphicsElement: {
      transform: DEFAULT,
      getBBox: FUNCTION,
      getCTM: FUNCTION,
      getScreenCTM: FUNCTION
    },
    SVGImageElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      preserveAspectRatio: DEFAULT,
      crossOrigin: DEFAULT
    },
    SVGLength: {
      SVG_LENGTHTYPE_UNKNOWN: DEFAULT,
      SVG_LENGTHTYPE_NUMBER: DEFAULT,
      SVG_LENGTHTYPE_PERCENTAGE: DEFAULT,
      SVG_LENGTHTYPE_EMS: DEFAULT,
      SVG_LENGTHTYPE_EXS: DEFAULT,
      SVG_LENGTHTYPE_PX: DEFAULT,
      SVG_LENGTHTYPE_CM: DEFAULT,
      SVG_LENGTHTYPE_MM: DEFAULT,
      SVG_LENGTHTYPE_IN: DEFAULT,
      SVG_LENGTHTYPE_PT: DEFAULT,
      SVG_LENGTHTYPE_PC: DEFAULT,
      unitType: DEFAULT,
      value: DEFAULT,
      valueInSpecifiedUnits: DEFAULT,
      valueAsString: DEFAULT,
      newValueSpecifiedUnits: FUNCTION,
      convertToSpecifiedUnits: FUNCTION
    },
    SVGLengthList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGLineElement: {
      x1: DEFAULT,
      x2: DEFAULT,
      y1: DEFAULT,
      y2: DEFAULT
    },
    SVGLinearGradientElement: {
      x1: DEFAULT,
      x2: DEFAULT,
      y1: DEFAULT,
      y2: DEFAULT
    },
    SVGMaskElement: {
      maskUnits: DEFAULT,
      maskContentUnits: DEFAULT,
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGNumber: {
      value: DEFAULT
    },
    SVGNumberList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGPatternElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      patternUnits: DEFAULT,
      patternContentUnits: DEFAULT,
      patternTransform: DEFAULT
    },
    SVGPreserveAspectRatio: {
      align: DEFAULT,
      meetOrSlice: DEFAULT,
      SVG_PRESERVEASPECTRATIO_UNKNOWN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_NONE: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMAX: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMAX: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMAX: DEFAULT,
      SVG_MEETORSLICE_UNKNOWN: DEFAULT,
      SVG_MEETORSLICE_MEET: DEFAULT,
      SVG_MEETORSLICE_SLICE: DEFAULT
    },
    SVGRadialGradientElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      r: DEFAULT,
      fx: DEFAULT,
      fy: DEFAULT
    },
    SVGRect: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGRectElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      rx: DEFAULT,
      ry: DEFAULT
    },
    SVGScriptElement: {
      type: DEFAULT,
      crossOrigin: DEFAULT
    },
    SVGStopElement: {
      offset: DEFAULT
    },
    SVGStringList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGStyleElement: {
      type: DEFAULT,
      media: DEFAULT,
      title: DEFAULT
    },
    SVGSVGElement: {
      animationsPaused: FUNCTION,
      checkIntersection: FUNCTION,
      checkEnclosure: FUNCTION,
      contentScriptType: DEFAULT,
      contentStyleType: DEFAULT,
      createSVGAngle: FUNCTION,
      createSVGLength: FUNCTION,
      createSVGMatrix: FUNCTION,
      createSVGNumber: FUNCTION,
      createSVGPoint: FUNCTION,
      createSVGRect: FUNCTION,
      createSVGTransform: FUNCTION,
      createSVGTransformFromMatrix: FUNCTION,
      currentScale: DEFAULT,
      currentTranslate: DEFAULT,
      currentView: DEFAULT,
      forceRedraw: FUNCTION,
      height: DEFAULT,
      pauseAnimations: FUNCTION,
      pixelUnitToMillimeterX: DEFAULT,
      pixelUnitToMillimeterY: DEFAULT,
      getCurrentTime: FUNCTION,
      getEnclosureList: FUNCTION,
      getElementById: FUNCTION,
      getIntersectionList: FUNCTION,
      screenPixelToMillimeterX: DEFAULT,
      screenPixelToMillimeterY: DEFAULT,
      setCurrentTime: FUNCTION,
      suspendRedraw: FUNCTION,
      unpauseAnimations: FUNCTION,
      unsuspendRedraw: FUNCTION,
      unsuspendRedrawAll: FUNCTION,
      useCurrentView: DEFAULT,
      viewport: DEFAULT,
      width: DEFAULT,
      x: DEFAULT,
      y: DEFAULT
    },
    SVGTextContentElement: {
      LENGTHADJUST_UNKNOWN: DEFAULT,
      LENGTHADJUST_SPACING: DEFAULT,
      LENGTHADJUST_SPACINGANDGLYPHS: DEFAULT,
      textLength: DEFAULT,
      lengthAdjust: DEFAULT,
      getNumberOfChars: FUNCTION,
      getComputedTextLength: FUNCTION,
      getSubStringLength: FUNCTION,
      getStartPositionOfChar: FUNCTION,
      getEndPositionOfChar: FUNCTION,
      getExtentOfChar: FUNCTION,
      getRotationOfChar: FUNCTION,
      getCharNumAtPosition: FUNCTION
    },
    SVGTextPositioningElement: {
      x: DEFAULT,
      y: DEFAULT,
      dx: DEFAULT,
      dy: DEFAULT,
      rotate: DEFAULT
    },
    SVGTransform: {
      SVG_TRANSFORM_UNKNOWN: DEFAULT,
      SVG_TRANSFORM_MATRIX: DEFAULT,
      SVG_TRANSFORM_TRANSLATE: DEFAULT,
      SVG_TRANSFORM_SCALE: DEFAULT,
      SVG_TRANSFORM_ROTATE: DEFAULT,
      SVG_TRANSFORM_SKEWX: DEFAULT,
      SVG_TRANSFORM_SKEWY: DEFAULT,
      type: DEFAULT,
      angle: DEFAULT,
      matrix: DEFAULT,
      setMatrix: FUNCTION,
      setTranslate: FUNCTION,
      setScale: FUNCTION,
      setRotate: FUNCTION,
      setSkewX: FUNCTION,
      setSkewY: FUNCTION
    },
    SVGTransformList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION,
      createSVGTransformFromMatrix: FUNCTION,
      consolidate: FUNCTION
    },
    SVGUseElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      instanceRoot: DEFAULT,
      animatedInstanceRoot: DEFAULT
    },
    SVGViewElement: {
      viewTarget: DEFAULT
    },
    SVGElement: {
      blur: FUNCTION,
      focus: FUNCTION,
      getBBox: FUNCTION,
      ownerSVGElement: SKIP_OPAQUE,
      onabort: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      style: DEFAULT,
      tabIndex: DEFAULT,
      viewportElement: SKIP_OPAQUE
    },
    Element: {
      animate: FUNCTION,
      attributes: DEFAULT,
      children: DEFAULT,
      classList: DEFAULT,
      className: DEFAULT,
      clientHeight: DEFAULT,
      clientLeft: DEFAULT,
      clientTop: DEFAULT,
      clientWidth: DEFAULT,
      closest: FUNCTION,
      firstElementChild: SKIP_OPAQUE,
      getAttribute: FUNCTION,
      getAttributeNS: FUNCTION,
      getAttributeNode: FUNCTION,
      getAttributeNodeNS: FUNCTION,
      getBoundingClientRect: FUNCTION,
      getClientRects: FUNCTION,
      getDestinationInsertionPoints: FUNCTION,
      getElementsByClassName: FUNCTION,
      getElementsByTagName: FUNCTION,
      getElementsByTagNameNS: FUNCTION,
      hasAttribute: FUNCTION,
      hasAttributeNS: FUNCTION,
      hasAttributes: FUNCTION,
      id: DEFAULT,
      innerHTML: DEFAULT,
      insertAdjacentElement: FUNCTION,
      insertAdjacentHTML: FUNCTION,
      insertAdjacentText: FUNCTION,
      lastElementChild: SKIP_OPAQUE,
      localName: DEFAULT,
      matches: FUNCTION,
      namespaceURI: DEFAULT,
      nextElementSibling: SKIP_OPAQUE,
      onbeforecopy: EVENT,
      onbeforecut: EVENT,
      onbeforepaste: EVENT,
      oncopy: EVENT,
      oncut: EVENT,
      onpaste: EVENT,
      onsearch: EVENT,
      onselectstart: EVENT,
      onwebkitfullscreenchange: EVENT,
      onwebkitfullscreenerror: EVENT,
      onwheel: EVENT,
      outerHTML: DEFAULT,
      prefix: DEFAULT,
      previousElementSibling: SKIP_OPAQUE,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION,
      remove: FUNCTION,
      removeAttribute: FUNCTION,
      removeAttributeNS: FUNCTION,
      removeAttributeNode: FUNCTION,
      requestPointerLock: FUNCTION,
      scrollHeight: DEFAULT,
      scrollIntoView: FUNCTION,
      scrollIntoViewIfNeeded: FUNCTION,
      scrollLeft: DEFAULT,
      scrollTop: DEFAULT,
      scrollWidth: DEFAULT,
      setAttribute: FUNCTION,
      setAttributeNS: FUNCTION,
      setAttributeNode: FUNCTION,
      setAttributeNodeNS: FUNCTION,
      tagName: DEFAULT
    },
    CharacterData: {
      after: FUNCTION,
      appendData: FUNCTION,
      before: FUNCTION,
      data: DEFAULT,
      deleteData: FUNCTION,
      insertData: FUNCTION,
      length: DEFAULT,
      nextElementSibling: SKIP_OPAQUE,
      previousElementSibling: SKIP_OPAQUE,
      remove: FUNCTION,
      replaceData: FUNCTION,
      replaceWith: FUNCTION,
      substringData: FUNCTION
    },
    Text: {
      assignedSlot: DEFAULT,
      isElementContentWhitespace: DEFAULT,
      replaceWholeText: FUNCTION,
      splitText: FUNCTION,
      wholeText: DEFAULT
    },
    Attr: {
      name: DEFAULT,
      namespaceURI: DEFAULT,
      localName: DEFAULT,
      prefix: DEFAULT,
      ownerElement: DEFAULT,
      specified: DEFAULT,
      value: DEFAULT
    },
    Node: metadata$3,
    EventTarget: metadata$4
  }
};

function cloneFiltered(el, st) {
  const root = el.cloneNode(false);
  function cloneChildren(parent, parentClone) {
    const { isAccessibleLWCNode: isAccessibleLWCNode$$1 } = lwcHelpers;
    const childNodes = parent.childNodes;
    const key = getKey(st);
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (
        hasAccess(st, child) ||
        child.nodeType === Node.TEXT_NODE ||
        isAccessibleLWCNode$$1(key, child)
      ) {
        const childClone = child.cloneNode(false);
        parentClone.appendChild(childClone);
        trust$1(st, childClone);
        cloneChildren(child, childClone);
      }
    }
  }
  cloneChildren(el, root);
  return root;
}

function runIfRunnable(st) {
  const shouldRun = st instanceof HTMLScriptElement || st instanceof SVGScriptElement;
  if (shouldRun) {
    SecureScriptElement.run(st);
    return true;
  }
  return false;
}

function trustChildNodesRecursive(node, key) {
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    setKey(child, key);
    trustChildNodesRecursive(child, key);
  }
}

function trustChildNodes(from, node) {
  const key = getKey(from);
  if (key) {
    trustChildNodesRecursive(node, key);
  }
}

const KEY_TO_PROTOTYPES = typeof Map !== 'undefined' ? new Map() : undefined;

function propertyIsSupported(target, property) {
  // If the SecureElement prototype does not have the property directly on it then this
  // is an attempt to get a property that we do not support
  return ObjectHasOwnProperty(getPrototypeOf(target), property);
}

function SecureElement(el, key) {
  let o = getFromCache(el, key);
  if (o) {
    return o;
  }

  // A secure element can have multiple forms, this block allows us to apply
  // some polymorphic behavior to SecureElement depending on the tagName
  let tagName = el.tagName && el.tagName.toUpperCase();
  switch (tagName) {
    case 'FRAME':
      throw new error('The deprecated FRAME element is not supported in LockerService!');
    default:
      break;
  }

  // SecureElement is it then!

  // Lazily create and cache tag name specific prototype
  switch (el.nodeType) {
    case Node.TEXT_NODE:
      tagName = '#text';
      break;

    case Node.DOCUMENT_FRAGMENT_NODE:
      tagName = '#fragment';
      break;

    case Node.ATTRIBUTE_NODE:
      tagName = 'Attr';
      break;

    case Node.COMMENT_NODE:
      tagName = '#comment';
      break;

    default:
      break;
  }

  // Segregate prototypes by their locker
  let prototypes = KEY_TO_PROTOTYPES.get(key);
  if (!prototypes) {
    prototypes = new Map();
    KEY_TO_PROTOTYPES.set(key, prototypes);
  }

  let prototypeInfo = prototypes.get(tagName);
  if (!prototypeInfo) {
    const basePrototype = getPrototypeOf(el);

    const expandoCapturingHandler = {
      get: function(target, property) {
        // Deyan: TODO W-4808252, is this fine? custom element
        if (property in basePrototype || property in target) {
          // if (property in basePrototype) {
          return property in target ? target[property] : undefined;
        }

        // Expando - retrieve it from a private locker scoped object
        const raw = getRef(target, key);
        const data = getData(raw, key);
        return data ? data[property] : undefined;
      },

      set: function(target, property, value) {
        // Deyan: TODO W-4808252, is this fine? custom element
        if (property in basePrototype || property in target) {
          // if (property in basePrototype) {
          if (!propertyIsSupported(target, property)) {
            warn(`SecureElement does not allow access to ${property}`);
            // setters on proxy trap must return true or throw
            return true;
          }

          target[property] = value;
          return true;
        }

        // Expando - store it from a private locker scoped object
        const raw = getRef(target, key);

        // SELECT elements allow options to be specified in array assignment style
        if (raw instanceof HTMLSelectElement && !Number.isNaN(Number(property))) {
          const rawOption = getRef(value, key);
          raw[property] = rawOption;
          return value;
        }

        let data = getData(raw, key);
        if (!data) {
          data = {};
          setData(raw, key, data);
        }

        data[property] = value;
        return true;
      },

      has: function(target, property) {
        if (property in basePrototype) {
          return true;
        }
        const raw = getRef(target, key);
        const data = getData(raw, key);
        return !!data && property in data;
      },

      deleteProperty: function(target, property) {
        const raw = getRef(target, key);
        const data = getData(raw, key);
        if (data && property in data) {
          return delete data[property];
        }
        return delete target[property];
      },

      ownKeys: function(target) {
        const raw = getRef(target, key);
        const data = getData(raw, key);
        let keys = ObjectKeys(raw);
        if (data) {
          keys = keys.concat(ObjectKeys(data));
        }
        return keys;
      },

      getOwnPropertyDescriptor: function(target, property) {
        let desc = getOwnPropertyDescriptor(target, property);
        if (!desc) {
          const raw = getRef(target, key);
          const data = getData(raw, key);
          desc = data ? getOwnPropertyDescriptor(data, property) : undefined;
        }
        return desc;
      },

      getPrototypeOf: function() {
        if (shouldFreeze && !isFrozen(basePrototype)) {
          deepFreeze(basePrototype);
        }
        return basePrototype;
      },

      setPrototypeOf: function() {
        throw new Error(`Illegal attempt to set the prototype of: ${basePrototype}`);
      }
    };

    // "class", "id", etc global attributes are special because they do not directly correspond to any property
    const caseInsensitiveAttributes = {
      class: true,
      contextmenu: true,
      dropzone: true,
      id: true,
      role: true
    };

    const prototype = (function() {
      function SecureElementPrototype() {}
      SecureElementPrototype.prototype['tagName'] = tagName;

      const sep = new SecureElementPrototype();
      sep.constructor = function() {
        throw new TypeError('Illegal constructor');
      };
      return sep;
    })();

    // Allow React to register spies on input nodes
    // See inputValueTracking.js
    // https://github.com/facebook/react/blob/master/packages/react-dom/src/client/inputValueTracking.js
    ['checked', 'value'].forEach(prop => {
      let elementProto = {};
      // TODO: W-5143278 bug on lwc, remove try catch after bug is fixed
      try {
        elementProto = el.constructor.prototype;
      } catch (e) {
        elementProto = lwcUnwrap(el).constructor.prototype;
      }
      // End TODO: W-5143278
      const descriptor = getOwnPropertyDescriptor(elementProto, prop);
      if (descriptor) {
        defineProperty(prototype.constructor.prototype, prop, {
          configurable: descriptor.configurable,
          enumerable: true,
          get: function() {
            const rawEl = getRawThis(this);
            return filterEverything(this, rawEl[prop]);
          },
          set: function(value) {
            const rawEl = getRawThis(this);
            rawEl[prop] = filterEverything(this, value);
          }
        });
      }
    });

    // Override standard methods and properties derived from Node interface
    SecureElement.addStandardNodeMethodAndPropertyOverrides(prototype);
    // Override standard methods and properties derived from Element interface
    if (el instanceof Element) {
      SecureElement.addStandardElementMethodAndPropertyOverrides(
        prototype,
        caseInsensitiveAttributes,
        key
      );
    }
    defineProperties(prototype, {
      toString: {
        value: function() {
          const e = getRawThis(this);
          return `SecureElement: ${e}{ key: ${JSON.stringify(getKey(this))} }`;
        }
      }
    });

    const prototypicalInstance = create$1(prototype);
    setRef(prototypicalInstance, el, key);

    if (tagName === 'IFRAME') {
      SecureIFrameElement.addMethodsAndProperties(prototype);
    }

    const tagNameSpecificConfig = addPrototypeMethodsAndPropertiesStateless(
      metadata$2,
      prototypicalInstance,
      prototype
    );

    // Conditionally add things that not all Node types support
    if ('attributes' in el) {
      tagNameSpecificConfig['attributes'] = createFilteredPropertyStateless(
        'attributes',
        prototype,
        {
          writable: false,
          afterGetCallback: function(attributes) {
            if (!attributes) {
              return attributes;
            }

            return createProxyForNamedNodeMap(
              attributes,
              key,
              prototype,
              caseInsensitiveAttributes
            );
          }
        }
      );
    }

    if ('innerText' in el) {
      tagNameSpecificConfig['innerText'] = {
        get: function() {
          /*
           * innerText changes it's return value based on style and whether the element is live in
           * the DOM or not. This implementation does not account for that and simply returns the
           * innerText of the cloned node. This may cause subtle differences, such as missing newlines,
           * from the original implementation.
           *
           * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Differences_from_innerText
           */
          const rawEl = getRawThis(this);
          const filtered = cloneFiltered(rawEl, o);
          const ret = filtered.innerText;
          return ret;
        },
        set: function(value) {
          const raw = getRawThis(this);
          if (isSharedElement(raw)) {
            throw new error(
              `SecureElement.innerText cannot be used with ${raw.tagName} elements!`
            );
          }

          raw.innerText = value;

          trustChildNodes(this, raw);
        }
      };
    }

    if ('innerHTML' in el) {
      tagNameSpecificConfig['innerHTML'] = {
        get: function() {
          return cloneFiltered(getRawThis(this), o).innerHTML;
        },
        set: function(value) {
          const raw = getRawThis(this);
          // Do not allow innerHTML on shared elements (body/head)
          if (isSharedElement(raw)) {
            throw new error(
              `SecureElement.innerHTML cannot be used with ${raw.tagName} elements!`
            );
          }
          raw.innerHTML = sanitizeDefault(value);
          trustChildNodes(this, raw);
        }
      };
    }

    // Reason: [W-3564204] Web Components HTML imports only supported in Chrome.
    // TODO: Implement SecureLinkElement when it is more standardized across browsers.
    if (tagName === 'LINK' && 'rel' in el) {
      tagNameSpecificConfig['rel'] = {
        get: function() {
          const raw = getRawThis(this);
          return raw.rel;
        },
        set: function(value) {
          value = String(value);
          if (REGEX_CONTAINS_IMPORT.test(value)) {
            warn(
              "SecureLinkElement does not allow setting 'rel' property to 'import' value."
            );
          } else {
            const raw = getRawThis(this);
            raw.rel = value;
          }
        }
      };
    }

    // special handling for Text.splitText() instead of creating a new secure wrapper
    if (tagName === '#text' && 'splitText' in el) {
      tagNameSpecificConfig['splitText'] = {
        value: function(index) {
          const raw = getRawThis(this);
          const newNode = raw.splitText(index);

          const fromKey = getKey(raw);
          if (fromKey) {
            setKey(newNode, fromKey);
          }

          return SecureElement(newNode, getKey(this));
        }
      };
    }
    if ('outerHTML' in el) {
      tagNameSpecificConfig['outerHTML'] = {
        get: function() {
          return cloneFiltered(getRawThis(this), o).outerHTML;
        },
        set: function(value) {
          const raw = getRawThis(this);
          // Do not allow on shared elements (body/head)
          if (isSharedElement(raw)) {
            throw new error(
              `SecureElement.outerHTML cannot be used with ${raw.tagName} elements!`
            );
          }

          const parent = raw.parentElement;

          // As per specifications, throw when there is no parent
          if (!parent) {
            throw new DOMException(
              `Failed to set the 'outerHTML' property on ${
                raw.tagName
              }: This element has no parent node.`
            );
          }

          // Setting outerHTML on an element removes it from the document tree.
          // It returns no handle to trust the new elements. Here we create the
          // elements in a fragment then insert them in their proper location.
          const template = document.createElement('template');
          template.innerHTML = sanitizeDefault(value);
          const content = template.content;
          trustChildNodes(this, content);
          while (content.childNodes.length > 0) {
            const node = content.childNodes[0];
            parent.insertBefore(node, raw);
          }
          parent.removeChild(raw);
        }
      };
    }

    // special handling for Text.splitText() instead of creating a new secure wrapper
    if (tagName === '#text' && 'splitText' in el) {
      tagNameSpecificConfig['splitText'] = {
        value: function(index) {
          const raw = getRawThis(this);
          const newNode = raw.splitText(index);

          const fromKey = getKey(raw);
          if (fromKey) {
            setKey(newNode, fromKey);
          }

          return SecureElement(newNode, getKey(this));
        }
      };
    }

    // special handle insertRow since it may automatically also insert a <tbody> element that
    // also needs to be keyed.
    if ('insertRow' in el && el instanceof HTMLTableElement) {
      tagNameSpecificConfig['insertRow'] = {
        value: function(index) {
          function getFirstTBody(table) {
            for (let i = 0; i < table.childNodes.length; i++) {
              const node = table.childNodes[i];
              if (node instanceof HTMLTableSectionElement) {
                return node;
              }
            }
            return undefined;
          }

          const raw = getRawThis(this);
          const tbodyExists = !!getFirstTBody(raw);
          const newRow = raw.insertRow(index);
          trust$1(this, newRow);
          if (!tbodyExists) {
            // a new tbody element has also been inserted, key that too.
            const tbody = getFirstTBody(raw);
            trust$1(this, tbody);
          }
          return SecureElement(newRow, getKey(this));
        }
      };
    }

    createEventTargetMethodsStateless(tagNameSpecificConfig, prototype);

    if (tagName === 'SCRIPT') {
      SecureScriptElement.setOverrides(tagNameSpecificConfig, prototype);
    }

    // Custom Element with properties
    if (isCustomElement(el) && customElementHook$$1) {
      customElementHook$$1(el, prototype, tagNameSpecificConfig);
    }

    defineProperties(prototype, tagNameSpecificConfig);

    // Build case insensitive index for attribute validation
    ObjectKeys(prototype).forEach(k => {
      const lower = k.toLowerCase();
      if (lower !== k) {
        caseInsensitiveAttributes[lower] = true;
      }
    });

    prototypeInfo = {
      prototype: prototype,
      expandoCapturingHandler: expandoCapturingHandler
    };

    prototypes.set(tagName, prototypeInfo);
  }

  /*
   * Additional checks for <object> and <embed> tag, restrict access to browser navigation and
   * browser interaction APIs
   * https://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS1EFE2EDA-026D-4d14-864E-79DFD56F87C6.html#WS5b3ccc516d4fbf351e63e3d118a9b90204-7c5b
   */
  if (tagName === 'OBJECT' || tagName === 'EMBED') {
    el.setAttribute('allowNetworking', 'none');
  }

  o = create$1(prototypeInfo.prototype);

  if (prototypeInfo.expandoCapturingHandler) {
    setRef(o, el, key);
    o = new Proxy(o, prototypeInfo.expandoCapturingHandler);
  }

  setRef(o, el, key);
  addToCache(el, o, key);
  registerProxy(o);
  // Mark the proxy to be unwrapped by custom formatter
  assert$1.block(() => {
    addProxy(o, el);
  });
  return o;
}

SecureElement.addStandardNodeMethodAndPropertyOverrides = function(prototype) {
  defineProperties(prototype, {
    appendChild: {
      writable: true,
      value: function(child) {
        if (!runIfRunnable(child)) {
          const e = getRawThis(this);
          e.appendChild(getRef(child, getKey(this), true));
        }

        return child;
      }
    },

    replaceChild: {
      writable: true,
      value: function(newChild, oldChild) {
        if (!runIfRunnable(newChild)) {
          const e = getRawThis(this);
          const k = getKey(this);
          e.replaceChild(getRef(newChild, k, true), getRef(oldChild, k, true));
        }

        return oldChild;
      }
    },

    insertBefore: {
      writable: true,
      value: function(newNode, referenceNode) {
        if (!runIfRunnable(newNode)) {
          const e = getRawThis(this);
          const k = getKey(this);
          e.insertBefore(
            getRef(newNode, k, true),
            referenceNode ? getRef(referenceNode, k, true) : null
          );
        }

        return newNode;
      }
    },

    removeChild: createFilteredMethodStateless('removeChild', prototype, {
      rawArguments: true,
      beforeCallback: function(child) {
        // Verify that the passed in child is not opaque!
        verifyAccess(this, child, true);
      }
    }),

    cloneNode: {
      writable: true,
      value: function(deep) {
        function copyKeys(from, to) {
          // Copy keys from the original to the cloned tree
          const fromKey = getKey(from);
          if (fromKey) {
            setKey(to, fromKey);
          }

          const toChildren = to.childNodes;
          const length = toChildren.length;
          if (length > 0) {
            const fromChildren = from.childNodes;
            for (let i = 0; i < length; i++) {
              copyKeys(fromChildren[i], toChildren[i]);
            }
          }
        }

        const e = getRawThis(this);
        const root = e.cloneNode(deep);

        // Maintain the same ownership in the cloned subtree
        copyKeys(e, root);

        return SecureElement(root, getKey(this));
      }
    },

    textContent: {
      get: function() {
        return cloneFiltered(getRawThis(this), this).textContent;
      },
      set: function(value) {
        const raw = getRawThis(this);
        if (isSharedElement(raw)) {
          throw new error(
            `SecureElement.textContent cannot be used with ${raw.tagName} elements!`
          );
        }

        raw.textContent = value;

        trustChildNodes(this, raw);
      }
    },

    hasChildNodes: {
      value: function() {
        const { isAccessibleLWCNode: isAccessibleLWCNode$$1 } = lwcHelpers;
        const raw = getRawThis(this);
        // If this is a shared element, delegate the call to the shared element, no need to check for access
        if (isSharedElement(raw)) {
          return raw.hasChildNodes();
        }
        const childNodes = raw.childNodes;
        const key = getKey(this);
        for (let i = 0; i < childNodes.length; i++) {
          if (hasAccess(this, childNodes[i]) || isAccessibleLWCNode$$1(key, childNodes[i])) {
            return true;
          }
        }
        return false;
      }
    }
  });
};

SecureElement.addStandardElementMethodAndPropertyOverrides = function(
  prototype,
  caseInsensitiveAttributes,
  key
) {
  defineProperties(prototype, {
    querySelector: {
      writable: true,
      value: function(selector) {
        const raw = getRawThis(this);
        return SecureElement.secureQuerySelector(raw, getKey(this), selector);
      }
    },

    insertAdjacentHTML: {
      writable: true,
      value: function(position, text) {
        const raw = getRawThis(this);

        // Do not allow insertAdjacentHTML on shared elements (body/head)
        if (isSharedElement(raw)) {
          throw new error(
            `SecureElement.insertAdjacentHTML cannot be used with ${raw.tagName} elements!`
          );
        }

        let parent;
        if (position === 'afterbegin' || position === 'beforeend') {
          // We have access to el, nothing else to check.
        } else if (position === 'beforebegin' || position === 'afterend') {
          // Prevent writing outside secure node.
          parent = raw.parentNode;
          verifyAccess(this, parent, true);
        } else {
          throw new error(
            "SecureElement.insertAdjacentHTML requires position 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'."
          );
        }

        raw.insertAdjacentHTML(position, sanitizeDefault(text));

        trustChildNodes(this, parent || raw);
      }
    },

    getAttribute: SecureElement.createAttributeAccessMethodConfig(
      'getAttribute',
      prototype,
      caseInsensitiveAttributes,
      null,
      undefined,
      undefined,
      key
    ),
    getAttributeNS: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNS',
      prototype,
      caseInsensitiveAttributes,
      null,
      true,
      undefined,
      key
    ),
    getAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      null,
      undefined,
      undefined,
      key
    ),
    getAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNodeNS',
      prototype,
      caseInsensitiveAttributes,
      null,
      true,
      undefined,
      key
    ),

    setAttribute: SecureElement.createAttributeAccessMethodConfig(
      'setAttribute',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      undefined,
      key
    ),
    setAttributeNS: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNS',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      true,
      undefined,
      key
    ),
    setAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      'name',
      key
    ),
    setAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNodeNS',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      true,
      'name',
      key
    ),

    removeAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'removeAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      'name',
      key
    )
  });
};

/* SecureElement.validateURLScheme = function(value) {
  const url = sanitizeURLForElement(value);

  if (!isValidURLScheme(url)) {
    throw new report.error(
      'An unsupported URL scheme was detected. Only http:// and https:// are supported.'
    );
  }

  return url;
}; */

SecureElement.createAttributeAccessMethodConfig = function(
  methodName,
  prototype,
  caseInsensitiveAttributes,
  invalidAttributeReturnValue,
  namespaced,
  nameProp,
  key
) {
  return {
    writable: true,
    value: function() {
      const raw = getRawThis(this);
      let args = ArraySlice(arguments);

      let name = args[namespaced ? 1 : 0];
      if (nameProp) {
        name = name[nameProp];
      }
      if (!isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
        warn(`${this} does not allow getting/setting the ${name} attribute, ignoring!`);
        return invalidAttributeReturnValue;
      }

      // args[0] is the attribute name. args[1] is the attribute value
      /* if (args[0] === 'href' || args[0] === 'src') {
        args[1] = SecureElement.validateURLScheme(args[1]);
      } */

      args = filterArguments(this, args, { rawArguments: true });
      const ret = raw[methodName].apply(raw, args);
      return ret instanceof Node ? SecureElement(ret, key) : ret;
    }
  };
};

SecureElement.secureQuerySelector = function(el, key, selector) {
  const rawAll = el.querySelectorAll(selector);
  const { isAccessibleLWCNode: isAccessibleLWCNode$$1 } = lwcHelpers;
  for (let n = 0; n < rawAll.length; n++) {
    const raw = rawAll[n];
    const rawKey = getKey(raw);
    if (rawKey === key || isSharedElement(raw) || isAccessibleLWCNode$$1(key, raw)) {
      return SecureElement(raw, key);
    }
  }

  return null;
};

const sanitized = new WeakSet();

function freezeIntrinsics(realmRec) {
  const { eagerFreezeIntrinsics } = realmRec;
  deepFreeze(eagerFreezeIntrinsics);
}

function freezeIntrinsicsDeprecated(realmRec) {
  const { unsafeGlobal } = realmRec;
  seal(unsafeGlobal.Object.prototype);
}

// locking down the environment
function sanitize$1(realmRec) {
  if (sanitized.has(realmRec)) {
    return;
  }

  if (realmRec.shouldFreeze) {
    // Temporary until SecureWindow is refactored
    const { prototypes: { Window } } = metadata$$1;
    const names = [];
    for (const name in Window) {
      if (Window[name] === RAW) {
        names.push(name);
      }
    }
    setUnfrozenSet(names);

    // Temporary until SecureElement is refactored
    setElementRealm(realmRec);
  } else {
    freezeIntrinsicsDeprecated(realmRec);
  }

  sanitized.add(realmRec);
}

const keyToSandbox = new Map();

function createSandbox(key, realmRec) {
  // Lazy sanitize the execution environment.
  sanitize$1(realmRec);

  const sandbox = { realmRec };

  /**
   * The sequencing of the following operations is curcial. We
   * need "Function" available on global when we create "eval"
   * in order for the constant to link to it.
   * 1. We create the global, minus "eval" and "Function".
   * 2. We create "Function" and expose it on the global.
   * 3. We create "eval" and expose it on the global.
   */
  sandbox.globalObject = SecureWindow(sandbox, key);

  sandbox.FunctionEvaluator = createFunctionEvaluator(sandbox);
  defineProperty(sandbox.globalObject, 'Function', {
    value: sandbox.FunctionEvaluator
  });

  // The "eval" property needs to be configurable to comply with the
  // Proxy invariants.
  sandbox.evalEvaluator = createEvalEvaluator(sandbox);
  defineProperty(sandbox.globalObject, 'eval', {
    value: sandbox.evalEvaluator,
    configurable: true
  });

  return freeze(sandbox);
}

function getSandbox(key, realmRec) {
  let sandbox = keyToSandbox.get(key);

  if (!sandbox) {
    sandbox = createSandbox(key, realmRec);
    keyToSandbox.set(key, sandbox);
  }

  return sandbox;
}

function installPolyfills(realmRec) {
  const { unsafeGlobal: g } = realmRec;

  // https://github.com/tc39/proposal-observable/blob/master/src/Observable.js
  if (!g.Symbol['observable']) {
    defineProperty(g.Symbol, 'observable', { value: g.Symbol('observable') });
  }
}

// TODO: This repair will make it out as its own independent shim since
// it's required for confinement but not part of the Realm specifications.

// TODO: Only apply the repair on platform where this is necessary..

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

// Prevent an adversary from using TOCTTOU (time-of-check-to-time-of-use) to
// skip some intermediate ancestors by stringify/propify the property name
// once, first.

function asPropertyName(prop) {
  if (typeof prop === 'symbol') {
    return prop;
  }
  return `${prop}`;
}

// Prevent accessing global properties by calling legacy accessors with
// thisArg == null, causing the real window object to be exposed to the
// function as thisArg when the getter is invoked.
// https://bugzilla.mozilla.org/show_bug.cgi?id=1253016

// Prevent bypassing access checks on all required objects and leak
// anything from another page.
// https://bugs.chromium.org/p/chromium/issues/detail?id=403596

function repairAccessors(realmRec) {
  const { unsafeGlobal } = realmRec;

  defineProperties(unsafeGlobal.Object.prototype, {
    __defineGetter__: {
      value: function(prop, func) {
        return defineProperty(this, prop, {
          get: func,
          enumerable: true,
          configurable: true
        });
      }
    },
    __defineSetter__: {
      value: function(prop, func) {
        return defineProperty(this, prop, {
          set: func,
          enumerable: true,
          configurable: true
        });
      }
    },
    __lookupGetter__: {
      value: function(prop) {
        prop = asPropertyName(prop);
        let base = this;
        let desc;
        while (base && !(desc = getOwnPropertyDescriptor(base, prop))) {
          base = getPrototypeOf(base);
        }
        return desc && desc.get;
      }
    },
    __lookupSetter__: {
      value: function(prop) {
        prop = asPropertyName(prop);
        let base = this;
        let desc;
        while (base && !(desc = getOwnPropertyDescriptor(base, prop))) {
          base = getPrototypeOf(base);
        }
        return desc && desc.set;
      }
    }
  });
}

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

/**
 * The process to repair constructors:
 * 1. Obtain the prototype from an instance
 * 2. Create a substitute noop constructor
 * 3. Replace its prototype property with the original prototype
 * 4. Replace its prototype property's constructor with itself
 * 5. Replace its [[Prototype]] slot with the noop constructor of Function
 */
function repairFunction(realmRec, functionName, functionDecl) {
  const { unsafeGlobal, unsafeEval, unsafeFunction } = realmRec;

  let FunctionInstance;
  try {
    FunctionInstance = unsafeEval(`(${functionDecl}(){})`);
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      // Re-throw
      throw e;
    }
    // Prevent failure on platforms where generators are not supported.
    return;
  }
  const FunctionPrototype = getPrototypeOf(FunctionInstance);

  const RealmFunction = unsafeFunction('return function(){}');

  defineProperties(RealmFunction, {
    name: {
      value: functionName
    },
    prototype: {
      value: FunctionPrototype
    }
  });
  defineProperty(FunctionPrototype, 'constructor', { value: RealmFunction });

  // Prevent loop in case of Function.
  if (RealmFunction !== unsafeGlobal.Function.prototype.constructor) {
    setPrototypeOf(RealmFunction, unsafeGlobal.Function.prototype.constructor);
  }
}

/**
 * This block replaces the original Function constructor, and the original
 * %GeneratorFunction% %AsyncFunction% and %AsyncGeneratorFunction%, with
 * safe replacements that preserve SES confinement. After this block is done,
 * the originals should no longer be reachable.
 */
function repairFunctions(realmRec) {
  // Here, the order of operation is important: Function needs to be
  // repaired first since the other constructors need it.
  repairFunction(realmRec, 'Function', 'function');
  repairFunction(realmRec, 'GeneratorFunction', 'function*');
  repairFunction(realmRec, 'AsyncFunction', 'async function');
  repairFunction(realmRec, 'AsyncGeneratorFunction', 'async function*');
}

/**
 * For a special set of properties (defined below), it ensures that the
 * effect of freezing does not suppress the ability to override these
 * properties on derived objects by simple assignment.
 *
 * Because of lack of sufficient foresight at the time, ES5 unfortunately
 * specified that a simple assignment to a non-existent property must fail if
 * it would override a non-writable data property of the same name (e.g. the
 * target object doesn't have an own-property by that name, but it inherits
 * from an object which does, and the inherited property is non-writable).
 * (In retrospect, this was a mistake, but it is now too late and we must
 * live with the consequences.) As a result, simply freezing an object to
 * make it tamper proof has the unfortunate side effect of breaking
 * previously correct code that is considered to have followed JS best
 * practices, if this previous code used assignment to override.
 *
 * For example, the following code violates no JavaScript best practice but
 * nevertheless fails without the repair:
 *
 * Object.freeze(Object.prototype);
 *
 * function Point(x, y) {
 *   this.x = x;
 *   this.y = y;
 * }
 *
 * Point.prototype.toString = function() { return `<${this.x},${this.y}>`; };
 *
 * The problem is that the override will cause the assignment to
 * Point.prototype.toString to fail because Point.prototype inherits from
 * Object.prototype, and Object.freeze made Object.prototype.toString into a
 * non-writable data property.
 *
 * Another common pattern is:
 *
 *  Object.freeze(Error.prototype);
 *  e = new Error();
 *  e.message = 'something';
 *
 * To work around this mistake, deepFreeze(), prior to freezing, replaces
 * selected configurable own data properties with accessor properties which
 * simulate what we should have specified -- that assignments to derived
 * objects succeed if otherwise possible.
 */
function beMutable(obj, prop, desc) {
  if ('value' in desc && desc.configurable) {
    const value = desc.value;

    // eslint-disable-next-line no-inner-declarations
    function getter() {
      return value;
    }

    // Re-attach the data propery value to the object tree to make
    // it discoverable by the deep-freeze traversal algorithm.
    getter.value = value;

    // eslint-disable-next-line no-inner-declarations
    function setter(newValue) {
      if (obj === this) {
        const name = obj.constructor.name;
        throw new TypeError(`Cannot assign to read only property '${prop}' of object '${name}'`);
      }
      if (ObjectHasOwnProperty(this, prop)) {
        this[prop] = newValue;
      } else {
        defineProperty(this, prop, {
          value: newValue,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }

    defineProperty(obj, prop, {
      get: getter,
      set: setter,
      enumerable: desc.enumerable,
      configurable: false
    });
  }
}

function beMutableProperties(obj) {
  if (!obj) {
    return;
  }
  const descs = getOwnPropertyDescriptors(obj);
  if (!descs) {
    return;
  }
  ownKeys(obj).forEach(prop => beMutable(obj, prop, descs[prop]));
}

function beMutableProperty(obj, prop) {
  const desc = getOwnPropertyDescriptor(obj, prop);
  beMutable(obj, prop, desc);
}

/**
 * These properties are subject to the override mistake.
 */
function repairDataProperties(realmRec) {
  const { eagerFreezeIntrinsics: i } = realmRec;

  [
    i.ObjectPrototype,
    i.ArrayPrototype,
    i.BooleanPrototype,
    i.DatePrototype,
    i.NumberPrototype,
    i.StringPrototype,

    i.FunctionPrototype,
    i.GeneratorPrototype,
    i.AsyncFunctionPrototype,
    i.AsyncGeneratorPrototype,

    i.IteratorPrototype,
    i.ArrayIteratorPrototype,

    i.PromisePrototype,
    i.DataViewPrototype,

    i.TypedArray,
    i.Int8ArrayPrototype,
    i.Int16ArrayPrototype,
    i.Int32ArrayPrototype,
    i.Uint8Array,
    i.Uint16Array,
    i.Uint32Array
  ].forEach(beMutableProperties);

  [
    i.ErrorPrototype,
    i.EvalErrorPrototype,
    i.RangeErrorPrototype,
    i.ReferenceErrorPrototype,
    i.SyntaxErrorPrototype,
    i.TypeErrorPrototype,
    i.URIErrorPrototype
  ].forEach(proto => beMutableProperty(proto, 'message'));
}

const realmRec = {};
let isInitialized = false;

function init(options) {
  if (isInitialized) {
    return;
  }

  // The frozen/unfrozen status of the Locker is set at creation.
  // Keep options.isFrozen until playground is updated.
  realmRec.shouldFreeze = options.shouldFreeze || options.isFrozen;

  /**
   * The unsafe* variables hold precious values that must not escape
   * to untrusted code. When eval is invoked via unsafeEval, this is
   * a call to the indirect eval function, not the direct eval operator.
   */
  realmRec.unsafeGlobal = options.unsafeGlobal;
  realmRec.unsafeEval = options.unsafeGlobal.eval;
  realmRec.unsafeFunction = options.unsafeGlobal.Function;

  if (realmRec.shouldFreeze) {
    realmRec.notFrozenIntrinsicNames = options.notFrozenIntrinsicNames;

    const intrinsics = getIntrinsics(realmRec);

    const eagerFreezeIntrinsics = assign({}, intrinsics);
    if (isArray(realmRec.notFrozenIntrinsicNames)) {
      realmRec.notFrozenIntrinsicNames.forEach(name => delete eagerFreezeIntrinsics[name]);
    }

    realmRec.intrinsics = intrinsics;
    realmRec.eagerFreezeIntrinsics = eagerFreezeIntrinsics;
  }

  // None of these values can change after initialization.
  freeze(realmRec);

  installPolyfills(realmRec);

  repairAccessors(realmRec);
  repairFunctions(realmRec);

  if (realmRec.shouldFreeze) {
    repairDataProperties(realmRec);
    freezeIntrinsics(realmRec);
  }

  isInitialized = true;
}

function getEnv$1(key) {
  const sandbox = getSandbox(key, realmRec);
  return sandbox.globalObject;
}

/**
 * Evaluates a string using secure eval rather than eval.
 * Sanitizes the input string and attaches a sourceURL so the
 * result can be easily found in browser debugging tools.
 */
function evaluate(src, key, sourceURL) {
  const sandbox = getSandbox(key, realmRec);

  // Sanitize the URL
  if (sourceURL) {
    sourceURL = sanitizeURLForElement(sourceURL);
    src += `\n//# sourceURL=${sourceURL}`;
  }

  try {
    return sandbox.evalEvaluator(src);
  } catch (e) {
    throw new error(e.message || 'Evaluation error', e, severity.QUIET);
  }
}

function SecureDOMEvent(event, key) {
  assert$1.invariant(event, 'Wrapping an undefined event is prohibited.');
  let o = getFromCache(event, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureDOMEvent: ${event}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  const DOMEventSecureDescriptors = {
    // Events properties that are DOM Elements were compiled from
    // https://developer.mozilla.org/en-US/docs/Web/Events
    target: createFilteredProperty(o, event, 'target', SKIP_OPAQUE_ASCENDING),
    currentTarget: createFilteredProperty(o, event, 'currentTarget'),

    initEvent: createFilteredMethod(o, event, 'initEvent'),
    // Touch Events are special on their own:
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch
    touches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'touches'),
    targetTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'targetTouches'),
    changedTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'changedTouches'),

    view: {
      get: function() {
        const key = getKey(o);
        const swin = getEnv$1(key);
        const win = getRef(swin, key);
        return win === event.view ? swin : undefined;
      }
    }
  };

  ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'].forEach(method =>
    addMethodIfSupported(o, event, method)
  );

  // non-standard properties and aliases
  ['relatedTarget', 'srcElement', 'explicitOriginalTarget', 'originalTarget'].forEach(property =>
    addPropertyIfSupported(o, event, property)
  );

  // For MessageEvent, special handling if the message is from a cross origin iframe
  if (event instanceof MessageEvent) {
    let xorigin = false;
    const eventSource = event.source;
    try {
      xorigin = !!(eventSource && eventSource.nodeType);
    } catch (e) {
      xorigin = true;
    }
    // If the MessageEvent object is from a different domain,
    // and accessing the nodeType property triggers an exception, then the source is a content window,
    // wrap the source in a SecureIFrameContentWindow
    if (xorigin) {
      defineProperty(o, 'source', {
        enumerable: true,
        value: SecureIFrameElement.SecureIFrameContentWindow(eventSource, key)
      });
    }
  }

  // re-exposing externals
  // TODO: we might need to include non-enumerables
  for (const name in event) {
    if (!(name in o)) {
      // every DOM event has a different shape, we apply filters when possible,
      // and bypass when no secure filter is found.
      defineProperty(
        o,
        name,
        DOMEventSecureDescriptors[name] || createFilteredProperty(o, event, name)
      );
    }
  }

  setRef(o, event, key);
  addToCache(event, o, key);
  registerProxy(o);

  return o;
}

SecureDOMEvent.filterTouchesDescriptor = function(se, event, propName) {
  let valueOverride;
  // descriptor to produce a new collection of touches where the target of each
  // touch is a secure element
  return {
    get: function() {
      if (valueOverride) {
        return valueOverride;
      }
      // perf hard-wired in case there is not a touches to wrap
      const touches = event[propName];
      if (!touches) {
        return touches;
      }
      // touches, of type ToucheList does not implement "map"
      return ArrayMap(touches, touch => {
        // touches is normally a big big collection of touch objects,
        // we do not want to pre-process them all, just create the getters
        // and process the accessor on the spot. e.g.:
        // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
        let keys = [];
        let touchShape = touch;
        // Walk up the prototype chain and gather all properties
        do {
          keys = keys.concat(ObjectKeys(touchShape));
        } while ((touchShape = getPrototypeOf(touchShape)) && touchShape !== Object.prototype);

        // Create a stub object with all the properties
        return keys.reduce(
          (o, p) =>
            defineProperty(o, p, {
              // all props in a touch object are readonly by spec:
              // https://developer.mozilla.org/en-US/docs/Web/API/Touch
              get: function() {
                return filterEverything(se, touch[p]);
              }
            }),
          {}
        );
      });
    },
    set: function(value) {
      valueOverride = value;
    }
  };
};

/* eslint-disable no-use-before-define */

let filterTypeHook$1;
function registerFilterTypeHook(hook) {
  filterTypeHook$1 = hook;
}
let deepUnfilteringTypeHook$1;
function registerDeepUnfilteringTypeHook(hook) {
  deepUnfilteringTypeHook$1 = hook;
}
let isUnfilteredTypeHook$1;
function registerIsUnfilteredTypeHook(hook) {
  isUnfilteredTypeHook$1 = hook;
}
const lwcHelpers = { isAccessibleLWCNode: () => false };
function registerLWCHelpers(helpers) {
  if (helpers) {
    assign(lwcHelpers, helpers);
  }
}

// TODO:W-5505278 Move add/create to LockerFactory

function filterFunction(key, raw, options) {
  const cached = getFromCache(raw, key);
  if (cached) {
    return cached;
  }

  // Handle already proxied things
  const rawKey = getKey(raw);
  const belongsToLocker = rawKey === key;
  const defaultKey$$1 = options && options.defaultKey ? options.defaultKey : defaultKey;
  // Set useNewSecureFunction to true to use the new SecureFunction Proxy instead of the legacy FilteringProxy
  const useNewSecureFunction = options && options.useNewSecureFunction;

  if (isProxy(raw)) {
    // - If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
    // otherwise just return the proxy (do not proxy a proxy).
    // - Bypass unwrapping and refiltering for SecureFunction so arguments and 'this' are filtered against the
    // Locker where the function was originally defined.
    return belongsToLocker || isSecureFunction(raw)
      ? raw
      : filter(key, getRef(raw, rawKey), options);
  }

  if (!rawKey) {
    setKey(raw, defaultKey$$1);
  }

  // wrapping functions to guarantee that they run in system mode but their
  // returned value complies with user-mode.
  const swallowed = useNewSecureFunction
    ? SecureFunction(raw, rawKey, key)
    : function SecureFunction$$1() {
        // TODO: rawKey could be undefined when SecureFunction is created.
        const rawKey = getKey(raw);
        // special unfiltering logic to unwrap Proxies passed back to origin.
        // this could potentially be folded into filterArguments with an option set if needed.
        const filteredArgs = [];
        for (let i = 0; i < arguments.length; i++) {
          let arg = arguments[i];
          if (isFilteringProxy(arg)) {
            const unfilteredProxy = getRef(arg, getKey(arg));
            const unfilteredKey = getKey(unfilteredProxy);
            arg = unfilteredKey === rawKey ? unfilteredProxy : filter(key, arg);
          } else {
            arg = filter(key, arg);
          }
          filteredArgs[i] = arg;
        }

        let self = filter(key, this);
        if (isFilteringProxy(self) && getKey(self) === key) {
          self = getRef(self, key);
        }

        const fnReturnedValue = raw.apply(self, filteredArgs);

        return filter(key, fnReturnedValue, options);
      };

  setRef(swallowed, raw, key);

  addToCache(raw, swallowed, key);
  registerProxy(swallowed);
  registerSecureFunction(swallowed);

  return swallowed;
}

function filterObject(key, raw, options) {
  const cached = getFromCache(raw, key);
  if (cached) {
    return cached;
  }

  // Handle already proxied things
  const rawKey = getKey(raw);
  const belongsToLocker = rawKey === key;
  const defaultKey$$1 = options && options.defaultKey ? options.defaultKey : defaultKey;
  // Set useNewSecureFunction to true to use the new SecureFunction Proxy instead of the legacy FilteringProxy
  const useNewSecureFunction = options && options.useNewSecureFunction;

  if (isProxy(raw)) {
    // - If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
    // otherwise just return the proxy (do not proxy a proxy).
    // - Bypass unwrapping and refiltering for SecureFunction so arguments and 'this' are filtered against the
    // Locker where the function was originally defined.
    return belongsToLocker || isSecureFunction(raw)
      ? raw
      : filter(key, getRef(raw, rawKey), options);
  }

  let swallowed;
  let mutated = false;

  if (raw === window) {
    return getEnv$1(key);
  } else if (raw === document) {
    return getEnv$1(key).document;
  } else if (raw === window.location) {
    return getEnv$1(key).location;
  }

  const isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
  if (isArray(raw)) {
    if (!belongsToLocker) {
      if (!rawKey) {
        // Array that was created in this locker or system mode but not yet keyed - key it now
        setKey(raw, defaultKey$$1);
        return filter(key, raw, options);
      }
      swallowed = createProxyForArrayObjects(raw, key);
      setRef(swallowed, raw, key);
      addToCache(raw, swallowed, key);
      mutated = true;
    }
  } else if (isNodeList) {
    swallowed = createProxyForArrayLikeObjects(raw, key);
    setRef(swallowed, raw, key);
    mutated = true;
  } else {
    assert(key, 'A secure object should always have a key.');
    if (filterTypeHook$1) {
      swallowed = filterTypeHook$1(raw, key, belongsToLocker);
    }
    if (swallowed) {
      mutated = raw !== swallowed;
    } else if (isNode(raw)) {
      if (belongsToLocker || isSharedElement(raw)) {
        return SecureElement(raw, key);
      } else if (!options) {
        return SecureObject(raw, key);
      }

      if (!rawKey) {
        setKey(raw, defaultKey$$1);
        return filter(key, raw);
      }

      addToCache(raw, options.defaultValue, key);
      return options.defaultValue;
    } else if (raw instanceof Event) {
      swallowed = SecureDOMEvent(raw, key);
      mutated = true;
    } else if (typeof raw['Window'] === 'function' && raw instanceof raw['Window']) {
      // Cross realm window instances (window.open() and iframe.contentWindow)
      swallowed = SecureIFrameElement.SecureIFrameContentWindow(raw, key);
      // TODO: Move these properties into SecureIFrameContentWindow class
      // so every instance gets the properties
      addMethodIfSupported(swallowed, raw, 'close');
      addMethodIfSupported(swallowed, raw, 'focus');
      addPropertyIfSupported(swallowed, raw, 'opener');
      addPropertyIfSupported(swallowed, raw, 'closed', { writable: false });

      mutated = true;
    } else if (raw instanceof CanvasRenderingContext2D) {
      swallowed = SecureCanvasRenderingContext2D(raw, key);
      mutated = true;
    } else if (isUnfilteredType(raw, key)) {
      // return raw for unfiltered types
      mutated = false;
    } else {
      if (!belongsToLocker) {
        if (!rawKey) {
          // Object that was created in this locker or in system mode and not yet keyed - key it now
          setKey(raw, defaultKey$$1);
          return filter(key, raw, options);
        }
        if (useNewSecureFunction) {
          swallowed = SecureFunction(raw, rawKey, key);
          setRef(swallowed, raw, key);
          addToCache(raw, swallowed, key);
        } else {
          swallowed = createFilteringProxy(raw, key);
        }
        mutated = true;
      }
    }
  }

  return mutated ? swallowed : raw;
}

/**
 * List of unfiltered objects.
 */
// TODO: W-5529670 augment the list of unfiltered types for performance.
const whitelistedObjects = [
  // Function, // unsafe
  Object,
  Array,
  Function.prototype,
  Object.prototype,
  Array.prototype
];

/**
 * @deprecated Use filter() instead.
 */
function filterEverything(st, raw, options) {
  if (raw === undefined || raw === null) {
    return raw;
  }
  // This detection of primitives is performant, even with the apparent string creation.
  // Benchmarks show that Object(raw) !== raw is 10x slower.
  switch (typeof raw) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      return raw;
    case 'function':
      if (whitelistedObjects.includes(raw)) {
        return raw;
      }
      return filterFunction(getKey(st), raw, options);
    case 'object':
      if (whitelistedObjects.includes(raw)) {
        return raw;
      }
      return filterObject(getKey(st), raw, options);
    default:
      throw new TypeError(`type not supported ${raw}`);
  }
}

/**
 * Filter the given raw object with the accessors key and provide a filtered view.
 * Best used when the type of "raw" is not known
 * @param st Represents the accessor who is trying to access "raw"
 * @param raw The raw object that we are trying to filter
 * @param options
 * @returns {*}
 */
function filter(key, raw, options) {
  if (raw === undefined || raw === null) {
    return raw;
  }
  // This detection of primitives is performant, even with the apparent string creation.
  // Benchmarks show that Object(raw) !== raw is 10x slower.
  switch (typeof raw) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      return raw;
    case 'function':
      if (whitelistedObjects.includes(raw)) {
        return raw;
      }
      return filterFunction(key, raw, options);
    case 'object':
      if (whitelistedObjects.includes(raw)) {
        return raw;
      }
      return filterObject(key, raw, options);
    default:
      throw new TypeError(`type not supported ${raw}`);
  }
}

function filterArguments(st, args, options) {
  args = ArraySlice(args);

  if (options && options.beforeCallback) {
    options.beforeCallback.apply(st, args);
  }
  if (options && options.unfilterEverything) {
    return options.unfilterEverything.call(st, args);
  }

  const rawArguments = options && options.rawArguments;
  for (let n = 0; n < args.length; n++) {
    const value = args[n];
    if (value) {
      if (rawArguments && typeof value === 'object') {
        args[n] = isArray(value) ? getRawArray(value) : getRaw$1(value);
      } else {
        args[n] = filterEverything(st, value, options);
      }
    }
  }

  return args;
}

function convertSymbol(property) {
  // Symbols have to be handled in some browsers
  if (typeof property === 'symbol') {
    if (property === Symbol['toStringTag']) {
      property = 'toString';
    } else {
      property = property.toString();
    }
  }

  return property;
}

// TODO W-5529670: expand list of safe constructors to base JS language
const whitelistedConstructors = [Object, Array];

const filteringProxyHandler = freeze({
  get(target, property) {
    const raw = getRef(target, getKey(target));
    const value = raw[property];

    if (!value) {
      return value;
    }

    if (property === 'constructor' && whitelistedConstructors.includes(value)) {
      return value;
    }

    return filterEverything(target, value);
  },

  set(target, property, value) {
    const raw = getRef(target, getKey(target));

    const filteredValue = value ? filterEverything(target, value) : value;

    raw[property] = filteredValue;

    return true;
  },

  // These are all direct pass through methods to preserve the shape etc of the delegate

  getPrototypeOf(target) {
    const raw = getRef(target, getKey(target));
    return getPrototypeOf(raw);
  },

  setPrototypeOf(target, prototype) {
    const raw = getRef(target, getKey(target));
    return setPrototypeOf(raw, prototype);
  },

  has(target, property) {
    const raw = getRef(target, getKey(target));
    return property in raw;
  },

  defineProperty(target, property, descriptor) {
    const raw = getRef(target, getKey(target));
    defineProperty(raw, property, descriptor);
    return true;
  },

  deleteProperty(target, property) {
    const raw = getRef(target, getKey(target));
    delete target[property];
    delete raw[property];
    return true;
  },

  ownKeys(target) {
    const raw = getRef(target, getKey(target));
    return ObjectKeys(raw);
  },

  getOwnPropertyDescriptor(target, property) {
    // If the property is non-writable and non-configurable, there is nothing to do.
    const targetDescriptor = getOwnPropertyDescriptor(target, property);
    if (targetDescriptor && !targetDescriptor.configurable && !targetDescriptor.writable) {
      return targetDescriptor;
    }

    // Always get the descriptor of the raw object.
    const raw = getRef(target, getKey(target));
    const rawDescriptor = getOwnPropertyDescriptor(raw, property);
    if (rawDescriptor) {
      // Always filter the descriptor value.
      if (rawDescriptor.hasOwnProperty('value')) {
        rawDescriptor.value = filterEverything(target, rawDescriptor.value);
      }

      // Always remove from the surrogate (and redefine if necessary).
      if (targetDescriptor) {
        deleteProperty(target, property);
      }

      // Use the surrogate to preserve invariants.
      // Only non-configurable properties are verified against the target.
      if (!rawDescriptor.configurable) {
        defineProperty(target, property, rawDescriptor);
      }
    } else if (targetDescriptor) {
      // Update the surrogate when the property is no longer on raw.
      deleteProperty(target, property);
    }

    return rawDescriptor;
  },

  isExtensible(target) {
    const raw = getRef(target, getKey(target));
    return isExtensible(raw);
  },

  preventExtensions(target) {
    const raw = getRef(target, getKey(target));
    return preventExtensions(raw);
  }
});

function createFilteringProxy(raw, key) {
  // Use a direct proxy on raw to a proxy on {} to avoid the Proxy invariants for non-writable, non-configurable properties
  const surrogate = create$1(getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const rawKey = getKey(raw);
  if (!rawKey) {
    // This is a newly created plain old js object - stamp it with the key
    setKey(raw, key);
  }

  const swallowed = new Proxy(surrogate, filteringProxyHandler);
  registerProxy(swallowed);

  // DCHASMAN TODO We should be able to remove this (replaced with ls.setKey()) in the next phase of proxy work where we remove unfilterEverything() as something that is done all the time
  setRef(swallowed, raw, key);

  addToCache(raw, swallowed, key);

  registerFilteringProxy(swallowed);

  return swallowed;
}

/**
 * Proxy handler for NodeList and HTMLCollection
 */
class ArrayLikeThingProxyHandler {
  constructor(target, key) {
    this.target = target;
    this.key = key;
  }
  get(shadowTarget, property) {
    const raw = this.target;
    const key = this.key;

    const filtered = ArrayLikeThingProxyHandler.getFilteredArrayLikeThings(raw, key);
    let ret;

    property = convertSymbol(property);
    if (Number.isNaN(Number(property))) {
      switch (property) {
        case 'length':
          ret = filtered.length;
          break;

        case 'item':
          ret = function(index) {
            return ArrayLikeThingProxyHandler.getFromFilteredArrayLikeThings(key, filtered, index);
          };
          break;

        case 'namedItem':
          ret = function(name) {
            const value = raw.namedItem(name);
            return value ? filter(key, value) : value;
          };
          break;

        case 'toString':
          ret = function() {
            return raw.toString();
          };
          break;

        case 'toJSON':
          ret = function() {
            return JSON.stringify(filtered);
          };
          break;
        case 'Symbol(Symbol.iterator)':
          ret = function() {
            let nextIndex = 0;
            return {
              next: function() {
                if (nextIndex < filtered.length) {
                  const value = filtered[nextIndex];
                  nextIndex++;
                  return {
                    value: value ? filter(key, value) : value,
                    done: false
                  };
                }
                return { done: true };
              }
            };
          };
          break;
        default:
          warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
          return undefined;
      }
    } else {
      return ArrayLikeThingProxyHandler.getFromFilteredArrayLikeThings(key, filtered, property);
    }
    return ret;
  }
  has(shadowTarget, property) {
    const raw = this.target;
    const filtered = this.getFilteredArrayLikeThings(raw, this.key);
    return property in filtered;
  }
  static getFromFilteredArrayLikeThings(key, filtered, index) {
    const value = filtered[index];
    return value ? filter(key, value) : value;
  }
  static getFilteredArrayLikeThings(raw, key) {
    const filtered = [];
    const { isAccessibleLWCNode } = lwcHelpers;
    for (let n = 0; n < raw.length; n++) {
      const value = raw[n];
      if (getKey(value) === key || isSharedElement(value) || isAccessibleLWCNode(key, value)) {
        filtered.push(value);
      }
    }
    return filtered;
  }
}

function createProxyForArrayLikeObjects(raw, key) {
  const surrogate = create$1(getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const proxy = new Proxy(surrogate, new ArrayLikeThingProxyHandler(raw, key));
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
}

// We cache 1 array proxy per key
const KEY_TO_ARRAY_HANLDER = typeof Map !== 'undefined' ? new Map() : undefined;

function getFilteredArray(st, raw, key) {
  const filtered = [];
  // TODO: RJ, we are missing named(non-integer) properties, changing this for loop to for..in should fix it
  for (let n = 0; n < raw.length; n++) {
    const value = raw[n];
    let validEntry = false;
    if (
      !value || // Array can contain undefined/null/false/0 such falsy values
      getKey(value) === key // Value has been keyed and belongs to this locker
    ) {
      validEntry = true;
    } else {
      const filteredValue = filterEverything(st, value, { defaultKey: key });
      if (filteredValue && !isOpaque(filteredValue)) {
        validEntry = true;
      }
    }
    if (validEntry) {
      // Store the raw index and value in an object
      filtered.push({ rawIndex: n, rawValue: value });
    }
  }

  return filtered;
}

function getArrayProxyHandler(key) {
  function getFromFiltered(so, filtered, index) {
    // Numeric indexing into array
    const value = filtered[index] ? filtered[index]['rawValue'] : filtered[index];
    return value ? filterEverything(so, value) : value;
  }
  function getFilteredValues(so, filtered) {
    // Gather values from the filtered array
    const ret = [];
    filtered.forEach(item => {
      const value = item['rawValue'];
      ret.push(value ? filterEverything(so, value) : value);
    });
    return ret;
  }
  let handler = KEY_TO_ARRAY_HANLDER.get(key);
  if (!handler) {
    handler = {
      getPrototypeOf: function(target) {
        return getPrototypeOf(target);
      },
      setPrototypeOf: function(target, newProto) {
        return setPrototypeOf(target, newProto);
      },
      isExtensible: function(target) {
        return isExtensible(target);
      },
      preventExtensions: function(target) {
        preventExtensions(target);
        return getFromCache(target, key);
      },
      getOwnPropertyDescriptor: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        if (property === 'length') {
          return getOwnPropertyDescriptor(filtered, property);
        }
        if (property in filtered) {
          return getOwnPropertyDescriptor(raw, filtered[property]['rawIndex']);
        }
        return undefined;
      },
      defineProperty: function(target, property, descriptor) {
        const raw = target;
        defineProperty(raw, property, descriptor);
        return true;
      },
      get: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        let ret;

        if (property === 'constructor' && whitelistedConstructors.includes(raw[property])) {
          return raw[property];
        }

        property = convertSymbol(property);
        const coercedProperty = Number(property);
        // If the property is 0 or a positive integer
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          ret = getFromFiltered(handler, filtered, property);
        } else {
          switch (property) {
            case 'length':
              ret = filtered.length;
              break;
            case 'pop':
              ret = function() {
                if (filtered.length > 0) {
                  // Get the filtered value by index to return
                  const itemValue = getFromFiltered(handler, filtered, filtered.length - 1);
                  // Get raw index and update the raw array
                  const itemToRemove = filtered.pop();
                  raw.splice(itemToRemove['rawIndex'], 1);
                  return itemValue;
                }
                return undefined;
              };
              break;
            case 'push':
              ret = function() {
                if (arguments.length === 0) {
                  return filtered.length;
                }
                for (let i = 0; i < arguments.length; i++) {
                  raw.push(filterEverything(handler, arguments[i]));
                }
                return filtered.length + arguments.length;
              };
              break;
            case 'reverse':
              ret = function() {
                raw.reverse();
                return getFromCache(raw, key);
              };
              break;
            case 'shift':
              ret = function() {
                if (filtered.length > 0) {
                  // Get the filtered value by index to return
                  const itemValue = getFromFiltered(handler, filtered, 0);
                  // Get raw index and update the raw array
                  const itemToRemove = filtered.shift();
                  raw.splice(itemToRemove['rawIndex'], 1);
                  return itemValue;
                }
                return undefined;
              };
              break;
            case 'sort':
              ret = function(compareFunction) {
                if (arguments.length > 0) {
                  raw.sort(filterEverything(handler, compareFunction));
                } else {
                  raw.sort();
                }
                return getFromCache(raw, key);
              };
              break;
            case 'splice':
              ret = function(start, deleteCount) {
                let positionToInsert = raw.length; // By default insert at the end of raw
                const itemsToRemove = filtered.splice(start, deleteCount);
                // If there are items to remove
                if (itemsToRemove.length > 0) {
                  // Get position to insert the new items if there are any
                  positionToInsert = itemsToRemove[0]['rawIndex'];
                  // Remove from raw
                  for (let i = 0; i < itemsToRemove.length; i++) {
                    const itemToRemove = itemsToRemove[i];
                    // Remove from raw
                    raw.splice(itemToRemove['rawIndex'] - i, 1); // Since we are removing elements from raw, account for index adjustment
                  }
                } else {
                  // Not deleting anything but inserting
                  if (start >= 0 && start < filtered.length) {
                    positionToInsert = filtered[start]['rawIndex'];
                  } else if (start >= filtered.length) {
                    // If position is bigger than filtered's last index, insert at end of raw
                    positionToInsert = raw.length;
                  } else {
                    // If start is a negative
                    // If trying to insert at the beginning of filtered array
                    if (filtered.length + start <= 0) {
                      positionToInsert = filtered.length > 0 ? filtered[0]['rawIndex'] : raw.length;
                    } else {
                      // Else inserting in the middle of filtered array, get index of element in raw array
                      positionToInsert = filtered[filtered.length + start]['rawIndex'];
                    }
                  }
                }
                // If there are items to be inserted
                const newItems = [];
                if (arguments.length > 2) {
                  for (let j = 2; j < arguments.length; j++) {
                    newItems.push(filterEverything(handler, arguments[j]));
                  }
                }
                if (newItems.length > 0) {
                  raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
                }
                return getFilteredValues(handler, itemsToRemove);
              };
              break;
            case 'unshift':
              ret = function() {
                if (arguments.length === 0) {
                  return filtered.length;
                }
                const newItems = [];
                for (let i = 0; i < arguments.length; i++) {
                  newItems.push(filterEverything(handler, arguments[i]));
                }
                raw.splice.apply(raw, [0, 0].concat(newItems));
                return filtered.length + newItems.length;
              };
              break;
            case 'concat':
            case 'indexOf':
            case 'join':
            case 'lastIndexOf':
            case 'slice':
              ret = function() {
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues[property].apply(filteredValues, arguments);
              };
              break;
            // For the iteration handlers, secure the callback function and invoke the method on filtered array
            case 'every':
            case 'filter':
            case 'forEach':
            case 'map':
            case 'reduce':
            case 'reduceRight':
            case 'some':
              ret = function() {
                if (arguments.length > 0) {
                  const secureCallback = filterEverything(handler, arguments[0]);
                  arguments[0] = secureCallback;
                }
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues[property].apply(filteredValues, arguments);
              };
              break;
            case 'toString':
              ret = function() {
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues.toString();
              };
              break;
            case 'Symbol(Symbol.iterator)':
              ret = function() {
                let nextIndex = 0;
                return {
                  next: function() {
                    if (nextIndex < filtered.length) {
                      const value = filtered[nextIndex]['rawValue'];
                      nextIndex++;
                      return {
                        value: value ? filterEverything(handler, value) : value,
                        done: false
                      };
                    }
                    return { done: true };
                  }
                };
              };
              break;
            case 'Symbol(Symbol.isConcatSpreadable)':
              ret = raw[Symbol.isConcatSpreadable];
              break;
            default:
              if (raw[property]) {
                // If trying to use array like an associative array
                ret = filterEverything(handler, raw[property]);
              } else {
                warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
                return undefined;
              }
          }
        }
        return ret;
      },
      set: function(target, property, value) {
        const raw = target;
        // Setting numerical indexes, number has to be positive integer, else its treated as an associative array key
        const coercedProperty = Number(property);
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          // Refilter raw to recreate the index mapping between raw and filtered value
          const filtered = getFilteredArray(handler, raw, key);
          // If we are replacing existing index
          if (filtered[property]) {
            raw[filtered[property]['rawIndex']] = filterEverything(handler, value);
            return true;
          }
          // Adding values at a random numerical index greater than length
          const filteredLength = filtered.length;
          const newItems = [];
          for (let i = 0; i < property - filtered.length; i++) {
            newItems.push(undefined);
          }
          newItems.push(value);
          // Find the position in raw where we have to insert the new items
          // If filtered is empty, insert at beginning of raw
          // else, find the rawIndex of last filtered element and insert one after
          const positionToInsert = filteredLength
            ? filtered[filteredLength - 1]['rawIndex'] + 1
            : 0;
          raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
          return true;
        }
        // Trying to use it like an associative array
        raw[property] = filterEverything(handler, value);
        return true;
      },
      has: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        return property in filtered;
      },
      ownKeys: function(target) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        return getOwnPropertyNames(filtered);
      },
      deleteProperty: function(target, property) {
        const raw = target;
        const coercedProperty = Number(property);
        // If property is a numerical index(0 or positive integer)
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          const filtered = getFilteredArray(handler, raw, key);
          if (filtered[property]) {
            delete raw[filtered[property]['rawIndex']];
          }
        } else {
          const value = raw[property];
          // If value was set by using the array like an associative array
          if (value) {
            // Check if we have access
            const rawValue = getRef(value, key);
            if (rawValue) {
              delete raw[property];
            }
          }
        }
        return true;
      }
      // Not handling "apply" and "construct" trap and letting the underlying raw handle apply and throw the error
    };

    setKey(handler, key);

    KEY_TO_ARRAY_HANLDER.set(key, handler);

    freeze(handler);
  }

  return handler;
}

function createProxyForArrayObjects(raw, key) {
  if (!isArray(raw)) {
    warn('Illegal usage of createProxyForArrayObjects');
    return createFilteringProxy(raw, key);
  }
  // Not using a surrogate for array Proxy because we want to support for..in style of looping on arrays
  // Having a fake surrogate does not allow for correct looping. Mitigating this risk by handling all traps for Proxy.
  const proxy = new Proxy(raw, getArrayProxyHandler(key));
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
}

const KEY_TO_NAMED_NODE_MAP_HANLDER = typeof Map !== 'undefined' ? new Map() : undefined;

function getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes) {
  const filtered = {};

  for (let n = 0, i = 0; n < raw.length; n++) {
    const value = raw[n];
    if (isValidAttributeName(raw, value.name, prototype, caseInsensitiveAttributes)) {
      filtered[i++] = value;
    }
  }

  return filtered;
}

function getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes) {
  function getFromFiltered(so, filtered, index) {
    const value = filtered[index];
    return value ? filterEverything(so, value, { defaultKey: key }) : value;
  }

  let handler = KEY_TO_NAMED_NODE_MAP_HANLDER.get(key);
  if (!handler) {
    handler = {
      get: function(target, property) {
        const raw = getRef(target, key);

        const filtered = getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes);
        let ret;

        property = convertSymbol(property);
        if (Number.isNaN(Number(property))) {
          switch (property) {
            case 'length':
              ret = ObjectKeys(filtered).length;
              break;
            case 'item':
              ret = function(index) {
                return getFromFiltered(handler, filtered, index);
              };
              break;
            case 'getNamedItem':
              ret = function(name) {
                for (const val in filtered) {
                  if (name === filtered[val].name) {
                    return filterEverything(handler, filtered[val], {
                      defaultKey: key
                    });
                  }
                }
                return null;
              };
              break;
            case 'setNamedItem':
              ret = function(attribute) {
                if (
                  !isValidAttributeName(raw, attribute.name, prototype, caseInsensitiveAttributes)
                ) {
                  warn(
                    `${this} does not allow getting/setting the ${attribute.name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                // it may not be possible to get here from another Locker so the access check may be unnecessary
                // keep to error on the safe side
                verifyAccess(attribute, target);
                if (isProxy(attribute)) {
                  attribute = getRef(attribute, key);
                }
                return filterEverything(handler, raw['setNamedItem'](attribute), {
                  defaultKey: key
                });
              };
              break;
            case 'removeNamedItem':
              ret = function(name) {
                if (!isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                  warn(
                    `${this} does not allow removing the ${name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                return filterEverything(handler, raw['removeNamedItem'](name), {
                  defaultKey: key
                });
              };
              break;
            case 'getNamedItemNS':
              ret = function(namespace, localName) {
                for (const val in filtered) {
                  if (
                    namespace === filtered[val].namespaceURI &&
                    localName === filtered[val].localName
                  ) {
                    return filterEverything(handler, filtered[val], {
                      defaultKey: key
                    });
                  }
                }
                return null;
              };
              break;
            case 'setNamedItemNS':
              ret = function(attribute) {
                if (
                  !isValidAttributeName(raw, attribute.name, prototype, caseInsensitiveAttributes)
                ) {
                  warn(
                    `${this} does not allow getting/setting the ${attribute.name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                verifyAccess(attribute, target);
                if (isProxy(attribute)) {
                  attribute = getRef(attribute, key);
                }
                return filterEverything(handler, raw['setNamedItemNS'](attribute), {
                  defaultKey: key
                });
              };
              break;
            case 'removeNamedItemNS':
              ret = function(namespace, localName) {
                if (!isValidAttributeName(raw, localName, prototype, caseInsensitiveAttributes)) {
                  warn(
                    `${this} does not allow removing the ${localName.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                return filterEverything(handler, raw['removeNamedItemNS'](namespace, localName), {
                  defaultKey: key
                });
              };
              break;
            case 'toString':
              ret = function() {
                return raw.toString();
              };
              break;

            case 'toJSON':
              ret = function() {
                return JSON.stringify(filtered);
              };
              break;
            case 'Symbol(Symbol.iterator)':
              ret = function() {
                let nextIndex = 0;
                return {
                  next: function() {
                    if (nextIndex < filtered.length) {
                      const value = filtered[nextIndex];
                      nextIndex++;
                      return {
                        value: value ? filterEverything(handler, value) : value,
                        done: false
                      };
                    }
                    return { done: true };
                  }
                };
              };
              break;
            default:
              warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
              return undefined;
          }
        } else {
          ret = getFromFiltered(handler, filtered, property);
        }

        return ret;
      },
      has: function(target, property) {
        const raw = getRef(target, key);
        const filtered = getFilteredNamedNodeMap(
          handler,
          raw,
          key,
          prototype,
          caseInsensitiveAttributes
        );
        return property in filtered;
      }
    };

    setKey(handler, key);

    KEY_TO_NAMED_NODE_MAP_HANLDER.set(key, handler);

    freeze(handler);
  }

  return handler;
}

function createProxyForNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes) {
  const surrogate = create$1(getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const proxy = new Proxy(
    surrogate,
    getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes)
  );
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
}

function createFilteredConstructor(st, raw, propName, factory, key, options) {
  if (!factory || !key) {
    warn('No Factory or key provided.');
    return undefined;
  }

  if (!(propName in raw)) {
    if (options && options.ignoreNonexisting) {
      return undefined;
    }
    throw new error(
      `Underlying raw object ${raw} does not support constructor: ${propName}`
    );
  }

  return {
    enumerable: true,
    writable: true,
    value: factory(raw[propName], key)
  };
}

function createFilteredMethod(st, raw, methodName, options) {
  // Do not expose properties that the raw object does not actually support
  if (!(methodName in raw)) {
    if (options && options.ignoreNonexisting) {
      return undefined;
    }
    throw new error(`Underlying raw object ${raw} does not support method: ${methodName}`);
  }

  return {
    enumerable: true,
    writable: true,
    value: function() {
      const filteredArgs = filterArguments(st, arguments, options);
      let fnReturnedValue = raw[methodName](...filteredArgs);

      if (options && options.afterCallback) {
        fnReturnedValue = options.afterCallback(fnReturnedValue);
      }

      return filterEverything(st, fnReturnedValue, options);
    }
  };
}

function createFilteredMethodStateless(methodName, prototype, options) {
  if (!prototype) {
    throw new Error('createFilteredMethodStateless() called without prototype');
  }

  return {
    enumerable: true,
    writable: true,
    value: function() {
      const st = this;
      const raw = getRawThis(st);

      const filteredArgs = filterArguments(st, arguments, options);
      let fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

      if (options) {
        if (options.afterCallback) {
          fnReturnedValue = options.afterCallback.call(st, fnReturnedValue);
        }

        if (options.trustReturnValue) {
          trust$1(st, fnReturnedValue);
        }
      }

      return filterEverything(st, fnReturnedValue, options);
    }
  };
}

function createFilteredProperty(st, raw, propertyName, options) {
  // Do not expose properties that the raw object does not actually support.
  if (!(propertyName in raw)) {
    if (options && options.ignoreNonexisting) {
      return undefined;
    }
    throw new error(
      `Underlying raw object ${raw} does not support property: ${propertyName}`
    );
  }

  const descriptor = {
    enumerable: true
  };

  descriptor.get = function() {
    const { isAccessibleLWCNode } = lwcHelpers;
    let value = raw[propertyName];

    // Continue from the current object until we find an accessible object.
    if (options && options.skipOpaque === true) {
      // skipping opaque elements and traversing up the dom tree, eg: event.target
      const accesorProperty = options.propertyName || propertyName;
      const key = getKey(st);
      while (value) {
        const hasAccess$$1 = hasAccess(st, value);
        if (hasAccess$$1 || isSharedElement(value) || isAccessibleLWCNode(key, value)) {
          break;
        }
        value = value[accesorProperty];
      }
    }

    if (options && options.afterGetCallback) {
      // The caller wants to handle the property value
      return options.afterGetCallback(value);
    }
    return filterEverything(st, value, options);
  };

  if (!options || options.writable !== false) {
    descriptor.set = function(value) {
      if (options && options.beforeSetCallback) {
        value = options.beforeSetCallback(value);
      }

      raw[propertyName] = filterEverything(st, value);

      if (options && options.afterSetCallback) {
        options.afterSetCallback();
      }
    };
  }

  return descriptor;
}

function createFilteredPropertyStateless(propertyName, prototype, options) {
  if (!prototype) {
    throw new Error('createFilteredPropertyStateless() called without prototype');
  }

  const descriptor = {
    enumerable: true
  };

  descriptor.get = function() {
    const st = this;
    const raw = getRawThis(st);
    const { isAccessibleLWCNode } = lwcHelpers;
    const key = getKey(st);
    let value = raw[propertyName];

    // Continue from the current object until we find an acessible object.
    if (options && options.skipOpaque === true) {
      while (value) {
        const hasAccess$$1 = hasAccess(st, value);
        if (
          hasAccess$$1 ||
          value === document.body ||
          value === document.head ||
          value === document.documentElement ||
          value === document ||
          isAccessibleLWCNode(key, value)
        ) {
          break;
        }
        value = value[propertyName];
      }
    }

    if (options && options.afterGetCallback) {
      // The caller wants to handle the property value
      return options.afterGetCallback.call(st, value);
    }
    return filterEverything(st, value, options);
  };

  if (!options || options.writable !== false) {
    descriptor.set = function(value) {
      const st = this;
      const key = getKey(st);
      const raw = getRef(st, key);

      if (options && options.beforeSetCallback) {
        value = options.beforeSetCallback.call(st, value);
      }

      raw[propertyName] = filterEverything(st, value);

      if (options && options.afterSetCallback) {
        options.afterSetCallback.call(st);
      }
    };
  }

  return descriptor;
}

function addIfSupported(behavior, st, element, name, options) {
  options = options || {};
  options.ignoreNonexisting = true;

  const prop = behavior(st, element, name, options);
  if (prop) {
    defineProperty(st, name, prop);
  }
}

function addPropertyIfSupported(st, raw, name, options) {
  addIfSupported(createFilteredProperty, st, raw, name, options);
}

function addMethodIfSupported(st, raw, name, options) {
  addIfSupported(createFilteredMethod, st, raw, name, options);
}

// Return the set of interfaces supported by the object in order of most specific to least specific
function getSupportedInterfaces(o) {
  const interfaces = [];
  if (o instanceof Window) {
    interfaces.push('Window', 'EventTarget');
  } else if (o instanceof Document) {
    if (o instanceof HTMLDocument) {
      interfaces.push('HTMLDocument');
    }
    interfaces.push('Document', 'Node', 'EventTarget');
  } else if (o instanceof DocumentFragment) {
    interfaces.push('Node', 'EventTarget', 'DocumentFragment');
  } else if (o instanceof Element) {
    if (o instanceof HTMLElement) {
      // Look for all HTMLElement subtypes
      if (o instanceof HTMLAnchorElement) {
        interfaces.push('HTMLAnchorElement');
      } else if (o instanceof HTMLAreaElement) {
        interfaces.push('HTMLAreaElement');
      } else if (o instanceof HTMLMediaElement) {
        if (o instanceof HTMLAudioElement) {
          interfaces.push('HTMLAudioElement');
        } else if (o instanceof HTMLVideoElement) {
          interfaces.push('HTMLVideoElement');
        }
        interfaces.push('HTMLMediaElement');
      } else if (o instanceof HTMLBaseElement) {
        interfaces.push('HTMLBaseElement');
      } else if (o instanceof HTMLButtonElement) {
        interfaces.push('HTMLButtonElement');
      } else if (o instanceof HTMLCanvasElement) {
        interfaces.push('HTMLCanvasElement');
      } else if (o instanceof HTMLTableColElement) {
        interfaces.push('HTMLTableColElement');
      } else if (o instanceof HTMLTableRowElement) {
        interfaces.push('HTMLTableRowElement');
      } else if (o instanceof HTMLModElement) {
        interfaces.push('HTMLModElement');
      } else if (typeof HTMLDetailsElement !== 'undefined' && o instanceof HTMLDetailsElement) {
        interfaces.push('HTMLDetailsElement');
      } else if (o instanceof HTMLEmbedElement) {
        interfaces.push('HTMLEmbedElement');
      } else if (o instanceof HTMLFieldSetElement) {
        interfaces.push('HTMLFieldSetElement');
      } else if (o instanceof HTMLFormElement) {
        interfaces.push('HTMLFormElement');
      } else if (o instanceof HTMLIFrameElement) {
        interfaces.push('HTMLIFrameElement');
      } else if (o instanceof HTMLImageElement) {
        interfaces.push('HTMLImageElement');
      } else if (o instanceof HTMLInputElement) {
        interfaces.push('HTMLInputElement');
      } else if (o instanceof HTMLLabelElement) {
        interfaces.push('HTMLLabelElement');
      } else if (o instanceof HTMLLIElement) {
        interfaces.push('HTMLLIElement');
      } else if (o instanceof HTMLLinkElement) {
        interfaces.push('HTMLLinkElement');
      } else if (o instanceof HTMLMapElement) {
        interfaces.push('HTMLMapElement');
      } else if (o instanceof HTMLMetaElement) {
        interfaces.push('HTMLMetaElement');
      } else if (typeof HTMLMeterElement !== 'undefined' && o instanceof HTMLMeterElement) {
        interfaces.push('HTMLMeterElement');
      } else if (o instanceof HTMLObjectElement) {
        interfaces.push('HTMLObjectElement');
      } else if (o instanceof HTMLOListElement) {
        interfaces.push('HTMLOListElement');
      } else if (o instanceof HTMLOptGroupElement) {
        interfaces.push('HTMLOptGroupElement');
      } else if (o instanceof HTMLOptionElement) {
        interfaces.push('HTMLOptionElement');
      } else if (typeof HTMLOutputElement !== 'undefined' && o instanceof HTMLOutputElement) {
        interfaces.push('HTMLOutputElement');
      } else if (o instanceof HTMLParamElement) {
        interfaces.push('HTMLParamElement');
      } else if (o instanceof HTMLProgressElement) {
        interfaces.push('HTMLProgressElement');
      } else if (o instanceof HTMLQuoteElement) {
        interfaces.push('HTMLQuoteElement');
      } else if (o instanceof HTMLScriptElement) {
        interfaces.push('HTMLScriptElement');
      } else if (o instanceof HTMLSelectElement) {
        interfaces.push('HTMLSelectElement');
      } else if (typeof HTMLSlotElement !== 'undefined' && o instanceof HTMLSlotElement) {
        interfaces.push('HTMLSlotElement');
      } else if (o instanceof HTMLSourceElement) {
        interfaces.push('HTMLSourceElement');
      } else if (o instanceof HTMLTableCellElement) {
        interfaces.push('HTMLTableCellElement');
      } else if (o instanceof HTMLTableElement) {
        interfaces.push('HTMLTableElement');
      } else if (typeof HTMLTemplateElement !== 'undefined' && o instanceof HTMLTemplateElement) {
        interfaces.push('HTMLTemplateElement');
      } else if (o instanceof HTMLTextAreaElement) {
        interfaces.push('HTMLTextAreaElement');
      } else if (o instanceof HTMLTrackElement) {
        interfaces.push('HTMLTrackElement');
      }

      if (o instanceof HTMLTableSectionElement) {
        interfaces.push('HTMLTableSectionElement');
      }

      interfaces.push('HTMLElement');
    } else if (o instanceof SVGElement) {
      if (o instanceof SVGSVGElement) {
        interfaces.push('SVGSVGElement');
      } else if (o instanceof SVGAngle) {
        interfaces.push('SVGAngle');
      } else if (o instanceof SVGCircleElement) {
        interfaces.push('SVGCircleElement');
      } else if (o instanceof SVGClipPathElement) {
        interfaces.push('SVGClipPathElement');
      } else if (o instanceof SVGDefsElement) {
        interfaces.push('SVGGraphicsElement');
      } else if (o instanceof SVGEllipseElement) {
        interfaces.push('SVGEllipseElement');
      } else if (o instanceof SVGFilterElement) {
        interfaces.push('SVGFilterElement');
      } else if (o instanceof SVGForeignObjectElement) {
        interfaces.push('SVGForeignObjectElement');
      } else if (o instanceof SVGImageElement) {
        interfaces.push('SVGImageElement');
      } else if (o instanceof SVGLength) {
        interfaces.push('SVGLength');
      } else if (o instanceof SVGLengthList) {
        interfaces.push('SVGLengthList');
      } else if (o instanceof SVGLineElement) {
        interfaces.push('SVGLineElement');
      } else if (o instanceof SVGLinearGradientElement) {
        interfaces.push('SVGLinearGradientElement');
      } else if (o instanceof SVGMaskElement) {
        interfaces.push('SVGMaskElement');
      } else if (o instanceof SVGNumber) {
        interfaces.push('SVGNumber');
      } else if (o instanceof SVGNumberList) {
        interfaces.push('SVGNumberList');
      } else if (o instanceof SVGPatternElement) {
        interfaces.push('SVGPatternElement');
      } else if (o instanceof SVGPreserveAspectRatio) {
        interfaces.push('SVGPreserveAspectRatio');
      } else if (o instanceof SVGRadialGradientElement) {
        interfaces.push('SVGRadialGradientElement');
      } else if (o instanceof SVGRect) {
        interfaces.push('SVGRect');
      } else if (o instanceof SVGRectElement) {
        interfaces.push('SVGRectElement');
      } else if (o instanceof SVGScriptElement) {
        interfaces.push('SVGScriptElement');
      } else if (o instanceof SVGStopElement) {
        interfaces.push('SVGStopElement');
      } else if (o instanceof SVGStringList) {
        interfaces.push('SVGStringList');
      } else if (o instanceof SVGStyleElement) {
        interfaces.push('SVGStyleElement');
      } else if (o instanceof SVGTransform) {
        interfaces.push('SVGTransform');
      } else if (o instanceof SVGTransformList) {
        interfaces.push('SVGTransformList');
      } else if (o instanceof SVGUseElement) {
        interfaces.push('SVGUseElement');
      } else if (o instanceof SVGViewElement) {
        interfaces.push('SVGViewElement');
      } else if (o instanceof SVGAnimatedAngle) {
        interfaces.push('SVGAnimatedAngle');
      } else if (o instanceof SVGAnimatedBoolean) {
        interfaces.push('SVGAnimatedBoolean');
      } else if (o instanceof SVGAnimatedEnumeration) {
        interfaces.push('SVGAnimatedEnumeration');
      } else if (o instanceof SVGAnimatedInteger) {
        interfaces.push('SVGAnimatedInteger');
      } else if (o instanceof SVGAnimatedLength) {
        interfaces.push('SVGAnimatedLength');
      } else if (o instanceof SVGAnimatedLengthList) {
        interfaces.push('SVGAnimatedLengthList');
      } else if (o instanceof SVGAnimatedNumber) {
        interfaces.push('SVGAnimatedNumber');
      } else if (o instanceof SVGAnimatedNumberList) {
        interfaces.push('SVGAnimatedNumberList');
      } else if (o instanceof SVGAnimatedPreserveAspectRatio) {
        interfaces.push('SVGAnimatedPreserveAspectRatio');
      } else if (o instanceof SVGAnimatedRect) {
        interfaces.push('SVGAnimatedRect');
      } else if (o instanceof SVGAnimatedString) {
        interfaces.push('SVGAnimatedString');
      } else if (o instanceof SVGAnimatedTransformList) {
        interfaces.push('SVGAnimatedTransformList');
      }

      // below may be implemented by multiple types
      if (o instanceof SVGTextContentElement) {
        interfaces.push('SVGTextContentElement');
      }
      if (typeof SVGAnimationElement !== 'undefined' && o instanceof SVGAnimationElement) {
        interfaces.push('SVGAnimationElement');
      }
      if (o instanceof SVGGradientElement) {
        interfaces.push('SVGGradientElement');
      }
      if (typeof SVGGraphicsElement !== 'undefined' && o instanceof SVGGraphicsElement) {
        interfaces.push('SVGGraphicsElement');
      }
      if (typeof SVGGeometryElement !== 'undefined' && o instanceof SVGGeometryElement) {
        interfaces.push('SVGGeometryElement');
      }
      if (o instanceof SVGTextPositioningElement) {
        interfaces.push('SVGTextPositioningElement');
      }

      interfaces.push('SVGElement');
    }

    interfaces.push('Element', 'Node', 'EventTarget');
  } else if (o instanceof Text) {
    interfaces.push('Text', 'CharacterData', 'Node');
  } else if (o instanceof Comment) {
    interfaces.push('CharacterData', 'Node');
  } else if (o instanceof Attr) {
    interfaces.push('Attr', 'Node', 'EventTarget');
  } else if (o instanceof CanvasRenderingContext2D) {
    interfaces.push('CanvasRenderingContext2D');
  } else if (typeof RTCPeerConnection !== 'undefined' && o instanceof RTCPeerConnection) {
    interfaces.push('RTCPeerConnection');
  }

  return interfaces;
}

function addPrototypeMethodsAndProperties(metadata$$1, so, raw, key) {
  let prototype;

  function worker(name) {
    const item = prototype[name];
    let valueOverride;
    if (!(name in so) && name in raw) {
      const options = {
        skipOpaque: item.skipOpaque || false,
        defaultValue: item.defaultValue || null,
        trustReturnValue: item.trustReturnValue || false,
        rawArguments: item.rawArguments || false
      };

      if (item.type === 'function') {
        addMethodIfSupported(so, raw, name, options);
      } else if (item.type === '@raw') {
        defineProperty(so, name, {
          // Does not currently secure proxy the actual class
          get: function() {
            return valueOverride || raw[name];
          },
          set: function(value) {
            valueOverride = value;
          }
        });
      } else if (item.type === '@ctor') {
        defineProperty(so, name, {
          get: function() {
            return (
              valueOverride ||
              function() {
                const cls = raw[name];
                const args = ArraySlice(arguments);
                let result;

                if (typeof cls === 'function') {
                  //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
                  // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                  const ctor = Function.prototype.bind.apply(cls, [null].concat(args));
                  result = new ctor();
                } else {
                  // For browsers that use a constructor that's not a function, invoke the constructor directly.
                  // For example, on Mobile Safari window["Audio"] returns an object called AudioConstructor
                  // Passing the args as an array is the closest we got to passing the arguments.
                  result = new cls(args);
                }
                trust$1(so, result);

                return filterEverything(so, result);
              }
            );
          },
          set: function(value) {
            valueOverride = value;
          }
        });
      } else if (item.type === '@event') {
        defineProperty(so, name, {
          get: function() {
            return filterEverything(so, raw[name]);
          },

          set: function(callback) {
            raw[name] = function(e) {
              if (callback) {
                callback.call(so, e && SecureDOMEvent(e, key));
              }
            };
          }
        });
      } else {
        // Properties
        const descriptor = createFilteredProperty(so, raw, name, options);
        if (descriptor) {
          defineProperty(so, name, descriptor);
        }
      }
    }
  }

  const supportedInterfaces = getSupportedInterfaces(raw);

  const prototypes = metadata$$1['prototypes'];
  supportedInterfaces.forEach(name => {
    prototype = prototypes[name];
    ObjectKeys(prototype).forEach(worker);
  });
}

// Closure factory
function addPrototypeMethodsAndPropertiesStatelessHelper(
  name,
  prototype,
  prototypicalInstance,
  prototypeForValidation,
  rawPrototypicalInstance,
  config
) {
  let descriptor;
  const item = prototype[name];
  let valueOverride;

  if (!prototypeForValidation.hasOwnProperty(name) && name in rawPrototypicalInstance) {
    const options = {
      skipOpaque: item.skipOpaque || false,
      defaultValue: item.defaultValue || null,
      trustReturnValue: item.trustReturnValue || false,
      rawArguments: item.rawArguments || false
    };

    if (item.type === 'function') {
      descriptor = createFilteredMethodStateless(name, prototypeForValidation, options);
    } else if (item.type === '@raw') {
      descriptor = {
        // Does not currently secure proxy the actual class
        get: function() {
          if (valueOverride) {
            return valueOverride;
          }
          const raw = getRawThis(this);
          return raw[name];
        },
        set: function(value) {
          valueOverride = value;
        }
      };
    } else if (item.type === '@ctor') {
      descriptor = {
        get:
          valueOverride ||
          function() {
            return function() {
              const so = this;
              const raw = getRawThis(so);
              const cls = raw[name];

              // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
              const ctor = Function.prototype.bind.apply(cls, [null].concat(ArraySlice(arguments)));
              const result = new ctor();
              trust$1(so, result);

              return filterEverything(so, result);
            };
          },
        set: function(value) {
          valueOverride = value;
        }
      };
    } else if (item.type === '@event') {
      descriptor = {
        get: function() {
          return filterEverything(this, getRawThis(this)[name]);
        },

        set: function(callback) {
          const raw = getRawThis(this);

          // Insure that we pick up the current proxy for the raw object
          let key = getKey(raw);
          // Shared elements like <body> and <head> are not tied to specific namespaces.
          // Every namespace has a secure wrapper for these elements
          if (!key && isSharedElement(raw)) {
            // Obtain the key of the secure wrapper
            key = getKey(this);
          }
          const o = getFromCache(raw, key);

          raw[name] = function(e) {
            if (callback) {
              callback.call(o, e && SecureDOMEvent(e, key));
            }
          };
        }
      };
    } else {
      // Properties
      descriptor = createFilteredPropertyStateless(name, prototypeForValidation, options);
    }
  }

  if (descriptor) {
    config[name] = descriptor;
  }
}

function addPrototypeMethodsAndPropertiesStateless(
  metadata$$1,
  prototypicalInstance,
  prototypeForValidation
) {
  const rawPrototypicalInstance = getRawThis(prototypicalInstance);
  let prototype;
  const config = {};

  const supportedInterfaces = getSupportedInterfaces(rawPrototypicalInstance);

  const prototypes = metadata$$1['prototypes'];
  supportedInterfaces.forEach(name => {
    prototype = prototypes[name];
    for (const property in prototype) {
      addPrototypeMethodsAndPropertiesStatelessHelper(
        property,
        prototype,
        prototypicalInstance,
        prototypeForValidation,
        rawPrototypicalInstance,
        config
      );
    }
  });

  return config;
}

function getUnfilteredTypes() {
  const ret = [];
  const unfilteredTypesMeta = [
    'File',
    'FileList',
    'CSSStyleDeclaration',
    'TimeRanges',
    'Date',
    'MessagePort',
    'MessageChannel',
    'MessageEvent',
    'FormData',
    'ValidityState',
    'Crypto',
    'DOMTokenList',
    'ArrayBuffer',
    'Blob'
  ];
  unfilteredTypesMeta.forEach(unfilteredType => {
    if (typeof window[unfilteredType] !== 'undefined') {
      ret.push(window[unfilteredType]);
    }
  });
  return ret;
}
const unfilteredTypes = getUnfilteredTypes();

function isUnfilteredType(raw, key) {
  for (let n = 0; n < unfilteredTypes.length; n++) {
    if (raw instanceof unfilteredTypes[n]) {
      return true;
    }
  }

  // Do not filter ArrayBufferView types. https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
  if (raw && raw.buffer instanceof ArrayBuffer && raw.byteLength !== undefined) {
    return true;
  }

  if (isUnfilteredTypeHook$1 && isUnfilteredTypeHook$1(raw, key)) {
    return true;
  }

  return false;
}

function addUnfilteredPropertyIfSupported(st, raw, name) {
  if (raw[name]) {
    const config = {
      enumerable: true,
      value: raw[name],
      writable: true
    };
    defineProperty(st, name, config);
  }
}

/**
 * @deprecated
 */
function deepUnfilterMethodArguments(st, baseObject, members) {
  let value;
  let rawValue;
  // The locker key of the secure thing from where the members originated
  const fromKey = getKey(st);
  for (const property in members) {
    value = members[property];
    if (deepUnfilteringTypeHook$1) {
      rawValue = deepUnfilteringTypeHook$1(fromKey, value);
    }
    // If the hooks failed to unfilter the value, do the deep copy, unwrapping one item at a time
    if (rawValue === value) {
      if (isArray(value)) {
        rawValue = deepUnfilterMethodArguments(st, [], value);
      } else if (isPlainObject(value)) {
        rawValue = deepUnfilterMethodArguments(st, {}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            rawValue = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          rawValue = deepUnfilterMethodArguments(st, {}, value);
        }
      } else {
        // For everything else we are not sure how to provide raw access, filter the value
        rawValue = filterEverything(st, value, { defaultKey: fromKey });
      }
    }
    baseObject[property] = rawValue;
  }
  return baseObject;
}

/**
 * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
 * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
 * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
 */
function deepUnfilter(key, baseObject, members) {
  let value;
  let rawValue;
  for (const property in members) {
    value = members[property];
    if (deepUnfilteringTypeHook$1) {
      rawValue = deepUnfilteringTypeHook$1(key, value);
    }
    // If the hooks failed to unfilter the value, do the deep copy, unwrapping one item at a time
    if (rawValue === value) {
      if (isArray(value)) {
        rawValue = deepUnfilter(key, [], value);
      } else if (isPlainObject(value)) {
        rawValue = deepUnfilter(key, {}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            rawValue = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          rawValue = deepUnfilter(key, {}, value);
        }
      } else {
        // For everything else we are not sure how to provide raw access, filter the value
        rawValue = filter(key, value, { defaultKey: key });
      }
    }
    baseObject[property] = rawValue;
  }
  return baseObject;
}

const metadata$5 = {
  prototypes: {
    HTMLDocument: {
      // Defined on Instance
      location: DEFAULT,
      // Defined on Proto
      fgColor: DEFAULT,
      linkColor: DEFAULT,
      vlinkColor: DEFAULT,
      alinkColor: DEFAULT,
      bgColor: DEFAULT,
      clear: FUNCTION,
      captureEvents: FUNCTION,
      releaseEvents: FUNCTION
    },
    Document: {
      URL: DEFAULT,
      activeElement: DEFAULT,
      adoptNode: FUNCTION,
      anchors: DEFAULT,
      applets: DEFAULT,
      body: DEFAULT,
      caretRangeFromPoint: FUNCTION,
      characterSet: DEFAULT,
      charset: DEFAULT,
      childElementCount: DEFAULT,
      children: DEFAULT,
      close: FUNCTION,
      compatMode: DEFAULT,
      contentType: DEFAULT,
      cookie: DEFAULT,
      createAttribute: FUNCTION,
      createAttributeNS: FUNCTION,
      createCDATASection: FUNCTION,
      createComment: FUNCTION,
      createDocumentFragment: FUNCTION,
      createElement: FUNCTION,
      createElementNS: FUNCTION,
      createEvent: FUNCTION,
      createExpression: FUNCTION,
      createNSResolver: FUNCTION,
      createNodeIterator: FUNCTION,
      createProcessingInstruction: FUNCTION,
      createRange: FUNCTION,
      createTextNode: FUNCTION,
      createTreeWalker: FUNCTION,
      defaultView: DEFAULT,
      designMode: DEFAULT,
      dir: DEFAULT,
      doctype: DEFAULT,
      documentElement: DEFAULT,
      documentURI: DEFAULT,
      // SecureDocument does not allow setting domain property.
      // "domain":                           DEFAULT,
      elementFromPoint: FUNCTION,
      elementsFromPoint: FUNCTION,
      embeds: DEFAULT,
      evaluate: FUNCTION,
      execCommand: FUNCTION,
      exitPointerLock: FUNCTION,
      firstElementChild: DEFAULT,
      fonts: DEFAULT,
      forms: DEFAULT,
      getElementById: FUNCTION,
      getElementsByClassName: FUNCTION,
      getElementsByName: FUNCTION,
      getElementsByTagName: FUNCTION,
      getElementsByTagNameNS: FUNCTION,
      getSelection: FUNCTION,
      hasFocus: FUNCTION,
      head: DEFAULT,
      hidden: DEFAULT,
      images: DEFAULT,
      implementation: DEFAULT,
      importNode: FUNCTION,
      inputEncoding: DEFAULT,
      lastElementChild: DEFAULT,
      lastModified: DEFAULT,
      links: DEFAULT,
      onabort: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onbeforecopy: EVENT,
      onbeforecut: EVENT,
      onbeforepaste: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncopy: EVENT,
      oncuechange: EVENT,
      oncut: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpaste: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onpointerlockchange: EVENT,
      onpointerlockerror: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreadystatechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onsearch: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onselectionchange: EVENT,
      onselectstart: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      onwebkitfullscreenchange: EVENT,
      onwebkitfullscreenerror: EVENT,
      onwheel: EVENT,
      open: FUNCTION,
      origin: DEFAULT,
      plugins: DEFAULT,
      pointerLockElement: DEFAULT,
      preferredStylesheetSet: DEFAULT,
      queryCommandEnabled: FUNCTION,
      queryCommandIndeterm: FUNCTION,
      queryCommandState: FUNCTION,
      queryCommandSupported: FUNCTION,
      queryCommandValue: FUNCTION,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION,
      readyState: DEFAULT,
      referrer: DEFAULT,
      registerElement: FUNCTION,
      rootElement: DEFAULT,
      scripts: DEFAULT,
      scrollingElement: DEFAULT,
      selectedStylesheetSet: DEFAULT,
      styleSheets: DEFAULT,
      title: DEFAULT,
      visibilityState: DEFAULT,
      webkitCancelFullScreen: FUNCTION,
      webkitCurrentFullScreenElement: DEFAULT,
      webkitExitFullscreen: FUNCTION,
      webkitFullscreenElement: DEFAULT,
      webkitFullscreenEnabled: DEFAULT,
      webkitHidden: DEFAULT,
      webkitIsFullScreen: DEFAULT,
      webkitVisibilityState: DEFAULT,
      // Blocked on purpose because of security risk
      // "write":                            FUNCTION,
      // "writeln":                          FUNCTION,
      xmlEncoding: DEFAULT,
      xmlStandalone: DEFAULT,
      xmlVersion: DEFAULT
    },
    Node: metadata$3,
    EventTarget: metadata$4
  }
};

function SecureDocument(doc, key) {
  let o = getFromCache(doc, key);
  if (o) {
    return o;
  }

  // create prototype to allow instanceof checks against document
  const prototype = function() {};
  freeze(prototype);

  o = create$1(prototype, {
    toString: {
      value: function() {
        return `SecureDocument: ${doc}{ key: ${JSON.stringify(key)} }`;
      }
    },
    createAttribute: {
      value: function(name) {
        const att = doc.createAttribute(name);
        setKey(att, key);
        return SecureElement(att, key);
      }
    },
    createElement: {
      value: function(tag) {
        const el = doc.createElement(tag);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createElementNS: {
      value: function(namespace, tag) {
        const el = doc.createElementNS(namespace, tag);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createDocumentFragment: {
      value: function() {
        const el = doc.createDocumentFragment();
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createTextNode: {
      value: function(text) {
        const el = doc.createTextNode(text);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createComment: {
      value: function(data) {
        const el = doc.createComment(data);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    domain: {
      get: function() {
        return doc.domain;
      },
      set: function() {
        throw new Error('SecureDocument does not allow setting domain property.');
      }
    },
    querySelector: {
      value: function(selector) {
        return SecureElement.secureQuerySelector(doc, key, selector);
      }
    }
  });

  addEventTargetMethods(o, doc, key);

  function getCookieKey() {
    return `LSKey[${key['namespace']}]`;
  }

  defineProperties(o, {
    cookie: {
      get: function() {
        const fullCookie = doc.cookie;
        const entries = fullCookie.split(';');
        const cookieKey = getCookieKey();
        // filter out cookies that do not match current namespace
        const nsFiltered = entries.filter(val => {
          const left = val.split('=')[0].trim();
          return left.indexOf(cookieKey) === 0;
        });
        // strip LockerService key before returning to user land
        const keyFiltered = nsFiltered.map(val => val.trim().substring(cookieKey.length));
        return keyFiltered.join('; ');
      },
      set: function(cookie) {
        const chunks = cookie.split(';');
        const entry = chunks[0].split('=');
        const newKey = getCookieKey() + entry[0];
        chunks[0] = `${newKey}=${entry[1]}`;
        const newCookie = chunks.join(';');
        doc.cookie = newCookie;
      }
    },
    implementation: {
      enumerable: true,
      value: doc.implementation // revert W-5404190
    }
  });

  addPrototypeMethodsAndProperties(metadata$5, o, doc, key);

  setRef(o, doc, key);
  addToCache(doc, o, key);
  registerProxy(o);

  return o;
}

SecureDocument.toString = function() {
  return 'SecureDocument() { [native code] }';
};

function getSupportedSchemesErrorMessage(method, object) {
  return `${object}.${method} supports http://, https:// schemes and relative urls.`;
}

/**
 * Creates a confirmation dialog to ask the user if they would like to navigate away from
 * the current domain. This is in an effort to prevent phishing attacks, e.g. salesforce.com -> saelsforce.com
 *
 * @param currentURL current location else, use window.location.href
 * @param targetURL location to check against current location
 */
function confirmLocationChange(currentURL, targetURL) {
  const c = document.createElement('a');
  const t = document.createElement('a');
  c.href = currentURL;
  t.href = targetURL;
  const isSameLocation$$1 = c.protocol === t.protocol && c.hostname === t.hostname;

  if (!isSameLocation$$1) {
    // eslint-disable-next-line
    return confirm(`You are exiting ${c.hostname}. Continue?`);
  }

  return true;
}

function SecureLocation(loc, key) {
  let o = getFromCache(loc, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return loc.href;
      }
    },
    href: {
      get: function() {
        return loc.href;
      },
      set: function(href) {
        href = sanitizeURLForElement(href);
        if (!isValidURLScheme(href)) {
          throw new error(getSupportedSchemesErrorMessage('href', 'SecureLocation'));
        }
        if (confirmLocationChange(loc.href, href)) {
          loc.href = href;
        }
        return true;
      }
    },
    protocol: {
      get: function() {
        return loc.protocol;
      },
      set: function(protocol) {
        protocol = String(protocol);
        if (!isValidURLScheme(protocol)) {
          throw new error(getSupportedSchemesErrorMessage('protocol', 'SecureLocation'));
        }
        loc.protocol = protocol;
        return true;
      }
    }
  });

  ['host', 'hostname'].forEach(property => {
    defineProperty(o, property, {
      get: function() {
        return loc[property];
      },
      set: function(val) {
        val = String(val);
        if (confirmLocationChange(loc.href, `${loc.protocol}//${val}`)) {
          loc[property] = val;
        }
        return true;
      }
    });
  });

  ['pathname', 'search', 'hash', 'username', 'password', 'origin', 'port'].forEach(property =>
    addPropertyIfSupported(o, loc, property)
  );

  ['replace', 'assign'].forEach(method => {
    defineProperty(o, method, {
      writable: true,
      enumerable: true,
      value(url) {
        url = sanitizeURLForElement(url);

        if (!isValidURLScheme(url)) {
          throw new error(getSupportedSchemesErrorMessage(method, 'SecureLocation'));
        }

        if (confirmLocationChange(loc.href, url)) {
          loc[method](url);
        }
      }
    });
  });

  addMethodIfSupported(o, loc, 'reload');

  setRef(o, loc, key);
  addToCache(loc, o, key);
  registerProxy(o);

  return o;
}

let addPropertiesHook$1;
function registerAddPropertiesHook$1(hook) {
  addPropertiesHook$1 = hook;
}

function SecureNavigator(navigator, key) {
  let o = getFromCache(navigator, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureNavigator: ${navigator}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  [
    'appCodeName',
    'appName',
    'appVersion',
    'cookieEnabled',
    'geolocation',
    'language',
    'onLine',
    'platform',
    'product',
    'userAgent'
  ].forEach(name => addPropertyIfSupported(o, navigator, name));

  if (addPropertiesHook$1) {
    addPropertiesHook$1(o, navigator, key);
  }

  setRef(o, navigator, key);
  addToCache(navigator, o, key);
  registerProxy(o);

  return o;
}

function SecureXMLHttpRequest(key) {
  // Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
  return function() {
    const xhr = new XMLHttpRequest();

    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureXMLHttpRequest: ${xhr} { key: ${JSON.stringify(key)} }`;
        }
      }
    });

    // Properties
    [
      'readyState',
      'status',
      'statusText',
      'response',
      'responseType',
      'responseText',
      'responseURL',
      'timeout',
      'withCredentials',
      'upload',
      'UNSENT',
      'OPENED',
      'HEADERS_RECEIVED',
      'LOADING',
      'DONE'
    ].forEach(name => addPropertyIfSupported(o, xhr, name));

    addPropertyIfSupported(o, xhr, 'responseXML', {
      afterGetCallback: function(value) {
        return value;
      }
    });

    // Event handlers
    [
      'onloadstart',
      'onprogress',
      'onabort',
      'onerror',
      'onload',
      'ontimeout',
      'onloadend',
      'onreadystatechange'
    ].forEach(name =>
      defineProperty(o, name, {
        set: function(callback) {
          xhr[name] = function(e) {
            callback.call(o, e && SecureDOMEvent(e, key));
          };
        }
      })
    );

    defineProperties(o, {
      abort: createFilteredMethod(o, xhr, 'abort'),

      addEventListener: createAddEventListenerDescriptor(o, xhr, key),

      open: {
        enumerable: true,
        writable: true,
        value: function() {
          const normalizer = document.createElement('a');
          normalizer.setAttribute('href', arguments[1]);

          // Order of operations are important!
          let pathname = normalizer.pathname;
          pathname = decodeURIComponent(pathname);
          pathname = pathname.toLowerCase();

          if (pathname.includes('/aura')) {
            throw new error(
              `SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints ${
                arguments[1]
              }!`
            );
          }

          arguments[1] = normalizer.getAttribute('href');

          return xhr.open.apply(xhr, arguments);
        }
      },

      send: createFilteredMethod(o, xhr, 'send'),

      getAllResponseHeaders: createFilteredMethod(o, xhr, 'getAllResponseHeaders'),
      getResponseHeader: createFilteredMethod(o, xhr, 'getResponseHeader'),

      setRequestHeader: createFilteredMethod(o, xhr, 'setRequestHeader'),

      overrideMimeType: createFilteredMethod(o, xhr, 'overrideMimeType')
    });

    setRef(o, xhr, key);

    return freeze(o);
  };
}

function SecureMutationObserver(key) {
  function filterRecords(st, records) {
    const filtered = [];

    records.forEach(record => {
      if (hasAccess(st, record.target)) {
        filtered.push(filterEverything(st, record));
      }
    });

    return filtered;
  }

  // Create a new closure constructor for new MutationObserver() syntax support that captures the key
  return function(callback) {
    const o = create$1(null);

    const observer = new MutationObserver(records => {
      const filtered = filterRecords(o, records);
      if (filtered.length > 0) {
        callback(filtered);
      }
    });

    defineProperties(o, {
      toString: {
        value: function() {
          return `SecureMutationObserver: ${observer} { key: ${JSON.stringify(key)} }`;
        }
      },

      observe: createFilteredMethod(o, observer, 'observe', { rawArguments: true }),
      disconnect: createFilteredMethod(o, observer, 'disconnect'),

      takeRecords: {
        writable: true,
        value: function() {
          return filterRecords(o, observer['takeRecords']());
        }
      }
    });

    setRef(o, observer, key);

    return freeze(o);
  };
}

function SecureNotification(key) {
  // Create a new closure constructor for new Notification() syntax support that captures the key
  return function(title, options) {
    const notification = new Notification(title, options);

    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureNotification: ${notification} { key: ${JSON.stringify(key)} }`;
        }
      }
    });

    // Properties
    [
      'actions',
      'badge',
      'body',
      'data',
      'dir',
      'lang',
      'tag',
      'icon',
      'image',
      'requireInteraction',
      'silent',
      'timestamp',
      'title',
      'vibrate',
      'noscreen',
      'renotify',
      'sound',
      'sticky'
    ].forEach(name => addPropertyIfSupported(o, notification, name));

    // Event handlers
    ['onclick', 'onerror'].forEach(name =>
      defineProperty(o, name, {
        set: function(callback) {
          notification[name] = function(e) {
            callback.call(o, e && SecureDOMEvent(e, key));
          };
        }
      })
    );

    defineProperties(o, {
      close: createFilteredMethod(o, notification, 'close')
    });

    addEventTargetMethods(o, notification, key);

    setRef(o, notification, key);

    return freeze(o);
  };
}

function SecureStorage(storage, type, key) {
  let o = getFromCache(storage, key);
  if (o) {
    return o;
  }

  // Read existing key to synthetic key index from storage
  const stringizedKey = JSON.stringify(key);
  const nextSyntheticKey = `LSSNextSynthtic:${type}`;
  const storedIndexKey = `LSSIndex:${type}${stringizedKey}`;
  let nameToSyntheticRaw;
  try {
    nameToSyntheticRaw = storage.getItem(storedIndexKey);
  } catch (e) {
    // There is a bug in google chrome where localStorage becomes inaccessible.
    // Don't fast fail and break all applications. Defer the exception throwing to when the app actually uses localStorage
  }
  let nameToSynthetic = nameToSyntheticRaw ? JSON.parse(nameToSyntheticRaw) : {};

  function persistSyntheticNameIndex() {
    // Persist the nameToSynthetic index
    const stringizedIndex = JSON.stringify(nameToSynthetic);
    storage.setItem(storedIndexKey, stringizedIndex);
  }

  function getSynthetic(name) {
    let synthetic = nameToSynthetic[name];
    if (!synthetic) {
      const nextSynthticRaw = storage.getItem(nextSyntheticKey);
      let nextSynthetic = nextSynthticRaw ? Number(nextSynthticRaw) : 1;

      synthetic = nextSynthetic++;

      // Persist the next synthetic counter
      storage.setItem(nextSyntheticKey, nextSynthetic);

      nameToSynthetic[name] = synthetic;

      persistSyntheticNameIndex();
    }

    return synthetic;
  }

  function forgetSynthetic(name) {
    const synthetic = getSynthetic(name);
    if (synthetic) {
      delete nameToSynthetic[name];
      persistSyntheticNameIndex();
    }
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureStorage: ${type} { key: ${JSON.stringify(key)} }`;
      }
    },

    length: {
      get: function() {
        return ObjectKeys(nameToSynthetic).length;
      }
    },

    getItem: {
      value: function(name) {
        const synthetic = getSynthetic(name);
        return synthetic ? storage.getItem(synthetic) : null;
      }
    },

    setItem: {
      value: function(name, value) {
        const synthetic = getSynthetic(name);
        storage.setItem(synthetic, value);
      }
    },

    removeItem: {
      value: function(name) {
        const syntheticKey = getSynthetic(name);
        if (syntheticKey) {
          storage.removeItem(syntheticKey);
          forgetSynthetic(name);
        }
      }
    },

    key: {
      value: function(index) {
        return ObjectKeys(nameToSynthetic)[index];
      }
    },

    clear: {
      value: function() {
        ObjectKeys(nameToSynthetic).forEach(name => {
          const syntheticKey = getSynthetic(name);
          storage.removeItem(syntheticKey);
        });

        // Forget all synthetic
        nameToSynthetic = {};
        storage.removeItem(storedIndexKey);
      }
    }
  });

  setRef(o, storage, key);
  addToCache(storage, o, key);
  registerProxy(o);

  return o;
}

const secureBlobTypes = new WeakMap();
const secureFilesTypes = new WeakMap();
const secureMediaSource = new WeakMap();

function registerSecureBlob(st, type) {
  secureBlobTypes.set(st, type);
}

function isSecureBlob(st) {
  return secureBlobTypes.has(st);
}



function registerSecureFile(st, type) {
  secureFilesTypes.set(st, type);
}



function isSecureFile(st) {
  return secureFilesTypes.has(st);
}

function registerSecureMediaSource(st) {
  secureMediaSource.set(st, true);
}

function isSecureMediaSource(st) {
  return secureMediaSource.has(st);
}

// For URL, we only need to tame one static method. That method is on the
// window.URL primordial and disappears from instances of URL. We only create
// the secure object and we will let the deep freeze operation make it tamper
// proof.

// Taming of URL createObjectURL will not be necessary on webkit
// "CSP rules ignored when a page navigates to a blob URL" is declassified,
// https://bugs.webkit.org/show_bug.cgi?id=174883

// and once the correct behavior on Edge is confirmed (curently in development)
// https://developer.microsoft.com/en-us/microsoft-edge/platform/status/urlapi/

// Only FireFox implements the correct behavior.

function SecureURL(raw) {
  const SecureURLMethods = create$1(null, {
    createObjectURL: {
      value: function(object) {
        // only registered objects are allowed
        if (!isSecureBlob(object) && !isSecureFile(object) && !isSecureMediaSource(object)) {
          throw new TypeError('Unexpected identifier');
        }

        return raw.createObjectURL(object);
      }
    },
    toString: {
      value: function() {
        return `SecureURL: ${ObjectToString(raw)}`;
      }
    }
  });

  return new Proxy(raw, {
    get: function(target, name) {
      // Give priority to the overritten methods.
      let desc = getOwnPropertyDescriptor(SecureURLMethods, name);
      if (desc === undefined) {
        desc = getOwnPropertyDescriptor(target, name);
      }
      if (desc === undefined || desc.value === undefined) {
        return undefined;
      }
      // Properties not found the object are not static.
      if (ObjectKeys(target).indexOf(name) < 0) {
        return desc.value;
      }
      // Prevent static methods from executing in the context of the proxy.
      return function() {
        return desc.value.apply(undefined, arguments);
      };
    },
    set: function() {
      return true;
    }
  });
}

const HTML_MAX_BUF_SIZE = 32768;
const REGEX_VALID_MIME_TYPE = /^[a-z]+\/[a-z+-]+$/;

const WHITELISTED_MIME_TYPES = [
  'application/octet-stream',
  'application/json',
  'video/',
  'audio/',
  'image/',
  'font/',
  'text/plain',
  'text/markdown',
  'application/zip',
  'application/x-bzip',
  'application/x-rar-compressed',
  'application/x-tar'
];

const HTML_MIME_TYPES = ['text/html', 'image/svg+xml', 'text/xml'];

/**
 * Converts ArrayBuffer to UTF-8 String
 * @param {ArrayBuffer} buf
 */
function ab2str(buf) {
  if (typeof TextDecoder !== 'undefined') {
    const dec = new TextDecoder('utf-8');
    return dec.decode(buf);
  }

  let str = '';
  const abLen = buf.byteLength;
  let offset = 0;
  const CHUNK_SIZE = 2 ** 16;

  do {
    const len = Math.min(CHUNK_SIZE, abLen - offset);
    const part = new Uint8Array(buf.slice(offset, offset + len));
    str += String.fromCharCode.apply(null, part);
    offset += len;
  } while (offset < abLen);
  return str;
}

/**
 * Converts String to ArrayBuffer
 * https://github.com/dfcreative/string-to-arraybuffer/blob/master/index.js
 * @param {String} str
 */


function sanitizeBitsArg(bits) {
  // prevent array index accessor hijacking
  return [].concat(bits);
}

function sanitizeOptionsArg(options = {}) {
  // prevent property getters hijacking
  // coerce everything to string
  const type = asString(options.type).toLowerCase();

  const opts = {};
  if (type) {
    opts.type = ['undefined', 'null'].includes(type) ? 'application/octet-stream' : type;
  } else {
    opts.type = 'application/octet-stream';
  }

  if (options.endings) {
    opts.endings = asString(options.endings);
  }

  if (options.lastModified) {
    opts.lastModified = asString(options.lastModified);
  }

  return opts;
}

function sanitizeHTMLParts(arr) {
  const out = [];
  let i = 0;
  do {
    let entry = arr[i];
    if (typeof entry !== 'string') {
      entry = ab2str(entry);
    }
    entry = sanitize(entry);
    out.push(entry);
    i += 1;
  } while (i < arr.length);
  return out;
}

function isWhitelistedMIMEType(type = '') {
  // avoid MIME types which try to escape using special characters
  // Reason: W-4896359
  if (!REGEX_VALID_MIME_TYPE.test(type)) {
    return false;
  }

  for (let i = 0; i < WHITELISTED_MIME_TYPES.length; i++) {
    if (type.startsWith(WHITELISTED_MIME_TYPES[i], 0)) {
      return true;
    }
  }
  return false;
}

function isSafeArrayBuffer(buf) {
  if (buf.byteLength > HTML_MAX_BUF_SIZE) {
    warn(`Content validation failed. Max size is ${HTML_MAX_BUF_SIZE}`);
    return false;
  }
  return true;
}

/**
 * There are no relible ways to convert syncronously
 * a blob back to a string. Disallow until
 * <rdar://problem/33575448> is declassified
 * @returns {Boolean}
 */
function isSafeBlob() {
  return false;
}

/**
 * Validates if all blobParts contain safe content.
 * @param {Array} blobParts
 * @return {Boolean}
 */
function canCreateFromHTML(blobParts) {
  if (blobParts && blobParts.length) {
    for (let i = 0; i < blobParts.length; i++) {
      const entry = blobParts[i];
      if (entry instanceof ArrayBuffer && !isSafeArrayBuffer(entry)) {
        return false;
      } else if (entry instanceof Blob && !isSafeBlob(entry)) {
        return false;
      }
    }
  }
  return true;
}

function SecureBlob(blobParts = [], options = {}) {
  blobParts = sanitizeBitsArg(blobParts);
  const opts = sanitizeOptionsArg(options);

  if (HTML_MIME_TYPES.includes(opts.type)) {
    if (canCreateFromHTML(blobParts)) {
      const instance = new Blob(sanitizeHTMLParts(blobParts), opts);

      // fix instanceof checks
      instance.constructor = SecureBlob;

      registerSecureBlob(instance, opts.type);
      return instance;
    }
    throw new error('Validation failed, cannot create Blob.');
  }

  if (isWhitelistedMIMEType(opts.type)) {
    // whitelisted MIME types do not need sanitization
    const instance = new Blob(blobParts, opts);

    // fix instanceof checks
    instance.constructor = SecureBlob;

    registerSecureBlob(instance, opts.type);
    return instance;
  }

  throw new error('Unsupported MIME type.');
}
SecureBlob.prototype = Blob.prototype;

function SecureFile(bits, name, options = {}) {
  bits = sanitizeBitsArg(bits);
  name = asString(name);
  options = sanitizeOptionsArg(options);

  if (HTML_MIME_TYPES.includes(options.type)) {
    if (canCreateFromHTML(bits)) {
      const instance = new File(sanitizeHTMLParts(bits), name, options);

      // fix instanceof checks
      instance.constructor = SecureFile;

      registerSecureFile(instance, options.type);
      return instance;
    }
    throw new error('Validation failed, cannot create File.');
  }

  if (isWhitelistedMIMEType(options.type)) {
    // whitelisted MIME types do not need sanitization
    const instance = new File(bits, name, options);

    // fix instanceof checks
    instance.constructor = SecureFile;

    registerSecureFile(instance, options.type);
    return instance;
  }

  throw new error('Unsupported MIME type.');
}
SecureFile.prototype = File.prototype;

function SecureMediaSource(key) {
  const st = SecureObject({}, key);
  return function() {
    const instance = new MediaSource();
    const secureInstance = filterEverything(st, instance);
    registerSecureMediaSource(secureInstance);
    return secureInstance;
  };
}

function SecureCustomEventFactory(CustomEventCtor, key) {
  assert$1.invariant(CustomEventCtor !== undefined, 'CustomEvent constructor is undefined');
  assert$1.invariant(key !== undefined, 'key is undefined');

  let SecureCustomEvent = getFromCache(CustomEventCtor, key);
  if (SecureCustomEvent) {
    return SecureCustomEvent;
  }

  SecureCustomEvent = function(...args) {
    assert$1.invariant(args.length > 0, 'Cannot invoke CustomEvent constructor without a name');

    // Because the event is being constructed, the sandbox will be used as the accessor
    const filteredArguments = deepUnfilterMethodArguments(getEnv$1(key), [], args);
    const event = new CustomEventCtor(...filteredArguments);
    return SecureDOMEvent(event, key);
  };

  addToCache(CustomEventCtor, SecureCustomEvent, key);
  setRef(SecureCustomEvent, CustomEventCtor, key);
  return SecureCustomEvent;
}

let addPropertiesHook;
function registerAddPropertiesHook$$1(hook) {
  addPropertiesHook = hook;
}

const metadata$$1 = {
  prototypes: {
    Window: {
      AnalyserNode: FUNCTION,
      AnimationEvent: FUNCTION,
      AppBannerPromptResult: FUNCTION,
      ApplicationCache: FUNCTION,
      ApplicationCacheErrorEvent: FUNCTION,
      Attr: RAW,
      Audio: CTOR,
      AudioBuffer: FUNCTION,
      AudioBufferSourceNode: FUNCTION,
      AudioContext: CTOR,
      AudioDestinationNode: FUNCTION,
      AudioListener: FUNCTION,
      AudioNode: FUNCTION,
      AudioParam: FUNCTION,
      AudioProcessingEvent: FUNCTION,
      AutocompleteErrorEvent: FUNCTION,
      BarProp: FUNCTION,
      BatteryManager: FUNCTION,
      BeforeInstallPromptEvent: FUNCTION,
      BeforeUnloadEvent: FUNCTION,
      BiquadFilterNode: FUNCTION,
      BlobEvent: FUNCTION,
      CDATASection: FUNCTION,
      CSS: FUNCTION,
      CSSFontFaceRule: FUNCTION,
      CSSGroupingRule: FUNCTION,
      CSSImportRule: FUNCTION,
      CSSKeyframeRule: FUNCTION,
      CSSKeyframesRule: FUNCTION,
      CSSMediaRule: FUNCTION,
      CSSNamespaceRule: FUNCTION,
      CSSPageRule: FUNCTION,
      CSSRule: FUNCTION,
      CSSRuleList: FUNCTION,
      CSSStyleDeclaration: FUNCTION,
      CSSStyleRule: FUNCTION,
      CSSStyleSheet: FUNCTION,
      CSSSupportsRule: FUNCTION,
      CSSViewportRule: FUNCTION,
      CanvasCaptureMediaStreamTrack: FUNCTION,
      CanvasGradient: FUNCTION,
      CanvasPattern: FUNCTION,
      CanvasRenderingContext2D: RAW,
      ChannelMergerNode: FUNCTION,
      ChannelSplitterNode: FUNCTION,
      CharacterData: FUNCTION,
      ClientRect: FUNCTION,
      ClientRectList: FUNCTION,
      ClipboardEvent: FUNCTION,
      CloseEvent: FUNCTION,
      Comment: CTOR,
      CompositionEvent: FUNCTION,
      ConvolverNode: FUNCTION,
      Credential: FUNCTION,
      CredentialsContainer: FUNCTION,
      Crypto: FUNCTION,
      CryptoKey: FUNCTION,
      DOMError: FUNCTION,
      DOMException: CTOR,
      DOMImplementation: FUNCTION,
      DOMParser: RAW,
      DOMStringList: FUNCTION,
      DOMStringMap: FUNCTION,
      DOMTokenList: FUNCTION,
      DataTransfer: FUNCTION,
      DataTransferItem: FUNCTION,
      DataTransferItemList: FUNCTION,
      DelayNode: FUNCTION,
      DeviceMotionEvent: FUNCTION,
      DeviceOrientationEvent: FUNCTION,
      Document: FUNCTION,
      DocumentFragment: FUNCTION,
      DocumentType: FUNCTION,
      DragEvent: FUNCTION,
      DynamicsCompressorNode: FUNCTION,
      ES6Promise: DEFAULT,
      Element: RAW,
      ErrorEvent: FUNCTION,
      Event: CTOR,
      EventSource: FUNCTION,
      EventTarget: RAW,
      FederatedCredential: FUNCTION,
      FileError: FUNCTION,
      FileList: RAW,
      FileReader: RAW,
      FocusEvent: FUNCTION,
      FontFace: FUNCTION,
      GainNode: FUNCTION,
      HTMLAllCollection: FUNCTION,
      HTMLAnchorElement: RAW,
      HTMLAreaElement: RAW,
      HTMLAudioElement: RAW,
      HTMLBRElement: RAW,
      HTMLBaseElement: RAW,
      HTMLBodyElement: RAW,
      HTMLButtonElement: RAW,
      HTMLCanvasElement: RAW,
      HTMLCollection: RAW,
      HTMLContentElement: RAW,
      HTMLDListElement: RAW,
      HTMLDataListElement: RAW,
      HTMLDetailsElement: RAW,
      HTMLDialogElement: RAW,
      HTMLDirectoryElement: RAW,
      HTMLDivElement: RAW,
      HTMLDocument: FUNCTION,
      HTMLElement: RAW,
      HTMLEmbedElement: RAW,
      HTMLFieldSetElement: RAW,
      HTMLFontElement: RAW,
      HTMLFormControlsCollection: FUNCTION,
      HTMLFormElement: RAW,
      HTMLFrameElement: RAW,
      HTMLFrameSetElement: RAW,
      HTMLHRElement: RAW,
      HTMLHeadElement: RAW,
      HTMLHeadingElement: RAW,
      HTMLHtmlElement: RAW,
      HTMLIFrameElement: RAW,
      HTMLImageElement: RAW,
      HTMLInputElement: RAW,
      HTMLKeygenElement: RAW,
      HTMLLIElement: RAW,
      HTMLLabelElement: RAW,
      HTMLLegendElement: RAW,
      HTMLLinkElement: RAW,
      HTMLMapElement: RAW,
      HTMLMarqueeElement: RAW,
      HTMLMediaElement: RAW,
      HTMLMenuElement: RAW,
      HTMLMetaElement: RAW,
      HTMLMeterElement: RAW,
      HTMLModElement: RAW,
      HTMLOListElement: RAW,
      HTMLObjectElement: RAW,
      HTMLOptGroupElement: RAW,
      HTMLOptionElement: RAW,
      HTMLOptionsCollection: RAW,
      HTMLOutputElement: RAW,
      HTMLParagraphElement: RAW,
      HTMLParamElement: RAW,
      HTMLPictureElement: RAW,
      HTMLPreElement: RAW,
      HTMLProgressElement: RAW,
      HTMLQuoteElement: RAW,
      HTMLScriptElement: RAW,
      HTMLSelectElement: RAW,
      HTMLShadowElement: RAW,
      HTMLSlotElement: RAW,
      HTMLSourceElement: RAW,
      HTMLSpanElement: RAW,
      HTMLStyleElement: RAW,
      HTMLTableCaptionElement: RAW,
      HTMLTableCellElement: RAW,
      HTMLTableColElement: RAW,
      HTMLTableElement: RAW,
      HTMLTableRowElement: RAW,
      HTMLTableSectionElement: RAW,
      HTMLTemplateElement: RAW,
      HTMLTextAreaElement: RAW,
      HTMLTitleElement: RAW,
      HTMLTrackElement: RAW,
      HTMLUListElement: RAW,
      HTMLUnknownElement: RAW,
      HTMLVideoElement: RAW,
      HashChangeEvent: FUNCTION,
      IdleDeadline: FUNCTION,
      Image: CTOR,
      ImageBitmap: FUNCTION,
      ImageData: FUNCTION,
      Infinity: DEFAULT,
      InputDeviceCapabilities: FUNCTION,
      KeyboardEvent: FUNCTION,
      Location: FUNCTION,
      MIDIAccess: FUNCTION,
      MIDIConnectionEvent: FUNCTION,
      MIDIInput: FUNCTION,
      MIDIInputMap: FUNCTION,
      MIDIMessageEvent: FUNCTION,
      MIDIOutput: FUNCTION,
      MIDIOutputMap: FUNCTION,
      MIDIPort: FUNCTION,
      MediaDevices: DEFAULT,
      MediaElementAudioSourceNode: FUNCTION,
      MediaEncryptedEvent: FUNCTION,
      MediaError: FUNCTION,
      MediaKeyMessageEvent: FUNCTION,
      MediaKeySession: FUNCTION,
      MediaKeyStatusMap: FUNCTION,
      MediaKeySystemAccess: FUNCTION,
      MediaKeys: FUNCTION,
      MediaList: FUNCTION,
      MediaQueryList: FUNCTION,
      MediaQueryListEvent: FUNCTION,
      MediaRecorder: CTOR,
      MediaSource: FUNCTION,
      MediaStreamAudioDestinationNode: CTOR,
      MediaStreamAudioSourceNode: CTOR,
      MediaStreamEvent: CTOR,
      MediaStreamTrack: FUNCTION,
      MessageChannel: RAW,
      MessageEvent: RAW,
      MessagePort: RAW,
      MimeType: FUNCTION,
      MimeTypeArray: FUNCTION,
      MutationObserver: CTOR,
      MutationRecord: FUNCTION,
      MouseEvent: CTOR,
      NaN: DEFAULT,
      NamedNodeMap: FUNCTION,
      Navigator: FUNCTION,
      Node: RAW,
      NodeFilter: FUNCTION,
      NodeIterator: FUNCTION,
      NodeList: FUNCTION,
      OfflineAudioCompletionEvent: FUNCTION,
      OfflineAudioContext: FUNCTION,
      Option: CTOR,
      OscillatorNode: FUNCTION,
      PERSISTENT: DEFAULT,
      PageTransitionEvent: FUNCTION,
      PasswordCredential: FUNCTION,
      Path2D: FUNCTION,
      Performance: RAW,
      PerformanceEntry: FUNCTION,
      PerformanceMark: FUNCTION,
      PerformanceMeasure: FUNCTION,
      PerformanceNavigation: FUNCTION,
      PerformanceResourceTiming: FUNCTION,
      PerformanceTiming: FUNCTION,
      PeriodicWave: FUNCTION,
      PopStateEvent: FUNCTION,
      Presentation: FUNCTION,
      PresentationAvailability: FUNCTION,
      PresentationConnection: FUNCTION,
      PresentationConnectionAvailableEvent: FUNCTION,
      PresentationConnectionCloseEvent: FUNCTION,
      PresentationRequest: FUNCTION,
      ProcessingInstruction: FUNCTION,
      ProgressEvent: FUNCTION,
      PromiseRejectionEvent: FUNCTION,
      RTCCertificate: FUNCTION,
      RTCIceCandidate: CTOR,
      RTCSessionDescription: CTOR,
      RadioNodeList: FUNCTION,
      Range: FUNCTION,
      ReadableByteStream: FUNCTION,
      ReadableStream: FUNCTION,
      Request: FUNCTION,
      Response: FUNCTION,
      SVGAElement: FUNCTION,
      SVGAngle: FUNCTION,
      SVGAnimateElement: FUNCTION,
      SVGAnimateMotionElement: FUNCTION,
      SVGAnimateTransformElement: FUNCTION,
      SVGAnimatedAngle: FUNCTION,
      SVGAnimatedBoolean: FUNCTION,
      SVGAnimatedEnumeration: FUNCTION,
      SVGAnimatedInteger: FUNCTION,
      SVGAnimatedLength: FUNCTION,
      SVGAnimatedLengthList: FUNCTION,
      SVGAnimatedNumber: FUNCTION,
      SVGAnimatedNumberList: FUNCTION,
      SVGAnimatedPreserveAspectRatio: FUNCTION,
      SVGAnimatedRect: FUNCTION,
      SVGAnimatedString: FUNCTION,
      SVGAnimatedTransformList: FUNCTION,
      SVGAnimationElement: RAW,
      SVGCircleElement: RAW,
      SVGClipPathElement: RAW,
      SVGComponentTransferFunctionElement: RAW,
      SVGCursorElement: RAW,
      SVGDefsElement: RAW,
      SVGDescElement: RAW,
      SVGDiscardElement: RAW,
      SVGElement: RAW,
      SVGEllipseElement: RAW,
      SVGFEBlendElement: RAW,
      SVGFEColorMatrixElement: RAW,
      SVGFEComponentTransferElement: RAW,
      SVGFECompositeElement: RAW,
      SVGFEConvolveMatrixElement: RAW,
      SVGFEDiffuseLightingElement: RAW,
      SVGFEDisplacementMapElement: RAW,
      SVGFEDistantLightElement: RAW,
      SVGFEDropShadowElement: RAW,
      SVGFEFloodElement: RAW,
      SVGFEFuncAElement: RAW,
      SVGFEFuncBElement: RAW,
      SVGFEFuncGElement: RAW,
      SVGFEFuncRElement: RAW,
      SVGFEGaussianBlurElement: RAW,
      SVGFEImageElement: RAW,
      SVGFEMergeElement: RAW,
      SVGFEMergeNodeElement: RAW,
      SVGFEMorphologyElement: RAW,
      SVGFEOffsetElement: RAW,
      SVGFEPointLightElement: RAW,
      SVGFESpecularLightingElement: RAW,
      SVGFESpotLightElement: RAW,
      SVGFETileElement: RAW,
      SVGFETurbulenceElement: RAW,
      SVGFilterElement: RAW,
      SVGForeignObjectElement: RAW,
      SVGGElement: RAW,
      SVGGeometryElement: RAW,
      SVGGradientElement: RAW,
      SVGGraphicsElement: RAW,
      SVGImageElement: RAW,
      SVGLength: FUNCTION,
      SVGLengthList: FUNCTION,
      SVGLineElement: RAW,
      SVGLinearGradientElement: RAW,
      SVGMPathElement: RAW,
      SVGMarkerElement: RAW,
      SVGMaskElement: RAW,
      SVGMatrix: RAW,
      SVGMetadataElement: RAW,
      SVGNumber: FUNCTION,
      SVGNumberList: FUNCTION,
      SVGPathElement: RAW,
      SVGPatternElement: RAW,
      SVGPoint: FUNCTION,
      SVGPointList: FUNCTION,
      SVGPolygonElement: RAW,
      SVGPolylineElement: RAW,
      SVGPreserveAspectRatio: FUNCTION,
      SVGRadialGradientElement: RAW,
      SVGRect: FUNCTION,
      SVGRectElement: RAW,
      SVGSVGElement: RAW,
      SVGScriptElement: RAW,
      SVGSetElement: RAW,
      SVGStopElement: RAW,
      SVGStringList: FUNCTION,
      SVGStyleElement: RAW,
      SVGSwitchElement: RAW,
      SVGSymbolElement: RAW,
      SVGTSpanElement: RAW,
      SVGTextContentElement: RAW,
      SVGTextElement: RAW,
      SVGTextPathElement: RAW,
      SVGTextPositioningElement: RAW,
      SVGTitleElement: RAW,
      SVGTransform: FUNCTION,
      SVGTransformList: FUNCTION,
      SVGUnitTypes: FUNCTION,
      SVGUseElement: RAW,
      SVGViewElement: RAW,
      SVGViewSpec: FUNCTION,
      SVGZoomEvent: FUNCTION,
      Screen: FUNCTION,
      ScreenOrientation: FUNCTION,
      SecurityPolicyViolationEvent: FUNCTION,
      Selection: FUNCTION,
      SourceBuffer: FUNCTION,
      SourceBufferList: FUNCTION,
      SpeechSynthesisEvent: FUNCTION,
      SpeechSynthesisUtterance: FUNCTION,
      StyleSheet: FUNCTION,
      StyleSheetList: FUNCTION,
      SubtleCrypto: FUNCTION,
      TEMPORARY: DEFAULT,
      Text: CTOR,
      TextDecoder: FUNCTION,
      TextEncoder: RAW,
      TextEvent: FUNCTION,
      TextMetrics: FUNCTION,
      TextTrack: FUNCTION,
      TextTrackCue: FUNCTION,
      TextTrackCueList: FUNCTION,
      TextTrackList: FUNCTION,
      TimeRanges: RAW,
      Touch: FUNCTION,
      TouchEvent: FUNCTION,
      TouchList: FUNCTION,
      TrackEvent: FUNCTION,
      TransitionEvent: FUNCTION,
      TreeWalker: FUNCTION,
      UIEvent: FUNCTION,
      // Replaced by SecureURL
      // "URL":                                  RAW,
      URLSearchParams: FUNCTION,
      VTTCue: FUNCTION,
      ValidityState: FUNCTION,
      WaveShaperNode: FUNCTION,
      WebGLActiveInfo: FUNCTION,
      WebGLBuffer: FUNCTION,
      WebGLContextEvent: FUNCTION,
      WebGLFramebuffer: FUNCTION,
      WebGLProgram: FUNCTION,
      WebGLRenderbuffer: FUNCTION,
      WebGLRenderingContext: FUNCTION,
      WebGLShader: FUNCTION,
      WebGLShaderPrecisionFormat: FUNCTION,
      WebGLTexture: FUNCTION,
      WebGLUniformLocation: FUNCTION,
      WebKitAnimationEvent: FUNCTION,
      WebKitCSSMatrix: CTOR,
      WebKitTransitionEvent: FUNCTION,
      WebSocket: RAW,
      WheelEvent: FUNCTION,
      Window: FUNCTION,
      XMLDocument: FUNCTION,
      XMLHttpRequest: CTOR,
      XMLHttpRequestEventTarget: FUNCTION,
      XMLHttpRequestUpload: FUNCTION,
      XMLSerializer: CTOR,
      XPathEvaluator: FUNCTION,
      XPathExpression: FUNCTION,
      XPathResult: FUNCTION,
      XSLTProcessor: FUNCTION,
      alert: FUNCTION,
      atob: FUNCTION,
      blur: FUNCTION,
      btoa: FUNCTION,
      cancelAnimationFrame: FUNCTION,
      cancelIdleCallback: FUNCTION,
      captureEvents: FUNCTION,
      chrome: DEFAULT,
      clearInterval: FUNCTION,
      clearTimeout: FUNCTION,
      close: FUNCTION,
      closed: DEFAULT,
      confirm: FUNCTION,
      console: RAW,
      createImageBitmap: FUNCTION,
      crypto: DEFAULT,
      defaultStatus: DEFAULT,
      defaultstatus: DEFAULT,
      devicePixelRatio: DEFAULT,
      document: DEFAULT,
      fetch: FUNCTION,
      find: FUNCTION,
      focus: FUNCTION,
      frameElement: DEFAULT,
      frames: DEFAULT,
      getComputedStyle: FUNCTION,
      getMatchedCSSRules: FUNCTION,
      getSelection: FUNCTION,
      history: RAW,
      innerHeight: DEFAULT,
      innerWidth: DEFAULT,
      isSecureContext: DEFAULT,
      length: DEFAULT,
      localStorage: DEFAULT,
      locationbar: DEFAULT,
      matchMedia: FUNCTION,
      menubar: DEFAULT,
      moveBy: FUNCTION,
      moveTo: FUNCTION,
      name: DEFAULT,
      navigator: DEFAULT,
      offscreenBuffering: DEFAULT,
      onabort: EVENT,
      onanimationend: EVENT,
      onanimationiteration: EVENT,
      onanimationstart: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onbeforeunload: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondevicemotion: EVENT,
      ondeviceorientation: EVENT,
      ondeviceorientationabsolute: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      onhashchange: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onlanguagechange: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmessage: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onoffline: EVENT,
      ononline: EVENT,
      onpagehide: EVENT,
      onpageshow: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onpopstate: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onrejectionhandled: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onsearch: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onstorage: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontransitionend: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onunhandledrejection: EVENT,
      onunload: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      onwheel: EVENT,
      open: FUNCTION,
      outerHeight: DEFAULT,
      outerWidth: DEFAULT,
      pageStartTime: DEFAULT,
      pageXOffset: DEFAULT,
      pageYOffset: DEFAULT,
      parent: DEFAULT,
      performance: RAW,
      personalbar: DEFAULT,
      postMessage: FUNCTION,
      print: FUNCTION,
      prompt: FUNCTION,
      releaseEvents: FUNCTION,
      requestAnimationFrame: FUNCTION,
      requestIdleCallback: FUNCTION,
      resizeBy: FUNCTION,
      resizeTo: FUNCTION,
      screen: RAW,
      screenLeft: DEFAULT,
      screenTop: DEFAULT,
      screenX: DEFAULT,
      screenY: DEFAULT,
      scroll: FUNCTION,
      scrollBy: FUNCTION,
      scrollTo: FUNCTION,
      scrollX: DEFAULT,
      scrollY: DEFAULT,
      scrollbars: DEFAULT,
      sessionStorage: DEFAULT,
      self: DEFAULT,
      setInterval: FUNCTION,
      setTimeout: FUNCTION,
      status: DEFAULT,
      statusbar: DEFAULT,
      stop: FUNCTION,
      styleMedia: DEFAULT,
      toolbar: DEFAULT,
      top: DEFAULT,
      window: DEFAULT
    },
    EventTarget: metadata$4
  }
};

function SecureWindow(sandbox, key) {
  const { realmRec: { unsafeGlobal: win } } = sandbox;

  let o = getFromCache(win, key);
  if (o) {
    return o;
  }

  // Create prototype to allow basic object operations like hasOwnProperty etc
  const props = getOwnPropertyDescriptors(Object.prototype);
  // Do not treat window like a plain object, $A.util.isPlainObject() returns true if we leave the constructor intact.
  delete props.constructor;
  const emptyProto = create$1(null, props);

  freeze(emptyProto);

  o = create$1(emptyProto, {
    document: {
      enumerable: true,
      value: SecureDocument(win.document, key)
    },
    window: {
      enumerable: true,
      get: function() {
        return o;
      }
    },
    MutationObserver: {
      enumerable: true,
      value: SecureMutationObserver(key)
    },
    navigator: {
      enumerable: true,
      writable: true,
      value: SecureNavigator(win.navigator, key)
    },
    XMLHttpRequest: {
      enumerable: true,
      value: SecureXMLHttpRequest(key)
    },
    setTimeout: {
      enumerable: true,
      value: function(callback) {
        return setTimeout.apply(win, [FunctionBind(callback, o)].concat(ArraySlice(arguments, 1)));
      }
    },
    setInterval: {
      enumerable: true,
      value: function(callback) {
        return setInterval.apply(win, [FunctionBind(callback, o)].concat(ArraySlice(arguments, 1)));
      }
    },
    location: {
      enumerable: true,
      get: function() {
        return SecureLocation(win.location, key);
      },
      set: function(value) {
        const ret = (win.location.href = value);
        return ret;
      }
    },
    URL: {
      enumerable: true,
      value: SecureURL(win.URL)
    },
    toString: {
      value: function() {
        return `SecureWindow: ${win}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  addMethodIfSupported(o, win, 'getComputedStyle', {
    rawArguments: true
  });

  ['outerHeight', 'outerWidth'].forEach(name => addPropertyIfSupported(o, win, name));

  ['scroll', 'scrollBy', 'scrollTo'].forEach(name => addMethodIfSupported(o, win, name));

  defineProperty(o, 'open', {
    enumerable: true,
    writable: true,
    value(href, ...args) {
      href = sanitizeURLForElement(href);
      if (!isValidURLScheme(href)) {
        throw new error(getSupportedSchemesErrorMessage('open', 'SecureWindow'));
      }

      if (confirmLocationChange(win.location.href, href)) {
        const filteredArgs = filterArguments(o, [href, ...args]);
        const res = win.open(...filteredArgs);
        return filter(key, res);
      }
      // window.open spec expects a null return value if the operation fails
      return null;
    }
  });

  if ('localStorage' in win) {
    defineProperty(o, 'localStorage', {
      enumerable: true,
      value: SecureStorage(win.localStorage, 'LOCAL', key)
    });
  }
  if ('sessionStorage' in win) {
    defineProperty(o, 'sessionStorage', {
      enumerable: true,
      value: SecureStorage(win.sessionStorage, 'SESSION', key)
    });
  }

  if ('FormData' in win) {
    let formDataValueOverride;
    defineProperty(o, 'FormData', {
      get: function() {
        return (
          formDataValueOverride ||
          function() {
            const args = ArraySlice(arguments);
            // make sure we have access to any <form> passed in to constructor
            let form;
            if (args.length > 0) {
              form = args[0];
              verifyAccess(o, form);
            }

            const rawArgs = form ? [getRef(form, getKey(form))] : [];
            const cls = win['FormData'];
            if (typeof cls === 'function') {
              return new (Function.prototype.bind.apply(
                window['FormData'],
                [null].concat(rawArgs)
              ))();
            }
            return new cls(rawArgs);
          }
        );
      },
      set: function(value) {
        formDataValueOverride = value;
      }
    });
  }

  if ('Notification' in win) {
    let notificationValueOverride;
    defineProperty(o, 'Notification', {
      get: function() {
        if (notificationValueOverride) {
          return notificationValueOverride;
        }
        const notification = SecureNotification(key);
        if ('requestPermission' in win['Notification']) {
          defineProperty(notification, 'requestPermission', {
            enumerable: true,
            value: function(callback) {
              return Notification['requestPermission'](callback);
            }
          });
        }
        if ('permission' in win['Notification']) {
          defineProperty(notification, 'permission', {
            enumerable: true,
            value: Notification['permission']
          });
        }
        return notification;
      },
      set: function(value) {
        notificationValueOverride = value;
      }
    });
  }

  if ('Blob' in win) {
    defineProperty(o, 'Blob', {
      enumerable: true,
      value: SecureBlob
    });
  }

  if ('File' in win) {
    defineProperty(o, 'File', {
      enumerable: true,
      value: SecureFile
    });
  }

  if ('MediaSource' in win) {
    defineProperty(o, 'MediaSource', {
      enumerable: true,
      value: SecureMediaSource(key)
    });
  }

  if ('CustomEvent' in win) {
    defineProperty(o, 'CustomEvent', {
      enumerable: true,
      value: SecureCustomEventFactory(win['CustomEvent'], key)
    });
  }

  addEventTargetMethods(o, win, key);

  // Has to happen last because it depends on the secure getters defined above that require the object to be keyed
  stdlib.forEach(
    // These are direct passthrough's and should never be wrapped in a SecureObject
    // They are non-writable to make them compatible with the evaluator.
    name =>
      defineProperty(o, name, {
        enumerable: true,
        value: win[name]
      })
  );

  if (addPropertiesHook) {
    addPropertiesHook(o, win, key);
  }

  addPrototypeMethodsAndProperties(metadata$$1, o, win, key);

  setRef(o, win, key);
  addToCache(win, o, key);
  registerProxy(o);

  return o;
}

function SecureRTCPeerConnection(raw, key) {
  const SecureConstructor = function(configuration) {
    const rtc = new raw(configuration);
    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureRTCPeerConnection: ${rtc}{ key: ${JSON.stringify(key)} }`;
        }
      }
    });
    setRef(o, rtc, key);
    // Reference to the original event target functions
    const originalAddEventListener = rtc['addEventListener'];
    const originalDispatchEvent = rtc['dispatchEvent'];
    const originalRemoveEventListener = rtc['removeEventListener'];
    const options = { rawArguments: true };
    // Override the event target functions to handled wrapped arguments
    defineProperties(rtc, {
      addEventListener: {
        writable: true,
        value: function(event, callback, useCapture) {
          if (!callback) {
            return;
          }
          let sCallback = getFromCache(callback, key);
          if (!sCallback) {
            sCallback = function(e) {
              verifyAccess(o, callback, true);
              const se = e && SecureDOMEvent(e, key);
              callback.call(o, se);
            };
            addToCache(callback, sCallback, key);
            setKey(callback, key);
          }
          originalAddEventListener.call(rtc, event, sCallback, useCapture);
        }
      },
      dispatchEvent: {
        enumerable: true,
        writable: true,
        value: function() {
          const filteredArgs = filterArguments(o, arguments, options);
          let fnReturnedValue = originalDispatchEvent.apply(rtc, filteredArgs);
          if (options && options.afterCallback) {
            fnReturnedValue = options.afterCallback(fnReturnedValue);
          }
          return filterEverything(o, fnReturnedValue, options);
        }
      },
      removeEventListener: {
        writable: true,
        value: function(type, listener, removeOption) {
          const sCallback = getFromCache(listener, key);
          originalRemoveEventListener.call(rtc, type, sCallback, removeOption);
        }
      }
    });
    return rtc;
  };
  SecureConstructor.prototype = raw.prototype;
  return SecureConstructor;
}

// TODO: unused

const metadata$7 = {
  prototypes: {
    ShadowRoot: {
      childNodes: READ_ONLY_PROPERTY,
      compareDocumentPosition: FUNCTION_RAW_ARGS,
      contains: FUNCTION_RAW_ARGS,
      delegatesFocus: READ_ONLY_PROPERTY,
      firstChild: READ_ONLY_PROPERTY,
      mode: READ_ONLY_PROPERTY,
      hasChildNodes: FUNCTION,
      host: READ_ONLY_PROPERTY,
      innerHTML: READ_ONLY_PROPERTY,
      lastChild: READ_ONLY_PROPERTY,
      textContent: READ_ONLY_PROPERTY
    },
    ARIA: {
      ariaAutoComplete: DEFAULT,
      ariaChecked: DEFAULT,
      ariaCurrent: DEFAULT,
      ariaDisabled: DEFAULT,
      ariaExpanded: DEFAULT,
      ariaHasPopUp: DEFAULT,
      ariaHidden: DEFAULT,
      ariaInvalid: DEFAULT,
      ariaLabel: DEFAULT,
      ariaLevel: DEFAULT,
      ariaMultiLine: DEFAULT,
      ariaMultiSelectable: DEFAULT,
      ariaOrientation: DEFAULT,
      ariaPressed: DEFAULT,
      ariaReadOnly: DEFAULT,
      ariaRequired: DEFAULT,
      ariaSelected: DEFAULT,
      ariaSort: DEFAULT,
      ariaValueMax: DEFAULT,
      ariaValueMin: DEFAULT,
      ariaValueNow: DEFAULT,
      ariaValueText: DEFAULT,
      ariaLive: DEFAULT,
      ariaRelevant: DEFAULT,
      ariaAtomic: DEFAULT,
      ariaBusy: DEFAULT,
      ariaActiveDescendant: DEFAULT,
      ariaControls: DEFAULT,
      ariaDescribedBy: DEFAULT,
      ariaFlowTo: DEFAULT,
      ariaLabelledBy: DEFAULT,
      ariaOwns: DEFAULT,
      ariaPosInSet: DEFAULT,
      ariaSetSize: DEFAULT,
      ariaColCount: DEFAULT,
      ariaColIndex: DEFAULT,
      ariaDetails: DEFAULT,
      ariaErrorMessage: DEFAULT,
      ariaKeyShortcuts: DEFAULT,
      ariaModal: DEFAULT,
      ariaPlaceholder: DEFAULT,
      ariaRoleDescription: DEFAULT,
      ariaRowCount: DEFAULT,
      ariaRowIndex: DEFAULT,
      ariaRowSpan: DEFAULT,
      role: DEFAULT
    }
  }
};

// 1 wrapped template per key, 1 per key to isolate the prototype
const WRAPPED_TEMPLATE_BY_KEY = new Map();

function getWrappedTemplatePrototype() {
  const wrappedTemplatePrototype = create$1(getObjectLikeProto(), {
    toString: {
      value: function() {
        const template = getRawThis(this);
        return `SecureTemplate: ${template}{ key: ${JSON.stringify(getKey(this))} }`;
      }
    },
    querySelector: {
      value: function(selector) {
        const template = getRawThis(this);
        const node = template.querySelector(selector);
        return filterEverything(this, node);
      }
    },
    querySelectorAll: {
      value: function(selector) {
        const template = getRawThis(this);
        const rawNodeList = template.querySelectorAll(selector);
        return filterEverything(this, rawNodeList);
      }
    }
  });

  // define addEventListener and removeEventListener. dispatchEvent is not supported on template
  defineProperties(wrappedTemplatePrototype, {
    addEventListener: createAddEventListenerDescriptorStateless(),
    // TODO: RJ - This is a copy/paste of pieces of SecureEventTarget.addEventTargetMethodsStateless
    // It should be refactored into a reusable function. Separate PR for that to minimize change
    removeEventListener: {
      writable: true,
      value: function(type, listener, options) {
        const raw = getRawThis(this);
        const sCallback = getFromCache(listener, getKey(this));
        raw.removeEventListener(type, sCallback, options);
      }
    }
  });

  // When the native ShadowRoot is used by LWC, then switch this over to addPrototypeMethodsAndPropertiesStateless
  const prototypes = metadata$7['prototypes'];
  const supportedInterfaces = ['ShadowRoot', 'ARIA'];
  supportedInterfaces.forEach(name => {
    const prototype = prototypes[name];
    for (const property in prototype) {
      if (!wrappedTemplatePrototype.hasOwnProperty(property)) {
        defineProperty(
          wrappedTemplatePrototype,
          property,
          createFilteredPropertyStateless(property, wrappedTemplatePrototype, prototype[property])
        );
      }
    }
  });

  freeze(wrappedTemplatePrototype);
  return wrappedTemplatePrototype;
}

function SecureTemplate(template, key) {
  assert$1.invariant(isObject(key), 'Cannot invoke SecureTemplate wrapper without a valid key');
  assert$1.invariant(isObject(template), 'Expected template to be an object');

  let o = getFromCache(template, key);
  if (o) {
    return o;
  }

  assert$1.invariant(WRAPPED_TEMPLATE_BY_KEY, 'Expected to recive a map for caching prototypes');
  let wrappedTemplatePrototype = WRAPPED_TEMPLATE_BY_KEY.get(key);

  if (!wrappedTemplatePrototype) {
    wrappedTemplatePrototype = getWrappedTemplatePrototype();
    WRAPPED_TEMPLATE_BY_KEY.set(key, wrappedTemplatePrototype);
  }

  o = create$1(wrappedTemplatePrototype);

  setRef(o, template, key);
  addToCache(template, o, key);
  registerProxy(o);

  return o;
}

/**
 * Unwrap a value to allow raw access in system mode
 * This method returns:
 *  a. an unfiltering proxy if the indexed value is a plain object or array
 *  b. an unwrapped value if the value represents a secure wrapped object
 *  c. a SecureFunction is the value represents a function
 *  d. Everything else will be filtered
 */
function unwrapValue(st, value) {
  if (!value) {
    return value;
  }
  let unfilteredValue;
  if (isArray(value) || isPlainObject(value)) {
    // If an object or array is nested inside a data proxy, they will need to be rewrapped
    // FilteringProxy and ArrayProxy is covered by this check
    unfilteredValue = getUnfilteringDataProxy(getKey(st), value);
  } else if (typeof value === 'function') {
    // Functions from sandbox cannot be handed over to system, they will be converted to a SecureFunction
    const secureFunction = filterEverything(st, value);
    // If function does not need to be converted, return the function as is. Eg: Object, Array
    if (secureFunction === value) {
      return value;
    }
    // Return a wrapper function to system mode.
    unfilteredValue = function(...args) {
      // When system mode invokes the wrapper function, locker will invoke the secure function
      // This ensures arguments from system mode are filtered, return value is unwrapped and
      // sent back to system mode
      return unwrapValue(st, secureFunction.call(st, ...args));
    };
  } else if (isProxy(value)) {
    // If value is a wrapped object, use st's key to unwrap the value.
    unfilteredValue = unwrap$1(st, value);
  } else {
    // Protect anything else that we don't know about.
    // Call lwcUnwrap to catch things like SecureWindow that can be wrapped in a data proxy
    unfilteredValue = filterEverything(st, lwcUnwrap(value));
  }
  return unfilteredValue;
}

/**
 * An unwrapDescriptor will be give to system mode
 * Any access of value will need to be unwrapped
 * Any mutation of value will need to be filtered
 * @param {*} st secure thing that owns the descriptor
 * @param {*} descriptor
 */
function getUnwrapDescriptor(st, descriptor) {
  if (!descriptor) {
    return descriptor;
  }
  // If data descriptor
  if ('value' in descriptor) {
    const { value } = descriptor;

    if (typeof value === 'function') {
      descriptor.value = function(...args) {
        return unwrapValue(st, value.call(st, filterArguments(st, args)));
      };
    } else {
      descriptor.value = unwrapValue(st, value);
    }
  } else {
    const { get: get$$1, set: set$$1 } = descriptor;
    // accessor descriptor
    if (get$$1) {
      descriptor.get = function() {
        return unwrapValue(st, get$$1.call(st));
      };
    }
    if (set$$1) {
      descriptor.set = function(newValue) {
        return set$$1.call(st, filterEverything(st, newValue));
      };
    }
  }
  return descriptor;
}

/**
 * Class to handle the unfiltering of any read/write operations on an array
 * Behavior:
 *  1. Reading values by index will provide:
 *    a. an unfiltering proxy if the indexed value is a plain object or array
 *    b. an unwrapped value if the value represents a secure wrapped object
 *    c. a SecureFunction is the value represents a function
 *    d. Everything else will be filtered
 *  2. Settings value by index will filter the provided value with the real target's key
 *    and set the filtered value on the real target
 *  3. Accessing descriptor will result in a unwrapping descriptor
 *  4. Setting a prototype of the value is not allowed
 *
 * Caveat: A shadow target is required to adhere to proxy invariants. The shadow target prevents
 * from leaking prototype information of the real target. One common scenario is when a target has
 * a non-configurable property descriptor, the getOwnPropertyDescriptor() has the return the original
 * descriptor of the target. In such a case, not using a shadowTarget will result is leaking the
 * descriptor locker wants to protect.
 */
/* eslint-disable  class-methods-use-this */
class UnfilteringProxyHandlerForArray {
  constructor(target) {
    this.target = target;
  }
  get(shadowTarget, property) {
    const target = this.target;
    property = convertSymbol(property);
    const value = target[property];

    const coercedProperty = Number(property);
    // If the property is 0 or a positive integer
    if (
      !Number.isNaN(coercedProperty) &&
      Number.isInteger(coercedProperty) &&
      coercedProperty >= 0
    ) {
      return unwrapValue(target, value);
    }
    return target[property];
  }
  set(shadowTarget, property, value) {
    const target = this.target;
    target[property] = filterEverything(target, value);
    return true;
  }
  deleteProperty(shadowTarget, property) {
    deleteProperty(this.target, property);
    return true;
  }
  has(shadowTarget, property) {
    return property in this.target;
  }
  ownKeys() {
    return ownKeys(this.target);
  }
  isExtensible() {
    return isExtensible(this.target);
  }
  setPrototypeOf() {
    throw new error('System mode should not attempt to change prototype of data proxy');
  }
  getPrototypeOf() {
    return getPrototypeOf(this.target);
  }
  getOwnPropertyDescriptor(shadowTarget, property) {
    // If it is a non-configurable descriptor and its already defined on the shadowTarget
    const shadowTargetDescriptor = getOwnPropertyDescriptor(shadowTarget, property);
    if (shadowTargetDescriptor && !shadowTargetDescriptor.configurable) {
      return shadowTargetDescriptor;
    }

    const target = this.target;
    const originalDescriptor = getOwnPropertyDescriptor(target, property);
    if (!originalDescriptor) {
      return originalDescriptor;
    }
    if (property === 'length') {
      return originalDescriptor;
    }
    // Wrap the descriptor
    const unwrapDescriptor = getUnwrapDescriptor(target, originalDescriptor);
    // To adhere to proxy invariants, if the original descriptor is non-configurable,
    // define a non-configurable unwrap descriptor on the shadow target
    if (!originalDescriptor.configurable) {
      defineProperty(shadowTarget, property, unwrapDescriptor);
    }
    return unwrapDescriptor;
  }
  preventExtensions() {
    return preventExtensions(this.target);
  }
  defineProperty(shadowTarget, key, descriptor) {
    return defineProperty(this.target, key, descriptor);
  }
}
/* eslint-enable  class-methods-use-this */

/**
 * Class to handle the unfiltering of any read/write operations on a plain old javascript object(pojo)
 * Behavior:
 *  1. Accessing object property value will provide:
 *    a. an unfiltering proxy if the value is a plain object or array
 *    b. an unwrapped value if the value represents a secure wrapped object
 *    c. a SecureFunction is the value represents a function
 *    d. Everything else will be filtered
 *  2. Settings value for a property will
 *    a. filter the provided value with the real target's key
 *    b. set the filtered value on the real target
 *  3. Accessing descriptor will result in a unwrapping descriptor
 *  4. Setting a prototype of the value is not allowed
 *
 * Caveat: A shadow target is required to adhere to proxy invariants. The shadow target prevents
 * from leaking prototype information of the real target. One common scenario is when a target has
 * a non-configurable property descriptor, the getOwnPropertyDescriptor() has the return the original
 * descriptor of the target. In such a case, not using a shadowTarget will result is leaking the
 * descriptor locker wants to protect.
 */
/* eslint-disable  class-methods-use-this */
class UnfilteringProxyHandlerForObject {
  constructor(target) {
    this.target = target;
  }
  get(shadowTarget, property) {
    const target = this.target;
    const value = target[property];
    return unwrapValue(target, value);
  }
  set(shadowTarget, property, value) {
    const target = this.target;
    target[property] = filterEverything(target, value);
    return true;
  }
  deleteProperty(shadowTarget, property) {
    deleteProperty(this.target, property);
    return true;
  }
  has(shadowTarget, property) {
    return property in this.target;
  }
  ownKeys() {
    return ownKeys(this.target);
  }
  isExtensible() {
    return isExtensible(this.target);
  }
  setPrototypeOf() {
    throw new error('System mode should not attempt to change prototype of data proxy');
  }
  getPrototypeOf() {
    return getPrototypeOf(this.target);
  }
  getOwnPropertyDescriptor(shadowTarget, property) {
    // If it is a non-configurable descriptor and its already defined on the shadowTarget
    const shadowTargetDescriptor = getOwnPropertyDescriptor(shadowTarget, property);
    if (shadowTargetDescriptor && !shadowTargetDescriptor.configurable) {
      return shadowTargetDescriptor;
    }

    const target = this.target;
    const originalDescriptor = getOwnPropertyDescriptor(target, property);
    if (!originalDescriptor) {
      return originalDescriptor;
    }
    // Wrap the descriptor
    const unwrapDescriptor = getUnwrapDescriptor(target, originalDescriptor);
    // To adhere to proxy invariants
    if (!originalDescriptor.configurable) {
      defineProperty(shadowTarget, property, unwrapDescriptor);
    }
    return unwrapDescriptor;
  }
  preventExtensions() {
    return preventExtensions(this.target);
  }
  defineProperty(shadowTarget, key, descriptor) {
    return defineProperty(this.target, key, descriptor);
  }
}
/* eslint-enable  class-methods-use-this */

const cachedUnfilteringProxy = new WeakMap();
const proxyToValueMap = new WeakMap();

function registerUnfilteringDataProxy(proxy, value) {
  proxyToValueMap.set(proxy, value);
}

function isUnfilteringDataProxy(proxy) {
  return proxyToValueMap.has(proxy);
}

function getDataProxy(proxy) {
  return proxyToValueMap.get(proxy);
}

/**
 * Provide a unfiltering proxy for a value that can be used in system mode
 * The value originates from a sandbox owned by the secure thing
 * @param {*} fromKey locker key of the secure thing that wants to send value to system mode
 * @param {*} value value being unwrapped
 */
function getUnfilteringDataProxy(fromKey, value) {
  if (!value) {
    return value;
  }
  assert$1.invariant(fromKey, 'Trying to unfilter a value without a key');

  // Handle only plain objects or arrays that were created by the secure thing
  if (!isArray(value) && !isPlainObject(value)) {
    // Throw in non-production mode
    assert$1.fail('Attempting to unfilter a value that is neither an array nor a plain object');
    // Do nothing in production mode
    return value;
  }

  let unfilteringProxy = cachedUnfilteringProxy.get(value);
  if (unfilteringProxy) {
    return unfilteringProxy;
  }

  if (!getKey(value)) {
    // If value has not already been keyed, propagate the key to the value
    setKey(value, fromKey);
  }

  // Use a shadow target to avoid breaking proxy invariants
  const shadowTarget = isArray(value) ? [] : {};

  unfilteringProxy = new Proxy(
    shadowTarget,
    isArray(value)
      ? new UnfilteringProxyHandlerForArray(value)
      : new UnfilteringProxyHandlerForObject(value)
  );
  // Key the unfilteringProxy to the secure thing's namespace
  setKey(unfilteringProxy, fromKey);
  cachedUnfilteringProxy.set(value, unfilteringProxy);
  registerUnfilteringDataProxy(unfilteringProxy, value);
  return unfilteringProxy;
}

/**
 * this should return a secure value
 * @param {*} cmp component instance who is accessing the value
 * @param {*} rawValue unwrapped value
 */
function getFilteredValue(cmp, rawValue) {
  return filterEverything(cmp, rawValue);
}

/**
 * This method accept a value from a lockerized component and provides system mode with raw access.
 * All public properties and methods of an LWC custom element get proccessed by this method.
 * 1. If the value returned is a data proxy(@api, @track) that is its own,
 *    we create an unfiltering proxy and return that
 * 2. if the value returned is a data proxy that it received from another component,
 *    we return the unfiltering proxy underneath the wrapped value
 * 3. If the value returned is a plain object or array, return a deep copy with unwrapped values
 * 4. If the value is a distorted value from system mode, unwrap it
 * @param {*} cmp component
 * @param {*} filteredValue wrapped value
 */
function getUnwrappedValue(cmp, filteredValue) {
  if (filteredValue) {
    // If the value being returned by the component is a data proxy
    // Early escape hatch for data proxy. Because the data proxy behaves like a plain object/array,
    // locker needs to act early and unwrap it in the right shape.
    // deepUnfilterMethodArguments() works fine for simple arrays/objects, but looses the data proxy behavior
    if (isDataProxy(filteredValue)) {
      // If the data proxy was received from a different locker
      if (isProxy(filteredValue)) {
        // Unwrap the filtering proxy
        return unwrap$1(cmp, filteredValue);
      }
      return getUnfilteringDataProxy(getKey(cmp), filteredValue);
    } else if (isArray(filteredValue)) {
      // If the value is a plain array that belongs to this locker
      return deepUnfilterMethodArguments(cmp, [], filteredValue);
    } else if (isPlainObject(filteredValue)) {
      // If the value is a plain object that belongs to this locker
      return deepUnfilterMethodArguments(cmp, {}, filteredValue);
    } else if (getKey(filteredValue)) {
      return unwrap$1(cmp, filteredValue);
    }
  }
  return filteredValue;
}

const LightningElementPropDescriptorMap = {};
function getRawPropertyDescriptor(LightningElementPrototype, propName) {
  let descriptor = LightningElementPropDescriptorMap[propName];
  if (descriptor) {
    return descriptor;
  }
  descriptor = LightningElementPropDescriptorMap[propName] = getOwnPropertyDescriptor(
    LightningElementPrototype,
    propName
  );
  return descriptor;
}

// Hooks to be used by LWC
function generateInstanceHooks(st) {
  return {
    callHook: function(cmp, fn, args) {
      if (isArray(args)) {
        args = args.map(rawValue => getFilteredValue(st, rawValue));
      }
      const filteredResult = fn.apply(st, args);
      return getUnwrappedValue(st, filteredResult);
    },
    setHook: function(cmp, prop, rawValue) {
      st[prop] = getFilteredValue(st, rawValue);
    },
    getHook: function(cmp, prop) {
      return getUnwrappedValue(st, st[prop]);
    }
  };
}
// End of hooks

const lwcElementProtoPropNames = [
  // Global Properties:
  'dir',
  'id',
  'accessKey',
  'title',
  'lang',
  'hidden',
  'draggable',
  'tabIndex',
  // ARIA Attributes:
  'ariaAutoComplete',
  'ariaChecked',
  'ariaCurrent',
  'ariaDisabled',
  'ariaExpanded',
  'ariaHasPopUp',
  'ariaHidden',
  'ariaInvalid',
  'ariaLabel',
  'ariaLevel',
  'ariaMultiLine',
  'ariaMultiSelectable',
  'ariaOrientation',
  'ariaPressed',
  'ariaReadOnly',
  'ariaRequired',
  'ariaSelected',
  'ariaSort',
  'ariaValueMax',
  'ariaValueMin',
  'ariaValueNow',
  'ariaValueText',
  'ariaLive',
  'ariaRelevant',
  'ariaAtomic',
  'ariaBusy',
  'ariaActiveDescendant',
  'ariaControls',
  'ariaDescribedBy',
  'ariaFlowTo',
  'ariaLabelledBy',
  'ariaOwns',
  'ariaPosInSet',
  'ariaSetSize',
  'ariaColCount',
  'ariaColIndex',
  'ariaDetails',
  'ariaErrorMessage',
  'ariaKeyShortcuts',
  'ariaModal',
  'ariaPlaceholder',
  'ariaRoleDescription',
  'ariaRowCount',
  'ariaRowIndex',
  'ariaRowSpan',
  'role',
  // Lightning component properties
  'accessKeyLabel',
  'addEventListener',
  'classList',
  'className',
  'contentEditable',
  'contextMenu',
  'dataset',
  'dispatchEvent',
  'dropzone',
  'getAttribute',
  'getAttributeNS',
  'getBoundingClientRect',
  'isContentEditable',
  'itemScope',
  'itemType',
  'itemId',
  'itemRef',
  'itemProp',
  'itemValue',
  'offsetHeight',
  'offsetLeft',
  'offsetParent',
  'offsetTop',
  'offsetWidth',
  'properties',
  'querySelector',
  'querySelectorAll',
  'removeAttributeNS',
  'removeAttribute',
  'removeEventListener',
  'render',
  // 'root', (Deprecated, previous name for template)
  'setAttribute',
  'setAttributeNS',
  // 'shadowRoot', (TODO W-5527917)
  // 'slot', (experimental property, not supported by all browsers https://developer.mozilla.org/en-US/docs/Web/API/Element/slot, LWC throws error on access)
  'spellcheck',
  'style',
  'template',
  'toString',
  'translate'
];

function SecureLightningElementFactory(LightningElement, key) {
  let o = getFromCache(LightningElement, key);
  if (o) {
    return o;
  }
  o = SecureLightningElementFactory.getWrappedLightningElement(LightningElement, key);

  setRef(o, LightningElement, key);
  addToCache(LightningElement, o, key);
  freeze(o);
  return o;
}

SecureLightningElementFactory.getWrappedLightningElement = function(LightningElement, lockerKey) {
  function getWrappedDescriptor(rawDescriptor) {
    const { value, get: get$$1, set: set$$1, enumerable, configurable, writable } = rawDescriptor;
    function wrappedMethod() {
      const args = filterArguments(this, arguments, { rawArguments: true });
      const rawResult = value.apply(this, args);
      return getFilteredValue(this, rawResult);
    }
    if (rawDescriptor.hasOwnProperty('value')) {
      // Wrap if value is a function
      if (typeof value === 'function') {
        return {
          value: wrappedMethod,
          enumerable,
          writable,
          configurable
        };
      }
      // else return a getter descriptor for static values
      return {
        get() {
          return getFilteredValue(this, value);
        },
        writable,
        enumerable,
        configurable
      };
    }
    // getter and setter
    return {
      get() {
        return getFilteredValue(this, get$$1.call(this));
      },
      set(filteredValue) {
        if (set$$1) {
          set$$1.call(this, getUnwrappedValue(this, filteredValue));
        }
      },
      enumerable,
      configurable
    };
  }

  function SecureLightningElement() {
    if (this instanceof SecureLightningElement) {
      LightningElement.prototype.constructor.call(this, generateInstanceHooks(this));

      /**
       *  `this` represents the user mode instance. No need to wrap this object or protect it
       * `pseudoInstance` is used as an instance we are trying to protect.
       * If this instance ever crosses from one locker to another, a filtering proxy will be placed
       * around this and there is no risk of leaking.
       */
      const pseudoInstance = create$1(null, {
        toString: {
          value: function() {
            return LightningElement.prototype.toString.call(this);
          }
        }
      });
      freeze(pseudoInstance);
      setRef(this, pseudoInstance, lockerKey);
      registerProxy(this);
    } else {
      return SecureLightningElement;
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  SecureLightningElement.__circular__ = true;
  const SecureLElementPrototype = (SecureLightningElement.prototype = getObjectLikeProto());
  const LElementPrototype = LightningElement.prototype;

  // Special properties
  defineProperties(SecureLElementPrototype, {
    toString: {
      value: function() {
        return `SecureLightningElement ${LElementPrototype.toString.call(
          this
        )}{ key: ${JSON.stringify(lockerKey)} }`;
      }
    },
    template: {
      enumerable: true,
      get: function() {
        const { get: get$$1 } = getRawPropertyDescriptor(LElementPrototype, 'template');
        const rawValue = get$$1.call(this);
        return SecureTemplate(rawValue, lockerKey);
      }
    },
    querySelector: {
      enumerable: true,
      value: function(selector) {
        const { value } = getRawPropertyDescriptor(LElementPrototype, 'querySelector');
        const node = value.call(this, selector);
        return getFilteredValue(this, node);
      }
    },
    querySelectorAll: {
      enumerable: true,
      value: function(selector) {
        const { value } = getRawPropertyDescriptor(LElementPrototype, 'querySelector');
        const rawNodeList = value.call(this, selector);
        return getFilteredValue(this, rawNodeList);
      }
    }
  });

  lwcElementProtoPropNames.forEach(propName => {
    if (
      !SecureLElementPrototype.hasOwnProperty(propName) &&
      LElementPrototype.hasOwnProperty(propName)
    ) {
      const originalDescriptor = getRawPropertyDescriptor(LElementPrototype, propName);
      const wrappedDescriptor = getWrappedDescriptor(originalDescriptor);
      defineProperty(SecureLElementPrototype, propName, wrappedDescriptor);
    }
  });
  freeze(SecureLightningElement);
  freeze(SecureLElementPrototype);

  return SecureLightningElement;
};

function SecureLWC(lwc, key) {
  let o = getFromCache(lwc, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    LightningElement: {
      enumerable: true,
      value: SecureLightningElementFactory(lwc['LightningElement'], key)
    },
    readonly: {
      enumerable: true,
      value: obj => lwc['readonly'](obj)
    },
    // *** start EXCEPTION: 'registerTemplate', 'registerComponent', 'registerDecorators' are not secure
    // methods and cannot be exposed to the user. By extension, SecureLWC also cannot be exposed to the user.
    registerTemplate: {
      enumerable: true,
      value: lwc['registerTemplate']
    },
    /**
     * registerComponent() accepts a Component class and returns the same back.
     * It is important for the engine to register the Component class without distortions
     * (identity of what the user provided component class has to be the same as what engine gets)
     */
    registerComponent: {
      enumerable: true,
      value: lwc['registerComponent']
    },
    /**
     * registerDecorators() accepts a Component class and its decorator metadata.
     * The method processes the component metadata and decorates the class to handle the decorator properties
     */
    registerDecorators: {
      enumerable: true,
      value: lwc['registerDecorators']
    }
    // *** end EXCEPTION
  });
  freeze(o);

  setRef(o, lwc, key);
  addToCache(lwc, o, key);

  return o;
}

function doFreeze(obj) {
  if (!isPrimitive(obj)) {
    freeze(obj);
  }
}

/**
 * Shallow freeze to prevent tampering of [value, get, set] objects!
 */
function shallowFreeze(obj) {
  if (isPrimitive(obj)) {
    return;
  }

  doFreeze(obj);

  const descs = getOwnPropertyDescriptors(obj);
  for (const key in descs) {
    const desc = getOwnPropertyDescriptor(obj, key);
    if ('value' in desc) {
      doFreeze(desc.value);
    } else {
      const { get: get$$1, set: set$$1 } = desc;
      if (get$$1) doFreeze(get$$1);
      if (set$$1) doFreeze(set$$1);
    }
  }

  // NOTE: Using the descriptor to evade invoking any accessor named 'prototype'
  const prototype = descs.prototype && descs.prototype.value;
  for (const key in prototype) {
    const desc = getOwnPropertyDescriptor(prototype, key);
    if ('value' in desc) {
      doFreeze(desc.value);
    } else {
      const { get: get$$1, set: set$$1 } = desc;
      if (get$$1) doFreeze(get$$1);
      if (set$$1) doFreeze(set$$1);
    }
  }
}

// This is a whitelist from Kevin V, this has to be updated if any new wire adapters are introduced
const internalLibs = [
  'lightning/navigation',
  'lightning/uiActionsApi',
  'lightning/uiListApi',
  'lightning/uiLookupsApi',
  'lightning/uiObjectInfoApi',
  'lightning/uiRecordApi'
];
function isWhitelistedLib(libDesc) {
  return internalLibs.includes(libDesc);
}

const frozenLibRegistry = new WeakSet();

/**
 * Create a wrapped library
 * @param {Object} lib Library being imported
 * @param {Object} key Locker key of the module importing the library
 * @param {Boolean} requireLocker Should the library being imported be lockeried
 */
function SecureLib(lib, key, requireLocker, desc) {
  if (isPrimitive(lib)) {
    return lib;
  }

  if (isWhitelistedLib(desc)) {
    if (!frozenLibRegistry.has(lib)) {
      shallowFreeze(lib);
      frozenLibRegistry.add(lib);
    }
    return lib;
  }

  let o = getFromCache(lib, key);
  if (o) {
    return o;
  }

  if (typeof lib === 'function') {
    return lib;
  }

  assert$1.invariant(isPlainObject(lib), 'Expect lib to be a plain object');
  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureLib: ${lib}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  ObjectEntries(lib).forEach(([property, item]) => {
    if (isPrimitive(item)) {
      o[property] = item;
    } else if (typeof item === 'function') {
      if (item.prototype instanceof Event) {
        // only Platform events created in non-lockerized libs will be caught by this condition
        // TODO: add support for importing lockerized libs that expose events
        const secureEventCtorDescriptor = createFilteredConstructor(
          o,
          lib,
          property,
          SecureCustomEventFactory,
          key
        );
        defineProperty(o, property, secureEventCtorDescriptor);
      } else {
        o[property] = SecureFunction(item, requireLocker ? defaultKey : systemKey, key);
      }
    } else if (typeof item === 'object') {
      o[property] = SecureFunction(item, requireLocker ? defaultKey : systemKey, key);
    } else {
      addPropertyIfSupported(o, lib, property);
    }
  });

  setRef(o, lib, key);
  addToCache(lib, o, key);
  registerProxy(o);

  return seal(o);
}

function SecureAura(AuraInstance, key) {
  let o = getFromCache(AuraInstance, key);
  if (o) {
    return o;
  }

  /*
     * Deep traverse an object and unfilter any Locker proxies. Isolate this logic here for the component
     * creation APIs rather than a more general solution to avoid overly aggressive unfiltering that may open
     * new security holes.
     */
  function deepUnfilterArgs(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (value !== undefined && value !== null) {
        if (isArray(value) || isPlainObject(value)) {
          const branchValue = baseObject[property];
          baseObject[property] = deepUnfilterArgs(branchValue, value);
          continue;
        }
      }
      if (isProxy(value)) {
        value = getRef(value, key);
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  const su = create$1(null);
  const sls = create$1(null);
  o = create$1(null, {
    util: {
      writable: true,
      enumerable: true,
      value: su
    },
    localizationService: {
      writable: true,
      enumerable: true,
      value: sls
    },
    getCallback: {
      value: function(f) {
        // If the results of $A.getCallback() is wired up to an event handler, passed as an attribute or aura event attribute etc it will get
        // filtered and wrapped with the caller's perspective at that time.
        return AuraInstance.getCallback(f);
      }
    },
    toString: {
      value: function() {
        return `SecureAura: ${AuraInstance}{ key: ${JSON.stringify(key)} }`;
      }
    },

    createComponent: {
      enumerable: true,
      writable: true,
      value: function(type, attributes, callback) {
        // copy attributes before modifying so caller does not see unfiltered results
        const attributesCopy = AuraInstance.util.apply({}, attributes, true, true);
        const filteredArgs =
          attributes && AuraInstance.util.isObject(attributes)
            ? deepUnfilterArgs(attributesCopy, attributes)
            : attributes;
        const fnReturnedValue = AuraInstance.createComponent(
          type,
          filteredArgs,
          filter(o, callback)
        );
        return filter(key, fnReturnedValue);
      }
    },

    createComponents: {
      enumerable: true,
      writable: true,
      value: function(components, callback) {
        let filteredComponents = [];
        if (isArray(components)) {
          for (let i = 0; i < components.length; i++) {
            const filteredComponent = [];
            filteredComponent[0] = components[i][0];
            // copy attributes before modifying so caller does not see unfiltered results
            const attributesCopy = AuraInstance.util.apply({}, components[i][1], true, true);
            filteredComponent[1] = deepUnfilterArgs(attributesCopy, components[i][1]);
            filteredComponents.push(filteredComponent);
          }
        } else {
          filteredComponents = components;
        }
        const fnReturnedValue = AuraInstance.createComponents(
          filteredComponents,
          filter(key, callback)
        );
        return filter(key, fnReturnedValue);
      }
    }
  });

  // SecureAura methods and properties
  ['enqueueAction'].forEach(name =>
    defineProperty(o, name, createFilteredMethod(o, AuraInstance, name, { rawArguments: true }))
  );

  ['get', 'getComponent', 'getReference', 'getRoot', 'log', 'reportError', 'warning'].forEach(
    name => defineProperty(o, name, createFilteredMethod(o, AuraInstance, name))
  );

  setRef(o, AuraInstance, key);
  seal(o);

  // SecureUtil: creating a proxy for $A.util
  ['getBooleanValue', 'isArray', 'isObject', 'isUndefined', 'isUndefinedOrNull'].forEach(name =>
    defineProperty(su, name, createFilteredMethod(su, AuraInstance['util'], name))
  );
  // These methods in Util deal with raw objects like components, so mark them as such
  ['addClass', 'hasClass', 'removeClass', 'toggleClass', 'isEmpty'].forEach(name =>
    defineProperty(
      su,
      name,
      createFilteredMethod(su, AuraInstance['util'], name, { rawArguments: true })
    )
  );

  setRef(su, AuraInstance['util'], key);
  seal(su);

  // SecureLocalizationService: creating a proxy for $A.localizationService
  [
    'displayDuration',
    'displayDurationInDays',
    'displayDurationInHours',
    'displayDurationInMilliseconds',
    'displayDurationInMinutes',
    'displayDurationInMonths',
    'displayDurationInSeconds',
    'duration',
    'endOf',
    'formatCurrency',
    'formatDate',
    'formatDateTime',
    'formatDateTimeUTC',
    'formatDateUTC',
    'formatNumber',
    'formatPercent',
    'formatTime',
    'formatTimeUTC',
    'getDateStringBasedOnTimezone',
    'getDaysInDuration',
    'getDefaultCurrencyFormat',
    'getDefaultNumberFormat',
    'getDefaultPercentFormat',
    'getHoursInDuration',
    'getLocalizedDateTimeLabels',
    'getMillisecondsInDuration',
    'getMinutesInDuration',
    'getMonthsInDuration',
    'getNumberFormat',
    'getSecondsInDuration',
    'getToday',
    'getYearsInDuration',
    'isAfter',
    'isBefore',
    'isBetween',
    'isPeriodTimeView',
    'isSame',
    'parseDateTime',
    'parseDateTimeISO8601',
    'parseDateTimeUTC',
    'startOf',
    'toISOString',
    'translateFromLocalizedDigits',
    'translateFromOtherCalendar',
    'translateToLocalizedDigits',
    'translateToOtherCalendar',
    'UTCToWallTime',
    'WallTimeToUTC'
  ].forEach(name =>
    defineProperty(sls, name, createFilteredMethod(sls, AuraInstance['localizationService'], name))
  );

  setRef(sls, AuraInstance['localizationService'], key);
  seal(sls);

  addToCache(AuraInstance, o, key);
  registerProxy(o);

  return o;
}

function SecureAuraAction(action, key) {
  let o = getFromCache(action, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureAction: ${action}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  defineProperties(o, {
    getName: createFilteredMethod(o, action, 'getName'),
    setCallback: createFilteredMethod(o, action, 'setCallback', { defaultKey: key }),
    setParams: createFilteredMethod(o, action, 'setParams', { defaultKey: key }),
    setParam: createFilteredMethod(o, action, 'setParam', { defaultKey: key }),
    getParams: createFilteredMethod(o, action, 'getParams'),
    getParam: createFilteredMethod(o, action, 'getParam'),
    getCallback: createFilteredMethod(o, action, 'getCallback'),
    getState: createFilteredMethod(o, action, 'getState'),
    getReturnValue: createFilteredMethod(o, action, 'getReturnValue', {
      defaultKey: key
    }),
    getError: createFilteredMethod(o, action, 'getError'),
    isBackground: createFilteredMethod(o, action, 'isBackground'),
    setBackground: createFilteredMethod(o, action, 'setBackground'),
    setAbortable: createFilteredMethod(o, action, 'setAbortable'),
    setStorable: createFilteredMethod(o, action, 'setStorable')
  });

  setRef(o, action, key);
  addToCache(action, o, key);
  registerProxy(o);

  return seal(o);
}

function SecureAuraEvent(event, key) {
  let o = getFromCache(event, key);
  if (o) {
    return o;
  }

  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments$$1(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments$$1([], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments$$1({}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments$$1({}, value);
        }
      } else {
        value = filter(key, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureAuraEvent: ${event}{ key: ${JSON.stringify(key)} }`;
      }
    },
    setParams: {
      writable: true,
      enumerable: true,
      value: function(config) {
        const unfiltered = deepUnfilterMethodArguments$$1({}, config);
        event['setParams'](unfiltered);
        return o;
      }
    },
    setParam: {
      writable: true,
      enumerable: true,
      value: function(property, value) {
        const unfiltered = deepUnfilterMethodArguments$$1({}, { value: value }).value;
        event['setParam'](property, unfiltered);
      }
    }
  });

  [
    'fire',
    'getName',
    'getParam',
    'getParams',
    'getPhase',
    'getSource',
    'getSourceEvent',
    'pause',
    'preventDefault',
    'resume',
    'stopPropagation',
    'getType',
    'getEventType'
  ].forEach(name => defineProperty(o, name, createFilteredMethod(o, event, name)));

  setRef(o, event, key);
  addToCache(event, o, key);
  registerProxy(o);

  return seal(o);
}

let getPublicMethodNames;
let requireLocker;

function registerAuraAPI(api) {
  if (api) {
    getPublicMethodNames = api.getPublicMethodNames;
    requireLocker = api.requireLocker;
  }
}

function SecureAuraComponent(component, key) {
  let o = getFromCache(component, key);
  if (o) {
    return o;
  }

  // special methods that require some extra work
  o = create$1(null, {
    get: {
      writable: true,
      enumerable: true,
      value: function(name) {
        const path = name.split('.');
        // protection against `cmp.get('c')`
        if (typeof path[1] !== 'string' || path[1] === '') {
          throw new SyntaxError(`Invalid key ${name}`);
        }

        const value = component['get'](name);
        if (!value) {
          return value;
        }

        if (path[0] === 'c') {
          return SecureAuraAction(value, key);
        }
        return filter(key, value);
      }
    },
    getEvent: {
      writable: true,
      enumerable: true,
      value: function(name) {
        const event = component['getEvent'](name);
        if (!event) {
          return event;
        }
        return SecureAuraEvent(event, key);
      }
    },
    toString: {
      value: function() {
        return `SecureComponent: ${component}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  defineProperties(o, {
    // these four super* methods are exposed as a temporary solution until we figure how to re-arrange the render flow
    superRender: createFilteredMethod(o, component, 'superRender'),
    superAfterRender: createFilteredMethod(o, component, 'superAfterRender'),
    superRerender: createFilteredMethod(o, component, 'superRerender'),
    superUnrender: createFilteredMethod(o, component, 'superUnrender'),

    // component @platform methods
    isValid: createFilteredMethod(o, component, 'isValid'),
    isInstanceOf: createFilteredMethod(o, component, 'isInstanceOf'),
    addEventHandler: createFilteredMethod(o, component, 'addEventHandler', {
      rawArguments: true
    }),
    addHandler: createFilteredMethod(o, component, 'addHandler'),
    addValueHandler: createFilteredMethod(o, component, 'addValueHandler'),
    addValueProvider: createFilteredMethod(o, component, 'addValueProvider'),
    destroy: createFilteredMethod(o, component, 'destroy'),
    isRendered: createFilteredMethod(o, component, 'isRendered'),
    getGlobalId: createFilteredMethod(o, component, 'getGlobalId'),
    getLocalId: createFilteredMethod(o, component, 'getLocalId'),
    getSuper: createFilteredMethod(o, component, 'getSuper'),
    getReference: createFilteredMethod(o, component, 'getReference'),
    getVersion: createFilteredMethod(o, component, 'getVersion'),
    clearReference: createFilteredMethod(o, component, 'clearReference'),
    autoDestroy: createFilteredMethod(o, component, 'autoDestroy'),
    isConcrete: createFilteredMethod(o, component, 'isConcrete'),
    getConcreteComponent: createFilteredMethod(o, component, 'getConcreteComponent'),
    find: createFilteredMethod(o, component, 'find'),
    set: createFilteredMethod(o, component, 'set', {
      defaultKey: key,
      rawArguments: true
    }),
    getElement: createFilteredMethod(o, component, 'getElement'),
    getElements: createFilteredMethod(o, component, 'getElements'),
    getName: createFilteredMethod(o, component, 'getName'),
    getType: createFilteredMethod(o, component, 'getType'),
    removeEventHandler: createFilteredMethod(o, component, 'removeEventHandler')
  });

  // The shape of the component depends on the methods exposed in the definitions:
  const methodsNames = getPublicMethodNames(component);
  if (methodsNames && methodsNames.length) {
    methodsNames.forEach(methodName => addMethodIfSupported(o, component, methodName));
  }

  setRef(o, component, key);
  addToCache(component, o, key); // backpointer
  registerProxy(o);

  return o;
}

function SecureAuraComponentRef(component, key) {
  let o = getFromCache(component, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureComponentRef: ${component}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });
  defineProperties(o, {
    addValueHandler: createFilteredMethod(o, component, 'addValueHandler'),
    addValueProvider: createFilteredMethod(o, component, 'addValueProvider'),
    destroy: createFilteredMethod(o, component, 'destroy'),
    getGlobalId: createFilteredMethod(o, component, 'getGlobalId'),
    getLocalId: createFilteredMethod(o, component, 'getLocalId'),
    getEvent: createFilteredMethod(o, component, 'getEvent'),
    isInstanceOf: createFilteredMethod(o, component, 'isInstanceOf'),
    isRendered: createFilteredMethod(o, component, 'isRendered'),
    isValid: createFilteredMethod(o, component, 'isValid'),
    set: createFilteredMethod(o, component, 'set', {
      defaultKey: key,
      rawArguments: true
    }),
    get: {
      writable: true,
      enumerable: true,
      value: function(name) {
        // protection against anything other then `cmp.get('v.something')`
        if (
          typeof name !== 'string' ||
          name.length < 3 ||
          (name.indexOf('v.') !== 0 && name.indexOf('e.') !== 0)
        ) {
          throw new SyntaxError(`Invalid key ${name}`);
        }

        return filter(key, component['get'](name));
      }
    }
  });

  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments$$1(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments$$1([], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments$$1({}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments$$1({}, value);
        }
      } else {
        value = filter(key, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  const methodsNames = getPublicMethodNames(component);
  if (methodsNames && methodsNames.length) {
    // If SecureAuraComponentRef is an unlockerized component, then let it
    // have access to raw arguments
    const methodOptions = {
      unfilterEverything: !requireLocker(component)
        ? function(args) {
            return deepUnfilterMethodArguments$$1([], args);
          }
        : undefined
    };

    methodsNames.forEach(methodName =>
      addMethodIfSupported(o, component, methodName, methodOptions)
    );
  }

  // DCHASMAN TODO Workaround for ui:button redefining addHandler using aura:method!!!
  if (!('addHandler' in o)) {
    addMethodIfSupported(o, component, 'addHandler', { rawArguments: true });
  }

  setRef(o, component, key);
  addToCache(component, o, key);
  registerProxy(o);

  return seal(o);
}

function SecureAuraPropertyReferenceValue(prv, key) {
  let o = getFromCache(prv, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecurePropertyReferenceValue: ${prv} { key: ${JSON.stringify(key)} }`;
      }
    }
  });

  setRef(o, prv, key);
  addToCache(prv, o, key);
  registerProxy(o);

  return seal(o);
}

let AuraAction;
let AuraComponent;
let AuraEvent;
let AuraPropertyReferenceValue;

function registerAuraTypes(types) {
  if (types) {
    AuraAction = types.Action;
    AuraComponent = types.Component;
    AuraEvent = types.Event;
    AuraPropertyReferenceValue = types.PropertyReferenceValue;
  }
}

// AuraLocker is a facade for Locker. Its role is to:
// - implement methods not present on Locker (extends API).
// - decouple the Locker API from the Aura API.
let isLockerInitialized = false;

const namespaceToKey = new Map();

/**
 * Pre hook to allow aura to filter things with special behavior
 * @param {*} raw The object being accessed
 * @param {*} key locker key for the secure thing trying to access the raw object
 * @param {*} belongsToLocker Does the raw value and secure thing trying to access it belong to the same locker
 */
function filterTypeHook(raw, key, belongsToLocker) {
  if (raw instanceof AuraAction) {
    return belongsToLocker ? SecureAuraAction(raw, key) : SecureObject(raw, key);
  } else if (raw instanceof AuraComponent) {
    return belongsToLocker ? SecureAuraComponent(raw, key) : SecureAuraComponentRef(raw, key);
  } else if (raw instanceof AuraEvent) {
    return SecureAuraEvent(raw, key);
  } else if (raw instanceof AuraPropertyReferenceValue) {
    return SecureAuraPropertyReferenceValue(raw, key);
  } else if (isNode(raw) && isAccessibleLWCNode(key, raw)) {
    // If the raw thing is an LWC node and it can be accessed with the give key, then wrap it in SecureElement
    return SecureElement(raw, key);
  } else if (belongsToLocker && isUnfilteringDataProxy(raw)) {
    // If value holds a data proxy that belongs to this locker, give access to the real data proxy, no need to filter
    return getDataProxy(raw);
  }
  return null;
}

/**
 * Custom unfiltering logic for values that need special handling to be usable in system mode
 * @param {*} fromKey locker key for the secure thing that from where the value originated
 * @param {*} value value being unfiltered for system mode access
 */
function deepUnfilteringTypeHook(fromKey, value) {
  if (!value) {
    return value;
  }
  if (isDataProxy(value)) {
    // If value is a wrapper over unfiltering data proxy, unwrap it
    if (isProxy(value)) {
      // If value is a wrapped object, use st's key to unwrap the value.
      return getRef(value, fromKey);
    }
    // preserve the proxy behavior, wrap with an unfiltering proxy
    return getUnfilteringDataProxy(fromKey, value);
  }
  return value;
}

function isUnfilteredTypeHook(raw, key) {
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    return window['MediaStream'] && raw instanceof window['MediaStream'];
  }
  return false;
}

function windowAddPropertiesHook(st, raw, key) {
  defineProperty(st, '$A', {
    enumerable: true,
    value: SecureAura(raw['$A'], key)
  });

  // Salesforce API entry points (first phase) - W-3046191 is tracking adding a publish() API
  // enhancement where we will move these to their respective javascript/container architectures
  ['Sfdc', 'sforce'].forEach(name => addPropertyIfSupported(st, raw, name));

  // Add RTC related api only to specific namespaces
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    ['RTCPeerConnection', 'webkitRTCPeerConnection'].forEach(name => {
      if (name in raw) {
        defineProperty(st, name, {
          enumerable: true,
          value: SecureRTCPeerConnection(raw[name], key)
        });
      }
    });
    addUnfilteredPropertyIfSupported(st, raw, 'MediaStream');
    // DOMParser and document.implementation is not currently supported in Locker due to W-4437359
    // enable only for RTC namespace until a better solution arises.
    addUnfilteredPropertyIfSupported(st, raw, 'DOMParser');
  }
}

function navigatorAddPropertiesHook(st, raw, key) {
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    ['mediaDevices', 'mozGetUserMedia', 'webkitGetUserMedia'].forEach(name => {
      addUnfilteredPropertyIfSupported(st, raw, name);
    });
  }
}

function create$$1(src, key, sourceURL) {
  return {
    globals: getEnv$1(key),
    returnValue: evaluate(`(function () {${src}}())`, key, sourceURL)
  };
}

function getKeyForNamespace(namespace) {
  let key = namespaceToKey.get(namespace);

  if (!key) {
    key = freeze({
      namespace: namespace
    });

    namespaceToKey.set(namespace, key);
  }

  return key;
}

function createForClass(src, defDescriptor) {
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `components/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  const returnValue = evaluate(src, key, sourceURL);
  // Key this def so we can transfer the key to component instances
  setKey(returnValue, key);
  return returnValue;
}

// @deprecated
function createForDef(src, def) {
  const defDescriptor = def.getDescriptor();
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `components/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  // Key this def so we can transfer the key to component instances
  setKey(def, key);

  // Accelerate the reference to $A
  src = `(function() {
  const {$A} = window;

  ${src}

}())`;

  return evaluate(src, key, sourceURL);
}

function createForModule(src, defDescriptor) {
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `modules/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  // Mute several globals for modules
  src = `(function() {
  const {$A, aura, Sfdc, sforce} = {};

  return ${src}

}())`;

  const returnValue = evaluate(src, key, sourceURL);
  // Key the sanitized definition so we can transfer the key to interop component instances
  setKey(returnValue, key);
  return returnValue;
}

function getEnv$$1(key) {
  return getEnv$1(key);
}

function getEnvForSecureObject(st) {
  const key = getKey(st);
  if (!key) {
    return undefined;
  }

  return getEnv$1(key);
}

function getRaw$$1(value) {
  if (value) {
    const key = getKey(value);
    if (key) {
      value = getRef(value, key) || value;
    }
  }
  return value;
}

function initialize(types, api) {
  if (isLockerInitialized) {
    return;
  }

  init({
    shouldFreeze: api.isFrozenRealm,
    notFrozenIntrinsicNames: api.notFrozenIntrinsicNames,
    unsafeGlobal: window,
    unsafeEval: window.eval,
    unsafeFunction: window.Function
  });

  registerAuraTypes(types);
  registerAuraAPI(api);
  registerReportAPI(api);
  registerLWCAPI(api);
  registerFilterTypeHook(filterTypeHook);
  registerDeepUnfilteringTypeHook(deepUnfilteringTypeHook);
  registerIsUnfilteredTypeHook(isUnfilteredTypeHook);
  registerLWCHelpers({ isAccessibleLWCNode });
  registerAddPropertiesHook$$1(windowAddPropertiesHook);
  registerAddPropertiesHook$1(navigatorAddPropertiesHook);
  registerCustomElementHook(customElementHook$1);
  isLockerInitialized = true;
}

function isEnabled() {
  return true;
}

// @deprecated
function instanceOf(value, type) {
  return value instanceof type;
}

function runScript(src, namespace) {
  const key = getKeyForNamespace(namespace);
  return evaluate(src, key);
}

function trust$$1(from, thing) {
  return trust$1(from, thing);
}

function unwrap$$1(from, st) {
  return unwrap$1(from, st);
}

function wrapComponent(component) {
  const key = getKey(component);
  if (!key) {
    return component;
  }

  if (typeof component !== 'object') {
    return component;
  }

  return requireLocker(component) ? SecureAuraComponent(component, key) : component;
}

function wrapComponentEvent(component, event) {
  // if the component is not secure, return the event.
  const key = getKey(component);
  if (!key) {
    return event;
  }

  if (typeof component !== 'object' || typeof event !== 'object') {
    return event;
  }

  return event instanceof AuraEvent ? SecureAuraEvent(event, key) : SecureDOMEvent(event, key);
}

function wrapLWC(lwc, key) {
  return SecureLWC(lwc, key);
}

function wrapLib(lib, key, requireLocker$$1, desc) {
  return SecureLib(lib, key, requireLocker$$1, desc);
}

exports.create = create$$1;
exports.getKeyForNamespace = getKeyForNamespace;
exports.createForClass = createForClass;
exports.createForDef = createForDef;
exports.createForModule = createForModule;
exports.getEnv = getEnv$$1;
exports.getEnvForSecureObject = getEnvForSecureObject;
exports.getRaw = getRaw$$1;
exports.initialize = initialize;
exports.isEnabled = isEnabled;
exports.instanceOf = instanceOf;
exports.runScript = runScript;
exports.trust = trust$$1;
exports.unwrap = unwrap$$1;
exports.wrapComponent = wrapComponent;
exports.wrapComponentEvent = wrapComponentEvent;
exports.wrapLWC = wrapLWC;
exports.wrapLib = wrapLib;
exports.sanitize = sanitize;
exports.isAllowedSvgTag = isAllowedSvgTag;
exports.sanitizeSvgElement = sanitizeSvgElement;
exports.sanitizeElement = sanitizeElement;

}((this.AuraLocker = this.AuraLocker || {})));
