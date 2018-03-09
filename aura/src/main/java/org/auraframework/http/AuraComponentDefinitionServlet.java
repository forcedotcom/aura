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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;
import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.output.StringBuilderWriter;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.service.ServerService.HYDRATION_TYPE;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class AuraComponentDefinitionServlet extends AuraBaseServlet {

    public final static String URI_DEFINITIONS_PATH = "/auraCmpDef";

    private final static StringParam componentUIDParam = new StringParam("_uid", 0, false);
    private final static StringParam defDescriptorParam = new StringParam("_def", 0, false);
    private final static StringParam appDescriptorParam = new StringParam("aura.app", 0, false);
    private final static StringParam hydrationParam = new StringParam("_hydration", 0, false);
    private final static List<Class> DESCRIPTOR_DEF_TYPES = Arrays.asList(ModuleDef.class, ComponentDef.class, EventDef.class, LibraryDef.class);
    
    private DefinitionService definitionService;
    private LoggingService loggingService;
    private ServerService serverService;
    private ContextService contextService;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String requestedUID = componentUIDParam.get(request);
        String appReferrrer = appDescriptorParam.get(request);
        String hydration = hydrationParam.get(request);

        List<String> requestedDescriptors = extractDescriptors(request);

        response.setContentType("text/javascript");

        StringBuilderWriter responseStringWriter = new StringBuilderWriter();
        
        try {
            if (requestedDescriptors.size() == 0) {
                throw new InvalidDefinitionException("Descriptor required", null);
            }

            Map<DefDescriptor<?>, String> descriptors = mapDescriptorsToDefDesriptorAndUid(requestedDescriptors);

            StringBuilder allUIDs = new StringBuilder();
            for (Entry defDesc : descriptors.entrySet()) {
                allUIDs.append(defDesc.getValue());
            }
            String computedUID = allUIDs.toString();

            DefDescriptor<ApplicationDef> appDescriptor = definitionService.getDefDescriptor(appReferrrer, ApplicationDef.class);

            // TODO remove hydration after performance anaylsis
            HYDRATION_TYPE hydrationType = null;
            if (StringUtils.isNotEmpty(hydration)) {
                try {
                    hydrationType = HYDRATION_TYPE.valueOf(hydration.toLowerCase());
                } catch (Exception e) {
                    // invalid hydration type, ignore
                }
            }

            int requestedHashCode = 0;
            if (descriptors.size() > 1) {
                try {
                    requestedHashCode = Integer.parseInt(requestedUID);
                } catch (NumberFormatException nfe) {
                    loggingService.warn("Requested uid should have been a hash of the UIDs", nfe);
                }
            }

            if ((descriptors.size() == 1 && !computedUID.equals(requestedUID)) ||
                (descriptors.size() > 1  && computedUID.hashCode() != requestedHashCode)) {
                if ("null".equals(requestedUID)) {
                    throw new InvalidDefinitionException("requestedComponentUID can't be 'null'", null);
                }
                response.sendRedirect(new StringBuilder().append(request.getScheme()).append("://").append(request.getHeader("Host"))
                        .append(generateRedirectURI(descriptors, hydrationType, computedUID, appReferrrer)).toString());
                return;
            }

            // TODO remove hydration after performance anaylsis
            if (hydrationType == null) {
                hydrationType = HYDRATION_TYPE.one;
            }

            serverService.writeDefinitions(descriptors.keySet(), responseStringWriter, false, 0, hydrationType, false);

            Set<DefDescriptor<?>> dependencies = new HashSet<>();
            descriptors.entrySet().stream().forEach((entry)->{
                dependencies.addAll(definitionService.getDependencies(entry.getValue()));
            });

            dependencies.removeAll(descriptors.keySet());

            String appUID;
            try {
                appUID = definitionService.getUid(null, appDescriptor);
            } catch (DefinitionNotFoundException dnfe) {
                // mainly tests directly access components as top level without an app.
                // if neither exist, let the error bubble up
                appUID = definitionService.getUid(null, definitionService.getDefDescriptor(appReferrrer, ComponentDef.class));
            }

            dependencies.removeAll(definitionService.getDependencies(appUID));

            if (hydrationType == HYDRATION_TYPE.one) {
                hydrationType = HYDRATION_TYPE.all;
            }
            serverService.writeDefinitions(dependencies, responseStringWriter, false, 0, hydrationType, false);

            servletUtilAdapter.setLongCache(response);
        } catch (Exception e) {
            PrintWriter out = response.getWriter();
            if (requestedUID!=null) {
                requestedUID = requestedUID.replaceAll("[^a-zA-Z0-9-]+","");
            }
            out.append("Aura.componentDefLoaderError['").append(requestedUID).append("'].push(/*");
            servletUtilAdapter.handleServletException(e, false, contextService.getCurrentContext(), request, response, true);
            out.append(");\n");
            servletUtilAdapter.setNoCache(response);
            response.setStatus(HttpStatus.SC_OK);
        } finally {
            response.getWriter().print(responseStringWriter.toString());
            responseStringWriter.close();
        }
    }

    private List<String> extractDescriptors(HttpServletRequest request) {
        String requestedComponentDescriptor = defDescriptorParam.get(request);

        if (StringUtils.isNotEmpty(requestedComponentDescriptor)) {
            return Arrays.asList(requestedComponentDescriptor);
        }

        List<String> requestedDescriptors = new ArrayList<>();
        for (Entry<String, String[]> param : request.getParameterMap().entrySet()) {
            if (param.getKey().startsWith("_") || appDescriptorParam.name.equals(param.getKey())) {
                continue;
            }
            for (String value : param.getValue()) {
                for (String name : value.split(",")) {
                    requestedDescriptors.add(String.format("markup://%s:%s", param.getKey(), name));
                }
            }
        }
        return requestedDescriptors;
    }

    @SuppressWarnings("unchecked")
    private Map<DefDescriptor<?>, String> mapDescriptorsToDefDesriptorAndUid(List<String> requestedDescriptors) {
        Map<DefDescriptor<?>, String> descriptors = new TreeMap<>(
                Comparator.comparing((DefDescriptor defDescriptor)->{return defDescriptor.getNamespace();})
                        .thenComparing((DefDescriptor defDescriptor)->{return defDescriptor.getName();}));


        for (String requestedDefDescriptor: requestedDescriptors) {
            boolean found = false;
            for (Class defType : DESCRIPTOR_DEF_TYPES) {
                try {
                    DefDescriptor defDescriptor = definitionService.getDefDescriptor(requestedDefDescriptor, defType);
                    String uid = definitionService.getUid(null, defDescriptor);
                    descriptors.put(defDescriptor, uid);
                    found = true;
                    break;
                } catch (Exception e) {
                }
            }
            if (!found) {
                throw new RuntimeException("Could not find def descriptor for: " + requestedDefDescriptor);
            }
        }

        return descriptors;
    }

    private String generateRedirectURI(Map<DefDescriptor<?>, String> descriptors, HYDRATION_TYPE hydrationType,
                                       String computedUID, String appReferrrer) {
        StringBuilder defsParameters = new StringBuilder();
        if (descriptors.size() == 1) {
            defsParameters.append("&").append(defDescriptorParam.name).append("=").append(descriptors.entrySet().iterator().next().getKey().getQualifiedName());
        } else {
            String previousNamespace = null;
            boolean firstName = true;
            for (DefDescriptor descriptor : descriptors.keySet()) {
                if (!descriptor.getNamespace().equals(previousNamespace)) {
                    previousNamespace = descriptor.getNamespace();
                    defsParameters.append("&").append(previousNamespace).append("=");
                    firstName = true;
                }
                if (firstName) {
                    firstName = false;
                } else {
                    defsParameters.append(",");
                }
                defsParameters.append(descriptor.getName());
            }
            computedUID = String.format("%d", computedUID.hashCode());
        }

        // TODO remove hydration after performance anaylsis
        if (hydrationType != null) {
            defsParameters.append("&").append(hydrationParam.name).append("=").append(hydrationType.toString());
        }

        return String.format("%s?%s=%s&%s=%s%s", URI_DEFINITIONS_PATH, componentUIDParam.name, computedUID, appDescriptorParam.name, appReferrrer, defsParameters.toString());
    }
    
    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
    
    @Inject
    public void setServerService(ServerService serverService) {
        this.serverService = serverService;
    }
    
    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }
}
