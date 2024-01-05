document.getElementById('queryForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
        const textareaValue = document.getElementById('sql_query').value;
        displayThinkingMessage();
        const generatedResponse = await generateResponse(textareaValue);
        displayGeneratedResponse(generatedResponse);
    } catch (error) {
        console.error('Error:', error);
    }
});

const displayThinkingMessage = () => {
    const outputBox = document.querySelector('.output-box');
    outputBox.innerHTML = "<p>Typing...</p>";
};

const API_KEY = "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";

const getRequestOptionsForOpenAI = (userMessage) => {
    // Define the properties and message for the API request
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-16k",
            messages: [
                { role: "system", content: snowflakeData},
                { role: "user", content: userMessage }
            ],
        })
    };
};

const generateResponse = async (userMessage) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await fetch(API_URL, getRequestOptionsForOpenAI(userMessage));
        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const responseText = data.choices[0].message.content.trim();
            return responseText;
        } else {
            throw new Error('Empty response from Model');
        }
    } catch (error) {
        console.error('Error:', error);
        return "Error: Unable to generate a response. Please try again.";
    }
};

const displayGeneratedResponse = (response) => {
    const outputBox = document.querySelector('.output-box');
    outputBox.innerHTML = `<p>Response :</p><p>${response}</p>`;
};

window.onload = () => {
    const requestOptionsForServer = {
        method: "GET",
        cache: "no-cache",
        headers: {}
    };
    fetch("http://localhost:5000/table-data", requestOptionsForServer)
        .then(res => res.text())
        .then(data => {
            snowflakeData = data;
        });   
}