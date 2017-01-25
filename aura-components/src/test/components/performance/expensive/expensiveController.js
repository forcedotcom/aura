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
    onRender: function(cmp, event, helper) {
        $A.createComponent("markup://performance:expensiveContainer", {}, function onRender$callback(newComponent) {
            performance.mark("Creation Finished");

            var output = cmp.find("appendTo");

            var body = output.get("v.body");
            body.push(newComponent);
            output.set("v.body", body);

            helper.profile(cmp, "Render");
            var start = performance.now();
            $A.render(body, output.getElement());
            var end = performance.now();
            helper.profileEnd(cmp, "Render");

            var render = cmp.find("render").getElement();
            render.innerHTML = end - start + "ms";
        });
    },

    onUnrender: function(cmp, event, helper) {
        
        helper.profile(cmp, "Unrender");
        var start = performance.now();
        $A.unrender(cmp.find("appendTo").get("v.body"));
        var end = performance.now();
        helper.profileEnd(cmp, "Unrender");

        var unrender = cmp.find("unrender").getElement();
        unrender.innerHTML = (end - start) + "ms";
    },

    updateCount: function(component, event, helper) {
        var count = component.find("count").getElement();
        count.innerHTML = $A.componentService.countComponents();
    },

    onRaw: function(component, event, helper) {
        // Measure how long it takes to create and append 24000 raw elements.
        var container = document.createElement("div");
        var output = component.find("raw").getElement();
        var cmps = [];

        var start = performance.now();
        do {
            cmps.push(document.createElement("div"));
            cmps.push(document.createElement("div"));
            cmps.push(document.createElement("span"));
            cmps.push(document.createElement("blockquote"));
            cmps.push(document.createElement("a"));
            cmps.push(document.createElement("span"));
        } while(cmps.length < 2500);

        var last;
        for(var c=0;c<cmps.length;c++) {
            if(last && c % 2) {
                $A.util.appendChild(cmps[c], last);
            } else {
                $A.util.appendChild(cmps[c], container);
            }
            last = cmps[c];
        }

        var end = performance.now();

        var metrics = [end - start + "ms"];

        start = performance.now();

        for(var c=0,length=container.childNodes.length;c<length;c++) {
            //$A.util.removeElement(container.childNodes[c]);
            container.removeChild(container.childNodes[length-c-1]);
        }

        end = performance.now();

        metrics.push(end - start + "ms");

        output.innerHTML = metrics.join(" , ");
    }
})