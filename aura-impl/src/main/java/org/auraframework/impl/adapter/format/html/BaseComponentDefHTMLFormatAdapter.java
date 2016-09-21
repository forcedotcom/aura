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

import java.io.IOException;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.ServerService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

@ThreadSafe
@ServiceComponent
public abstract class BaseComponentDefHTMLFormatAdapter<T extends BaseComponentDef> extends HTMLFormatAdapter<T> {
   
    @Inject
    private ContextService contextService;
    
    @Inject
    private ServerService serverService;

    @Inject
    private RenderingService renderingService;
    
    @Override
    public void write(T value, Map<String, Object> componentAttributes, Appendable out) throws IOException {
        try {
            Component template = serverService.writeTemplate(contextService.getCurrentContext(), value, componentAttributes, out);
            renderingService.render(template, out, null);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

}
