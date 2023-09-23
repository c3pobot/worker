'use strict'
const { GetOptValue, ReplyMsg } = require('helpers')
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = [])=>{
  try{
    let patreon, msg2send = {content: 'You did not provide the correct information'}
    let dId = GetOptValue(opt, 'user')
    if(dId){
      msg2send.content = 'Could not find that patreon'
      patreon = (await mongo.find('patreon', { _id: dId }))[0]
    }
    if(patreon?._id){
      msg2send.content = 'patreon removed'
      await mongo.del('patreon', {_id: patreon._id})
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
