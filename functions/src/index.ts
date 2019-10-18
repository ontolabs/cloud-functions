import * as functions from 'firebase-functions';
import { IncomingWebhook } from '@slack/client';

const WEBHOOK_URL = functions.config().webhook.url;
const webhook = new IncomingWebhook(WEBHOOK_URL);

export const slackNotify = functions.pubsub.topic('cloud-builds').onPublish(async (message) => {
  let buildData = null;
  try {
    buildData = message.json;
  } catch (e) {
    console.error(e);
  }
  const status = ['SUCCESS', 'FAILURE'];
  if (status.indexOf(buildData.status) >= 0) {
    const color = (buildData.status === 'SUCCESS') ? '#36a64f':'#ff696e';
    const prefix = (buildData.status === 'SUCCESS') ? '✔':'✘';
    let repoName = 'unknown';
    let branchName = 'unknown';
    if (buildData.source.repoSource) {
      // Handle repoSource repos
      repoName = buildData.source.repoSource.repoName;
      branchName = buildData.source.repoSource.branchName;
    } else {
      // Handle storageSource repos
      repoName = buildData.substitutions.REPO_NAME;
      branchName = buildData.substitutions.BRANCH_NAME;
    }
    const notification = {
      text: `${prefix} ${repoName} \`${branchName}\` build`,
      mrkdwn: true,
      attachments: [
        {
          color: color,
          title: 'Build logs',
          title_link: buildData.logUrl,
          fields: [{
            title: 'Status',
            value: buildData.status
          }]
        }
      ]
    };
    await webhook.send(notification);
  }
  return null;
});

