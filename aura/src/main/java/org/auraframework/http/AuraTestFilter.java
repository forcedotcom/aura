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
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.Resettable;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

/**
 * Supports test framework functionality, primarily for jstest mocks.
 */
public class AuraTestFilter implements Filter {
    private static final Log LOG = LogFactory.getLog(AuraTestFilter.class);

    private static final String BASE_URI = "/aura";
    private static final String GET_URI = BASE_URI
            + "?aura.tag=%s:%s&aura.format=HTML&aura.deftype=%s&aura.mode=%s&aura.access=%s";

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

    private static final Pattern bodyEndTagPattern = Pattern.compile("(?is).*(</body\\s*>).*");
    private static final Pattern htmlEndTagPattern = Pattern.compile("(?is).*(</html\\s*>).*");
    // private static final Pattern headTagPattern = Pattern.compile("(?is).*(<\\s*head[^>]*>).*");
    // private static final Pattern bodyTagPattern = Pattern.compile("(?is).*(<\\s*body[^>]*>).*");

    private ServletContext servletContext;

    // TODO: DELETE this once all existing tests have been updated to have attributes.
    private boolean ENABLE_FREEFORM_TESTS = Boolean.parseBoolean(System.getProperty("aura.jstest.free"));

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        if (!Aura.getConfigAdapter().isTestAllowed()) {
            chain.doFilter(req, res);
            return;
        }

        TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
        if (testContextAdapter == null) {
            chain.doFilter(req, res);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) req;
        TestContext testContext = getTestContext(request);
        boolean doResetTest = testReset.get(request, false);
        if (testContext != null && doResetTest) {
            testContext.getLocalDefs().clear();
        }

