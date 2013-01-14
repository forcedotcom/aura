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
package org.auraframework.util.json;

public interface JsonHandlerProvider {
    /**
     * This will be called for every entry in a map. If you want to provide a
     * special handler for that key, return its handler. If you return null, the
     * default handler implementation will be used.
     * 
     * @param key The key in the parent object for which the handler is being
     *            requested.
     */
    JsonHandlerProvider getObjectEntryHandlerProvider(String key);

    /**
     * This will be called once each time an array is read. The returned handler
     * provider will be used to get a handler for each object or array within
     * the array. If you return null, the default handler implementation will be
     * used.
     */
    JsonHandlerProvider getArrayEntryHandlerProvider();

    /**
     * Return a handler to be used for reading an object.
     */
    JsonObjectHandler getObjectHandler();

    /**
     * Return a handler to be used for reading an array.
     */
    JsonArrayHandler getArrayHandler();
}
