Promise = require 'bluebird'
{
  readdirAsync
  statAsync
  rmdirAsync
} = Promise.promisifyAll require 'fs'
path = require 'path'
deletePromise = Promise.resolve()

directories = []

deleteFlag = false

logHelp = ->
  console.log 'rmempty <options> <directories>'
  console.log '  -d, --delete        delete empty directories when found'
  console.log '  -h, --help          show this message'

parameters = process.argv.slice 2
i = 0
while i < parameters.length
  parameter = parameters[i]
  switch parameter
    when '-d', '--delete'
      deleteFlag = true
    when '-h', '--help'
      logHelp()
    else
      directories.push parameter
  i++

scanFile = (filePath)->
  statAsync filePath
    .then (stats)->
      if stats.isDirectory()
        scanDir filePath
      else 1

scanDir = (dir)->
  readdirAsync dir
    .then (files)->
      Promise.all files.map (file)->
        filePath = path.join dir, file
        scanFile filePath
    .then (results)->
      sum = 0
      # console.log 'dir', {results}
      results.forEach (result)->
        sum += result
      # console.log dir, sum
      unless sum
        console.log dir
        deletePromise = deletePromise.then ->
          rmdirAsync dir if deleteFlag


      return sum

promise = Promise.resolve()

for dir in directories
  promise = promise.then -> scanDir dir
