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
    linkifyText: function (component) {
        var value = component.get("v.value");

        if (component.get("v.linkify")) {
            value = this.urlLib.linkify.escapeAndLinkifyText(value);
        }

        component.set("v.displayValue", value);
    },

    handleLinkClick: function (url, event) {
        var forceEvent = $A.getEvt("markup://force:navigateToURL");
        if (forceEvent) {
            event.preventDefault();
            forceEvent.setParams({ "url": url}).fire();
        }
    },

    decorateLinks: function (component) {
        var el = component.getElement();
        var links = (el && el.querySelectorAll("a")) || [];
        for (var i=0; i<links.length; i++) {
            var url = links[i].href;
            links[i].setAttribute("rel", "noopener");
            links[i].addEventListener('click', $A.getCallback(this.handleLinkClick).bind(this, url));
        }
    }
});
