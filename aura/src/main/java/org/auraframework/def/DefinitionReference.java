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
import java.util.Map;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Definition Reference
 */
public interface DefinitionReference extends Definition {

    enum Load {
        DEFAULT, LAZY, EXCLUSIVE
    }

    Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributeValues();

    AttributeDefRef getAttributeDefRef(String name);

    String getLocalId();

    Load getLoad();

    /**
     * Returns true if this ref was marked with aura:flavorable. See {@link FlavoredStyleDef}.
     */
    boolean isFlavorable();

    /**
     * Returns true if a child ComponentDefRef was marked with aura:flavorable. This will be on nested html tags.
     */
    boolean hasFlavorableChild();

    /**
     * Gets the flavor.
     */
    Object getFlavor();

    List<AttributeDefRef> getAttributeValueList() throws QuickFixException;

    DefinitionReference get();

    DefType type();
}
