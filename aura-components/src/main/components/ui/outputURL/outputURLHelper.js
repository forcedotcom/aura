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
    makeAbsolute: function (url) {
        var newUrl = url;

        if (!$A.util.isEmpty(url)) {
            var urlLower = url.toLowerCase();
            if (urlLower.indexOf("http://") !== 0 && urlLower.indexOf("https://") !== 0 && urlLower.indexOf("ftp://") !== 0
                && url.indexOf("/") !== 0 && url.indexOf(".") !== 0) {

                newUrl = "http://" + url;
            }
        }
        return newUrl;
    },

    buildLinkBody: function (cmp) {
        var link = cmp.find("link");

        if (link) {
            var linkElement = link.getElement();

            $A.util.clearNode(linkElement);

            var iconClass = cmp.get("v.iconClass");
            var label = cmp.get("v.label") || '';

            if (!$A.util.isEmpty(iconClass)) {
                var alt = cmp.get("v.alt");
                if (!$A.util.isEmpty(label)) {
                    alt = '';
                } else if ($A.util.isEmpty(alt)) {
                    $A.warning('component: ' + (cmp.getLocalId() || cmp.getGlobalId() || '') + ' "alt" attribute should not be empty');
                }

                var imageNode = $A.util.createHtmlElement("img", {
                    "src": "/auraFW/resources/aura/s.gif",
                    "class": iconClass,
                    "alt": alt
                });

                linkElement.appendChild(imageNode);
            }

            linkElement.appendChild(document.createTextNode(label));
        }
    },

    handleDisabled: function(cmp) {
        var link = cmp.find("link");
        if (link) {
            var element = link.getElement();
            if ($A.util.getBooleanValue(cmp.get("v.disabled"))) {
                $A.util.addClass(element, "disabled");
            } else {
                $A.util.removeClass(element, "disabled");
            }

        }
    }
})// eslint-disable-line semi
