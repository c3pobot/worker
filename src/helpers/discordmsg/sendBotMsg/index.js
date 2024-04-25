const sendRequest = require('./sendRequest')
module.exports = async(opts = {}, data = {})=>{
  let payload = {...opts, ...data}
  if(+opts.shardId >= 0) payload.podName = 'bot-'+opts.shardId
  payload.cmd = payload.method
  return await sendRequest(payload.cmd, payload)
}
