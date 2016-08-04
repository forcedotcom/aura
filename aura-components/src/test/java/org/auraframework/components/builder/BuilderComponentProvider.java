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
package org.auraframework.components.builder;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.BuilderService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@ServiceComponentProvider
public class BuilderComponentProvider implements ComponentConfigProvider {
    @Inject
    private DefinitionService definitionService;

    @Inject
    private BuilderService builderService;

    public static AtomicInteger counter = new AtomicInteger(1);

    private String getUniqueName() {
        return "unique"+counter.getAndIncrement();
    }

    @Override
    public ComponentConfig provide() throws QuickFixException {
        String name = getUniqueName();
        DefDescriptor<ComponentDef> newDesc = definitionService.getDefDescriptor("builderComponent:" + name,
                ComponentDef.class);
        ComponentDefRefBuilder contents = builderService.getComponentDefRefBuilder();
        contents.setDescriptor(definitionService.getDefDescriptor("componentTest:builderInjected", ComponentDef.class));
        ComponentDefBuilder builder = builderService.getComponentDefBuilder();
        builder.setDescriptor(newDesc);
        builder.setDescription("A custom built component");
        List<ComponentDefRef> body = Lists.newArrayList();
        body.add(contents.build());
        builder.setFacet("body", body);
        definitionService.getDefRegistry().addLocalDef(builder.build());
        ComponentConfig cc = new ComponentConfig();
        cc.setDescriptor(newDesc);
        return cc;
    }
};
