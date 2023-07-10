'use strict'
module.exports = async(obj, opt)=>{
  try{
    //BotSocket.send('GetSyncTime', {})
    let msg2send = {content: 'Requested sync times'}
    const metrics = await mongo.find('metrics', {})
    if(metrics && metrics.length > 0){
      const embedMsg = {
        color: 15844367,
        description: 'Shard/Arena/Guild Avg sync times',
        fields: []
      }
      for(let i in metrics){
        const tempField = {
          name: metrics[i]._id,
          value: '```\n'
        }
        if(metrics[i]._id == 'arena'){
          const patreons = await mongo.find('patreon', {status: 1})
          if(patreons && patreons.length > 0){
            let userCount = 0, guildCount = 0
            for(let p in patreons){
              if(patreons[p].users) userCount += +patreons[p].users.length
              if(patreons[p].guild) guildCount += +patreons[p].guilds.length
            }
            tempField.name += ' Patreons ('+patreons.length+') P ('+userCount+') G ('+guildCount+')'
          }
        }
        if(metrics[i]._id == 'guild'){
          const guildCount = await mongo.count('guilds', {sync: 1})
          tempField.name += ' ('+guildCount+')'
        }
        if(metrics[i]._id == 'shard'){
          const shards = await mongo.count('payoutServers', {status: 1})
          const shardPlayers = await mongo.count('shardPlayers', {})
          tempField.name += ' S ('+shards+') P ('+shardPlayers+')'
        }
        tempField.value += 'Pass Avg time               : '+numeral(metrics[i].time / metrics[i].passCount).format('0.00')+' seconds\n'
        if(metrics[i].shardCount) tempField.value += 'Shard Avg time              : '+numeral(metrics[i].time / metrics[i].shardCount).format('0.00')+' seconds\n'
        if(metrics[i].history && metrics[i].history.length > 0){
          if(metrics[i].history[+metrics[i].history.length - 1]) tempField.value += 'Last Sync time              : '+metrics[i].history[+metrics[i].history.length - 1].time+' seconds\n'
          let histTime = 0, histShardCount = 0
          for(let h in metrics[i].history){
            histTime += metrics[i].history[h].time || 0
            histShardCount += metrics[i].history[h].shardCount || 0
          }
          if(histTime) tempField.value += 'Last '+(metrics[i].history.length).toString().padStart(2, '0')+' pass Avg time       : '+numeral(histTime / +metrics[i].history.length).format('0.00')+' seconds\n'
          if(histShardCount && histTime) tempField.value += 'Last '+(metrics[i].history.length).toString().padStart(2, '0')+' pass Shard Avg time : '+numeral(histTime / +histShardCount).format('0.00')+' seconds\n'
        }
        tempField.value += '```'
        embedMsg.fields.push(tempField)
      }
      if(embedMsg.fields.length > 0){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
  HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
