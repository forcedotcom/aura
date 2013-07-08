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
/**
 * @namespace
 * @constructor
 */
function Style (){
    this.head = null;
}

/**
 * Gets the head element of the HTML document.
 * @returns {Object}
 */
Style.prototype.getHead = function(){
    var ret = this.head;
    if(!ret){
        this.head = document.getElementsByTagName("head")[0];
        ret = this.head;
    }
    return ret;
};

/**
 * Applies a CSS style to an element using the HTML style element.
 * Appends the HTML style element as a child of the head element.
 * @param {String} styleText The HTML style element, including the type attribute.
 * @returns {Object} The style element
 */
Style.prototype.apply = function(styleText) {
    //FIXME - This should see if it's already been applied
    var styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    if(styleElement.styleSheet){
        //IE
       styleElement.styleSheet.cssText = styleText;
    } else if (styleElement.textContent !== undefined) {
        //webkit & ff
        styleElement.textContent = styleText;
    } else if (styleElement.innerText !== undefined) {
        //webkit
        styleElement.innerText = styleText;
    } else {
        //ff
        styleElement.innerHTML = styleText;
    }
    this.getHead().appendChild(styleElement);
    return styleElement;
};

/**
 * Includes a CSS style link element with href, rel, and type attributes.
 * Append the HTML link element as a child of the head element.
 * Returns the HTML link element.
 * @param {String} href Defines the location of the style sheet.
 * @returns {Object} The link element
 */
Style.prototype.include = function(href) {
    //FIXME - This should see if it's already been included
    var styleElement = document.createElement('link');
    styleElement.setAttribute('href', href);
    styleElement.setAttribute('rel', 'stylesheet');
    styleElement.setAttribute('type', 'text/css');
    this.getHead().appendChild(styleElement);
    return styleElement;
};

Style.prototype.getCSSProperty = function(el, cssprop) {
    if (el.currentStyle){ //IE
        return el.currentStyle[cssprop];
    }else if (document.defaultView && document.defaultView.getComputedStyle){ //Firefox
        return document.defaultView.getComputedStyle(el, "")[cssprop];
    }else{ //try and get inline style
        return el.style[cssprop];
    }
};

//#include aura.util.Style_export
