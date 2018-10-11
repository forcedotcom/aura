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

package org.auraframework.def.genericxml;

import java.util.Set;

import org.auraframework.adapter.AuraAdapter;

/**
 * Extend this class to allow {@link GenericXmlCapableDef} to parse a tag setup by the implementor.
 */
public abstract class RootLevelGenericXmlValidator extends GenericXmlValidator implements AuraAdapter {
    private final Class<? extends GenericXmlCapableDef> parentTag;

    public RootLevelGenericXmlValidator(String tag, Set<GenericXmlValidator> childValidators,
            Class<? extends GenericXmlCapableDef> parentDef) {
        super(tag, childValidators);
        this.parentTag = parentDef;
    }
    
    public RootLevelGenericXmlValidator(String tag, Class<? extends GenericXmlCapableDef> parentDef) {
        super(tag);
        this.parentTag = parentDef;
    }

    public final Class<? extends GenericXmlCapableDef> getParentTag() {
        return parentTag;
    }
}
