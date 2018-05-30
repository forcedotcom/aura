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

import java.util.Collections;
import java.util.Map;
import java.util.Set;

import org.auraframework.throwable.quickfix.QuickFixException;

public interface PlatformDef extends BundleDef {

    enum SupportLevel {
        PROTO, DEPRECATED, BETA, GA
    }

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
     * Get the set of tags for this def.
     */
    default Set<String> getTags() { return Collections.emptySet(); };

    /**
     * Supported minimum version
     *
     * @return supported minimum version
     */
    Double getMinVersion();

    SupportLevel getSupport();
}
