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
package org.auraframework.impl.adapter;

import java.io.*;
import java.net.MalformedURLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

public class ConfigAdapterImpl implements ConfigAdapter{

    private static final String TIMESTAMP_FORMAT_PROPERTY = "aura.build.timestamp.format";
    private static final String TIMESTAMP_PROPERTY = "aura.build.timestamp";
    private static final String VERSION_PROPERTY = "aura.build.version";
    private static final String VALIDATE_CSS_CONFIG = "aura.css.validate";

    protected final Set<Mode> allModes = EnumSet.allOf(Mode.class);
    private final AuraJavascriptGroup jsGroup;
    private final ResourceLoader resourceLoader;
    private final Long buildTimestamp;
    private String auraVersionString;
    private boolean lastGenerationHadCompilationErrors = false;
    private final boolean validateCss;


    public ConfigAdapterImpl(){
        this(getDefaultCacheDir());
    }

    private static String getDefaultCacheDir(){
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        return new File(tmpDir, "auraResourceCache").getAbsolutePath();

    }

    protected ConfigAdapterImpl(String resourceCacheDir) {
        // can this initialization move to some sort of common initialization dealy?
        AuraJavascriptGroup tempGroup = null;
        try {
            tempGroup = newAuraJavascriptGroup();
            try{
                tempGroup.parse();
            } catch (IOException x) {
                throw new AuraError("Unable to initialize aura client javascript", x);
            }
            tempGroup.postProcess();
        } catch (IOException x) {
            // js source wasn't found, we must be in jar land, just let the files be accessed from there
        }
        jsGroup = tempGroup;

        try {
            this.resourceLoader = new ResourceLoader(resourceCacheDir, true);
        } catch (MalformedURLException e) {
            throw new AuraRuntimeException(e);
        }

        Properties props = (jsGroup == null) ? loadProperties() : null;
        if (props == null) {
            // If we don't get the framework version from properties, the
            // default is a development build:
            auraVersionString = "development";
            buildTimestamp = System.currentTimeMillis();
        } else {
            // If we do get our version info from properties, then try to do that.
            auraVersionString = props.getProperty(VERSION_PROPERTY);
            if (auraVersionString == null || auraVersionString.isEmpty()) {
                throw new AuraError("Unable to read build version from version.prop file");
            }
            
            buildTimestamp = readBuildTimestamp(props);
        }
        
        Properties config = loadConfig();
        String validateCssString = config.getProperty(VALIDATE_CSS_CONFIG);
        validateCss = AuraTextUtil.isNullEmptyOrWhitespace(validateCssString) || Boolean.parseBoolean(validateCssString.trim());

    }

    @Override
    public Set<Mode> getAvailableModes() {
        return allModes;
    }

    @Override
    public String getCSRFToken() {
        return "aura";
    }

    @Override
    public String getJiffyCSSURL() {
        return "/auraFW/resources/jiffy/Jiffy.css";
    }

    @Override
    public String getJiffyJSURL() {
        return "/auraFW/resources/jiffy/Jiffy.js";
    }

    @Override
    public String getJiffyUIJSURL() {
        return "/auraFW/resources/jiffy/JiffyUi.js";
    }

    @Override
    public synchronized void regenerateAuraJS() {
        if (!isProduction() && jsGroup != null && (jsGroup.isStale() || lastGenerationHadCompilationErrors)) {
            try {
                File dest = AuraImplFiles.AuraResourceJavascriptDirectory.asFile();
                File resourceDest = AuraImplFiles.AuraResourceJavascriptClassDirectory.asFile();
                jsGroup.regenerate(dest);
                // now we have to copy the new files to the resource directory
                File[] destFiles = dest.listFiles(JS_ONLY);
                if (destFiles != null) {
                    for (File f : destFiles) {
                        InputStream is = new FileInputStream(f);
                        OutputStream os = new FileOutputStream(new File(resourceDest, f.getName()));
                        IOUtil.copyStream(is, os);
                        getResourceLoader().refreshCache("aura/javascript/"+f.getName());

                        is.close();
                        os.close();
                    }
                }
            	lastGenerationHadCompilationErrors = false;                
            } catch (Exception x) {
            	lastGenerationHadCompilationErrors = true; 
                throw new AuraRuntimeException("Unable to regenerate aura javascript", x);

            }
        }
    }

