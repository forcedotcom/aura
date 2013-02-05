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
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.Model;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * A simple ModelDef that provides a MockModel instance.
 */
public class MockModelDef extends MockDefinition<ModelDef> implements ModelDef {
	private static final long serialVersionUID = 8237818157530284425L;
	private final Map<String, ValueDef> members;
    private final List<Answer<Model>> instances;

    public MockModelDef(DefDescriptor<ModelDef> descriptor, Set<ValueDef> members, List<Answer<Model>> instances) {
        super(descriptor);
        this.members = Maps.newLinkedHashMap();
        if (members != null) {
            for (ValueDef val : members) {
                this.members.put(val.getName(), val);
            }
        }
        this.instances = instances != null ? Lists.newLinkedList(instances) : Lists.<Answer<Model>> newLinkedList();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("members", members.values());
        json.writeMapEnd();
    }

    @Override
    public Model newInstance() {
        if (instances.isEmpty()) {
            return null;
        }
        try {
            if (instances.size() > 1) {
                return instances.remove(0).answer();
            } else {
                return instances.get(0).answer();
            }
        } catch (Throwable e) {
            throw new AuraRuntimeException(e);
        }
    }

    @Override
    public ValueDef getMemberByName(String name) {
        return members.get(name);
    }

    @Override
    public boolean hasMembers() {
        return !members.isEmpty();
    }

    @Override
    public TypeDef getType(String s) throws QuickFixException {
        return getMemberByName(s).getType();
    }
}
