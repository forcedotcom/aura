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
 * handler provider for js providers, only allows functions
 */
public class JavascriptProviderHandlerProvider extends JsonHandlerProviderImpl {

    private static final List<String> ALLOWED_METHODS = Arrays.asList("provide");

    @Override
    public JsonObjectHandler getObjectHandler() {
        return new FunctionsOnlyHandler();
    }

    private static class FunctionsOnlyHandler extends JsonObjectHandler {
        @Override
        public void put(String key, Object value) throws JsonValidationException {
            if ((value instanceof JsFunction) && (ALLOWED_METHODS.contains(key))) {
                super.put(key, value);
            }
        }
    }
}
