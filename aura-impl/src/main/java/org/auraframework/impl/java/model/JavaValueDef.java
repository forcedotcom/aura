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
package org.auraframework.impl.java.model;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaValueDef extends DefinitionImpl<ValueDef> implements ValueDef {

    private static final long serialVersionUID = -7521775908015844875L;

    public static final String GET = "get";
    public static final String IS = "is";

    private final String name;
    private final DefDescriptor<TypeDef> typeDescriptor;
    private final Method getter;

    public JavaValueDef(String name, DefDescriptor<TypeDef> typeDescriptor, Location location) {
        super(null, location);
        this.name = name;
        this.typeDescriptor = typeDescriptor;
        this.getter = null;
    }

    public JavaValueDef(String name, Method getter, DefDescriptor<TypeDef> typeDescriptor, Location location) {
        super(null, location);
        this.name = name;
        this.getter = getter;
        this.typeDescriptor = typeDescriptor;
    }

    public static String getMemberName(String name) {
        if (name.startsWith(GET)) {
            name = name.substring(GET.length());
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
        } else if (name.startsWith(IS)) {
            name = name.substring(IS.length());
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
        }
        return name;
    }

    @Override
    public TypeDef getType() throws QuickFixException {
        return typeDescriptor.getDef();
    }

    /**
     * Retrieves the value defined by this param from the passed in object. This
     * method should be templated and defined in the interface, because the same
     * thing exists in its apex counterpart.
     */
    public Object getValueFrom(Object obj) {
        try {
            LoggingService loggingService = Aura.getLoggingService();
            loggingService.incrementNum("JavaCallCount");
            return getter.invoke(obj);
        } catch (IllegalArgumentException e) {
            throw new AuraRuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new AuraRuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new AuraExecutionException(e.getCause().getMessage(), this.location, e.getCause());
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", getName());
        json.writeMapEntry("type", typeDescriptor);
        json.writeMapEnd();
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return name + ": " + this.typeDescriptor;
    }
}
