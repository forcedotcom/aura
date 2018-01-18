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

import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.List;
import java.util.Map;

public interface PlatformDef extends Definition {

    @Override
    DefDescriptor<? extends PlatformDef> getDescriptor();

    /**
     * @return all the attributes for this component, including those inherited from a super component
     * @throws QuickFixException
     */
    Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException;

    /**
     * @param name
     * @return The named AttributeDef
     * @throws QuickFixException
     */
    AttributeDef getAttributeDef(String name) throws QuickFixException;

    /**
     * Associated Tags
     * @return list of tags
     */
    List<String> getTags();

    /**
     * Supported minimum version
     *
     * @return supported minimum version
     */
    Double getMinVersion();
}
