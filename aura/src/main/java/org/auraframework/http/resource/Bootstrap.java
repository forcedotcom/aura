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
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.instance.Instance;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.AuraJWTError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;

/**
 * Handles /l/{}/bootstrap.js requests to retrieve bootstrap.js.
 */
@ServiceComponent
public class Bootstrap extends AuraResourceImpl {

    private ContextService contextService;

    public Bootstrap() {
        super("bootstrap.js", Format.JS);
    }

    // note: these code blocks must stay in sync with fallback.bootstrap.js
    private final static String PREPEND_JS = "window.Aura || (window.Aura = {});\n" +
            "window.Aura.bootstrap || (window.Aura.bootstrap = {});\n" +
            "window.Aura.appBootstrap = ";
    private final static String APPEND_JS = ";\n" +
            ";(function() {\n" +
            "    window.Aura.bootstrap.execBootstrapJs = window.performance && window.performance.now ? window.performance.now() : Date.now();\n" +
            "    window.Aura.appBootstrapStatus = \"loaded\";\n" +
            "    if (window.Aura.afterBootstrapReady && window.Aura.afterBootstrapReady.length) {\n" +
            "        var queue = window.Aura.afterBootstrapReady;\n" +
            "        window.Aura.afterBootstrapReady = [];\n" +
            "        for (var i = 0; i < queue.length; i++) {\n" +
        "                queue[i]();\n" +
            "        }\n" +
            "    }\n" +
            "}());";

    public Boolean loadLabels() throws QuickFixException {
        AuraContext ctx = contextService.getCurrentContext();
        Map<DefDescriptor<? extends Definition>, Definition> defMap;

        definitionService.getDefinition(ctx.getApplicationDescriptor());
        defMap = ctx.filterLocalDefs(null);
        for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
            Definition def = entry.getValue();
            if (def != null) {
                def.retrieveLabels();
            }
        }
        return Boolean.TRUE;
    }

    protected void setCacheHeaders(HttpServletResponse response, DefDescriptor<? extends BaseComponentDef> appDesc)
            throws QuickFixException {
        Integer cacheExpiration = null;
        if (appDesc.getDefType() == DefType.APPLICATION) {
            // only app has bootstrap cache capability
            ApplicationDef appDef = (ApplicationDef) definitionService.getDefinition(appDesc);
            cacheExpiration = appDef.getBootstrapPublicCacheExpiration();
        }
        if (cacheExpiration != null && cacheExpiration > 0) {
            servletUtilAdapter.setCacheTimeout(response, cacheExpiration.longValue() * 1000);
        } else {
            servletUtilAdapter.setNoCache(response);
        }
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
        DefType type = app.getDefType();

        try {
            DefDescriptor<?> desc = definitionService.getDefDescriptor(app.getDescriptorName(), type.getPrimaryInterface());

            servletUtilAdapter.checkFrameworkUID(context);

            if (!configAdapter.validateBootstrap(request.getParameter("jwt"))) {
                // If jwt validation fails, just write error to client. Do not gack.
                throw new AuraJWTError("Invalid jwt parameter");
            }

            setCacheHeaders(response, app);

            Instance<?> appInstance = instanceService.getInstance(desc, getComponentAttributes(request));
            definitionService.updateLoaded(desc);
            loadLabels();

            JsonSerializationContext serializationContext = context.getJsonSerializationContext();

            WrappedPrintWriter out = new WrappedPrintWriter(response.getWriter());
            out.append(PREPEND_JS);
            JsonEncoder json = JsonEncoder.createJsonStream(out, serializationContext);
            json.writeMapBegin();
            json.writeMapKey("data");
            json.writeMapBegin();
            json.writeMapEntry("app", appInstance);
            context.getInstanceStack().serializeAsPart(json);
            json.writeMapEnd();
            json.writeMapEntry("md5", out.getMD5());
            json.writeMapEntry("context", context);
            json.writeMapEnd();
            out.append(APPEND_JS);
        } catch (Throwable t) {
            Throwable handled = t;
            if (!(t instanceof AuraJWTError)) {
                handled = exceptionAdapter.handleException(t);
            }
            writeError(handled, response, context);
            exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
        }
    }

    private static class WrappedPrintWriter implements Appendable {
        private final PrintWriter inner;
        private final MessageDigest m;

        WrappedPrintWriter(PrintWriter inner) {
            try {
                m = MessageDigest.getInstance("MD5");
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException(e);
            }

            this.inner = inner;
        }

        @Override
        public Appendable append(CharSequence csq) throws IOException {
            updateMD5(csq, 0, csq.length());
            return inner.append(csq);
        }

        @Override
        public Appendable append(CharSequence csq, int start, int end) throws IOException {
            updateMD5(csq, start, end);
            return inner.append(csq, start, end);
        }

        @Override
        public Appendable append(char c) throws IOException {
            updateMD5(String.valueOf(c), 0, 1);
            return inner.append(c);
        }

        public void updateMD5(CharSequence csq, int start, int end) {
            byte[] data = csq.toString().getBytes();
            m.update(data, 0, data.length);
        }

        public String getMD5() {
            BigInteger i = new BigInteger(1, m.digest());
            return String.format("%1$032X", i);
        }
    }

    private void writeError(Throwable t, HttpServletResponse response, AuraContext context) throws IOException {
        response.resetBuffer();
        servletUtilAdapter.setNoCache(response);
        PrintWriter out = response.getWriter();
        out.print(PREPEND_JS);
        JsonEncoder json = JsonEncoder.createJsonStream(out, context.getJsonSerializationContext());
        json.writeMapBegin();

        if (t instanceof AuraJWTError) {
            json.writeMapEntry("errorType", "jwt");
        }

        json.writeMapEntry("error", t);
        json.writeMapEnd();
        out.print(APPEND_JS);
    }

    /**
     * Injection override.
     *
     * @param contextService the ContextService to set
     */
    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

}