        // Check for requests to execute a JSTest, i.e. initial component GETs with particular parameters.
        if ("GET".equals(request.getMethod())) {
            DefDescriptor<?> targetDescriptor = getTargetDescriptor(request);
            if (targetDescriptor != null) {
                // Check if a single jstest is being requested.
                String testToRun = jstestToRun.get(request);
                if (testToRun != null && !testToRun.isEmpty()) {
                    AuraContext context = Aura.getContextService().getCurrentContext();
                    Format format = context.getFormat();
                    switch (format) {
                    case HTML:
                        TestCaseDef testDef;
                        String targetUri;
                        try {
                            TestSuiteDef suiteDef = getTestSuite(targetDescriptor);
                            testDef = getTestCase(suiteDef, testToRun);
                            testDef.validateDefinition();
                            if (testContext == null) {
                                testContext = testContextAdapter.getTestContext(testDef.getQualifiedName());
                            }
                            targetUri = buildJsTestTargetUri(targetDescriptor, testDef);
                        } catch (QuickFixException e) {
                            ((HttpServletResponse) res).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                            res.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            res.getWriter().append(e.getMessage());
                            Aura.getExceptionAdapter().handleException(e);
                            return;
                        }

                        // Load any test mocks.
                        Collection<Definition> mocks = testDef.getLocalDefs();
                        testContext.getLocalDefs().addAll(mocks);
                        loadTestMocks(context, true, testContext.getLocalDefs());

                        // Capture the response and inject tags to load jstest.
                        String capturedResponse = captureResponse(req, res, targetUri);
                        if (capturedResponse != null) {
                            res.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            if (!Aura.getContextService().isEstablished()) {
                                // There was an error in the original response, so just write the response out.
                                res.getWriter().write(capturedResponse);
                            } else {
                                String testTag = buildJsTestScriptTag(targetDescriptor, testToRun, capturedResponse);
                                injectScriptTags(res.getWriter(), capturedResponse, testTag);
                            }
                            return;
                        }
                    case JS:
                        res.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                        writeJsTestScript(res.getWriter(), targetDescriptor, testToRun);
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

                    String newUri = createURI("aurajstest", "jstest", DefType.APPLICATION, mode,
                            Authentication.AUTHENTICATED.name(), qs);
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
            ContextService contextService = Aura.getContextService();
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
            return Aura.get(TestContextAdapter.class).getTestContext(key);
        }
    }

    private TestSuiteDef getTestSuite(DefDescriptor<?> targetDescriptor) throws QuickFixException {
        DefDescriptor<TestSuiteDef> suiteDesc = Aura.getDefinitionService().getDefDescriptor(targetDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, TestSuiteDef.class);
        return suiteDesc.getDef();
    }

    private TestCaseDef getTestCase(TestSuiteDef suiteDef, String testCaseName) throws QuickFixException {
        for (TestCaseDef currentTestDef : suiteDef.getTestCaseDefs()) {
            if (testCaseName.equals(currentTestDef.getName())) {
                currentTestDef.validateDefinition();
                return currentTestDef;
            }
        }
        throw new DefinitionNotFoundException(Aura.getDefinitionService().getDefDescriptor(testCaseName,
                TestCaseDef.class));
    }

    private String createURI(String namespace, String name, DefType defType, Mode mode, String access, String qs) {
        if (mode == null) {
            try {
                mode = Aura.getContextService().getCurrentContext().getMode();
            } catch (Throwable t) {
                mode = Mode.AUTOJSTEST; // TODO: default to PROD
            }
        }

        String ret = String.format(GET_URI, namespace, name, defType.name(), mode.toString(), access);
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
        MasterDefRegistry registry = context.getDefRegistry();
        for (Definition def : mocks) {
            try {
                if (doReset && def instanceof Resettable) {
                    ((Resettable) def).reset();
                }
                registry.addLocalDef(def);
            } catch (Throwable t) {
                LOG.error("Failed to add mock " + def, t);
                error = true;
            }
        }
        if (error) {
            Aura.get(TestContextAdapter.class).release();
        }
    }

    private String buildJsTestTargetUri(DefDescriptor<?> targetDescriptor, TestCaseDef testDef)
            throws QuickFixException {

        Map<String, Object> targetAttributes = testDef.getAttributeValues();

        // Force "legacy" style tests until ready
        if (!ENABLE_FREEFORM_TESTS && targetAttributes == null) {
            targetAttributes = ImmutableMap.of();
        }

        if (targetAttributes != null) {
            // The test has attributes specified, so request for the target component with the test's attributes.
            String hash = "";
            List<NameValuePair> newParams = Lists.newArrayList();
            for (Entry<String, Object> entry : targetAttributes.entrySet()) {
                String key = entry.getKey();
                String value;
                if (entry.getValue() instanceof Map<?, ?> || entry.getValue() instanceof List<?>) {
                    value = JsonEncoder.serialize(entry.getValue());
                } else {
                    value = entry.getValue().toString();
                }
                if (key.equals("__layout")) {
                    hash = value;
                } else {
                    newParams.add(new BasicNameValuePair(key, value));
                }
            }
            String qs = URLEncodedUtils.format(newParams, "UTF-8") + hash;
            return createURI(targetDescriptor.getNamespace(), targetDescriptor.getName(),
                    targetDescriptor.getDefType(), null, Authentication.AUTHENTICATED.name(), qs);
        } else {
            // Free-form tests will load only the target component's template.
            // TODO: Allow specifying the template on the test.
            // TODO: Load proxy app for cmps, apps must loadApplication.
            final BaseComponentDef originalDef = (BaseComponentDef) targetDescriptor.getDef();
            final ComponentDef targetTemplate = originalDef.getTemplateDef();
            String newDescriptorString = String
                    .format("%s$%s", targetDescriptor.getDescriptorName(), testDef.getName());
            final DefDescriptor<ApplicationDef> newDescriptor = Aura.getDefinitionService().getDefDescriptor(
                    newDescriptorString, ApplicationDef.class);
            final ApplicationDef dummyDef = Aura.getDefinitionService().getDefinition("aurajstest:blank",
                    ApplicationDef.class);
            BaseComponentDef targetDef = (BaseComponentDef) Proxy.newProxyInstance(
                    originalDef.getClass().getClassLoader(),
                    new Class<?>[] { ApplicationDef.class },
                    new InvocationHandler() {
                        @Override
                        public Object invoke(Object proxy, Method method, Object[] args)
                                throws Throwable {
                            switch (method.getName()) {
                            case "getDescriptor":
                                return newDescriptor;
                            case "getTemplateDef":
                                return targetTemplate;
                            case "isLocallyRenderable":
                                return method.invoke(originalDef, args);
                            default:
                                return method.invoke(dummyDef, args);
                            }
                        }
                    });
            TestContext testContext = Aura.get(TestContextAdapter.class).getTestContext(
                    testDef.getQualifiedName());
            testContext.getLocalDefs().add(targetDef);
            return createURI(newDescriptor.getNamespace(), newDescriptor.getName(),
                    newDescriptor.getDefType(), null, Authentication.AUTHENTICATED.name(), null);
        }
    }

    private String captureResponse(ServletRequest req, ServletResponse res, String uri) throws ServletException,
            IOException {
        CapturingResponseWrapper responseWrapper = new CapturingResponseWrapper((HttpServletResponse) res);
        RequestDispatcher dispatcher = servletContext.getContext(uri).getRequestDispatcher(uri);
        if (dispatcher == null) {
            return null;
        }
        dispatcher.forward(req, responseWrapper);
        return responseWrapper.getCapturedResponseString();
    }

    private String buildJsTestScriptTag(DefDescriptor<?> targetDescriptor, String testName, String original) {
        String tag = "";

        // Inject test framework script tag if it isn't on page already. Unlikely, but framework may not
        // be loaded if the target is server-rendered, or if the target is designed that way (e.g.
        // custom template).
        String testUrl = Aura.getConfigAdapter().getAuraJSURL(); // Dependent on mode being a test mode
        if (original == null
                || !original.matches(String.format("(?is).*<script\\s*src\\s*=\\s*['\"]%s['\"]\\s*>.*", testUrl))) {
            tag = String.format("\n<script src='%s'></script>", testUrl);
        }

        // Inject tag to load and execute test.
        String suiteSrcUrl = String.format("/%s/%s.%s?aura.jstestrun=%s&aura.format=JS&aura.nonce=%s",
                targetDescriptor.getNamespace(), targetDescriptor.getName(),
                targetDescriptor.getDefType() == DefType.APPLICATION ? "app" : "cmp", testName,
                System.nanoTime());
        tag = tag + String.format("\n<script src='%s'></script>\n", suiteSrcUrl);
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

    private void writeJsTestScript(PrintWriter out, DefDescriptor<?> targetDescriptor, String testName)
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
        final int testTimeout = 90; // TODO: support TestCaseDef override for timeout
        out.append(String.format("(function(suite){$A.test.run('%s',suite,%s);})(", testName,
                testTimeout));
        out.append(suiteDef.getCode());
        out.append("\n);"); // handle trailing single-line comments with newline
    }

    private DefDescriptor<?> getTargetDescriptor(HttpServletRequest request) {
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
                return Aura.getDefinitionService().getDefDescriptor(
                        String.format("%s:%s", namespace, name), type.getPrimaryInterface());
            }
        } catch (Throwable t) {
            // Ignore. Pass request onto core servlets.
        }
        return null;
    }
}
