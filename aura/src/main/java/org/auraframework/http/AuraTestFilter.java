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
package org.auraframework.http;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.IntegerParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.Resettable;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

/**
 * Supports test framework functionality, primarily for jstest mocks.
 */
@ServiceComponent
public class AuraTestFilter implements Filter {
    private static final Log LOG = LogFactory.getLog(AuraTestFilter.class);

    private static final int DEFAULT_JSTEST_TIMEOUT = 30;
    private static final String BASE_URI = "/aura";
    private static final String GET_URI = BASE_URI + "?aura.tag=%s%%3A%s&aura.deftype=%s&aura.mode=%s&aura.format=%s";

    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);

    // "test" is the key used to reference the current TestContext, and is not specific to jstests.
    private static final StringParam testContextKey = new StringParam(AuraServlet.AURA_PREFIX + "test", 0, false);

    // "jstestrun" is used by this filter to identify the jstest to execute.
    // If the param is empty, it will fall back to loading auratest:jstest.
    private static final StringParam jstestToRun = new StringParam(AuraServlet.AURA_PREFIX + "jstestrun", 0, false);

    // "jstest" is a shortcut to load auratest:jstest.
    private static final StringParam jstestAppFlag = new StringParam(AuraServlet.AURA_PREFIX + "jstest", 0, false);

    // "testReset" is a signal to reset any mocks associated with the current TestContext, used primarily on the initial
    // request of a test to clean up in case a prior test did not clean up.
    private static final BooleanParam testReset = new BooleanParam(AuraServlet.AURA_PREFIX + "testReset", false);

    // "testTimeout" sets the timeout for a test
    private static final IntegerParam testTimeout = new IntegerParam(AuraServlet.AURA_PREFIX + "testTimeout", false);

    private static final Pattern bodyEndTagPattern = Pattern.compile("(?is).*(</body\\s*>).*");
    private static final Pattern htmlEndTagPattern = Pattern.compile("(?is).*(</html\\s*>).*");
    // private static final Pattern headTagPattern = Pattern.compile("(?is).*(<\\s*head[^>]*>).*");
    // private static final Pattern bodyTagPattern = Pattern.compile("(?is).*(<\\s*body[^>]*>).*");

    private ServletContext servletContext;

    private TestContextAdapter testContextAdapter;
    private ContextService contextService;
    private DefinitionService definitionService;
    private SerializationService serializationService;
    private ConfigAdapter configAdapter;
    private ExceptionAdapter exceptionAdapter;
    private ServletUtilAdapter servletUtilAdapter;

    @Inject
    public void setTestContextAdapter(TestContextAdapter testContextAdapter) {
        this.testContextAdapter = testContextAdapter;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    @Inject
    public void setSerializationService(SerializationService serializationService) {
        this.serializationService = serializationService;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
    }

    @Inject
    public void setServletUtilAdapter(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {
        
        if (Aura.getConfigAdapter().isProduction()) {
            chain.doFilter(req, res);
            return;
        }

        if (testContextAdapter == null) {
            chain.doFilter(req, res);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        TestContext testContext = getTestContext(request);
        boolean doResetTest = testReset.get(request, false);
        if (testContext != null && doResetTest) {
            testContext.getLocalDefs().clear();
        }

        // Check for requests to execute a JSTest, i.e. initial component GETs with particular parameters.
        if ("GET".equals(request.getMethod())) {
            DefDescriptor<? extends BaseComponentDef> targetDescriptor = getTargetDescriptor(request);
            if (targetDescriptor != null) {
                // Check if a single jstest is being requested.
                String testToRun = jstestToRun.get(request);
                if (testToRun != null && !testToRun.isEmpty()) {
                    AuraContext context = contextService.getCurrentContext();
                    Format format = context.getFormat();
                    switch (format) {
                    case HTML:
                        TestCaseDef testDef;
                        try {
                            TestSuiteDef suiteDef = getTestSuite(targetDescriptor);
                            testDef = getTestCase(suiteDef, testToRun);
                            testDef.validateDefinition();
                            if (testContext == null) {
                                testContext = testContextAdapter.getTestContext(testDef.getQualifiedName());
                            }
                        } catch (QuickFixException e) {
                            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                            response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            servletUtilAdapter.setNoCache(response);
                            response.getWriter().append(e.getMessage());
                            exceptionAdapter.handleException(e);
                            return;
                        }

                        // Load any test mocks.
                        Collection<Definition> mocks = testDef.getLocalDefs();
                        testContext.getLocalDefs().addAll(mocks);
                        loadTestMocks(context, true, testContext.getLocalDefs());

                        // Capture the response and inject tags to load jstest.
                        String capturedResponse;
                        try {
                            capturedResponse = renderBaseComponentDef(targetDescriptor, testDef.getAttributeValues());
                        } catch (QuickFixException e) {
                            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                            response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            servletUtilAdapter.setNoCache(response);
                            response.getWriter().append(e.getMessage());
                            exceptionAdapter.handleException(e);
                            return;
                        }
                        if (capturedResponse != null) {
                            response.setContentType("text/html");
                            response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            if (!contextService.isEstablished()) {
                                // There was an error in the original response, so just write the response out.
                                response.getWriter().write(capturedResponse);
                            } else {
                                int timeout = testTimeout.get(request, DEFAULT_JSTEST_TIMEOUT);
                                String testTag = buildJsTestScriptTag(targetDescriptor, testToRun, timeout, capturedResponse);
                                injectScriptTags(response.getWriter(), capturedResponse, testTag);
                            }
                            return;
                        }
                    case JS:
                        int timeout = testTimeout.get(request, DEFAULT_JSTEST_TIMEOUT);

                        response.setContentType("text/javascript");
                        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                        servletUtilAdapter.setNoCache(response);
                        
                        writeJsTestScript(response.getWriter(), targetDescriptor, testToRun, timeout);
                        return;
                    default:
                        // Pass it on.
                    }
                }

                // aurajstest:jstest app is invokable in the following ways:
                // ?aura.mode=JSTEST - run all tests
                // ?aura.mode JSTEST&test=XXX - run single test
                // ?aura.jstest - run all tests
                // ?aura.jstest=XXX - run single test
                // ?aura.jstestrun - run all tests
                // TODO: delete JSTEST mode
                String jstestAppRequest = jstestAppFlag.get(request);
                Mode mode = AuraContextFilter.mode.get(request, Mode.PROD);
                if (mode == Mode.JSTEST || mode == Mode.JSTESTDEBUG || jstestAppRequest != null || testToRun != null) {

                    mode = mode.toString().endsWith("DEBUG") ? Mode.AUTOJSTESTDEBUG : Mode.AUTOJSTEST;

                    String qs = String.format("descriptor=%s&defType=%s", targetDescriptor.getDescriptorName(),
                            targetDescriptor.getDefType().name());
                    String testName = null;
                    if (jstestAppRequest != null && !jstestAppRequest.isEmpty()) {
                        testName = jstestAppRequest;
                    } else if (testToRun != null && !testToRun.isEmpty()) {
                        testName = testToRun;
                    }
                    if (testName != null) {
                        qs = qs + "&test=" + testName;
                    }

                    String newUri = createURI("aurajstest", "jstest", DefType.APPLICATION, mode, Format.HTML, qs);
                    RequestDispatcher dispatcher = servletContext.getContext(newUri).getRequestDispatcher(newUri);
                    if (dispatcher != null) {
                        dispatcher.forward(req, res);
                        return;
                    }
                }
            }
        }

        // Handle mock definitions specified in the tests.
        if (testContext == null) {
            // During manual testing, the test context adapter may not always get cleared.
            testContextAdapter.clear();
        } else {
            if (!contextService.isEstablished()) {
                LOG.error("Aura context is not established! New context will NOT be created.");
                chain.doFilter(req, res);
                return;
            }
            AuraContext context = contextService.getCurrentContext();

            // Reset mocks if requested, or for the initial GET.
            loadTestMocks(context, doResetTest, testContext.getLocalDefs());
        }
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        servletContext = filterConfig.getServletContext();
        processInjection(filterConfig);
    }
    
    public void processInjection(FilterConfig filterConfig) {
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, servletContext);
    }

    @Override
    public void destroy() {
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getConfigMap(HttpServletRequest request) {
        Map<String, Object> configMap = null;
        String config = contextConfig.get(request);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(config)) {
            if (config.startsWith(AuraTextUtil.urlencode("{"))) {
                // Decode encoded context json. Serialized AuraContext json always starts with "{"
                config = AuraTextUtil.urldecode(config);
            }
            configMap = (Map<String, Object>) new JsonReader().read(config);
        }
        return configMap;
    }

    private TestContext getTestContext(HttpServletRequest request) {
        Map<String, Object> configMap = getConfigMap(request);
        String key = null;
        // Config takes precedence over param because the value is not expected to change during a test and it
        // is less likely to have been modified unintentionally when from the config.
        if (configMap != null) {
            key = (String) configMap.get("test");
        }
        if (key == null) {
            key = testContextKey.get(request);
        }
        if (key == null) {
            return null;
        } else {
            return testContextAdapter.getTestContext(key);
        }
    }

    private TestSuiteDef getTestSuite(DefDescriptor<?> targetDescriptor) throws QuickFixException {
        DefDescriptor<TestSuiteDef> suiteDesc = definitionService.getDefDescriptor(targetDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, TestSuiteDef.class);
        return definitionService.getDefinition(suiteDesc);
    }

    private TestCaseDef getTestCase(TestSuiteDef suiteDef, String testCaseName) throws QuickFixException {
        for (TestCaseDef currentTestDef : suiteDef.getTestCaseDefs()) {
            if (testCaseName.equals(currentTestDef.getName())) {
                currentTestDef.validateDefinition();
                return currentTestDef;
            }
        }
        throw new DefinitionNotFoundException(definitionService.getDefDescriptor(testCaseName,
                TestCaseDef.class));
    }

    private String createURI(String namespace, String name, DefType defType, Mode mode, Format format, String qs) {
        if (mode == null) {
            try {
                mode = contextService.getCurrentContext().getMode();
            } catch (Throwable t) {
                mode = Mode.AUTOJSTEST; // TODO: default to PROD
            }
        }

        String ret = String.format(GET_URI, namespace, name, defType.name(), mode.toString(), format);
        if (qs != null) {
            ret = String.format("%s&%s", ret, qs);
        }
        return ret;
    }

    private void loadTestMocks(AuraContext context, boolean doReset, Collection<Definition> mocks) {
        // TODO: fix error handling
        if (mocks == null || mocks.isEmpty()) {
            return;
        }

        boolean error = false;
        for (Definition def : mocks) {
            try {
                if (doReset && def instanceof Resettable) {
                    ((Resettable) def).reset();
                }
                context.addDynamicDef(def);
            } catch (Throwable t) {
                LOG.error("Failed to add mock " + def, t);
                error = true;
            }
        }
        if (error) {
            testContextAdapter.release();
        }
    }

    @SuppressWarnings("unchecked")
    private <D extends BaseComponentDef> String renderBaseComponentDef(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws IOException, DefinitionNotFoundException, QuickFixException {
        StringBuffer buffer = new StringBuffer();
        
        AuraContext originalContext = contextService.getCurrentContext();
        AuraContext context = contextService.pushSystemContext();

        try {
            context.setApplicationDescriptor(descriptor);
            context.setFrameworkUID(originalContext.getFrameworkUID());

            D def = definitionService.getDefinition(descriptor);
            definitionService.updateLoaded(descriptor);
            Class<D> defClass = (Class<D>)descriptor.getDefType().getPrimaryInterface();
            serializationService.write(def, attributes, defClass, buffer, Format.HTML.toString());
        } finally {
            contextService.popSystemContext();
        }
        
        return buffer.toString();
    }

    private String buildJsTestScriptTag(DefDescriptor<?> targetDescriptor, String testName, int timeout, String original) {
        String tag = "";
        String defer;

        // Inject test framework script tag if it isn't on page already. Unlikely, but framework may not
        // be loaded if the target is server-rendered, or if the target is designed that way (e.g.
        // custom template).
        String testUrl = configAdapter.getAuraJSURL(); // Dependent on mode being a test mode
        if (original == null
                || !original.matches(String.format("(?is).*<script\\s*src\\s*=\\s*['\"]%s['\"][^>]*>.*", testUrl))) {
            tag = String.format("<script src='%s'></script>", testUrl);
        }

        switch (Aura.getContextService().getCurrentContext().getClient().getType()) {
        case IE9:
        case IE8:
        case IE7:
        case IE6:
            defer = "";
            break;
        default:
            defer = " defer";
            break;
        }

        // Inject tag to load and execute test.
        String qs = String.format("aura.jstestrun=%s&aura.testTimeout=%s&aura.nonce=%s", testName, timeout,
                System.nanoTime());
        String suiteSrcUrl = createURI(targetDescriptor.getNamespace(), targetDescriptor.getName(),
                targetDescriptor.getDefType(), null, Format.JS, qs);
        tag = tag + String.format("<script src='%s'%s></script>\n", suiteSrcUrl, defer);
        return tag;
    }

    private void injectScriptTags(Appendable out, String originalResponse, String tags) throws IOException {
        // Look for closing body or html tag and insert before that, otherwise just append to the original.
        // TODO: Inject at top, after Test.js can compile and run separately from Aura.js.
        Matcher bodyMatcher = bodyEndTagPattern.matcher(originalResponse);
        int insertionPoint = originalResponse.length();
        if (bodyMatcher.matches()) {
            insertionPoint = bodyMatcher.start(1);
        } else {
            Matcher htmlMatcher = htmlEndTagPattern.matcher(originalResponse);
            if (htmlMatcher.matches()) {
                insertionPoint = htmlMatcher.start(1);
            }
        }

        out.append(originalResponse.substring(0, insertionPoint));
        out.append(tags);
        out.append(originalResponse.substring(insertionPoint));
    }

    private void writeJsTestScript(PrintWriter out, DefDescriptor<?> targetDescriptor, String testName, int testTimeout)
            throws IOException {
        TestSuiteDef suiteDef;
        TestCaseDef testDef;
        try {
            suiteDef = getTestSuite(targetDescriptor);
            testDef = getTestCase(suiteDef, testName);
            testDef.validateDefinition();
        } catch (QuickFixException e) {
            out.append(String.format("$A.test.run('%s',{},1,'%s');", testName, e.getMessage()));
            return;
        }
        

        // TODO: Inject test framework here, before the test suite code, separately from framework code.
        out.append(String.format("(function testBootstrap(suiteProps) {\n\tif (!window.Aura || !window.Aura.frameworkJsReady) {\n\t\twindow.Aura || (window.Aura = {});\n\t\twindow.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];\n\t\twindow.Aura.beforeFrameworkInit.push(testBootstrap.bind(null, suiteProps));\n\t} else {\n\t\t$A.test.run('%s', suiteProps, '%s');\n\t}\n}(", testName,testTimeout));
        String suiteCode = suiteDef.getCode();
        out.append(suiteCode);
        out.append("\n));"); // handle trailing single-line comments with newline
    }

    @SuppressWarnings("unchecked")
    private DefDescriptor<? extends BaseComponentDef> getTargetDescriptor(HttpServletRequest request) {
        String namespace = null;
        String name = null;
        DefType type = null;

        try {
            String contextPath = request.getContextPath();
            String uri = request.getRequestURI();
            String path;
            if (uri.startsWith(contextPath)) {
                path = uri.substring(contextPath.length());
            } else {
                path = uri;
            }

            if (BASE_URI.equals(path)) {
                String[] tagName = AuraServlet.tag.get(request).split(":", 2);
                type = AuraServlet.defTypeParam.get(request, DefType.COMPONENT);
                namespace = tagName[0];
                name = tagName[1];
            }
            if (name == null) {
                Matcher matcher = AuraRewriteFilter.DESCRIPTOR_PATTERN.matcher(path);
                if (matcher.matches()) {
                    type = "app".equals(matcher.group(3)) ? DefType.APPLICATION : DefType.COMPONENT;
                    namespace = matcher.group(1);
                    name = matcher.group(2);
                }
            }

            if (name != null) {
                return (DefDescriptor<? extends BaseComponentDef>)definitionService.getDefDescriptor(
                        String.format("%s:%s", namespace, name), type.getPrimaryInterface());
            }
        } catch (Throwable t) {
            // Ignore. Pass request onto core servlets.
        }
        return null;
    }
}
