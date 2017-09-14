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
package org.auraframework.service;

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.FormatAdapter;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for serializing things into format specified in the current
 * {@link AuraContext}
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface SerializationService extends AuraService {

    /**
     * Serialize value to the format of the current {@link AuraContext} and
     * write it to out. Note that this method takes no Class--the
     * SerializationService will attempt to deduce an appropriate type to
     * serialize as, by walking up the value's type hierarchy. If you already
     * know the appropriate type, use the implementation of write that takes a
     * Class argument.
     * 
     * @throws IOException
     * @throws QuickFixException
     */
    <T> void write(T value, Map<String, Object> attributes, Appendable out) throws IOException, QuickFixException;

    /**
     * Serialize value to the named format and write it to out.
     * 
     * @param type The class of the value as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void write(T value, Map<String, Object> attributes, Class<T> type, Appendable out, String format)
            throws IOException, QuickFixException;

    <T> FormatAdapter<T> getFormatAdapter(String format, Class<T> type) throws QuickFixException;
}
