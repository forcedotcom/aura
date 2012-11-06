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
package org.auraframework.impl.java.type;

import java.io.IOException;
import java.util.Iterator;

import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.instance.ValueProvider;
import org.auraframework.instance.Wrapper;

import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 */
public class JavaValueProvider implements ValueProvider, Wrapper, JsonSerializable, Iterable<Object> {

    private final Object obj;

    public JavaValueProvider(Object obj) {
        this.obj = obj;
    }

    @Override
    public Object getValue(PropertyReference e) throws QuickFixException {
        return JavaModel.getValue(obj, e, null);
    }

    @Override
    public Object unwrap() {
        return obj;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeValue(obj);
    }

    @Override
    public Iterator<Object> iterator() {
        if (obj instanceof Iterable) {
            final Iterator<?> it = ((Iterable<?>)obj).iterator();
            return new Iterator<Object>() {

                @Override
                public boolean hasNext() {
                    return it.hasNext();
                }

                @Override
                public Object next() {
                    Object o = it.next();
                    if (!(o instanceof JavaValueProvider)) {
                        return new JavaValueProvider(o);
                    } else {
                        return o;
                    }
                }

                @Override
                public void remove() {
                    throw new UnsupportedOperationException("no can remove");
                }
            };
        }
        throw new UnsupportedOperationException("Type is not iterable: " + obj.getClass().getName());
    }

    @Override
    public String toString() {
        return obj.toString();
    }

}
