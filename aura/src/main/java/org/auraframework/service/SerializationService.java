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
package org.auraframework.service;

import java.io.IOException;
import java.io.OutputStream;
import java.io.Reader;
import java.util.Collection;
import java.util.Map;

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
     * Deserialize a value from the format of the current {@link AuraContext}
     * 
     * @param type The class of the type of value to return as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     * @throws QuickFixException
     */
    <T> T read(Reader in, Class<T> type) throws IOException, QuickFixException;

    /**
     * Deserialize a value from the named format
     * 
     * @param type The class of the type of value to return as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     * @throws QuickFixException
     */
    <T> T read(Reader in, Class<T> type, String format) throws IOException, QuickFixException;

    /**
     * Deserialize a Collection of values from the format of the current
     * {@link AuraContext}
     * 
     * @param type The class of the type of values to return as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     * @throws QuickFixException
     */
    <T> Collection<T> readCollection(Reader in, Class<T> type) throws IOException, QuickFixException;

    /**
     * Deserialize a Collection of values from the named format
     * 
     * @param type The class of the type of values to return as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     * @throws QuickFixException
     */
    <T> Collection<T> readCollection(Reader in, Class<T> type, String format) throws IOException, QuickFixException;

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

    void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException, QuickFixException;

    /**
     * Serialize value to the format of the current {@link AuraContext} and
     * write it to out.
     * 
     * @param type The class of the value as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out) throws IOException,
            QuickFixException;

    /**
     * Serialize value to the named format and write it to out.
     * 
     * @param type The class of the value as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out, String format)
            throws IOException, QuickFixException;

    /**
     * Serialize value to the format of the current {@link AuraContext} and
     * write it to out.
     * 
     * @param type The class of the value as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out)
            throws IOException, QuickFixException;

    /**
     * Serialize value to the named format and write it to out.
     * 
     * @param type The class of the value as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out, String format)
            throws IOException, QuickFixException;

    /**
     * Serialize values to the format of the current {@link AuraContext} and
     * write it them to out.
     * 
     * @param type The class of the values as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out) throws IOException,
            QuickFixException;

    /**
     * Serialize values to the named format and write it them to out.
     * 
     * @param type The class of the values as retrieved from
     *            {@link DefType#getPrimaryInterface()}
     * @throws IOException
     */
    <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out, String format)
            throws IOException, QuickFixException;
}
