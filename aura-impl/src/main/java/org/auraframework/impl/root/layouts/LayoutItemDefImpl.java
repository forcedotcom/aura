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
package org.auraframework.impl.root.layouts;

import java.io.IOException;
import java.util.List;

import com.google.common.collect.Lists;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutItemDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.RemoveAttributeQuickFix;
import org.auraframework.throwable.quickfix.RemoveBodyQuickFix;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 */
public class LayoutItemDefImpl extends DefinitionImpl<LayoutItemDef> implements LayoutItemDef{

    /**
         */
        private static final long serialVersionUID = -717942308004793881L;
        private final List<ComponentDefRef> body;
    private final String cache;
    private final String container;
    private final Object action;
    private final String layoutName;
    /**
     * @param builder
     */
    protected LayoutItemDefImpl(Builder builder) {
        super(builder);
        this.body = AuraUtil.immutableList(builder.body);
        this.cache = builder.cache;
        this.container = builder.container;
        this.action = builder.action;
        this.layoutName = builder.layoutName;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<LayoutItemDef>{

        public Builder(){
            super(LayoutItemDef.class);
        }

        private List<ComponentDefRef> body;
        private String cache;
        private String container;
        private Object action;
        private String layoutName;

        @Override
        public LayoutItemDefImpl build() {
            return new LayoutItemDefImpl(this);
        }

        public Builder addComponentDefRef(ComponentDefRef ref){
            if(body == null){
                body = Lists.newArrayList();
            }
            body.add(ref);
            return this;
        }

        public Builder addComponentDefRefs(List<? extends ComponentDefRef> refs){
            if(body == null){
                body = Lists.newArrayList();
            }
            body.addAll(refs);
            return this;
        }

        /**
         * Sets the cache for this instance.
         *
         * @param cache The cache.
         */
        public void setCache(String cache) {
            this.cache = cache;
        }

        /**
         * Sets the container for this instance.
         *
         * @param container The container.
         */
        public void setContainer(String container) {
            this.container = container;
        }

        /**
         * Sets the action for this instance.
         *
         * @param action The action.
         */
        public void setAction(Object action) {
            this.action = action;
        }

        /**
         * Sets the layoutName for this instance.
         *
         * @param layoutName The layoutName.
         */
        public void setLayoutName(String layoutName) {
            this.layoutName = layoutName;
        }
    }

    @Override
    public List<ComponentDefRef> getBody() {
        return this.body;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        if(!AuraTextUtil.isNullEmptyOrWhitespace(cache)){
            json.writeMapEntry("cache", cache);
        }
        json.writeMapEntry("body",getBody());
        json.writeMapEntry("container", container);
        json.writeMapEntry("action", action);
        json.writeMapEnd();
    }

    @Override
    public String getCache() {
        return this.cache;
    }

    @Override
    public String getContainer() {
        return container;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if(this.action != null && this.body != null && !this.body.isEmpty()){
            throw new BothActionAndBodyDefinedException("layoutItem should have only either an action or markup but not both", getLocation());
        }
        else if(this.action == null && (this.body == null || this.body.isEmpty())){
            throw new BothActionAndBodyDefinedException("layoutItem should have either an action or markup", getLocation());
        }
    }

    private DefDescriptor<?> getLayoutsDesc(){
        return ((SubDefDescriptor<?,?>)descriptor).getParentDescriptor();
    }

    private String getLayoutName(){
        return this.layoutName;
    }

    private String getQuery() throws QuickFixException{
        return "//layouts/layout[@name=\""+this.getLayoutName()+"\"]/layoutItem[@container=\""+this.getContainer()+"\"]";
    }

    private LayoutItemDef getDef(){
        return this;
    }

    private class BothActionAndBodyDefinedException extends QuickFixException {
                private static final long serialVersionUID = -954704188121588134L;

                BothActionAndBodyDefinedException(String message, Location location) throws QuickFixException {
                super(message, location, new RemoveAttributeQuickFix(getLayoutsDesc(),"action", getQuery(), getDef()),new RemoveBodyQuickFix(getLayoutsDesc(), getQuery(), getDef()));
        }
    }

}
