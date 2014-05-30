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
    // this is a direct copy of componentRenderer, except using realbody
    render: function(component){
        var body = component.getValue("v.realbody");
        if ($A.getContext().getMode() === 'PTEST') {
            $A.mark("render iteration body " + component.getGlobalId());
        }
        var ret = $A.render(body);
        if ($A.getContext().getMode() === 'PTEST') {
            $A.endMark("render iteration body " + component.getGlobalId());
        }
        return ret;
    },

    afterRender: function(component){
        var body = component.get("v.realbody");
        if ($A.getContext().getMode() === 'PTEST') {
            $A.mark("afterRender iteration body " + component.getGlobalId());
        }
        $A.afterRender(body);
        if ($A.getContext().getMode() === 'PTEST') {
            $A.endMark("afterRender iteration body " + component.getGlobalId());
        }
    },

    rerender: function(component){
        var body = component.get("v.realbody");
        if ($A.getContext().getMode() === 'PTEST') {
            $A.mark("rerender iteration body " + component.getGlobalId());
        }
        var ret = $A.rerender(body);
        if ($A.getContext().getMode() === 'PTEST') {
            $A.endMark("rerender iteration body " + component.getGlobalId());
        }
        return ret
    },

    unrender : function(component){
        var body = component.get("v.realbody");
        if ($A.getContext().getMode() === 'PTEST') {
            $A.mark("unrender iteration body " + component.getGlobalId());
        }
        $A.unrender(body);

        var elements = component.getElements();
        for(var key in elements){
            var element = elements[key];
            delete elements[key];
            aura.util.removeElement(element);
        }
        if ($A.getContext().getMode() === 'PTEST') {
            $A.endMark("unrender iteration body " + component.getGlobalId());
        }
    }
})
