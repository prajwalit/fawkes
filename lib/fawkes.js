var fs = require ("fs");
var exec = require ("child_process").exec;
var sys = require ("sys");
var chokidar = require ("chokidar");
var DEFAULT_CONFIG = "fawkes.json";

// Parse args and call appropriate functions
var execute = function (args) {
  if (args.indexOf ("-w") !== -1 || args.indexOf ("watch") !== -1) {
    var config = getConfig (args);
    if (config) {
      watch (config);
    }
  } else if (args.indexOf ("-c") !== -1 || args.indexOf ("compile") !== -1) {
    var config = getConfig (args);
    if (config) {
      compile (config);
    }
  } else if (args.indexOf ("init") !== -1) {
    init ();
  } else {
    console.log ("Use watch OR -w to watch a folder.");
    console.log ("Use compile OR -c to compile all html files in a folder.");
    console.log ("Use `fawkes init` to create a config file.");
    console.log ("Use --env to specify environment (Default dev).");
    console.log ("Use --config to specify path to config file stored in a different place.");
    console.log ("Look for `fawkes.json` (Default) file to modify config.");
  }
};

// Watch path folder. Compile file whenever html file is updated
var watch = function (config) {
  // Nothing here.
  var watcher = chokidar.watch (config.path, {ignored: /^\./, persistent: true});
  watcher.on ("add", function (filePath) {
    updateFile (filePath, config);
  });
  watcher.on ("change", function (filePath) {
    updateFile (filePath, config);
  });
};

// Compile all the html files in given path
var compile = function (config) {
  walk (config.path, config);
};

// Create config file if it doesn't exist already
var init = function () {
  var configFile = process.cwd () + "/" + DEFAULT_CONFIG;
  fs.exists (configFile, function (exists) {
    if (exists) {
      console.log ("Config file `" + DEFAULT_CONFIG + "` already exists.");
    } else {
      var content = JSON.stringify (require ("../fawkes.json"), 1, 4);
      fs.writeFile (DEFAULT_CONFIG, content, function () {
        console.log ("File `" + DEFAULT_CONFIG + "` has been created.");
      });
    }
  });
};

// Get config from given config file and environment
var getConfig = function (args) {
  var env, index, configFile, stat, configContent;

  env = "dev";
  index = args.indexOf ("--env");
  if (index !== -1) {
    env = args [index + 1];
  }
  configFile = DEFAULT_CONFIG;
  index = args.indexOf ("--config");
  if (index !== -1) {
    try {
      configFile = fs.realpathSync (args [index + 1]);
    } catch (e) {
      console.log ("Config file doesn't exists.");
      return null;
    }

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
    console.log ("Config file doesn't exist. Use `fawkes init` to create one.");
  }
  return null;
};

// Function which walks through the path folder recursively
// hunting for html files and creates compiled files.
var walk = function (path, opts) {
  path = fs.realpathSync (path);
  var root = fs.realpathSync (opts.root);
  fs.readdir (path, function (err, files) {
    for (var i = 0; i < files.length; i++) {
      var f = path + "/" + files [i];
      var stat = fs.statSync (f);
      if (stat && stat.isDirectory()) { // Dir
        walk (f, opts);
      } else {
        if (f.match (/.html$/)) {
          console.log ("Compiling : " + f.split (root) [1]); // HTML Files
          var output = f.replace (/.html$/, "." + opts.extension);
          exec ("handlebars " + f + " -f " + output + " --min --root " + root, function (err) {
            if (err) {
              console.log (err);
            }
          });
        }
      }
    }
  });
};

// Check if the file is html file. And update compiled file.
var updateFile = function (filePath, opts) {
  if (filePath.match (/\.html$/)) {

    var output = filePath.replace (/.html$/, "." + opts.extension);
    var root = fs.realpathSync (opts.root);
    var fullFilePath = fs.realpathSync (filePath);
    exec ("handlebars " + filePath + " -f " + output + " --min --root " + root, function (err) {
      if (err) {
        console.log (err);
      } else {
        console.log ("Compiling : " + fullFilePath.split (root) [1]);
      }
    });
  }
};

exports.execute = execute;
exports.compile = compile;
exports.watch = watch;
exports.init = init;
