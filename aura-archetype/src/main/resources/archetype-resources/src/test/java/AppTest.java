package $package;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

/**
 * Test to verify HTTP response of generated simple aura application
 */
public class AppTest {

    @Test
    public void testApp() throws Exception {
        DefaultHttpClient http = new DefaultHttpClient();
        HttpGet get = new HttpGet("http://localhost:8080/example/${artifactId}.app");

        HttpParams params = get.getParams();
        HttpClientParams.setRedirecting(params, true);
        HttpResponse response = http.execute(get);

        assertEquals("Failed to load project home page", HttpStatus.SC_OK, response.getStatusLine().getStatusCode());

        HttpEntity entity = response.getEntity();
        String contents = EntityUtils.toString(entity);
        if (entity == null) {
            fail("Project page should have response");
        } else {
            assertFalse("Error on the page", contents.contains("class=\" auraForcedErrorBox\""));
        }
    }
}
