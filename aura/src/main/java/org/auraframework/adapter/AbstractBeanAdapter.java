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
package org.auraframework.adapter;

import org.auraframework.def.JavaProviderDef;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.def.JavaModelDef;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * This abstract class provides a base implementation that must be overridden.
 *
 * All implementors should override this class, and they should override all methods
 * in it. New methods can be added here without breaking the compilation of subclasses.
 * Given that this would be net new functionality, it is assumed that compiling would
 * be sufficient.
 */
public abstract class AbstractBeanAdapter implements BeanAdapter {
    @Override
    public void validateModelBean(JavaModelDef def) throws QuickFixException {
        throw new UnsupportedOperationException("Unimplemented method");
    }

    @Override
    public Object getModelBean(JavaModelDef def) {
        throw new UnsupportedOperationException("Unimplemented method");
    }

    @Override
    public void validateControllerBean(JavaControllerDef def) throws QuickFixException {
        throw new UnsupportedOperationException("Unimplemented method");
    }

    @Override
    public Object getControllerBean(JavaControllerDef def) {
        throw new UnsupportedOperationException("Unimplemented method");
    }

    @Override
    public void validateProviderBean(JavaProviderDef def, Class<?> clazz) throws QuickFixException {
        throw new UnsupportedOperationException("Unimplemented method");
    }

    @Override
    public <T> T getProviderBean(JavaProviderDef def, Class<T> clazz) {
        throw new UnsupportedOperationException("Unimplemented method");
    }
}
