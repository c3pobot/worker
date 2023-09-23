'use strict'
const BOT_NODE_NAME_PREFIX = process.env.BOT_NODE_NAME_PREFIX || 'bot'
const { ReplyMsg } = require('helpers')
const mongo = require('mongoclient')
const BotRequest = require('botrequest')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'There are no patreons'}
    let patreons = await mongo.find('patreon', {})
    if(patreons?.length > 0){
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
            let user = await BotRequest('getMember', {podName: `${BOT_NODE_NAME_PREFIX}-0`, dId: tempArray[p]._id})
            embedMsg.description += tempArray[p].status+'   : @'+(user ? user.tag:tempArray[p]._id)+'\n'
          }
          embedMsg.description += '```'
          msg2send.embeds.push(embedMsg)
        }
      }
      msg2send.content = null
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
