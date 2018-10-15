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
package org.auraframework.def.module.impl;

import java.util.Collection;

import org.auraframework.def.module.ModuleExample;
import org.auraframework.def.module.ModuleExampleFile;

public class ModuleExampleImpl implements ModuleExample {

    private static final long serialVersionUID = 1330236961200924002L;

    private String name;
    private String label;
    private String description;
    private Collection<ModuleExampleFile> contents;

    public ModuleExampleImpl(String name, String label, String description,
            Collection<ModuleExampleFile> contents) {
        this.name = name;
        this.label = label;
        this.description = description;
        this.contents = contents;
    }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public String getLabel() {
        return this.label;
    }

    @Override
    public String getDescription() {
        return this.description;
    }

    @Override
    public Collection<ModuleExampleFile> getContents() {
        return contents;
    }

    @Override
    public String toString() {
        return String.format("ModuleExample [name=%s, label=%s, description=%s]", this.name, this.label,
                this.description);
    }
}
