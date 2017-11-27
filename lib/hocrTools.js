/**
 * Multiple functions for hocr-file handling 
 * 
 * TODO: Check https://github.com/kba/hocrjs 
 */

var hocr = require('node-hocr');
var fs = require('fs');
var util = require('util');

function convertHocrFile2Text(filepath){

    hocr = new hocr.Hocr(fs.readFileSync(filepath).toString(), function(error, dom) {
        if (error) {
          return console.log(error);
        } else {
          return util.puts(JSON.stringify(dom));
        }
    });

}


module.exports = {
    convertHocrFile2Text
}