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

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

import java.io.IOException;
import java.util.*;

import org.apache.log4j.Logger;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.css.StyleContext;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.impl.ServerServiceImpl;
import org.auraframework.impl.cache.CacheImpl;
import org.auraframework.impl.css.token.StyleContextImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.RegistrySet;
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

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraContextImpl implements AuraContext {
    // JBUCH: TEMPORARY FLAG FOR 202 CRUC. REMOVE IN 204.
    protected boolean enableAccessChecks = true;

    private static final Logger logger = Logger.getLogger(AuraContextImpl.class);

    private final Set<DefDescriptor<?>> staleChecks = new HashSet<>();

    private final Mode mode;

    private final Authentication access;

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

    private String pathPrefix = "";

    private boolean preloading = false;

    private DefDescriptor<? extends BaseComponentDef> appDesc;

    private DefDescriptor<? extends BaseComponentDef> loadingAppDesc;

    private List<Locale> requestedLocales;

    private Client client = Client.OTHER;

    private final List<Event> clientEvents = Lists.newArrayList();

    private String fwUID;

    private InstanceStack fakeInstanceStack;

    private StyleContext styleContext;

    private Deque<DefDescriptor<?>> callingDescriptorStack = Lists.newLinkedList();

    private static final int MAX_COMPONENT_COUNT = 10000;
    private int componentCount;

    private static final Map<String, GlobalValue> allowedGlobalValues = new HashMap<>();
    private Map<String, AuraContext.GlobalValue> globalValues;

    private final DefinitionService definitionService;
    private final ConfigAdapter configAdapter;
    private final TestContextAdapter testContextAdapter;

    private boolean isSystem = false;

    private boolean isModulesEnabled = false;
    private boolean useCompatSource = false;
    private List<String> scriptHashes = new ArrayList<>();
    private String nonce;

    /**
     * The set of defs that are thread local.
     *
     * We have two copies of this class, one for 'user' mode, and one for 'system' mode. The only difference
     * is that system mode defs are not sent to the client.
     */
    private static class LocalDefs {
        LocalDefs() {
            this.defs = new HashMap<>();
            this.dynamicDescs = new HashSet<>();
            this.localDependencies = new HashMap<>();
            this.defNotCacheable = new HashSet<>();
        }

        final Map<DefDescriptor<? extends Definition>, Optional<Definition>> defs;
        final Set<DefDescriptor<? extends Definition>> dynamicDescs;
        final Set<DefDescriptor<? extends Definition>> defNotCacheable;

        /**
         * A local dependencies cache.
         *
         * We store both by descriptor and by uid. The descriptor keys must include the type, as the qualified name
         * is not sufficient to distinguish it. In the case of the UID, we presume that we are safe.
         *
         * The two keys stored in the local cache are:
         * <ul>
         * <li>The UID, which should be sufficiently unique for a single request.</li>
         * <li>The type+qualified name of the descriptor. We store this to avoid construction in the case where we don't
         * have a UID. This is presumed safe because we assume that a single session will have a consistent set of
         * permissions</li>
         * </ul>
         */
        private final Map<String, DependencyEntry> localDependencies;
    }

    private final LocalDefs userDefs;
    private final LocalDefs systemDefs;
    private LocalDefs currentDefs;

    private final Map<String, Boolean> clientClassesLoaded;

    private final Cache<String, String> accessCheckCache;

    private final RegistrySet registries;

    private final static int ACCESS_CHECK_CACHE_SIZE = 4096;


    public AuraContextImpl(Mode mode, RegistrySet registries, Map<DefType, String> defaultPrefixes,
            Format format, Authentication access, JsonSerializationContext jsonContext,
            Map<String, GlobalValueProvider> globalProviders,
            ConfigAdapter configAdapter, DefinitionService definitionService,
            TestContextAdapter testContextAdapter) {
        this.mode = mode;
        this.registries = registries;
        this.defaultPrefixes = defaultPrefixes;
        this.format = format;
        this.access = access;
        this.jsonContext = jsonContext;
        this.globalProviders = globalProviders;
        this.configAdapter = configAdapter;
        this.definitionService = definitionService;
        this.testContextAdapter = testContextAdapter;
        this.globalValues = new HashMap<>();
        this.userDefs = new LocalDefs();
        this.systemDefs = new LocalDefs();
        this.currentDefs = userDefs;
        this.clientClassesLoaded = new HashMap<>();
        // Why is this a cache and not just a map?
        this.accessCheckCache = new CacheImpl.Builder<String, String>()
                .setInitialSize(ACCESS_CHECK_CACHE_SIZE)
                .setMaximumSize(ACCESS_CHECK_CACHE_SIZE)
                .setRecordStats(true)
                .setSoftValues(true)
                .build();
    }

    @Override
    public void setSystemMode(boolean systemMode) {
        isSystem = systemMode;
        if (isSystem) {
            this.currentDefs = systemDefs;
        } else {
            this.currentDefs = userDefs;
        }
    }

    @Override
    public boolean isSystemMode() {
    	return this.isSystem;
    }

    @Override
    public void setLocalDefNotCacheable(DefDescriptor<?> descriptor) {
        currentDefs.defNotCacheable.add(descriptor);
    }

    @Override
    public boolean isLocalDefNotCacheable(DefDescriptor<?> descriptor) {
        return userDefs.defNotCacheable.contains(descriptor)
            || (isSystem && systemDefs.defNotCacheable.contains(descriptor));
    }

    @Override
    public void addLocalDef(DefDescriptor<?> descriptor, Definition def) {
        Optional<Definition> opt;
        if (def == null) {
            opt = Optional.absent();
        } else {
            opt = Optional.of(def);
        }
        currentDefs.defs.putIfAbsent(descriptor, opt);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> Optional<D> getLocalDef(DefDescriptor<D> descriptor) {
        Optional<D> opt = (Optional<D>)userDefs.defs.get(descriptor);
        if (opt == null && isSystem) {
            opt = (Optional<D>)systemDefs.defs.get(descriptor);
        }
        return opt;
    }

    /**
     * Filter the entire set of current definitions by a set of preloads.
     *
     * This filtering is very simple, it just looks for local definitions that are not included in the preload set.
     */
    @Override
    public Map<DefDescriptor<? extends Definition>, Definition> filterLocalDefs(Set<DefDescriptor<?>> preloads) {
        Map<DefDescriptor<? extends Definition>, Definition> filtered;

        filtered = Maps.newHashMapWithExpectedSize(userDefs.defs.size());
        if (preloads == null) {
            preloads = Sets.newHashSet();
        }
        for (Map.Entry<DefDescriptor<? extends Definition>, Optional<Definition>> entry : userDefs.defs.entrySet()) {
            if (entry.getValue().isPresent() && !preloads.contains(entry.getKey())) {
                filtered.put(entry.getKey(), entry.getValue().get());
            }
        }
        return filtered;
    }

    @Override
    public <D extends Definition> void addDynamicDef(D def) {
        DefDescriptor<? extends Definition> desc = def.getDescriptor();

        if (desc == null) {
            throw new AuraRuntimeException("Invalid def has no descriptor");
        }
        currentDefs.defs.put(desc, Optional.of(def));
        currentDefs.defNotCacheable.add(desc);
        currentDefs.dynamicDescs.add(desc);
    }

    @Override
    public void addDynamicMatches(Set<DefDescriptor<?>> matched, DescriptorFilter matcher) {
        for (DefDescriptor<? extends Definition> desc : userDefs.dynamicDescs) {
            if (matcher.matchDescriptor(desc)) {
                matched.add(desc);
            }
        }
        if (isSystem) {
            for (DefDescriptor<? extends Definition> desc : systemDefs.dynamicDescs) {
                if (matcher.matchDescriptor(desc)) {
                    matched.add(desc);
                }
            }
        }
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
    public String getPathPrefix() {
        return pathPrefix;
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
    public void addScriptHash(String hash) {
        scriptHashes.add(hash);
    }

    @Override
    public ImmutableList<String> getScriptHashes() {
        return ImmutableList.copyOf(scriptHashes);
    }

    @Override
    public String getScriptNonce() {
        return nonce;
    }

    @Override
    public void setScriptNonce(String nonce){
        this.nonce = nonce;
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
            EventDef def = definitionService.getDefinition(desc);
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
        if (iStack.isExternal()) {
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
    public void setStyleContext() {
        setStyleContext(StyleContextImpl.build(definitionService, this));
    }

    @Override
    public void setStyleContext(StyleContext styleContext) {
        // it's important that this is only set once, so that get returns a consistent value
        checkState(this.styleContext == null, "StyleContext should only be set once per request");
        this.styleContext = checkNotNull(styleContext, "styleContext cannot be null");
    }

    @Override
    public void setStyleContext(Map<String, Object> config) {
        // it's important that this is only set once, so that get returns a consistent value
        checkState(this.styleContext == null, "StyleContext should only be set once per request");
        this.styleContext = StyleContextImpl.build(definitionService, config);
    }

    @Override
    public StyleContext getStyleContext() {
        if (styleContext == null) {
            setStyleContext();
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
            return globalValues.get(approvedName).getValue();
        }
        return allowedGlobalValues.get(approvedName).getValue();
    }

    @Override
    public void setGlobalDefaultValue(String approvedName, Object value) {
        if (!validateGlobal(approvedName)) {
            throw new AuraRuntimeException("Attempt to set unknown $Global variable: " + approvedName);
        }

        if (globalValues.containsKey(approvedName)) {
            (globalValues.get(approvedName)).setDefaultValue(value);
        }
        else {
            // copy the registered record to globals, replacing value with supplied value
            GlobalValue temp = allowedGlobalValues.get(approvedName);

            // You could add "if (temp.defaultValue.equals(value)) return;"
            // if you wished to store values sparsely (not re-storing default even if explicitly set)
            // But you would lose the ability to test whether the value was explicitly set
            globalValues.put(approvedName, new GlobalValue(temp.isWritable(), value));
        }
    }

    @Override
    public void setGlobalValue(String approvedName, Object clientValue) {
        if (!validateGlobal(approvedName)) {
            throw new AuraRuntimeException("Attempt to set unknown $Global variable: " + approvedName);
        }

        if (globalValues.containsKey(approvedName)) {
            (globalValues.get(approvedName)).setValue(clientValue);
        }
        else {
            // copy the registered record to globals, replacing value with supplied value
            GlobalValue temp = allowedGlobalValues.get(approvedName);

            // You could add "if (temp.defaultValue.equals(value)) return;"
            // if you wished to store values sparsely (not re-storing default even if explicitly set)
            // But you would lose the ability to test whether the value was explicitly set
            GlobalValue newGlobal = new GlobalValue(temp.isWritable(), null);
            newGlobal.setValue(clientValue);
            globalValues.put(approvedName, newGlobal);
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
        allowedGlobalValues.put(approvedName, new GlobalValue(publicallyWritable, defaultValue));
    }

    @Override
    public String serialize(EncodingStyle style) {
        StringBuffer sb = new StringBuffer();
        JsonEncoder json = new JsonEncoder(sb, false);

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
                // AppJs does not include fwuid
                if (style == EncodingStyle.AppResource) {
                    // AppJs does contain this serialization version as a cache busting key we can use when we change the format of the file.
                    json.writeMapEntry("serializationVersion", ServerServiceImpl.AURA_SERIALIZATION_VERSION);
                } else if (style == EncodingStyle.Css) {
                    // don't include a serialized version nor fwuid
                } else {
                    if (getFrameworkUID() != null) {
                        json.writeMapEntry("fwuid", getFrameworkUID());
                    } else {
                        json.writeMapEntry("fwuid", configAdapter.getAuraFrameworkNonce());
                    }
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
                // add contextual CSS information
                if (styleContext == null) {
                    setStyleContext();
                }
                json.writeMapEntry("styleContext", getStyleContext());
            }

            // Normal and full get the locales, but not the css stuff
            if (style == EncodingStyle.Normal || style == EncodingStyle.Full || style == EncodingStyle.AppResource) {
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

                Map<String, String> moduleNamespaceAliases = configAdapter.getModuleNamespaceAliases();
                if (!moduleNamespaceAliases.isEmpty()) {
                    json.writeMapEntry("mna", moduleNamespaceAliases);
                }
            }
            
            String currentPathPrefix = getPathPrefix();

            if (currentPathPrefix != null) {
                json.writeMapEntry("pathPrefix", currentPathPrefix);
            }

            if (testContextAdapter != null) {
                TestContext testContext = testContextAdapter.getTestContext();
                if (testContext != null) {
                    json.writeMapEntry("test", testContext.getName());
                }
            }

            if (configAdapter.isLockerServiceEnabled()) {
                json.writeMapEntry("ls", 1);
            }

            if (nonce != null && style == EncodingStyle.Full){
                json.writeMapEntry("scriptNonce", nonce);
            }

            if (this.isModulesEnabled) {
                json.writeMapEntry("m", 1);
            }

            if (this.useCompatSource()) {
                json.writeMapEntry("c", 1);
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

    @Override
    public void addLocalDependencyEntry(String key, DependencyEntry de) {
        if (de.uid != null) {
            currentDefs.localDependencies.put(de.uid, de);
        }
        currentDefs.localDependencies.put(key, de);
    }

    @Override
    public DependencyEntry getLocalDependencyEntry(String key) {
        DependencyEntry entry;

        entry = userDefs.localDependencies.get(key);
        if (entry == null && isSystem) {
            entry = systemDefs.localDependencies.get(key);
        }
        return entry;
    }

    @Override
    public DependencyEntry findLocalDependencyEntry(DefDescriptor<?> descriptor) {
        for (DependencyEntry det : userDefs.localDependencies.values()) {
            if (det.dependencies != null && det.dependencies.contains(descriptor)) {
                return det;
            }
        }
        if (isSystem) {
            for (DependencyEntry det : systemDefs.localDependencies.values()) {
                if (det.dependencies != null && det.dependencies.contains(descriptor)) {
                    return det;
                }
            }
        }
        return null;
    }

    /**
     * Track if the client class was already added to the pay load for this request.
     */
    @Override
    public void setClientClassLoaded(DefDescriptor<?> clientClass, Boolean isLoaded) {
        clientClassesLoaded.put(clientClass.getQualifiedName(), isLoaded);
    }

    /**
     * Check if the client class has already been added to the request pay load.
     */
    @Override
    public Boolean getClientClassLoaded(DefDescriptor<?> clientClass) {
        if(clientClassesLoaded.containsKey(clientClass.getQualifiedName())) {
            return clientClassesLoaded.get(clientClass.getQualifiedName());
        }
        return false;
    }

    @Override
    public Cache<String, String> getAccessCheckCache() {
        return accessCheckCache;
    }

    @Override
    public RegistrySet getRegistries() {
        return this.registries;
    }

    @Override
    public void setModulesEnabled(boolean isModulesEnabled) {
        this.isModulesEnabled = isModulesEnabled;
    }

    @Override
    public boolean isModulesEnabled() {
        return this.isModulesEnabled;
    }

    @Override
    public void setUseCompatSource(boolean useCompatSource) {
        this.useCompatSource = useCompatSource;
    }

    @Override
    public boolean useCompatSource() {
        return this.useCompatSource;
    }

    @Override
    public boolean isAppJsSplitEnabled() {
        return false;
    }
}
