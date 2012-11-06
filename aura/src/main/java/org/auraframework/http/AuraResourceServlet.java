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
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.Client;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraResourceServlet extends AuraBaseServlet {

    private static final long serialVersionUID = -3642790050433142397L;
    public static final String ORIG_REQUEST_URI = "aura.origRequestURI";

    private static ServletContext servletContext;

    private final static StringParam errorParam = new StringParam(AURA_PREFIX + "error", 128, false);

    /**
     * An internal routine to populate a set from a set of namespaces.
     *
     * This will go away when W-1166679 is fixed.
     */
    private <P extends Definition, D extends P> void addDefinitions(String prefix, Class<D> preloadType,
                                                                    List<String> namespaces, String separator,
                                                                    Set<P> defs) throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        for (String ns : namespaces) {
            DefDescriptor<D> matcher = definitionService.getDefDescriptor(String.format("%s://%s%s*", prefix, ns,
                                                                                        separator), preloadType);
            Set<DefDescriptor<D>> descriptors = definitionService.find(matcher);

            for(DefDescriptor<D> descriptor : descriptors){
                P def = descriptor.getDef();
                if(def != null){
                    defs.add(def);
                }
            }
        }
    }

    /**
     * This will go away when the parent bug W-1166679 is fixed.
     */
    private <T extends Definition> void preloadSerialize(Collection<T> defs, Class<T> type,
                                                         Appendable out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        SerializationService serializationService = Aura.getSerializationService();

        context.setPreloading(true);
        try{
            serializationService.writeCollection(defs, type, out);
        } finally {
            context.setPreloading(false);
        }
    }

    /**
     * This will go away when the parent bug W-1166679 is fixed.
     */
    private <T extends Definition> void preloadSerialize(Collection<T> defs, Class<T> type, Appendable out,
                                                         String format) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        SerializationService serializationService = Aura.getSerializationService();

        context.setPreloading(true);
        try{
            serializationService.writeCollection(defs, type, out, format);
        } finally {
            context.setPreloading(false);
        }
    }

    /**
     * Write out the manifest.
     *
     * This writes out the full manifest for an application so that we can use the AppCache.
     *
     * FIXME: we should document what goes in the manifest and why.
     *
     * @param request the request
     * @param response the response
     * @throws IOException if unable to write out the response
     */
    private void writeManifest(HttpServletRequest request,
                               HttpServletResponse response) throws IOException {
        setNoCache(response);
        if (!isManifestEnabled(request)) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        if (errorParam.get(request) != null) {
            addManifestErrorCookie(response);
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        try {
            setPreloads();

            String originalPath = (String)request.getAttribute(AuraResourceServlet.ORIG_REQUEST_URI);
            if(originalPath != null){
                String currentManifestUrl = AuraServlet.getManifest();
                if (!originalPath.equals(currentManifestUrl)) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    deleteManifestCookie(response);
                    return;
                }
            }

            String serverLastMod = Long.toString(getManifestLastMod());
            Cookie cookie = getManifestCookie(request);
            if(cookie != null){
                if (MANIFEST_ERROR.equals(cookie.getValue())) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    deleteManifestCookie(response);
                    return;
                }
            }

            Map<String, Object> attribs = Maps.newHashMap();
            attribs.put("lastMod", serverLastMod);
            StringWriter sw = new StringWriter();
            for(String s:AuraServlet.getStyles()){
                sw.write(s);
                sw.write('\n');
            }
            for(String s:AuraServlet.getScripts()){
                sw.write(s);
                sw.write('\n');
            }
            attribs.put("resourceURLs", sw.toString());
            DefinitionService definitionService = Aura.getDefinitionService();
            InstanceService instanceService = Aura.getInstanceService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService.getDefDescriptor("ui:manifest", ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attribs);
            Aura.getRenderingService().render(tmpl, response.getWriter());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            // Can't throw exception here: to set manifest OBSOLETE
            // is there any way to log properly errors?
            // throw new AuraRuntimeException(e);
        }
    }

    /**
     * A cache for compressed CSS output.
     *
     * This is currently done by namespace, but it will eventually be by app after W-1166679
     */
    private static final Map<String,String> cssCache = new ConcurrentHashMap<String,String>();

    /**
     * write out CSS.
     *
     * This writes out CSS for the preloads + app to the response. Note that currently it only writes
     * out the preloads because of the missing capability to do the apps will get fixed by W-1166679
     *
     * @param request the request
     * @param response the response
     * @throws IOException if unable to write to the response
     * @throws QuickFixWxception if the definitions could not be compiled.
     */
    private void writeCss(HttpServletRequest request,
                          HttpServletResponse response) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        List<String> namespaces = Lists.newArrayList(context.getPreloads());
        DefinitionService definitionService = Aura.getDefinitionService();
        Client.Type type = Aura.getContextService().getCurrentContext().getClient().getType();
        Mode mode = context.getMode();
        StringBuffer sb = new StringBuffer();
        
        for (String ns : namespaces) {
            String key = type.name() + "$" + ns;
            
            String nsCss = !mode.isTestMode() ? cssCache.get(key) : null;
            if (nsCss == null) {
                DefDescriptor<ThemeDef> matcher = definitionService.getDefDescriptor(String.format("css://%s.*", ns),
                                                                                     ThemeDef.class);
                Set<DefDescriptor<ThemeDef>> descriptors = definitionService.find(matcher);
                List<ThemeDef> nddefs = new ArrayList<ThemeDef>();

                sb.setLength(0);
                for(DefDescriptor<ThemeDef> descriptor : descriptors){
                    //
                    // This could use the generic routine above except for this brain dead little
                    // gem.
                    //
                    if(!descriptor.getName().toLowerCase().endsWith("template")){
                        ThemeDef def = descriptor.getDef();
                        if(def != null){
                            nddefs.add(def);
                        }
                    }
                }
                
                context.setPreloading(true);
                Appendable tmp = mode.isTestMode() ? response.getWriter() : sb;
                preloadSerialize(nddefs, ThemeDef.class, tmp);
                if (!mode.isTestMode()) {
                    nsCss = sb.toString();
                    cssCache.put(key, nsCss);
                }
            }
            
            if (nsCss != null) {
            	response.getWriter().append(nsCss);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private static final Class<? extends BaseComponentDef>[] preloadTypes = new Class[]{ApplicationDef.class, ComponentDef.class};

    /**
     * Write out a set of components in JSON.
     *
     * FIXME: I have no idea of why this is here when JS does effectively the same thing with extra stuff.
     *
     * This writes out the entire set of components from the namespaces in JSON.
     */
    private void writeComponents(HttpServletRequest request,
                                 HttpServletResponse response) throws ServletException, IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        List<String> namespaces = Lists.newArrayList(context.getPreloads());
        Set<BaseComponentDef> defs = Sets.newLinkedHashSet();

        for(Class<? extends BaseComponentDef> preloadType : preloadTypes) {
            addDefinitions("markup", preloadType, namespaces, ":", defs);
        }

        context.setPreloading(true);
        preloadSerialize(defs, BaseComponentDef.class, response.getWriter());
    }


    private static final Map<String,String> definitionCache = new ConcurrentHashMap<String,String>();

    /**
     * write out the complete set of definitions in JS.
     *
     * This generates a complete set of definitions for an app in JS+JSON.
     *
     */
    private String writeDefinitions(HttpServletRequest request,
                                    HttpServletResponse response) throws ServletException, IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        List<String> namespaces = Lists.newArrayList(context.getPreloads());
        Mode mode = context.getMode();
        //
        // create a temp buffer in case anything bad happens while we're processing this.
        // don't want to end up with a half a JS init function
        // TODO: get rid of this buffering by adding functionality to Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an exception happens in the
        // middle of serialization.
        //
        String ret = null;
        String key = null;

        if(!mode.isTestMode()){
            StringBuilder keyBuilder = new StringBuilder();

            for(String ns : namespaces){
                keyBuilder.append(ns);
                keyBuilder.append(",");
            }
            key = keyBuilder.toString();

            ret = definitionCache.get(key);
            if (ret != null) {
                return ret;
            }
        }
        StringBuilder sb = new StringBuilder();

        sb.append("$A.clientService.initDefs({");

        // append component definitions
        Set<BaseComponentDef> defs = Sets.newLinkedHashSet();
        addDefinitions("markup", ComponentDef.class, namespaces, ":", defs);
        addDefinitions("markup", ApplicationDef.class, namespaces, ":", defs);
        sb.append("componentDefs:");
        context.setPreloading(true);
        preloadSerialize(defs, BaseComponentDef.class, sb, "JSON");
        sb.append(",");

        // append event definitions
        sb.append("eventDefs:");
        Set<EventDef> events = Sets.newLinkedHashSet();
        addDefinitions("markup", EventDef.class, namespaces, ":", events);
        context.setPreloading(true);
        preloadSerialize(events, EventDef.class, sb, "JSON");

        sb.append(",");

        //
        // append controller definitions
        // Dunno how this got to be this way. The code in the Format adaptor was twisted and stupid,
        // as it walked the namespaces looking up the same descriptor, with a string.format that had
        // the namespace but did not use it. This ends up just getting a single controller.
        //
        Set<ControllerDef> controllers = Sets.newLinkedHashSet();
        List<String> fakenamespaces = Arrays.asList(new String [] {"*"});
        addDefinitions("aura", ControllerDef.class, fakenamespaces, ".", controllers);
        sb.append("controllerDefs:");
        preloadSerialize(controllers, ControllerDef.class, sb, "JSON");

        sb.append("});");

        ret = sb.toString();
        if(!mode.isTestMode()){
            StringWriter sw = new StringWriter();
            List<JavascriptProcessingError> errors = JavascriptWriter.CompressionLevel
                                                                     .CLOSURE_SIMPLE.compress(new StringReader(ret),
                                                                                              sw, key);
            if(errors == null || errors.isEmpty()){
                //For now, just use the non-compressed version if we can't get the compression to work.
                ret = sw.toString();
            }
            //
            // Note that we just use put (last one wins), as we don't really care what happens
            // when there is a race. Just that one of them gets in.
            definitionCache.put(key, ret);
        }
        return ret;
    }

    /**
     * Serves up CSS or JS resources for a list of namespaces.
     *
     * URLs follow the format:
     *
     * <pre>/auraResource?aura.namespaces=&lt;namespace1&gt;/&lt;namespace2&gt;/&lt;namespace3&gt;/...&aura.format=&lt;format&gt;</pre>
     *
     * Access to this servlet may also follow a shortened URL form specified in aura.conf.
     *
     * <p>Examples:
     *  - <pre>/l/123123123/aura/os/mobile.css</pre> (The number is the last mod timestamp)
     *  - <pre>/l/213423423/aura/os.js</pre>
     *  - <pre>/l/aura/os/mobile.css</pre>
     *  - <pre>/l/aura/os.js</pre>
     * </p>
     *
     * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        String ret = null;
        long now = System.currentTimeMillis();
        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        if(ifModifiedSince != -1 && ifModifiedSince + 1000 > now) {
            response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
            return;
        }

        setLongCache(response);
        AuraContext.Format format = context.getFormat();
        response.setContentType(getContentType(format));
        switch(format){
            case MANIFEST:
                writeManifest(request, response);
                break;
            case CSS:
                try {
                    writeCss(request, response);
                } catch (Throwable t) {
                    handleServletException(t, false, context, request, response, true);
                }
                break;
            case JS:
                try {
                    ret = writeDefinitions(request, response);
                    response.getWriter().println(ret);
                } catch (Throwable t) {
                    handleServletException(t, false, context, request, response, ret != null);
                }
                break;
            case JSON:
                try {
                    Aura.getConfigAdapter().validateCSRFToken(csrfToken.get(request));
                    writeComponents(request, response);
                } catch (Throwable t) {
                    handleServletException(t, false, context, request, response, true);
                }
                break;
            default:
                break;
        }
    }

    protected boolean checkAccess(DefDescriptor<?> desc){
        return true;
    }

    private void setPreloads() throws QuickFixException{
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        DefDescriptor<? extends BaseComponentDef> cmpDefDesc = context.getApplicationDescriptor();
        if(cmpDefDesc != null && cmpDefDesc.getDefType().equals(DefType.APPLICATION)){
            @SuppressWarnings("unchecked")
            DefDescriptor<ApplicationDef> appDefDesc = (DefDescriptor<ApplicationDef>)cmpDefDesc;
            ApplicationDef appDef = appDefDesc.getDef();
            for(String preload : appDef.getPreloads()){
                if(!preloads.contains(preload)){
                    context.addPreload(preload);
                }
            }
        }
    }

    public static boolean isResourceLocallyAvailable(String resourceURI){
        if(resourceURI != null && resourceURI.startsWith("/") && servletContext != null){
            try {
                URI uri = URI.create(resourceURI);
                if(uri != null){
                    ServletContext c = servletContext.getContext(uri.getPath());
                    if(c != null && c.getResource(uri.getPath()) != null){
                        return true;
                    }
                }
            }
            catch(Exception e){}
        }
        return false;
    }


    @Override
    public void init(ServletConfig config){
        servletContext = config.getServletContext();
    }
}
