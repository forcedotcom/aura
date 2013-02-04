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
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Model;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;

public class JavascriptModelDef extends DefinitionImpl<ModelDef> implements ModelDef {

	private static final long serialVersionUID = -7806398631336437625L;
	private final Map<String, JavascriptValueDef> memberMap;

    protected JavascriptModelDef(Builder builder) {
        super(builder);
        this.memberMap = AuraUtil.immutableMap(builder.memberMap);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("members", memberMap.values());
        json.writeMapEnd();
    }

    @Override
    public ValueDef getMemberByName(String name) {
        return memberMap.get(name);
    }

    protected Collection<JavascriptValueDef> getAllMembers() {
        return memberMap.values();
    }

    @Override
    public boolean hasMembers() {
        return !memberMap.isEmpty();
    }

    @Override
    public Model newInstance() {
        return new JavascriptModel(this);
    }

    @Override
    public TypeDef getType(String s) throws QuickFixException {
        return getMemberByName(s).getType();
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ModelDef> {

        public Builder() {
            super(ModelDef.class);
        }

        private Map<String, JavascriptValueDef> memberMap = Maps.newHashMap();

        public void addProperty(String key, Object val, Location location) throws QuickFixException {
            DefDescriptor<TypeDef> type = null;
            DefinitionService defService = Aura.getDefinitionService();
            if (val == null || val instanceof Map) {
                // Object
                type = defService.getDefDescriptor("aura://Object", TypeDef.class);
            } else if (val instanceof List) {
                // Array
                type = defService.getDefDescriptor("aura://List", TypeDef.class);
            } else if (val instanceof String) {
                // String
                type = defService.getDefDescriptor("aura://String", TypeDef.class);
            } else if (val instanceof Boolean) {
                // Boolean
                type = defService.getDefDescriptor("aura://Boolean", TypeDef.class);
            } else if (val instanceof Number) {
                // Number
                type = defService.getDefDescriptor("aura://Decimal", TypeDef.class);
            } else {
                throw new InvalidDefinitionException("Invalid value type in model definition.", getLocation());
            }

            JavascriptValueDef value = new JavascriptValueDef(key, type, val, location);
            memberMap.put(key, value);
        }

        @Override
        public JavascriptModelDef build() throws QuickFixException {

            return new JavascriptModelDef(this);
        }
    }

}
