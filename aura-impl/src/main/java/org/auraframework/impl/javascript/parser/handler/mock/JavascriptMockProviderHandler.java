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
package org.auraframework.impl.javascript.parser.handler.mock;

import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.system.Source;
import org.auraframework.test.mock.Answer;
import org.auraframework.test.mock.DelegatingStubHandler;
import org.auraframework.test.mock.Invocation;
import org.auraframework.test.mock.Stub;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Parse JSTEST mock Providers.
 */
public class JavascriptMockProviderHandler extends JavascriptMockHandler<ProviderDef> {
    public JavascriptMockProviderHandler(DefDescriptor<TestSuiteDef> descriptor, Source<?> source,
            DefDescriptor<? extends BaseComponentDef> targetDescriptor, Map<String, Object> map) {
        super(descriptor, source, targetDescriptor, map);
    }

    @Override
    protected ProviderDef createDefinition(Map<String, Object> map) throws QuickFixException {
        ProviderDef baseDef = getBaseDefinition((String) map.get("descriptor"), ProviderDef.class);
        List<Stub<?>> stubs = getStubs(map.get("stubs"));
        return (ProviderDef) Proxy.newProxyInstance(this.getClass()
                .getClassLoader(), new Class<?>[] { ProviderDef.class },
                new DelegatingStubHandler(baseDef, stubs));
    }

    @SuppressWarnings("unchecked")
    @Override
    protected <T> T getValue(Object object, Class<T> retClass) throws QuickFixException {
        if (object != null && ComponentConfig.class.equals(retClass)) {
            if (!(object instanceof Map)) {
                throw new InvalidDefinitionException("Mock Provider expects (descriptor and/or attributes) or (configProvider)", getLocation());
            }
            ComponentConfig config;
            
            String configProvider = (String)((Map<?, ?>) object).get("configProvider");
            //If a config provider is specified, defer provide until later
            if(configProvider!=null && !configProvider.isEmpty()){
                config = null;
            }else{//Else determine the mock component to provide
                config = new ComponentConfig();
                DefDescriptor<ComponentDef> cdd = getDescriptor((String) ((Map<?, ?>) object).get("descriptor"),
                        ComponentDef.class);
                if (cdd != null) {
                    config.setDescriptor(cdd);
                }
                Map<String, Object> attributes = (Map<String, Object>) ((Map<?, ?>) object).get("attributes");
                if (attributes != null) {
                    config.setAttributes(attributes);
                }
            }
            return (T) config;
        } else {
            return super.getValue(object, retClass);
        }
    }
    
    @Override
    protected <T> Answer<T> getAnswer(Object object, Class<T> retClass) throws QuickFixException {
        if (object instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) object;
            final String configProvider = (String)((Map<?, ?>)map.get("value")).get("configProvider");
            if(configProvider!=null){
                return new Returns<T>(null){
                    @SuppressWarnings("unchecked")
                    @Override
                    public T answer() throws Throwable {
                        String mockProvider = configProvider; 
                        ComponentConfig config;
                        if(configProvider.startsWith("java://")){
                            mockProvider = configProvider.substring("java://".length());
                        }
                        try{
                            Class<?> providerClass = Class.forName(mockProvider);
                            if(!ComponentConfigProvider.class.isAssignableFrom(providerClass)){
                                throw new InvalidDefinitionException("Class specified as configProvider should implement ComponentConfigProvider", getLocation()); 
                            }
                            ComponentConfigProvider provider = (ComponentConfigProvider)providerClass.newInstance(); 
                            config = provider.provide();
                        }catch(ClassNotFoundException e){
                            throw new InvalidDefinitionException("Could not locate class specified as configProvider:"+configProvider, getLocation());
                        }catch(IllegalAccessException e){
                            throw new InvalidDefinitionException("Constructor is inaccessible for "+ configProvider, getLocation());
                        }catch (InstantiationException ie) {
                            throw new InvalidDefinitionException("Cannot instantiate " + configProvider, getLocation());
                        }
                      return (T)config;
                    }
                };
            }else{
                return super.getAnswer(object, retClass);
            }
        }
        throw new InvalidDefinitionException("Mock answer must specify either 'value' or 'error'", getLocation());
    }
    
    @Override
    protected ProviderDef getDefaultBaseDefinition() throws QuickFixException {
        return getTargetDescriptor().getDef().getLocalProviderDef();
    }

    @Override
    protected Invocation getDefaultInvocation() throws QuickFixException {
        return new Invocation("provide", null, ComponentConfig.class);
    }

}
