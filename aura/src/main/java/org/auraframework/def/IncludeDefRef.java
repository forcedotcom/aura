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
     * Gets client descriptor
     *
     * @return the client descriptor identifier.
     */
    String getClientDescriptor();

    /**
     * get the client side code for the include.
     *
     * @boolean minify true if the code should be minified.
     */
    String getCode(boolean minify);
}
