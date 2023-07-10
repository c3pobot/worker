'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, pObj, gaInfo
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      gaInfo = await GetGAInfo(dObj.allyCode)
      if(!gaInfo) gaInfo = {enemies:[], units: []}
    }
    if(gaInfo.enemies.length > 0){
      msg2send.content = 'Error getting player info'
      pObj = await Client.post('fetchPlayer', {allyCode: +dObj.allyCode}, null)
    }
    if(pObj && pObj.allyCode){
      msg2send.embeds = []
      msg2send.content = null
      const enemyMsg = {
        color: 15844367,
        title: pObj.name+' GA opponents',
        description: ''
      }
      if(gaInfo.TTL) enemyMsg.timestamp = gaInfo.TTL
      const enemies = await sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
      const currentEnemy = enemies.find(x=>x.playerId == gaInfo.currentEnemy)
      if(currentEnemy) enemyMsg.description += '[`'+currentEnemy.allyCode+'` : '+currentEnemy.name+' (Current)](https://swgoh.gg/p/'+currentEnemy.allyCode+'/gac-history/)\n'
      for(let i in enemies){
        if(enemies[i].playerId != gaInfo.currentEnemy) enemyMsg.description += '[`'+enemies[i].allyCode+'` : '+enemies[i].name+'](https://swgoh.gg/p/'+enemies[i].allyCode+'/gac-history/)\n'
      }
      msg2send.embeds.push(enemyMsg)
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
