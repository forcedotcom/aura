/*
 * Copyright (C) 2012 salesforce.com, inc.
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
{
    open : function(cmp, descriptor){
        var evt = $A.get("e.auradocs:openDef");
        evt.setParams({
            descriptor : descriptor,
            defType : "Component"
        });
        evt.fire();
            var stylesheet = "/auraFW/resources/codemirror/css/xmlcolors.css";

            if (desc.indexOf("apex://") == 0) {
                parserFile = ["../contrib/apex/js/tokenizeapex.js", "../contrib/apex/js/parseapex.js"];
                stylesheet = "/auraFW/resources/codemirror/contrib/apex/css/apexcolors.css";
            } else if (desc.indexOf("java://") == 0) {
                parserFile = ["../contrib/java/js/tokenizejava.js", "../contrib/java/js/parsejava.js"];
                stylesheet = "/auraFW/resources/codemirror/contrib/java/css/javacolors.css";
            } else if (desc.indexOf("js://") == 0) {
                parserFile = ["tokenizejavascript.js", "parsejavascript.js"];
                stylesheet = "/auraFW/resources/codemirror/css/jscolors.css";
            } else if (desc.indexOf("css://") == 0) {
                parserFile = "parsecss.js";
                stylesheet = "/auraFW/resources/codemirror/css/csscolors.css";
            }


            cmp.codeMirror = new CodeMirror(container, {
                path: "/auraFW/resources/codemirror/js/",
                parserfile: parserFile,
                stylesheet: stylesheet,
                height: 'dynamic',
                content: cmp.getModel().getValue("code").getValue(),
                lineNumbers: true,
                activeTokens: function(element, token){
                    if (token.style === 'xml-tagname') {
                        var name = aura.util.trim(token.value);
                        var s = element.style;
                        var on = aura.util.on;
                        on(element,"click", function(e){
                            if (e.ctrlKey || e.metaKey) {
                                cmp.get('c.open').run(name);
                                s.textDecoration = 'none';
                                s.fontWeight = 'normal';
                            }
                        });

                        on(element,"mouseover", function(e){
                            if (e.ctrlKey || e.metaKey) {
                                s.textDecoration = 'underline';
                                s.fontWeight = 'bold';
                                s.cursor = 'pointer';
                            }
                        });

                        on(element,"mouseout", function(e){
                            s.textDecoration = 'none';
                            s.fontWeight = 'normal';
                            s.cursor = 'default';
                        });

                    }
                }
            });
        }
    }
}
