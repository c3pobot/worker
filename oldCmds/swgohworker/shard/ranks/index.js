'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'Error getting payouts'}, sendMsg = 1
    const fields = await HP.GetRanks(shard)
    if(fields && fields.length > 0){
      let fieldLength = +fields.length, numMsgs = 1
      if(fieldLength > 5 && numMsgs == 1) numMsgs = Math.round( +fieldLength / 5)
      if(fieldLength > 5 && numMsgs == 1) numMsgs = 2
      if(numMsgs > 1) fieldLength = Math.round( +fields.length / numMsgs)
      const embedMsg = {
        color: 15844367,
        fields: []
      }
      let count = 0
      for(let i in fields){
        if(i == 0){
          embedMsg.title = HP.GetShardName(shard)+' Arena Ranks'
          if(shard.message && shard.message != 'default') embedMsg.description = shard.message.replace('<br>', '\n')
        }
        embedMsg.fields.push(fields[i])
        count++
        if(+i + 1 == fields.length && count < fieldLength) count = +fieldLength
        if(+i + 1 == fields.length){
          embedMsg.timestamp = new Date()
          embedMsg.footer = {text: 'Updated'}
        }
        if(count == fieldLength){
          await MSG.WebHookMsg(obj.token, {embeds: [JSON.parse(JSON.stringify(embedMsg))]}, 'POST')
          delete embedMsg.title
          delete embedMsg.description
          embedMsg.fields = []
          count = 0
        }
      }
      sendMsg = 0
      HP.RemoveJob(obj.id)
    }
    if(sendMsg) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
