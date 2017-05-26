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
package test.org.auraframework.impl.adapter;

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
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import org.apache.log4j.Logger;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.source.AuraResourcesHashingGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.impl.util.BrowserInfo;
import org.auraframework.instance.BaseComponent;
import org.auraframework.modules.ModuleNamespaceAlias;
import org.auraframework.service.ContextService;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.JavascriptGroup;
import org.auraframework.util.resource.CompiledGroup;
import org.auraframework.util.resource.FileGroup;
import org.auraframework.util.resource.ResourceLoader;
import org.auraframework.util.text.GlobMatcher;
import org.auraframework.util.text.Hash;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Sets;
import org.springframework.beans.factory.annotation.Autowired;

@ServiceComponent
public class ConfigAdapterImpl implements ConfigAdapter {
    Logger logger = Logger.getLogger(ConfigAdapterImpl.class);

    private static final String SAFE_EVAL_HTML_URI = "/lockerservice/safeEval.html";

    private static final ImmutableSortedSet<String> cacheDependencyExceptions = ImmutableSortedSet.of(
            //
            // FIXME: these following 16 lines (applauncher) should be removed ASAP. They are here because
            // we do not detect file backed apex, and we probably don't really want to.
            //
            "apex://applauncher.accountsettingscontroller",
            "apex://applauncher.applauncherapexcontroller",
            "apex://applauncher.applauncherdesktopcontroller",
            "apex://applauncher.applauncherheadercontroller",
            "apex://applauncher.applaunchersetupdesktopcontroller",
            "apex://applauncher.applaunchersetupreorderercontroller",
            "apex://applauncher.applaunchersetuptilecontroller",
            "apex://applauncher.appmenu",
            "apex://applauncher.changepasswordcontroller",
            "apex://applauncher.communitylogocontroller",
            "apex://applauncher.employeeloginlinkcontroller",
            "apex://applauncher.forgotpasswordcontroller",
            "apex://applauncher.identityheadercontroller",
            "apex://applauncher.loginformcontroller",
            "apex://applauncher.selfregistercontroller",
            "apex://applauncher.sociallogincontroller",

            "apex://array",
            "apex://aura.component",
            "apex://blob",
            "apex://boolean",
            "apex://date",
            "apex://datetime",
            "apex://decimal",
            "apex://double",
            "apex://event",
            "apex://id",
            "apex://integer",
            "apex://list",
            "apex://long",
            "apex://map",
            "apex://object",
            "apex://set",
            "apex://string",
            "apex://sobject",
            "apex://time"
            );

    private static final String TIMESTAMP_FORMAT_PROPERTY = "aura.build.timestamp.format";
    private static final String TIMESTAMP_PROPERTY = "aura.build.timestamp";
    private static final String VERSION_PROPERTY = "aura.build.version";
    private static final String VALIDATE_CSS_CONFIG = "aura.css.validate";

    private final Map<String, String> SYSTEM_NAMESPACES = new ConcurrentHashMap<>();
    private final Map<String, Boolean> CANONICAL_NAMESPACES = new ConcurrentHashMap<>();
    private final Map<String, Boolean> PRIVILEGED_NAMESPACES = new ConcurrentHashMap<>();

    private volatile Set<String> CANONICAL_IMMUTABLE = Sets.newTreeSet();
    private volatile Set<String> PRIVILEGED_IMMUTABLE = Sets.newTreeSet();

