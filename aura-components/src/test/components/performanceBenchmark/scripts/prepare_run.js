// Lets find the version of Aura we need
const path = require('path');
const fs = require('fs');

const DEFAULT_AURA_MODE = "dev";
const AURA_MODE_ARG = "auraMode";
const VERSION_ARG = process.env.npm_config_auraVersion;
// TODO: This is weak and susceptible to break. Need a better solution.
const AURA_SOURCE_DIR = "../../../../../../aura-resources/target/src-gen/main/resources/aura/javascript/";
const aura_mode = getAuraMode();

var source = path.resolve(path.join(__dirname, AURA_SOURCE_DIR, `aura_${aura_mode}.js`));
var target = path.resolve(path.join(__dirname, '..', 'public', 'libs', 'js', `aura_${aura_mode}.js`));

copyFile(source, target, function(resp){
    //TODO: Need better error handling here.
    console.warn("resp", resp);
});

//Have to do crazy arg stripping because yarn does not support passing args to Node scripts (sad times).
function getAuraMode() {
    var args = JSON.parse(process.env.npm_config_argv);
    var af_mode = DEFAULT_AURA_MODE;
    if(typeof args["original"] === 'undefined') {
        return af_mode;
    }

    for(var i in  args["original"]) {
        if(args["original"][i].indexOf(AURA_MODE_ARG) > -1) {
            af_mode = args["original"][i].substring(args["original"][i].indexOf("=") + 1, args["original"][i].length);
            break;
        }
    }
    return af_mode;
}

function copyFile(source, target, cb) {
    var copyComplete = false;
  
    var read = fs.createReadStream(source);
    read.on("error", function(err) {
      done(err);
    });

    var write = fs.createWriteStream(target);
    write.on("error", function(err) {
      done(err);
    });
    write.on("close", function(resp) {
      done(resp);
    });

    read.pipe(write);
  
    function done(resp) {
      if (!copyComplete) {
        copyComplete = true;
      }
      cb(resp);
    }
  }