'use stict'
const mongo = require('mongoclient')
const getHTML = require('webimg')
const getUnits = require('./getUnits')
const getMaterial = require('./getMaterial')
const { getOptValue, getImg, fetchPlayer, replyError, getPlayerAC, checkGuide } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'You did not provide a squad name', components: []}, guideTemplate, allyCode, pObj, relicRecipe, guideUnits, squadData, guideHTML, guideImg
    let guideId = getOptValue(obj.data.options, 'journey')
    let displayOpt = getOptValue(obj.data.options, 'option', 'units')
    if(guideId){
      msg2send.content = 'The use of the `/panic` command has changed and you must use the auto complete options for `journey` input which will be the full unit name.\nIf you have done this and still getting this message than it could be that the requirements for the guide have not been set up in the bot yet'
      guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
    }
    if(guideTemplate){
      msg2send.content = 'You do not have allyCode linked to discordId'
      let allyObj = await getPlayerAC(obj, obj?.data?.options)
      if(allyObj?.allyCode) allyCode = allyObj.allyCode
      if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    }
    if(allyCode){
      msg2send.content = 'Error getting player data'
      pObj = await fetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj?.rosterUnit){
      msg2send.content = 'Error Calcuting stats'
      squadData = await checkGuide(guideTemplate, pObj.rosterUnit)
      if(squadData?.units) msg2send.content = 'The requirements for the guide may not have not been set up in the bot yet'
    }
    if(squadData?.units?.length > 0){
      msg2send.content = 'error getting html'
      if(displayOpt === 'units') guideHTML = await getUnits(msg2send, squadData, pObj, guideTemplate)
      if(displayOpt === 'material') guideHTML = await getMaterial(msg2send, squadData, pObj, guideTemplate)
    }
    if(guideHTML){
      msg2send.content = 'error getting image'
      let windowWidth = 728
      if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)
      if(displayOpt === 'material') windowWidth = 640
      guideImg = await getImg(guideHTML, obj.id, windowWidth, false)
    }
    if(guideImg){
      msg2send.content = null
      msg2send.file = guideImg
      msg2send.fileName = 'journey-'+guideTemplate.name+'.png'
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
