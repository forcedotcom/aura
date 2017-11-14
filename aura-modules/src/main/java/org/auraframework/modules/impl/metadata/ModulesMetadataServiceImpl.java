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

import com.google.gson.Gson;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ModuleDefImpl.Builder;
import org.auraframework.system.AuraContext.Access;

/**
 * Handles module metadata in lightning.json
 */
@ServiceComponent
public class ModulesMetadataServiceImpl implements ModulesMetadataService {

    protected static final Gson GSON = new Gson();

    /**
     * Process lightning.json metadata
     * 
     * @param contents metadata
     * @param moduleBuilder builder for ModuleDef
     */
    @Override
    public void processModuleMetadata(String contents, Builder moduleBuilder) {
        Meta meta = GSON.fromJson(contents, Meta.class);
        processDefaultMetadata(meta, moduleBuilder);
    }

    /**
     * Process default properties of module metadata (lightning.json)
     *
     * @param meta POJO of metadata json
     * @param moduleBuilder builder for ModuleDef
     */
    protected void processDefaultMetadata(Meta meta, Builder moduleBuilder) {
        Double minVersion = meta.getMinVersion();
        if (minVersion != null) {
            moduleBuilder.setMinVersion(minVersion);
        }
        Boolean expose = meta.isExpose();
        if (expose != null && expose) {
            moduleBuilder.setAccess(new DefinitionAccessImpl(Access.GLOBAL));
        }
        Boolean requireLocker = meta.getRequireLocker();
        if (requireLocker != null && requireLocker) {
            moduleBuilder.setRequireLocker(requireLocker);
        }
    }
}
