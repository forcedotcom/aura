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
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.Component;
import org.auraframework.javascript.PreInitJavascript;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraJWTError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;

@ServiceComponent
public class InlineJs extends AuraResourceImpl {

    private LocalizationAdapter localizationAdapter;
    private RenderingService renderingService;

    private List<PreInitJavascript> preInitJavascripts;

    private Map<String, String> localeData;

    public InlineJs() {
        super("inline.js", Format.JS);
    }

    @PostConstruct
    public void initialize() {
        localeData = readLocaleData();
    }

    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }

    @Inject
    public void setLocalizationAdapter(LocalizationAdapter localizationAdapter) {
        this.localizationAdapter = localizationAdapter;
    }

    private <T extends BaseComponentDef> void internalWrite(HttpServletRequest request,
            HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws IOException, QuickFixException {

        servletUtilAdapter.checkFrameworkUID(context);

        servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
        context.setApplicationDescriptor(defDescriptor);
        definitionService.updateLoaded(defDescriptor);

        // Knowing the app, we can do the HTTP headers, so of which depend on
        // the app in play, so we couldn't do this earlier.
        T def = definitionService.getDefinition(defDescriptor);

        if (!context.isTestMode() && !context.isDevMode()) {
            String defaultNamespace = configAdapter.getDefaultNamespace();
            DefDescriptor<?> referencingDescriptor = (defaultNamespace != null && !defaultNamespace.isEmpty())
                    ? definitionService.getDefDescriptor(String.format("%s:servletAccess", defaultNamespace),
                            ApplicationDef.class)
                    : null;
            definitionService.assertAccess(referencingDescriptor, def);
        }

        if (shouldCacheHTMLTemplate(defDescriptor, request, context)) {
            servletUtilAdapter.setLongCache(response);
        } else {
            servletUtilAdapter.setNoCache(response);
        }

        // Prevents Mhtml Xss exploit:
        PrintWriter out = response.getWriter();
        out.write("\n    ");

        Component template = serverService.writeTemplate(context, def, getComponentAttributes(request), out);
        appendPreInitJavascripts(def, context.getMode(), out);
        appendLocaleDataJavascripts(out);
        renderingService.render(template, null, out);
    }

    private void appendLocaleDataJavascripts(PrintWriter out) {
        AuraLocale auraLocale = localizationAdapter.getAuraLocale();

        // Refer to the locale in LocaleValueProvider
        Locale langLocale = auraLocale.getLanguageLocale();
        Locale userLocale = auraLocale.getLocale();

        // This is for backward compatibility. At this moment, there are three locales
        // in Locale Value Provider. Keep them all available for now to avoid breaking consumers.
        String langMomentLocale = this.getMomentLocale(langLocale.toString());
        String userMomentLocale = this.getMomentLocale(userLocale.toString());
        String ltngMomentLocale = this.getMomentLocale(langLocale.getLanguage() + "_" + userLocale.getCountry());

        StringBuilder defineLocaleJs = new StringBuilder();
        // "en" data has been included in moment lib, no need to load locale data
        if (!"en".equals(langMomentLocale)) {
            String content = this.localeData.get(langMomentLocale);
            defineLocaleJs.append(content).append("\n");
        }

        // if user locale is same as language locale, not need to load again
        if (!"en".equals(userMomentLocale) && userMomentLocale != null && !userMomentLocale.equals(langMomentLocale)) {
            String content = this.localeData.get(userMomentLocale);
            defineLocaleJs.append(content);
        }

        if (!"en".equals(ltngMomentLocale) && ltngMomentLocale != null && !ltngMomentLocale.equals(langMomentLocale) && !ltngMomentLocale.equals(userMomentLocale)) {
            String content = this.localeData.get(ltngMomentLocale);
            defineLocaleJs.append(content);
        }

        if (defineLocaleJs.length() > 0) {
            String loadLocaleDataJs = String.format(
                    "\n(function(){\n" +
                    "    function loadLocaleData(){\n%s}\n" +
                    "    window.moment? loadLocaleData() : (window.Aura || (window.Aura = {}), window.Aura.loadLocaleData=loadLocaleData);\n" +
                    "})();\n", defineLocaleJs.toString());

            out.append(loadLocaleDataJs);
        }
    }

    /**
     * Writes javascript into pre init "beforeFrameworkInit"
     *
     * @param def current application or component
     * @param mode current Mode from AuraContext
     * @param out response writer
     */
    private void appendPreInitJavascripts(BaseComponentDef def, Mode mode, PrintWriter out) {
        if (this.preInitJavascripts != null && !this.preInitJavascripts.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (PreInitJavascript js : this.preInitJavascripts) {
                if (js.shouldInsert(def, mode)) {
                    String code = js.getJavascriptCode(def, mode);
                    if (code != null && !code.isEmpty()) {
                        sb.append(String.format("window.Aura.beforeFrameworkInit.push(function() { %s ; }); ", code));
                    }
                }
            }
            if (sb.length() > 0) {
                String output = String.format(";(function() { window.Aura = window.Aura || {}; window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || []; %s }());", sb.toString());
                out.append(output);
            }
        }
    }

    private boolean shouldCacheHTMLTemplate(DefDescriptor<? extends BaseComponentDef> appDefDesc,
            HttpServletRequest request, AuraContext context) throws QuickFixException {
        if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
            Boolean isOnePageApp = ((ApplicationDef)definitionService.getDefinition(appDefDesc)).isOnePageApp();
            if (isOnePageApp != null) {
                return isOnePageApp;
            }
        }
        return !manifestUtil.isManifestEnabled(request);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            // For appcached apps, inline is not expected to return a CSRF token
            if (!manifestUtil.isManifestEnabled()) {
                String token = request.getParameter("jwt");
                if (!configAdapter.validateBootstrap(token)) {
                    throw new AuraJWTError("Invalid jwt parameter");
                }
            }
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getLoadingApplicationDescriptor();
            internalWrite(request, response, appDefDesc, context);
        } catch (Throwable t) {
            if (t instanceof AuraJWTError) {
                // If jwt validation fails, just 404. Do not gack.
                try {
                    servletUtilAdapter.send404(request.getServletContext(), request, response);
                } catch (ServletException e) {
                    // ignore
                }
            } else {
                servletUtilAdapter.handleServletException(t, false, context, request, response, false);
                exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
            }
        }
    }

    private Map<String, String> readLocaleData() {
        String localeDataPath = "aura/resources/moment/locales.js";

        ResourceLoader resourceLoader = configAdapter.getResourceLoader();
        Map<String, String> localeData = new HashMap<>();
        try (InputStream is = resourceLoader.getResourceAsStream(localeDataPath)) {
            if (is == null) {
                throw new IOException("Locale file doesn't exist: " + localeDataPath);
            }

            Reader reader = new InputStreamReader(is);
            String content = IOUtils.toString(reader);
            // parse out all locale's code
            String[] blocks = content.split("(//! moment.js locale configuration)|(moment.locale\\(\\'en\\'\\);)");

            // ignore the first and the last code block
            for (int i = 1; i < blocks.length - 1; i++) {
                String block = blocks[i];
                // parse out the locale id from comment
                Pattern pattern = Pattern.compile("//! locale.*\\[([\\w-]*)\\]");
                Matcher matcher = pattern.matcher(block);
                if (matcher.find()) {
                    String locale = matcher.group(1).trim();
                    localeData.put(locale, block);
                }
            }
        } catch (Exception e) {
            exceptionAdapter.handleException(e);
        }

        return Collections.unmodifiableMap(localeData);
    }

    private String getMomentLocale(String locale) {
        if(locale == null) {
            return "en";
        }

        // normalize Java locale string to moment locale
        String normalized = locale.toLowerCase().replace("_", "-");
        String[] tokens = normalized.split("-");

        String momentLocale = null;
        if (tokens.length > 1) {
            momentLocale = tokens[0] + "-" + tokens[1];
            if (this.localeData.containsKey(momentLocale)) {
                return momentLocale;
            }
        }

        momentLocale = tokens[0];
        if (this.localeData.containsKey(momentLocale)) {
            return momentLocale;
        }

        return "en";
    }

    public Set<String> getMomentLocales() {
        return this.localeData.keySet();
    }

    @Autowired(required = false) // only clean way to allow no bean vs using Optional
    public void setPreInitJavascripts(List<PreInitJavascript> preInitJavascripts) {
        this.preInitJavascripts = preInitJavascripts;
    }
}
