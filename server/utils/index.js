const { exec } = require("child_process");

module.exports.exec = (command) => {
  return new Promise((resolve, reject) => {
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) return resolve({ stderr: stderr || error.message });
        if (stderr) return resolve({ stderr });
        return resolve({ stdout });
      });
    } catch (err) {
      return reject(err);
    }
  });
};
