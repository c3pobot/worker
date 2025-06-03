'use strict'
const mongo = require('mongoclient')
const log = require('logger')
const { replyMsg } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    if(!obj.confirm?.id) return
    if(!(obj.confirm?.respId >= 0)) return

    let poll = (await mongo.find('poll', { _id: obj.confirm?.id }))[0]
    if(!poll?.status) return

    if(poll.votes?.filter(x=>x.dId == obj.member.user.id).length == 0){
      await mongo.push('poll', { _id: obj.confirm?.id }, { votes: { dId: obj.member.user.id, vote: obj.confirm?.respId, name: obj.member?.display_name }})
      await replyMsg(obj, { content: 'You vote was recorded', flags: 64 }, 'POST')
    }else{
      await replyMsg(obj, { content: 'You have already voted', flags: 64 }, 'POST')
    }
  }catch(e){
    log.error(e)
  }
}
