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
package org.auraframework.impl.javascript.parser.handler;

import java.util.Arrays;
import java.util.List;

import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.JsonHandlerProviderImpl;
import org.auraframework.util.json.JsonObjectHandler;

/**
 * handler provider for js renderers, only allows functions
 */
public class JavascriptRendererHandlerProvider extends JsonHandlerProviderImpl {

    private static final List<String> ALLOWED_METHODS = Arrays.asList("render", "afterRender", "rerender", "unrender");

    @Override
    public JsonObjectHandler getObjectHandler() {
        return new FunctionsOnlyHandler();
    }

    private static class FunctionsOnlyHandler extends JsonObjectHandler {
        @Override
        public void put(String key, Object value) throws JsonValidationException {
            if (value instanceof JsFunction && ALLOWED_METHODS.contains(key)) {
                super.put(key, remapSuper(key, (JsFunction) value));
            }
        }
    }

    /**
     * This method edits the call to the superMethod. Calling super methods on the
     * renderer was a questionable pattern because it forces us to create an instance
     * of the renderer at each level of the component inheritance just to hold a
     * reference on the component.
     */
    private static JsFunction remapSuper(String name, JsFunction function) {

    	// Get the name of the first argument, if not supplied, add a default one.
    	List<String> arguments = function.getArguments();
    	String cmp;
    	if (arguments.size() > 0) {
            cmp = arguments.get(0);
        } else {
        	cmp = "cmp";
        	arguments.add(cmp);
        }

        // Re-scope the call to the super method .
        String body = function.getBody();
        String superMethodName = "super" + Character.toString(name.charAt(0)).toUpperCase() + name.substring(1);
		body = body.replace("this." + superMethodName,  cmp + "." + superMethodName);

        // Return an updated function.
        return new JsFunction(arguments, body);
    }
 }
