const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
// IMPORTANT: For image upload (especially large files), you might need a higher limit for JSON or use 'express-fileupload'
// The default JSON limit can be too small for Base64 encoded images.
app.use(express.json({ limit: '50mb' })); // Increase limit for Base64 image coming from frontend
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Good to include for form data if needed

// Environment variables
// Keep only the API keys you are actively using or might use.
// You still have Hugging Face setup, so we'll keep its key.
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_SDXL_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0";

// --- NEW: ImgBB API Key ---
const IMGBB_API_KEY = process.env.IMGBB_API_KEY; // This key MUST be in your .env file!

// Temporary console.log - remove when done debugging
console.log('Hugging Face API Key:', HUGGINGFACE_API_KEY ? 'Loaded' : 'Not Loaded');
console.log('ImgBB API Key:', IMGBB_API_KEY ? 'Loaded' : 'Not Loaded'); // Check if ImgBB key loaded


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve your index.html file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy endpoint for AI generation (now for Hugging Face)
app.post('/api/upload-image-to-imgbb', async (req, res) => {
    try {
        const { imageData } = req.body; // Expecting Base64 image data from frontend
        if (!imageData) {
            return res.status(400).json({ error: "No image data provided." });
        }

        // ImgBB API expects 'image' parameter as Base64 string (without "data:image/jpeg;base64," prefix).
        // Ensure your frontend sends it correctly or strip the prefix here.
        const base64Image = imageData.split(',')[1] || imageData; // Strip "data:image/jpeg;base64," if present

        const imgbbUploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Important for sending form data like this
            body: `image=${encodeURIComponent(base64Image)}`, // ImgBB expects 'image=' followed by Base64
        });

        if (!imgbbUploadResponse.ok) {
            const errorText = await imgbbUploadResponse.text();
            console.error("ImgBB Proxy Upload Error:", errorText);
            let errorDetails = errorText; // Default to raw text
            try {
                const errorJson = JSON.parse(errorText);
                errorDetails = errorJson.error && errorJson.error.message ? errorJson.error.message : errorText;
            } catch (e) {
                // Not JSON, use raw text
            }
            throw new Error(`ImgBB upload failed: ${errorDetails}`);
        }

        const imgbbData = await imgbbUploadResponse.json();

        if (imgbbData.success) {
            res.json({ imageUrl: imgbbData.data.url });
        } else {
            console.error("ImgBB API Response Error:", imgbbData);
            res.status(500).json({
                error: "Failed to upload image to ImgBB",
                details: imgbbData.error.message || "Unknown ImgBB error"
            });
        }

    } catch (error) {
        console.error("Server-side ImgBB upload proxy error:", error);
        res.status(500).json({
            error: "An internal server error occurred during image upload.",
            details: error.message
        });
    }
});

// Proxy endpoint for AI generation (now for Hugging Face)
app.post('/api/generate-aura', async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body; // imageUrl from ImgBB (now proxied through your server)

    // Validate input
    if (!prompt || !imageUrl) {
      return res.status(400).json({ error: "Missing prompt or image URL" });
    }

    // --- Fetch the image from ImgBB URL and convert to Base64 ---
    // This part is still needed because Hugging Face expects the Base64 image data.
    let base64Image = null;
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from ImgBB: ${imageResponse.statusText}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer(); // Get binary data
      base64Image = Buffer.from(imageBuffer).toString('base64'); // Convert to Base64
    } catch (imageFetchError) {
      console.error("Error fetching or converting image from ImgBB:", imageFetchError);
      return res.status(500).json({
        error: "Failed to process uploaded image (for Hugging Face)",
        details: imageFetchError.message
      });
    }

    // --- Call Hugging Face Inference API ---
    const huggingFaceResponse = await fetch(`https://api-inference.huggingface.co/models/${HF_SDXL_MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          image: `data:image/jpeg;base64,${base64Image}`,
          strength: 0.3,
          num_inference_steps: 50
        }
      })
    });

    // --- Handle the Hugging Face API response ---
    if (!huggingFaceResponse.ok) {
      const errorText = await huggingFaceResponse.text();
      console.error("Hugging Face API Error Response:", errorText);
      let errorDetails = "Unknown Hugging Face API error";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error || errorText;
      } catch (e) {
        // Not JSON, use raw text
      }
      throw new Error(`Hugging Face API failed: ${errorDetails}`);
    }

    const generatedImageBuffer = await huggingFaceResponse.arrayBuffer();
    const base64GeneratedImage = Buffer.from(generatedImageBuffer).toString('base64');

    const outputMimeType = huggingFaceResponse.headers.get('Content-Type') || 'image/png';
    const resultUrl = `data:${outputMimeType};base64,${base64GeneratedImage}`;

    res.json({ output: [resultUrl] });

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({
      error: "Failed to generate aura",
      details: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});