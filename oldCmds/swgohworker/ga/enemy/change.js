'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
const GAReport = require('src/cmds/ga/report')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, sendResponse = 0, allyCode, gaInfo
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(obj.confirm && obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
    if(dObj && dObj.allyCode){
      msg2send.content = 'You do not have a GA opponent configured'
      gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(obj.confirm && obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
    if(gaInfo && gaInfo.enemies.length > 0){
      if(allyCode){
        msg2send.content = 'Error finding opponent with allyCode **'+allyCode+'**'
        const tempEnemy = gaInfo.enemies.find(x=>x.allyCode == allyCode)
        if(tempEnemy && tempEnemy.playerId){
          await mongo.set('ga', {_id: dObj.allyCode.toString()}, {currentEnemy: tempEnemy.playerId})
          gaInfo.currentEnemy = tempEnemy.playerId
          GAReport(obj, opt, dObj, gaInfo)
        }else{
          sendResponse = 1
        }
      }else{
        const embedMsg = {
          content: 'Please choose GA opponent to set',
          components: [],
          flags: 64
        }
        let x = 0
        const enemies = await sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
        for(let i in enemies){
          if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
          embedMsg.components[x].components.push({
            type: 2,
            label: (gaInfo.currentEnemy == enemies[i].playerId ? 'Current - ':'')+enemies[i].name+' ('+enemies[i].allyCode+')',
            style: 1,
            custom_id: JSON.stringify({id: obj.id, allyCode: enemies[i].allyCode})
          })
          if(embedMsg.components[x].components.length == 5) x++;
        }
        await HP.ButtonPick(obj, embedMsg)
      }
    }else{
      sendResponse = 1
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
