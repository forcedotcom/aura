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
package org.auraframework.impl.java.controller;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl.Builder;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.service.BuilderService;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;

@ServiceComponent
public class TestSerializeAbsentLayout implements Controller {

    @Inject
    private CachingService cachingService;

    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private BuilderService builderService;

    @AuraEnabled
    public ComponentDefRefImpl getLayout() throws QuickFixException {
        final String dynamicDependentComponent = "auratest:componentClassChild";
        final long timestamp = System.nanoTime();

        // Services
        final AuraContext context = contextService.getCurrentContext();
        final DefinitionService ds = definitionService;

        // Build Layout
        Builder builder = new ComponentDefImpl.Builder();
        builder.setAccess(new DefinitionAccessImpl(Access.GLOBAL));
        builder.setDescriptor("layout://test_" + timestamp + ":" + timestamp);
        ComponentDef cmpDef = builder.build();

        // Invalidate that we already sent down the auratest:componentClassChild component
        // which as a side effect included the auradev:componentClass component
        DefDescriptor<ComponentDef> componentClassDef = ds.getDefDescriptor(dynamicDependentComponent, ComponentDef.class);
        cachingService.getDefsCache().invalidate(componentClassDef);
        ;

        // Add the dependency
        MasterDefRegistry mdr = context.getDefRegistry();
        mdr.addLocalDef(cmpDef);

        // Return the component so our dependencies are included in the request.
        ComponentDefRefBuilder subbuilder = builderService.getComponentDefRefBuilder();
        subbuilder.setAccess(new DefinitionAccessImpl(Access.GLOBAL));
        subbuilder.setDescriptor(dynamicDependentComponent);

        return (ComponentDefRefImpl) subbuilder.build();
    }

}
