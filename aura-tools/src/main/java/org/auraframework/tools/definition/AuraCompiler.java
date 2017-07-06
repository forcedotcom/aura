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
package org.auraframework.tools.definition;

import java.io.File;
import java.util.List;
import java.util.Set;

import org.auraframework.AuraConfiguration;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.service.ContextService;
import org.auraframework.service.RegistryService;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerException;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerLogger;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import test.org.auraframework.impl.adapter.ConfigAdapterImpl;

public abstract class AuraCompiler {
    private static class CommandLineLogger implements RegistrySerializerLogger {
        private void log(String level, CharSequence message, Throwable cause) {
            StringBuffer buffer = new StringBuffer();
            String sep = "";

            buffer.append(level);
            buffer.append(": ");
            if (message != null) {
                buffer.append(message);
                sep = ", ";
            }
            if (cause != null) {
                buffer.append(sep);
                buffer.append(cause.getMessage());
            }
            System.out.println(buffer.toString());
            if (cause != null) {
                cause.printStackTrace(System.out);
            }
        }

        @Override
        public void error(CharSequence loggable) {
            log("ERROR", loggable, null);
        }

        @Override
        public void error(CharSequence loggable, Throwable cause) {
            log("ERROR", loggable, cause);
        }

        @Override
        public void error(Throwable cause) {
            log("ERROR", null, cause);
        }

        @Override
        public void warning(CharSequence loggable) {
            log("WARNING", loggable, null);
        }

        @Override
        public void warning(CharSequence loggable, Throwable cause) {
            log("WARNING", loggable, cause);
        }

        @Override
        public void warning(Throwable cause) {
            log("WARNING", null, cause);
        }

        @Override
        public void info(CharSequence loggable) {
            log("iNFO", loggable, null);
        }

        @Override
        public void info(CharSequence loggable, Throwable cause) {
            log("iNFO", loggable, cause);
        }

        @Override
        public void info(Throwable cause) {
            log("iNFO", null, cause);
        }

        @Override
        public void debug(CharSequence loggable) {
            log("DEBUG", loggable, null);
        }

        @Override
        public void debug(CharSequence loggable, Throwable cause) {
            log("DEBUG", loggable, cause);
        }

        @Override
        public void debug(Throwable cause) {
            log("DEBUG", null, cause);
        }
    }

    @SuppressWarnings("deprecation")
    private static void initDeprecated(AnnotationConfigApplicationContext applicationContext) {
        applicationContext.getBean(org.auraframework.AuraDeprecated.class);
    }

    public static void main(String[] args) throws Throwable {
        CommandLineLogger cll = new CommandLineLogger();
        File componentsDir = new File(args[0]);
        File outputDir = new File(args[1]);
        int i;
        Set<String> ns = Sets.newHashSet();
        for (i = 2; i < args.length; i++) {
            ns.add(args[i]);
        }

        
		List<Class<?>> configurationClasses = Lists.newArrayList(AuraConfiguration.class, ConfigAdapterImpl.class);
		// Look for additional configuration classes
		String classNames = System.getProperty("additionalConfigurationClasses");
		if(classNames!=null){
			for(String className : classNames.split(",")){
				try {
					Class<?> configurationClass = Class.forName(className);
					configurationClasses.add(configurationClass);
				} catch (Throwable t) {
					System.err.println("Failed to load configuration class: " + className);
				}
			}
		}
		
		AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(
				configurationClasses.toArray(new Class<?>[configurationClasses.size()]));

        try {
            Boolean modulesEnabled = Boolean.valueOf(System.getProperty("aura.modules"));
            RegistryService registryService = applicationContext.getBean(RegistryService.class);
            ConfigAdapter configAdapter = applicationContext.getBean(ConfigAdapter.class);
            ContextService contextService = applicationContext.getBean(ContextService.class);
            initDeprecated(applicationContext);
            new RegistrySerializer(registryService, configAdapter, componentsDir, outputDir,
                    ns.toArray(new String [ns.size()]), cll, contextService, modulesEnabled).execute();
        } catch (RegistrySerializerException rse) {
            cll.error(rse.getMessage(), rse.getCause());
            System.exit(1);
        } finally {
            applicationContext.close();
        }
        System.exit(0);
    }
}
