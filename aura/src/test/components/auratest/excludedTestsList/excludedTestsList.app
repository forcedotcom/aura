<!--

    Copyright (C) 2012 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<aura:application model="java://test.model.ExcludedTestsListModel">
    <div class="title">Browser Compatibility Excluded Tests</div><br></br>

    <p>
    Tests are ignored on browser compatibility autobuilds with the @ExcludeBrowsers or @TargetBrowsers annotation.
    These annotations can be applied at the class or method level.
    Tests displayed in this app include all WebDriver and componenet Javascript tests.
    Note that an excluded test is not necessarily a bad thing. For example, AppCache is not supported on IE versions
    less than IE10, so the tests are expected to be excluded on earlier versions.
    </p><br></br>
    
    <table>
        <thead>
            <tr>
                <th>Browser</th>
                <th>Excluded Tests</th>
            </tr>
        </thead>
        <tbody>
            <aura:iteration items="{!m.browserInfo}" var="browser">
                <tr>
                    <td>{!browser.name}</td>
                    <td class="test_count">{!browser.ignoredTestCount}</td>
                </tr>
            </aura:iteration>
        </tbody>
    </table>

    <div>Total tests processed: {!m.totalTestCount}</div>
    <br></br>

    <aura:iteration items="{!m.browserInfo}" var="browser">
        <div class="browser_name">{!browser.name}</div>
        <ol>
            <aura:iteration items="{!browser.ignoredTests}" var="test">
                <li>{!test}</li>
            </aura:iteration>
        </ol>
    </aura:iteration>
</aura:application>