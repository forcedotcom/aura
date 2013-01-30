/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.URI;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.ThemeDef;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Application;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
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
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.SystemErrorException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;

// DCHASMAN TODO Move this into its own aura-heroku module
/*import javax.servlet.ServletException;
 import org.eclipse.jetty.webapp.*;*/

/**
 * The servlet for initialization and actions in Aura.
 *
 * The sequence of requests is:
 * <ol>
 *   <li>GET(AuraServlet): initial fetch of an aura app/component + Resource Fetches:
 *     <ul>
 *       <li>GET(AuraResourceServlet:MANIFESt):optional get the manifest</li>
 *       <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 *       <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 *       <li>GET(AuraResourceServlet:JSON):???</li>
 *     </ul>
 *   </li>
 *   <li>Application Execution
 *     <ul>
 *       <li>GET(AuraServlet:JSON): Fetch additional aura app/component
 *         <ul>
 *           <li>GET(AuraResourceServlet:MANIFESt):optional get the manifest</li>
 *           <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 *           <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 *           <li>GET(AuraResourceServlet:JSON):???</li>
 *         </ul></li>
 *       <li>POST(AuraServlet:JSON): Execute actions.</li>
 *     </ul>
 *   </li>
 * </ol>
 * 
 * Run from aura-jetty project. Pass in these vmargs: <code>
 * -Dconfig=${AURA_HOME}/config -Daura.home=${AURA_HOME} -DPORT=9090
 * </code>
 * 
 * Exception handling is dealt with in {@link #handleServletException} which
 * should almost always be called when exceptions are caught. This routine will
 * use {@link org.auraframework.adapter.ExceptionAdapter ExceptionAdapter} to
 * log and rewrite exceptions as necessary.
 */
public class AuraServlet extends AuraBaseServlet {
    private static final long serialVersionUID = 2218469644108785216L;
    public static final String DISABLE_APPCACHE_PROPERTY = "aura.noappcache";

    protected final static StringParam tag = new StringParam(AURA_PREFIX + "tag", 128, true);
    private static final EnumParam<DefType> defTypeParam = new EnumParam<DefType>(AURA_PREFIX + "deftype", false,
            DefType.class);
    private final static StringParam messageParam = new StringParam("message", 0, false);

    // FIXME: is this really a good idea?
    private final static StringParam nocacheParam = new StringParam("nocache", 0, false);

    @Override
    public void init() throws ServletException {
        super.init();
    }

    /**
     * Check for the nocache parameter and redirect as necessary.
     *
     * Not entirely sure what this is used for (need doco). It is part of 
     * the appcache refresh, forcing a reload while avoiding the appcache.
     *
     * It maybe should be done differently (e.g. a nonce).
     *
     * @param request The request to retrieve the parameter.
     * @param response the response (for setting the location header.
     * @returns true if we are finished with the request.
     */
    private boolean handleNoCacheRedirect(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        //
        // FIXME:!!!
        // This is part of the appcache refresh, forcing a reload while
        // avoiding the appcache. It is here because (fill in the blank).
        //
        // This should probably be handled a little differently, maybe even
        // before we do any checks at all.
        //
        String nocache = nocacheParam.get(request);
        if (nocache == null || nocache.isEmpty()) {
            return false;
        }
        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
        
        String newLocation =  "/";
        
        try{
            URI uri = new URI(nocache,true);
            String fragment = uri.getEscapedFragment();
            StringBuilder sb = new StringBuilder(uri.getEscapedPathQuery());
            if (fragment != null && !fragment.isEmpty()) {
                sb.append("#");
                sb.append(fragment);
            }
            newLocation = sb.toString();
        } catch (Exception e) {
            // This exception should never happen.
            // If happened: log a gack and redirect
            Aura.getExceptionAdapter().handleException(e);
        }

        setNoCache(response);
        response.setHeader("Location", newLocation);
        return true;
    }

