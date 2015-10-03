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
        var tempPath=System.IO.Path.GetFullPath("ScriptLoadStrategy.ImportJson.RESULT");
        System.IO.File.SaveFile(System.IO.Path.GetFullPath(tempPath),String.Format("Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT=({0});",script));
        return mockGetFile(this,function(){
            try{
                System.Environment.Write("\n**********: 1111111111 \n");
                script=System.IO.File.GetFile(tempPath).replace(new RegExp(tempPath,"gm"),path);
                System.Environment.Write("\n**********: 2222222222 \n");
                System.Environment.Write("\n ----------"+String.Format("{0}\n//@ sourceURL={1}",script,path.replace(/\s/g, '_'))+"----------\n");
                _loadStrategy.Load(String.Format("{0}\n//@ sourceURL={1}",script,path.replace(/\s/g, '_')));
                System.Environment.Write("\n**********: 3333333333 \n");
                System.IO.File.DeleteFile(tempPath);
                System.Environment.Write("\n**********: 4444444444 \n");
                var result=Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT;
                System.Environment.Write("\n**********: 5555555555 \n");
                delete Test.Tools.Aura.Script.ScriptLoadStrategy.JsCover.RESULT;
                System.Environment.Write("\n**********: 6666666666 \n");
                if(callback)callback(path, result);
                System.Environment.Write("\n**********: 7777777777 \n");
            }
            catch(e){
                System.Environment.Write("\n**********:"+path+"\n");
                System.Environment.Write(e+"\n");
            }
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
            if(Object.Global().system&&Object.Global().snarf){System.Environment.Write("\n**********: 8888888888 \n");
                //System.Environment.Write("\n\n SM:"+String.Format("\"java -jar '{0}' '{1}' -io\"", System.IO.Path.GetFullPath(strategy.JarPath),path)+"\n");
                // SM
                script=System.Environment.Execute("sh", ["-c",String.Format("\"java -jar '{0}' '{1}' -io\"", System.IO.Path.GetFullPath(strategy.JarPath),path)]);
            }else{System.Environment.Write("\n**********: 9999999999 \n");
                //System.Environment.Write("\n\n V8:"+String.Format("java -jar \"{0}\" \"{1}\" -io", System.IO.Path.GetFullPath(strategy.JarPath), path)+"\n");
                // V8
                script = System.Environment.Execute("sh", ["-c", String.Format("java -jar \"{0}\" \"{1}\" -io", System.IO.Path.GetFullPath(strategy.JarPath), path)]);
            }System.Environment.Write("\n**********: 0000000000 \n");
            //System.Environment.Write("\n\n Instrumented code <<<<<<<<<<<<<<<<<<< path:" + path + "\n" +script+" >>>>>>>>>> End\n\n");
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