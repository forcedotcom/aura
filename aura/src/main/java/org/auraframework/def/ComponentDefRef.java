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
package org.auraframework.def;

import java.util.List;
import java.util.Map;

import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.QuickFixException;


/**
 * Interface for component definition references.
 */
public interface ComponentDefRef extends Definition {
    public static enum Load{
        DEFAULT,
        LAZY,
        EXCLUSIVE
    }

    /**
     * FIXME: W-1328556 this method violates the contract with DefDescriptor.
     *
     * These two calls should be used instead, but they cause other bugs.
     *
     * DefDescriptor<ComponentDefRef> getDescriptor();
     * DefDescriptor<ComponentDef> getComponentDescriptor();
     */
    @Override
    DefDescriptor<ComponentDef> getDescriptor();

    Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributeValues();

    AttributeDefRef getAttributeDefRef(String name);

    List<Component> newInstance(BaseComponent<?, ?> valueProvider) throws QuickFixException;

    String getLocalId();

    Load getLoad();

}
