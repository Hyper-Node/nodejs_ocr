# nodejs_ocr

Testing suite for ocr-tools and libraries controlled by a nodejs application. 

Features
- Reading folders of files and parse them in one call of the software 
- (planned) double, tripple keying methods with different ocr-softwares 
- (planned) optimal ocr-parametrization for best results
- (planned) verification with 
- (planned) classify ocr output content to a standardized readable form


## Installation 

Install [Node.js](http://node.js/ "NodeJs")


In command line, go to project folder and type: 

    npm install

Also initialize submodules, since tesseract-ocr is an independent git repository:
    git submodule update --init --recursive

Then in node_modules_custom, initialize npm in subdirectories:
    npm install (could be that this is already triggered in root directory, when you type npm install after submodule update)

The project was written in Visual Studio Code, so if you are a developer it's recomended to use it
([Download](https://code.visualstudio.com/ "VSCode"))


There is also hard dependency on the ocr-tools used within this tool. 
At the moment tesseract is used. Others will follow, probably ocropus next.


## Commands to use nodejs_ocr
  Usage: $node app.js [options]

    Options:
    -o, --outputdir <dir>     Output directory
    -i, --inputdir <dir>      Input directory with html files
    -f, --inputfiles <files>  Input files
    -h, --help                output usage information



The standard for using the software is: 
    
    node app.js --inputfiles path\\to\\html\\file.html
	node app.js --inputdir   path\\to\\html\\directory

If you use visual-studio-code you can use the *launch.json* in *.vscode*-folder to run from vscode with specified parameters. It provides some basic examples which can be commented in. 



