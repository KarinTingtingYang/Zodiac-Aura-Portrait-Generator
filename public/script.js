// script.js

// --- 1. Select HTML Elements ---
const birthdayInput = document.getElementById('birthday');
const genderSelect = document.getElementById('gender');
const vibeSelect = document.getElementById('vibe');
const imageUploadInput = document.getElementById('photo');

// Select the button using its tag name. If you have multiple buttons,
// consider adding an ID to your "Generate Aura" button (e.g., id="generateAuraBtn")
// and use document.getElementById('generateAuraBtn') for more precision.
const generateButton = document.querySelector('button'); // Selects the first <button> element

const resultSection = document.getElementById('result');
const zodiacSpan = document.getElementById('zodiac');
const auraArtImage = document.getElementById('auraArt');
const auraDescriptionParagraph = document.getElementById('auraDescription');

const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const errorMessageDisplay = document.getElementById('errorMessage');

// --- 2. Define Helper Functions ---
function displayResult(imageUrl, zodiacText, auraDescription) {
    // Clear any previous error messages
    if (errorMessageDisplay) {
        errorMessageDisplay.textContent = '';
        errorMessageDisplay.style.display = 'none';
    }

    if (imageUrl) { // If an image URL is provided, display the result
        if (auraArtImage) {
            auraArtImage.src = imageUrl;
            auraArtImage.classList.remove('hidden'); // Show the image
        }
        if (zodiacSpan) {
            zodiacSpan.textContent = zodiacText || ''; // Update zodiac text
        }
        if (auraDescriptionParagraph) {
            auraDescriptionParagraph.textContent = auraDescription || ''; // Update description
        }
        if (resultSection) {
            resultSection.classList.remove('hidden'); // Show the result section container
        }
        // Optional: Scroll to the result for better UX on smaller screens
        // if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else { // If called without an image URL (to clear results)
        if (auraArtImage) {
            auraArtImage.src = '';
            auraArtImage.classList.add('hidden'); // Hide the image
        }
        if (zodiacSpan) {
            zodiacSpan.textContent = ''; // Clear zodiac text
        }
        if (auraDescriptionParagraph) {
            auraDescriptionParagraph.textContent = ''; // Clear description
        }
        if (resultSection) {
            resultSection.classList.add('hidden'); // Hide the result section container
        }
    }
}

function displayError(message) {
    // Always hide results when an error occurs
    if (resultSection) {
        resultSection.classList.add('hidden');
    }
    if (auraArtImage) {
        auraArtImage.src = '';
        auraArtImage.classList.add('hidden');
    }
    if (zodiacSpan) {
        zodiacSpan.textContent = ''; // Clear zodiac text
    }
    if (auraDescriptionParagraph) {
        auraDescriptionParagraph.textContent = ''; // Clear description
    }

    if (message) { // If a message is provided, display it
        if (errorMessageDisplay) {
            errorMessageDisplay.textContent = message;
            errorMessageDisplay.style.display = 'block'; // Show the error message container
        }
    } else { // If called without a message (to clear errors)
        if (errorMessageDisplay) {
            errorMessageDisplay.textContent = '';
            errorMessageDisplay.style.display = 'none'; // Hide the error message container
        }
    }
}

// --- 3. Zodiac Calculation Function ---
function getZodiac(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
    return "Unknown Zodiac";
}

// --- 4. Age Calculation Function ---
function calculateAge(birthdayString) {
    const today = new Date();
    const birthDate = new Date(birthdayString);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// --- 5. Image Upload Proxy Function (no changes here) ---
async function uploadImageToServer(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;

            try {
                const response = await fetch('/api/upload-image-to-imgbb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageData: base64Image }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Server-side image upload failed: ${errorData.details || response.statusText}`);
                }

                const data = await response.json();
                resolve(data.imageUrl);

            } catch (error) {
                console.error("Error uploading image to server for ImgBB:", error);
                reject(error);
            }
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(imageFile);
    });
}

