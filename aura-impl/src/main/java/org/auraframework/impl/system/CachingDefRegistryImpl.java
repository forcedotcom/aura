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
package org.auraframework.impl.system;

import java.util.Collection;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.AuraContext;
import org.auraframework.system.CacheableDefFactory;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 * base class for registries, adds some important methods that aren't exposed
 * through the top level interface
 */
public class CachingDefRegistryImpl<T extends Definition> extends NonCachingDefRegistryImpl<T>
        implements SourceListener {

    private static final long serialVersionUID = -1052118918311747954L;
    protected static final int CACHE_SIZE_MIN = 128;
    protected static final int CACHE_SIZE_MAX = 1024;

    protected final Cache<DefDescriptor<T>, Optional<T>> defs = CacheBuilder.newBuilder()
            .initialCapacity(CACHE_SIZE_MIN).maximumSize(CACHE_SIZE_MAX).build();

    private final CacheableDefFactory<T> cacheableFactory;
    private final Cache<DefDescriptor<T>, Boolean> existsCache = CacheBuilder.newBuilder().maximumSize(CACHE_SIZE_MAX)
            .build();

    public CachingDefRegistryImpl(CacheableDefFactory<T> factory, Set<DefType> defTypes, Set<String> prefixes) {
        super(factory, defTypes, prefixes);
        this.cacheableFactory = factory;
        Aura.getDefinitionService().subscribeToChangeNotification(this);
    }

    protected boolean useCache() {
        return true;
    }

    /**
     * Try to get a definition from the cache, or reload if necessary.
     * 
     * @throws QuickFixException if the fetch throws one.
     */
    @Override
    public T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        T def = null;
        Optional<T> holder;

        holder = defs.getIfPresent(descriptor);
        if (holder != null) {
            def = holder.orNull();
            if (def == null && useCache()) {
                return null;
            }
        }
        if (def != null && isStale(def)) {
            defs.invalidate(descriptor);
            def = null;
        }
        if (def == null) {
            def = CachingDefRegistryImpl.super.getDef(descriptor);
        }
        if (def == null) {
            Optional<T> absent = Optional.absent();
            defs.put(descriptor, absent);
        }
        return def;
    }

    @Override
    public void markValid(DefDescriptor<T> descriptor, T def) {
        super.markValid(descriptor, def);
        defs.put(descriptor, Optional.of(def));
    }

    /**
     * Check if the giving def is stale. Some registries don't support stale
     * checks. Will only check a def once per request
     * 
     * TODO: this has to take things that depend on this def into account
     * #W-689590
     * 
     * This should really be done elsewhere, and will be soon enough....
     * 
     * @return true if this def is stale
     */
    private boolean isStale(T def) {
        AuraContext context = Aura.getContextService().getCurrentContext();
        @SuppressWarnings("unchecked")
        DefDescriptor<T> descriptor = (DefDescriptor<T>) def.getDescriptor();
        if (!context.hasChecked(descriptor)) {
            boolean stale = getLastMod(descriptor) > def.getLocation().getLastModified();
            context.setStaleCheck(descriptor);
            return stale;
        }
        return false;
    }

    protected long getLastMod(DefDescriptor<T> descriptor) {
        return cacheableFactory.getLastMod(descriptor);
    }

    /**
     * Check to see if the definition exists, allowing for cache override.
     */
    @Override
    public boolean exists(DefDescriptor<T> descriptor) {
        Boolean exists = null;
        Optional<T> cached;

        //
        // Only check the cache if we are not avoiding it.
        //
        if (useCache()) {
            exists = existsCache.getIfPresent(descriptor);
            if (exists != null) {
                //
                // If we found our value in the exists cache,
                // just go ahead and short circuit.
                //
                return exists.booleanValue();
            }
            //
            // Now check our cached defs.
            //
            cached = defs.getIfPresent(descriptor);
            if (cached != null) {
                exists = Boolean.valueOf(cached.orNull() != null);
            }
        }
        //
        // If we were not checking cache, we always drop through
        // to the super class. Careful, as this may be far more
        // expensive.
        //
        if (exists == null) {
            exists = Boolean.valueOf(super.exists(descriptor));
        }
        existsCache.put(descriptor, exists);
        return exists.booleanValue();
    }

    /**
     * @return all compiled defs in the cache
     */
    public Collection<Optional<T>> getCachedDefs() {
        return defs.asMap().values();
    }

    @Override
    public void clear() {
        this.defs.invalidateAll();
        this.existsCache.invalidateAll();
    }

    /**
     * clear's caches based on source and event provided
     * (currently does brute force clear)
     * 
     */
    @Override
    public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event) {
        clear();
    }
}
