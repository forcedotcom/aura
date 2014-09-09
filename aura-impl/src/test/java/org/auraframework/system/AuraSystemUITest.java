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
package org.auraframework.system;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Set;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.auraframework.Aura;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.ServiceLocator;

public class AuraSystemUITest extends WebDriverTestCase {
    private StringWriter stringWriter;
    private PrintWriter LOG; // so can print stacktraces too

    public AuraSystemUITest(String name) {
        super(name);
    }

    @Override
    public void setUp() {
        stringWriter = new StringWriter();
        LOG = new PrintWriter(stringWriter);
    }

    public void testSystemChecks() throws Exception {
        System.setProperty("aura.sanity.apps", "not:here");
        try {
            LOG.println();
            LOG.println("^*************************************************************************************");
            LOG.println("Production mode: " + Aura.getConfigAdapter().isProduction());
            LOG.println("Classpath:");
            for (URL url : ((URLClassLoader) Thread.currentThread().getContextClassLoader()).getURLs()) {
                LOG.println(url.toString());
            }
            LOG.println();

            // check load locations for some classes
            LOG.println("^*************************************************************************************");
            checkClassLocation("configuration.AuraUtilConfig");
            checkClassLocation("configuration.AuraUtilTestConfig");
            checkClassLocation("configuration.AuraConfig");
            checkClassLocation("configuration.AuraTestConfig");
            checkClassLocation("configuration.AuraImplExpressionConfig");
            checkClassLocation("configuration.AuraImplExpressionTestConfig");
            checkClassLocation("configuration.AuraImplConfig");
            checkClassLocation("configuration.AuraImplTestConfig");
            checkClassLocation("configuration.AuraComponentsConfig");
            LOG.println();

            // which component location adapters are defined and what targets are configured
            LOG.println("^*************************************************************************************");
            LOG.println("Component location adapters:");
            Set<ComponentLocationAdapter> locationAdapters = ServiceLocator.get()
                    .getAll(ComponentLocationAdapter.class);
            if (locationAdapters.isEmpty()) {
                LOG.println("None found");
            } else {
                for (ComponentLocationAdapter locationAdapter : locationAdapters) {
                    LOG.println("source package: " + locationAdapter.getComponentSourcePackage()
                            + "; source dir: "
                            + locationAdapter.getComponentSourceDir() + "; java generated source dir: "
                            + locationAdapter.getJavaGeneratedSourceDir());
                }
            }
            LOG.println();

            // check walltime
            LOG.println("^*************************************************************************************");
            checkWalltime();

            // check framework js
            LOG.println("^*************************************************************************************");
            LOG.println("Framework js:");
            Aura.getConfigAdapter().regenerateAuraJS();
            checkFrameworkJs("aura_auto.js");
            checkFrameworkJs("aura_prod.js");
            checkFrameworkJs("aura_dev.js");
            LOG.println();

            // check a couple defs to see that they're accessible
            LOG.println("^*************************************************************************************");

            // aura test app
            checkDef("auratest:testPerfRunner", ApplicationDef.class, Mode.AUTOJSTEST);

            // aura-components app
            checkDef("auradev:dependencies", ApplicationDef.class, Mode.AUTOJSTEST);

            // aura-impl test app
            checkDef("test:laxSecurity", ApplicationDef.class, Mode.AUTOJSTEST);

            // aura test suite
            checkDef("js://auratest.html", TestSuiteDef.class, Mode.AUTOJSTEST);

            // StringSource app
            DefDescriptor<ApplicationDef> stringSrcDesc = addSourceAutoCleanup(ApplicationDef.class,
                    String.format(baseApplicationTag, "", ""));
            checkDef(stringSrcDesc.getDescriptorName(), ApplicationDef.class, Mode.AUTOJSTEST);

            // others
            for (String appInput : System.getProperty("aura.sanity.apps", "").split("\\s*,\\s*")) {
                if (!appInput.isEmpty()) {
                    checkDef(appInput, ApplicationDef.class, Mode.AUTOJSTEST);
                }
            }

        } catch (Throwable t) {
            LOG.println("^*************************************************************************************");
            LOG.println("UNEXPECTED ERROR: ");
            t.printStackTrace(LOG);
        }
        LOG.println("^*************************************************************************************");
        throw new Exception(stringWriter.toString());
    }

