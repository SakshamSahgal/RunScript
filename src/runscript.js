const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

function EraseScriptFile(executablePath) {
    // Erase the executable file
    if (fs.existsSync(executablePath)) {
        fs.unlink(executablePath, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}


module.exports = (app) => {

    app.get("/script", (req, res) => {

        let resSend = false;


        console.log(req.body);

        // Take the C++ script from the request body
        const scriptCode = req.body.script;

        // Name of the script and executable
        const scriptName = "script.cpp";
        const executableName = "script.exe";

        // Path where the script will be stored on the server
        const scriptPath = path.join(__dirname, '..', 'public', scriptName);
        // Path where the executable will be stored on the server
        const executablePath = path.join(__dirname, '..', 'public', executableName);

        // Declare scriptProcess outside the fs.writeFile callback
        let scriptProcess = null;

        // Save the script on the server
        fs.writeFile(scriptPath, scriptCode, (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: "Compilation Error !",
                    error: err
                });
            } else {
                try {
                    // Execute the script and send the output to the client considering Windows environment
                    const compileAndRunCommand = `g++ -o ${executablePath} ${scriptPath} && ${executablePath}`;

                    const executionTimeout = 5000; // 5 seconds timeout

                    // Set a timeout for script execution
                    const timeoutId = setTimeout(() => {
                        if (scriptProcess) {
                            scriptProcess.kill();
                        }
                        if (!resSend) {
                            res.json({
                                success: false,
                                message: "Execution Timeout !",
                                error: "The script took too long to execute."
                            })
                            resSend = true;
                        }
                        EraseScriptFile(executablePath);
                    }, executionTimeout);

                    scriptProcess = spawn('sh', ['-c', compileAndRunCommand]);

                    scriptProcess.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                        if (!resSend) {
                            res.json({
                                success: true,
                                message: "Script executed successfully !",
                                output: `${data}`
                            })
                            resSend = true;
                        }
                        clearTimeout(timeoutId); // Clear the timeout if execution completes before the timeout
                    });

                    scriptProcess.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                        if (!resSend) {
                            res.json({
                                success : false,
                                message : "Compilation Error !",
                                error : `${data}`
                            })
                            resSend = true;
                        }
                        clearTimeout(timeoutId); // Clear the timeout if execution completes before the timeout
                    });

                    scriptProcess.on('close', (code) => {
                        if (!resSend) {
                            res.send({
                                success: true,
                                message: "Script executed successfully !",
                                output: `Script exited with code ${code}`
                            });
                            resSend = true;
                        }
                        clearTimeout(timeoutId); // Clear the timeout if execution completes before the timeout
                        EraseScriptFile(executablePath);
                    });
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    });
};