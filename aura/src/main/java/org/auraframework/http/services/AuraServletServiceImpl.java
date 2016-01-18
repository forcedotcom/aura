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
package org.auraframework.http.services;

import java.io.*;
import java.net.URI;
import java.util.*;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.adapter.*;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.*;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Action;
import org.auraframework.service.*;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.*;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

import com.google.common.collect.Maps;

public final class AuraServletServiceImpl implements AuraServletService {
	private final static String AURA_PREFIX = "aura.";
	private final static String CSRF_PROTECT = "while(1);\n";

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45 days. We also use this to "pre-expire"
     * no-cache pages, setting their expiration a month and a half into the past for user agents that don't understand
     * Cache-Control: no-cache.
     * This is the same as ServletUtilAdapterImpl.java
     */
	private final static String UTF_ENCODING = "UTF-8";

	private final static StringParam csrfToken = new StringParam(AURA_PREFIX + "token", 0, true);
	private final static StringParam tag = new StringParam(AURA_PREFIX + "tag", 128, true);
    private final static EnumParam<DefType> defTypeParam = new EnumParam<>(AURA_PREFIX + "deftype", false, DefType.class);
    private final static StringParam formatAdapterParam = new StringParam(AURA_PREFIX + "formatAdapter", 0, false);
    private final static StringParam messageParam = new StringParam("message", 0, false);
    private final static StringParam nocacheParam = new StringParam("nocache", 0, false);
    
    // These should be autowired. We can keep the constructor passing them all in for testing
    // but ideally the servlet that utilizes this class would just inject it.
	private final ExceptionAdapter exceptionAdapter;
	private final ServletUtilAdapter servletUtilAdapter;
	private final ManifestUtil manifestUtil;
	private final ContextService contextService;
	private final DefinitionService definitionService;
	private final ConfigAdapter configAdapter;
    private final SerializationService serializationService;
    private final LoggingService loggingService;
    private final ServerService serverService;
    
