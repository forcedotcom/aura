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
package org.auraframework.http.cspinlining;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSAFEINLINE;

/**
 * AIS or anything based on the template integrationServiceApp uses unsafe inlines
 */
@ServiceComponent
@Order(2)
public class CSPInliningAISRule implements CSPInliningRule{
    private static final String AIS_TEMPLATE_NAME = "aura:integrationServiceApp";
    private DefinitionService definitionService;

    @Override
    public boolean isRelevant(CSPInliningCriteria criteria) {
        return criteria.getMode() != UNSAFEINLINE && criteria.getApplicationDescriptor() != null;
    }

    @Override
    public void process(CSPInliningCriteria criteria) {
        try {
            DefDescriptor<ApplicationDef> aisDescriptor = definitionService.getDefDescriptor(AIS_TEMPLATE_NAME, ApplicationDef.class);
            BaseComponentDef appDefinition = definitionService.getDefinition(criteria.getApplicationDescriptor());

            if (appDefinition.isInstanceOf(aisDescriptor)){
                criteria.setMode(UNSAFEINLINE);
            }
        } catch (QuickFixException e) {
            //we are just rule processing here. no reason to act on this failure. just don't change the mode
        }
    }

    @Autowired
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
}
