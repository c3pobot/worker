'use stict'
const GetHTML = require('webimg')
const GetUnits = require('./getUnits')
const GetMaterial = require('./getMaterial')
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'You did not provide a squad name', components: []}, guideTemplate, allyCode, pObj, relicRecipe, guideUnits, squadData, guideHTML, guideImg
    let guideId = await HP.GetOptValue(obj.data.options, 'journey')
    let displayOpt = await HP.GetOptValue(obj.data.options, 'option', 'units')
    if(guideId){
      msg2send.content = 'The use of the `/panic` command has changed and you must use the auto complete options for `journey` input which will be the full unit name.\nIf you have done this and still getting this message than it could be that the requirements for the guide have not been set up in the bot yet'
      guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
    }
    if(guideTemplate){
      msg2send.content = 'You do not have allyCode linked to discordId'
      const allyObj = await HP.GetPlayerAC(obj, obj?.data?.options)
      if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
      if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    }
    if(allyCode){
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj?.rosterUnit){
      msg2send.content = 'Error Calcuting stats'
      squadData = await HP.CheckGuide(guideTemplate, pObj.rosterUnit)
      if(squadData?.units) msg2send.content = 'The requirements for the guide may not have not been set up in the bot yet'
    }
    if(squadData?.units?.length > 0){
      msg2send.content = 'error getting html'
      if(displayOpt === 'units') guideHTML = await GetUnits(msg2send, squadData, pObj, guideTemplate)
      if(displayOpt === 'material') guideHTML = await GetMaterial(msg2send, squadData, pObj, guideTemplate)
    }
    if(guideHTML){
      msg2send.content = 'error getting image'
      let windowWidth = 728
      if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)
      if(displayOpt === 'material') windowWidth = 640
      guideImg = await HP.GetImg(guideHTML, obj.id, windowWidth, false)
    }
    if(guideImg){
      msg2send.content = null
      msg2send.file = guideImg
      msg2send.fileName = 'journey-'+guideTemplate.name+'.png'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
