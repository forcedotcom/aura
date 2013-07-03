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
    addOptionDomEvents : function(component) {
        var events = ["mouseover", "mouseout"];
        for (var i=0, len=events.length; i < len; i++) {
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }           
        }
    },
    
    displayText: function(component, keyword) {
        var concreteCmp = component.getConcreteComponent();
        var keyword = concreteCmp.get("v.keyword");
        if (!keyword) {
            return;
        }
        var optionCmp = concreteCmp.find("option");
        var elem = optionCmp ? optionCmp.getElement() : null;
        if (elem) {
            var label = concreteCmp.get("v.label");
            var regex;
            try {
                regex = new RegExp(keyword, "i");
            } catch (e) { // if keyword is not a legal regular expression, display the original label
                elem.textContent = label;
                return;
            }

            var searchResult = regex.exec(label);
            if (searchResult && searchResult[0].length > 0) {
                var displayText = this.htmlEscape(label.substring(0, searchResult.index)) +
                                  "<mark class=\"data-match\">" + 
                                  this.htmlEscape(searchResult[0]) + 
                                  "</mark>" +
                                  this.htmlEscape(label.substr(searchResult.index + searchResult[0].length));
                elem.innerHTML = displayText;
            } else {
                elem.textContent = label;
            }
        }
    },
    
    handleMouseover: function(component) {
        var optionCmp = component.find("option");
        var elem = optionCmp ? optionCmp.getElement() : null;
        if (elem) {
            $A.util.addClass(elem, "mouseovered");
        }
    },
    
    handleMouseout: function(component) {
        var optionCmp = component.find("option");
        var elem = optionCmp ? optionCmp.getElement() : null;
        if (elem) {
            $A.util.removeClass(elem, "mouseovered");
        }
    },
    
    htmlEscape: function(str) {
        return String(str).replace(/&/g, '&amp;')
            .replace(new RegExp('"', "g"), '&quot;')
            .replace(new RegExp("'", "g"), '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})
