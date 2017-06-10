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
import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
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
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.http.RequestParam.MissingParamException;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Action;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
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
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

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
                sb.append(uri.getPath());
                if (query != null && !query.isEmpty()) {
                    sb.append("?").append(query);
                }
                if (fragment != null && !fragment.isEmpty()) {
                    sb.append("#").append(fragment);
                }
                newLocation = sb.toString();
            }
        } catch (Exception e) {
            // This exception should never happen.
            // If happened: log a gack and redirect
            exceptionAdapter.handleException(e);
        }

        servletUtilAdapter.setNoCache(response);
        response.setHeader(HttpHeaders.LOCATION, newLocation);
    }


    /**
     * Handle an HTTP GET operation.
     *
     * The HTTP GET operation is used to retrieve resources from the Aura servlet. It is only used for this purpose,
     * where POST is used for actions.
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
            servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
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
            servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
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
            String name = attributeNames.nextElement();
            if (!name.startsWith(AURA_PREFIX)) {
                Object value = new StringParam(name, 0, false).get(request);

                attributes.put(name, value);
            }
        }

        return attributes;
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


    /**
     * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        AuraContext context = contextService.getCurrentContext();
        response.setCharacterEncoding(UTF_ENCODING);
        boolean written = false;

        servletUtilAdapter.setNoCache(response);

        //
        // Pre-hook
        //
        if (servletUtilAdapter.actionServletPostPre(request, response)) {
            return;
        }
        try {
            if (context.getFormat() != Format.JSON) {
                throw new AuraRuntimeException("Invalid request, post must use JSON");
            }
            response.setContentType(servletUtilAdapter.getContentType(Format.JSON));
            String msg = messageParam.get(request);
            if (msg == null) {
                throw new AuraHandledException("Invalid request, no message");
            }

            String fwUID = configAdapter.getAuraFrameworkNonce();
            if (!fwUID.equals(context.getFrameworkUID())) {
                if (UNKNOWN_FRAMEWORK_UID.equals(context.getFrameworkUID()) && msg.contains(REPORT_ERROR_ACTION)) {
                    // we had a serious boostrap issue and want to log the failed action (5x reload)
                    Message message = serializationService.read(new StringReader(msg), Message.class);
                    List<Action> actions = message.getActions();
                    // with an unknown fwuid, only execute failed actions. we don't want anything else potentially creeping in.
                    // at this point the sid should have already been checked and the user is authenticated, but their browser is in a hosed state
                    Iterator<Action> actionsIterator = actions.iterator();
                    while(actionsIterator.hasNext()) {
                        Action action = actionsIterator.next();
                        if (action == null || action.getDescriptor() == null || !REPORT_ERROR_ACTION.equals(action.getDescriptor().getDescriptorName())) {
                            // since actions was a reference from message, we're actually modifying the list of actions in 'message'
                            actionsIterator.remove();
                        }
                    }
                    // this will write the response to the output, and then the COOS will be appended, so the resulting json response will be invalid
                    // but this case should only happen when the code isn't even checking for a response.
                    if (actions.size() > 0) {
                        serverService.run(message, context, response.getWriter(), null);
                    }
                }
                throw new ClientOutOfSyncException("Framework has been updated. Expected: " + fwUID +
                        " Actual: " + context.getFrameworkUID());
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

            Message message;
            loggingService.startTimer(LoggingService.TIMER_DESERIALIZATION);
            try {
                message = serializationService.read(new StringReader(msg), Message.class);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_DESERIALIZATION);
            }

            // The bootstrap action cannot not have a CSRF token so we let it through
            boolean isBootstrapAction = isBootstrapAction(message, servletUtilAdapter.isProductionMode(context.getMode()));

            if (!isBootstrapAction) {
                configAdapter.validateCSRFToken(csrfToken.get(request));
            }

            // Knowing the app, we can do the HTTP headers, some of which depend on
            // the app in play, so we couldn't do this
            servletUtilAdapter.setCSPHeaders(applicationDescriptor, request, response);

            Map<String, Object> attributes = null;
            if (isBootstrapAction) {
            	attributes = Maps.newHashMap();
            	attributes.put("token", configAdapter.getCSRFToken());
            }

            PrintWriter out = response.getWriter();
            written = true;
            out.write(CSRF_PROTECT);
            serverService.run(message, context, out, attributes);
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
}
