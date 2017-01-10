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
package org.auraframework.modules.impl;

import java.io.File;

/**
 * ModulesCompiler implementation using https://git.soma.salesforce.com/ServerJS/nodeapp
 */
public final class ModulesCompilerServerJS implements ModulesCompiler {

    @Override
    public String compile(File file) throws Exception {
        throw new Error("NYI");
    }
    
    // COMMENTED OUT SO IT COMPILES IN AURA OSS

    /*
    private final byte[] htmlInput;
    private final PdfRenderer renderer;

    public ModulesCompilerServerJS() {
        StringBuilder html = new StringBuilder();
        html.append("<html><head>\n");
        html.append("<script>\n");
        html.append("console.log('RaptorCompilerServerJS');\n");
        html.append("</script>\n");
        html.append("</head>\n");
        html.append("<body><div id='root'/>\n");
        html.append("<script>var module = {};</script>");
        html.append("<script src='/compiler-repl.js'></script>\n");
        html.append("<script src='/inlined-source.js'></script>\n");
        html.append("<script src='/server-js-compile.js'></script>\n");
        html.append("</body>\n");
        html.append("</html>\n");
        htmlInput = html.toString().getBytes();

        renderer = create();
    }

    @Override
    public String compile(File file) throws Exception {
        PdfRenderer.Request request = new PdfRenderer.Request();

        request.maxOutputSizeMb = 10;
        request.maxResourceSizeMb = 10;
        request.maxResourceCount = 10;
        request.pageUrl = "http://www.mytestpage.com"; // arbitrary http
        request.prefetchedResources.put(request.pageUrl + "/compiler-repl.js",
                new StringEntity(getResource(ModulesCompilerUtil.COMPILER_REPL_JS_PATH)));
        request.prefetchedResources.put(request.pageUrl + "/inlined-source.js",
                new StringEntity(generateInlinedSource(file)));
        request.prefetchedResources.put(request.pageUrl + "/server-js-compile.js",
                new StringEntity(getResource(ModulesCompilerUtil.SERVER_JS_COMPILE_PATH)));
        request.prefetchedResources.put(request.pageUrl + "/favicon.ico", new StringEntity("")); // Chrome fetches
                                                                                                 // these.

        request.timeoutMillis = 60 * 1000;
        request.outputFormat = OutputFormat.HTML;
        request.organizationId = "o1";
        request.userId = "u1";

        // Use this if there's asynchronous work and the page shouldn't be captured until after an indicator
        request.jsReady = "scriptReady";

        request.input = new ByteArrayInputStream(htmlInput);
        request.verbose = true;
        CloseableHttpClient unusedClient = HttpClients.createMinimal();
        PdfRenderer.Response response = renderer.render(request, unusedClient);

        String output = response.verboseOutput;
        String error = extractError(output);
        if (error != null) {
            throw new RuntimeException("ModulesCompilerServerJS failed for: " + file.getAbsolutePath() + "\n" + error);
        }

        return extractCode(output);
    }

    private static String extractCode(String output) {
        int start = output.indexOf("--- CODE START ---");
        return output.substring(start + 19, output.indexOf("--- CODE END ---"));
    }

    private static String extractError(String output) {
        int start = output.indexOf("--- ERROR START ---");
        if (start == -1) {
            return null;
        }
        return output.substring(start + 19, output.indexOf("--- ERROR END ---")).trim();
    }

    private static String generateInlinedSource(File file) throws IOException {
        // generates:
        // codes = {};
        // codes.componentPath='{path to .js file} '
        // codes.sourceTmpl=`{.html file contents}`
        // codes.sourceClass=`{.js file contents}`
        String jsPath = file.getAbsolutePath();
        String htmlPath = jsPath.substring(0, jsPath.length() - 2) + "html";

        StringBuilder source = new StringBuilder("codes = {};\n");
        source.append("codes.componentPath='" + jsPath + "';\n");
        source.append("codes.sourceClass=`\n");
        source.append(getResource(jsPath));
        source.append("\n`\ncodes.sourceTemplate=`\n");
        source.append(getResource(htmlPath));
        source.append("\n`\n");

        return source.toString();
    }

    private static String getResource(String path) throws IOException {
        return CharStreams.toString(new InputStreamReader(new FileInputStream(path), Charsets.UTF_8));
    }

    @SuppressWarnings("resource")
    private static PdfRenderer create() {
        NodeAppClient.Config config = new NodeAppClient.Config();
        List<HttpHost> hosts = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            hosts.add(new HttpHost("shared0-nodeapp1-" + i + "-crd.eng.sfdc.net", 8081));
        }
        config.fixedHosts = ImmutableList.copyOf(hosts);
        // config.httpProxy = PdfRendererAsAServiceImpl.getHttpProxy();
        config.httpsHostValidator = (x) -> false;
        config.gacker = new GackInterface() {
            @Override
            public void gack(GenericGackLevel arg0, String arg1, String arg2) {
                gack(arg0, arg1, arg2, new RuntimeException());
            }

            @Override
            public void gack(GenericGackLevel arg0, String arg1, Throwable arg2) {
                gack(arg0, arg1, new RuntimeException(arg2));
            }

            @Override
            public void gack(GenericGackLevel arg0, String arg1, String arg2, Exception arg3) {
                System.err.println("Gack:" + arg0 + " " + arg1 + " " + arg2);
                arg3.printStackTrace(System.err);
            }

        };
        NodeAppClient client = new NodeAppClient(config);
        return client.getPdfRenderer();
    }
    */
}
