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
package org.auraframework.builder.design;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignAttributeDefaultDef;

public interface DesignAttributeDefBuilder extends DefBuilder<DesignAttributeDef, DesignAttributeDef> {
    DesignAttributeDefBuilder setName(String name);

    DesignAttributeDefBuilder setLabel(String label);

    DesignAttributeDefBuilder setType(String type);

    DesignAttributeDefBuilder setRequired(boolean required);

    DesignAttributeDefBuilder setReadOnly(boolean readonly);

    DesignAttributeDefBuilder setDependsOn(String dependency);

    DesignAttributeDefBuilder setDataSource(String datasource);

    DesignAttributeDefBuilder setMin(String min);

    DesignAttributeDefBuilder setMax(String max);

    DesignAttributeDefBuilder setPlaceholderText(String placeholder);

    DesignAttributeDefBuilder setDefault(String defaultValue);

    DesignAttributeDefBuilder setDefault(DesignAttributeDefaultDef defaultValue);

    DesignAttributeDefBuilder setMinApi(String minApi);

    DesignAttributeDefBuilder setMaxApi(String maxApi);

    DesignAttributeDefBuilder setTranslatable(boolean translatable);

    DesignAttributeDefBuilder setParentDescriptor(DefDescriptor<? extends RootDefinition> parent);

    DesignAttributeDefBuilder setIsInternalNamespace(boolean internalNamespace);

    DesignAttributeDefBuilder addAllowedInterface(DefDescriptor<InterfaceDef> allowedInterface);
    
    DesignAttributeDefBuilder setAccessCheck(String accessCheck);
}
