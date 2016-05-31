#!/usr/bin/env node
(function() {
  var Promise, deleteFlag, deletePromise, dir, directories, i, j, len, logHelp, parameter, parameters, path, promise, readdirAsync, ref, rmdirAsync, scanDir, scanFile, statAsync;

  Promise = require('bluebird');

  ref = Promise.promisifyAll(require('fs')), readdirAsync = ref.readdirAsync, statAsync = ref.statAsync, rmdirAsync = ref.rmdirAsync;

  path = require('path');

  deletePromise = Promise.resolve();

  directories = [];

  deleteFlag = false;

  logHelp = function() {
    console.log('rmempty <options> <directories>');
    console.log('  -d, --delete        delete empty directories when found');
    return console.log('  -h, --help          show this message');
  };

  parameters = process.argv.slice(2);

  i = 0;

  while (i < parameters.length) {
    parameter = parameters[i];
    switch (parameter) {
      case '-d':
      case '--delete':
        deleteFlag = true;
        break;
      case '-h':
      case '--help':
        logHelp();
        break;
      default:
        directories.push(parameter);
    }
    i++;
  }

  scanFile = function(filePath) {
    return statAsync(filePath).then(function(stats) {
      if (stats.isDirectory()) {
        return scanDir(filePath);
      } else {
        return 1;
      }
    });
  };

  scanDir = function(dir) {
    return readdirAsync(dir).then(function(files) {
      return Promise.all(files.map(function(file) {
        var filePath;
        filePath = path.join(dir, file);
        return scanFile(filePath);
      }));
    }).then(function(results) {
      var sum;
      sum = 0;
      results.forEach(function(result) {
        return sum += result;
      });
      if (!sum) {
        console.log(dir);
        deletePromise = deletePromise.then(function() {
          if (deleteFlag) {
            return rmdirAsync(dir);
          }
        });
      }
      return sum;
    });
  };

  promise = Promise.resolve();

  for (j = 0, len = directories.length; j < len; j++) {
    dir = directories[j];
    promise = promise.then(function() {
      return scanDir(dir);
    });
  }

}).call(this);