	public AuraServletServiceImpl(ServletUtilAdapter servletUtilAdapter, ConfigAdapter configAdapter, ExceptionAdapter exceptionAdapter, 
			ManifestUtil manifestUtil, ContextService contextService, DefinitionService definitionService,
			SerializationService serializationService, LoggingService loggingService, ServerService serverService) {
		this.servletUtilAdapter = servletUtilAdapter;
		this.exceptionAdapter = exceptionAdapter;
		this.configAdapter = configAdapter;
		this.manifestUtil = manifestUtil;
		this.contextService = contextService;
		this.definitionService = definitionService;
		this.serializationService = serializationService;
		this.loggingService = loggingService;
		this.serverService = serverService;
	}

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response, ServletContext servletContext) throws ServletException, IOException {
        AuraContext context;
        String tagName;
        DefType defType;

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
            servletUtilAdapter.send404(servletContext ,request, response);
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
            tagName = tag.get(request);
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
        } catch (RequestParam.InvalidParamException ipe) {
        	servletUtilAdapter.handleServletException(new SystemErrorException(ipe), false, context, request, response, false);
            return;
        } catch (RequestParam.MissingParamException mpe) {
        	servletUtilAdapter.handleServletException(new SystemErrorException(mpe), false, context, request, response, false);
            return;
        } catch (Throwable t) {
        	servletUtilAdapter.handleServletException(new SystemErrorException(t), false, context, request, response, false);
            return;
        }
        
        internalGet(request, response, defDescriptor, context);
    }
    
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
                throw new AuraRuntimeException("Invalid request, no message");
            }

            String fwUID = Aura.getConfigAdapter().getAuraFrameworkNonce();
            if (!fwUID.equals(context.getFrameworkUID())) {
                throw new ClientOutOfSyncException("Framework has been updated");
            }
            context.setFrameworkUID(fwUID);

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

            DefDescriptor<? extends BaseComponentDef> applicationDescriptor = context.getApplicationDescriptor();

            // Knowing the app, we can do the HTTP headers, so of which depend on
            // the app in play, so we couldn't do this
            servletUtilAdapter.setCSPHeaders(applicationDescriptor, request, response);
            if (applicationDescriptor != null) {
                // ClientOutOfSync will drop down.
                try {
                    definitionService.updateLoaded(applicationDescriptor);
                } catch (QuickFixException qfe) {
                    //
                    // ignore quick fix. If we got a 'new' quickfix, it will be thrown as
                    // a client out of sync exception, since the UID will not match.
                    //
                }

                if (!context.isTestMode() && !context.isDevMode()) {
                    assertAccess(applicationDescriptor.getDef());
                }
            }

            Map<String, Object> attributes = null;
            if (isBootstrapAction) {
                attributes = Maps.newHashMap();
                attributes.put("token", configAdapter.getCSRFToken());
            }

            PrintWriter out = response.getWriter();
            written = true;
            out.write(CSRF_PROTECT);
            serverService.run(message, context, out, attributes);
        } catch (RequestParam.InvalidParamException ipe) {
            servletUtilAdapter.handleServletException(new SystemErrorException(ipe), false, context, request, response, false);
            return;
        } catch (RequestParam.MissingParamException mpe) {
        	servletUtilAdapter.handleServletException(new SystemErrorException(mpe), false, context, request, response, false);
            return;
        } catch (JsonParseException jpe) {
        	servletUtilAdapter.handleServletException(new SystemErrorException(jpe), false, context, request, response, false);
        } catch (Exception e) {
        	servletUtilAdapter.handleServletException(e, false, context, request, response, written);
        }
    }
    
    
    /* Private Helpers */
    
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
            final StringBuffer sb = request.getRequestURL();
            String httpProtocol = "http://";
            String defaultUriScheme = "http";
            String secureUriScheme = "https";
            int dIndex = sb.indexOf(httpProtocol);

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
        } catch (Exception e) {
            // This exception should never happen.
            // If happened: log a gack and redirect
            exceptionAdapter.handleException(e);
        }

        servletUtilAdapter.setNoCache(response);
        
        response.setHeader(HttpHeaders.LOCATION, newLocation);
    }
    
    private boolean shouldCacheHTMLTemplate(HttpServletRequest request) {
        AuraContext context = contextService.getCurrentContext();
        try {
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getLoadingApplicationDescriptor();
            if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
                Boolean isOnePageApp = ((ApplicationDef) appDefDesc.getDef()).isOnePageApp();
                if (isOnePageApp != null) {
                    return isOnePageApp.booleanValue();
                }
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
        return !manifestUtil.isManifestEnabled(request);
    }
    
    private void assertAccess(BaseComponentDef def) throws QuickFixException {
        String defaultNamespace = configAdapter.getDefaultNamespace();
        DefDescriptor<?> referencingDescriptor = (defaultNamespace != null && !defaultNamespace.isEmpty())
                ? definitionService.getDefDescriptor(String.format("%s:servletAccess", defaultNamespace),
                        ApplicationDef.class)
                : null;
        definitionService.getDefRegistry().assertAccess(referencingDescriptor, def);
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
    
    private <T extends BaseComponentDef> void internalGet(HttpServletRequest request,
            HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws ServletException, IOException {
        // Knowing the app, we can do the HTTP headers, so of which depend on
        // the app in play, so we couldn't do this earlier.
        servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
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
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
            return;
        }

        try {
            if (shouldCacheHTMLTemplate(request)) {
                /*
                 * Set a long cache timeout.
                 *
                 * This sets several headers to try to ensure that the page will be cached for a reasonable length of time. Of note
                 * is the last-modified header, which is set to a day ago so that browsers consider it to be safe.
                 */
                servletUtilAdapter.setLongCache(response);
            } else {
                servletUtilAdapter.setNoCache(response);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            // Prevents Mhtml Xss exploit:
            PrintWriter out = response.getWriter();
            out.write("\n    ");
            @SuppressWarnings("unchecked")
            Class<T> clazz = (Class<T>) def.getDescriptor().getDefType().getPrimaryInterface();
            String formatAdapter = formatAdapterParam.get(request);
            serializationService.write(def, getComponentAttributes(request), clazz, out, formatAdapter);
        } catch (Throwable e) {
            servletUtilAdapter.handleServletException(e, false, context, request, response, true);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
        }
    }
}
