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
package org.auraframework.test;

import java.util.Set;

import org.auraframework.def.Definition;

import com.google.common.collect.Sets;

/**
 * Represent the context of a test.
 */
public class TestContextImpl implements TestContext {
    private final String name;
    private Set<Definition> localDefs;
    
    public TestContextImpl(String name){
        this.name = (name == null ? "" : name);
    }
    
    @Override
    public String getName() {
        return name;
    }
    
    @Override
    public String toString() {
        return "TestContext(" + name + ")";
    }

	// name should be unique in system, so use it for hashCode and equals
    @Override
    public int hashCode() {
        return name.hashCode();
    }
    
    @Override
    public boolean equals(Object other) {
        if (!(other instanceof TestContextImpl)) {
            return false;
        } else {
            return name.equals(((TestContextImpl)other).name);
        }
    }

    @Override
    public Set<Definition> getLocalDefs() {
        if (localDefs == null) {
            localDefs = Sets.newLinkedHashSet();
        }
        return localDefs;
    }
}
