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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
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
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
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
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.Resettable;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

/**
 * Supports test framework functionality, primarily for jstest mocks.
 */
@ServiceComponent
public class AuraTestFilter {
    private static final int DEFAULT_JSTEST_TIMEOUT = 30;
    private static final String BASE_URI = "/aura";
    private static final String GET_URI = BASE_URI
            + "?aura.tag=%s%%3A%s&aura.deftype=%s&aura.mode=%s&aura.format=%s&aura.access=%s&aura.jstestrun=%s";
    private static final String NO_RUN = "_NONE";

    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);

    // "test" is the key used to reference the current TestContext, and is not specific to jstests.
    private static final StringParam testContextKey = new StringParam(AuraServlet.AURA_PREFIX + "test", 0, false);

    // "jstestrun" is used by this filter to identify the jstest to execute.
    // If the param is empty, it will fall back to loading auratest:jstest.
    private static final StringParam jstestToRun = new StringParam(AuraServlet.AURA_PREFIX + "jstestrun", 0, false);
    private static final Pattern jstestToRunPattern = Pattern.compile("(?<=\\b" + Pattern.quote(jstestToRun.name) + "=)\\w*");

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

    private final Log LOG = LogFactory.getLog(AuraTestFilter.class);;
    private final List<HttpFilter> testCaseFilters = Collections.synchronizedList(Lists.newArrayList());

    // TODO: DELETE this once all existing tests have been updated to have attributes.
    private boolean ENABLE_FREEFORM_TESTS = Boolean.parseBoolean(System.getProperty("aura.jstest.free"));

    private TestContextAdapter testContextAdapter;
    private ContextService contextService;
    private DefinitionService definitionService;
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

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException,
            IOException {
        if (testContextAdapter == null || configAdapter == null || configAdapter.isProduction()) {
            chain.doFilter(request, response);
            return;
        }

        if (testCaseFilters != null && testCaseFilters.size() > 0) {
            final AtomicBoolean handled = new AtomicBoolean(false);
            
            for (HttpFilter filter : testCaseFilters) {
                if (filter == null) {
                    continue;
                }
                filter.doFilter((HttpServletRequest) request, (HttpServletResponse) response, (req, res) -> {
                    innerFilter(req, res, chain);
                    handled.set(true);
                });
                if (handled.get()) {
                    return; // Only 1 filter is allowed to generate a response
                }
            }
        }

        innerFilter(request, response, chain);
    }
    
    private void innerFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest)req;
        HttpServletResponse response = (HttpServletResponse)res;
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
                if (testToRun != null && !testToRun.isEmpty() && !NO_RUN.equals(testToRun)) {
                    AuraContext context = contextService.getCurrentContext();
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
                            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                            servletUtilAdapter.setNoCache(response);
                            response.setContentType(servletUtilAdapter.getContentType(Format.HTML));
                            response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                            response.getWriter().append(e.getMessage());
                            exceptionAdapter.handleException(e);
                            return;
                        }

                        // Load any test mocks.
                        Collection<Definition> mocks = testDef.getLocalDefs();
                        testContext.getLocalDefs().addAll(mocks);
                        loadTestMocks(context, true, testContext.getLocalDefs());

                        // Capture the response and inject tags to load jstest.
                        String capturedResponse = captureResponse(request, response, testToRun, targetUri);
                        if (capturedResponse != null) {
                            servletUtilAdapter.setNoCache(response);
                            response.setContentType(servletUtilAdapter.getContentType(Format.HTML));
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
                        servletUtilAdapter.setNoCache(response);
                        response.setContentType(servletUtilAdapter.getContentType(Format.JS));
                        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
                        int timeout = testTimeout.get(request, DEFAULT_JSTEST_TIMEOUT);
                        writeJsTestScript(response.getWriter(), targetDescriptor, testToRun, timeout);
                        return;
                    default:
                        // Pass it on.
                    }
                } else if (testToRun != null && testToRun.isEmpty()) {
                    Object origRequest = request.getAttribute(AuraResourceServlet.ORIG_REQUEST_URI);
                    LOG.error("empty jstestrun: " + request.getRequestURL() + "?" + request.getQueryString()
                            + " original request: " + origRequest, new Error());
                }

                // aurajstest:jstest app is invokable in the following ways:
                // ?aura.mode=JSTEST - run all tests
                // ?aura.mode JSTEST&test=XXX - run single test
                // ?aura.jstest - run all tests
                // ?aura.jstest=XXX - run single test
                // TODO: delete JSTEST mode
                String jstestAppRequest = jstestAppFlag.get(request);
                Mode mode = AuraContextFilter.mode.get(request, Mode.PROD);
                if (mode == Mode.JSTEST || mode == Mode.JSTESTDEBUG || jstestAppRequest != null) {

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
                            Format.HTML, Authentication.AUTHENTICATED.name(), NO_RUN, qs);
                    RequestDispatcher dispatcher = request.getServletContext().getContext(newUri).getRequestDispatcher(newUri);
                    if (dispatcher != null) {
                        testContextAdapter.release();
                        dispatcher.forward(request, response);
                        return;
                    }
                }
            }
        }

        // Handle mock definitions specified in the tests.
        if (testContext != null) {
            if (!contextService.isEstablished()) {
                LOG.error("Aura context is not established! New context will NOT be created.");
                chain.doFilter(request, response);
                return;
            }
            AuraContext context = contextService.getCurrentContext();

            // Reset mocks if requested, or for the initial GET.
            loadTestMocks(context, doResetTest, testContext.getLocalDefs());
        }
        chain.doFilter(request, response);
    }

    public void init(FilterConfig filterConfig) throws ServletException {
        processInjection(filterConfig);
    }
    
    public void processInjection(FilterConfig filterConfig) {
        if (testContextAdapter == null) {
            SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, filterConfig.getServletContext());
        }
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
        definitionService.getDefinition(targetDescriptor); // prime target def first
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

    private String createURI(String namespace, String name, DefType defType, Mode mode, Format format, String access,
            String testName, String qs) {
        if (mode == null) {
            try {
                mode = contextService.getCurrentContext().getMode();
            } catch (Throwable t) {
                mode = Mode.AUTOJSTEST; // TODO: default to PROD
            }
        }
        
        String ret = String.format(GET_URI, namespace, name, defType.name(), mode.toString(), format, access, testName);
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
                    targetDescriptor.getDefType(), null, Format.HTML, Authentication.AUTHENTICATED.name(), NO_RUN, qs);
        } else {
            // Free-form tests will load only the target component's template.
            // TODO: Allow specifying the template on the test.
            // TODO: Load proxy app for cmps, apps must loadApplication.
            final BaseComponentDef originalDef = (BaseComponentDef) definitionService.getDefinition(targetDescriptor);
            final ComponentDef targetTemplate = originalDef.getTemplateDef();
            String newDescriptorString = String
                    .format("%s$%s", targetDescriptor.getDescriptorName(), testDef.getName());
            final DefDescriptor<ApplicationDef> newDescriptor = definitionService.getDefDescriptor(
                    newDescriptorString, ApplicationDef.class);
            final ApplicationDef dummyDef = definitionService.getDefinition("aurajstest:blank",
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
            TestContext testContext = testContextAdapter.getTestContext(testDef.getQualifiedName());
            testContext.getLocalDefs().add(targetDef);
            return createURI(newDescriptor.getNamespace(), newDescriptor.getName(),
                    newDescriptor.getDefType(), null, Format.HTML, Authentication.AUTHENTICATED.name(), NO_RUN, null);
        }
    }

    private String captureResponse(ServletRequest req, ServletResponse res, String testName, String uri) throws ServletException,
            IOException {
        CapturingResponseWrapper responseWrapper = new CapturingResponseWrapper((HttpServletResponse) res){
            @Override
            public void sendRedirect(String location) throws IOException{
                // If the response is redirected after this filter, we want to
                // handle the redirect, so we need to set the jstestrun
                // parameter to make sure we can see it on the next request.
                Matcher test = jstestToRunPattern.matcher(location);
                if (test.find()) {
                    location = test.replaceAll(testName);
                } else {
                    location = location + (location.indexOf('?') < 0 ? "?" : "&") + jstestToRun.name + "=" + testName;
                }
                super.sendRedirect(location);
            }
        };
        RequestDispatcher dispatcher = req.getServletContext().getContext(uri).getRequestDispatcher(uri);
        if (dispatcher == null) {
            return null;
        }
        dispatcher.forward(req, responseWrapper);
        if (responseWrapper.getRedirectUrl() != null) {
            return null;
        }
        return responseWrapper.getCapturedResponseString();
    }

    private String buildJsTestScriptTag(DefDescriptor<?> targetDescriptor, String testName, int timeout, String original) {
        String tag = "";

        // Inject test framework script tag if it isn't on page already. Unlikely, but framework may not
        // be loaded if the target is server-rendered, or if the target is designed that way (e.g.
        // custom template).
        String testUrl = configAdapter.getAuraJSURL(); // Dependent on mode being a test mode
        if (original == null
                || !original.matches(String.format("(?is).*<script\\s*src\\s*=\\s*['\"]%s['\"][^>]*>.*", testUrl))) {
            tag = String.format("<script src='%s'></script>", testUrl);
        }

        // Inject tag to load and execute test.
        String qs = String.format("aura.testTimeout=%s&aura.nonce=%s", timeout, System.nanoTime());
        String suiteSrcUrl = createURI(targetDescriptor.getNamespace(), targetDescriptor.getName(),
                targetDescriptor.getDefType(), null, Format.JS, Authentication.AUTHENTICATED.name(), testName, qs);
        tag = tag + String.format("<script src='%s'%s></script>\n", suiteSrcUrl, "");
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
        
        out.append(
                String.format(
                    "var testBootstrapFunction = function(testName, suiteProps, testTimeout) { \n"+
                            "if(!$A.test.isComplete()) {\n"+
                                "if(window.sessionStorage) {\n"+
                                    "var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                    "sessionStorage.setItem('TestRunStatus',(oldStatus?oldStatus:'')+'Run '+testName+', timeStamp#'+$A.test.time()+'.'); \n"+
                                "}\n"+
                                "$A.test.run(testName, suiteProps, testTimeout); \n"+
                            "} else {\n"+
                                "if(window.sessionStorage) {\n"+
                                    "var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                    "sessionStorage.setItem('TestRunStatus',(oldStatus?oldStatus:'')+'Skip '+testName+', Test Already Complete, timeStamp#'+$A.test.time()+'.'); \n"+
                                "}\n"+
                            "}\n"+
                    "}; \n"+
                    "if(window && window.Aura && window.Aura.appBootstrapStatus === 'loaded' " +//bootstrap is finished
                         "&& window.$A && window.$A.test && window.$A.test.isComplete instanceof Function ) { \n"+//but the test wasn't
                         "if(window.sessionStorage) {\n"+
                                //"var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                "sessionStorage.setItem('TestRunStatus','Run %s directly, as bootstrap finish before we can push test to its run-after, timeStamp#'+$A.test.time()+'.'); \n"+
                         "}\n"+
                         "testBootstrapFunction('%s', %s, '%s'); \n"+
                    "} else {\n"+
                        "if(window.sessionStorage) {\n"+
                            //"var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                            "sessionStorage.setItem('TestRunStatus','Push %s to bootstrap run after, timeStamp#'+((window.$A && window.$A.test) ? $A.test.time():Date.now())+'.'); \n"+
                        "}\n"+
                        "window.Aura || (window.Aura = {}); \n"+
                        "window.Aura.afterBootstrapReady || (window.Aura.afterBootstrapReady = []); \n"+
                        "window.Aura.afterBootstrapReady.push(testBootstrapFunction.bind(this, '%s', %s, '%s')); \n"+
                    "} \n"
                    ,testName, testName, suiteDef.getCode()+"\t\n", testTimeout, testName, testName, suiteDef.getCode()+"\t\n", testTimeout)
        );
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
                return definitionService.getDefDescriptor(
                        String.format("%s:%s", namespace, name), type.getPrimaryInterface());
            }
        } catch (Throwable t) {
            // Ignore. Pass request onto core servlets.
        }
        return null;
    }

    public void addFilter(HttpFilter filter) {
        synchronized (testCaseFilters) {
            if (filter != null) {
                testCaseFilters.add(0, filter);
            }
        }
    }
    
    public synchronized void removeFilter(HttpFilter filter) {
        synchronized (testCaseFilters) {
            if (filter != null) {
                testCaseFilters.remove(filter);
            }
        }
    }
}
