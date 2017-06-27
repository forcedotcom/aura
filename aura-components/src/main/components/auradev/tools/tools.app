<!--

    Copyright (C) 2013 salesforce.com, inc.

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
<aura:application>
    <div class="container">
        <h1>Aura Toolbox</h1>
        <em>Tools to investigate the quality and performance of your component</em>
        <br/><br/>

        <h3>Dependencies</h3>
        <section>
            <p>
                <h4><a href="/auradev/traceDependencies.app">All Dependencies for a definition</a></h4>
                Lists all the dependencies that a definition will need, both hard (references directly) and soft (references of references but not referenced directly).
            </p>

            <p>
                <h4><a href="/auradev/hardDependencies.app">Direct Dependencies</a></h4>
                Only shows hard dependencies for the specified definition. Hard dependencies are components explicitly used. Soft dependencies are definitions used by components you reference.
            </p>

            <p>
                <h4><a href="/auradev/depViewer.app">Unique Dependencies for Application</a></h4>
                Shows you all the definitions that are unique to a specific definition. This gives you the information to know which are the best targets to remove from app.js. Since shared dependencies will not come out if you remove only one reference.
            </p>
        </section>

        <h3>Linting</h3>
        <section>
            <p>
                <h4><a href="/auradev/lint.app">Lint app</a></h4>
                Runs lint validation on a specific component or set of components.
            </p>
        </section>
    </div>
</aura:application>
