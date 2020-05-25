const REGION = "asia-northeast1"
import * as functions from 'firebase-functions'
import * as request from 'request-promise'

//--- Change ---- 
const CHANNEL_ACCESS_TOKEN = ''
const CLOUD_PROJECT_ID = ''
const MESSAGE_REQUEST_ID = ''
// --------------

const LINE_INSIGHT_API = 'https://api.line.me/v2/bot/insight/message/event'
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
}
const {BigQuery} = require('@google-cloud/bigquery')
let bigQuery = new BigQuery({ projectId: `${CLOUD_PROJECT_ID}` })

exports.importInsight = functions.region(REGION).pubsub.schedule('every 10 minutes').onRun(async(context) => {
  const insight = await getInsight(`${MESSAGE_REQUEST_ID}`)
  if (insight.overview) {
    const data = {
      requestId: insight.overview.requestId,
      timestamp: insight.overview.timestamp,
      delivered: insight.overview.delivered,
      uniqueImpression: insight.overview.uniqueImpression,
      uniqueClick: insight.overview.uniqueClick
    }
    bigQuery.dataset('insight').table('message').insert(data)
  }
})

const getInsight = (requestId:String) => {
  const options = {
    headers: LINE_HEADER,
    method: 'GET',
    uri: `${LINE_INSIGHT_API}?requestId=${requestId}`,
    json: true
  }
  return request(options)
}


