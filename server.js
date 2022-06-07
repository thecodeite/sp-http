var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

var root = process.cwd();

if(process.env.FOLDER) {
  var folder = process.env.FOLDER;
  if(folder[0] === '/') {
    root = folder;
  } else {
    root = path.join(root, folder);
  }
}

console.log('Using root:', root);

app.use(function(req, res, next) {
  console.log(req.method+':', req.path);
  next();
});

app.use(function(req, res, next) {

  var fsPath = path.join(root, req.path);
  console.log('fsPath:', fsPath);

  fs.lstat(fsPath, function(err, stat){
    if(err && err.code === 'ENOENT') return res.status(404).send('Not found');
    if(err) return res.status(500).send(err);

    if(stat.isDirectory()){
      fs.readdir(fsPath, function(err, files) {
        if(err) return res.status(500).send(err);

        res.write('<!DOCTYPE html><html><body><h1>'+fsPath+'</h1>');
        res.write('<ul>');
        res.write('<li><a href="'+path.join(req.path, '..')+'">..</a></li>');
        files.forEach(function(file) {
          res.write('<li><a href="'+path.join(req.path, file)+'">'+file+'</a></li>');
        });
        res.write('</ul></body></html>');
        res.end();
      });
    } else {
      next();
    }
  });
});


app.use(express.static(root, { maxAge: 1 }));


var port = process.env.PORT || 8080;

app.listen(port, function(err){
  if(err) console.error('Error while listing on port ', port, error);
  else console.log('Listening on port', port);
});
