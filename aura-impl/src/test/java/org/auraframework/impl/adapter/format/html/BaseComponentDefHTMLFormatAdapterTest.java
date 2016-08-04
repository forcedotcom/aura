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
package org.auraframework.impl.adapter.format.html;

import org.auraframework.adapter.FormatAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext.Format;

import javax.inject.Inject;

/**
 * Shared stuff for the child tests.
 */
public abstract class BaseComponentDefHTMLFormatAdapterTest<T extends Definition> extends AuraImplTestCase {
    public abstract Class<T> getDefClass();

    @Inject
    private SerializationService serializationService;

    @SuppressWarnings("unchecked")
    protected String doWrite(T def) throws Exception {
        contextService.getCurrentContext().setApplicationDescriptor((DefDescriptor<? extends BaseComponentDef>) def.getDescriptor());
        FormatAdapter<T> adapter = serializationService.getFormatAdapter(Format.HTML.name(), getDefClass());
        adapter.getClass().asSubclass(BaseComponentDefHTMLFormatAdapter.class);
        StringBuffer out = new StringBuffer();
        adapter.write(def, null, out);
        return out.toString();
    }
}
