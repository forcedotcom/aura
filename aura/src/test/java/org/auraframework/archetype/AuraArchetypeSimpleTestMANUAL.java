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
package org.auraframework.archetype;

import java.io.*;
import java.net.ConnectException;
import java.net.ServerSocket;
import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.IOUtil;

import org.apache.commons.httpclient.*;
import org.apache.commons.httpclient.methods.GetMethod;

import com.google.common.collect.ImmutableList;

/**
 * Tests for using simple archetype. Note: These won't pass in Eclipse JUnit runner due to lack of privileges when
 * starting Jetty. Also, the tests will fail the first few times running on a particular machine since mvn will have to
 * download dependencies not yet stored in the local repository, and this will differ in the process output.
 *
 *
 * @since 0.0.178
 */
@UnAdaptableTest
public class AuraArchetypeSimpleTestMANUAL extends UnitTestCase {
    private static class MavenArtifact {
        private String artifactId;
        private String groupId;
        private String version;

        private MavenArtifact(String groupId, String artifactId, String version) {
            this.artifactId = artifactId;
            this.groupId = groupId;
            this.version = version;
        }
    }

    private final static String ARCHETYPE_VERSION = "1.2.001";
    private final static String END_BUILD = "BUILD SUCCESS";
    private final static String archRepo = "http://maven.auraframework.org/repo";
    private final static String archCatalog = "http://maven.auraframework.org/libs-release-local/archetype-catalog.xml";
    private MavenArtifact archetype;
    private MavenArtifact project;
    private String projectPackage;
    private File workspace;

    public AuraArchetypeSimpleTestMANUAL(String name) {
        this(AuraArchetypeSimpleTestMANUAL.class.getName(), name, new MavenArtifact("org.auraframework.aura-archetypes",
                "aura-archetype-simple", ARCHETYPE_VERSION), new MavenArtifact("myGroupId", "myArtifactId", "1.0-SNAPSHOT"), ".");
    }

    private AuraArchetypeSimpleTestMANUAL(String name, String testMethod, MavenArtifact archetype, MavenArtifact project,
            String projectPackage) {
        super(testMethod);
        this.archetype = archetype;
        this.project = project;
        this.projectPackage = projectPackage;
    }

    public void testProjectCreation() throws Throwable {
        Process jettyProcess = null;
        workspace = new File(System.getProperty("java.io.tmpdir") + File.separator + getName()
                + System.currentTimeMillis());
        try {
            // create a workspace to place the project files in
            workspace.mkdirs();

            // generate a project from the archetype
            Process genProcess = startProcess(workspace, ImmutableList.of("mvn", "archetype:generate",
                    "-DarchetypeRepository=" + archRepo, "-DarchetypeCatalog=" + archCatalog, "-DarchetypeGroupId="
                            + archetype.groupId, "-DarchetypeArtifactId=" + archetype.artifactId, "-DarchetypeVersion="
                            + archetype.version, "-DgroupId=" + project.groupId, "-DartifactId=" + project.artifactId,
                    "-Dversion=" + project.version, "-Dpackage=" + projectPackage, "-DinteractiveMode=false"));
            goldMavenOutput(genProcess, "-creation.txt", "Failed to generate artifact!");

            File projectDir = new File(workspace, project.artifactId);
            assertDirectory(projectDir);
            verifyGeneratedResources(projectDir);

            // build the new project
            Process buildProcess = startProcess(projectDir, ImmutableList.of("mvn", "install"));
            goldMavenOutput(buildProcess, "-install.txt", "Failed to build new project!");

            // get a free port for jetty
            ServerSocket socket = new ServerSocket(0);
            int jettyPort = socket.getLocalPort();
            socket.close();

            // start up jetty
            jettyProcess = startProcess(projectDir, ImmutableList.of("mvn", "jetty:run", "-Djetty.port=" + jettyPort));

            // request default until request not refused
            HostConfiguration hostConfig = new HostConfiguration();
            hostConfig.setHost("localhost", jettyPort);
            HttpClient http = new HttpClient();
            http.setHostConfiguration(hostConfig);
            http.getHttpConnectionManager().getParams().setConnectionTimeout(2000);
            http.getParams().setSoTimeout(2000);
            GetMethod get = new GetMethod("/");
            int status = 0;
            for (int i = 0; i < 30; i++) {
                try {
                    status = http.executeMethod(get);
                    break;
                } catch (ConnectException ce) {
                    // expected, before server is listening
                    Thread.sleep(1000);
                }
            }
            assertEquals("Failed to connect to server", HttpStatus.SC_OK, status);

            verifyDefaultDocument(http);
            verifySampleComponents(http);
        } catch (Throwable t) {
            // if any errors in Jetty requests, let's print out the Jetty console output for diag before killing the
            // test
            if (jettyProcess != null) {
                InputStream is = jettyProcess.getInputStream();
                int len = is.available();
                byte[] buf = new byte[len];
                is.read(buf);
                System.err.println(new String(buf));
            }
            throw t;
        } finally {
            // kill Jetty
            if (jettyProcess != null) {
                try {
                    jettyProcess.exitValue();
                } catch (IllegalThreadStateException e) {
                    jettyProcess.destroy();
                }
            }
            // cleanup generated workspace
            IOUtil.delete(workspace);
        }
    }

