'use strict';

const copyfiles = require('copyfiles');
const path = require('path');

function postBuild(cb) {
  const paths = [path.join('src/data/**/*'), path.join('dist')];
  copyfiles(paths, 1, cb);
}

exports.postBuild = postBuild;
exports.default = postBuild;
