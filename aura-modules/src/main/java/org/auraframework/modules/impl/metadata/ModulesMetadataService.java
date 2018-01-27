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
package org.auraframework.modules.impl.metadata;

import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Set;

/**
 * Handle metadata for modules
 */
public interface ModulesMetadataService {
    /**
     * Process JSON metadata for modules and apply values to ModuleDef via its builder
     * TODO: remove once meta.xml is in place
     *
     * @param source JSON metadata
     * @param moduleBuilder builder for ModuleDef
     */
    void processModuleMetadata(TextSource source, ModuleDefImpl.Builder moduleBuilder) throws QuickFixException;

    /**
     * Process XML metadata for modules and apply values to ModuleDef via its builder
     *
     * @param source XML metadata
     * @param moduleBuilder builder for ModuleDef
     */
    void processMetadata(TextSource source, ModuleDefImpl.Builder moduleBuilder) throws QuickFixException;

    /**
     * Valid tags
     * @return set of valid tags
     */
    Set<String> getValidTags();
}