    private final Set<String> UNSECURED_PREFIXES = new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER).add("aura", "layout").build();

    private final Set<String> UNDOCUMENTED_NAMESPACES = new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER).add("auradocs").build();

    private final Set<String> CACHEABLE_PREFIXES = ImmutableSet.of("aura", "java", "compound");

    private final Set<String> moduleNamespaces = Sets.newHashSet();
    private final Map<String, String> moduleNamespaceAliases = Maps.newConcurrentMap();

    protected final Set<Mode> allModes = EnumSet.allOf(Mode.class);
    private JavascriptGroup jsGroup;
    private FileGroup resourcesGroup;
    private String jsUid = "";
    private String resourcesUid = "";
    private String fwUid = "";
    private ResourceLoader resourceLoader;
    private Long buildTimestamp;
    private String auraVersionString;
    private boolean lastGenerationHadCompilationErrors = false;
    private boolean validateCss;

    @Inject
    private LocalizationAdapter localizationAdapter;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private ContextService contextService;

    @Inject
    private FileMonitor fileMonitor;

    @Inject
    private CSPInliningService cspInliningService;

    private String resourceCacheDir;

    public ConfigAdapterImpl() {
        this(IOUtil.newTempDir("auracache"));
    }

    /**
     * For extension only, if you use this to create an instance, your services won't be setup.
     * @param resourceCacheDir
     */
    public ConfigAdapterImpl(final String resourceCacheDir) {
        this.resourceCacheDir = resourceCacheDir;
    }

    public ConfigAdapterImpl(String resourceCacheDir, LocalizationAdapter localizationAdapter, InstanceService instanceService, ContextService contextService, FileMonitor fileMonitor) {
        this.resourceCacheDir = resourceCacheDir;
        this.localizationAdapter = localizationAdapter;
        this.instanceService = instanceService;
        this.contextService = contextService;

        this.fileMonitor = fileMonitor;
    }

    @PostConstruct
    public void initialize() {
        // can this initialization move to some sort of common initialization delay?
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

        Properties props = null;
        try {
            props = loadProperties();
            auraVersionString = props.getProperty(VERSION_PROPERTY);
        } catch (AuraError t) {
            auraVersionString = "development";
        }
        if (props != null) {
            buildTimestamp = readBuildTimestamp(props);
        } else {
            buildTimestamp = System.currentTimeMillis();
        }

        if (auraVersionString == null || auraVersionString.isEmpty()) {
            throw new AuraError("Unable to read build version from version.prop file");
        }

        Properties config = loadConfig();
        String validateCssString = config.getProperty(VALIDATE_CSS_CONFIG);
        validateCss = AuraTextUtil.isNullEmptyOrWhitespace(validateCssString)
                || Boolean.parseBoolean(validateCssString.trim());

        contextService.registerGlobal("isVoiceOver", true, false);
        contextService.registerGlobal("dynamicTypeSize", true, "");

        if (!isProduction()) {
            fileMonitor.start();
        }
        contextService.registerGlobal("isVoiceOver", true, false);
        contextService.registerGlobal("dynamicTypeSize", true, "");
    }

    protected FileGroup newAuraResourcesHashingGroup() throws IOException {
        return new AuraResourcesHashingGroup(fileMonitor, true);
    }

    @Override
    public boolean isTestAllowed() {
        return !isProduction();
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
    public boolean isInternalNamespace(String namespace) {
        return namespace != null && SYSTEM_NAMESPACES.containsKey(namespace.toLowerCase());
    }

    @Override
    public Set<String> getInternalNamespaces(){
        synchronized (CANONICAL_NAMESPACES) {
            return CANONICAL_IMMUTABLE;
        }
    }

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        return namespace != null && PRIVILEGED_NAMESPACES.containsKey(namespace);
    }

    @Override
    public Set<String> getPrivilegedNamespaces(){
        synchronized (PRIVILEGED_NAMESPACES) {
            return PRIVILEGED_IMMUTABLE;
        }
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
                        logger.info(f);
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

    /**
     * Determines whether to use normalize.css or resetCSS.css or nothing.
     *
     * @return URL to reset css file
     */
    @Override
    public String getResetCssURL() {
        AuraContext context = contextService.getCurrentContext();
        String contextPath = context.getContextPath();
        String uid = context.getFrameworkUID();
        String resetCss = "resetCSS.css";
        try {
            DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
            if (appDesc != null) {
                BaseComponentDef templateDef = definitionService.getDefinition(appDesc).getTemplateDef();
                if (templateDef.isTemplate()) {
                    BaseComponent<?, ?> template = (BaseComponent<?, ?>) instanceService.getInstance(templateDef);
                    String auraResetStyle=getTemplateValue(template,"auraResetStyle");
                    switch(auraResetStyle){
                        case "reset":
                            resetCss="resetCSS.css";
                            break;
                        case "normalize":
                            resetCss="normalize.css";
                            break;
                        default:
                            return null;
                    }
                }
            }
        } catch (QuickFixException qfe) {
            resetCss+="?error";
            // ignore and use default resetCSS.css
        }
        return String.format("%s/auraFW/resources/%s/aura/%s", contextPath, uid, resetCss);
    }

    /**
     * FIXME: HACK: DELETEME: W-2540157
     *
     * The evaluated value for attribute returns the default value (false) if current
     * template does not <aura:set attribute="myAttribute" />. This is incorrect if
     * the current template extends a template that has [attribute] set to true.
     *
     * This workaround recurses through PropertyReference values until a value provider template
     * provides a set value or it reaches the base component which we will use the default value.
     */
    private String getTemplateValue(BaseComponent<?, ?> template, String attribute) throws QuickFixException {
        Object attributeValue;
        if (template.getSuper() != null && definitionService.getDefinition(template.getSuper().getDescriptor()).isTemplate()) {
            template = template.getSuper();
            attributeValue=template.getAttributes().getRawValue(attribute);
        }else{
            attributeValue=template.getAttributes().getValue(attribute);
        }
        if (attributeValue != null) {
            if (attributeValue instanceof PropertyReference) {
                return getTemplateValue(template,attribute);
            } else {
                return (String) attributeValue;
            }
        }
        return "";
    }

    @Override
    public String getCurrentTimezone() {
        AuraLocale al = localizationAdapter.getAuraLocale();
        return al.getTimeZone().getID();
    }

    @Override
    public String getAuraJSURL() {
        AuraContext context = contextService.getCurrentContext();
        String contextPath = context.getContextPath();
        String suffix = context.getMode().getJavascriptMode().getSuffix();
        String nonce = context.getFrameworkUID();
        return String.format("%s/auraFW/javascript/%s/aura_%s.js", contextPath, nonce, suffix);
    }

    @Override
    public String getLockerWorkerURL() {
        AuraContext context = contextService.getCurrentContext();
        String contextPath = context.getContextPath();
        String nonce = context.getFrameworkUID();
        return String.format("%s/auraFW/resources/%s" + SAFE_EVAL_HTML_URI, contextPath, nonce);
    }

    /**
     * Returns default aura url for encryption key
     */
    @Override
    public String getEncryptionKeyURL(Boolean jsFormat) {
        AuraContext context = contextService.getCurrentContext();
        String encodedContext = context.getEncodedURL(AuraContext.EncodingStyle.Normal);
        String contextPath = context.getContextPath();
        return String.format("%s/l/%s/app.encryptionkey" + (jsFormat ? ".js" : ""), contextPath, encodedContext);
    }

    /**
     * Returns default aura encryption key. Key needs to be either 16 or 32 characters in length for AES
     * @return default aura key
     */
    @Override
    public String getEncryptionKey() {
        return "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]";
    }

    @Override
    public String generateJwtToken() {
        return "TESTJWT";
    }

    @Override
    public boolean validateGetEncryptionKey(String ssid) {
        return true;
    }

    @Override
    public boolean validateBootstrap(String jwtToken) {
        String expected = generateJwtToken();
        return expected.equals(jwtToken);
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
        return this.isProduction() ? Mode.PROD : Mode.DEV;
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
        return new AuraJavascriptGroup(fileMonitor, true);
    }

    @Override
    public boolean validateCss() {
        return validateCss;
    }

    @Override
    public final String getAuraFrameworkNonce() {
        regenerateAuraJS();
        try {
            // framework nonce now consists of Aura JS and resources files (CSS and JS) and if locker service is enabled
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
    public void addInternalNamespace(String namespace) {
        if(namespace != null && !namespace.isEmpty()){
            SYSTEM_NAMESPACES.put(namespace.toLowerCase(), namespace);
            CANONICAL_NAMESPACES.put(namespace, Boolean.TRUE);
            synchronized (CANONICAL_NAMESPACES) {
                CANONICAL_IMMUTABLE = ImmutableSortedSet.copyOf(CANONICAL_NAMESPACES.keySet());
            }
        }
    }

    @Override
    public void removeInternalNamespace(String namespace) {
        SYSTEM_NAMESPACES.remove(namespace.toLowerCase());
        CANONICAL_NAMESPACES.remove(namespace);
        synchronized (CANONICAL_NAMESPACES) {
            CANONICAL_IMMUTABLE = ImmutableSortedSet.copyOf(CANONICAL_NAMESPACES.keySet());
        }
    }

    @Override
    public Map<String, String> getInternalNamespacesMap() {
        return ImmutableMap.copyOf(SYSTEM_NAMESPACES);
    }

    @Override
    public void addPrivilegedNamespace(String namespace) {
        if(namespace != null && !namespace.isEmpty()){
            PRIVILEGED_NAMESPACES.put(namespace, Boolean.TRUE);
            synchronized (PRIVILEGED_NAMESPACES) {
                PRIVILEGED_IMMUTABLE = ImmutableSortedSet.copyOf(PRIVILEGED_NAMESPACES.keySet());
            }
        }
    }

    @Override
    public void removePrivilegedNamespace(String namespace) {
        PRIVILEGED_NAMESPACES.remove(namespace);
        synchronized (PRIVILEGED_NAMESPACES) {
            PRIVILEGED_IMMUTABLE = ImmutableSortedSet.copyOf(PRIVILEGED_NAMESPACES.keySet());
        }
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
     * This default implementation of {@link ConfigAdapter#getContentSecurityPolicy}
     * will return a default ContentSecurityPolicy object.
     */
    @Override
    public ContentSecurityPolicy getContentSecurityPolicy(String app, HttpServletRequest request) {
        // For some (too many!) URIs, we allow inline style.  Note that the request has already gone
        // through {@link AuraRewriteFilter}, so its URI may be surprising.
        boolean allowInline = false;  // unless we know we should, we don't want inlines
        String format = request.getParameter("aura.format");
        if ("HTML".equals(format)) {
            String defType = request.getParameter("aura.deftype");
            if ("APPLICATION".equals(defType) || "COMPONENT".equals(defType)) {
                allowInline = !isLockerServiceEnabled();
            }
        } else {
            allowInline = isSafeEvalWorkerURI(request.getRequestURI());
        }

        return new DefaultContentSecurityPolicy(allowInline, cspInliningService);
    }

    public void setLocalizationAdapter(LocalizationAdapter adapter) {
        this.localizationAdapter = adapter;
    }

    public void setContextService(ContextService service) {
        this.contextService = service;
    }

    public void setFileMonitor(FileMonitor fileMonitor) {
        this.fileMonitor = fileMonitor;
    }

    @Override
    public boolean isLockerServiceEnabled() {
        return true;
    }

    @Override
    public boolean isStrictCSPEnforced() {
        return true;
    }

    @Override
    public boolean requireLocker(RootDefinition def) {
        boolean requireLocker = !isInternalNamespace(def.getDescriptor().getNamespace());
        if (!requireLocker) {
            DefDescriptor<InterfaceDef> requireLockerDescr = definitionService.getDefDescriptor("aura:requireLocker", InterfaceDef.class);

            try {
                requireLocker = def.isInstanceOf(requireLockerDescr);
            } catch (QuickFixException e) {
                throw new AuraRuntimeException(e);
            }
        }

        return requireLocker;
    }

    @Override
    public String getLockerServiceCacheBuster() {
        return isLockerServiceEnabled() ? "Y" : "N";
    }

    protected boolean isSafeEvalWorkerURI(String uri) {
        return uri.endsWith(SAFE_EVAL_HTML_URI);
    }

    /**
     * Return true if the namespace of the provided descriptor supports caching.
     */
    @Override
    public boolean isCacheable(DefRegistry registry, DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return false;
        }
        // test cacheDependencyExceptions (like static types in Apex)
        String descriptorName = descriptor.getQualifiedName().toLowerCase();

        // truncate array markers
        if (descriptorName.endsWith("[]")) {
            descriptorName = descriptorName.substring(0, descriptorName.length() - 2);
        }
        if (cacheDependencyExceptions.contains(descriptorName)) {
            return true;
        }
        if (registry != null && !registry.isCacheable()) {
            return false;
        }
        String prefix = descriptor.getPrefix();
        String namespace = descriptor.getNamespace();
        return isCacheable(prefix, namespace);
    }

    /**
     * Return true if the descriptor filter meets all requirements for the result of find to be cached
     */
    @Override
    public boolean isCacheable(DescriptorFilter filter) {
        GlobMatcher p = filter.getPrefixMatch();
        String prefix = ((p.isConstant()) ? p.toString() : null);

        GlobMatcher ns = filter.getNamespaceMatch();
        String namespace = ((ns.isConstant()) ? ns.toString() : null);

        return (prefix != null || namespace != null) && isCacheable(prefix, namespace);
    }

    /**
     * Return true if the namespace supports cacheing
     */
    private boolean isCacheable(String prefix, String namespace) {
        boolean cacheable = false;
        if (namespace == null) {
            if (prefix == null) {
                cacheable = false;
            } else {
                cacheable = isCacheablePrefix(prefix);
            }
        } else if (prefix == null) {
            cacheable = isInternalNamespace(namespace);
        } else {
            cacheable = isCacheablePrefix(prefix) || isInternalNamespace(namespace);
        }
        return cacheable;
    }

    @Override
    public int getMaxParallelXHRCount() {
        // 4 for mobile, 6 for desktop
        AuraContext context = contextService.getCurrentContext();
        String ua = context != null ? context.getClient().getUserAgent() : null;
        BrowserInfo b = new BrowserInfo(ua);
        return b.isBrowserMobile() ? 4 : 6;
    }

    @Override
    public boolean getXHRExclusivity() {
        return false;
    }

    @Override
    public String getSessionCacheKey() {
        // return a static session key here, to ensure we always cache unless overriden.
        return "aura.sessionCacheKey";
    }

    @Override
    public boolean isModulesEnabled() {
        return true;
    }

    @Override
    public Set<String> getModuleNamespaces() {
        return ImmutableSet.copyOf(this.moduleNamespaces);
    }

    @Override
    public void addModuleNamespaces(Set<String> namespaces) {
        this.moduleNamespaces.addAll(namespaces);
    }

    @Override
    public boolean cdnEnabled() {
        return false;
    }

    @Override
    public Map<String, String> getModuleNamespaceAliases() {
        return ImmutableMap.copyOf(this.moduleNamespaceAliases);
    }

    @Autowired(required = false)
    public void setModuleNamespaceAliases(List<ModuleNamespaceAlias> aliases) {
        for(ModuleNamespaceAlias ns : aliases) {
            this.moduleNamespaceAliases.put(ns.target(), ns.alias());
        }
    }

}
