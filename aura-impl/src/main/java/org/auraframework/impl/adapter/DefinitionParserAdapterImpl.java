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
package org.auraframework.impl.adapter;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

import javax.inject.Inject;
import java.util.Map;

@ServiceComponent
public class DefinitionParserAdapterImpl implements DefinitionParserAdapter {

    private ConfigAdapter configAdapter;

    @Override
    public DefinitionAccess parseAccess(String namespace, String access) throws InvalidAccessValueException {
        return new DefinitionAccessImpl(namespace, access, configAdapter.isInternalNamespace(namespace));
    }

    @Override
    public Map<String, String> getRequiredVersions(DefDescriptor<?> desc) {
        return null;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter adapter) {
        this.configAdapter = adapter;
    }
}
