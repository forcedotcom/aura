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
package org.auraframework.impl.adapter;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.EnumSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.source.AuraResourcesHashingGroup;
import org.auraframework.impl.source.file.AuraFileMonitor;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.impl.util.BrowserInfo;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.JavascriptGroup;
import org.auraframework.util.resource.CompiledGroup;
import org.auraframework.util.resource.FileGroup;
import org.auraframework.util.resource.ResourceLoader;
import org.auraframework.util.text.Hash;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class ConfigAdapterImpl implements ConfigAdapter {

    private static final String TIMESTAMP_FORMAT_PROPERTY = "aura.build.timestamp.format";
    private static final String TIMESTAMP_PROPERTY = "aura.build.timestamp";
    private static final String VERSION_PROPERTY = "aura.build.version";
    private static final String VALIDATE_CSS_CONFIG = "aura.css.validate";
    
    private static final Set<String> SYSTEM_NAMESPACES = Sets.newHashSet();

    private static final Set<String> UNSECURED_PREFIXES = new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER).add("aura", "layout").build();
    
    private static final Set<String> UNDOCUMENTED_NAMESPACES = new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER).add("auradocs").build();
    
    private static final Set<String> CACHEABLE_PREFIXES = ImmutableSet.of("aura", "java");
    
    protected final Set<Mode> allModes = EnumSet.allOf(Mode.class);
    private final JavascriptGroup jsGroup;
    private final FileGroup resourcesGroup;
    private String jsUid = "";
    private String resourcesUid = "";
    private String fwUid = "";
    private final ResourceLoader resourceLoader;
    private final Long buildTimestamp;
    private String auraVersionString;
    private boolean lastGenerationHadCompilationErrors = false;
    private final boolean validateCss;

    public ConfigAdapterImpl() {
        this(getDefaultCacheDir());
    }

    private static String getDefaultCacheDir() {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        return new File(tmpDir, "auraResourceCache").getAbsolutePath();
    }

    protected ConfigAdapterImpl(String resourceCacheDir) {
        // can this initialization move to some sort of common initialization dealy?
        try {
            this.resourceLoader = new ResourceLoader(resourceCacheDir, true);
        } catch (MalformedURLException e) {
            throw new AuraRuntimeException(e);
        }

        // Framework JS
        JavascriptGroup tempGroup = null;
        try {
            tempGroup = newAuraJavascriptGroup();
            try {
                tempGroup.parse();
            } catch (IOException x) {
                throw new AuraError("Unable to initialize aura client javascript", x);
            }
            tempGroup.postProcess();
        } catch (IOException x) {
            /*
             * js source wasn't found, we must be in jar land, just let the files be accessed from there... however, we
             * do want a hash. Question: hypothetically, could we have a hybrid with a subset of files as files, and the
             * rest in jars? This wouldn't be accounted for here.
             */
            tempGroup = new CompiledGroup(AuraJavascriptGroup.GROUP_NAME, AuraJavascriptGroup.FILE_NAME);
        }
        jsGroup = tempGroup;

        // Aura Resources
        FileGroup tempResourcesGroup;
        try {
            tempResourcesGroup = newAuraResourcesHashingGroup();
            tempResourcesGroup.getGroupHash();
        } catch (IOException e) {
            tempResourcesGroup = new CompiledGroup(AuraResourcesHashingGroup.GROUP_NAME,
                    AuraResourcesHashingGroup.FILE_NAME);
        }
        resourcesGroup = tempResourcesGroup;

        Properties props = (jsGroup == null) ? loadProperties() : null;
        if (props == null) {
            // If we don't get the framework version from properties, the default is a development build:
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
        validateCss = AuraTextUtil.isNullEmptyOrWhitespace(validateCssString)
                || Boolean.parseBoolean(validateCssString.trim());

        if (!isProduction()) {
            AuraFileMonitor.start();
        }

    }

    protected FileGroup newAuraResourcesHashingGroup() throws IOException {
        return new AuraResourcesHashingGroup(true);
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
    public boolean isPrivilegedNamespace(String namespace) {
        return namespace != null && SYSTEM_NAMESPACES.contains(namespace.toLowerCase());
    }

    @Override
    public String getDefaultNamespace() {
        return null;
    }
    
    @Override
    public boolean isUnsecuredPrefix(String prefix) {
        return UNSECURED_PREFIXES.contains(prefix);
    }

    @Override
    public boolean isUnsecuredNamespace(String namespace) {
        // Deprecated stub will be removed once we remove the sfdc core usage
        return false;
    }

    @Override
    public synchronized void regenerateAuraJS() {
        /*
         * If we're missing source, jsGroup will be an AuraResourceGroup and isStale() is always false. If we're in
         * production, we're using the resources too. But if we have source, regenerate from it if it's changed:
         */
        if (!isProduction() && jsGroup != null && (jsGroup.isStale() || lastGenerationHadCompilationErrors)) {
            try {
                Logger logger = Logger.getLogger(ConfigAdapterImpl.class);
                logger.info("Regenerating framework javascript");
                File dest = AuraImplFiles.AuraResourceJavascriptDirectory.asFile();
                File resourceDest = AuraImplFiles.AuraResourceJavascriptClassDirectory.asFile();
                jsGroup.regenerate(dest);
                // now we have to copy the new files to the resource directory
                logger.info("Copying regenerated files to " + resourceDest);
                File[] destFiles = dest.listFiles(JS_ONLY);
                if (destFiles != null && destFiles.length > 0) {
                    resourceDest.mkdirs(); // If we got this far without this directory, just create it.
                    for (File f : destFiles) {
                        InputStream is = new FileInputStream(f);
                        OutputStream os = new FileOutputStream(new File(resourceDest, f.getName()));
                        IOUtil.copyStream(is, os);
                        getResourceLoader().refreshCache("aura/javascript/" + f.getName());

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
    public String getMomentJSURL() {
        String nonce = Aura.getContextService().getCurrentContext().getFrameworkUID();
        String contextPath = Aura.getContextService().getCurrentContext().getContextPath();
        return String.format("%s/auraFW/resources/%s/moment/moment.js", contextPath, nonce);
    }

    @Override
    public String getFastClickJSURL() {
        String nonce = Aura.getContextService().getCurrentContext().getFrameworkUID();
        String contextPath = Aura.getContextService().getCurrentContext().getContextPath();
        return String.format("%s/auraFW/resources/%s/fastclick/fastclick.js", contextPath, nonce);
    }

    @Override
    public List<String> getWalltimeJSURLs() {
        AuraLocale al = Aura.getLocalizationAdapter().getAuraLocale();
        String locale = al.getTimeZone().getID().replace("/", "-");
        String contextPath = Aura.getContextService().getCurrentContext().getContextPath();

        List<String> urls = Lists.newLinkedList();
        String nonce = Aura.getContextService().getCurrentContext().getFrameworkUID();
        if (!"GMT".equals(locale)) {
            urls.add(String.format("%s/auraFW/resources/%s/walltime-js/olson/walltime-data_%s.js", contextPath,
                    nonce, locale));
        }

        urls.add(String.format("%s/auraFW/resources/%s/walltime-js/walltime.js", contextPath, nonce));
        return urls;
    }

    @Override
    public String getHTML5ShivURL() {
        String ret = null;
        AuraContext context = Aura.getContextService().getCurrentContext();
        String ua = context != null ? context.getClient().getUserAgent() : null;
        BrowserInfo b = new BrowserInfo(ua);
        if (b.isIE7() || b.isIE8()) {
            String nonce = context.getFrameworkUID();
            String contextPath = context.getContextPath();
            ret = String.format("%s/auraFW/resources/%s/html5shiv/html5shiv.js", contextPath, nonce);
        }

        return ret;
    }

    @Override
    public String getAuraJSURL() {
        String contextPath = Aura.getContextService().getCurrentContext().getContextPath();
        String suffix = Aura.getContextService().getCurrentContext().getMode().getJavascriptMode().getSuffix();
        String nonce = Aura.getContextService().getCurrentContext().getFrameworkUID();
        return String.format("%s/auraFW/javascript/%s/aura_%s.js", contextPath, nonce, suffix);
    }

    @Override
    public long getAuraJSLastMod() {
        regenerateAuraJS();
        return jsGroup != null ? jsGroup.getLastMod() : getBuildTimestamp();
    }

    @Override
    public void validateCSRFToken(String token) {
    }

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
        try {
            loadProperties("/version.prop", props);
        } catch (IOException e) {
            throw new AuraError("Could not read version.prop information");
        }
        return props;
    }

    private Properties loadConfig() {
        Properties props = new Properties();
        try {
            loadProperties("/aura.conf", props);
        } catch (IOException e) {
            // ignore
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
        if (timestamp == null || timestamp.isEmpty() || timestampFormat == null || timestampFormat.isEmpty()) {
            throw new AuraError(String.format("Couldn't find %s or %s", TIMESTAMP_PROPERTY, TIMESTAMP_FORMAT_PROPERTY));
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
    public long getBuildTimestamp() {
        return buildTimestamp;
    }

    @Override
    public String getAuraVersion() {
        return auraVersionString;
    }

    @Override
    public boolean isAuraJSStatic() {
        return jsGroup == null;
    }

    /**
     * Creates a new Javascript group. This method exists to allow tests to override, so they can substitute e.g. an
     * AuraJavascriptGroup that experiences synthetic errors.
     */
    protected AuraJavascriptGroup newAuraJavascriptGroup() throws IOException {
        return new AuraJavascriptGroup(true);
    }

    @Override
    public boolean validateCss() {
        return validateCss;
    }

    @Override
    public final String getAuraFrameworkNonce() {
        regenerateAuraJS();
        try {
            // framework nonce now consists of Aura JS and resources files (CSS and JS)
            String jsHash = jsGroup.getGroupHash().toString();
            String resourcesHash = getAuraResourcesNonce();

            /*
             * don't want to makeHash every time so store results and return appropriately
             *
             * Be VERY careful here.
             *
             * because fwUid is set along with jsUid and resourcesUid, there is a race condition
             * whereby the condition can fail (i.e. both js & resources match), but fwUid is not
             * yet set. This is very bad, as it causes an empty fwUid, which breaks everyone with
             * a COOS
             */
            synchronized (this) {
                if (!jsHash.equals(this.jsUid) || !resourcesHash.equals(this.resourcesUid)) {
                    this.jsUid = jsHash;
                    this.resourcesUid = resourcesHash;
                    this.fwUid = makeHash(this.jsUid, this.resourcesUid);
                }
            }

            return this.fwUid;

        } catch (IOException e) {
            throw new AuraRuntimeException("Can't read framework files", e);
        }
    }

    protected String makeHash(String one, String two) throws IOException {
        StringReader reader = new StringReader(one + two);
        return new Hash(reader).toString();
    }

    private String getAuraResourcesNonce() {
        try {
            if (!isProduction() && resourcesGroup != null && resourcesGroup.isStale()) {
                resourcesGroup.reset();
            }
            return resourcesGroup.getGroupHash().toString();
        } catch (IOException e) {
            throw new AuraRuntimeException("Can't read Aura resources files", e);
        }
    }

    @Override
    public void addPrivilegedNamespace(String namespace) {
        if(namespace != null && !namespace.isEmpty()){
            SYSTEM_NAMESPACES.add(namespace.toLowerCase());
        }
    }

    @Override
    public void removePrivilegedNamespace(String namespace) {
        SYSTEM_NAMESPACES.remove(namespace.toLowerCase());
    }

    @Override
    public boolean isDocumentedNamespace(String namespace) {
        return !UNDOCUMENTED_NAMESPACES.contains(namespace) && !namespace.toLowerCase().endsWith("test");
    }

    @Override
    public boolean isCacheablePrefix(String prefix) {
        return CACHEABLE_PREFIXES.contains(prefix);
    }

    /**
     * This default implementation of {@link ConfigAdapter#getContentSecurityPolicy(String)}
     * will return a default ContentSecurityPolicy object.
     */
    @Override
    public ContentSecurityPolicy getContentSecurityPolicy(String app, HttpServletRequest request) {
        // For some (too many!) URIs, we allow inline style.  Note that the request has already gone
        // through {@link AuraRewriteFilter}, so its URI may be surprising.
        boolean inlineStyle = false;  // unless we know we should, we don't want inlines
        String format = request.getParameter("aura.format");
        if ("HTML".equals(format)) {
            String defType = request.getParameter("aura.deftype");
            if ("APPLICATION".equals(defType) || "COMPONENT".equals(defType)) {
                inlineStyle = true;  // apps and components allow inlines.  Sigh.
            }
        }
        return new DefaultContentSecurityPolicy(inlineStyle);
    }
}
