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
package configuration;

import org.auraframework.adapter.*;
import org.auraframework.impl.*;
import org.auraframework.impl.adapter.*;
import org.auraframework.impl.adapter.format.css.ThemeDefCSSFormatAdapter;
import org.auraframework.impl.adapter.format.css.ThrowableCSSFormatAdapter;
import org.auraframework.impl.adapter.format.html.*;
import org.auraframework.impl.adapter.format.html.embedded.ApplicationDefEmbeddedHTMLFormatAdapter;
import org.auraframework.impl.adapter.format.js.*;
import org.auraframework.impl.adapter.format.json.*;
import org.auraframework.impl.context.*;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.impl.java.type.converter.*;
import org.auraframework.service.*;
import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.PrimaryImpl;

/**
 * AuraConfig This is the spring configuration for the aura module.Provide access to lower level modules (like sfdc)
 * by defining runtime implementations here. This class will be loaded by common.provider.ProviderFactory.
 *
 *
 *
 */
@AuraConfiguration
public class AuraImplConfig {

    @Impl
    public static FormatAdapter<?> actionJSONFormatAdapter(){
        return new ActionJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> applicationDefEmbeddedHTMLFormatAdapter(){
        return new ApplicationDefEmbeddedHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> applicationDefHTMLFormatAdapter(){
        return new ApplicationDefHTMLFormatAdapter();
    }

    @Impl
    @PrimaryImpl
    public static BuilderService builderService() {
        return new BuilderServiceImpl();
    }

    @Impl
    public static ClientService clientService() {
        return new ClientServiceImpl();
    }

    @Impl
    public static ServerService serverService() {
        return new ServerServiceImpl();
    }

    @Impl
    public static FormatAdapter<?> componentHTMLFormatAdapter(){
        return new ComponentHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> applicationHTMLFormatAdapter(){
        return new ApplicationHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> componentDefHTMLFormatAdapter(){
        return new ComponentDefHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> componentDefJSFormatAdapter(){
        return new ComponentDefJSFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> componentDefJSONFormatAdapter(){
        return new ComponentDefJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> componentDefRefJSONFormatAdapter(){
        return new ComponentDefRefJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> componentJSONFormatAdapter(){
        return new ComponentJSONFormatAdapter();
    }

    @Impl
    public static ContextService contextService() {
        return new AuraContextServiceImpl();
    }

    @Impl
    @PrimaryImpl
    public static DefinitionService definitionService() {
        return new DefinitionServiceImpl();
    }

    @Impl
    public static FormatAdapter<?> eventDefJSONFormatAdapter(){
        return new EventDefJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> controllerDefJSONFormatAdapter(){
        return new ControllerDefJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> messageJSONFormatAdapter(){
        return new MessageJSONFormatAdapter();
    }

    @Impl
    @PrimaryImpl
    public static InstanceService instanceService() {
        return new InstanceServiceImpl();
    }

    @Impl
    public static FormatAdapter<?> auraContextHTMLFormatAdapter(){
        return new AuraContextHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> auraContextJSONFormatAdapter(){
        return new AuraContextJSONFormatAdapter();
    }

    @Impl
    public static ConfigAdapter auraImplConfigAdapter(){
        return new ConfigAdapterImpl();
    }

    @Impl
    public static ContextAdapter auraImplContextAdapter(){
        return new ContextAdapterImpl();
    }

    @Impl
    public static GlobalValueProviderAdapter auraImplGlobalValueProviderAdapter() {
        return new GlobalValueProviderAdapterImpl();
    }

    @Impl
    public static LocalizationAdapter auraImplLocalizationAdapter() {
        return new LocalizationAdapterImpl();
    }

    @Impl
    public static LocalizationService auraImplLocalizationService() {
        return new LocalizationServiceImpl();
    }

    @Impl
    public static LoggingAdapter auraImplLoggingAdapter() {
        return new LoggingAdapterImpl();
    }

    @Impl
    public static LoggingService auraImplLoggingService() {
        return new LoggingServiceImpl();
    }

    @Impl
    public static ExceptionAdapter auraImplExceptionAdapter() {
        return new ExceptionAdapterImpl();
    }

    @Impl
    public static RegistryAdapter auraImplRegistryAdapter(){
        return new AuraRegistryProviderImpl();
    }
    /*
    */

    @Impl
    public static PrefixDefaultsAdapter prefixDefaultsAdapter() {
        return new AuraPrefixDefaultsProviderImpl();
    }

    @Impl
    @PrimaryImpl
    public static RenderingService renderingService(){
        return new RenderingServiceImpl();
    }

    @Impl
    @PrimaryImpl
    public static SerializationService serializationService() {
        return new SerializationServiceImpl();
    }

    @Impl
    public static FormatAdapter<?> testSuiteDefHTMLFormatAdapter(){
        return new TestSuiteDefHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> testSuiteDefJSONFormatAdapter(){
        return new TestSuiteDefJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> themeDefCSSFormatAdapter(){
        return new ThemeDefCSSFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> throwableHTMLFormatAdapter(){
        return new ThrowableHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> auraQuickFixExceptionHTMLFormatAdapter(){
        return new AuraQuickFixExceptionHTMLFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> throwableJSFormatAdapter(){
        return new ThrowableJSFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> throwableJSONFormatAdapter(){
        return new ThrowableJSONFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> throwableCSSFormatAdapter(){
        return new ThrowableCSSFormatAdapter();
    }

    @Impl
    public static FormatAdapter<?> clientSideEventExceptionJSONFormatAdapter(){
        return new ClientSideEventExceptionJSONFormatAdapter();
    }

    @Impl
    public static JsonSerializerAdapter auraImplJsonSerializationAdapter() {
        return new JsonSerializerAdapterImpl();
    }


    @Impl
    public static LocalizedConverter<?, ?> LocalizedBigDecimalToStringConverter() {
        return new LocalizedBigDecimalToStringConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedDateOnlyToStringConverter() {
        return new LocalizedDateOnlyToStringConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedDateToStringConverter() {
        return new LocalizedDateToStringConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedIntegerToStringConverter() {
        return new LocalizedIntegerToStringConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToBigDecimalConverter() {
        return new LocalizedStringToBigDecimalConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToDateConverter() {
        return new LocalizedStringToDateConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToDateOnlyConverter() {
        return new LocalizedStringToDateOnlyConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToDoubleConverter() {
        return new LocalizedStringToDoubleConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToIntegerConverter() {
        return new LocalizedStringToIntegerConverter();
    }

    @Impl
    public static LocalizedConverter<?, ?> LocalizedStringToLongConverter() {
        return new LocalizedStringToLongConverter();
    }


}
