package $package;

import junit.framework.TestCase;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;

/**
 * Test to verify HTTP response of generated simple aura application
 */
public class AppTest extends TestCase {

    public AppTest() {
        super();
    }

    public AppTest(String name) {
        super(name);
    }

    public void testApp() throws Exception {
        DefaultHttpClient http = new DefaultHttpClient();
        HttpGet get = new HttpGet("http://localhost:8080/${artifactId}/${artifactId}.app");

        HttpParams params = get.getParams();
        HttpClientParams.setRedirecting(params, true);
        HttpResponse response = http.execute(get);

        assertEquals("Failed to load project home page", HttpStatus.SC_OK, response.getStatusLine().getStatusCode());

        HttpEntity entity = response.getEntity();
        if (entity == null) {
            fail("Project page should have response");
        } else {
            assertTrue("Hello response is wrong", EntityUtils.toString(entity).contains("hello web, from the Aura sample app ${artifactId}"));
        }
    }
}
