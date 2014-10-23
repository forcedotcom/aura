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
package org.auraframework.test;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

/**
 * RemoteWebElement that implicitly tries to smooth WebDriver differences
 */
public class AdaptiveWebElement extends RemoteWebElement {

    public static class JsonConverter extends JsonToWebElementConverter {
        protected final RemoteWebDriver driver;

        public JsonConverter(RemoteWebDriver driver) {
            super(driver);
            this.driver = driver;
        }

        @Override
        protected RemoteWebElement newRemoteWebElement() {
            RemoteWebElement toReturn = new AdaptiveWebElement();
            toReturn.setParent(driver);
            return toReturn;
        }
    }

    public WebElement scrollIntoView() {
        try {
            getCoordinates().inViewPort();
        } catch (Exception ex) {
            // TODO ios-driver: NullPointerException at RemoteWebElement$1.inViewPort(RemoteWebElement.java:362)
            // Ignore Exception and try a different approach
        }
        ((JavascriptExecutor) getWrappedDriver()).executeScript("return arguments[0].scrollIntoView(true);", this);
        return this;
    }

    @Override
    public void click() {
        scrollIntoView();
        super.click();
    }

    @Override
    public void sendKeys(CharSequence... keysToSend) {
        scrollIntoView();
        super.sendKeys(keysToSend);
    }

}
