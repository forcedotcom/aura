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
     * Associate element should only be called once for each component-element pair.
     */
    testComponentEchoingBody : {
        test : function(component) {
            // add a proxy function that logs which component is associating which element
            var log = [];
            var proto = $A.test.getPrototype(component);
            var override = $A.test.addFunctionHandler(proto, "associateElement",
                function(){
                    var config = arguments[0];
                    log.push(this.getDef().getDescriptor() + ":" + this.getGlobalId()
                        + "<-" + config["name"] + ":[" + $A.test.getOuterHtml(config["element"]) + "]");
                }
            );

            // now get a component and render it
            var action = component.get("c.getNamedComponent");
            action.setParams({
                "componentName" : "componentTest:usesBody"
            });
            action.setCallback(component, function(action) {
                $A.renderingService.render(action.getReturnValue(), component.find("render").getElement());
            });
            $A.test.callServerAction(action);

            // check our proxy log for dupe entries
            $A.test.runAfterIf(
                function() {
                    var render = component.find("render").getElement();
                    return render && $A.test.getText(render) && $A.test.getText(render).length > 0;
                },
                function() {
                    override.restore();
                    // output the log for eye candy
                    component.find("results").getElement().innerHTML = log.join("\n");
                    log.sort();
                    var errors = [];
                    for (var i = 1; i < log.length; i ++) {
                        if(log[i - 1] == log[i]){
                            errors.push(log[i]);
                        }
                    }
                    if(errors.length > 0){
                        $A.test.fail("elements were associated with a component multiple times: " + errors.join(","));
                    }
                }
            );
        }
    }
})
