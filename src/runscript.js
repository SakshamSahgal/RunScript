const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

module.exports = (app) => {

    app.get("/script", (req, res) => {
        console.log(req.body);

        // Take the C++ script from the request body
        const scriptCode = req.body.script;

        // Name of the script and executable
        const scriptName = "script.cpp";
        const executableName = "script.exe";

        //path where the script will be stored on the server
        const scriptPath = path.join(__dirname, '..', 'public', scriptName);
        //path where the executable will be stored on the server
        const executablePath = path.join(__dirname, '..', 'public', executableName);

        // Save the script on the server
        fs.writeFile(scriptPath, scriptCode, (err) => {
            if (err) {

                console.log(err);
                res.status(500).send(`Error while saving the script on the server! Error: ${err}`);

            } else {

                // Execute the script and send the output to the client considering Windows environment 

                const compileAndRunCommand = `g++ -o ${executablePath} ${scriptPath} && ${executablePath}`;

                exec(compileAndRunCommand, (err, stdout, stderr) => {
                    if (err) {

                        console.log(err);
                        res.status(500).send(`Error while executing the script on the server! Error: ${err}`);

                    } else {

                        res.status(200).send(stdout);

                    }

                    //erase the executable file
                    if (fs.existsSync(executablePath)) {
                        fs.unlink(executablePath, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        });
    });

    app.get("/LinuxScript", (req, res) => {
        console.log(req.body);

        // Take the C++ script from the request body
        const scriptCode = req.body.script;

        // Name of the script and executable
        const scriptName = "script.cpp";
        const executableName = "script";

        //path where the script will be stored on the server
        const scriptPath = path.join(__dirname, '..', 'public', scriptName);
        //path where the executable will be stored on the server
        const executablePath = path.join(__dirname, '..', 'public', executableName);

        // Save the script on the server
        fs.writeFile(scriptPath, scriptCode, (err) => {
            if (err) {

                console.log(err);
                res.status(500).send(`Error while saving the script on the server! Error: ${err}`);

            } else {

                // Execute the script and send the output to the client considering Linux environment 

                const compileAndRunCommand = `g++ -o ${executablePath} ${scriptPath} && ./${executablePath}`;

                exec(compileAndRunCommand, (err, stdout, stderr) => {
                    if (err) {

                        console.log(err);
                        res.status(500).send(`Error while executing the script on the server! Error: ${err}`);

                    } else {

                        res.status(200).send(stdout);

                    }

                    //erase the executable file
                    if (fs.existsSync(executablePath)) {
                        fs.unlink(executablePath, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        });
    });
}