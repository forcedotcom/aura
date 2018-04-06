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
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.http.RequestParam.MissingParamException;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Action;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.SerializationService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.SystemErrorException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * The servlet for initialization and actions in Aura.
 *
 * The sequence of requests is:
 * <ol>
 * <li>GET(AuraServlet): initial fetch of an aura app/component + Resource Fetches:
 * <ul>
 * <li>GET(AuraResourceServlet:MANIFESt):optional get the manifest</li>
 * <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 * <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 * <li>GET(AuraResourceServlet:JSON):???</li>
 * </ul>
 * </li>
 * <li>Application Execution
 * <ul>
 * <li>GET(AuraServlet:JSON): Fetch additional aura app/component
 * <ul>
 * <li>GET(AuraResourceServlet:MANIFEST):optional get the manifest</li>
 * <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 * <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 * <li>GET(AuraResourceServlet:JSON):???</li>
 * </ul>
 * </li>
 * <li>POST(AuraServlet:JSON): Execute actions.</li>
 * </ul>
 * </li>
 * </ol>
 *
 * Run from aura-jetty project. Pass in these vmargs: <code>
 * -Dconfig=${AURA_HOME}/config -Daura.home=${AURA_HOME} -DPORT=9090
 * </code>
 *
 * Exception handling is dealt with in {@link ServletUtilAdapter#handleServletException} which should almost always be called when
 * exceptions are caught. This routine will use {@link org.auraframework.adapter.ExceptionAdapter ExceptionAdapter} to
 * log and rewrite exceptions as necessary.
 */
public class AuraServlet extends AuraBaseServlet {
    private static final long serialVersionUID = 2218469644108785216L;

    public final static String AURA_PREFIX = "aura.";
    private final static String CSRF_PROTECT = "while(1);\n";
    private final static String UNKNOWN_FRAMEWORK_UID = "UNKNOWN";
    private final static String REPORT_ERROR_ACTION = "ComponentController/ACTION$reportFailedAction";

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45 days. We also use this to "pre-expire"
     * no-cache pages, setting their expiration a month and a half into the past for user agents that don't understand
     * Cache-Control: no-cache.
     * This is the same as ServletUtilAdapterImpl.java
     */
    public final static String UTF_ENCODING = "UTF-8";

    public final static StringParam tag = new StringParam(AURA_PREFIX + "tag", 128, true);
    public final static EnumParam<DefType> defTypeParam = new EnumParam<>(AURA_PREFIX + "deftype", false,
            DefType.class);

    private final static BooleanParam isActionParam = new BooleanParam(AURA_PREFIX + "isAction", false);
    private final static StringParam csrfToken = new StringParam(AURA_PREFIX + "token", 0, true);
    private final static StringParam formatAdapterParam = new StringParam(AURA_PREFIX + "formatAdapter", 0, false);
    private final static StringParam messageParam = new StringParam("message", 0, false);
    private final static StringParam nocacheParam = new StringParam("nocache", 0, false);

    private ExceptionAdapter exceptionAdapter;
    private ContextService contextService;
    private DefinitionService definitionService;
    private ConfigAdapter configAdapter;
    private SerializationService serializationService;
    private LoggingService loggingService;
    private ServerService serverService;
    private InstanceService instanceService;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
    }

    /**
     * Check for the nocache parameter and redirect as necessary.
     *
     * This is part of the appcache refresh, forcing a reload while
     * avoiding the appcache which is important for system such as
     * Android such doesn't adhere to window.location.reload(true)
     * and still uses appcache.
     *
     * It maybe should be done differently (e.g. a nonce).
     *
     * @param request The request to retrieve the parameter.
     * @param response the response (for setting the location header.
     * @returns true if we are finished with the request.
     */
    private void handleNoCacheRedirect(String nocache, HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
        String newLocation = "/";
        try {
            final URI uri = new URI(nocache);
            final String fragment = uri.getFragment();
            final String query = uri.getQuery();
            final String scheme = uri.getScheme();
            final String path = uri.getPath();
            final StringBuffer sb = request.getRequestURL();
            String httpProtocol = "http://";
            String defaultUriScheme = "http";
            String secureUriScheme = "https";
            int dIndex = sb.indexOf(httpProtocol);

            //
            // Make sure we were handed an absolute path, if not, we simply dump the
            // path and redirect to root.
            //
            if (path != null && path.length() > 0 && path.charAt(0) == '/') {
                // if nocache has https specified, or the request is secure,
                // modify sb if it's http
                if (((scheme != null && scheme.equals(secureUriScheme)) || request.isSecure()) && dIndex == 0) {
                    sb.replace(dIndex, dIndex + defaultUriScheme.length(), secureUriScheme);
                }

                int index = sb.indexOf("//");
                index = sb.indexOf("/", index + 2); // find the 3rd slash, start of path
                sb.setLength(index);
                sb.append(path);
                if (query != null && !query.isEmpty()) {
                    sb.append("?").append(query);
                }
                if (fragment != null && !fragment.isEmpty()) {
                    sb.append("#").append(fragment);
                }
                newLocation = sb.toString();
            }
        } catch (Exception e) {
            exceptionAdapter.handleException(
                    new AuraHandledException("Invalid redirect URL in nocache parameter: " + nocache, e));
        }

        servletUtilAdapter.setNoCache(response);
        response.setHeader(HttpHeaders.LOCATION, newLocation);
    }

    /**
     * Translate a string into a message.
     *
     * @param input the input from the customer (unsanitized) to read into a message.
     * @return a message, or null.
     * @throws QuickFixException if there is an error instantiating the action (not action not found).
     */
    public Message readMessage(String input) throws QuickFixException {
        if (input == null) {
            return null;
        }
        // this throws a json parse exception if it can't read.
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(new StringReader(input));
        if (message == null) {
            return null;
        }
        List<?> actions = (List<?>) message.get("actions");
        List<Action> actionList = Lists.newArrayList();
        if (actions != null) {
            for (Object action : actions) {
                Map<?, ?> map = (Map<?, ?>) action;

                // FIXME: ints are getting translated into BigDecimals here.
                @SuppressWarnings("unchecked")
                Map<String, Object> params = (Map<String, Object>) map.get("params");
                String qualifiedName = (String)map.get("descriptor");
                if (qualifiedName == null) {
                    // this should never happen, we should not get an empty descriptor.
                    // If we do, just ignore it, and continue;
                    continue;
                }
                ActionDef def;
                try {
                    def = definitionService.getDefinition(qualifiedName, ActionDef.class);
                } catch (QuickFixException qfe) {
                    // If this fails, it means either we have incompatible versions, or the client
                    // has been compromised, or the data is just messed up. In that case just drop
                    // it on the floor and continue.
                    continue;
                }
                Action instance;
                try {
                    instance = (Action) instanceService.getInstance(def, params);
                } catch (QuickFixException qfe) {
                    // Don't ignore this. In this case, we have a broken server. It should never really
                    // happen in production, but it will likely occur during development. In that case
                    // we'd rather break and let someone figure the breakage out. Note that this is the
                    // _only_ place we can throw a QFE.
                    throw qfe;
                }
                instance.setId((String) map.get("id"));
                String cd = (String) map.get("callingDescriptor");
                if (cd != null && !cd.equals("UNKNOWN")) {
                    DefDescriptor<ComponentDef> callingDescriptor = definitionService.getDefDescriptor(cd, ComponentDef.class);
                    instance.setCallingDescriptor(callingDescriptor);
                }
                String v = (String) map.get("version");
                if (v != null) {
                    instance.setCallerVersion(v);
                }

                if (map.get("storable") != null) {
                    instance.setStorable();
                }

                actionList.add(instance);
            }
        }

        return new Message(actionList);
    }

    /**
     * Handle an HTTP GET operation.
     *
     * The HTTP GET operation is used to retrieve resources from the Aura servlet AND for publicly cacheable actions.
     *
     * All other action requests use POST.
     *
     * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuraContext context;
        String tagName;
        DefType defType;
        ServletContext servletContext = getServletContext();

        //
        // Pre-hook
        //
        if (servletUtilAdapter.actionServletGetPre(request, response)) {
            return;
        }

        // check if the GET request is for a publicly cacheable action, and if so, handle it
        if (isActionGetRequest(request)) {
            handleActionRequest(request, response, true);
            return;
        }

        //
        // Initial setup. This should never fail.
        //
        try {
            response.setCharacterEncoding(UTF_ENCODING);
            context = contextService.getCurrentContext();
            response.setContentType(servletUtilAdapter.getContentType(context.getFormat()));
        } catch (RuntimeException re) {
            //
            // If we can't get this far, log the exception and bolt.
            // We can't do our normal exception handling because
            // at this point we simply broke.
            //
            exceptionAdapter.handleException(re);
            servletUtilAdapter.send404(servletContext, request, response);
            return;
        }
        String nocache = nocacheParam.get(request);
        if (nocache != null && !nocache.isEmpty()) {
            handleNoCacheRedirect(nocache, request, response);
            return;
        }

        DefDescriptor<? extends BaseComponentDef> defDescriptor;

        //
        // Now check and fetch parameters.
        // These are not formally part of the Aura API, as this is the initial
        // request. All we need are a tag/type or descriptor. Except, of course,
        // the special case of nocache, which is required by the appcache handling.
        // I would love for a simpler way to be figured out.
        //
        try {
            tagName = getTagName(request);
            defType = defTypeParam.get(request, DefType.COMPONENT);
            if (tagName == null || tagName.isEmpty()) {
                throw new AuraRuntimeException("Invalid request, tag must not be empty");
            }

            Mode mode = context.getMode();
            if (!servletUtilAdapter.isValidDefType(defType, mode)) {
                servletUtilAdapter.send404(servletContext, request, response);
                return;
            }

            Class<? extends BaseComponentDef> defClass = defType == DefType.APPLICATION ? ApplicationDef.class : ComponentDef.class;
            defDescriptor = definitionService.getDefDescriptor(tagName, defClass);
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(new SystemErrorException(t), false, context, request, response, false);
            return;
        }

        internalGet(request, response, defDescriptor, context);
    }

    private <T extends BaseComponentDef> void internalGet(HttpServletRequest request,
                                                          HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws ServletException, IOException {
        T def;
        try {
            context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

            context.setApplicationDescriptor(defDescriptor);
            definitionService.updateLoaded(defDescriptor);
            def = definitionService.getDefinition(defDescriptor);

            if (!context.isTestMode() && !context.isDevMode()) {
                assertAccess(def);
            }
        } catch (Throwable t) {
            try {
                servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
            } catch (Throwable t2){
                //if csp headers fail on this exception path ignore the error as it will mask the handled exception
            }
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
            return;
        }

        try {
            /**
             * We set html to no-cache here always.
             */
            servletUtilAdapter.setNoCache(response);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            // Prevents Mhtml Xss exploit:
            StringBuilder out = new StringBuilder(); //keep content local so we can safely set headers after render
            out.append("\n    ");
            @SuppressWarnings("unchecked")
            Class<T> clazz = (Class<T>) def.getDescriptor().getDefType().getPrimaryInterface();
            String formatAdapter = formatAdapterParam.get(request);
            serializationService.write(def, getComponentAttributes(request), clazz, out, formatAdapter);

            // we could not do the csp headers until all inline js hashes had been collected
            servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);

            PrintWriter writer = response.getWriter();
            writer.append(out.toString());

        } catch (Throwable e) {
            try {
                servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
            } catch (Throwable t2){
                //if csp headers fail on this exception path ignore the error as it will mask the handled exception
            }
            servletUtilAdapter.handleServletException(e, false, context, request, response, true);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
        }
    }

    private void assertAccess(BaseComponentDef def) throws QuickFixException {
        String defaultNamespace = configAdapter.getDefaultNamespace();
        DefDescriptor<?> referencingDescriptor = (defaultNamespace != null && !defaultNamespace.isEmpty())
                ? definitionService.getDefDescriptor(String.format("%s:servletAccess", defaultNamespace),
                        ApplicationDef.class)
                : null;
        definitionService.assertAccess(referencingDescriptor, def);
    }


    private Map<String, Object> getComponentAttributes(HttpServletRequest request) {
        Enumeration<String> attributeNames = request.getParameterNames();
        Map<String, Object> attributes = new HashMap<>();

        while (attributeNames.hasMoreElements()) {
            String name = attributeNames.nextElement().trim();
            if (!name.startsWith(AURA_PREFIX) && !name.isEmpty()) {
                Object value = new StringParam(name, 0, false).get(request);

                attributes.put(name, value);
            }
        }

        return attributes;
    }

    /**
     * Determine from the params if a GET request is for an action.
     *
     * We're trusting the request with this check, and assuming a more thorough check will be done later (it is)
     *
     * @param request the HTTP GET request
     * @return if the isAction and message params were specified
     */
    private boolean isActionGetRequest(HttpServletRequest getRequest) {
        return isActionParam.get(getRequest, false) && messageParam.get(getRequest) != null;
    }

    private boolean isBootstrapAction(Message message, boolean productionMode) {
        // The bootstrap action cannot not have a CSRF token so we let it through
        boolean isBootstrapAction = false;
        if (message.getActions().size() == 1) {
            Action action = message.getActions().get(0);
            String name = action.getDescriptor().getQualifiedName();
            if (name.equals("aura://ComponentController/ACTION$getApplication")
                    || (name.equals("aura://ComponentController/ACTION$getComponent") && !productionMode)) {
                //
                // Oooooh this is _ugly_, digging in to the internals like this. There has got to be
                // a better way.
                //
                Boolean loadLabels=(Boolean)(action.getParams()!=null?action.getParams().get("chainLoadLabels"):null);
                isBootstrapAction = Boolean.TRUE.equals(loadLabels);
            }
        } else if (message.getActions().size() == 2) {
            Action action = message.getActions().get(0);
            String name = action.getDescriptor().getQualifiedName();
            if (name.equals("aura://ComponentController/ACTION$getApplication")
                    || (name.equals("aura://ComponentController/ACTION$getComponent") && productionMode)) {
                isBootstrapAction = true;
            }
            Action labelAction = message.getActions().get(1);
            name = labelAction.getDescriptor().getQualifiedName();
            if (!name.equals("aura://ComponentController/ACTION$loadLabels")) {
                isBootstrapAction = false;
            }
        }
        return isBootstrapAction;
    }

    private void handleActionRequest(HttpServletRequest request, HttpServletResponse response, boolean isGet) throws ServletException, IOException {
        AuraContext context = contextService.getCurrentContext();
        response.setCharacterEncoding(UTF_ENCODING);
        boolean written = false;

        servletUtilAdapter.setNoCache(response);

        try {
            if (context.getFormat() != Format.JSON) {
                throw new AuraHandledException("Invalid request, post must use JSON");
            }

            response.setContentType(servletUtilAdapter.getContentType(Format.JSON));

            //
            // First, parse the message. But do some fancy footwork around QuickFixExceptions. If we
            // have trouble instantiating our actions, we want to fail _after_ we check for COOSE.
            //
            Message message = null;
            QuickFixException messageError = null;
            loggingService.startTimer(LoggingService.TIMER_DESERIALIZATION);
            try {
                message = readMessage(messageParam.get(request));
            } catch (QuickFixException qfe) {
                messageError = qfe;
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_DESERIALIZATION);
            }
            if (message == null && messageError == null) {
                throw new AuraHandledException("Invalid request, no message");
            }


            String fwUID = configAdapter.getAuraFrameworkNonce();

            if (!fwUID.equals(context.getFrameworkUID())) {
                if (UNKNOWN_FRAMEWORK_UID.equals(context.getFrameworkUID()) && message != null) {
                    // we had a serious boostrap issue and want to log the failed action (5x reload)
                    // an unknown fwuid, only execute failed actions. we don't want anything else
                    // potentially creeping in.  at this point the sid should have already been checked
                    // and the user is authenticated, but their browser is in a hosed state
                    List<Action> actions = Lists.newArrayList();
                    for (Action action : message.getActions()) {
                        if (action != null && action.getDescriptor() != null
                                && !REPORT_ERROR_ACTION.equals(action.getDescriptor().getDescriptorName())) {
                            actions.add(action);
                        }
                    }
                    // this will write the response to the output, and then the COOS will be appended,
                    // so the resulting json response will be invalid
                    // but this case should only happen when the code isn't even checking for a response.
                    if (actions.size() > 0) {
                        serverService.run(new Message(actions), context, response.getWriter(), null);
                    }
                }

                throw new ClientOutOfSyncException("Framework has been updated. Expected: " + fwUID
                        + " Actual: " + context.getFrameworkUID());
            }

            context.setFrameworkUID(fwUID);

            DefDescriptor<? extends BaseComponentDef> applicationDescriptor = context.getApplicationDescriptor();

            if (applicationDescriptor != null) {
                // Check only if client app out of sync
                try {
                    definitionService.updateLoaded(applicationDescriptor);
                } catch (QuickFixException qfe) {
                    // Ignore quick fix. If we got a 'new' quickfix, it will be thrown as
                    // a client out of sync exception, since the UID will not match.
                }

                if (!context.isTestMode() && !context.isDevMode()) {
                    assertAccess(definitionService.getDefinition(applicationDescriptor));
                }
            }

            // So now that we have checked that we can get in.... make sure that we don't have an error
            // from bad actions.
            if (messageError != null) {
                throw messageError;
            }

            // For GET requests, verify action public caching is enabled AND the action is publicly
            // cacheable based on the ActionDef
            if (isGet && (!configAdapter.isActionPublicCachingEnabled()
                          || !servletUtilAdapter.isPubliclyCacheableAction(message))) {
                throw new AuraHandledException("Invalid request: Public caching disabled or specified action not marked as publicly cacheable");
            }

            // The bootstrap action cannot not have a CSRF token so we let it through
            boolean isBootstrapAction = isBootstrapAction(message, servletUtilAdapter.isProductionMode(context.getMode()));

            Map<String, Object> attributes = null;
            if (isBootstrapAction) {
                attributes = Maps.newHashMap();
                attributes.put("token", configAdapter.getCSRFToken());
            } else if (!isGet) {
                configAdapter.validateCSRFToken(csrfToken.get(request));
            }

            // some of the CSP headers depend on the app, so pass in the app descriptor here
            servletUtilAdapter.setCSPHeaders(applicationDescriptor, request, response);

            PrintWriter servletOut = response.getWriter();
            Writer out = servletOut;
            boolean publiclyCacheable = isGet && context.getActionPublicCacheKey() != null
                    && context.getActionPublicCacheKey().equals(configAdapter.getActionPublicCacheKey());
            if (publiclyCacheable) {
                // We will set cache headers to allow caching for publicly cacheable action if
                // the action public cache key sent in the context is the same as the current value
                // AND there are no errors. So we need to use a string buffer for the action output first
                // so that we can then check the action status and set any cache headers before writing
                // the response body.
                out = new StringWriter();

                // Remove the Browser GVP as we don't want browser-specific in the cache.
                context.getGlobalProviders().remove(AuraValueProviderType.BROWSER.getPrefix());
            } else {
                written = true;
            }

            out.write(CSRF_PROTECT);

            serverService.run(message, context, out, attributes);

            if (publiclyCacheable) {
                // Set cache headers if no errors
                if (message.getActions().get(0).getErrors() == null
                        || message.getActions().get(0).getErrors().size() == 0) {
                    servletUtilAdapter.setCacheTimeout(response,
                            servletUtilAdapter.getPubliclyCacheableActionExpiration(message) * 1000, false);
                }

                // Write the response body after we are done writing cache headers
                written = true;
                servletOut.write(out.toString());
            }
        } catch (InvalidParamException | MissingParamException ipe) {
            servletUtilAdapter.handleServletException(new SystemErrorException(ipe), false, context, request, response, false);
            return;
        } catch (JsonParseException jpe) {
            servletUtilAdapter.handleServletException(new SystemErrorException(jpe), false, context, request, response, false);
        } catch (Exception e) {
            servletUtilAdapter.handleServletException(e, false, context, request, response, written);
        }
    }

    /**
     * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        //
        // Pre-hook
        //
        if (servletUtilAdapter.actionServletPostPre(request, response)) {
            return;
        }

        handleActionRequest(request, response, false);
    }

    /**
     * Get tag name from params.
     *
     * @param request http request
     * @return tag name param
     */
    protected String getTagName(HttpServletRequest request) {
        return tag.get(request);
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
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

    protected ConfigAdapter getConfigAdapter() {
        return configAdapter;
    }

    @Inject
    public void setSerializationService(SerializationService serializationService) {
        this.serializationService = serializationService;
    }

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setServerService(ServerService serverService) {
        this.serverService = serverService;
    }

    @Inject
    public void setInstanceService(InstanceService instanceService) {
        this.instanceService = instanceService;
    }
}