    @Override
    public String getAuraJSURL() {
        String suffix = Aura.getContextService().getCurrentContext().getMode().getJavascriptMode().getSuffix();
        return String.format("/auraFW/javascript/%d/aura_%s.js", getAuraJSLastMod(), suffix);
    }

    @Override
    public long getAuraJSLastMod() {
        regenerateAuraJS();
        return jsGroup != null ? jsGroup.getLastMod() : getBuildTimestamp();
    }

    @Override
    public void validateCSRFToken(String token) {}

    @Override
    public boolean isProduction() {
        return Boolean.parseBoolean(System.getProperty("aura.production"));
    }

    @Override
    public boolean isClientAppcacheEnabled() {
        return !Boolean.parseBoolean(System.getProperty("aura.noappcache"));
    }

    @Override
    public boolean isSysAdmin() {
        return false;
    }

    private static final FileFilter JS_ONLY = new FileFilter() {
        @Override
        public boolean accept(File pathname) {
            return pathname.isFile() && pathname.getName().endsWith(".js");
        }
    };

    private static final String MAVEN_TIMESTAMP_PROPERTY = "${maven.build.timestamp}";

    @Override
    public ResourceLoader getResourceLoader() {
        return resourceLoader;
    }

    @Override
    public Mode getDefaultMode() {
        return Aura.getConfigAdapter().isProduction() ? Mode.PROD : Mode.DEV;
    }
    
    private Properties loadProperties() {
        
        Properties props = new Properties();
        try{
            loadProperties("/version.prop", props);

        } catch (IOException e) {
            throw new AuraError("Could not read version.prop information");
        }
        return props;
    }
    
    private Properties loadConfig(){
        Properties props = new Properties();
        try{
            loadProperties("/aura.conf", props);
        } catch (IOException e) {
            //ignore
        }
        return props;
    }

    private Properties loadProperties(String path, Properties props) throws IOException {
        InputStream stream = this.resourceLoader.getResourceAsStream(path);
        if (stream == null) {
            return null;
        }
        props.load(stream);
        stream.close();
        return props;
    }

    private Long readBuildTimestamp(Properties props) {
        String timestamp = (String) props.get(TIMESTAMP_PROPERTY);
        String timestampFormat = (String) props.get(TIMESTAMP_FORMAT_PROPERTY);
        if(timestamp == null || timestamp.isEmpty() || timestampFormat == null
                || timestampFormat.isEmpty()) {
            throw new AuraError(String.format("Couldn't find %s or %s",
                    TIMESTAMP_PROPERTY, TIMESTAMP_FORMAT_PROPERTY));
        }
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(timestampFormat);
        simpleDateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        try {
            if (MAVEN_TIMESTAMP_PROPERTY.equals(timestamp)) {
                // We're in an Eclipse-only or similar environment: Maven didn't filter version.prop
                return System.currentTimeMillis();
            }
            return simpleDateFormat.parse(timestamp).getTime();
        } catch (ParseException e) {
            throw new AuraError("Couldn't parse timestamp " + timestamp, e);
        }
    }

    @Override
    public long getBuildTimestamp(){
        return buildTimestamp;
    }

    @Override
    public String getAuraVersion() {
        return auraVersionString;
    }

    @Override
    public boolean isAuraJSStatic(){
        return jsGroup == null;
    }

    /**
     * Creates a new Javascript group.  This method exists to allow tests to override, so they can
     * substitute e.g. an AuraJavascriptGroup that experiences synthetic errors.
     */
    protected AuraJavascriptGroup newAuraJavascriptGroup() throws IOException {
        return new AuraJavascriptGroup();
    }

    @Override
    public boolean validateCss() {
        return validateCss;
    }
}
