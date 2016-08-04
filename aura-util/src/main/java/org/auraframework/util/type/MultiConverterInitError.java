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
package org.auraframework.util.type;

import java.util.Set;

public final class MultiConverterInitError implements MultiConverter<Object> {
    private final String error;

    public MultiConverterInitError(String error) {
        this.error = error;
    }

    @Override
    public Object convert(Class<? extends Object> toClass, Object fromValue) {
        throw new ConversionException(error);
    }

    @Override
    public Class<?> getFrom() {
        throw new ConversionException(error);
    }

    @Override
    public Set<Class<?>> getTo() {
        throw new ConversionException(error);
    }
}