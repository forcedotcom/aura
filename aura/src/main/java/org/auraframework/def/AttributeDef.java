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

/**
 * FIXME(goliver)-SHALOM: This should not be a definition.
 */
public interface AttributeDef extends Definition, ParentedDef {
    @Override
    DefDescriptor<AttributeDef> getDescriptor();

    enum SerializeToType {
        SERVER, BOTH, NONE, INVALID
    };

    /**
     * @return The default value to be used for instances of this AttributeDef
     *         that do not have a Value explicitly set
     */
    AttributeDefRef getDefaultValue();

    /**
     * Get the type def for this attribute.
     *
     * @deprecated use #getTypeDesc
     */
    @Deprecated
    TypeDef getTypeDef() throws QuickFixException;

    /**
     * Get the descriptor for the type of this attribute.
     *
     * If you need the def, you should use definition service.
     *
     * @return the descriptor.
     */
    DefDescriptor<TypeDef> getTypeDesc();

    boolean isRequired();

    SerializeToType getSerializeTo();
}
