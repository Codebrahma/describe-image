import * as fs from 'fs';
import * as base64 from 'base-64';
import axios from 'axios';

// OpenAI API Key
const apiKey: string = process.env.OPENAI_API_KEY || '';


// Function to encode the image
function encodeImage(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return base64.encode(imageBuffer.toString('binary'));
}

// Path to your image
const imagePath: string = "./image.jpg";

// Getting the base64 string
const base64Image: string = encodeImage(imagePath);

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
};

const payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What’s in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": `data:image/jpeg;base64,${base64Image}`
                    }
                }
            ]
        }
    ],
    "max_tokens": 300
};

axios.post("https://api.openai.com/v1/chat/completions", payload, { headers: headers })
    .then(response => {
        if (response.data.choices) {
            console.log(response.data.choices[0].message.content);
        } else {
            console.log('No choices found in the response.');
        }
    })
    .catch(error => {
        console.error(error);
    });
