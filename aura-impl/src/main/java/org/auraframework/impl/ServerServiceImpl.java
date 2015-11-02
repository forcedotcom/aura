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
package org.auraframework.impl;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;

import org.auraframework.Aura;
import org.auraframework.css.StyleContext;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.SVGDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.root.component.ClientComponentClass;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.service.LoggingService;
import org.auraframework.service.MetricsService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.collect.Sets;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class ServerServiceImpl implements ServerService {

    private static final long serialVersionUID = -2779745160285710414L;

    @Override
    public void run(Message message, AuraContext context, Writer out, Map<?,?> extras) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_AURA_RUN);

        MetricsService metricsService = Aura.getMetricsService();
        if (message == null) {
            return;
        }
        List<Action> actions = message.getActions();
        JsonEncoder json = JsonEncoder.createJsonStream(out, context.getJsonSerializationContext());
        try {
            json.writeMapBegin();
            if (extras != null && extras.size() > 0) {
                for (Map.Entry<?,?> entry : extras.entrySet()) {
                    json.writeMapEntry(entry.getKey(), entry.getValue());
                }
            }
            json.writeMapKey("actions");
            json.writeArrayBegin();
            run(actions, json, 0);
            json.writeArrayEnd();

            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeMapEntry("context", context);
                List<Event> clientEvents = Aura.getContextService().getCurrentContext().getClientEvents();
                if (clientEvents != null && !clientEvents.isEmpty()) {
                    json.writeMapEntry("events", clientEvents);
                }
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }

            loggingService.stopTimer(LoggingService.TIMER_AURA_RUN);

            // MetricsService for Non PROD environments
            if (context.getMode() != Mode.PROD) {
                try {
                    metricsService.serializeMetrics(json);
                    metricsService.clearMetrics();
                } catch (Exception e) {
                    loggingService.error("Error parsing MetricsService", e);
                }
            }

            json.writeMapEnd();
        } finally {
            try {
                json.close();
            } catch (Throwable ignored) {
                loggingService.error("Error closing json", ignored);
            }
        }
    }

    private int run(List<Action> actions, JsonEncoder json, int idx) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            String aap = String.valueOf(++idx)+"$"+actionAndParams.toString();
            loggingService.startAction(aap);
            Action oldAction = context.setCurrentAction(action);
            try {
                //
                // We clear out action centric references here.
                //
                json.clearReferences();
                // DCHASMAN TODO Look into a common base for Action
                // implementations that we can move the call to
                // context.setCurrentAction() into!
                action.run();
            } catch (AuraExecutionException x) {
                Aura.getExceptionAdapter().handleException(x, action);
            } finally {
                context.setCurrentAction(oldAction);
                loggingService.stopAction(aap);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeArrayEntry(action);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }

            List<Action> additionalActions = action.getActions();

            // Recursively process any additional actions created by the
            // action
            if (additionalActions != null && !additionalActions.isEmpty()) {
                idx = run(additionalActions, json, idx);
            }
        }
        return idx;
    }

    @Override
    public void writeAppCss(final Set<DefDescriptor<?>> dependencies, Writer out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Mode mode = context.getMode();

        StyleContext styleContext = context.getStyleContext();

        // build cache key
        final StringBuilder keyBuilder = new StringBuilder(64);
        keyBuilder.append("CSS:");

        // browser type
        keyBuilder.append(styleContext.getClientType());

        // other "true" conditions from style adapter (e.g., isDesktop)
        String trueConditionsKey = Joiner.on("-").skipNulls().join(styleContext.getExtraTrueConditionsOnly());
        if (!trueConditionsKey.isEmpty()) {
            keyBuilder.append(":");
            keyBuilder.append(trueConditionsKey);
        }

        // tokens uid. The app tokens are in the app dependencies and thus part of appuid, however we need
        // a distinct uid because one of the descriptors may be provided. this can be further optimized by only adding
        // a uid for provided descriptors only though.
        Optional<String> tokensUid = styleContext.getTokens().getDescriptorsUid();
        if (tokensUid.isPresent()) {
            keyBuilder.append(":").append(tokensUid.get());
        }

        // TODONM: If a tokens def uses a map-provider it will affect the css key too. Current idea is to cache a
        // "pre-evaluated" version of the CSS (but still ordered and concatenated). Another idea is to defer cache to
        // fileforce, etc... once a map-provider is involved. right now we skip the cache, so until this is address
        // map-providers shouldn't be used.

        keyBuilder.append("$");

        // minified or not
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        keyBuilder.append(minify ? "MIN:" : "DEV:");

        // app uid
        DefDescriptor<?> appDesc = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(appDesc);
        keyBuilder.append(uid);

        final String key = keyBuilder.toString();
        context.setPreloading(true);

        String cached = null;
        final boolean skipCache = styleContext.getTokens().hasDynamicTokens(); // TODONM undo this cache skipping
        if (skipCache) {
        	cached = getAppCssString(dependencies);
        } else {
        	cached = context.getDefRegistry().getCachedString(uid, appDesc, key,
            	new Callable<String>() {
	        		@Override
					public String call() throws Exception {
	        			return getAppCssString(dependencies);
	        		}
        		}
			);
        }

        if (out != null) {
            out.append(cached);
        }
    }

    private String getAppCssString(Set<DefDescriptor<?>> dependencies) throws QuickFixException, IOException {
        Collection<BaseStyleDef> orderedStyleDefs = filterAndLoad(BaseStyleDef.class, dependencies, null);
        StringBuffer sb = new StringBuffer();
        Aura.getSerializationService().writeCollection(orderedStyleDefs, BaseStyleDef.class, sb, "CSS");
    	return sb.toString();
    }

    @Override
    public void writeAppSvg(DefDescriptor<SVGDef> svg, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        // build cache key
        final StringBuilder keyBuilder = new StringBuilder(64);
        keyBuilder.append("SVG:");

        // browser type
        keyBuilder.append(context.getClient().getType());

        keyBuilder.append("$");

        DefDescriptor<? extends BaseComponentDef> appDesc = context.getLoadingApplicationDescriptor();

        // verify the app has access to the svg
        final SVGDef svgDef = svg.getDef();
        context.getDefRegistry().assertAccess(appDesc, svgDef);

        // svg uid
        final String uid = context.getDefRegistry().getUid(null, svg);
        keyBuilder.append(uid);

        final String key = keyBuilder.toString();
        context.setPreloading(true);

        String cached = context.getDefRegistry().getCachedString(uid, appDesc, key,
        	new Callable<String>() {
        		@Override
				public String call() throws Exception {
        			return getAppSvgString(svgDef);
        		}
        	}
		);

        out.append(cached);
    }

    private String getAppSvgString(SVGDef svgDef) throws QuickFixException, IOException {
        StringBuffer sb = new StringBuffer();
        Aura.getSerializationService().write(svgDef, null, SVGDef.class, sb, Format.SVG.name());
        return sb.toString();
    }
    
    @Override
    public void writeDefinitions(final Set<DefDescriptor<?>> dependencies, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Mode mode = context.getMode();
        final boolean minify = !mode.prettyPrint();
        final String mKey = minify ? "MIN:" : "DEV:";

        context.setPreloading(true);
        DefDescriptor<?> appDesc = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(appDesc);
        final String key = "JS:" + mKey + uid;

        String cached = context.getDefRegistry().getCachedString(uid, appDesc, key, 
        		new Callable<String>() {
		    		@Override
					public String call() throws Exception {
		    			String res = getDefinitionsString(dependencies, key, minify);
		    			//log the cache miss here
		    			Aura.getCachingService().logStringsCacheStats("cache miss for key: "+key+";");
		    			return res;
		    		}
		    	});

        if (out != null) {
            out.append(cached);
        }
    }

    private String getDefinitionsString (Set<DefDescriptor<?>> dependencies, String key, boolean minify)
    		throws QuickFixException, IOException {

    	Collection<BaseComponentDef> defs = filterAndLoad(BaseComponentDef.class, dependencies, null);
    	
        //
        // create a temp buffer in case anything bad happens while we're processing this.
        // don't want to end up with a half a JS init function
        //
        // TODO: get rid of this buffering by adding functionality to Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an exception happens in the
        // middle of serialization.
        //

        StringBuilder sb = new StringBuilder();

        // Now write the component shape specific classes
        BaseComponentDef componentComponentDef = Aura.getDefinitionService().getDefinition("aura:component", ComponentDef.class);

        final ClientComponentClass auraComponentCientClass = new ClientComponentClass(componentComponentDef);
        auraComponentCientClass.writeComponentClass(sb);

        //String classOutput;
        ClientComponentClass clientComponentClass;
        AuraContext context = Aura.getContextService().getCurrentContext();
        MasterDefRegistry masterDefRegistry = context.getDefRegistry();
        for (BaseComponentDef def : defs) {
            if (def != componentComponentDef) {
                clientComponentClass = new ClientComponentClass(def);
                clientComponentClass.writeComponentClass(sb);

                // We've generated this class component, do not output it as part of the component def.
                masterDefRegistry.setComponentClassLoaded(def.getDescriptor(), true);
            }
        }

        sb.append("$A.clientService.initDefs({");

        // append component definitions
        sb.append("componentDefs:");
        Aura.getSerializationService().writeCollection(defs, BaseComponentDef.class, sb, "JSON");
        sb.append(",");

        // append namespaces. for now. *sigh*
        sb.append("namespaces:");
        JsonEncoder.serialize(Aura.getConfigAdapter().getPrivilegedNamespaces(), sb, context.getJsonSerializationContext());
        sb.append(",");

        // append event definitions
        sb.append("eventDefs:");
        Collection<EventDef> events = filterAndLoad(EventDef.class, dependencies, null);
        Aura.getSerializationService().writeCollection(events, EventDef.class, sb, "JSON");
        sb.append(",");

        // append library definitions
        sb.append("libraryDefs:");
        Collection<LibraryDef> libraries = filterAndLoad(LibraryDef.class, dependencies, null);
        Aura.getSerializationService().writeCollection(libraries, LibraryDef.class, sb, "JSON");
        sb.append(",");

        //
        // append controller definitions
        // Dunno how this got to be this way. The code in the Format adaptor was twisted and stupid,
        // as it walked the namespaces looking up the same descriptor, with a string.format that had
        // the namespace but did not use it. This ends up just getting a single controller.
        //
        sb.append("controllerDefs:");
        Collection<ControllerDef> controllers = filterAndLoad(ControllerDef.class, dependencies, ACF);
        Aura.getSerializationService().writeCollection(controllers, ControllerDef.class, sb, "JSON");

        sb.append("});\n\n");

        String output = sb.toString();

        // only use closure compiler in prod mode, due to compile cost
        if (minify) {
            StringWriter sw = new StringWriter();
            List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_SIMPLE.compress(output, sw, key);
            if (errors == null || errors.isEmpty()) {
                // For now, just use the non-compressed version if we can't get
                // the compression to work.
            	output = sw.toString();
            } else {
                // if unable to compress, add error comments to the end.
                // ONLY if not production instance
                if (!Aura.getConfigAdapter().isProduction()) {
                    sb.append(commentedJavascriptErrors(errors));
                }
            }
        }
        return output;
    }

    @Override
    public void writeComponents(Set<DefDescriptor<?>> dependencies, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        context.setPreloading(true);
        Aura.getSerializationService().writeCollection(filterAndLoad(BaseComponentDef.class, dependencies, null),
                BaseComponentDef.class, out);
    }

    /**
     * Provide a better way of distinguishing templates from styles..
     *
     * This is used to apply the style definition filter for 'templates', but is getting rather further embedded in
     * code.
     *
     * TODO: W-1486762
     */
    private static interface TempFilter {
        public boolean apply(DefDescriptor<?> descriptor);
    }

    private static class AuraControllerFilter implements TempFilter {
        @Override
        public boolean apply(DefDescriptor<?> descriptor) {
            return descriptor.getPrefix().equalsIgnoreCase("aura") && descriptor.getDefType() == DefType.CONTROLLER;
        }
    }

    private static final AuraControllerFilter ACF = new AuraControllerFilter();

    private <P extends Definition, D extends P> Set<D> filterAndLoad(Class<D> defType,
            Set<DefDescriptor<?>> dependencies, TempFilter extraFilter) {

        Set<D> out = Sets.newLinkedHashSet();
        MasterDefRegistry mdr = Aura.getContextService().getCurrentContext().getDefRegistry();

        try {
            if(dependencies != null) {
            	for (DefDescriptor<?> descriptor : dependencies) {
	                if (defType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
	                        && (extraFilter == null || extraFilter.apply(descriptor))) {
	                    @SuppressWarnings("unchecked")
	                    DefDescriptor<D> dd = (DefDescriptor<D>) descriptor;
	                    out.add(mdr.getDef(dd));
	                }
            	}
            }
            	
        } catch (QuickFixException qfe) {
            // This should never happen here, by the time we are filtering our set, all dependencies
            // MUST be loaded. If not, we have a serious bug that must be addressed.
            throw new IllegalStateException("Illegal state, QFE during write", qfe);
        }
        return out;
    }

    /**
     * Loops through list of javascript errors and return commented text to display
     *
     * @param errors list of javascript syntax errors
     * @return commented errors
     */
    private StringBuilder commentedJavascriptErrors(List<JavascriptProcessingError> errors) {
        StringBuilder errorMsgs = new StringBuilder();
        if (errors != null && !errors.isEmpty()) {
            errorMsgs
            .append("/**")
            .append(System.lineSeparator())
            .append("There are errors preventing this file from being minimized! ")
            .append("Start from the first error as they cascade and produce additional errors.")
            .append(System.lineSeparator());
            for (JavascriptProcessingError err : errors) {
                errorMsgs.append(err);
            }
            errorMsgs.append("**/");
        }
        return errorMsgs;
    }

}