    private void verifyGeneratedResources(File projectDir) throws Exception {
        // assertDirectory(new File(projectDir, "src/main/java/org/auraframework"));
        goldFileText(IOUtil.readText(new FileReader(new File(projectDir, "pom.xml"))), "-pom.xml");
        goldFileText(IOUtil.readText(new FileReader(new File(projectDir, String.format(
                "src/main/webapp/WEB-INF/components/%1$s/%1$s/%1$s.app", project.artifactId)))), "-sample.app");
    }

    private void verifyDefaultDocument(HttpClient http) throws Exception {
        GetMethod get = new GetMethod("/");
        assertEquals("Failed requesting default doc", HttpStatus.SC_OK, http.executeMethod(get));
        String response = get.getResponseBodyAsString().replaceAll("\\s", "");
        assertEquals("Unexpected default doc content",
                String.format("<script>window.location=\"/%s/%1$s.app\";</script>", project.artifactId), response);
    }

    private void verifySampleComponents(HttpClient http) throws Exception {
        GetMethod get = new GetMethod(String.format("/%1$s/%1$s.app", project.artifactId));
        assertEquals("Failed requesting sample app", HttpStatus.SC_OK, http.executeMethod(get));
        String body = get.getResponseBodyAsString();

        // strip lastmod values
        body = body.replaceFirst(" data-lm=\"[^\"]+\"", "");
        body = body.replaceFirst("lastmod%22%3A%22\\d+", "");

        goldFileText(body, "-sample.html");
    }

    private Process startProcess(File workingDir, List<String> command) throws Exception {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workingDir);
        builder.redirectErrorStream(true);
        return builder.start();
    }

    private void goldMavenOutput(Process process, String suffix, String description) throws Exception {
        int status = process.waitFor();
        String output = IOUtil.readText(new InputStreamReader(process.getInputStream()));
        if (status != 0) {
            fail(description + "  Process output:\n" + output);
        }
        int index = output.lastIndexOf(END_BUILD);
        if (index >= 0) {
            output = output.substring(0, index);
        }
        // ignore path refs
        output = output.replace(workspace.getAbsolutePath(), "TEMPDIR");

        // ignore download progress updates
        output = output.replaceAll("\n(?:\\s*\\d+ .?B)+", "");
        output = output.replaceAll("\\s*Downloading: [^\n]+", "");
        output = output.replaceAll("\\s*Downloaded: [^\n]+", "");
        output = output.replaceAll("\\s*Installing [^\n]+", "");

        goldFileText(output, suffix);
    }

    private void assertDirectory(File file) {
        if (!file.exists()) {
            fail("Directory not found at " + file.getAbsolutePath());
        }
        if (!file.isDirectory()) {
            fail("Expected a directory for " + file.getAbsolutePath());
        }
    }
}
