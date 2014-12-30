/*
 * Copyright (C) 2013 salesforce.com, inc.
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
// jshint ignore: start
// POLYFILL CLASSLIST (https://github.com/remy/polyfills/blob/master/classList.js)
function (w) {
  w || (w = window);
  
  if (!(typeof w.Element === "undefined" || "classList" in document.documentElement)) {

    // adds indexOf to Array prototype for IE support
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }

    var prototype = Array.prototype,
        indexOf = prototype.indexOf,
        slice = prototype.slice,
        push = prototype.push,
        splice = prototype.splice,
        join = prototype.join;

    function DOMTokenList(el) {  
      this._element = el;
      if (el.className != this._classCache) {
        this._classCache = el.className;

        if (!this._classCache) return;
        
          // The className needs to be trimmed and split on whitespace
          // to retrieve a list of classes.
          var classes = this._classCache.replace(/^\s+|\s+$/g,'').split(/\s+/),
            i;
        for (i = 0; i < classes.length; i++) {
          push.call(this, classes[i]);
        }
      }
    }

    function setToClassName(el, classes) {
      el.className = classes.join(' ');
    }

    DOMTokenList.prototype = {
      add: function(token) {
        if(this.contains(token)) return;
        push.call(this, token);
        setToClassName(this._element, slice.call(this, 0));
      },
      contains: function(token) {
        return indexOf.call(this, token) !== -1;
      },
      item: function(index) {
        return this[index] || null;
      },
      remove: function(token) {
        var i = indexOf.call(this, token);
         if (i === -1) {
           return;
         }
        splice.call(this, i, 1);
        setToClassName(this._element, slice.call(this, 0));
      },
      toString: function() {
        return join.call(this, ' ');
      },
      toggle: function(token) {
        if (!this.contains(token)) {
          this.add(token);
        } else {
          this.remove(token);
        }

        return this.contains(token);
      }
    };

    window.DOMTokenList = DOMTokenList;

    function defineElementGetter (obj, prop, getter) {
            if (Object.defineProperty) {
                    Object.defineProperty(obj, prop,{
                            get : getter
                    });
            } else {                                        
                    obj.__defineGetter__(prop, getter);
            }
    }

    defineElementGetter(Element.prototype, 'classList', function () {
      return new DOMTokenList(this);                        
    });
  }
  return true;
}