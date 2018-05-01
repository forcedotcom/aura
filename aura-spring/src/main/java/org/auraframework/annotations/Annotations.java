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
package org.auraframework.annotations;

import org.auraframework.system.Annotations.Model;
import org.auraframework.system.Annotations.Provider;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Meta annotations covering Spring component and scope.
 */
public interface Annotations {
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Lazy
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface ServiceComponent {
    }

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface ServiceComponentFilter {

        String[] name() default "";

        String[] urlPattern() default "";

        String[] servletName() default "";
    }

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface InitParam {
        String name() default "";

        String value();
    }

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface ServiceComponentServlet {
        String[] name() default "";
    }

    /**
     * Marker annotation for the instance (prototype scope POJO) portion of Service Component
     * Models represented by Service Component Factory and Service Component Instance.
     * {@link ServiceComponentModelInstance} and {@link ServiceComponentModelFactory}
     * should be always used in pairs.
     * Note: that org.auraframework.ds.servicecomponent is not a Bean and therefore this
     * meta-annotation does not include {@link Component} annotation
     */
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Model
    @Deprecated
    @interface ServiceComponentModelInstance {
    }

    /**
     * Marker annotation for the factory (singleton) portion of Service Component
     * Models represented by Service Component Factory and Service Component Instance.
     * {@link ServiceComponentModelInstance} and {@link ServiceComponentModelFactory}
     * should be always used in pairs.
     */
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Lazy
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @Deprecated
    @interface ServiceComponentModelFactory {
    }

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Provider
    @Documented
    @Component
    @Lazy
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @Deprecated
    @interface ServiceComponentProvider {
    }


    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @Component
    @Lazy
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface ServiceComponentRenderer {
    }

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @Component
    @Lazy
    @Scope(BeanDefinition.SCOPE_SINGLETON)
    @interface ServiceComponentApplicationInitializer {
        String name();

        String[] applications();
    }
}
