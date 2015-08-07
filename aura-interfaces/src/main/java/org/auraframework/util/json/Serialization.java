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
package org.auraframework.util.json;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * This annotations is only looked for on classes that implement {@link JsonSerializable}
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface Serialization {

    enum ReferenceType {
        /**
         * This is the default. Just do normal json serialization
         */
        NONE,

        /**
         * If a == b, just output serRefId=<the refId of the object> after
         * the first time it's output
         */
        IDENTITY
    }

    ReferenceType referenceType() default ReferenceType.NONE;

    enum ReferenceScope {
        /**
         * the reference is available for the entire request.
         */
        REQUEST,

        /**
         * The reference is only internal tothe current action.
         */
        ACTION
    }

    ReferenceScope referenceScope() default ReferenceScope.ACTION;
}