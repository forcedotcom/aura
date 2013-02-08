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
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.Renderer;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.integration.Integration;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class RendererToInjectComponentAsAttributes implements Renderer {

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        String desc = (String)component.getAttributes().getValue("desc");
        Map<String, Object> auratextAttr = Maps.newHashMap();
        auratextAttr.put("value", "Grape Fruit");
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor("markup://aura:text");

        builder.setAttribute("value", "Water Melon");
        ComponentDefRef grapeFruit = builder.build();

        builder.setAttribute("value", "Water Melon");
        ComponentDefRef waterMelon = builder.build();

        List<ComponentDefRef> cmps = Lists.newArrayList(grapeFruit,waterMelon);

        out.append("<div id='placeholder' class='placeholder' style='border: 1px solid black'/>");
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        Integration integration = Aura.getIntegrationService().createIntegration(
                "", Mode.DEV);
        integration.injectApplication(out);
        Map<String,Object> attr = Maps.newHashMap();
        attr.put("cmps", cmps);
        integration.injectComponent(desc, attr, "localId" ,"placeholder" , out);

        //The only not-so-ideal part of this approach to testing INTegrationService is that we have to start the
        //context for the rendering of the original stub component to continue. IntegrationService sets up and tears down its context.
        Aura.getContextService().startContext(ctx.getMode(), ctx.getFormat(), ctx.getAccess(), ctx.getApplicationDescriptor());
    }

}
