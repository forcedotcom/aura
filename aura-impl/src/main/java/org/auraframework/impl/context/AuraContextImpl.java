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
package org.auraframework.impl.context;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamException;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventType;
import org.auraframework.http.AuraServlet;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.Client;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidEventTypeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.ServiceLocator;
import org.auraframework.util.json.BaseJsonSerializationContext;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;
import org.auraframework.util.json.JsonSerializers;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraContextImpl implements AuraContext {
    public static class SerializationContext extends BaseJsonSerializationContext {
        public SerializationContext() {
            super(false, false, -1, -1, false);
        }

        @SuppressWarnings("unchecked")
        @Override
        public JsonSerializer<?> getSerializer(Object o) {
            Class<?> c = o.getClass();
            if (c == AuraContextImpl.class || o instanceof AuraContextImpl) {
                return URL_SERIALIZER;
            } else if (c == ArrayList.class || o instanceof Collection) {
                return JsonSerializers.COLLECTION;
            } else if (c == Mode.class || c == String.class) { return JsonSerializers.STRING; }
            return null;
        }
    }

    private static class Serializer extends NoneSerializer<AuraContext> {
        private final boolean forClient;

        private Serializer(boolean forClient) {
            this(forClient, false);
        }

        private Serializer(boolean forClient, boolean serializeLastMod) {
            this.forClient = forClient;
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
            if (ctx.getSerializePreLoad()) {
                json.writeMapEntry("preloads", ctx.getPreloads());
            }
            if (ctx.getRequestedLocales() != null) {
                List<String> locales = new ArrayList<String>();
                for (Locale locale : ctx.getRequestedLocales()) {
                    locales.add(locale.toString());
                }
                json.writeMapEntry("requestedLocales", locales);
            }
            if (ctx.getSerializeLastMod()) {
                try {
                    json.writeMapEntry("lastmod", Long.toString(AuraServlet.getLastMod()));
                } catch (QuickFixException e) {
                    throw new AuraRuntimeException(e);
                }
            }
            
            if (forClient) {
                // client needs value providers, urls don't
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
                
                Map<String, BaseComponent<?, ?>> components = ctx.getComponents();
                if (!components.isEmpty()) {
                    json.writeMapKey("components");
                    json.writeMapBegin();

                    for (BaseComponent<?, ?> component : components.values()) {
                        if (component.hasLocalDependencies()) {
                            json.writeMapEntry(component.getGlobalId(), component);
                        }
                    }

                    json.writeMapEnd();
                }
            }
            json.writeMapEnd();
        }
    }

    // serializer with everything for the client
    public static final Serializer FULL_SERIALIZER = new Serializer(true);

    // serializer just for passing context in a url
    public static final Serializer URL_SERIALIZER = new Serializer(false);

    // serializer just for passing context in a url
    public static final Serializer HTML_SERIALIZER = new Serializer(false, true);

    private final Set<DefDescriptor<?>> staleChecks = new HashSet<DefDescriptor<?>>();

    private final Mode mode;

    private final Access access;

    private final MasterDefRegistry masterRegistry;

    private final JsonSerializationContext jsonContext;

    private BaseComponent<?, ?> currentComponent;

    private Action currentAction;

    private final Map<DefType, String> defaultPrefixes;

    private String num;

    private String currentNamespace;

    private final LinkedHashSet<String> preloadedNamespaces = Sets.newLinkedHashSet();

    private final Format format;

    private final Map<ValueProviderType, GlobalValueProvider> globalProviders;

    private final Map<String, BaseComponent<?, ?>> componentRegistry = Maps.newLinkedHashMap();

    private int nextId = 1;

    private String contextPath = "";

    private boolean serializePreLoad = true;

    private boolean serializeLastMod = true;

    private boolean preloading = false;

    private DefDescriptor<? extends BaseComponentDef> appDesc;
    private BaseComponentDef app;
    private boolean appLoaded = false;
    private List<Locale> requestedLocales;
    private Client client = Client.OTHER;

    private String lastMod = "";

    private List<Event> clientEvents = Lists.newArrayList();
    
    public AuraContextImpl(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
                            Format format, Access access, JsonSerializationContext jsonContext,
                            Map<ValueProviderType, GlobalValueProvider> globalProviders,
                            DefDescriptor<? extends BaseComponentDef> appDesc) {
        if (access == Access.AUTHENTICATED) {
            preloadedNamespaces.add("aura");
            preloadedNamespaces.add("ui");
            if (mode == Mode.DEV) {
                preloadedNamespaces.add("auradev");
            }
        }
        this.mode = mode;
        this.masterRegistry = masterRegistry;
        this.defaultPrefixes = defaultPrefixes;
        this.format = format;
        this.access = access;
        this.jsonContext = jsonContext;
        this.globalProviders = globalProviders;
        this.appDesc = appDesc;
    }

    @Override
    public void addPreload(String preload) {
        preloadedNamespaces.add(preload);
    }

    @Override
    public void clearPreloads() {
        preloadedNamespaces.clear();
    }

    @Override
    public boolean isPreloaded(DefDescriptor<?> descriptor) {
        if (this.preloading) {
            return false;
        }
        if (this.appDesc != null && !this.appLoaded) {
            this.appLoaded = true;
            try {
                this.app = this.appDesc.getDef();
            } catch (QuickFixException qfe) {
                // we just don't have an app, ignore this.
            } catch (AuraUnhandledException ahe) {
                // Ugh! our file has been created, but not written?
                // TODO: W-1486796
                if (!(ahe.getCause() instanceof XMLStreamException)) {
                    throw ahe;
                }
            }
        }
        if (this.app != null) {
            for (DependencyDef dd : this.app.getDependencies()) {
                if (dd.getDependency().matchDescriptor(descriptor)) {
                    return true;
                }
            }
        }
        return this.preloadedNamespaces.contains(descriptor.getNamespace());
    }

    @Override
    public Access getAccess() {
        return access;
    }

    @Override
    public DefDescriptor<? extends BaseComponentDef> getApplicationDescriptor() {
        return appDesc;
    }

    @Override
    public Client getClient() {
        return client;
    }

    @Override
    public Map<String, BaseComponent<?, ?>> getComponents() {
        return componentRegistry;
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
    public String getCurrentNamespace() {
        return currentNamespace;
    }

    @Override
    public String getDefaultPrefix(DefType defType) {
        return defaultPrefixes.get(defType);
    }

    @Override
    public MasterDefRegistry getDefRegistry() {
        return masterRegistry;
    }

    @Override
    public Format getFormat() {
        return format;
    }

    @Override
    public Map<ValueProviderType, GlobalValueProvider> getGlobalProviders() {
        return globalProviders;
    }

    @Override
    public JsonSerializationContext getJsonSerializationContext() {
        return jsonContext;
    }

    @Override
    public String getLabel(String section, String name, Object... params) {
        return ServiceLocator.get().get(LocalizationAdapter.class).getLabel(section, name, params);
    }

    @Override
    public String getLastMod() {
        return lastMod;
    }

    @Override
    public Mode getMode() {
        return mode;
    }

    @Override
    public int getNextId() {
        return nextId++;
    }

    @Override
    public String getNum() {
        return num;
    }

    @Override
    public Set<String> getPreloads() {
        return Collections.unmodifiableSet(preloadedNamespaces);
    }

    @Override
    public List<Locale> getRequestedLocales() {
        return this.requestedLocales;
    }

    @Override
    public boolean getSerializeLastMod() {
        return serializeLastMod;
    }

    @Override
    public boolean getSerializePreLoad() {
        return serializePreLoad;
    }

    @Override
    public boolean hasChecked(DefDescriptor<?> d) {
        return staleChecks.contains(d);
    }

    @Override
    public boolean isPreloading() {
        return this.preloading;
    }

    @Override
    public boolean isTestMode() {
        return getMode().isTestMode();
    }

    @Override
    public void registerComponent(BaseComponent<?, ?> component) {
    	Action action = getCurrentAction();
    	if (action != null) {
            action.registerComponent(component);
    	} else {
            componentRegistry.put(component.getGlobalId(), component);
    	}
    }

    @Override
    public void setApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> appDesc) {
        //
        // This logic is twisted, but not unreasonable. If someone is setting an application,
        // we use it, otherwise, if it is a Component, we only override components, leaving
        // applications intact. Since components are only legal for dev mode, this shouldn't
        // affect much. In fact, most use cases, this.appDesc will be null.
        //
        if ((appDesc != null && appDesc.getDefType().equals(DefType.APPLICATION))
            || this.appDesc == null || !this.appDesc.getDefType().equals(DefType.APPLICATION)) {
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
    public void setCurrentNamespace(String namespace) {
        this.currentNamespace = namespace;
    }

    @Override
    public void setLastMod(String lastMod) {
        this.lastMod = lastMod;
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
    public void setRequestedLocales(List<Locale> requestedLocales) {
        this.requestedLocales = requestedLocales;
    }

    @Override
    public void setSerializeLastMod(boolean serializeLastMod) {
        this.serializeLastMod = serializeLastMod;
    }

    @Override
    public void setSerializePreLoad(boolean serializePreLoad) {
        this.serializePreLoad = serializePreLoad;
    }

    @Override
    public void setStaleCheck(DefDescriptor<?> d) {
        staleChecks.add(d);
    }
    
    @Override
    public void addClientApplicationEvent(Event event) throws Exception{
        if(event!=null){
           if(event.getDescriptor().getDef().getEventType()!=EventType.APPLICATION){
               throw new InvalidEventTypeException(
                       String.format("%s is not an Application event. " +
                                    "Only Application events are allowed to be fired from server.",
                                        event.getDescriptor()), null);
           }
           clientEvents.add(event);
        }
    }

    @Override
    public List<Event> getClientEvents(){
    	return clientEvents;
    }
}
