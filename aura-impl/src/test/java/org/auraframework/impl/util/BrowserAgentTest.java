package org.auraframework.impl.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

import junit.framework.TestCase;
import junit.framework.TestSuite;

public class BrowserAgentTest extends TestCase {

    public static TestSuite suite() throws Throwable {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        InputStream is = cl.getResourceAsStream("org/auraframework/impl/util/BrowserAgentTest.csv");
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        TestSuite suite = new TestSuite("BrowserAgentTestSuite");
        try {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                StringTokenizer tok = new StringTokenizer(line,",", false);
                BrowserTestInfo info = new BrowserTestInfo();
                info.client = tok.nextToken();
                if (info.client.startsWith("#")) {
                    continue;
                }
                info.formFactor = tok.nextToken();
                info.tablet = Boolean.valueOf(tok.nextToken());
                info.phone = Boolean.valueOf(tok.nextToken());
                info.iPad = Boolean.valueOf(tok.nextToken());
                info.iPhone = Boolean.valueOf(tok.nextToken());
                info.iOS = Boolean.valueOf(tok.nextToken());
                info.android = Boolean.valueOf(tok.nextToken());
                info.windowsPhone = Boolean.valueOf(tok.nextToken());
                info.firefox = Boolean.valueOf(tok.nextToken());
                info.webkit = Boolean.valueOf(tok.nextToken());
                info.ie6 = Boolean.valueOf(tok.nextToken());
                info.ie7 = Boolean.valueOf(tok.nextToken());
                info.ie8 = Boolean.valueOf(tok.nextToken());
                info.ie9 = Boolean.valueOf(tok.nextToken());
                info.ie10 = Boolean.valueOf(tok.nextToken());
                info.ie11 = Boolean.valueOf(tok.nextToken());
                info.userAgent = tok.nextToken("*");
                suite.addTest(new BrowserAgentTest(info, "testBrowserAgent"));
            }
        }
        finally {
            reader.close();
        }
        return suite;
    }

    private final BrowserTestInfo browserInfo;

    public BrowserAgentTest(BrowserTestInfo info, String name) {
        super(name);
        this.browserInfo = info;
    }
    
    
    
    @Override
    public String getName() {
        return super.getName() + "_" + browserInfo.client;
    }



    public void testBrowserAgent() throws Exception {
        BrowserInfo info = new BrowserInfo(browserInfo.userAgent);
        assertEquals(browserInfo.client + " tablet incorrect", browserInfo.tablet, info.isTablet());
        assertEquals(browserInfo.client + " phone incorrect", browserInfo.phone, info.isPhone());
        assertEquals(browserInfo.client + " iPad incorrect", browserInfo.iPad, info.isIPad());
        assertEquals(browserInfo.client + " iPhone incorrect", browserInfo.iPhone, info.isIPhone());
        assertEquals(browserInfo.client + " iOS incorrect", browserInfo.iOS, info.isIOS());
        assertEquals(browserInfo.client + " android incorrect", browserInfo.android, info.isAndroid());
        assertEquals(browserInfo.client + " windowsPhone incorrect", browserInfo.windowsPhone, info.isWindowsPhone());
        assertEquals(browserInfo.client + " firefox incorrect", browserInfo.firefox, info.isFirefox());
        assertEquals(browserInfo.client + " webkit incorrect", browserInfo.webkit, info.isWebkit());
        assertEquals(browserInfo.client + " ie6 incorrect", browserInfo.ie6, info.isIE6());
        assertEquals(browserInfo.client + " ie7 incorrect", browserInfo.ie7, info.isIE7());
        assertEquals(browserInfo.client + " ie8 incorrect", browserInfo.ie8, info.isIE8());
        assertEquals(browserInfo.client + " ie9 incorrect", browserInfo.ie9, info.isIE9());
        assertEquals(browserInfo.client + " ie10 incorrect", browserInfo.ie10, info.isIE10());
        assertEquals(browserInfo.client + " ie11 incorrect", browserInfo.ie11, info.isIE11());
        assertEquals(browserInfo.client + " form factor incorrect", browserInfo.formFactor, info.getFormFactor());
    }
    
    private static class BrowserTestInfo {
        public String client;
        public String formFactor;
        public boolean tablet;
        public boolean phone;
        public boolean iPad;
        public boolean iPhone;
        public boolean iOS;
        public boolean android;
        public boolean windowsPhone;
        public boolean firefox;
        public boolean webkit;
        public boolean ie6;
        public boolean ie7;
        public boolean ie8;
        public boolean ie9;
        public boolean ie10;
        public boolean ie11;
        public String userAgent;
        
    }
}