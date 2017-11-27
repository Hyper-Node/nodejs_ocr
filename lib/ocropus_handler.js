var PythonShell = require('python-shell');
var path = require('path');
var fs = require('fs');
var utils = require('./utils.js');
var nodeHocr = require("node-hocr");



//This should be instantiated or smth 
var options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'], //unbuffered stdin and stdout
  scriptPath: "/home/johannes/Dokumente/ProjekteAF2OCR/nodejs_ocr/ocropus_scripts/",
  args: []
};

var noninstoptions = {
    mode: 'text',
    pythonPath: '/usr/bin/python',
    pythonOptions: ['-u'], //unbuffered stdin and stdout
    scriptPath: "/home/johannes/Dokumente/ProjekteAF2OCR/nodejs_ocr/ocropus_scripts/",
    args: []
  };
  


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
/*
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

*/

function parse_file_binarize(fileOfPicture,outname,outputdir,failed,callbackDone){
    var changes = {
        args: [
            fileOfPicture     //Input 
        ]
    }
    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-nlbin',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-nlbin-result is:",jsonobject);
        console.log(message);
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.error(err);
            failed.push(err);
        }
        console.log('finished ocropus-nlbin');
        callbackDone();
    });

}

function parse_file_gpaseg(fileOfPicture,outname,outputdir,failed,callbackDone){
    var changes = {
        args: [
            //"--output",
            //outname+".hocr",  //Output            
            fileOfPicture     //Input 
        ]
    }
    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-gpageseg',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-gpageseg-result is:",jsonobject);
        console.log(message);
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.error(err);
            failed.push(err);
        }
        console.log('finished ocropus-gpaseg');
        callbackDone();
    });

}

function parse_file_rpred(fileOfPicture,outname,outputdir,failed,callbackDone){

    var inputdir = path.dirname(fileOfPicture);
    var inputfilename = path.basename(fileOfPicture).replace(/\.[^/.]+$/, "");
    var directoryToRead = path.join(inputdir,inputfilename);
    var directoryContent = fs.readdirSync(directoryToRead);
    directoryContent = utils.filterFileExtension(directoryContent,"txt");//filter out all txt 
    var argsFinal = [];
    argsFinal.push("--probabilities");

    for(var i=0;i<directoryContent.length;i++){
        var finalEntry  = path.join(directoryToRead,directoryContent[i]);
        argsFinal.push(finalEntry);
    }
    //pseg files needed here...check https://github.com/tmbdev/ocropy/wiki/Page-Segmentation
    var changes = {
        args: argsFinal,
    }

    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-rpred',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-rpred-result is:",jsonobject);
        console.log(message);
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.error(err);
            failed.push(err);
        }
        console.log('finished ocropus-rpred');
        callbackDone();
    });

}

function parse_file_hocr(fileOfPicture,outname,outputdir,failed,callbackDone){
    //pseg files needed here...check https://github.com/tmbdev/ocropy/wiki/Page-Segmentation
   
   var fileOfPictureBinO = utils.addForelastExtensionToFilepath(fileOfPicture,'bin');
   var fileOfPictureBin = utils.replaceFileExtension(fileOfPicture,".bin.png");
   var changes = {
        args: [
            //"--output",
            //outname+".hocr",  //Output            
            //fileOfPicture     //Input 
            fileOfPictureBin
        ]
    }
    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-hocr',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-hocr-result is:",jsonobject);
        console.log(message);
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.error(err);
            failed.push(err);
        }
        console.log('finished ocropus-hocr');
        callbackDone();
    });

}

function check_error_rate(dirpath,filepath){
    if(!filepath) return; 
    
    var filepathGT = utils.addForelastExtensionToFilepath(filepath,'gt');
    if(!fs.existsSync(filepathGT)){
        console.log("No Ground Truth .gt file found, won't check error rate, cause no comparison file");
        return;
    }

    var changes = {
        args: [filepathGT]
    }
    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-errs',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-errs-result is:",jsonobject);
        console.log(message);
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err) throw err;
        console.log('finished ocropus-errs');
    });

}

function check_confidence_rate(dirpath,filepath){
    if(!filepath) return; 
    
    var filepathGT = utils.addForelastExtensionToFilepath(filepath,'gt');
    if(!fs.existsSync(filepathGT)){
        console.log("No Ground Truth .gt file found, won't check error rate, cause no comparison file");
        return;
    }
    var confpath = filepath+".allconf.tsv";
    var writeOptions = {'flags': 'w'}; //'w' erase and write a new file
    fs.writeFileSync(confpath,writeOptions,'');//Create the corresponding allconf file
    
    var changes = {
        args: [
            "--allconf",
            //"/home/johannes/Dokumente/ProjekteAF2OCR/nodejs_ocr/"+confpath,
            confpath,
            filepathGT
        ],
        
        
    }
    var optionsInst = optionsFactory(changes);

    //Start a shell with options specified
    var pyshell = new PythonShell('ocropus-econf',optionsInst);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        var jsonobject = getJsonObjectIfDefined(message);
        if(jsonobject!=null)console.log("ocropus-econf-result is:",jsonobject);        
        console.log(message);
        
    });
        
        // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err) throw err;
        console.log('finished ocropus-econf');
    });

}
module.exports = {
    check_error_rate,
    check_confidence_rate,
    parse_file_binarize,
    parse_file_gpaseg,
    parse_file_rpred,
    parse_file_hocr
}