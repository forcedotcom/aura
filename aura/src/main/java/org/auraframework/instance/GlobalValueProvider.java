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
package org.auraframework.instance;

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

/**
 * value providers for $ stuff that is not component specific, there is only 1 instance
 */
public interface GlobalValueProvider extends ValueProvider {

    /**
     * @return type of data this provides
     */
    ValueProviderType getValueProviderKey();

    /**
     * eventually will be used for type validation
     */
    DefDescriptor<TypeDef> getReturnTypeDef();

    /**
     * TODO: this should be in valueprovider
     *
     * @param expr the property reference to validate
     * @throws InvalidExpressionException if validation fails
     */
    void validate(PropertyReference expr) throws InvalidExpressionException;

    /**
     * @return true if this provider has no values to send to the client
     */
    boolean isEmpty();

    /**
     * @return map of data to be serialized to client
     */
    Map<String, ?> getData();
}
