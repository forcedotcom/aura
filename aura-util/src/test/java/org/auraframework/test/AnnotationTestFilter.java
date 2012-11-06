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
package org.auraframework.test;

import java.lang.annotation.Annotation;
import java.util.Collection;
import java.util.Set;

import junit.framework.Test;
import junit.framework.TestCase;

import com.google.common.collect.ImmutableSet;

public class AnnotationTestFilter implements TestFilter {
    private Set<Class<? extends Annotation>> ignorableAnnotations;

    public AnnotationTestFilter(Collection<Class<? extends Annotation>> annotations) {
        this.ignorableAnnotations = ImmutableSet.copyOf(annotations);
    }

    private boolean hasIgnorableAnnotation(Annotation... annotations) {
        for (Annotation annotation : annotations) {
            if (ignorableAnnotations.contains(annotation.annotationType())) return true;
        }
        return false;
    }

    @Override
    public Class<? extends Test> applyTo(Class<? extends Test> testClass) {
        if (testClass == null || hasIgnorableAnnotation(testClass.getAnnotations())) { return null; }
        return testClass;
    }

    @Override
    public TestCase applyTo(TestCase test) {
        if (test == null) {
            return null;
        } else {
            String method = test.getName();
            try {
                if (hasIgnorableAnnotation(test.getClass().getMethod(method).getAnnotations())) { return null; }
            } catch (NoSuchMethodException e) {
                // This may happen for dynamic tests, so ignore
            }
        }
        return test;
    }
}
