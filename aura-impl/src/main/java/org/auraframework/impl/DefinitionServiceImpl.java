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
package org.auraframework.impl;

import java.lang.ref.WeakReference;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.MasterDefRegistryImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * The public access to definitions inside Aura.
 * 
 * This class manages all of the permissions checking and fetching of implementations
 * for consumers of aura definitions.
 */
public class DefinitionServiceImpl implements DefinitionService {
    private static final long serialVersionUID = -2488984746420077688L;
    private static final ConcurrentLinkedQueue<WeakReference<SourceListener>> listeners = new ConcurrentLinkedQueue<WeakReference<SourceListener>>();

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

        T def = contextService.getCurrentContext().getDefRegistry().getDef(descriptor);

        //
        // Check authentication. All defs should really support this but right now
        // it's specific to Applications, so putting this special case here until
        // we have a more generic check on all defs.
        //
        if (def != null && def.getDescriptor().getDefType() == DefType.APPLICATION
                && ((ApplicationDef) def).getAccess() == Access.AUTHENTICATED) {
            AuraContext context = Aura.getContextService().getCurrentContext();
            if (context.getAccess() != Access.AUTHENTICATED) {
                def = null;
            }
        }
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        return def;
    }

    @Override
    public <T extends Definition> T getDefinition(String qualifiedName, Class<T> defClass) throws QuickFixException {
        return getDefinition(DefDescriptorImpl.getInstance(qualifiedName, defClass));
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

    /**
     * Take in the information off the context and sanitize, populating dependencies.
     * 
     * This routine takes in the current descriptor, and a boolean to tell us
     * if we are preloading. It then expands out dependencies and cleans up the
     * set of explicitly loaded descriptors by removing descriptors that are
     * implicitly loaded by others in the set. If there is a problem with the
     * descriptor, it cleans up, and possibly sets the context descriptor to
     * a quickfix, then lets the exception percolate up.
     * 
     * Note that the client out of sync exception has higher 'precedence' than
     * the quick fix exception. This allows the servlet to correctly refresh a
     * client before presenting the quick fix (which would otherwise hide the
     * fact that the server side code changed). This is because quick fix exceptions
     * are thrown and swallowed during posts to avoid circular qfes, which cause
     * the server to not process the quick fix.
     * 
     * Once this routine has completed, the master def registiry should have a
     * valid set of dependencies for the descriptor on the context.
     * 
     * Note that removing things from the 'loaded' set should send them back to
     * the client, and allow our future requests to be smaller.
     * 
     * @param loading The descriptor we think we are loading.
     * @param preload are we preloading?
     * @throws ClientOutOfSyncException if the uid on something is a mismatch
     * @throws QuickFixException if a definition can't be compiled.
     */
    @Override
    public void updateLoaded(DefDescriptor<?> loading, boolean preload)
            throws QuickFixException, ClientOutOfSyncException {
        ContextService contextService = Aura.getContextService();
        AuraContext context;
        MasterDefRegistry mdr;
        List<Map.Entry<DefDescriptor<?>, String>> entries;
        Set<DefDescriptor<?>> loaded = Sets.newHashSet();

        contextService.assertEstablished();
        context = contextService.getCurrentContext();
        mdr = context.getDefRegistry();
        entries = Lists.newArrayList(context.getLoaded().entrySet());
        //
        // TODO (optimize): we could reverse this set randomly to try
        // to sanitize the list in opposite directions. No need to be
        // exact (hard to test though).
        //
        for (Map.Entry<DefDescriptor<?>, String> entry : entries) {
            DefDescriptor<?> descriptor = entry.getKey();
            String uid = entry.getValue();
            if (uid == null) {
                loaded.add(descriptor);
            } else if (loaded.contains(descriptor)) {
                context.dropLoaded(descriptor);
            } else {
                // validate the uid.
                String tuid = null;
                QuickFixException qfe = null;

                try {
                    tuid = mdr.getUid(uid, descriptor);
                } catch (QuickFixException broke) {
                    //
                    // See note above. This is how we enforce precedence of ClientOutOfSyncException
                    //
                    qfe = broke;
                }
                if (!uid.equals(tuid)) {
                    throw new ClientOutOfSyncException(descriptor + ": mismatched UIDs " + uid + " != " + tuid);
                }
                if (qfe != null) {
                    throw qfe;
                }
                if (!descriptor.equals(loading)) {
                    loaded.addAll(mdr.getDependencies(uid));
                }
            }
        }
        //
        // Now make sure that our current definition is somewhere there
        // If this fails, we will throw an exception, and all will be
        // well.
        //
        if (loading != null && !context.getLoaded().containsKey(loading)) {
            String uid = mdr.getUid(null, loading);

            if (uid == null) {
                throw new DefinitionNotFoundException(loading, null);
            } else {
                context.addLoaded(loading, uid);
            }
        }
    }

    @Override
    public void onSourceChanged(DefDescriptor<?> source, SourceListener.SourceMonitorEvent event) {
        for (WeakReference<SourceListener> i : listeners) {
            if (i.get() == null) {
                listeners.remove(i);
            }
        }
        MasterDefRegistryImpl.notifyDependentSourceChange(listeners, source, event);
    }

    @Override
    public void subscribeToChangeNotification(SourceListener listener) {
        listeners.add(new WeakReference<SourceListener>(listener));
    }

    @Override
    public void unsubscribeToChangeNotification(SourceListener listener) {
        for (WeakReference<SourceListener> i : listeners) {
            if (i.get() == null || i.get() == listener) {
                listeners.remove(i);
            }
        }
    }

}
