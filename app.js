/** 
    Starting point for OCR reads in all files in specified directory and calls ocr measures
**/
const Program     = require('commander');
const fs          = require('fs');
const path        = require('path');
const mkdirp      = require('mkdirp');
const async       = require('async');


//Own packages 
const tesseract_parser = require('./lib/tesseract_parser');

Program
    .option('-o, --outputdir <dir>', 'Output directory', './output')
    .option('-i, --inputdir <dir>','Input directory with html files')
    .option('-p, --print', 'Print to STDOUT', false)
    .option('-n, --parallel <num>', 'Parallel conversions', parseInt, 5)
    .option('-f, --inputfiles <files>','Input files ' ) 
    .parse(process.argv); 

var inputFolder_isGiven = false;    //indicator if there is some valid inputfolder or files given 
var fileslist;                      //list of files which will get parsed 
var detectedOS = process.platform; //'linux' or ... 

//Run the program
if (process.argv.length <= 2){
    //Show help if there are not enough input arguments
     process.argv.push('--help');           
     Program.parse(process.argv);           
     process.exit();
} 
handleFolderAndFileInput();                 //Check folder input arguments 
mkdirp.sync(Program.outputdir);             //Create output directory, if not defined per argument use './output'
parseSelectedFilesAsync(fileslist,Program.lse); //Parse the fileslist


/**
 * Check if there is an input directory specified from command line parameters.
 * If there is a folder and input-files specfies, prefer input-files from folder
 * If there is no inputfiles or files, just log this and close the program
 * If there are only input-files specified, take these for input
 */
function handleFolderAndFileInput(){
    if(Program.inputdir){
        console.log('Specified input directory is: %j', Program.inputdir);
        if(!fs.lstatSync(Program.inputdir).isDirectory()){
            console.log("Specified path is not a directory");    
        }else{
            var files = walk(Program.inputdir); //Get all files in directory and subdirectories 
            fileslist = files.filter( function( elm ) {
                return elm.match(/.*\.(jpg)/ig);
            });
            if(fileslist.length>0){
                console.log("Valid input directory was specified, continuing with parsing"); 
                inputFolder_isGiven = true; 
            }
        }
    }
        
    if(inputFolder_isGiven && Program.inputfiles){
        console.log("Ignoring specfied files from -i or --inputfiles option, because files are already specified via --inputdir option ");
    }else{
        if(!inputFolder_isGiven && !Program.inputfiles){
            console.log("No input data specified at all, please specify with --inputfiles or --inputdir option, exit process");
            process.exit();
        }
        if(!inputFolder_isGiven && Program.inputfiles ){
            console.log('Specified input-files are: %j', Program.inputfiles);
            fileslist = []; 
            fileslist.push(Program.inputfiles); 
        }
    }
}

/**
 * Parse the specified file with an asynchronosly working parser 
 * 
 * @param selectedFiles {array} list of paths and filenames of the specified files 
 * @param doLSE {boolean} do a line segment analysis after parsing
 */
function parseSelectedFilesAsync(selectedFiles,doLSE){
    const failed = [];

    var currentIndex = -1;

    function parseOneFileAsync(){

        //Set next/first file for parsing step
        if(currentIndex<selectedFiles.length-1){
            currentIndex = currentIndex+1;
            selectedFile = selectedFiles[currentIndex];
        }else{
            return end();
        }

        //Create necessary paths
        var basenameHtml = path.basename(selectedFile);
        var dirnameHTML = path.dirname(selectedFile); //Extract directory name from htmlfile
        var outputDir = Program.outputdir+dirnameHTML; //Create output directory path  
        
        /*
        if(detectedOS==='linux'){                     //Linux specific path adaptions
            dirnameHTML = dirnameHTML.replace(/\//g,"\\/");  
            outputDir = Program.outputdir+dirnameHTML; //Create output directory path          

        }else{
            outputDir = Program.outputdir+dirnameHTML; //Create output directory path 
        }
        */
        mkdirs(outputDir);                                  //Create output directory
        
        var outname = path.join(outputDir, path.basename(selectedFile) + '.txt');
        /*
        if(detectedOS==='linux'){
            outname = outputDir+"\\/"+path.basename(selectedFile) + '.txt';        //define output filepath
            outname = outname.replace(".\/","");
        }else{
            outname = path.join(outputDir, path.basename(selectedFile) + '.txt');  //define output filepath
        }
        */
        console.log("------------------------------------------------------------");
        console.log("Starting to parse file ",selectedFile);
        tesseract_parser.parseFile(selectedFile,outname,failed,parseOneFileAsync);
    }

    function end(){
        console.log("Parsing of",currentIndex+1,"files was done asynchronously");
    }

    //Start parsing
    parseOneFileAsync();

}



/**
 * Parse the specified files
 * 
 * @param parallel {integer} number of maximal async calls of the parser at once 
 * @param selectedFiles {array} list of paths and filenames of the specified files 
 * @param doLSE {boolean} do a line segment analysis after parsing
 */
function parseSelectedFiles(selectedFiles,parallel,doLSE){
  
    const failed = [];

    async.eachLimit(selectedFiles, parallel, (selectedFile, done) => {
        
        var basenameHtml = path.basename(selectedFile);
        var dirnameHTML = path.dirname(selectedFile);           //Extract directory name from htmlfile
        var outputDir = Program.outputdir+"\\"+dirnameHTML; //Create output directory path 
        mkdirs(outputDir);                                  //Create output directory

        //define output file name
        const outname = path.join(outputDir, path.basename(selectedFile) + '.json'); 
        
        try {
            const json = tesseract_parser.parseFile(selectedFile);
            if (Program.print) {
                //Print the whole created json file if defined in input parameters
                console.log(json);
            } else {
                //Otherwise just print in- and output file names. 
                console.error(`${selectedFile} -> ${outname}`);
            }
            //Write json too output path
            fs.writeFile(outname, JSON.stringify(json, null, 2), done)
        } catch (e) {
            //If there is an exception, push it to the errors-stack
            console.log("*** ERROR ERROR ERROR ***",e);
            failed.push([selectedFile, e]);
            done()
        }
    }, () => {
        //After parsing....
        console.log("Endpoint reached");

        //Do a line segment analysis in the end, if specified
        if(doLSE){
            debugger; //TODO set code here
           // parser.doLineSegmentAnalysis(null,"kapitalentwicklung",true);
        }

        //Print the error stack, if there are some errors
        if (failed.length) {
            console.log("There where some errors during parsing html: ",failed)
        }
    })
}

/**
 * Reads the folderstructure of a given directory and all the subfolders 
 * @param {string} dir path to directory  
 * @returns list of files to the directories 
 */
function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '\/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else results.push(file)
    })
    return results;
}


/**
 * Creates all subdirectories for a given path, if they don't exist 
 * @param {string} path to which the subdirectories are set. 
 */
function mkdirs(path) {
    path = path.replace(/\\/g,'/');
    var dirs = path.split('/');
    var prevDir = dirs.splice(0,1)+"/";
    while(dirs.length > 0) {
        var curDir = prevDir + dirs.splice(0,1);
        if (! fs.existsSync(curDir) ) {
            fs.mkdirSync(curDir);
        }
        prevDir = curDir + '/';
    }
}