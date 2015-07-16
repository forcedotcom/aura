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
package org.auraframework.impl.context;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.css.MutableTokenOptimizer;
import org.auraframework.css.StyleContext;
import org.auraframework.css.TokenOptimizer;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.token.StyleContextImpl;
import org.auraframework.impl.css.token.TokenOptimizerImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.SystemErrorException;
import org.auraframework.throwable.quickfix.InvalidEventTypeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.json.JsonSerializers.NoneSerializer;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraContextImpl implements AuraContext {
    private static final Logger logger = Logger.getLogger(AuraContextImpl.class);

    private static class DefSorter implements Comparator<Definition> {
        @Override
        public int compare(Definition arg0, Definition arg1) {
            return arg0.getDescriptor().compareTo(arg1.getDescriptor());
        }
    }

    private static final DefSorter DEFSORTER = new DefSorter();

    private static class Serializer extends NoneSerializer<AuraContext> {
        private Serializer() {
        }

        public static final String DELETED = "deleted";

        private void writeDefs(Json json, String name, List<Definition> writable) throws IOException {
            if (writable.size() > 0) {
                Collections.sort(writable, DEFSORTER);
                json.writeMapEntry(name, writable);
            }
        }

        @Override
        public void serialize(Json json, AuraContext ctx) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("mode", ctx.getMode());

            DefDescriptor<? extends BaseComponentDef> appDesc = ctx.getApplicationDescriptor();
            if (appDesc != null) {
                if (appDesc.getDefType().equals(DefType.APPLICATION)) {
                    json.writeMapEntry("app", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
                } else {
                    json.writeMapEntry("cmp", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
                }
            }

            String contextPath = ctx.getContextPath();
            if (!contextPath.isEmpty()) {
                // serialize servlet context path for html component to prepend for client created components
                json.writeMapEntry("contextPath", contextPath);
            }

            if (ctx.getRequestedLocales() != null) {
                List<String> locales = new ArrayList<>();
                for (Locale locale : ctx.getRequestedLocales()) {
                    locales.add(locale.toString());
                }
                json.writeMapEntry("requestedLocales", locales);
            }
            Map<String, String> loadedStrings = Maps.newHashMap();
            Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
            clientLoaded.putAll(ctx.getClientLoaded());
            for (Map.Entry<DefDescriptor<?>, String> entry : ctx.getLoaded().entrySet()) {
                loadedStrings.put(String.format("%s@%s", entry.getKey().getDefType().toString(),
                        entry.getKey().getQualifiedName()), entry.getValue());
                clientLoaded.remove(entry.getKey());
            }
            for (DefDescriptor<?> deleted : clientLoaded.keySet()) {
                loadedStrings.put(String.format("%s@%s", deleted.getDefType().toString(),
                        deleted.getQualifiedName()), DELETED);
            }
            if (loadedStrings.size() > 0) {
                json.writeMapKey("loaded");
                json.writeMap(loadedStrings);
            }

            TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
            if (testContextAdapter != null) {
                TestContext testContext = testContextAdapter.getTestContext();
                if (testContext != null) {
                    json.writeMapEntry("test", testContext.getName());
                }
            }

            if (ctx.getFrameworkUID() != null) {
                json.writeMapEntry("fwuid", ctx.getFrameworkUID());
            } else {
                json.writeMapEntry("fwuid", Aura.getConfigAdapter().getAuraFrameworkNonce());
            }

            //
            // Now comes the tricky part, we have to serialize all of the definitions that are
            // required on the client side, and, of all types. This way, we won't have to handle
            // ugly cases of actual definitions nested inside our configs, and, we ensure that
            // all dependencies actually get sent to the client. Note that the 'loaded' set needs
            // to be updated as well, but that needs to happen prior to this.
            //
            Map<DefDescriptor<? extends Definition>, Definition> defMap;

            defMap = ctx.getDefRegistry().filterRegistry(ctx.getPreloadedDefinitions());

            if (defMap.size() > 0) {
                List<Definition> componentDefs = Lists.newArrayList();
                List<Definition> eventDefs = Lists.newArrayList();
                List<Definition> libraryDefs = Lists.newArrayList();

                for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
                    DefDescriptor<? extends Definition> desc = entry.getKey();
                    DefType dt = desc.getDefType();
                    Definition d = entry.getValue();
                    //
                    // Ignore defs that ended up not being valid. This is arguably something
                    // that the MDR should have done when filtering.
                    //
                    if (d != null) {
                        try {
                            d.retrieveLabels();
                        } catch (QuickFixException qfe) {
                            // this should not throw a QFE
                        }
                        if (DefType.COMPONENT.equals(dt) || DefType.APPLICATION.equals(dt)) {
                            componentDefs.add(d);
                        } else if (DefType.EVENT.equals(dt)) {
                            eventDefs.add(d);
                        } else if (DefType.LIBRARY.equals(dt)) {
                            libraryDefs.add(d);
                        }
                    }
                }
                writeDefs(json, "componentDefs", componentDefs);
                writeDefs(json, "eventDefs", eventDefs);
                writeDefs(json, "libraryDefs", libraryDefs);
            }

            ctx.serializeAsPart(json);

            //
            // client needs value providers, urls don't
            // Note that we do this _post_ components, because they load labels.
            //
            boolean started = false;

            for (GlobalValueProvider valueProvider : ctx.getGlobalProviders().values()) {
                if (!valueProvider.isEmpty()) {
                    if (!started) {
                        json.writeMapKey("globalValueProviders");
                        json.writeArrayBegin();
                        started = true;
                    }
                    json.writeComma();
                    json.writeIndent();
                    json.writeMapBegin();
                    json.writeMapEntry("type", valueProvider.getValueProviderKey().getPrefix());
                    json.writeMapEntry("values", valueProvider.getData());
                    json.writeMapEnd();
                }
            }

            if (started) {
                json.writeArrayEnd();
            }
            json.writeMapEnd();
        }
    }

    // serializer with everything for the client
    public static final Serializer FULL_SERIALIZER = new Serializer();

    private final Set<DefDescriptor<?>> staleChecks = new HashSet<>();

    private final Mode mode;

    private final Authentication access;

    private final MasterDefRegistry masterRegistry;

    private final JsonSerializationContext jsonContext;

    private BaseComponent<?, ?> currentComponent;

    private Action currentAction;

    private final Map<DefType, String> defaultPrefixes;

    private String num;

    private final Set<String> dynamicNamespaces = Sets.newLinkedHashSet();

    private Set<DefDescriptor<?>> preloadedDefinitions = null;

    private final Format format;

    private final Map<String, GlobalValueProvider> globalProviders;

    private final Map<DefDescriptor<?>, String> loaded = Maps.newLinkedHashMap();
    private final Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();

    private String contextPath = "";

    private boolean preloading = false;

    private DefDescriptor<? extends BaseComponentDef> appDesc;

    private DefDescriptor<? extends BaseComponentDef> loadingAppDesc;

    private List<Locale> requestedLocales;

    private Client client = Client.OTHER;

    private final List<Event> clientEvents = Lists.newArrayList();

    private String fwUID;

    private final boolean isDebugToolEnabled;

    private InstanceStack fakeInstanceStack;

    private MutableTokenOptimizer tokens = new TokenOptimizerImpl();

    private StyleContext styleContext;

    private Deque<DefDescriptor<?>> callingDescriptorStack = Lists.newLinkedList();

    private static final int MAX_COMPONENT_COUNT = 10000;
    private int componentCount;

    private static final Map<String, GlobalValue> allowedGlobalValues;
    private Map<String, AuraContext.GlobalValue> globalValues;

    static {
        allowedGlobalValues = new HashMap<>();
    }

    public AuraContextImpl(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
            Format format, Authentication access, JsonSerializationContext jsonContext,
            Map<String, GlobalValueProvider> globalProviders, boolean isDebugToolEnabled) {
        this.mode = mode;
        this.masterRegistry = masterRegistry;
        this.defaultPrefixes = defaultPrefixes;
        this.format = format;
        this.access = access;
        this.jsonContext = jsonContext;
        this.globalProviders = globalProviders;
        this.isDebugToolEnabled = isDebugToolEnabled;
        globalValues = new HashMap<>();
    }

    @Override
    public boolean isPreloaded(DefDescriptor<?> descriptor) {
        if (preloading) {
            return false;
        }
        if (dynamicNamespaces.contains(descriptor.getNamespace())) {
            return true;
        }
        if (preloadedDefinitions != null) {
            return preloadedDefinitions.contains(descriptor);
        }
        return false;
    }

    @Override
    public Authentication getAccess() {
        return access;
    }

    @Override
    public DefDescriptor<? extends BaseComponentDef> getApplicationDescriptor() {
        return appDesc;
    }

    @Override
    public DefDescriptor<? extends BaseComponentDef> getLoadingApplicationDescriptor() {
        return (loadingAppDesc != null) ? loadingAppDesc : appDesc;
    }

    @Override
    public Client getClient() {
        return client;
    }

    @Override
    public String getContextPath() {
        return contextPath;
    }

    @Override
    public Action getCurrentAction() {
        return currentAction;
    }

    @Override
    public BaseComponent<?, ?> getCurrentComponent() {
        return currentComponent;
    }

    @Override
    public DefDescriptor<?> getCurrentCallingDescriptor() {
        return callingDescriptorStack.peekFirst();
    }

    @Override
    public String getCurrentNamespace() {
        DefDescriptor<?> caller = getCurrentCallingDescriptor();
        return caller != null ? caller.getNamespace() : null;
    }

    @Override
    public String getDefaultPrefix(DefType defType) {
        return defaultPrefixes.get(defType);
    }

    @Override
    public Map<DefType, String> getDefaultPrefixes() {
        return defaultPrefixes;
    }

    @Override
    public MasterDefRegistry getDefRegistry() {
        return masterRegistry;
    }

    @Override
    public Set<DefDescriptor<?>> getPreloadedDefinitions() {
        return preloadedDefinitions;
    }

    @Override
    public void setPreloadedDefinitions(Set<DefDescriptor<?>> preloadedDefinitions) {
        this.preloadedDefinitions = Collections.unmodifiableSet(preloadedDefinitions);
    }

    @Override
    public Format getFormat() {
        return format;
    }

    @Override
    public Map<String, GlobalValueProvider> getGlobalProviders() {
        return globalProviders;
    }

    @Override
    public JsonSerializationContext getJsonSerializationContext() {
        return jsonContext;
    }

    @Override
    public Mode getMode() {
        return mode;
    }

    @Override
    public String getNum() {
        return num;
    }

    @Override
    public List<Locale> getRequestedLocales() {
        return requestedLocales;
    }

    @Override
    public boolean hasChecked(DefDescriptor<?> d) {
        return staleChecks.contains(d);
    }

    @Override
    public boolean isPreloading() {
        return preloading;
    }

    @Override
    public boolean isTestMode() {
        return getMode().isTestMode();
    }

    @Override
    public boolean isDevMode() {
        return getMode().isDevMode();
    }

    @Override
    public void setLoadingApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> loadingAppDesc) {
        this.loadingAppDesc = loadingAppDesc;
    }

    @Override
    public void setApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> appDesc) {
        //
        // This logic is twisted, but not unreasonable. If someone is setting an application,
        // we use it, otherwise, if it is a Component, we only override components, leaving
        // applications intact. Since components are only legal for dev mode, this shouldn't
        // affect much. In fact, most use cases, this.appDesc will be null.
        //
        if ((appDesc != null && appDesc.getDefType().equals(DefType.APPLICATION)) || this.appDesc == null
                || !this.appDesc.getDefType().equals(DefType.APPLICATION)) {
            this.appDesc = appDesc;
        }
    }

    @Override
    public void setClient(Client client) {
        this.client = client;
    }

    @Override
    public void setContextPath(String path) {
        this.contextPath = path;
    }

    @Override
    public Action setCurrentAction(Action nextAction) {
        Action old = currentAction;
        currentAction = nextAction;
        return old;
    }

    @Override
    public BaseComponent<?, ?> setCurrentComponent(BaseComponent<?, ?> nextComponent) {
        BaseComponent<?, ?> old = currentComponent;
        currentComponent = nextComponent;
        return old;
    }

    @Override
    public void pushCallingDescriptor(DefDescriptor<?> descriptor) {
        callingDescriptorStack.push(descriptor);
    }

    @Override
    public void popCallingDescriptor() {
        if (callingDescriptorStack.size() > 0) {
            callingDescriptorStack.pop();
        } else {
            logger.warn("Trying to pop a calling descriptor from an empty stack");
        }
    }

    @Override
    public void setNum(String num) {
        this.num = num;
    }

    @Override
    public void setPreloading(boolean preloading) {
        this.preloading = preloading;
    }

    @Override
    public void addDynamicNamespace(String namespace) {
        this.dynamicNamespaces.add(namespace);
    }

    @Override
    public void setRequestedLocales(List<Locale> requestedLocales) {
        this.requestedLocales = requestedLocales;
    }

    @Override
    public void setStaleCheck(DefDescriptor<?> d) {
        staleChecks.add(d);
    }

    @Override
    public void addClientApplicationEvent(Event event) throws QuickFixException {
        if (event != null) {
            DefDescriptor<EventDef> desc = event.getDescriptor();
            EventDef def = Aura.getDefinitionService().getDefinition(desc);
            if (def == null || def.getEventType() != EventType.APPLICATION) {
                throw new InvalidEventTypeException(
                        String.format("%s is not an Application event. "
                                + "Only Application events are allowed to be fired from server.",
                                event.getDescriptor()), null);
            }
            clientEvents.add(event);
        }
    }

    @Override
    public List<Event> getClientEvents() {
        return clientEvents;
    }

    @Override
    public void setClientLoaded(Map<DefDescriptor<?>, String> clientLoaded) {
        loaded.putAll(clientLoaded);
        this.clientLoaded.putAll(clientLoaded);
    }

    @Override
    public void addLoaded(DefDescriptor<?> descriptor, String uid) {
        loaded.put(descriptor, uid);
    }

    @Override
    public void dropLoaded(DefDescriptor<?> descriptor) {
        loaded.remove(descriptor);
    }

    @Override
    public Map<DefDescriptor<?>, String> getClientLoaded() {
        return Collections.unmodifiableMap(clientLoaded);
    }

    @Override
    public Map<DefDescriptor<?>, String> getLoaded() {
        return Collections.unmodifiableMap(loaded);
    }

    @Override
    public String getUid(DefDescriptor<?> descriptor) {
        return loaded.get(descriptor);
    }

    @Override
    public void setFrameworkUID(String uid) {
        this.fwUID = uid;
    }

    @Override
    public String getFrameworkUID() {
        return fwUID;
    }

    @Override
    public boolean getIsDebugToolEnabled() {
        return isDebugToolEnabled;
    }

    @Override
    public int getNextId() {
        return getInstanceStack().getNextId();
    }

    @Override
    public InstanceStack getInstanceStack() {
        if (currentAction != null) {
            return currentAction.getInstanceStack();
        } else {
            if (fakeInstanceStack == null) {
                fakeInstanceStack = new InstanceStack();
            }
            return fakeInstanceStack;
        }
    }

    private static class SBKeyValueLogger implements KeyValueLogger {
        private StringBuffer sb;
        private String comma = "";

        public SBKeyValueLogger(StringBuffer sb) {
            this.sb = sb;
        }

        @Override
        public void log(String key, String value) {
            sb.append(comma);
            sb.append(key);
            sb.append("=");
            sb.append(value);
            comma = ",";
        }
    };

    @Override
    public void registerComponent(BaseComponent<?, ?> component) {
        InstanceStack iStack = getInstanceStack();
        if (iStack.isUnprivileged()) {
            if (componentCount++ > MAX_COMPONENT_COUNT) {
                //
                // This is bad, try to give the poor user an idea of what happened.
                //
                Action tmp = getCurrentAction();
                StringBuffer sb = new StringBuffer();
                if (tmp != null) {
                    sb.append(tmp);
                    sb.append("(");
                    tmp.logParams(new SBKeyValueLogger(sb));
                    sb.append(")");
                } else {
                    sb.append("request");
                }
                throw new SystemErrorException("Too many components for " + sb.toString());
            }
        }
        iStack.registerComponent(component);
    }

    @Override
    public void serializeAsPart(Json json) throws IOException {
        if (fakeInstanceStack != null) {
            fakeInstanceStack.serializeAsPart(json);
        }
    }

    @Override
    public void addAppTokensDescriptors() {
        DefDescriptor<? extends BaseComponentDef> desc = getLoadingApplicationDescriptor();
        if (desc != null && desc.getDefType() == DefType.APPLICATION) {
            @SuppressWarnings("unchecked")
            DefDescriptor<ApplicationDef> appDesc = (DefDescriptor<ApplicationDef>) desc;
            try {
                ApplicationDef app = Aura.getDefinitionService().getDefinition(appDesc);
                if (app != null) {
                    // the app tokens conceptually precedes tokens explicitly added to the context.
                    // this is important for the "last declared tokens def wins" contract
                    tokens.prependAll(app.getTokenDescriptors());
                }
            } catch (QuickFixException qfe) {
                // either the app or a dependency is invalid, nothing we can do about getting the tokens in that case.
            }
        }
    }

    @Override
    public void appendTokensDescriptor(DefDescriptor<TokensDef> descriptor) throws QuickFixException {
        tokens.append(descriptor);
    }

    @Override
    public TokenOptimizer getTokenOptimizer() {
        return tokens;
    }

    @Override
    public void setStyleContext(StyleContext styleContext) {
        this.styleContext = styleContext;
    }

    @Override
    public void setStyleContext(Map<String, Object> config) {
        this.styleContext = StyleContextImpl.build(config);
    }

    @Override
    public StyleContext getStyleContext() {
        if (styleContext == null) {
            // in most cases this should not be null by the time it is requested. If it is null then there could
            // potentially be a consistency problem with the requested vs. served css.
            styleContext = StyleContextImpl.build(this);
        }
        return styleContext;
    }

    @Override
    public List<String> createComponentStack() {
        InstanceStack istack = getInstanceStack();
        List<String> info = null;
        if (istack != null) {
            info = istack.getStackInfo();
            if (info.size() == 0) {
                info = null;
            }
        }
        return info;
    }

    @Override
    public ImmutableMap<String, AuraContext.GlobalValue> getGlobals() {
        Map<String, AuraContext.GlobalValue> result = new HashMap<>();
        for (String key : allowedGlobalValues.keySet()) {
            result.put(key, getGlobalValue(key)); // add registered defaults
        }
        return (ImmutableMap<String, GlobalValue>) AuraUtil.immutableMap(result);
    }

    public AuraContext.GlobalValue getGlobalValue(String approvedName) throws AuraRuntimeException {
        if (!validateGlobal(approvedName)) {
            throw new AuraRuntimeException("Attempt to retrieve unknown $Global variable: " + approvedName);
        }
        if (globalValues.containsKey(approvedName)) {
            return globalValues.get(approvedName);
        }
        return allowedGlobalValues.get(approvedName);
    }

    @Override
    public Object getGlobal(String approvedName) throws AuraRuntimeException {
        if (!validateGlobal(approvedName)) {
            throw new AuraRuntimeException("Attempt to retrieve unknown $Global variable: " + approvedName);
        }
        if (globalValues.containsKey(approvedName)) {
            return (globalValues.get(approvedName)).value;
        }
        return allowedGlobalValues.get(approvedName).defaultValue;
    }

    @Override
    public void setGlobal(String approvedName, Object value) {
        if (!validateGlobal(approvedName)) {
            throw new AuraRuntimeException("Attempt to set unknown $Global variable: " + approvedName);
        }

        if (globalValues.containsKey(approvedName)) {
            (globalValues.get(approvedName)).value = value;
        }
        else {
            // copy the registered record to globals, replacing value with supplied value
            GlobalValue temp = allowedGlobalValues.get(approvedName);

            // You could add "if (temp.defaultValue.equals(value)) return;"
            // if you wished to store values sparsely (not re-storing default even if explicitly set)
            // But you would lose the ability to test whether the value was explicitly set
            globalValues.put(approvedName, new GlobalValue(temp.writable, temp.defaultValue, value));
        }
    }

    @Override
    public boolean validateGlobal(String approvedName) {
        return (allowedGlobalValues.containsKey(approvedName));
    }

    static ImmutableMap<String, AuraContext.GlobalValue> getAllowedGlobals() {
        Map<String, AuraContext.GlobalValue> result = new HashMap<>();
        result.putAll(allowedGlobalValues); // add registered defaults
        return (ImmutableMap<String, GlobalValue>) AuraUtil.immutableMap(result);
    }

    static void registerGlobal(String approvedName, boolean publicallyWritable, Object defaultValue) {
        if (approvedName == null || !AuraTextUtil.isValidJsIdentifier(approvedName)) {
            throw new AuraRuntimeException(
                    String.format(
                            "Invalid name for $Global value: '%s'. The name must be valid for serialization as a key to the client.",
                            approvedName));
        }
        allowedGlobalValues.put(approvedName, new GlobalValue(publicallyWritable, defaultValue, null));
    }

    @Override
    public String serialize(EncodingStyle style) {
        StringBuffer sb = new StringBuffer();
        JsonEncoder json = new JsonEncoder(sb, false, false);

        try {
            json.writeMapBegin();
            json.writeMapEntry("mode", getMode());

            DefDescriptor<? extends BaseComponentDef> appDesc = getApplicationDescriptor();
            if (appDesc != null) {
                if (appDesc.getDefType().equals(DefType.APPLICATION)) {
                    json.writeMapEntry("app", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
                } else {
                    json.writeMapEntry("cmp", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
                }
            }
            // UIDs in everything except Bare.
            if (style != EncodingStyle.Bare) {
                if (getFrameworkUID() != null) {
                    json.writeMapEntry("fwuid", getFrameworkUID());
                } else {
                    json.writeMapEntry("fwuid", Aura.getConfigAdapter().getAuraFrameworkNonce());
                }

                Map<String, String> loadedStrings = Maps.newHashMap();
                for (Map.Entry<DefDescriptor<?>, String> entry : getLoaded().entrySet()) {
                    if (style == EncodingStyle.Full || entry.getKey().equals(appDesc)) {
                        loadedStrings.put(String.format("%s@%s", entry.getKey().getDefType().toString(),
                                entry.getKey().getQualifiedName()), entry.getValue());
                    }
                }
                if (loadedStrings.size() > 0) {
                    json.writeMapKey("loaded");
                    json.writeMap(loadedStrings);
                }
            }
            if (style == EncodingStyle.Css) {
                // TODONM remove this
                TokenOptimizer tokens = getTokenOptimizer();
                if (!tokens.isEmpty()) {
                    List<String> stringed = Lists.newArrayList();
                    for (DefDescriptor<TokensDef> desc : tokens) {
                        stringed.add(desc.getQualifiedName());
                    }
                    json.writeMapEntry("tokens", stringed);
                }

                // add a unique id for map-provided tokens, for client-side cache-busting
                Optional<String> tokensUid = tokens.getActiveDynamicTokensUid();
                if (tokensUid.isPresent()) {
                    json.writeMapEntry("tokensUid", tokensUid.get());
                }

                // add other contextual CSS information
                json.writeMapEntry("styleContext", getStyleContext());
            }

            // Normal and full get the locales, but not the css stuff
            if (style == EncodingStyle.Normal || style == EncodingStyle.Full) {
                if (getRequestedLocales() != null) {
                    List<String> locales = new ArrayList<>();
                    for (Locale locale : getRequestedLocales()) {
                        locales.add(locale.toString());
                    }
                    json.writeMapEntry("requestedLocales", locales);
                }
            }
            if (style == EncodingStyle.Full) {
                String contextPath = getContextPath();
                if (!contextPath.isEmpty()) {
                    // serialize servlet context path for html component to prepend for client created components
                    json.writeMapEntry("contextPath", contextPath);
                }
            }
            TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
            if (testContextAdapter != null) {
                TestContext testContext = testContextAdapter.getTestContext();
                if (testContext != null) {
                    json.writeMapEntry("test", testContext.getName());
                }
            }
            json.writeMapEnd();
        } catch (IOException ioe) {
            // This can't possibly happen.
            throw new RuntimeException(ioe);
        }
        return sb.toString();
    }

    @Override
    public String getEncodedURL(EncodingStyle style) {
        return AuraTextUtil.urlencode(serialize(style));
    }

    @Override
    public String getAccessVersion() throws QuickFixException {
        return this.currentAction == null ? null : this.currentAction.getCallerVersion();
    }
}
