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
     * Set value to (html) textarea element.
     */
    setDomElementValue : function (component) {
        var textAreaCmp = component.find("textAreaElem");
        var elem = !$A.util.isUndefinedOrNull(textAreaCmp) ? textAreaCmp.getElement() : null;
        if (elem) {
            var value = component.get("v.value");
            if ($A.util.isUndefinedOrNull(value)) {
                elem.value = "";
            } else {
                if (value !== elem.value) {
                    if (document.activeElement == elem) {
                        var selectionStart = elem.selectionStart;
                        var selectionEnd = elem.selectionEnd;
                        elem.value = value;
                        elem.setSelectionRange(selectionStart,selectionEnd);
                    } else {
                        elem.value = value;
                    }
                }

                // carriage returns are added for new lines to match form encoded textarea behavior
                var carriageReturnValue = value.replace(/(\r\n)|\n/g,'\r\n');
                component.set("v.value",carriageReturnValue,true);
            }
        }
    }
})