// --- 6. Main Aura Generation Function (modified for button behavior) ---
async function generateAura() {
    // --- Step A: UI State - Start Generation ---
    // Clear any previous results and errors from the display
    displayError('');
    displayResult(''); // Will hide result section and image

    // Change button text and disable it to prevent multiple clicks
    if (generateButton) {
        generateButton.textContent = 'Generating...';
        generateButton.disabled = true;
    }

    // Show loading overlay
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (loadingText) loadingText.textContent = 'Starting generation...'; // Initial message

    // Get input values
    const birthday = birthdayInput.value;
    const gender = genderSelect.value;
    const vibe = vibeSelect.value;
    const photo = imageUploadInput.files[0];

    // Input validation (now done after showing loading state)
    if (!birthday) {
        displayError("Please enter your birth date.");
        // We'll catch this in the finally block to reset the button
        return;
    }
    if (!photo) {
        displayError("Please upload your photo first!");
        // We'll catch this in the finally block to reset the button
        return;
    }

    // Calculate zodiac and age
    const zodiac = getZodiac(birthday);
    const age = calculateAge(birthday);
    console.log("Calculated Age:", age); // For testing

    // Define the aura prompt
    let auraPrompt = "";
    switch (vibe) {
        case "ethereal": auraPrompt = "ethereal glow, soft atmospheric, delicate light"; break;
        case "cyberpunk": auraPrompt = "cyberpunk neon lights, dystopian cityscape, glowing wires"; break;
        case "mystic": auraPrompt = "ancient mysticism, arcane symbols, deep magical glow"; break;
        case "celestial": auraPrompt = "cosmic stardust, swirling galaxy, nebulae colors"; break;
        case "crystalline": auraPrompt = "shimmering crystal facets, glowing gemstone light"; break;
        case "bioluminescent": auraPrompt = "glowing organic patterns, natural light, glowing flora"; break;
        case "vaporwave": auraPrompt = "pastel neon aesthetic, retro grid lines, synthwave glow"; break;
        case "painterly": auraPrompt = "expressive brushstrokes, watercolor texture, artistic render"; break;
        default: auraPrompt = "magical aura, glowing colors";
    }

    const finalPrompt = `portrait of a ${age}-year-old ${gender}, ${zodiac} aura, ${auraPrompt}, high detail, intricate, digital art`;

    try {
        // Step 1: Upload photo to your backend (which then uses ImgBB)
        if (loadingText) loadingText.textContent = 'Uploading image...';
        const imageUrl = await uploadImageToServer(photo);
        console.log("Image uploaded to ImgBB via proxy:", imageUrl);

        // Update loading text for AI generation
        if (loadingText) loadingText.textContent = 'Generating aura...';

        // Step 2: Call your AI generation proxy endpoint
        const proxyResponse = await fetch('/api/generate-aura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: finalPrompt,
                imageUrl: imageUrl
            })
        });

        if (!proxyResponse.ok) {
            const errorData = await proxyResponse.json();
            throw new Error(`AI generation failed: ${errorData.details || proxyResponse.statusText}`);
        }
        const proxyData = await proxyResponse.json();

        console.log("AI Generation Proxy Data:", proxyData);

        if (proxyData.error || !proxyData.output || proxyData.output.length === 0) {
            throw new Error(`AI generation failed: ${proxyData.details || 'No image output from AI.'}`);
        }
        const resultUrl = proxyData.output[0];

        // Display results and descriptive text
        const auraDescription = `Behold, your majestic ${zodiac} aura in a ${vibe} style!`;
        displayResult(resultUrl, zodiac, auraDescription);

    } catch (error) {
        console.error("Overall generation error:", error);
        displayError(`Ouch! An error occurred: ${error.message}. Please try again.`);
    } finally {
        // --- Step B: UI State - End Generation ---
        // Always hide the loading indicator
        if (loadingOverlay) loadingOverlay.style.display = 'none';

        // Reset button text and re-enable it
        if (generateButton) {
            generateButton.textContent = 'Generate Aura';
            generateButton.disabled = false;
        }
    }
}