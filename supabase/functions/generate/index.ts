// Corrected Error Handling in index.ts

export const generateImage = async (request) => {
    try {
        // Assuming Gemini API call
        const response = await callGeminiAPI(request);
        if (!response || response.error) {
            throw new Error(response.error || 'Failed to generate image');
        }
        return response.imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error('Image generation failed. Please try again.');
    }
};

async function callGeminiAPI(request) {
    // Simulated API call - to be replaced with actual API call
    return new Promise((resolve, reject) => {
        // Simulate success or failure
        const success = Math.random() > 0.5;
        if (success) {
            resolve({ imageUrl: 'http://example.com/image.png' });
        } else {
            resolve({ error: 'Simulated API failure' });
        }
    });
}