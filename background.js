function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["openaiApiKey"], (result) => {
      resolve(result.openaiApiKey || "");
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateSolution") {
    (async () => {
      const apiKey = await getApiKey();
      const prompt = request.text;
      if (!apiKey) {
        sendResponse({ solution: "❌ API key not set. Please enter it in the extension settings." });
        return;
      }

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a coding and system design expert." },
              { role: "user", content: prompt }
            ]
          })
        });

        const data = await response.json();

        if (data.error) {
          sendResponse({ solution: `❌ OpenAI Error: ${data.error.message}` });
        } else if (data.choices?.[0]?.message?.content) {
          sendResponse({ solution: data.choices[0].message.content });
        } else {
          sendResponse({ solution: "⚠️ No response from the AI model." });
        }
      } catch (error) {
        sendResponse({ solution: `❌ API Error: ${error.message}` });
      }
    })();

    return true;
  }
});