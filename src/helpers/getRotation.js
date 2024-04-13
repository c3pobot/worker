'use strict'
const timeTillPayout = require('./timeTillPayout')
const getPlayerOrder = require('./getPlayerOrder')
module.exports = (obj = {})=>{
  let notify = obj.notify
  let timeTillPO = timeTillPayout(obj.poOffSet, obj.type)
  let pArray = []
  if(obj.order == 'normal'){
    pArray = obj.players
  }else{
    for(let i=obj.players.length;i>0;i--){
      pArray.push(obj.players[i - 1])
    }
  }
  let msg2Send = '>>> **'+obj.id+'** Payout Rotation\n'
  if(obj.roleId) msg2Send += '<@&'+obj.roleId+'>\n'
  if(obj.roleId) notify = 'off'
  msg2Send += '--------------------------------\n'
  if(timeTillPO && timeTillPO.length > 0) msg2Send += 'Time till payout : **'+timeTillPO[0]+'**\n'
  msg2Send += '--------------------------------\n'
  msg2Send += getPlayerOrder(pArray, notify)
  return msg2Send
}
