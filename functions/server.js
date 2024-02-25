const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = 3000;

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = "AIzaSyD_sD1sDSToBchi5Uk5LnyrfnMmIgwuud4"; // 여기에 Google API 키를 입력하세요.

app.post("/generateRecipe", upload.single('myImage'), async (req, res) => {
  try {
    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Process the uploaded file (req.file.buffer)
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const parts = [
      { inlineData: { mimeType: "image/jpeg", data: req.file.buffer.toString("base64") } },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    res.send(response.text());
  } catch (error) {
    console.error('GoogleGenerativeAI Error:', error);
    res.status(500).send("Internal Server Error");
  }
});

// Serve the client-side HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});