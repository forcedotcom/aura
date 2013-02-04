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
package org.auraframework.impl.javascript.model;

import java.io.IOException;

import org.auraframework.def.*;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavascriptValueDef extends DefinitionImpl<ValueDef> implements ValueDef {

	private static final long serialVersionUID = 2067396461975067980L;
	private final String name;
    private final DefDescriptor<TypeDef> typeDescriptor;
    private final Object defaultValue;

    protected JavascriptValueDef(String name, DefDescriptor<TypeDef> typeDescriptor, Object defaultValue,
            Location location) {
        super(null, location);
        this.name = name;
        this.typeDescriptor = typeDescriptor;
        this.defaultValue = defaultValue;
    }

    public Object getDefaultValue() {
        return defaultValue;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", name);
        json.writeMapEntry("type", typeDescriptor);
        json.writeMapEntry("defaultValue", defaultValue);
        json.writeMapEnd();
    }

    @Override
    public TypeDef getType() throws QuickFixException {
        return typeDescriptor.getDef();
    }

}
