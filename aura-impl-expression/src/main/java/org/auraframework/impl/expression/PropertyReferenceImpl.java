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
package org.auraframework.impl.expression;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.ExpressionType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.ValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;

import com.google.common.collect.ImmutableList;

/**
 * an expression in aura
 */
public class PropertyReferenceImpl implements PropertyReference {

    /**
     */
    private static final long serialVersionUID = -6332112591620619082L;
    private final List<String> pieces;
    private final Location l;
    private boolean byValue=false;

    public PropertyReferenceImpl(String expr, Location l) {
        // TODO: delete this constructor, splitting should be done by the parser
        this(AuraTextUtil.splitSimple(".", expr), l);
    }

    public PropertyReferenceImpl(Iterable<String> pieces, Location l) {
        this(ImmutableList.copyOf(pieces), l);
    }

    protected PropertyReferenceImpl(List<String> pieces, Location l) {
        this.pieces = pieces;
        this.l = l;
    }

    @Override
    public final Location getLocation() {
        return l;
    }

    @Override
    public Object evaluate(ValueProvider vp) throws QuickFixException {
        Object ret = null;
        if (vp != null) {
            ret = vp.getValue(this);
        } else {
            String root = getRoot();
            AuraContext lc = Aura.getContextService().getCurrentContext();
            ValueProviderType vpt = ValueProviderType.getTypeByPrefix(root);
            if (vpt != null) {
                ret = lc.getGlobalProviders().get(vpt).getValue(getStem());
            }
        }
        return ret;
    }

    @Override
    public ExpressionType getExpressionType() {
        return ExpressionType.PROPERTY;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return null;
    }

    @Override
    public PropertyReference getStem() {
        return size() == 1 ? null : new PropertyReferenceImpl(pieces.subList(1, size()), getLocation());
    }

    @Override
    public PropertyReference getSub(int start, int end) {
        try {
            return new PropertyReferenceImpl(pieces.subList(start, end), getLocation());
        } catch (IndexOutOfBoundsException ioe) {
            return null;
        }
    }

    @Override
    public String getRoot() {
        return pieces.get(0);
    }

    @Override
    public String getLeaf() {
        return pieces.get(pieces.size() - 1);
    }

    @Override
    public int size() {
        return pieces.size();
    }

    @Override
    public List<String> getList() {
        return pieces;
    }

    @Override
    public void setByValue(boolean byValue){
        this.byValue=byValue;
    }

    @Override
    public String toString() {
        return toString(false);
    }

    public String toString(boolean curlies) {
        char curlyType=this.byValue?'#':'!';
        return AuraTextUtil.collectionToString(pieces, ".", null, curlies ? "{" + curlyType : null, curlies ? "}" : null);
    }

    @Override
    public void gatherPropertyReferences(Set<PropertyReference> propRefs) {
        propRefs.add(this);
    }

    // equals and hashcode don't use location

    @Override
    public boolean equals(Object o) {
        if (o instanceof PropertyReferenceImpl) {
            return pieces.equals(((PropertyReferenceImpl) o).pieces);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return pieces.hashCode();
    }

    public static final Serializer SERIALIZER = new Serializer();

    private static class Serializer extends NoneSerializer<PropertyReferenceImpl> {
        @Override
        public void serialize(Json json, PropertyReferenceImpl value) throws IOException {
            json.writeString(value.toString(true));
        }
    }

}
