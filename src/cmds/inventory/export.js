'use strict'
const { replyMsg } = require('src/helpers')
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  if(!pObj.inventory) return { content: 'error getting you inventory' }
  delete pObj.inventory.unit
  delete pObj.inventory.shipSquad
  delete pObj.inventory.squad
  let data = Buffer.from(JSON.stringify({ name: pObj.player.name, allyCode: +pObj.player?.allyCode, inventory: pObj.inventory }))
  await replyMsg(obj, { content: 'inventory attached', flags: 64, file: data, fileName: `${pObj.player.allyCode}-inventory.json` }, 'POST')
}
