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
package org.auraframework.builder;

import org.auraframework.def.AttributeDesignDef;

public interface AttributeDesignDefBuilder extends DefBuilder<AttributeDesignDef, AttributeDesignDef> {
    public AttributeDesignDefBuilder setName(String name);

    public AttributeDesignDefBuilder setLabel(String label);

    public AttributeDesignDefBuilder setType(String type);

    public AttributeDesignDefBuilder setRequired(boolean required);

    public AttributeDesignDefBuilder setReadOnly(boolean readonly);

    public AttributeDesignDefBuilder setDependsOn(String dependency);

    public AttributeDesignDefBuilder setDataSource(String datasource);

    public AttributeDesignDefBuilder setMin(String min);

    public AttributeDesignDefBuilder setMax(String max);

    public AttributeDesignDefBuilder setPlaceholderText(String placeholder);
}