    /**
     * Handle an HTTP GET operation.
     * 
     * The HTTP GET operation is used to retrieve resources from the Aura
     * servlet. It is only used for this purpose, where POST is used for
     * actions.
     * 
     * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Message<?> message;
        Message<?> ret;
        ServerService serverService;
        AuraContext context;
        String tagName;
        DefType defType;

        response.setCharacterEncoding(UTF_ENCODING);
        try {
            serverService = Aura.getServerService();
            context = Aura.getContextService().getCurrentContext();
            response.setContentType(getContentType(context.getFormat()));
        } catch (RuntimeException re) {
            //
            // If we can't get this far, log the exception and bolt.
            // We can't do our normal exception handling because
            // at this point we simply broke.
            //
            Aura.getExceptionAdapter().handleException(re);
            send404(request, response);
            return;
        }
        try {
            tagName = tag.get(request);
            defType = defTypeParam.get(request, DefType.COMPONENT);

            //
            // TODO: this should disappear!!!!! -GPO
            // Verify why it is here.
            //
            if (handle404(request, response, tagName, defType)) {
                return;
            }

            //
            // TODO: evaluate this for security.
            //
            if (handleNoCacheRedirect(request, response)) {
                return;
            }

            message = getGetMessage(tagName, defType);

            try {
                ret = serverService.temporaryGet(message, context);
            } catch (QuickFixException x) {
                handleServletException(x, true, context, request, response, false);
                return;
            }
        } catch (RequestParam.InvalidParamException ipe) {
            handleServletException(new SystemErrorException(ipe), false, context, request, response, false);
            return;
        } catch (RequestParam.MissingParamException mpe) {
            handleServletException(new SystemErrorException(mpe), false, context, request, response, false);
            return;
        } catch (Throwable t) {
            handleServletException(t, false, context, request, response, false);
            return;
        }

        switch (context.getFormat()) {
        case JSON:
            handleJsonFormat(request, response, tagName, defType, getComponentAttributes(request));
            break;
        case HTML:
            handleHtmlFormat(request, response, ret.getDef(), getComponentAttributes(request));
            break;
        default:
            break;
        }
    }

    private Message<?> getGetMessage(String tagName, DefType defType) {
        DefinitionService definitionService = Aura.getDefinitionService();
        Message<?> message = null;

        if (defType == DefType.APPLICATION) {
            DefDescriptor<ApplicationDef> defDescriptor = definitionService.getDefDescriptor(tagName,
                    ApplicationDef.class);
            Aura.getContextService().getCurrentContext().setApplicationDescriptor(defDescriptor);
            message = new Message<ApplicationDef>(null, defDescriptor, null);

        } else if (defType == DefType.COMPONENT) {
            DefDescriptor<ComponentDef> defDescriptor = definitionService.getDefDescriptor(tagName, ComponentDef.class);
            message = new Message<ComponentDef>(null, defDescriptor, null);
            Aura.getContextService().getCurrentContext().setApplicationDescriptor(defDescriptor);

        }

        return message;
    }

    /**
     * Allow the servlet to override page access.
     * 
     * FIXME: this is totally bogus and should be handled by the security
     * provider - GPO.
     */
    private boolean handle404(HttpServletRequest request, HttpServletResponse response, String tagName, DefType defType)
            throws ServletException, IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Mode mode = context.getMode();

        if (!isValidDefType(defType, mode)) {
            send404(request, response);
            return true;
        }

