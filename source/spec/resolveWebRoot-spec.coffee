console.log '\nresolveWebRoot-test started'

chai = require 'chai'
resolveWebRoot = require "../code/resolveWebRoot"

assert = chai.assert
expect = chai.expect

describe "Has bundle root as default for webRootMap", ->
  it "counts 0 steps to reach bundle root from modyle @ bundle root", ->
    expect(resolveWebRoot 'rootModule.js', null).to.equal '.'

  it "counts 2 steps to reach bundle root from modyle @ 2 dirs from bundle root", ->
    expect(resolveWebRoot 'dir1/dir2/someModule.js', null).to.equal '../..'


describe "Adjusts relative webRootMap paths to bundle root", ->
  it "counts 0 extra steps to reach webRootMap from modyle @ root ", ->
    expect(resolveWebRoot 'rootModule.js', '../../relative/path').to.equal '../../relative/path'

  it "counts 2 extra steps to reach bundle path from modyle ", ->
    expect(resolveWebRoot 'dir1/dir2/someModule.js', '..\\..\\relative\\path').to.equal '../../../../relative/path'


describe "puts absolute OS webRootMap paths as is", ->
  it "only fixes \\ to /", ->
    expect(resolveWebRoot 'does/not/matter/Module.js', '/absolute\\os\\path').to.equal '/absolute/os/path'




