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
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.instance.Instance;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;

/**
 * Handles /l/{}/app.encryptionkey requests to retrieve encryption key.
 */
public class Bootstrap extends AuraResourceImpl {

    public Bootstrap() {
        super("bootstrap.js", Format.JS);
    }

    private final static String PREPEND_JS = "window.Aura || (window.Aura = {});\nwindow.Aura.appBootstrap = ";
    private final static String APPEND_JS = "(function () {\n\twindow.Aura.appBootstrapReady = true;\n\tif (window.Aura.afterBootstrapReady && window.Aura.afterBootstrapReady.length){\n\t\t for (var i = 0; i < window.Aura.afterBootstrapReady.length; i++) {\n\t\t\twindow.Aura.afterBootstrapReady[i]();\n\t\t}\n\t}\n}());";

    public Boolean loadLabels() throws QuickFixException {
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        Map<DefDescriptor<? extends Definition>, Definition> defMap;

        ctx.getDefRegistry().getDef(ctx.getApplicationDescriptor());
        defMap = ctx.getDefRegistry().filterRegistry(null);
        for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
            Definition def = entry.getValue();
            if (def != null) {
                def.retrieveLabels();
            }
        }
        return Boolean.TRUE;
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
        servletUtilAdapter.setNoCache(response);

        DefinitionService definitionService = Aura.getDefinitionService();
        DefType type = app.getDefType();

        DefDescriptor<?> desc = definitionService.getDefDescriptor(app.getDescriptorName(), type.getPrimaryInterface());

        Instance<?> appInstance = null;
        try {
            appInstance = Aura.getInstanceService().getInstance(desc, getComponentAttributes(request));
            definitionService.updateLoaded(desc);
            loadLabels();

            PrintWriter out = response.getWriter();
            out.print(PREPEND_JS);
            JsonEncoder json = JsonEncoder.createJsonStream(out, context.getJsonSerializationContext());
            json.writeMapBegin();
            json.writeMapKey("actions");
            json.writeArrayBegin();
            json.writeValue(appInstance);
            json.writeArrayEnd();
            json.writeMapEntry("context", context);
            json.writeMapEntry("token", Aura.getConfigAdapter().getCSRFToken());
            json.writeMapEnd();
            out.print(";\n" + APPEND_JS);
        } catch (Throwable t) {
            t = Aura.getExceptionAdapter().handleException(t);
            writeError(t, response, context);
        }
    }

    private void writeError(Throwable t, HttpServletResponse response, AuraContext context) throws IOException {
        response.resetBuffer();
        PrintWriter out = response.getWriter();
        out.print(PREPEND_JS);
        JsonEncoder json = JsonEncoder.createJsonStream(out, context.getJsonSerializationContext());
        json.writeMapBegin();
        json.writeMapEntry("error", t);
        json.writeMapEnd();
        out.print(";\n" + APPEND_JS);
    }
}
