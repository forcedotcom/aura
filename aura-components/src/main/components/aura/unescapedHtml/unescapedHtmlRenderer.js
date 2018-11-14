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
    render : function(cmp){
        var value = cmp.get("v.value");
        if ($A.util.isUndefinedOrNull(value)) {
            value = "";
        } else {
            var cfg = {
                FORBID_TAGS: ["style", "meta", "script", "link"],
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ["allowfullscreen","allow","referrerpolicy","sandbox","target"]
            };
            if ($A.get("$Global")["srcdoc"]) {
                // only if the current gvp is set to allow srcdoc
                // otherwise this should be scrubbed
                cfg.ADD_ATTR.push("srcdoc");
            }
            value = $A.util.sanitizeDOM(value, cfg);
        }
        var elements=$A.util.createElementsFromMarkup(value);
        if(!elements.length){
            elements=$A.renderingService.renderFacet(cmp,elements);
        }
        return elements;
    },

    rerender : function(cmp){
        if (cmp.isDirty("v.value")) {
            var el = cmp.getElement();
            var placeholder=null;
            if(el){
                placeholder = document.createTextNode("");
                $A.util.insertBefore(placeholder, el);
            }else{
                placeholder=$A.renderingService.getMarker(cmp);
            }
            $A.unrender(cmp);
            var results = $A.render(cmp);
            if(results.length){
                $A.util.insertBefore(results, placeholder);
                $A.afterRender(cmp);
            }
        }
    },

    unrender: function(cmp) {
        var elements = cmp.getElements();
        for(var c=0;c<elements.length;c++) {
            $A.util.removeElement(elements[c]);
        }
        cmp.disassociateElements();
    }
})// eslint-disable-line semi
