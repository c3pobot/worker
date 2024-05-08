'use stict'
const mongo = require('mongoclient')
const getHTML = require('webimg')
const getUnits = require('./getUnits')
const getMaterial = require('./getMaterial')

const { fetchPlayer, replyError, getPlayerAC, checkGuide } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let opt = obj.data?.options || {}
    let guideId = opt.journey?.value, displayOpt = opt.option?.value || 'units'
    if(!guideId) return { content: 'You did not provide a squad name' }

    let guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
    if(!guideTemplate) return { content: 'The use of the `/panic` command has changed and you must use the auto complete options for `journey` input which will be the full unit name.\nIf you have done this and still getting this message than it could be that the requirements for the guide have not been set up in the bot yet' }

    let allyObj = await getPlayerAC(obj, obj?.data?.options)
    let allyCode = allyObj?.allyCode
    if(allyObj?.mentionError) { content: 'that user does not have allyCode linked to discordId' }
    if(!allyCode) return { content: 'You do not have allyCode linked to discordId' }

    let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
    if(!pObj?.rosterUnit) return { content: 'error getting player data..' }

    let squadData = await checkGuide(guideTemplate, pObj.rosterUnit)
    if(!squadData?.units) return { content: 'Error Calcuting stats' }
    if(squadData.units.length == 0) return { content: 'The requirements for the guide may not have not been set up in the bot yet' }

    if(displayOpt === 'material') return await getMaterial(obj, squadData, pObj, guideTemplate)
    return await getUnits(obj, squadData, pObj, guideTemplate)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
