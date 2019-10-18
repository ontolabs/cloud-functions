const firebase_test = require('firebase-functions-test')();

describe("slackNotify", () => {
  let wrapped: any;

  beforeEach( () => {
    jest.mock('@slack/client');
    firebase_test.mockConfig({ webhook: {url: 'MOCK_URL'}});
    const testFunctions = require('./index');
    wrapped = firebase_test.wrap(testFunctions.slackNotify);
  });

  it("with repoSource", async () => {
    const msg = firebase_test.pubsub.makeMessage(
      {
        status: 'FAILURE',
        source: {
          repoSource: {
            repoName: 'MOCK_REPO',
            repoBranch: 'MOCK_BRANCH'
          }
        }
      });
    await wrapped(msg);
  });

  it("with storageSource", async () => {
    const msg = firebase_test.pubsub.makeMessage(
      {
        status: 'FAILURE',
        source: {
          storageSource: {
            object: 'MOCK_OBJECT'      
          }
        },
        substitutions: {
          BRANCH_NAME: 'MOCK_BRANCH',
          REPO_NAME: 'MOCK_REPO'
        }
      });
    await wrapped(msg);
  });
});
