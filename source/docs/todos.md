Using todo: UEG scheme - check `todo-notes.md`

## uRequire.config

- (8 5 3) Proper recursive reading / fixation of config files

- (7 8 2)
   Which files to / not-to copy.
   # can be []<String> of filenames / templates to skip uRequiring.

- (7 5 6) 'requirejs config / requirejs 'link'
        - Smootly integrate it!
        - (8 9 1) Remove hardcoded paths!

- (3 3 8) Check / cowork / integrate / piggyback with others :
          bower, brunch.io, yeoman.io, jam, package.json, requirejs.packages etc

- (5 7 4) Warnings of non-valid/depracated config options

## build
- (7 2 1) Fix rudimentary Reporting!

- (6 4 3) Build / Final report should include all automatically made decisions like :
          a) All chosen/binded 'globals', along with their bindings
             (eg. inform user they have to bind dep 'utils' with variable 'utils' -
              then they'll realize they are writting against nodejs and their script wont run as is on Web)
          b)

- (5 8 2) 'Simple' UMD conversion, without uRequire dependency on nodejs


- (6 3 2) Check for same moduleName, but different extension (eg 'lib/mymodule.js' & 'lib/mymodule.coffee')


- (4 3 7) Watch files changes / reconvert modules / combine :
           Use 'npm install watch' ?

## Module manipulation
- (2 3 7) Use Esprima/uglify2 instead of uglify1

- (2 2 8) Read/write Harmony modules

- (2 2 6) Read/write Coffescript modules
          - use coffeescript redux
          - rewrite Templates for Coffeescript

## (5 4 3) 'combined' script 'external/global' deps blues :

In bundles like 'uBerscore/spec', that have some global dependency (eg `require 'uberscore'`), where does this global come from when running on nodejs ?

When running as UMD, through NodeRequirer, everything is looked up using `rjs.paths` in `requirejs.config.json`.

But the 'combined' build doesnt know about `requirejs.config.json`.

Hence it loads from available modules, installed locally.
If there is none, like in uBerscore's case, it loads 'em from its own uRequire installation ? This should not happen!

## General:

- Output in JSON only

- More tests

- More docs / codedocs

- Build urequire.org site


