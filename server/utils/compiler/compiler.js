import https from "https";
export default function runCode(language, code, input = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      hostname: "online-code-compiler.p.rapidapi.com",
      port: null,
      path: "/v1/",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "online-code-compiler.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        resolve(JSON.parse(body));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(
      JSON.stringify({
        language: language,
        version: "latest",
        code: code,
        input: input,
      })
    );

    req.end();
  });
}
