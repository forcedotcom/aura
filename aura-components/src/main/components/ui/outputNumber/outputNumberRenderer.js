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
    render: function outputNumberRender(cmp, helper) {
        var span = this.superRender()[0];
        var f = cmp.get("v.format");
        var num = cmp.get("v.value");
        var formatted;
        if (!$A.util.isUndefinedOrNull(num)) {
            if (!$A.util.isEmpty(f)) {
                var nf;
                try {
                    nf = $A.localizationService.getNumberFormat(f);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(num);
                }
            } else {
                formatted = $A.localizationService.formatNumber(num);
            }
            span.innerText = formatted;
        }
        return span;
    },

    rerender: function outputNumberRerenderer(cmp, helper) {
        var val = cmp.getValue("v.value");
        var f = cmp.getValue("v.format");
        if (val.isDirty() || f.isDirty()) {
            var formatted = '';
            f = f.unwrap();
            val = val.unwrap();
            if (!$A.util.isUndefinedOrNull(val)) {
                if (!$A.util.isEmpty(f)) {
                    var nf;
                    try {
                        nf = $A.localizationService.getNumberFormat(f);
                    } catch (e) {
                        formatted = "Invalid format attribute";
                        $A.log(e);
                    }
                    if (nf) {
                        formatted = nf.format(val);
                    }
                } else {
                    formatted = $A.localizationService.formatNumber(val);
                }
            }
            var span = cmp.find("span");
            span.getElement().innerText = formatted;
        }
    }
})