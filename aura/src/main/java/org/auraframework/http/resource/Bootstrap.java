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

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.BootstrapUtil;
import org.auraframework.instance.*;
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
    private BootstrapUtil bootstrapUtil;

    @Inject
    protected void setBootstrapUtil(BootstrapUtil bootstrapUtil) {
        this.bootstrapUtil = bootstrapUtil;
    }

    public Bootstrap() {
        super("bootstrap.js", Format.JS);
    }

    protected void setCacheHeaders(HttpServletResponse response, DefDescriptor<? extends BaseComponentDef> appDesc)
            throws QuickFixException {
        Integer cacheExpiration = null;
        if (appDesc.getDefType() == DefType.APPLICATION) {
            // only app has bootstrap cache capability
            definitionService.updateLoaded(appDesc);
            ApplicationDef appDef = (ApplicationDef) definitionService.getDefinition(appDesc);
            cacheExpiration = appDef.getBootstrapPublicCacheExpiration();
        }
        if (cacheExpiration != null && cacheExpiration > 0) {
            servletUtilAdapter.setCacheTimeout(response, cacheExpiration.longValue() * 1000, false);
        } else {
            servletUtilAdapter.setNoCache(response);
        }
    }

    protected void loadLabels(AuraContext context) throws QuickFixException {
        bootstrapUtil.loadLabels(context);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();

        try {
            servletUtilAdapter.checkFrameworkUID(context);

            // need to guard bootstrap.js request because it returns user sensitive information.
            String jwtToken = request.getParameter("jwt");
            if (!configAdapter.validateBootstrap(jwtToken)) {
                throw new AuraJWTError("Invalid jwt parameter");
            }
            definitionService.updateLoaded(app);
            setCacheHeaders(response, app);
            Instance<?> appInstance = null;
            if (!configAdapter.isBootstrapModelExclusionEnabled()) {
                appInstance = instanceService.getInstance(app, getComponentAttributes(request));
            }
            loadLabels(context);

            JsonSerializationContext serializationContext = context.getJsonSerializationContext();

            WrappedPrintWriter out = new WrappedPrintWriter(response.getWriter());
            out.append(bootstrapUtil.getPrependScript());
            JsonEncoder json = JsonEncoder.createJsonStream(out, serializationContext);
            json.writeMapBegin();
            json.writeMapKey("data");
            json.writeMapBegin();

            bootstrapUtil.serializeApplication(appInstance, context, json);

            context.getInstanceStack().serializeAsPart(json);
            json.writeMapEnd();
            json.writeMapEntry("md5", out.getMD5());
            context.setPreloading(false);
            context.setUriDefsEnabled(false);
            json.writeMapEntry("context", context);

            // CSRF token is usually handled in inline.js, but in the few cases
            // where inline.js may be cached, bootstrap may need to be able to
            // return a current token.
            if (manifestUtil.isManifestEnabled()) {
                json.writeMapEntry("token", configAdapter.getCSRFToken());
            }

            json.writeMapEnd();
            out.append(bootstrapUtil.getAppendScript());
        } catch (Throwable t) {
            if (t instanceof AuraJWTError) {
                // If jwt validation fails, just 404. Do not gack.
                try {
                    servletUtilAdapter.send404(request.getServletContext(), request, response);
                } catch (ServletException e) {
                    // ignore
                }
            } else {
                t = exceptionAdapter.handleException(t);
                writeError(t, response, context);
                exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
            }
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
        out.print(bootstrapUtil.getPrependScript());
        JsonEncoder json = JsonEncoder.createJsonStream(out, context.getJsonSerializationContext());
        json.writeMapBegin();
        json.writeMapEntry("error", t);
        json.writeMapEnd();
        out.print(bootstrapUtil.getAppendScript());
    }

}
