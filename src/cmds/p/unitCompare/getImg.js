const log = require('logger')
const getHTML = require('webimg').ga

const { formatUnit } = require('src/format')
const { getImg } = require('src/helpers')

module.exports = async(uInfo = {}, pObj = {}, eObj = {})=>{
  try{
    let [ pUnit, eUnit ] = await Promise.allSettled([
      formatUnit(uInfo, pObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))),
      formatUnit(uInfo, eObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')))
    ])
    if(!pUnit?.value?.nameKey && !eUnit?.value?.nameKey) return { content: 'Neither player has **'+uInfo.nameKey+'**' }

    let webData = await getHTML.unit(pUnit?.value, eUnit?.value, {
      player: pObj.name,
      enemy: eObj.name,
      footer: 'Unit comparison | Data Updated '+(new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    })
    if(!webData) return { content: 'error getting html' }

    let webImg = await getImg(webData, null, 50, false)
    if(!webImg) return { content: 'error getting image' }

    return { content: null, file: webImg, fileName: 'unit-'+uInfo.baseId+'.png' }
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
