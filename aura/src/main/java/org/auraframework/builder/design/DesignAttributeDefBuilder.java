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
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignAttributeDefaultDef;

public interface DesignAttributeDefBuilder extends DefBuilder<DesignAttributeDef, DesignAttributeDef> {
    public DesignAttributeDefBuilder setName(String name);

    public DesignAttributeDefBuilder setLabel(String label);

    public DesignAttributeDefBuilder setType(String type);

    public DesignAttributeDefBuilder setRequired(boolean required);

    public DesignAttributeDefBuilder setReadOnly(boolean readonly);

    public DesignAttributeDefBuilder setDependsOn(String dependency);

    public DesignAttributeDefBuilder setDataSource(String datasource);

    public DesignAttributeDefBuilder setMin(String min);

    public DesignAttributeDefBuilder setMax(String max);

    public DesignAttributeDefBuilder setPlaceholderText(String placeholder);

    public DesignAttributeDefBuilder setDefault(String defaultValue);

    public DesignAttributeDefBuilder setDefault(DesignAttributeDefaultDef defaultValue);

    public DesignAttributeDefBuilder setMinApi(String minApi);

    public DesignAttributeDefBuilder setMaxApi(String maxApi);

    public DesignAttributeDefBuilder setTranslatable(boolean translatable);
}
