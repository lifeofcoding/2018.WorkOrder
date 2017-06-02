// todo:

"use strict";

const DATA_HANDLER = require('./node/DataHandler');

class app {
     constructor() {
          this.ejsData = null;
          this.loadServer();
     }

     loadServer() {
          const HTTP = require('http');
          const PORT = 8111;
          const EJS = require('ejs');

          HTTP.createServer((request, response) => {

               let httpHandler = (error, string, contentType) => {
                    if (error) {
                         response.writeHead(500, {'Content-Type': 'text/plain'});
                         response.end('An error has occurred: ' + error.message);
                    } else if (contentType.indexOf('css') >= 0 || contentType.indexOf('js') >= 0) {
                         response.writeHead(200, {'Content-Type': contentType});
                         response.end(string, 'utf-8');
                    } else if (contentType.indexOf('html') >= 0) {
                         response.writeHead(200, {'Content-Type': contentType});
                         response.end(EJS.render(string, {
                              data: this.ejsData,
                              filename: 'index.ejs'
                         }));
                    } else {
                         response.writeHead(200, {'Content-Type': contentType});
                         response.end(string, 'binary');
                    }
               };

               if (request.method === 'POST') {
                    if (request.headers['x-requested-with'] === 'XMLHttpRequest0') {
                         request.on('data', (data) => {
                              DATA_HANDLER.handlePassword(data.toString('utf8'), (password) => {
                                   if (password === 'true') {
                                        response.writeHead(200, {'content-type': 'text/plain'});
                                        response.end(password);
                                   } else {
                                        response.writeHead(200, {'content-type': 'text/plain'});
                                        response.end('false');
                                   }
                              });
                         });
                    } else if (request.headers['x-requested-with'] === 'XMLHttpRequest1') {
                         DATA_HANDLER.generateInitialData((fetchedData) => {
                              response.writeHead(200, {'content-type': 'application/json'});
                              response.end(JSON.stringify(fetchedData));
                         });
                    } else if (request.headers['x-requested-with'] === 'XMLHttpRequest2') {
                         const FORMIDABLE = require('formidable');
                         let formData = {};
                         new FORMIDABLE.IncomingForm().parse(request).on('field', (field, name) => {
                              formData[field] = name;
                         }).on('error', (err) => {
                              next(err);
                         }).on('end', () => {
                              DATA_HANDLER.queryData(formData);
                              response.writeHead(200, {'content-type': 'text/plain'});
                              response.end('Done');
                         });
                    } else if (request.headers['x-requested-with'] === 'XMLHttpRequest3') {
                         DATA_HANDLER.getCompletedWork((fetchedData) => {
                              response.writeHead(200, {'content-type': 'application/json'});
                              response.end(JSON.stringify(fetchedData));
                         });
                    } else if (request.headers['x-requested-with'] === 'XMLHttpRequest4') {
                         request.on('data', () => {
                              DATA_HANDLER.handleZipData((zipData) => {
                                   response.writeHead(200, {'content-type': 'application/json'});
                                   response.end(zipData);
                              });
                         });
                    } else {
                         response.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
                         response.end(`<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>`);
                    }
               } else if (request.url.indexOf('.css') >= 0) {
                    DATA_HANDLER.renderDom(request.url.slice(1), 'text/css', httpHandler, 'utf-8');
               } else if (request.url.indexOf('.js') >= 0) {
                    DATA_HANDLER.renderDom(request.url.slice(1), 'application/javascript', httpHandler, 'utf-8');
               } else if (request.url.indexOf('.png') >= 0) {
                    DATA_HANDLER.renderDom(request.url.slice(1), 'image/png', httpHandler, 'binary');
               } else if (request.url.indexOf('.ico') >= 0) {
                    DATA_HANDLER.renderDom(request.url.slice(1), 'image/x-icon', httpHandler, 'binary');
               } else if (request.url.indexOf('/') >= 0) {
                    DATA_HANDLER.renderDom('public/views/index.ejs', 'text/html', httpHandler, 'utf-8');
               } else {
                    DATA_HANDLER.renderDom(`HEY! What you're looking for: It's not here!`, 'text/html', httpHandler, 'utf-8');
               }
          }).listen(PORT);
     }

     get ejsData() {
          return this._ejsData;
     }

     set ejsData(value) {
          DATA_HANDLER.generateInitialData((fetchedData) => {
               this._ejsData = fetchedData;
          });
     }
}

module.exports = app;