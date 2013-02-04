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
package org.auraframework.impl;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class DefinitionServiceImpl implements DefinitionService {
    private static final long serialVersionUID = -2488984746420077688L;

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass) {
        if (defClass == ActionDef.class) {
            return (DefDescriptor<T>) SubDefDescriptorImpl.getInstance(qualifiedName, ActionDef.class,
                    ControllerDef.class);
        }
        return DefDescriptorImpl.getInstance(qualifiedName, defClass);
    }

    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix,
            Class<T> defClass) {

        return DefDescriptorImpl.getAssociateDescriptor(desc, defClass, prefix);
    }

    @Override
    public <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        contextService.assertEstablished();
        contextService.assertAccess(descriptor);

        T ret = contextService.getCurrentContext().getDefRegistry().getDef(descriptor);
        if (ret == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        return ret;
    }

    @Override
    public <T extends Definition> T getDefinition(String qualifiedName, Class<T> defClass) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        contextService.assertEstablished();

        DefDescriptor<T> desc = DefDescriptorImpl.getInstance(qualifiedName, defClass);
        contextService.assertAccess(desc);

        T ret = contextService.getCurrentContext().getDefRegistry().getDef(desc);
        if (ret == null) {
            throw new DefinitionNotFoundException(desc);
        }
        return ret;
    }

    @Override
    public Definition getDefinition(String qualifiedName, DefType... defTypes) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        contextService.assertEstablished();

        if (defTypes == null || defTypes.length == 0) {
            throw new AuraRuntimeException("defType is required");
        }

        DefDescriptor<?> desc = null;
        for (DefType defType : defTypes) {
            desc = getDefDescriptor(qualifiedName, defType.getPrimaryInterface());
            Definition ret = null;
            try {
                ret = desc.getDef();
            } catch (DefinitionNotFoundException e) {
                // ignore
            }
            if (ret != null) {
                return ret;
            }
        }
        throw new DefinitionNotFoundException(desc);
    }

    /**
     * Get the def registry currently in use.
     *
     * @return the master def registry.
     * @throws RuntimeException if the context has not been initialized.
     */
    @Override
    public MasterDefRegistry getDefRegistry() {
        ContextService cs = Aura.getContextService();

        cs.assertEstablished();
        return cs.getCurrentContext().getDefRegistry();
    }

    /**
     * Get the last mod for a set of descriptorss.
     */
    @Override
    public <T extends Definition> long getLastMod(DefDescriptor<T> descriptor) {
        String uid;
        try {
            uid = getDefRegistry().getUid(null, descriptor);
        } catch (QuickFixException qfe) {
            return 0;
        }
        return getDefRegistry().getLastMod(uid);
    }

    /**
     * Get the last mod for a set of descriptorss.
     */
    @Override
    public long getLastMod(String uid) {
        return getDefRegistry().getLastMod(uid);
    }

    @Override
    public <D extends Definition> Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) {
        Aura.getContextService().assertEstablished();

        AuraContext context = Aura.getContextService().getCurrentContext();
        return context.getDefRegistry().find(matcher);
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Aura.getContextService().assertEstablished();

        AuraContext context = Aura.getContextService().getCurrentContext();
        return context.getDefRegistry().find(matcher);
    }

    @Override
    public void save(Definition def) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        contextService.assertEstablished();
        contextService.assertAccess(def.getDescriptor());

        Aura.getContextService().getCurrentContext().getDefRegistry().save(def);
    }
}
