'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')

const { getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.enemies || gaInfo?.enemies?.length == 0) return { content: 'You do not have GA opponents configured' }

  let pObj = await swgohClient.post('playerArena', { allyCode: allyCode.toString() })
  if(!pObj?.name) return { content: 'Error getting player info...' }

  let embedMsg = {
    color: 15844367,
    title: pObj.name+' GA opponents',
    description: ''
  }
  if(gaInfo.TTL) embedMsg.timestamp = gaInfo.TTL
  let enemies = sorter([{column: 'name', order: 'ascending'}], gaInfo.enemies)
  let currentEnemy = enemies.find(x=>x.playerId == gaInfo.currentEnemy)
  if(currentEnemy) embedMsg.description += '[`'+currentEnemy.allyCode+'` : '+currentEnemy.name+' (Current)](https://swgoh.gg/p/'+currentEnemy.allyCode+'/gac-history/)\n'
  for(let i in enemies){
    if(enemies[i].playerId != gaInfo.currentEnemy) embedMsg.description += '[`'+enemies[i].allyCode+'` : '+enemies[i].name+'](https://swgoh.gg/p/'+enemies[i].allyCode+'/gac-history/)\n'
  }
  return { content: null, embeds: [embedMsg] }
}
