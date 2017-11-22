var PythonShell = require('python-shell');
var path = require('path');
var fs = require('fs');
var utils = require('./utils.js');

//This should be instantiated or smth 
var options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'], //unbuffered stdin and stdout
  scriptPath: "/home/johannes/Dokumente/ProjekteAF2OCR/nodejs_ocr/ocropus_scripts/",
  args: []
};
var o2 = Object.create(options, {
    mode: {
      value: 42,
      writable: true,
      enumerable: true,
      configurable: true
    },
    xyz: {
        value: "test"
    }
 });

function optionsFactory(changes){
    var optslocal = utils.objectFactory(options,changes);
    return optslocal;
}


/**
 * Parses a string to json if it contains 'JSONOBJ' and returns it 
 * @param {string} message - string to read in 
 * @returns {object} json object or null  
 */
function getJsonObjectIfDefined(message){
    if(message && message.match(/JSONOBJ/)){
        var mesjson = JSON.parse(message);  
        return mesjson;
    }
    return null;
}

/**
 * adds .gt. as second to the last file extension to the file in filepath
 * @param {string} filepath - directory name and filename of the file to check
 * @returns {string} modified filepath
 */
function addGroundtruthToFilepath(filepath){
    var filename = path.basename(filepath);
    var dirname     = path.dirname(filepath);
    //If the filepath hasn't got ground truth
    if(!filename.match(/\.gt\./)){
        var filenamesplit = filename.split('.');

        var filenameMerged ="";
        //Cover special case no ending extension in filepath 
        if(filenamesplit.length==1) filenameMerged=filenamesplit[0]+".gt";
        //Add the .gt.
        for(var i=0;i<filenamesplit.length;i++){
            if(i!=filenamesplit.length-1){
                filenameMerged = filenameMerged+filenamesplit[i]+".";
                if(i==filenamesplit.length-2){
                    filenameMerged = filenameMerged+"gt.";
                }
            }else{
                filenameMerged = filenameMerged + filenamesplit[i];
            }
        }
        filepath = dirname+"/"+filenameMerged;
    }
    return filepath;

}

function check_error_rate(dirpath,filepath){

    if(!filepath) return; 
 
    var filepathGT = addGroundtruthToFilepath(filepath);
    if(!fs.existsSync(filepathGT)){
        console.log("No Ground Truth .gt file found, won't check error rate, cause no comparison file");
        return;
    }

    var changes = {
        args: [filepathGT]
    }
    var optionsInst = optionsFactory(changes);
     
    var pyshell = new PythonShell('ocropus-econf',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)debugger;
        console.log(message);
    });
      
      // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err) throw err;
        console.log('finished');
    });
  
    //Später filepath statt obigen path

}

module.exports = {
    check_error_rate
}