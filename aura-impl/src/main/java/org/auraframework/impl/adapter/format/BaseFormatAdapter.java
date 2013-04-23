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
package org.auraframework.impl.adapter.format;

import java.io.IOException;
import java.io.OutputStream;
import java.io.Reader;
import java.util.Collection;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.adapter.FormatAdapter;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
@ThreadSafe
public abstract class BaseFormatAdapter<T> implements FormatAdapter<T> {

    @Override
    public T read(Reader in) throws IOException, QuickFixException {
        throw new UnsupportedOperationException(String.format("read() not implemented for '%s' in '%s' Format",
                getType().getName(), getFormatName()));
    }

    @Override
    public Collection<T> readCollection(Reader in) throws IOException, QuickFixException {
        throw new UnsupportedOperationException(String.format(
                "readCollection() not implemented for '%s' in '%s' Format", getType().getName(), getFormatName()));
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        throw new UnsupportedOperationException(String.format("write() not implemented for '%s' in '%s' Format",
                getType().getName(), getFormatName()));
    }

    @Override
    public void writeBinary(Object value, Map<String, Object> attributes, OutputStream out) throws IOException,
            QuickFixException {
        throw new UnsupportedOperationException(String.format("writeBinary() not implemented for '%s' in '%s' Format",
                getType().getName(), getFormatName()));
    }

    @Override
    public void writeCollection(Collection<? extends T> values, Appendable out) throws IOException, QuickFixException {
        throw new UnsupportedOperationException(String.format(
                "writeCollection() not implemented for '%s' in '%s' Format", getType().getName(), getFormatName()));
    }
}
