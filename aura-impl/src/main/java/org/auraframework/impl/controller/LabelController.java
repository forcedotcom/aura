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
package org.auraframework.impl.controller;

import static org.auraframework.instance.AuraValueProviderType.LABEL;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.GlobalController;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.ContextService;
import org.auraframework.system.Annotations.ActionGroup;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class LabelController implements GlobalController {
    private static final String NAME = "aura://LabelController";

    @Inject
    private ContextService contextService;

    @AuraEnabled
    @ActionGroup(value = "aura")
    public String getLabel(@Key("section") String section, @Key("name") String name) throws QuickFixException {
        GlobalValueProvider labelProvider = contextService.getCurrentContext().getGlobalProviders()
                .get(LABEL.getPrefix());
        PropertyReference labelRef = new PropertyReferenceImpl(section + "." + name, null);
        return (String) labelProvider.getValue(labelRef);
    }

    @Override
    public String getQualifiedName() {
        return NAME;
    }
}
