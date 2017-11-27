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

            var href = this.sanitizeUrl(cmp.get("v.href"));

            if (!$A.util.isEmpty(href)) {
                var link = $A.util.createHtmlElement("a", {
                    "href": href,
                    "class": cmp.get("v.linkClass"),
                    "target": cmp.get("v.target")
                });

                link.appendChild(image);
                bodyElement.appendChild(link);
            } else {
                bodyElement.appendChild(image);
            }
        }

    },

    buildImageElement: function (cmp) {
        var image = $A.util.createHtmlElement("img", {
            "data-aura-rendered-by": cmp.getGlobalId(),
            "src": this.sanitizeUrl(cmp.get("v.src")),
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

    sanitizeUrl: function (url) {
        var regex = /^\s*javascript:/;
        if (regex.test(url)) {
            return '';
        }
        return url;
    }

});
