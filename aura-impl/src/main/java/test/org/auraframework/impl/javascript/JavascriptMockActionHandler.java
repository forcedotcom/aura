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
package test.org.auraframework.impl.javascript;

import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef.Builder;
import org.auraframework.impl.javascript.testsuite.JavascriptMockHandler;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.test.Resettable;
import org.auraframework.test.mock.Answer;
import org.auraframework.test.mock.DelegatingHandler;
import org.auraframework.test.mock.Invocation;
import org.auraframework.test.mock.MockAction;
import org.auraframework.test.mock.Stub;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.common.collect.ImmutableList;

/**
 * Parse JSTEST mock Actions.
 */
public class JavascriptMockActionHandler extends JavascriptMockHandler<ControllerDef> {
    

    @Configuration
    public static class ConfigureMockActionInstanceBuilder {
        @Bean(autowire = Autowire.BY_TYPE)
        public InstanceBuilder<Action, ?> mockActionInstanceBuilder() {
            return new MockActionInstanceBuilder();
        }
    }


    private static class MockActionHandler extends DelegatingHandler {
        private final Answer<?> answer;

        public MockActionHandler(Object delegate, Answer<?> answer) {
            super(delegate);
            this.answer = answer;
        }
    }

    public static class MockActionInstanceBuilder implements InstanceBuilder<Action, ActionDef> {
        @Override
        public Class<?> getDefinitionClass() {
            return Proxy.getProxyClass(JavascriptMockActionHandler.class.getClassLoader(),
                    new Class<?>[] { ActionDef.class });
        }

        @Override
        public Action getInstance(ActionDef def, Map<String, Object> attributes) throws QuickFixException {
            try {
                return (Action) ((MockActionHandler) Proxy.getInvocationHandler(def)).answer.answer();
            } catch (Throwable e) {
                throw new AuraRuntimeException(e);
            }
        }
    }

    private static class MockJavaControllerDefHandler extends DelegatingHandler {
        private final List<Stub<?>> stubs;

        private MockJavaControllerDefHandler(ControllerDef delegate, List<Stub<?>> stubs) {
            super(delegate);
            this.stubs = stubs;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String methodName = method.getName();

            // check for Resettable.reset() call
            if ("reset".equals(methodName) && method.getDeclaringClass().equals(Resettable.class)) {
                for (Stub<?> stub : stubs) {
                    stub.reset();
                }
                return null;
            }

            Object res = super.invoke(proxy, method, args);
            if ("getSubDefinition".equals(methodName) && args.length == 1) {
                Class<?> paramType = method.getParameterTypes()[0];
                String name;
                if (SubDefDescriptor.class.equals(paramType)) {
                    name = ((SubDefDescriptor<?, ?>) args[0]).getName();
                } else {
                    name = args[0].toString();
                }
                for (Stub<?> stub : stubs) {
                    if (stub.getInvocation().getMethodName().equals(name)) {
                        return Proxy.newProxyInstance(JavascriptMockActionHandler.class.getClassLoader(),
                                new Class<?>[] { ActionDef.class },
                                new MockActionHandler(res, stub.getNextAnswer()));
                    }
                }
            }
            return res;
        }
    }

    private ControllerDef controllerDef;
    private ActionDef actionDef;

    public JavascriptMockActionHandler(DefDescriptor<? extends BaseComponentDef> targetDescriptor,
            Map<String, Object> map) {
        super(targetDescriptor, map);
    }

    @Override
    protected ControllerDef createDefinition(Map<String, Object> map) throws QuickFixException {
        controllerDef = getBaseDefinition((String) map.get("descriptor"), ControllerDef.class);
        List<Stub<?>> stubs = getStubs(map.get("stubs"));
        return (JavaControllerDef) Proxy.newProxyInstance(JavascriptMockActionHandler.class.getClassLoader(),
                new Class<?>[] { JavaControllerDef.class, Resettable.class }, new MockJavaControllerDefHandler(
                        controllerDef, stubs));
    }

    @Override
    protected ControllerDef getDefaultBaseDefinition() throws QuickFixException {
        for (DefDescriptor<ControllerDef> desc : getTargetDescriptor().getDef().getControllerDefDescriptors()) {
            String prefix = desc.getPrefix();
            if ("java".equals(prefix) || "serviceComponent".equals(prefix)) {
                return desc.getDef();
            }
        }
        throw new InvalidDefinitionException("Unable to locate the server controller", getLocation());
    }

    @Override
    protected Invocation getDefaultInvocation() throws QuickFixException {
        throw new InvalidDefinitionException("A mock action must specify the name of the action", getLocation());
    }

    @Override
    protected Invocation getInvocation(Object object) throws QuickFixException {
        if (object instanceof Map) {
            Map<?, ?> methodMap = (Map<?, ?>) object;
            String name = (String) methodMap.get("name");
            if (name == null) {
                throw new InvalidDefinitionException("A mock action must specify the name of the action", getLocation());
            }
            String typeStr = (String) methodMap.get("type");
            Class<?> type = Object.class;
            if (typeStr != null) {
                try {
                    type = classForSimpleName(typeStr);
                } catch (ClassNotFoundException ignored) {
                }
            }
            actionDef = controllerDef.getSubDefinition(name);
            if (actionDef == null) {
                throw new InvalidDefinitionException("JavaMockActionHandler: unable to find action " + name,
                        getLocation());
            }
            return new ActionInvocation(name, null, type);
        }
        return super.getInvocation(object);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected <T> Answer<T> getAnswer(Object object, Class<T> retClass) throws QuickFixException {
        if (object instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) object;
            T value = getValue(map.get("value"), retClass);
            String error = (String) map.get("error");
            if (value != null) {
                if (error == null) {
                    return new Returns<>((T) new MockAction(
                            actionDef.getDescriptor(), State.SUCCESS, value));
                }
            } else {
                if (error != null) {
                    try {
                        new ThrowsExceptionClass<T>(error).answer();
                    } catch (Throwable e) {
                        return new Returns<>((T) new MockAction(
                                actionDef.getDescriptor(), State.ERROR, null,
                                null, null, ImmutableList.<Object> of(e)));
                    }
                }
            }
        }
        throw new InvalidDefinitionException("Mock answer must specify either 'value' or 'error'", getLocation());
    }

    /**
     * Matches invocations by action name only.
     */
    public class ActionInvocation extends Invocation {
        public ActionInvocation(String methodName, List<?> parameters, Class<?> returnType) {
            super(methodName, parameters, returnType);
        }

        @Override
        public boolean matches(Method method, Object[] args) {
            return method.getName().equals(getMethodName());
        }
    }

    @Override
    protected ControllerDef createDefinition(Throwable error) {
        Builder builder = new Builder();
        builder.setParseError(error);
        return builder.build();
    }
}
