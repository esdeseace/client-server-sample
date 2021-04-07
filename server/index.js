const fs = require("fs");
const path = require("path");

const { exec } = require("./utils");

// Load environment variable
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

// USe cors
const cors = require("cors");
app.use(cors());

// Use log dev
const morgan = require("morgan");
app.use(morgan("dev"));

// Use bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TYPE = {
  CPP: {
    name: "C++",
    extension: "cpp",
    command: process.env.GCC || "g++",
  },
  PYTHON: {
    name: "Python",
    extension: "py",
    command: process.env.PYTHON || "python",
  },
};

app.post("/api/code", async (req, res) => {
  const { code, type = TYPE.CPP.name } = req.body;

  const codeType = Object.keys(TYPE).find((key) => TYPE[key].name === type);
  if (!codeType) {
    res.send({
      success: false,
      message: "Type isn;t valid",
    });
    return;
  }

  if (typeof code !== "string" || code == "") {
    res.send({
      success: false,
      message: "Code isn't valid",
    });
    return;
  }

  try {
    // Write code to file
    const fileName = `${Date.now()}.${TYPE[codeType].extension}`;
    const file = path.join(__dirname, "files", fileName);
    await fs.writeFileSync(file, code);

    // Run file
    const { stdout, stderr } = await exec(`${TYPE[codeType].command} ${file}`);

    // Delete file
    fs.unlink(file, () => {});

    if (stderr && stderr != "") {
      const name = `main.${TYPE[codeType].extension}`;
      const data = stderr.split(file).join(name);
      res.send({ success: true, data: data });
      return;
    }

    res.send({ success: true, data: stdout });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server run in http://localhost:${PORT}/`);
});
