document.getElementById('authenticate').addEventListener('click', function() {
    chrome.runtime.sendMessage({ authenticate: true });
  });
  