var fs = require ("fs");
var exec = require ("child_process").exec;
var sys = require ("sys");

// Parse args and call appropriate functions
var execute = function (args) {
  if (args.indexOf ("-w") !== -1 || args.indexOf ("watch") !== -1) {
    console.log ("Watch: " + getConfig (args));
  } else if (args.indexOf ("-c") !== -1 || args.indexOf ("compile") !== -1) {
    console.log ("Compile");
    var config = getConfig (args);
    if (config) {
      compile (config);
    }
  } else if (args.indexOf ("init") !== -1) {
    console.log ("Initialize");
  } else {
    console.log ("Help");
  }
};

// Get config from given config file and environment
var getConfig = function (args) {
  var env, index, configFile, stat, configContent;

  env = "dev";
  index = args.indexOf ("--env");
  if (index !== -1) {
    env = args [index + 1];
  }
  configFile = "whiskers.json";
  index = args.indexOf ("--config");
  if (index !== -1) {
    configFile = args [index + 1];
  }

  try {
    stat = fs.statSync (configFile);
    try {
      configContent = JSON.parse (fs.readFileSync (configFile));

      if (configContent [env]) {
        return configContent [env];
      } else {
        console.log ("Specified environment doesn't exist. (Default is dev)");
      }

    } catch (e) {
      console.log ("Invalid JSON in config file.\n");
      console.log (e);
    }
  } catch (e) {
    console.log ("Config file doesn't exist. Use `whiskers init` to create one.");
  }
  return null;
};

// Watch path folder. Compile file whenever html file is updated
var watch = function (opts) {
  // Nothing here.
};

// Compile all the html files in given path
var compile = function (opts) {
  walk (opts.path, opts);
};

// Function which walks through the path folder recursively
// hunting for html files and creates compiled files.
var walk = function (path, opts) {
  path = fs.realpathSync (path);
  fs.readdir (path, function (err, files) {
    for (var i = 0; i < files.length; i++) {
      var f = path + "/" + files [i];
      var stat = fs.statSync (f);
      if (stat && stat.isDirectory()) { // Dir
        walk (f, opts);
      } else {
        if (f.match (/.html$/)) {
          console.log ("Compiling : " + f); // HTML Files
          var output = f.replace (/.html$/, "." + opts.extension);
          exec ("handlebars " + f + " -f " + output + " --min --root " + opts.root, function (err) {
            if (err) {
              console.log (err);
            }
          });
        }
      }
    }
  });
};

exports.execute = execute;
exports.compile = compile;
exports.watch = watch;
