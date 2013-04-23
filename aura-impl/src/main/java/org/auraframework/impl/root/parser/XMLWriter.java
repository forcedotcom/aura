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
package org.auraframework.impl.root.parser;

import java.io.Writer;
import java.util.Map;

import org.auraframework.def.Definition;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.component.ForEachDefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.root.event.EventHandlerDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.root.parser.handler.ApplicationDefHandler;
import org.auraframework.impl.root.parser.handler.AttributeDefHandler;
import org.auraframework.impl.root.parser.handler.AttributeDefRefHandler;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.impl.root.parser.handler.ComponentDefRefHandler;
import org.auraframework.impl.root.parser.handler.EventDefHandler;
import org.auraframework.impl.root.parser.handler.EventHandlerDefHandler;
import org.auraframework.impl.root.parser.handler.ForEachDefHandler;
import org.auraframework.impl.root.parser.handler.InterfaceDefHandler;
import org.auraframework.impl.root.parser.handler.RegisterEventHandler;
import org.auraframework.impl.root.parser.handler.XMLHandler;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.Maps;

/**
 */
public class XMLWriter implements org.auraframework.system.SourceWriter {

    private static final XMLWriter instance = new XMLWriter();

    private final Map<Class<? extends Definition>, XMLHandler<?>> handlers = Maps.newHashMap();

    @SuppressWarnings("rawtypes")
    public XMLWriter() {
        handlers.put(ApplicationDefImpl.class, new ApplicationDefHandler());
        handlers.put(AttributeDefImpl.class, new AttributeDefHandler());
        handlers.put(AttributeDefRefImpl.class, new AttributeDefRefHandler());
        handlers.put(ComponentDefImpl.class, new ComponentDefHandler());
        handlers.put(ComponentDefRefImpl.class, new ComponentDefRefHandler());
        handlers.put(EventDefImpl.class, new EventDefHandler());
        handlers.put(EventHandlerDefImpl.class, new EventHandlerDefHandler());
        handlers.put(ForEachDefImpl.class, new ForEachDefHandler());
        handlers.put(InterfaceDefImpl.class, new InterfaceDefHandler());
        handlers.put(RegisterEventDefImpl.class, new RegisterEventHandler());
    }

    /**
     * @return Returns the instance.
     */
    public static XMLWriter getInstance() {
        return instance;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> void write(D def, Source<?> source) {
        Writer sourceWriter = source.getWriter();
        try {
            Class<?> clz = def.getClass();
            XMLHandler<D> handler = (XMLHandler<D>) handlers.get(clz);
            handler.writeElement(def, sourceWriter);
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        } finally {
            try {
                sourceWriter.flush();
                sourceWriter.close();
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
        }
    }

    public Map<Class<? extends Definition>, XMLHandler<?>> getHandlers() {
        return handlers;
    }
}
