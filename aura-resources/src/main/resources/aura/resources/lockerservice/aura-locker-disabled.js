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
 * Generated: 2019-01-09
 * Version: 0.6.16
 */

(function (exports) {
'use strict';

// eslint-disable-line no-console

function asString(arg) {
  try {
    return '' + arg;
  } catch (e) {
    return '';
  }
}

// SVG TAGS
// taken from DOMPurifier source code
// maintain a map for quick O(1) lookups of tags
var svgTagsMap = {
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
var svgTags = Object.keys(svgTagsMap);

// HTML TAGS SECTION
// must be kept in sync with https://git.soma.salesforce.com/aura/aura/blob/master/aura-impl/src/main/resources/aura/component/HtmlComponent.js
var htmlTagsMap = {
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
var htmlTags = Object.keys(htmlTagsMap);

// ATTRIBUTES
var attrs = ['aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy', 'aria-checked', 'aria-controls', 'aria-describedby', 'aria-disabled', 'aria-readonly', 'aria-dropeffect', 'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden', 'aria-disabled', 'aria-invalid', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live', 'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant', 'aria-required', 'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'role', 'target'];

// use a floating element for attribute sanitization
var floating$1 = document.createElement('a');

// define sanitizers functions
// these functions should be PURE

// sanitize a str representing an href SVG attribute value
function sanitizeHrefAttribute(str) {
  if (!str) {
    return str;
  }

  str = asString(str);
  if (str.startsWith('#')) {
    return str;
  }

  floating$1.href = str;
  var urlParam = floating$1.href.split('#');
  var url = ('' + urlParam[0]).replace(/[\\/,\\:]/g, '');
  if (!document.getElementById(url)) {
    var container = document.createElement('div');
    container.setAttribute('style', 'display:none');
    container.setAttribute('id', url);
    document.body.appendChild(container);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', urlParam[0]);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        container.innerHTML = sanitizeSvgText(xhr.responseText);
      }
    };
    xhr.send();
  }

  return urlParam[1] ? '#' + urlParam[1] : '#' + url;
}

function uponSanitizeAttribute(node, data) {
  var nodeName = node.nodeName.toUpperCase();
  if (nodeName === 'USE' && ['href', 'xlink:href'].includes(data.attrName)) {
    data.attrValue = sanitizeHrefAttribute(data.attrValue);
  }
  return data;
}

// Detect global object. Magically references a jsdom instance created in the bundled version
// JSDom and DOMPurify are packaged only in the bundled version of locker-sanitize
// eslint-disable-next-line
var root = typeof window !== 'undefined' ? window : jsdom.window;

// floating element used for purification of strings in Locker
// create a dummy floating element that stores text if document is not found
var floating = root.document.createElement('template');

// cache DOMPurify instances to avoid reparsing configs
// improves performance of DOMPurify.sanitize for repeated usage with same config
var instances = new WeakMap();

// DOMPurify preset configurations
// configuration objects are also used as keys in the WeakMap to retrieve a DOMPurify instance

// precompile a list of all whitelisted tags
var allTags = Array.from(new Set([].concat(svgTags).concat(htmlTags)));

// use only SVG tags, DOMPurify to returns a String
var RETURN_STRING_SVG = {
  ALLOWED_TAGS: svgTags,
  ADD_ATTR: attrs,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

// use only SVG tags, sanitizer attempts in place sanitization
var RETURN_NODE_SVG_INPLACE = {
  ALLOWED_TAGS: svgTags,
  ADD_ATTR: attrs,
  IN_PLACE: true,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

// use only svg tags, sanitizer returns a document fragment
var RETURN_NODE_SVG_NEWNODE = {
  ALLOWED_TAGS: svgTags,
  ADD_ATTR: attrs,
  RETURN_DOM_FRAGMENT: true,
  RETURN_DOM_IMPORT: true,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

// generic, sanitizer returns string
var RETURN_STRING_ALL = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

// generic, sanitizer attempts in place sanitization
var RETURN_NODE_ALL_INPLACE = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  IN_PLACE: true,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

// generic, sanitizer returns a document fragment
var RETURN_NODE_ALL_NEWNODE = {
  ALLOWED_TAGS: allTags,
  ADD_ATTR: attrs,
  RETURN_DOM_FRAGMENT: true,
  RETURN_DOM_IMPORT: true,
  hooks: {
    uponSanitizeAttribute: uponSanitizeAttribute
  }
};

/**
 * use global DOMPurify if provided as global
 *  defaults to package depedency otherwise
 */
function getSanitizerForConfig(config) {
  var sanitizer = instances.get(config);
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
    Object.keys(config.hooks).forEach(function (key) {
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
  var sanitizer = getSanitizerForConfig(RETURN_NODE_SVG_INPLACE);
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
  var sanitizer = getSanitizerForConfig(RETURN_NODE_ALL_INPLACE);
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
function sanitizeSvgText(input) {
  var sanitizer = getSanitizerForConfig(RETURN_STRING_SVG);
  return sanitizer.sanitize(input);
}

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
  var sanitizer = getSanitizerForConfig(cfg);
  return sanitizer.sanitize(input);
}

/**
 * Will sanitize a string. Uses internal Locker configuration
 * Uses a template floating element to avoid https://github.com/cure53/DOMPurify/issues/190
 * @param {String} input
 */


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


/**
 * Sanitizes for a DOM element. Typical use would be when wanting to sanitize for
 * an href or src attribute of an element or window.open
 * @param {*} url
 */


/**
 * Sanitizes request URL!
 * @param {*} url
 */

/* eslint-disable no-unused-vars, prefer-template */

// This is a mock for non-compliant browsers, in particular for IE11.

// All methods have the same API as AuraLocker.js and it's norman to
// expect unused variables.

// DO NOT USE ES6 METHODS IN THIS FILE.

function evaluate(src) {
  return (0, eval)('(function(){\n' + src + '\n})()');
}

function create(src, key, sourceURL) {
  return {
    globals: window,
    returnValue: evaluate(src)
  };
}

function createForClass(src, defDescriptor) {
  return evaluate('return (\n' + src + '\n)');
}

// @deprecated
function createForDef(src, def) {
  return evaluate(src);
}

function createForModule(src, defDescriptor) {
  return evaluate('return (\n' + src + '\n)');
}

function getEnv(key) {
  return window;
}

function getEnvForSecureObject(st) {
  return window;
}

function getKeyForNamespace(namespace) {
  /* Do Nothing */
}

function getRaw(value) {
  return value;
}

function initialize(types) {
  /* Do Nothing */
}

function isEnabled() {
  return false;
}

// @deprecated
function instanceOf(value, type) {
  return value instanceof type;
}

function runScript(src, namespace) {
  return evaluate(src);
}

function trust(from, thing) {
  /* Do Nothing */
}

function unwrap(from, st) {
  return st;
}

function wrapComponent(component) {
  return component;
}

function wrapComponentEvent(component, event) {
  return event;
}

function wrap(thing, metaFrom, metaTo) {
  return thing;
}

function getMethodUsageMetrics() {
  /* nothing */
}

exports.create = create;
exports.createForClass = createForClass;
exports.createForDef = createForDef;
exports.createForModule = createForModule;
exports.getEnv = getEnv;
exports.getEnvForSecureObject = getEnvForSecureObject;
exports.getKeyForNamespace = getKeyForNamespace;
exports.getRaw = getRaw;
exports.initialize = initialize;
exports.isEnabled = isEnabled;
exports.instanceOf = instanceOf;
exports.runScript = runScript;
exports.trust = trust;
exports.unwrap = unwrap;
exports.wrapComponent = wrapComponent;
exports.wrapComponentEvent = wrapComponentEvent;
exports.wrap = wrap;
exports.getMethodUsageMetrics = getMethodUsageMetrics;
exports.sanitize = sanitize;
exports.isAllowedSvgTag = isAllowedSvgTag;
exports.sanitizeSvgElement = sanitizeSvgElement;
exports.sanitizeElement = sanitizeElement;

}((this.AuraLockerDisabled = this.AuraLockerDisabled || {})));
