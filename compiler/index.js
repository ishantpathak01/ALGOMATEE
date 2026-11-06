import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.json());

app.use(cors({ origin: "http://localhost:8000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/compile", (req, res) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  if (code.length > 10000) {
    return res.status(400).json({ error: "Code exceeds size limit" });
  }

  const filename = `script.${
    language === "python"
      ? "py"
      : language === "cpp"
      ? "cpp"
      : language === "java"
      ? "java"
      : "js"
  }`;
  const filePath = path.join(__dirname, filename);

  fs.writeFileSync(filePath, code);

  if (input) {
    fs.writeFileSync(path.join(__dirname, "user_input.txt"), input);
  }

  let command;

  if (language === "python") {
    command = `docker run --rm --memory=100m --cpus="1.0" -i -v "${__dirname}:/app" -w /app python:3.9 sh -c "python ${filename} < /app/user_input.txt"`;
  } else if (language === "cpp") {
    command = `docker run --rm --memory=100m --cpus="1.0" -i -v "${__dirname}:/app" -w /app gcc:latest sh -c "g++ ${filename} -o main && ./main < /app/user_input.txt"`;
  } else if (language === "java") {
    command = `docker run --rm --memory=100m --cpus="1.0" -i -v "${__dirname}:/app" -w /app openjdk:latest sh -c "javac ${filename} && java Main < /app/user_input.txt"`;
  } else if (language === "javascript") {
    command = `docker run --rm --memory=100m --cpus="1.0" -i -v "${__dirname}:/app" -w /app node:latest sh -c "node ${filename} < /app/user_input.txt"`;
  } else {
    return res.status(400).json({ error: "Unsupported language" });
  }

  if (input) {
    fs.writeFileSync(path.join(__dirname, "user_input.txt"), input);
  }

  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    fs.unlinkSync(filePath);
    if (input) fs.unlinkSync(path.join(__dirname, "user_input.txt"));

    if (error) {
      if (error.killed) {
        return res.status(408).json({ error: "Execution timed out" });
      }
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout.trim(), stderr: stderr.trim() });
  });
});

app.listen(8080, () =>
  console.log("Code execution server running on port 8080")
);
