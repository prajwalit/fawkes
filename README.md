*Fawkes*

A tool to watch / compile HTML files into handlebars-compiled files.

**Install**

    npm install -g handlebars
    npm install -g fawkes

**Usage**

* To create a config file, go to your work repository and type -
    fawkes init

* Open fawkes.json file and modify `path`, `root`, `extension` where -
  `path` is the path to templates folder.
  `root` is the path which is to be removed while creating compiled
  templates.
  `extension` is the extension of newly created compiled js files. (Can
  be `hbc`, `jst`, `js` etc.

* To compile all the html files, type -
    fawkes compile

* To watch for new changes in html files, type -
    fawkes watch

* You can give environment to the commands using `--env` option
  (eg. `--env prod`). It looks for that map in config file. Default is
  `dev`.

* You can keep config file separately and mention it in commands with
  `--config` option. (eg. `fawkes compile --config ../foo.json`)

**Thanks**

* [Handlebars](https://github.com/wycats/handlebars.js)
* [Chokidar](https://github.com/paulmillr/chokidar)
