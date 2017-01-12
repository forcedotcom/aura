Function.RegisterNamespace("Test.Tools.Aura.Script.ScriptLoadStrategy");

Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover=function () {
    var _loadStrategy;

    this.JarPath="../../../aura-util/src/test/tools/jscover/JSCover-all.jar";

    function JsCover(){
        this.base();
        _loadStrategy=this.base;
    }
    JsCover.apply(this,arguments);

    // ILoadStrategy Members
    this.ImportJson = function (path, callback) {
        var fullPath=System.IO.Path.GetFullPath(path);
        var script=System.IO.File.GetFile(fullPath);
        if (script==null)throw new Error(String.Format("System.Script.ScriptLoadStrategy.JsCover.ImportJson: There was an error loading '{0}'.\nError: File not found.", fullPath));
        var tempPath=System.IO.Path.GetFullPath(path.replace(new RegExp(System.IO.Path.DirectorySeparator, "gm"), "_"));
        System.IO.File.SaveFile(System.IO.Path.GetFullPath(tempPath),String.Format("Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT=({0});",script));
        return mockGetFile(this,function(){
            script=System.IO.File.GetFile(tempPath).replace(new RegExp(tempPath,"gm"),path);
            _loadStrategy.Load(String.Format("{0}\n//@ sourceURL={1}",script,path.replace(/\s/g, '_')));
            System.IO.File.DeleteFile(tempPath);
            var result=Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT;
            delete Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT;
            if(callback)callback(path, result);
        });
    };

    this.Load=function(source) {
        return _loadStrategy.Load(source);
    };

    // IStrategySpecification Members
    this.IsSatisfiedBy = function (candidate) {
        return System.Environment.GetParameters().named.coverage=="true";
    };

    // Private Methods
    function mockGetFile(strategy,during){
        return Mocks.GetMock(System.IO.File,"GetFile",function getMock(path){
            var script="";
            if(Object.Global().system&&Object.Global().snarf){
                // SM
                script=System.Environment.Execute("sh", ["-c",String.Format("\"java -jar '{0}' '{1}' -io\"", System.IO.Path.GetFullPath(strategy.JarPath),path)]);
            }else{
                // V8 and Rhino
                script = System.Environment.Execute("sh", ["-c", String.Format("java -jar \"{0}\" \"{1}\" -io", System.IO.Path.GetFullPath(strategy.JarPath), path)]);
            }
            return script;
        })(during);
    }
};

if(xUnit.js.Console){

    Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.Inherit(System.Script.ScriptLoadStrategy.Generic,"Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover");

    System.Script.ScriptLoader.Strategies.Clear();
    System.Script.ScriptLoader.Strategies.Add(Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover);
    System.Script.ScriptLoader.Strategies.Add(System.Script.ScriptLoadStrategy.SpiderMonkey);
    System.Script.ScriptLoader.Strategies.Add(System.Script.ScriptLoadStrategy.Generic);

}