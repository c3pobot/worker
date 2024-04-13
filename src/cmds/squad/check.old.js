'use strict'
const GetHTML = require('webimg').squads
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide a squad name', components: []}, dId, allyCode, pObj, squad, squadData, webData, squadImage
    let squadName = HP.GetOptValue(opt, 'name')
    let type = HP.GetOptValue(opt, 'type')
    if(squadName){
      msg2send.content = 'You do not have allyCode linked to discordId'
      squadName = squadName.toString().trim()
      const allyObj = await HP.GetPlayerAC(obj, opt)
      if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
      if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    }
    if(allyCode){
      msg2send.content = 'Error finding squad **'+squadName+'**'
      squad = await HP.Squads.GetSquad(obj, opt, squadName)
    }
    if(squad){
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj && pObj.rosterUnit){
      msg2send.content = 'Error Calcuting stats'
      if(squad.units){
        squadData = await HP.Squads.CheckSquad(squad, pObj.rosterUnit, false)
      }else{
        if(squad.squads) squadData = await HP.Squads.CheckGroup(squad.squads, pObj.rosterUnit, false)
      }
    }
    if(squadData?.units?.length > 0 && squadData?.info){
      msg2send.content = 'Error getting image'
      squadData.info.playerName = pObj.name
      squadData.info.squadName = squad.nameKey
      squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      if(squadData.info.showStats){
        squadData.info.tdSpan = 10
        squadData.info.colLimit = 2
        if(squadData.info.unitCount < 2){
          squadData.info.tdSpan = 5
          squadData.info.colLimit = 1
        }
      }else{
        if(+squadData.unitCount < 5){
          squadData.info.tdSpan = +squadData.info.unitCount
          squadData.info.colLimit = +squadData.info.unitCount
        }
      }
      webData = await GetHTML.units(squadData.units, squadData.info)
    }
    if(webData?.html){
      msg2send.content = 'Error getting image'
      let windowWidth = 618
      if(squadData.info.unitCount < 5) windowWidth = (121 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)
      squadImage = await HP.GetImg(webData.html, windowWidth, false)
    }
    if(squadImage){
      msg2send.content = null
      if(squadData?.info?.links?.length > 0){
        msg2send.content = squadData.info.links.shift()
        for(let i in squadData.info.links) msg2send.content += '\n<'+squadData.info.links[i]+'>'
      }
      msg2send.file = squadImage
      msg2send.fileName = squad.nameKey+'.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
