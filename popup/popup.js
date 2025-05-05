document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["openaiApiKey"], (result) => {
    const hasApiKey = !!result.openaiApiKey;
    document.getElementById("apiSection").style.display = hasApiKey ? "none" : "block";
    document.getElementById("generateSection").style.display = hasApiKey ? "block" : "none";
  });

  document.getElementById("saveApiKey").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKeyInput").value;
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      document.getElementById("apiSection").style.display = "none";
      document.getElementById("generateSection").style.display = "block";
    });
  });

  document.getElementById("getSolution").addEventListener("click", () => {
    const language = document.getElementById("language").value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractText" }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById("output").textContent =
            "❌ Could not connect to the page. Try refreshing it.";
          return;
        }

        if (response?.text) {
          const prompt = response.text.trim();
          let instruction = language === "Auto"
            ? "Detect the best programming language and solve it."
            : `Solve this problem in ${language}.`;

          if (prompt.toLowerCase().includes("design") || prompt.toLowerCase().includes("architecture")) {
            instruction += " Also provide high-level and low-level system design insights if applicable.";
          }

          chrome.runtime.sendMessage(
            { action: "generateSolution", text: `${instruction}\n\n${prompt}`, language },
            (res) => {
              if (!res || !res.solution) {
                document.getElementById("output").textContent = "⚠️ No solution received or an error occurred.";
                return;
              }
              document.getElementById("output").textContent = res.solution;
            }
          );
        } else {
          document.getElementById("output").textContent =
            "⚠️ No problem statement detected. Try selecting some content.";
        }
      });
    });
  });
});