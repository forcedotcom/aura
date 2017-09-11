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

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.CSPInliningService;
import org.auraframework.system.AuraContext;

/**
 * common location to maintain state for a given evaluation of inlining rules
 */
public class CSPInliningCriteria {
    private final AuraContext context;
    private final DefDescriptor<? extends BaseComponentDef> applicationDescriptor;
    private CSPInliningService.InlineScriptMode mode;

    public CSPInliningCriteria(AuraContext context) {
        this.context = context;
        this.applicationDescriptor = context.getApplicationDescriptor();
        this.mode = CSPInliningService.InlineScriptMode.UNSUPPORTED;
    }

    public CSPInliningService.InlineScriptMode getMode() {
        return mode;
    }

    public void setMode(CSPInliningService.InlineScriptMode mode) {
        this.mode = mode;
    }

    public AuraContext getContext() {
        return context;
    }

    public DefDescriptor<? extends BaseComponentDef> getApplicationDescriptor() { return applicationDescriptor; }
}
