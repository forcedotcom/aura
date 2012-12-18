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
package org.auraframework.system;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.json.JsonSerializationContext;

/**
 * AuraContext public interface
 */
public interface AuraContext {

    public static enum Mode{

        DEV(true, true, JavascriptGeneratorMode.DEVELOPMENT, true),
        STATS(true, true, JavascriptGeneratorMode.STATS, true),
        UTEST(true, true, JavascriptGeneratorMode.PRODUCTION, true),
        FTEST(true, true, JavascriptGeneratorMode.TESTING, true),
        JSTEST(true, false, JavascriptGeneratorMode.TESTING, false),
        AUTOJSTEST(true, false, JavascriptGeneratorMode.AUTOTESTING, false),
        JSTESTDEBUG(true, true, JavascriptGeneratorMode.TESTINGDEBUG, false),
        AUTOJSTESTDEBUG(true, true, JavascriptGeneratorMode.AUTOTESTINGDEBUG, false),
        PTEST(false, false, JavascriptGeneratorMode.PRODUCTION, true),
        CADENCE(false, false, JavascriptGeneratorMode.PRODUCTION, true),
        PRODDEBUG(false, false, JavascriptGeneratorMode.PRODUCTIONDEBUG, true),
        PROD(false, false, JavascriptGeneratorMode.PRODUCTION, true),
        SELENIUM(true, true, JavascriptGeneratorMode.AUTOTESTING, true),
        SELENIUMDEBUG(true, true, JavascriptGeneratorMode.AUTOTESTINGDEBUG, true);

        private final JavascriptGeneratorMode javascriptMode;
        private final boolean isTestMode;
        private final boolean prettyPrint;
        private final boolean allowLocalRendering;

        private Mode(boolean isTestMode, boolean prettyPrint, JavascriptGeneratorMode jsMode, boolean allowLocalRendering){
            this.isTestMode = isTestMode;
            this.javascriptMode = jsMode;
            this.prettyPrint = prettyPrint;
            this.allowLocalRendering = allowLocalRendering;
        }

        public boolean isTestMode() {
            return isTestMode;
        }

        public boolean prettyPrint() {
            return prettyPrint;
        }

        public boolean allowLocalRendering(){
            return allowLocalRendering;
        }

        /**
         * @return Returns the jsMode.
         */
        public JavascriptGeneratorMode getJavascriptMode() {
            return javascriptMode;
        }
    }

    public static enum Format {
        MANIFEST,
        CSS,
        JS,
        JSON,
        HTML;
    }

    public static enum Access {
        PUBLIC,
        AUTHENTICATED
    }

    /**
     * @return the master def registry
     */
    MasterDefRegistry getDefRegistry();

    /**
     * TODO: should have serialization contexts for any format, this shouldn't be tied to json
     *
     * @return the json serialization context to use
     */
    JsonSerializationContext getJsonSerializationContext();

    /**
     * @return whether the descriptor has been checked for freshness in this thread
     */
    boolean hasChecked(DefDescriptor<?> d);

    /**
     * Sets that the given descriptor was checked for freshness, and so shouldn't be checked again
     *
     * @param d descriptor that was checked
     */
    void setStaleCheck(DefDescriptor<?> d);

    /**
     * @return the current component being processed in the tree (for use by controllers and models)
     */
    BaseComponent<?,?> getCurrentComponent();

    /**
     * Set the current component, so that the components controller can access it

     * @param nextComponent
     * @return the previous component
     */
    BaseComponent<?,?> setCurrentComponent(BaseComponent<?,?> nextComponent);

    /**
     * @return the current action being processed (for use by controllers)
     */
    Action getCurrentAction();

    /**
     * Set the current action, so that the components controller can access it

     * @param nextAction
     * @return the previous action
     */
    Action setCurrentAction(Action nextAction);

    /**
     * Set the current namespace.
     *
     * FIXME: this is an anti-pattern. it is used inside calls to set the current namespace, but
     * is never reset, so it persists in strange and interesting ways. Figure out another way to
     * do this?
     */
    void setCurrentNamespace(String namespace);

    /**
     * Get the current namespace.
     */
    String getCurrentNamespace();

    /**
     * If a qualifiedName for a DefDescriptor of the given type does not
     * include a prefix (apex:// or java://, etc...), this method on the context
     * will be consulted to find out what the default prefix for the given
     * DefType is.
     *
     * @param defType
     * @return The default prefix for the given DefType in this context
     */
    String getDefaultPrefix(DefType defType);

    /**
     * Get the mode of execution.
     *
     * This should be consistent across the entire request.
     */
    Mode getMode();

    /**
     * Shortcut to check if we are running in one of several testing modes.
     * Use {@link #getMode()} to get the specific mode.
     */
    boolean isTestMode();

    /**
     * Set the 'number' of this context.
     *
     * This is used in component ids to guarantee that each global id is unique. This is passed in from
     * the client, and should never be set outside of Aura code during normal operation.
     *
     * @param num The 'number' to use as an ID for this context.
     */
    void setNum(String num);

    /**
     * Get the context 'number'.
     */
    String getNum();

    String getLabel(String section, String name, Object...params);

    /**
     * Namespaces whose defs should be, or have been preloaded on the client.
     *
     * @param preload
     */
    void addPreload(String preload);  

    /**
     * Clear the current set of preloads.
     *
     * This can be used to reset preloads in the case of error, preventing recurrance of
     * any quick fix error.
     */
    void clearPreloads();

    /**
     * get the current set of preloads.
     *
     * By default, the aura and os namespaces are included.
     */
    Set<String> getPreloads();

    Format getFormat();

    Access getAccess();

    Map<ValueProviderType, GlobalValueProvider> getGlobalProviders();

    Map<String, BaseComponent<?,?>> getComponents();

    void registerComponent(BaseComponent<?,?> component);

    int getNextId();

    String getContextPath();

    void setContextPath(String path);

    boolean getSerializePreLoad();

    void setSerializePreLoad(boolean s);

    boolean getSerializeLastMod();

    void setSerializeLastMod(boolean serializeLastMod);

    boolean isPreloading();

    void setPreloading(boolean p);

    /**
     * Check if a descriptor has been preloaded.
     */
    boolean isPreloaded(DefDescriptor<?> descriptor);

    /**
     * Get the application (or component) descriptor.
     *
     * This returns the currently loaded application/component for this context.
     * It can only be a component for non-production mode.
     *
     * @return the component or application (should rarely be null).
     */
    DefDescriptor<? extends BaseComponentDef> getApplicationDescriptor();

    /**
     * Set the application (or component) descriptor.
     *
     * This returns the currently loaded application/component for this context.
     * It can only be a component for non-production mode.
     *
     * @param appDesc the descriptor for the application/component.
     */
    void setApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> appDesc);

    List<Locale> getRequestedLocales();

    void setRequestedLocales(List<Locale> requestedLocales);

    Client getClient();

    void setClient(Client client);

    String getLastMod();

    void setLastMod(String lastMod);
    /**
     * 
     * @param event - Instance of the {@link org.auraframework.instance.Event} to be fired at the client.    
     * @throws Exception - If the {@link org.auraframework.def.EventType} is not APPLICATION or Event object's definition cannot be found. 
     */
    void addClientApplicationEvent(Event event) throws Exception;

    List<Event> getClientEvents();
    
    
}
