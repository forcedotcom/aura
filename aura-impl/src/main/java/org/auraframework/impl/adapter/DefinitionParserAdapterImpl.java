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

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class DefinitionParserAdapterImpl implements DefinitionParserAdapter {

    @Override
    public DefinitionAccess parseAccess(String namespace, String access) throws InvalidAccessValueException {
        return new DefinitionAccessImpl(namespace, access);
    }

}
