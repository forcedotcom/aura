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
package org.auraframework.test.mock;

import java.io.IOException;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class MockValueDef extends MockDefinition<ValueDef> implements ValueDef {
	private static final long serialVersionUID = -5833396673469713690L;
	private final String name;
    private final DefDescriptor<TypeDef> typeDescriptor;

    public MockValueDef(String name, Class<?> type) {
        this(name, Aura.getDefinitionService().getDefDescriptor("java://" + type.getName(), TypeDef.class));
    }

    public MockValueDef(String name, DefDescriptor<TypeDef> typeDefDescriptor) {
        super(null);
        this.name = name;
        this.typeDescriptor = typeDefDescriptor;
    }
    
    @Override
    public String getName() {
        return name;
    }

    @Override
    public TypeDef getType() throws QuickFixException {
        return typeDescriptor.getDef();
    }
    
    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", getName());
        json.writeMapEntry("type", typeDescriptor);
        json.writeMapEnd();
    }
}
