/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 */
public interface AttributeDefRef extends Definition {
    /**
     * FIXME: W-1328558 this method violates the contract with DefDescriptor.
     * 
     * These two calls should be used instead, but they cause other bugs.
     * 
     * DefDescriptor<AttributeDefRef> getDescriptor();
     * DefDescriptor<AttributeDef> getAttributeDescriptor();
     */
    @Override
    DefDescriptor<AttributeDef> getDescriptor();

    /**
     * @return Returns the value.
     */
    Object getValue();

    /**
     * Parses the value stored in this defref using the passed in type
     * definition. This MUST be called during the validateReferences compilation
     * phase or this defref may represent a literal value that is not of the
     * expected type (i.e. string instead of number)
     * 
     * TODO: when getDescriptor().getDef().getTypeDef() is fixed, this won't be
     * needed anymore
     * 
     * @param typeDef type of the attribute to try to parse to
     */
    void parseValue(TypeDef typeDef) throws QuickFixException;
}
