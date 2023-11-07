#!/usr/bin/env node

import * as fs from "fs";
import * as base64 from "base-64";
import axios from "axios";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// OpenAI API Key
const apiKey: string = process.env.OPENAI_API_KEY || "";

// Function to encode the image
function encodeImage(imageBuffer: Buffer): string {
  return base64.encode(imageBuffer.toString("binary"));
}

// Set up the CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("file", {
    alias: "f",
    type: "string",
    description: "Path to the image file",
  })
  .parseSync();

// Read the image file from the path or from the input stream
// Function to read image from file or stdin
function getImageBuffer(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (argv.file) {
      // Read image from file
      fs.readFile(argv.file, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    } else {
      // Read from stdin
      const chunks: Buffer[] = [];
      process.stdin.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      process.stdin.on("end", () => resolve(Buffer.concat(chunks)));
      process.stdin.on("error", (err) => reject(err));
    }
  });
}

getImageBuffer().then((imageBuffer) => {
  const base64Image: string = encodeImage(imageBuffer);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const payload = {
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What’s in this image?",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  axios
    .post("https://api.openai.com/v1/chat/completions", payload, {
      headers: headers,
    })
    .then((response) => {
      if (response.data.choices) {
        console.log(response.data.choices[0].message.content);
      } else {
        console.log("No choices found in the response.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
});
