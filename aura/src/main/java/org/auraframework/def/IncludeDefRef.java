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
package org.auraframework.def;

import java.util.List;

import org.auraframework.throwable.quickfix.QuickFixException;

public interface IncludeDefRef extends Definition {

    @Override
    public DefDescriptor<IncludeDef> getDescriptor();

	/**
     * Gets the list of imports.
     *
     * @return the client descriptor.
     */
	List<DefDescriptor<IncludeDef>> getImports();

	/**
     * Gets the list of JavaScript identifiers to alias the imports inside the module.
     *
     * @return the list of aliases identifiers.
     */
	List<String> getAliases();

	/**
     * Gets the JavaScript identifier return from the module.
     *
     * @return the export identifier.
     */
	String getExport();

	/**
     * Gets the client JavaScript code, normally a client class.
     * @param minify whether to return minified code or not.
     * @return the client JavaScript code.
     * @throws QuickFixException
     */
    String getCode(boolean minify) throws QuickFixException;
}
