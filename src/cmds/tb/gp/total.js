'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const sorter = require('json-array-sorter')
const { getMemberGP } = require('./helper')
const getData = require('../getData')
const getHTML = require('webimg').tb.gpTotal
const { getImg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let tbObj = await getData(obj, opt)
  if(tbObj === 'GETTING_CONFIRMATION') return
  if(tbObj?.content) return { content: tbObj.content }
  if(!tbObj?.data) return { content: 'You do not have google auth linked to your discordId' }

  let gObj = (await mongo.find('tbCache', {_id: tbObj.data.guildId}))[0]
  if(!gObj?.currentStat) return { content: 'Error getting data from db' }

  let gpDeployed = gObj.currentStat?.find(x=>x.mapStatId == ('power_round_'+gObj.currentRound))
  let memberCount = 0, missingDeployment = 0, lowMembers = []
  for(let i in gObj.member){
    let deployedGP = gpDeployed.playerStat.find(x=>x.memberId == gObj.member[i].playerId)
    if(deployedGP && deployedGP.score){
      if(+deployedGP.score < gObj.member[i].gp && gObj.member[i].gp - (+deployedGP.score) > 100000){
        missingDeployment += (gObj.member[i].gp - (+deployedGP.score) || 0)
        lowMembers.push(getMemberGP(gObj.member[i], deployedGP?.score))
        memberCount++
      }
    }else{
      missingDeployment += (gObj.member[i].gp || 0)
      lowMembers.push(getMemberGP(gObj.member[i], 0))
      memberCount++
    }
  }
  if(lowMembers?.length > 0) lowMembers = sorter([{ column: 'name', order: 'ascending'}], lowMembers || [])

  if(memberCount == 0) return { content: 'Deployment Complete' }

  let webHTML = getHTML({ members: lowMembers, missingDeployment: numeral(missingDeployment || 0).format('0,0'), memberCount: memberCount, guildMemberCount: gObj.member?.length || 0, guildName: gObj.name })
  if(!webHTML) return { content: 'Error getting HTML' }

  let webImg = await getImg(webHTML, obj.id, 800, false)
  if(!webImg) return { content: 'Error getting image' }

  return { content: null, file: webImg, fileName: `${gObj.name}-gpTotal.png` }
}
