'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Nothing was changed'}
    let confirm = await GetOptValue(opt, 'confirm')
    if(confirm === 'yes'){
      await mongo.del('reactions', {_id: obj.guild_id})
      msg2send.content = 'All Custom Reactions for this server have been cleared'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