        return false;
    }

    protected boolean isValidDefType(DefType defType, Mode mode) {
        return (defType == DefType.APPLICATION || defType == DefType.COMPONENT);
    }

    private void handleJsonFormat(HttpServletRequest request, HttpServletResponse response, String tagName,
            DefType defType, Map<String, Object> attributes) throws IOException, ServletException {
        InstanceService instanceService = Aura.getInstanceService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        LoggingService loggingService = Aura.getLoggingService();
        boolean written = false;

        BaseComponent<?, ?> component = null;
        try {
            setNoCache(response);

            if (defType == DefType.APPLICATION) {
                Application app = instanceService.getInstance(tagName, ApplicationDef.class, attributes);
                component = app;
            } else if (defType == DefType.COMPONENT) {
                component = (Component) instanceService.getInstance(tagName, ComponentDef.class, attributes);
            }

            if (context.getLastMod() != null && !context.getLastMod().isEmpty()
                    && !isUpToDate(Long.parseLong(context.getLastMod()))) {
                deleteManifestCookie(response);
                throw new ClientOutOfSyncException(OUTDATED_MESSAGE);
            }
            Map<String, Object> map = Maps.newHashMap();
            map.put("token", getToken());
            map.put("context", context);
            map.put("component", component);

            PrintWriter out = response.getWriter();
            out.write(CSRF_PROTECT);
            written = true;
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            Json.serialize(map, out, context.getJsonSerializationContext());
        } catch (Throwable e) {
            handleServletException(e, false, context, request, response, written);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
        }
    }

    private void handleHtmlFormat(HttpServletRequest request, HttpServletResponse response, BaseComponentDef def,
            Map<String, Object> attributes) throws IOException, ServletException {
        SerializationService serializationService = Aura.getSerializationService();
        LoggingService loggingService = Aura.getLoggingService();
        response.setCharacterEncoding(UTF_ENCODING);

        try {
            if (shouldCacheHTMLTemplate(request)) {
                setLongCache(response);
            } else {
                setNoCache(response);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            // Prevents Mhtml Xss exploit:
            PrintWriter out = response.getWriter();
            out.write("\n    ");
            serializationService.write(def, attributes, def.getDescriptor().getDefType().getPrimaryInterface(), out);
        } catch (Throwable e) {
            AuraContext context = Aura.getContextService().getCurrentContext();
            handleServletException(e, false, context, request, response, true);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
        }
    }

    private static boolean isUpToDate(long lastMod) throws QuickFixException {
        return (lastMod == -1) || (lastMod == getLastMod());
    }

    public static List<String> getBaseScripts() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String contextPath = context.getContextPath();
        Mode mode = context.getMode();

        ConfigAdapter config = Aura.getConfigAdapter();

        List<String> ret = new ArrayList<String>();

        switch (mode) {
        case PTEST:
            ret.add(config.getJiffyJSURL());
            ret.add(config.getJiffyUIJSURL());
            break;
        case CADENCE:
            ret.add(config.getJiffyJSURL());
            break;
        default:
        }

        ret.add(contextPath + config.getAuraJSURL());

        return ret;
    }

    public static List<String> getNamespacesScripts() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        String contextPath = context.getContextPath();
        List<String> ret = new ArrayList<String>();

        if (preloads != null && !preloads.isEmpty()) {
            StringBuilder defs = new StringBuilder(contextPath).append("/l/");
            StringBuilder sb = new StringBuilder();

            try {
                Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
            String contextJson = AuraTextUtil.urlencode(sb.toString());
            defs.append(contextJson);
            defs.append("/app.js");
            ret.add(defs.toString());
        }
        return ret;
    }

    public static List<String> getScripts() throws QuickFixException {
        List<String> ret = new ArrayList<String>();
        ret.addAll(getBaseScripts());
        ret.addAll(getNamespacesScripts());
        return ret;
    }

    public static List<String> getStyles() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        Mode mode = context.getMode();
        String contextPath = context.getContextPath();
        ConfigAdapter config = Aura.getConfigAdapter();

        List<String> ret = new ArrayList<String>();

        if (preloads != null && !preloads.isEmpty()) {
            StringBuilder defs = new StringBuilder(contextPath).append("/l/");
            StringBuilder sb = new StringBuilder();

            try {
                Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
            String contextJson = AuraTextUtil.urlencode(sb.toString());
            defs.append(contextJson);
            defs.append("/app.css");
            ret.add(defs.toString());
        }
        switch (mode) {
        case PTEST:
            ret.add(config.getJiffyCSSURL());
            break;
        default:
        }
        return ret;
    }

    public static Set<String> getImages() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> namespaces = context.getPreloads();
        Set<String> imgURLs = new TreeSet<String>();

        try {
            DefinitionService definitionService = Aura.getDefinitionService();
            for (String namespace : namespaces) {
                DefDescriptor<ThemeDef> matcher = definitionService.getDefDescriptor(
                        String.format("css://%s.*", namespace), ThemeDef.class);
                Set<DefDescriptor<ThemeDef>> descriptors = definitionService.find(matcher);

                for (DefDescriptor<ThemeDef> descriptor : descriptors) {
                    if (!descriptor.getName().toLowerCase().endsWith("template")) {
                        ThemeDef def = descriptor.getDef();
                        if (def != null) {
                            Set<String> imgs = def.getValidImageURLs();
                            if (imgs != null && imgs.size() > 0) {
                                imgURLs.addAll(imgs);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
        return imgURLs;
    }

    private Map<String, Object> getComponentAttributes(HttpServletRequest request) {
        Enumeration<String> attributeNames = request.getParameterNames();
        Map<String, Object> attributes = new HashMap<String, Object>();

        while (attributeNames.hasMoreElements()) {
            String name = attributeNames.nextElement();
            if (!name.startsWith(AURA_PREFIX)) {
                Object value = new StringParam(name, 0, false).get(request);

                attributes.put(name, value);
            }
        }

        return attributes;
    }

    /**
     * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        SerializationService serializationService = Aura.getSerializationService();
        LoggingService loggingService = Aura.getLoggingService();
        ContextService contextService = Aura.getContextService();
        ServerService serverService = Aura.getServerService();
        AuraContext context = contextService.getCurrentContext();
        response.setCharacterEncoding(UTF_ENCODING);
        boolean written = false;

        try {
            if (context.getFormat() != Format.JSON) {
                throw new AuraRuntimeException("Invalid request, post must use JSON");
            }

            Message<?> message;
            setNoCache(response);

            if (context.getLastMod() != null && !context.getLastMod().isEmpty()
                    && !isUpToDate(Long.parseLong(context.getLastMod()))) {
                AuraBaseServlet.deleteManifestCookie(response);
                throw new ClientOutOfSyncException(OUTDATED_MESSAGE);
            }

            response.setContentType(getContentType(context.getFormat()));
            validateCSRF(csrfToken.get(request));
            String msg = messageParam.get(request);

            if (msg == null) {
                throw new AuraRuntimeException("Invalid request, no message");
            }
            loggingService.startTimer(LoggingService.TIMER_DESERIALIZATION);
            try {
                message = serializationService.read(new StringReader(msg), Message.class);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_DESERIALIZATION);
            }

            Message<?> result = serverService.run(message, context);
            if (result != null) {
                loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
                loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                try {
                    context.setSerializePreLoad(false);
                    PrintWriter out = response.getWriter();
                    out.write(CSRF_PROTECT);
                    written = true;
                    serializationService.write(result, null, out);
                } finally {
                    loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                    loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
                }
            }
        } catch (RequestParam.InvalidParamException ipe) {
            handleServletException(new SystemErrorException(ipe), false, context, request, response, false);
            return;
        } catch (RequestParam.MissingParamException mpe) {
            handleServletException(new SystemErrorException(mpe), false, context, request, response, false);
            return;
        } catch (Exception e) {
            handleServletException(e, false, context, request, response, written);
        }
    }

    protected void sendPost404(HttpServletRequest request, HttpServletResponse response) {
        throw new NoAccessException("Missing required perms, or tried to access inaccessible namespace.");
    }
}
