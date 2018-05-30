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
package org.auraframework.integration.test.root.application;

import javax.inject.Inject;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.EventDef;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl.Builder;
import org.auraframework.impl.root.component.BaseComponentDefImplUnitTest;
import org.auraframework.service.DefinitionService;
import org.mockito.Mock;
import org.mockito.Mockito;

public class ApplicationDefImplUnitTest extends
        BaseComponentDefImplUnitTest<ApplicationDefImpl, ApplicationDef, Builder> {

	@Inject
    DefinitionService definitionService;

    @Mock
    DefDescriptor<EventDef> locationChangeEventDescriptor;
    DefinitionAccess access;
    Boolean isAppcacheEnabled;
    String additionalAppCacheURLs;

    public ApplicationDefImplUnitTest() {
        descriptorName = "application";
        qualifiedDescriptorName = "test:application";
    }

    @Override
    protected Builder getBuilder() {
        return new Builder();
    }

    @Override
    protected ApplicationDef buildDefinition(Builder builder) throws Exception {
        builder.locationChangeEventDescriptor = this.locationChangeEventDescriptor;
        builder.setAccess(this.access);
        builder.isAppcacheEnabled = this.isAppcacheEnabled;
        builder.additionalAppCacheURLs = this.additionalAppCacheURLs;
        return super.buildDefinition(builder);
    }

    @Override
    protected void setupValidateReferences() throws Exception {
        super.setupValidateReferences();
        DefDescriptor<EventDef> superDesc = definitionService.getDefDescriptor("aura:locationChange",
                EventDef.class);
        EventDef locationChangeEventDef = Mockito.mock(EventDef.class);
        Mockito.doReturn(true).when(locationChangeEventDef).isInstanceOf(superDesc);
        Mockito.doReturn(locationChangeEventDef).when(this.locationChangeEventDescriptor).getDef();
    }
}
