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
package org.auraframework.impl;

import java.io.*;
import java.util.Collection;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.FormatAdapter;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class SerializationServiceImpl implements SerializationService {

    private static final long serialVersionUID = 1658556277689777526L;

    @Override
    public <T> T read(Reader in, Class<T> type) throws IOException, QuickFixException{

        Aura.getContextService().assertEstablished();

        return getFormatAdapter(type).read(in);
    }

    @Override
    public <T> T read(Reader in, Class<T> type, String format) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        return getFormatAdapter(format, type).read(in);
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        return getFormatAdapter(type).readCollection(in);
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type, String format) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        return getFormatAdapter(format, type).readCollection(in);
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException, QuickFixException {
        Aura.getContextService().assertEstablished();

        getFormatAdapter(value.getClass()).write(value, attributes, out);
    }

    @Override
    public <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(type).write(value, attributes, out);
    }

    @Override
    public <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out, String format) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(format, type).write(value, attributes, out);
    }

    @Override
    public <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out)
            throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(type).writeBinary(value, attributes, out);
    }

    @Override
    public <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out,
            String format) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(format, type).writeBinary(value, attributes, out);
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(type).writeCollection(values, out);
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out, String format) throws IOException, QuickFixException {

        Aura.getContextService().assertEstablished();

        getFormatAdapter(format, type).writeCollection(values, out);
    }

    private <T> FormatAdapter<T> getFormatAdapter(Class<T> type) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        return getFormatAdapter(context.getFormat().name(), type);
    }

    private <T> FormatAdapter<T> getFormatAdapter(String format, Class<T> type) throws QuickFixException {
        FormatAdapter<T> ret = AuraImpl.getFormatAdapter(format, type);
        if(ret == null){
            throw new AuraRuntimeException(String.format(
                    "No FormatAdapter found for '%s' in '%s' Format", type.getName(), format));
        }
        return ret;
    }

}
