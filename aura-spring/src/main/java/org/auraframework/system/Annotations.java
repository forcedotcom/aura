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
package org.auraframework.system;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Aura specific annotations.
 *
 * Moved from aura module to prevent cyclical dependency between aura and aura-spring
 * aura-annotations module could be a possibility.
 */
public interface Annotations {
	
    /**
     * Marks a method as that will be queued and run as a lower priority background action.
     * The AuraEnabled annotation is still required to use this method as a server action.
     */
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface BackgroundAction {
    }

    /**
     * Marks a method to be queued and wait for the next action that would be sent.
     *
     * This can be used when the action is to send data that is not critical, and that we
     * want to boxcar with other actions to avoid performance penalties.
     *
     * The AuraEnabled annotation is still required to use this method as a server action.
     */
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface CabooseAction {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface AuraEnabled {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface ActionGroup {
        String value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.PARAMETER)
    @interface Key {
        String value();
        boolean loggable() default false;
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Controller {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Model {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Provider {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Type {
        String value();
    }

    /**
     * Marks a server action to be cacheable on public HTTP cache.
     * 
     * The expiration value sets the cache expiration time in seconds.
     */
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface PublicCachingEnabled {
        int expiration();
    }
}
