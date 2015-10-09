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

package org.auraframework.http.resource;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;

public class TemplateHtml extends TemplateResource {
    public TemplateHtml() {
        super("template.html", Format.HTML, false);
    }

    @Override
    protected void doRender(Component template, Appendable out) throws IOException, QuickFixException {
        renderingService.render(template, out, null);
    }

    protected boolean shouldCacheHTMLTemplate(DefDescriptor<? extends BaseComponentDef> appDefDesc,
            HttpServletRequest request, AuraContext context) throws QuickFixException {
        if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
            Boolean isOnePageApp = ((ApplicationDef) appDefDesc.getDef()).isOnePageApp();
            if (isOnePageApp != null) {
                return isOnePageApp.booleanValue();
            }
        }
        return !manifestUtil.isManifestEnabled(request);
    }
}
