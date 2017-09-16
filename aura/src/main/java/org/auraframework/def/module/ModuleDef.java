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
package org.auraframework.def.module;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;

/**
 * Module Definition
 */
public interface ModuleDef extends Definition {

    enum CodeType {
        DEV, PROD, COMPAT, PROD_COMPAT
    }

    // arbitrary descriptor prefix for html template
    String TEMPLATE_PREFIX = "template";
    // arbitrary descriptor prefix for metadata
    String META_PREFIX = "meta";
    // base name of metadata file
    String META_FILE_BASENAME = "lightning";

    @Override
    DefDescriptor<ModuleDef> getDescriptor();

    String getCode(CodeType codeType);

    String getPath();

    Double getMinVersion();
    
    /**
     * @return serialized JSONObject with references to custom metadata
     */
    String getExternalReferences();
}
