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
package org.auraframework.util;

import java.lang.annotation.*;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Set;

import org.auraframework.util.ServiceLocator.ServiceLocatorException;

import org.reflections.ReflectionUtils;
import org.reflections.Reflections;
import org.reflections.scanners.*;
import org.reflections.util.*;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Sets;

/**
 * @since 0.0.233
 */
public class ServiceLoaderImpl implements ServiceLoader {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    public @interface AuraConfiguration{}

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    public @interface Impl{
        String name() default "";
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    public @interface PrimaryImpl{}

    private static final ServiceLoader instance = new ServiceLoaderImpl();

    @SuppressWarnings("unchecked")
    private static final Predicate<? super Method> predicate = Predicates.and(ReflectionUtils.withModifier(Modifier.PUBLIC),
                                                        ReflectionUtils.withAnnotation(Impl.class),
                                                        ReflectionUtils.withModifier(Modifier.STATIC),
                                                        ReflectionUtils.withParametersCount(0));

    private final Reflections reflections;

    private ServiceLoaderImpl() {
        Predicate<String> filter = new FilterBuilder().include(FilterBuilder.prefix("configuration"));

        reflections = new Reflections(new ConfigurationBuilder()
                                                .filterInputsBy(filter)
                                                .setUrls(ClasspathHelper.forPackage("configuration"))
                                                .setScanners(new TypeAnnotationsScanner(),
                                                            new MethodAnnotationsScanner(),
                                                            new TypesScanner()));

    }

    public static final ServiceLoader get(){
        return instance;
    }

    @Override
    public <T> T get(Class<T> type) {
        try{

            Set<Class<?>> classes = reflections.getTypesAnnotatedWith(AuraConfiguration.class);

            //First try those marked with primary
            T ret = get(type, classes, true, predicate);
            if(ret != null){
                return ret;
            }

            return get(type, classes, false, predicate);

        }catch(Throwable t){
            throw new ServiceLocatorException(t);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T get(Class<T> type, Set<Class<?>> classes, boolean primary, Predicate<? super Method> predicate){
        Set<Method> beanMethods = Sets.newHashSet();
        Predicate<Method> pred;

        if(primary){
            pred = Predicates.and(predicate,
                                    ReflectionUtils.withReturnTypeAssignableTo(type),
                                    ReflectionUtils.withAnnotation(PrimaryImpl.class));
        }else{
            pred = Predicates.and(predicate,
                    ReflectionUtils.withReturnTypeAssignableTo(type));
        }

        /*  This is a better way to do it, but hits a runtime dep on Guava 12, so until we upgrade to Guava 12, working around this.
        */

        for(Class<?> clazz : classes){
            for(Method meth : clazz.getDeclaredMethods()){
                if(pred.apply(meth)){
                    beanMethods.add(meth);
                }
            }
        }


        T ret = null;
        try{
            for(Method meth : beanMethods){
                T tmp = (T)meth.invoke(null);
                if(tmp != null){
                    if(ret != null){
                        throw new ServiceLocatorException("More than one implementation found.");
                    }
                    ret = tmp;
                }
            }
        }catch(Exception e){
            throw new ServiceLocatorException(e);
        }
        return ret;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> Set<T> getAll(Class<T> type) {
        Set<Method> beanMethods = Sets.newHashSet();

        Set<T> ret = Sets.newHashSet();

        Predicate<Method> pred = Predicates.and(predicate, ReflectionUtils.withReturnTypeAssignableTo(type));

        Set<Class<?>> classes = reflections.getTypesAnnotatedWith(AuraConfiguration.class);

        /*  This is a better way to do it, but hits a runtime dep on Guava 12, so until we upgrade to Guava 12, working around this.
        */

        for(Class<?> clazz : classes){
            for(Method meth : clazz.getDeclaredMethods()){
                if(pred.apply(meth)){
                    beanMethods.add(meth);
                }
            }
        }



        try{
            for(Method meth : beanMethods){
                T val = (T)meth.invoke(null);
                if(val != null){
                    ret.add(val);
                }
            }
        }catch(Exception e){
            throw new ServiceLocatorException(e);
        }

        return ret;
    }

    @Override
    public <T> T get(Class<T> type, final String name) {
        try{

            Predicate<? super Method> predicate = Predicates.and(ServiceLoaderImpl.predicate, new Predicate<Method>() {

                @Override
                public boolean apply(Method input) {
                    return input.getAnnotation(Impl.class).name().equals(name);
                }

            });
            Set<Class<?>> classes = reflections.getTypesAnnotatedWith(AuraConfiguration.class);

            //First try those marked with primary
            T ret = get(type, classes, true, predicate);
            if(ret != null){
                return ret;
            }

            return get(type, classes, false, predicate);

        }catch(Throwable t){
            throw new ServiceLocatorException(t);
        }
    }
}
