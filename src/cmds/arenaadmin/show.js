'use strict'
const mongo = require('mongoclient')
const { botRequest, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'There are no patreons'}
  let patreons = await mongo.find('patreon', {})
  if(!patreons || patreons?.length === 0) return msg2send
  msg2send.embeds = []
  for(let i=0, j = patreons.length; i < j; i +=25){
    let tempArray = patreons.slice(i, i + 25)
    if(tempArray.length > 0){
      let embedMsg = {
        color: 15844367,
        description: 'Status : Name\n```\n'
      }
      if(i == 0) embedMsg.title = 'C3PO Arena sync patreons'
      for(let p in tempArray){
        let user = await botRequest('getMember', {podName: 'bot-0', dId: tempArray[p]._id})
        embedMsg.description += tempArray[p].status+'   : @'+(user ? user.tag:tempArray[p]._id)+'\n'
      }
      embedMsg.description += '```'
      msg2send.embeds.push(embedMsg)
    }
  }
  msg2send.content = null
  return msg2send
}
