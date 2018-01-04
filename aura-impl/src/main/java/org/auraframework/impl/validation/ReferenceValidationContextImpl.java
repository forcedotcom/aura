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
package org.auraframework.impl.validation;

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.validation.ReferenceValidationContext;

public class ReferenceValidationContextImpl extends ErrorAccumulatorImpl implements ReferenceValidationContext {

    private final Map<DefDescriptor<? extends Definition>, Definition> definitionMap;
    private DefDescriptor<?> currentReferencingDescriptor;

    public ReferenceValidationContextImpl(Map<DefDescriptor<? extends Definition>, Definition> definitionMap) {
        this.definitionMap = definitionMap;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T extends Definition> T getAccessibleDefinition(DefDescriptor<T> descriptor) {
        return (T)definitionMap.get(descriptor);
    }

    @Override
    public void setReferencingDescriptor(DefDescriptor<?> descriptor) {
        currentReferencingDescriptor = descriptor;

    }

    @Override
    public DefDescriptor<?> getReferencingDescriptor() {
        return currentReferencingDescriptor;
    }
}
