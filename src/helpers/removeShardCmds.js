'use strict'
const { RESTHandler } = require('./discordmsg')
module.exports = async(sId)=>{
  let cmds = [], count = 0, res = {status: 'error'}
  let status = await RESTHandler('/applications/'+process.env.DISCORD_CLIENT_ID+'/guilds/'+sId+'/commands', 'PUT', JSON.stringify(cmds))
  if(status?.status == 200) res.status = 'ok'
  return res
}
