'use stict'
const log = require('logger')
const { ReplyError, ReplyMsg } = require('helpers')
module.exports = (obj = {})=>{
  try{
    let min = 1, max = 100
    if(obj.data.options && obj.data.options.find(x=>x.name == 'min')) min = obj.data.options.find(x=>x.name == 'min').value
    if(obj.data.options && obj.data.options.find(x=>x.name == 'max')) max = obj.data.options.find(x=>x.name == 'max').value
    const msg2Send = {content: 'Random number between **'+min+'** and **'+max+'**\n```\n'}
    msg2Send.content += Math.floor(Math.random() * (max - min + 1)) + min
    msg2Send.content += '\n```\n'
    ReplyMsg(obj, msg2Send)
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
