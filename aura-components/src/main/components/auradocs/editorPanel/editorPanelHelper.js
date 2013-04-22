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
	createCodeMirror: function(cmp) {
		var container = cmp.find("container").getElement();
		var descriptor = cmp.get("v.descriptor");
	    var stylesheet = "/auraFW/resources/codemirror/css/xmlcolors.css";
		var parserFile = "parsexml.js";
		var useLines = true;
        var codeContent = cmp.get("m.code");
		
		if (codeContent == null) {
			useLines = false;
			codeContent = "(Source code not available for " + descriptor + ")";
		} else if (descriptor.indexOf("apex://") == 0) {
			parserFile = ["../contrib/apex/js/tokenizeapex.js", "../contrib/apex/js/parseapex.js"];
			stylesheet = "/auraFW/resources/codemirror/contrib/apex/css/apexcolors.css";
		} else if (descriptor.indexOf("java://") == 0) {
			parserFile = ["../contrib/java/js/tokenizejava.js", "../contrib/java/js/parsejava.js"];
			stylesheet = "/auraFW/resources/codemirror/contrib/java/css/javacolors.css";
		} else if (descriptor.indexOf("js://") == 0) {
			parserFile = ["tokenizejavascript.js", "parsejavascript.js"];
			stylesheet = "/auraFW/resources/codemirror/css/jscolors.css";
		} else if (descriptor.indexOf("css://") == 0) {
			parserFile = "parsecss.js";
			stylesheet = "/auraFW/resources/codemirror/css/csscolors.css";
		}

		cmp.codeMirror = new CodeMirror(container, {
			path: "/auraFW/resources/codemirror/js/",
			parserfile: parserFile,
			stylesheet: stylesheet,
			height: 'dynamic',
			content: codeContent,
			lineNumbers: useLines,
			activeTokens: function(element, token) {
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
})