'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const { getMissingGP } = require('./helper')
const getData = require('../getData')
const memberLimit = 20

module.exports = async(obj = {}, opt = {})=>{
  let tbObj = await getData(obj, opt)
  if(tbObj === 'GETTING_CONFIRMATION') return
  if(tbObj?.content) return { content: tbObj.content }
  if(!tbObj?.data) return { content: 'You do not have google auth linked to your discordId' }

  let gObj = (await mongo.find('tbCache', {_id: tbObj.data.guildId}))[0]
  if(!gObj?.currentStat) return { content: 'Error getting data from db' }

  let embedMsg = {
    color: 15844367,
    timestamp: new Date(),
    title: gObj.name + " Members with possible missing deployment",
    fields: []
  }
  let gpDeployed = gObj.currentStat?.find(x=>x.mapStatId == ('power_round_'+gObj.currentRound))
  let memberCount = 0, missingDeployment = 0
  for(let i in gObj.member){
    let deployedGP = gpDeployed.playerStat.find(x=>x.memberId == gObj.member[i].playerId)
    if(deployedGP && deployedGP.score){
      if(+deployedGP.score < gObj.member[i].gp && gObj.member[i].gp - (+deployedGP.score) > 100000){
        missingDeployment += (gObj.member[i].gp - (+deployedGP.score) || 0)
        if(memberCount < memberLimit) embedMsg.fields.push(getMissingGP(gObj.member[i], deployedGP.score))
        memberCount++
      }
    }else{
      missingDeployment += (gObj.member[i].gp || 0)
      if(memberCount < memberLimit) embedMsg.fields.push(getMissingGP(gObj.member[i], '0'));
      memberCount++
    }
  }
  if(memberCount == 0){
    embedMsg.fields.push({
      name: 'Deployment Complete',
      value: '```autohotkey\nEveryone deployed\n```'
    })
  }
  embedMsg.description = '```autohotkey\nTotal missing Deployent : '+numeral(missingDeployment).format('0,0')+'\nThere is '+memberCount+' with Deployment issues\n'
  if(memberCount > memberLimit) embedMsg.description += 'Below is '+embedMsg.fields.length+' of them\n'
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
