'use strict'
const { GetOptValue, DiscordQuery, ReplyMsg } = require('helpers')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    let id = GetOptValue(opt, 'id')
    if(id){
      msg2send.content = 'Error finding user **'+id+'**'
      const usr = await DiscordQuery('users/'+id)
      if(usr){
        const embedMsg = {
          color: 15844367,
          description: 'dId '+id+' info for C3PO\n```\n'
        }
        embedMsg.description += 'Member        : @'+usr.username+'\n'
        embedMsg.description += 'Member Tag    : @'+usr.username+'#'+usr.discriminator+'\n'
        embedMsg.description += '```'
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
