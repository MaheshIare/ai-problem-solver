document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
    document.getElementById('status').textContent = 'API key saved securely.';
  });
});