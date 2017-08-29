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
    allowedSchemes: [
        'http', 'https', 'ftp', 'mailto'
    ],
    allowedSchemesByTag: {},
    allowProtocolRelative: true,


    /**
     * Returns the img tag in this component.
     */
    getImageElement: function (cmp) {
        var imageElement = cmp.find("body").getElement().firstChild;

        if (this.isAnchorImage(cmp)) {
            imageElement = imageElement.children[0];
        }
        return imageElement;
    },

    isAnchorImage: function (cmp) {
        return !$A.util.isEmpty(cmp.get("v.href"));
    },

    buildBody: function (cmp) {
        var body = cmp.find("body");

        if (body) {
            var bodyElement = body.getElement();

            $A.util.clearNode(bodyElement);

            var image = this.buildImageElement(cmp);

            var href = cmp.get("v.href");

            // if the href value isn't naughty or empty return a linked image
            if (!$A.util.isEmpty(href) && !this.isNaughtyHref('a', href)) {
                var link = $A.util.createHtmlElement("a", {
                    "href": href,
                    "class": cmp.get("v.linkClass"),
                    "target": cmp.get("v.target")
                });

                link.appendChild(image);
                bodyElement.appendChild(link);
            // return only image
            } else {
                bodyElement.appendChild(image);
            }
        }

    },

    buildImageElement: function (cmp) {
        var imgSrc = cmp.get("v.src");
        
        // if image source value is naughty reset it to the default value
        if (this.isNaughtyHref('img', imgSrc)) {
            imgSrc = '/auraFW/resources/aura/s.gif';
        }

        var image = $A.util.createHtmlElement("img", {
            "data-aura-rendered-by": cmp.getGlobalId(),
            "src": imgSrc,
            "class": cmp.get("v.class"),
            "alt": cmp.get("v.alt"),
            "title": cmp.get("v.title")
        });

        image["onerror"] = $A.getCallback(function () {
            if (cmp.isValid()) {
                cmp.get("e.onerror").fire();
            }
        });

        image["onload"] = $A.getCallback(function () {
            if (cmp.isValid()) {
                cmp.get("e.onload").setParams({"value": image}).fire();
            }
        });

        return image;
    },

    // Avoid false positives with .__proto__, .hasOwnProperty, etc.
    has: function (obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    isNaughtyHref: function (name, href) {
        // Browsers ignore character codes of 32 (space) and below in a surprising
        // number of situations. Start reading here:
        // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
        /* eslint-disable no-control-regex */
        href = href.replace(new RegExp('[\x00-\x20]+', 'g'), '');
        /* eslint-enable no-control-regex */
        // Clobber any comments in URLs, which the browser might
        // interpret inside an XML data island, allowing
        // a javascript: URL to be snuck through
        href = href.replace(new RegExp('<\!\-\-.*?\-\-\>', 'g'), '');
        // Case insensitive so we don't get faked out by JAVASCRIPT #1
        var matches = href.match(new RegExp('^([a-zA-Z]+)\:'));
        
        if (!matches) {
            // Protocol-relative URL: "//some.evil.com/nasty"
            if (href.match(new RegExp('^\/\/'))) {
                return !this.allowProtocolRelative;
            }

            // No scheme
            return false;
        }
        var scheme = matches[1].toLowerCase();

        if (this.has(this.allowedSchemesByTag, name)) {
            return this.allowedSchemesByTag[name].indexOf(scheme) === -1;
        }

        return !this.allowedSchemes || this.allowedSchemes.indexOf(scheme) === -1;
    }

});