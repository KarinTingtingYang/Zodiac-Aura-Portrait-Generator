# Zodiac Aura Portrait Generator ✨

**Live Demo:** [https://zodiac-portrait.glitch.me](https://zodiac-portrait.glitch.me)
**(Note: Glitch projects may take a few seconds to load initially if they've been idle.)**

## 🌟 Overview

The **Zodiac Aura Portrait Generator** is an interactive web application that allows users to create unique AI-generated portraits reflecting their zodiac sign and chosen aesthetic vibe. By simply uploading a photo, entering a birth date, and selecting gender/vibe, users can transform their image into a personalized "aura portrait."

This project demonstrates proficiency in full-stack web development, integrating a user-friendly frontend with a secure backend that interacts with advanced AI image generation APIs and image hosting services.

## ✨ Features

- **Personalized Aura Generation:** Input your birth date, gender, and preferred vibe to generate a unique portrait.
- **Secure Image Upload:** User-uploaded photos are securely handled and hosted via a server-side proxy to [ImgBB.com](https://imgbb.com), protecting API keys from public exposure.
- **AI-Powered Image-to-Image Transformation:** Leverages the Hugging Face Inference API with a Stable Diffusion model (specifically SDXL Base 1.0 for image-to-image) to transform user photos based on text prompts.
- **Dynamic Prompt Engineering:** Generates detailed AI prompts by incorporating user input (age, gender, zodiac sign, vibe) for more tailored results.
- **Responsive User Interface:** Provides clear feedback during the generation process (loading states, error messages).
- **Zodiac & Age Calculation:** Dynamically determines the user's zodiac sign and age from their birth date.

## 🚀 Technologies Used

**Frontend:**

- **HTML5:** Structure of the web application.
- **CSS3:** Styling, including a modern "Space Mono" font.
- **JavaScript (ES6+):** Dynamic interactions, API calls, user input handling, and UI updates.

**Backend (Node.js/Express):**

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Fast, unopinionated, minimalist web framework for building the API proxy.
- **`node-fetch`:** For making HTTP requests to external APIs (Hugging Face, ImgBB).
- **`dotenv`:** Securely managing API keys and environment variables.

**APIs & Services:**

- **Hugging Face Inference API:** For running the Stable Diffusion XL (SDXL) image-to-image model.
- **ImgBB API:** For free and secure image hosting of user uploads.
- **Glitch.com:** Hosting and development environment for the full-stack application.

## 🛠️ How to Use (Live Demo)

1.  **Visit the Live Demo:** Open [https://zodiac-portrait.glitch.me](https://zodiac-portrait.glitch.me) in your browser.
2.  **Enter Your Birth Date:** Use the date picker.
3.  **Select Your Gender & Vibe:** Choose from the dropdown options.
4.  **Upload Your Photo:** Click "Upload Your Photo" and select an image file.
5.  **Click "Generate Aura":** The button will change to "Generating..." and a loading overlay will appear.
6.  **View Your Aura Portrait:** Once generated, your unique portrait will be displayed below, along with your zodiac sign.

## ⚙️ Installation and Local Setup (For Developers)

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/zodiac-aura-generator.git](https://github.com/your-username/zodiac-aura-generator.git)
    cd zodiac-aura-generator
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    - Create a `.env` file in the root directory.
    - Obtain your API keys:
      - **Hugging Face API Key:** Sign up at [Hugging Face](https://huggingface.co/settings/tokens) and create a new token.
      - **ImgBB API Key:** Register at [ImgBB](https://imgbb.com/login) and get your API key from your dashboard.
    - Add your keys to the `.env` file:
      ```
      HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY
      IMGBB_API_KEY=YOUR_IMGBB_API_KEY
      ```
4.  **Start the server:**
    ```bash
    npm start
    ```
5.  **Access the application:** Open your browser and navigate to `http://localhost:3000` (or whatever port your server starts on).

## 💡 Challenges and Learnings

- **API Key Security:** A primary challenge was securely handling API keys for client-side applications. This was resolved by implementing a Node.js Express backend to proxy all sensitive API requests, keeping keys out of the frontend code and storing them as environment variables.
- **Image Handling:** Converting user-uploaded image files to Base64 for API transmission and then fetching and displaying AI-generated binary image data (also as Base64) required careful handling of file readers and buffer conversions.
- **Prompt Engineering:** Crafting effective prompts for the AI model involved experimenting with various descriptive terms and ensuring user inputs (gender, zodiac, age, vibe) were seamlessly integrated for targeted outputs.
- **Asynchronous Operations & UI Feedback:** Managing multiple asynchronous API calls (ImgBB upload, AI generation) and providing clear, non-blocking UI feedback (loading indicators, button states) was crucial for a smooth user experience.

## 📚 Future Enhancements

- Allow users to download the generated image.
- Implement more detailed prompt customization options.
- Add a gallery of previously generated images.
- Explore different AI models or fine-tuning for varied art styles.
- Improve error handling for specific API responses.
- Add user authentication to save user preferences or past generations.

## 🤝 Contributing

Feel free to fork this repository, open issues, or submit pull requests. All contributions are welcome!

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
