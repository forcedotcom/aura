/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.renderer.sampleJavaRenderers;

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.integration.Integration;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

public class RendererToInjectCmpWithNullLocalId implements Renderer {

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        String desc = (String)component.getAttributes().getValue("desc");
        @SuppressWarnings("unchecked")
        Map<String,Object> attr = (Map<String,Object>)component.getAttributes().getValue("attrMap");
        String placeholder = (String)component.getAttributes().getValue("placeholder");
        
        out.append(String.format("<div id='%s' style='border: 1px solid black'/>", placeholder));
        
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        Integration integration = Aura.getIntegrationService().createIntegration(
                "", Mode.DEV);
        integration.injectApplication(out);
        integration.injectComponent(desc, attr, null , "placeholder" , out);
        
        //The only not-so-ideal part of this approach to testing IntegrationService is that we have to start the 
        //context for the rendering of the original stub component to continue. IntegrationService sets up and tears down its context.
        Aura.getContextService().startContext(ctx.getMode(), ctx.getFormat(), ctx.getAccess(), ctx.getApplicationDescriptor());

    }

}
