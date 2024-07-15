document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', async function(event) {
        const submissionId = getSubmissionId(); // Implement this function to get the submission ID
        const submissionDetails = await fetchSubmissionDetails(submissionId);
        chrome.runtime.sendMessage({ submissionDetails });
      });
    } else {
      console.error('Form element not found');
    }
  });
  
  async function fetchSubmissionDetails(submissionId) {
    const client = new GraphQLClient('https://leetcode.com/graphql');
    const query = `query submissionDetails($submissionId: Int!) {
  submissionDetails(submissionId: $submissionId) {
    runtime
    runtimeDisplay
    runtimePercentile
    runtimeDistribution
    memory
    memoryDisplay
    memoryPercentile
    memoryDistribution
    code
    timestamp
    statusCode
    user {
      username
      profile {
        realName
        userAvatar
      }
    }
    lang {
      name
      verboseName
    }
    question {
      questionId
      acRate
      difficulty
      freqBar
      frontendQuestionId: questionFrontendId
      isFavor
      paidOnly: isPaidOnly
      content
      status
      title
      titleSlug
      topicTags {
        name
        id
        slug
      }
      hasSolution
      hasVideoSolution
    }
    notes
    topicTags {
      tagId
      slug
      name
    }
    runtimeError
    compileError
    lastTestcase
  }
}
`;
    const data = await client.request(query, { submissionId });
    return data.submissionDetails;
  }
  
  function getSubmissionId() {
    // Implement this function to retrieve the submission ID from the page
    return 'submission_id_placeholder'; // Placeholder value
  }
  