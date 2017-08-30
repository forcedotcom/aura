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
({
    SUPPORTED_HTML_TAGS:    ["a", "b", "br", "big", "blockquote", "caption", "cite", "code", "col", "colgroup",
                             "del", "div", "em", "h1", "h2", "h3", "hr", "i", "img", "ins", "iframe",
                             "kbd", "li", "ol", "p", "param", "pre", "q", "s", "samp", "small",
                             "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th",
                             "thead", "tr", "tt", "u", "ul", "var", "strike"],

    SUPPORTED_ATTRS:        ['accept','action','align','alt','autocomplete','background','bgcolor',
                             'border','cellpadding','cellspacing','checked','cite','class','clear','color',
                             'cols','colspan','coords','datetime','default','dir','disabled',
                             'download','enctype','face','for','headers','height','hidden','high','href',
                             'hreflang','id','ismap','label','lang','list','loop', 'low','max',
                             'maxlength','media','method','min','multiple','name','noshade','novalidate',
                             'nowrap','open','optimum','pattern','placeholder','poster','preload','pubdate',
                             'radiogroup','readonly','rel','required','rev','reversed','rows',
                             'rowspan','spellcheck','scope','selected','shape','size','span',
                             'srclang','start','src','step','style','summary','tabindex','target', 'title',
                             'type','usemap','valign','value','width','xmlns'],


    sanitize: function(html) {
        return $A.util.sanitizeDOM(html, {
                ALLOWED_TAGS: this.SUPPORTED_HTML_TAGS,
                ALLOWED_ATTR: this.SUPPORTED_ATTRS,

                // Dont see a reason to allow this
                ALLOW_UNKNOWN_PROTOCOLS: false
            });

    }
})