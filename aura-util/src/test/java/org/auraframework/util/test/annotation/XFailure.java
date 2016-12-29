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
package org.auraframework.util.test.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface XFailure {
    /**
     * The optional reason why it's not yet ready for prime time.
     * If you DO provide a reason, it should startWith the exception message.
     * 
     * On the following line, getService() could return null. In this case the test would fail with a NullPointerException 
     * and if we didn't provide a reason, the XFailure wouldn't notify anyone. But if we expected the assertion message
     * then we'll know we broke a something that should work.
     * 
     * assertTrue(getService().getRawValue(), "Should be false");
     */
    String value() default "";
}