    @SuppressWarnings("unchecked")
    private void checkDef(String descriptorString, Class<? extends Definition> defClass, Mode mode)
            throws Exception {
        Aura.getContextService().endContext();
        AuraContext context = Aura.getContextService().startContext(mode, Format.HTML, Authentication.AUTHENTICATED);

        try {
            LOG.println("^*************************************************************************************");
            LOG.println(DefType.getDefType(defClass) + " - " + mode + " - " + descriptorString);
            DefDescriptor<? extends Definition> desc = Aura.getDefinitionService().getDefDescriptor(
                    descriptorString, defClass);

            // check source
            Source<?> source = context.getDefRegistry().getSource(desc);
            if (source == null) {
                LOG.println("SOURCE NOT FOUND!");
            } else if (source instanceof StringSource) {
                LOG.println("from StringSource");
            } else {
                String url = source.getUrl();
                URL sourceUrl = new URL(url);
                String sourcePath = sourceUrl.getPath();
                LOG.println("source url: " + sourceUrl);
                LOG.println("source path: " + sourcePath);
                LOG.println("canRead path: " + new File(sourcePath).canRead());
            }

            // check compile
            Definition def = null;
            try {
                def = Aura.getDefinitionService().getDefinition(desc);
                LOG.println("def isValid: " + def.isValid());
                LOG.println("uid: " + context.getDefRegistry().getUid(null, desc));
            } catch (Throwable t) {
                LOG.println("ERROR GETTING DEF:");
                t.printStackTrace(LOG);
            }

            if (source != null) {
                LOG.println("contents:");
                LOG.println(StringEscapeUtils.escapeXml(source.getContents()));
            }

            if (def != null && def instanceof BaseComponentDef) {
                // get app js
                checkResource((DefDescriptor<? extends BaseComponentDef>) desc, mode, Format.JS, "app.js");
                LOG.println();

                // get app css
                checkResource((DefDescriptor<? extends BaseComponentDef>) desc, mode, Format.CSS, "app.css");
                LOG.println();
            }
        } finally {
            Aura.getContextService().endContext();
            LOG.println();
        }
    }

    private void checkResource(DefDescriptor<? extends BaseComponentDef> desc, Mode mode, Format format, String path)
            throws Exception {
        Aura.getContextService().endContext();
        String serializedContext = getAuraTestingUtil().getContext(mode, format, desc, false);
        String url = "/l/" + AuraTextUtil.urlencode(serializedContext) + "/" + path;
        checkResponse(url);
        Aura.getContextService().endContext();
    }

    private void checkFrameworkJs(String which) throws Exception {
        String currentUid = Aura.getConfigAdapter().getAuraFrameworkNonce();
        String url = String.format("/auraFW/javascript/%s/%s", currentUid, which);
        checkResponse(url);
    }

    private void checkResponse(String url) throws Exception {
        HttpGet get = obtainGetMethod(url, false, null);
        try {
            HttpResponse response = perform(get);
            LOG.println(get.getURI() + " status: " + getStatusCode(response));
            String body = getResponseBody(response);
            LOG.println(body);
        } catch (Throwable t) {
            LOG.println("ERROR getting: " + url);
            t.printStackTrace(LOG);
        } finally {
            get.releaseConnection();
        }
    }

    private void checkWalltime() {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.AUTOJSTEST, Format.HTML, Authentication.AUTHENTICATED);
        try {
            LOG.println("System timezone: " + System.getProperty("user.timezone"));
            LOG.println("AuraLocale: " + Aura.getLocalizationAdapter().getAuraLocale());
            LOG.println("Walltime URLs: " + Aura.getConfigAdapter().getWalltimeJSURLs());
        } catch (Throwable t) {
            t.printStackTrace(LOG);
        }
        Aura.getContextService().endContext();
    }

    private URL checkClassLocation(String className) throws Exception {
        URL url = null;
        try {
            Class<?> clazz = Class.forName(className);
            String resourceName = clazz.getName().replace('.', '/') + ".class";
            url = clazz.getClassLoader().getResource(resourceName);
            LOG.println(url.toString());
        } catch (Throwable t) {
            LOG.println();
            t.printStackTrace(LOG);
        }
        return url;
    }
}
