chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.authenticate) {
      const accessToken = await authenticateWithLinkedIn();
      chrome.storage.sync.set({ linkedinAccessToken: accessToken });
    } else if (request.submissionDetails) {
      chrome.storage.sync.get(['linkedinAccessToken'], async function(result) {
        const accessToken = result.linkedinAccessToken;
        if (accessToken) {
          await postToLinkedIn(accessToken, request.submissionDetails);
        } else {
          console.error('No LinkedIn access token found');
        }
      });
    }
  });
  
  async function authenticateWithLinkedIn() {
    const clientId = 'YOUR_LINKEDIN_CLIENT_ID';
    const redirectUri = chrome.identity.getRedirectURL();
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, async function(responseUrl) {
        if (chrome.runtime.lastError || responseUrl.includes('error=')) {
          reject(chrome.runtime.lastError ? chrome.runtime.lastError : new Error('OAuth2 authentication failed'));
          return;
        }
  
        const urlParams = new URLSearchParams(new URL(responseUrl).search);
        const authCode = urlParams.get('code');
        const accessToken = await fetchLinkedInAccessToken(authCode, clientId, redirectUri);
        resolve(accessToken);
      });
    });
  }
  
  async function fetchLinkedInAccessToken(authCode, clientId, redirectUri) {
    const clientSecret = 'YOUR_LINKEDIN_CLIENT_SECRET';
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });
  
    const data = await response.json();
    return data.access_token;
  }
  
  async function postToLinkedIn(accessToken, submissionDetails) {
    fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        "author": `urn:li:person:YOUR_LINKEDIN_URN`,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
          "com.linkedin.ugc.ShareContent": {
            "shareCommentary": {
              "text": `I just solved a problem on LeetCode! Here's my solution:\n\n${submissionDetails.code}`
            },
            "shareMediaCategory": "NONE"
          }
        },
        "visibility": {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      })
    }).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }
  