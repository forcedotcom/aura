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
package org.auraframework.util.test.runner;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.util.List;
import java.util.Set;

import org.auraframework.util.test.util.ModuleUtil;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runner.manipulation.Filter;
import org.junit.runner.manipulation.NoTestsRemainException;
import org.junit.runners.Suite;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.RunnerBuilder;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class ModuleRunner extends Suite {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @Inherited
    public @interface ModuleClasses {
        /**
         * @return Classes within the modules to be scanned
         */
        public Class<?>[] value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @Inherited
    public @interface TestFilter {
        /**
         * @return Classes within the modules to be scanned
         */
        public Class<? extends Filter> value();
    }

    public ModuleRunner(Class<?> klass, RunnerBuilder builder) throws InitializationError, NoTestsRemainException, InstantiationException, IllegalAccessException {
        super(builder, klass, getTestClasses(klass));
        TestFilter filterClass = klass.getAnnotation(TestFilter.class);
		if (filterClass != null) {
			filter(filterClass.value().newInstance());
		}
    }

    private static Class<?>[] getTestClasses(Class<?> klass) throws InitializationError {
        ModuleClasses classAnnotation = klass.getAnnotation(ModuleClasses.class);
        if (classAnnotation == null) {
            throw new RuntimeException(String.format(
                "class '%s' must have a ModuleClasses annotation", klass.getName()));
        }
        Class<?>[] annotatedClasses = classAnnotation.value();
        Set<String> classNames = Sets.newHashSet();
        for (Class<?> annotatedClass : annotatedClasses) {
            URI rootUri = ModuleUtil.getRootUri(annotatedClass);
            classNames.addAll(ModuleUtil.getClassNames(rootUri));
        }
        
        List<Class<?>> testClasses = Lists.newArrayList();
        for (String className : classNames) {
            try {
                Class<?> potentialClass = Class.forName(className);
                if (maybeTestClass(potentialClass)) {
                    testClasses.add(potentialClass);
                }
            } catch (Throwable ignoreNonTestClasses) {
                continue;
            }
        }
        return testClasses.toArray(new Class<?>[testClasses.size()]);
    }

    private static boolean maybeTestClass(Class<?> testClass){
        int modifiers = testClass.getModifiers();
        if (!Modifier.isPublic(modifiers) || Modifier.isAbstract(modifiers) || Modifier.isInterface(modifiers)) {
            return false;
        }
        
        if (testClass.getAnnotation(RunWith.class) != null) {
            return true;
        }
        // quick scan for method annotation; no other validation
        do {
            for (Method method : testClass.getDeclaredMethods()) {
                if (method.getAnnotation(Test.class) != null) {
                    return true;
                }
            }
            testClass = testClass.getSuperclass();
        } while (testClass != null);
        
        return false;
    }
}
