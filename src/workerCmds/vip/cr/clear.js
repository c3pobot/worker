'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Nothing was changed'}
    let confirm = GetOptValue(opt, 'confirm')
    if(confirm == 'yes'){
      await mongo.del('reactions', {_id: obj.member.user.id})
      msg2send.content = 'All Personal Custom Reactions have been cleared'
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
