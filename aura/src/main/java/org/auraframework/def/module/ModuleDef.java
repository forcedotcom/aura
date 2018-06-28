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

import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.PlatformDef;
import org.lwc.reference.Reference;

/**
 * Module Definition
 *
 * Extending RootDefinition in order to be used in BundleAwareDefRegistry.
 * However, RootDefinition API needs to be refactored to remove unnecessary APIs.
 */
public interface ModuleDef extends PlatformDef {

    enum CodeType {
        DEV, PROD, COMPAT, PROD_COMPAT
    }

    // arbitrary descriptor prefix for html template
    String TEMPLATE_PREFIX = "template";
    // arbitrary descriptor prefix for metadata
    String META_PREFIX = "meta";
    // prefix for markdown docs
    String MARKDOWN_PREFIX = "markdown";
    // base name of metadata file
    String META_FILE_BASENAME = "lightning";
    // name of xml metadata file
    String META_XML_NAME = META_FILE_BASENAME + "-xml";

    @Override
    DefDescriptor<ModuleDef> getDescriptor();

    String getCode(CodeType codeType);

    String getPath();

    /**
     * Source references
     * @return list of source references
     */
    List<Reference> getSourceReferences();

    /**
     * Metadata references
     * @return list of metadata references
     */
    List<Reference> getMetadataReferences();

    /**
     * Does the module require to be lockerized
     * @return
     */
    Boolean getRequireLocker();

    /**
     * Module design definition
     * @return
     */
    ModuleDesignDef getModuleDesignDef();

    /**
     * For Modules, you reference them in other modules using a custom-element-name syntax vs
     * the standard prefix:name syntax. This will return that custom-element-name value.
     */
    String getCustomElementName();
    
    /**
     * Gets the documentation represented by the markdown file within the bundle.
     * <p>
     * This is the long-form documentation for using this module within LWC. May be null.
     */
    DocumentationDef getDocumentationDef();
    
    /**
     * Gets the documentation represented by the auradoc file within the bundle.
     * <p>
     * This is the long-form documentation for using this module within aura. May be null.
     */
    DocumentationDef getAuraDocumentationDef();
}
