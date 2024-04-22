'use strict'
const numeral = require('numeral')
const formatItems = require('./formatItems')
const getPackId = require('./getPackId')
const { replyButton, getOptValue, getDiscordAC, replyError, replyTokenError, buttonPick } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'You do not have google linked'}
    if(obj?.confirm) await replyButton(obj, 'Pulling data ...')
    let opt = obj?.data?.options || []
    let loginConfirm = obj?.confirm?.response
    let qty = getOptValue(opt, 'quantity', 100)
    let timeNow = +(obj?.confirm?.timeNow || Date.now())
    if(obj?.data?.options) opt = obj.data.options
    if(obj?.confirm){
      await replyButton(obj, null)
      qty = obj.confirm.qty || qty
    }
    if(!qty || qty > 100) qty = 100
    qty = +qty
    let dObj = await getDiscordAC(obj.member.user.id, opt)
    if(!dObj?.uId || !dObj?.type) return msg2send

    msg2send.content = 'Error getting data'
    let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {}, loginConfirm)
    if(pObj === 'GETTING_CONFIRMATION') return
    if(pObj?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(pObj?.msg2send) return { content: pObj.msg2send }
    if(!pObj?.data?.inventory?.currencyItem) return msg2send

    msg2send.content = 'You do not have enough allypoints'
    let socialTotal = pObj.data.inventory.currencyItem.find(x=>x.currency == 4)?.quantity
    if(!socialTotal) return msg2send

    socialTotal = +socialTotal
    msg2send.content = 'Error getting pack Id'
    let packId = getPackId(pObj.data)
    if(!packId) return msg2send

    msg2send.content = 'Error opening bronzium packs'
    let spendRequest = qty * 250
    if(spendRequest > socialTotal) qty = Math.floor(socialTotal / 250)
    let tObj = await swgohClient.oauth(obj, 'buyItem', dObj, {itemId: packId, paymentCurrency: 4, quantity: qty}, loginConfirm)
    if(tObj === 'GETTING_CONFIRMATION') return
    if(tObj?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(tObj?.msg2send) return { content: tObj.msg2send }
    if(!tObj?.data?.purchasedResult || tObj?.data?.purchasedResult?.length === 0) return msg2send

    let data = await formatItems(tObj.data.purchasedResult)
    if(!data?.spent) return { content: 'Packs where open i had an error figuring out what you got'}
    let embedMsg = {
      color: 15844367,
      title: 'Bronzium packs ('+data.spent / 250+') Ally points ('+numeral(data.spent).format('0,0')+')',
      description: 'Remaining Ally Points : `'+numeral(socialTotal - data.spent).format('0,0')+'`\n\n'
    }
    if(data.td){
      embedMsg.description += '**Training Droids** : `'+data.td+'`\n'
    }
    if(data.credits){
      embedMsg.description += '**Credits** : `'+data.credits+'`\n'
    }
    if(data.shards){
      embedMsg.description += '**Shards** : `'+data.shards+'`\n'
    }
    if(data.gear){
      embedMsg.description += '**Total Gear** : `'+data.gear+'`\n'
    }
    if(data.sgear){
      embedMsg.description += '**Possible Scavanger Scrap** : \n'
      for(let i in data.sgear){
        const scrapCount = Math.floor(data.sgear[i].value / +data.sgear[i].pointValue)
        if(scrapCount > 0) embedMsg.description += '`'+(scrapCount).toString().padStart(2, '0')+'` '+(data.sgear[i].nameKey ? data.sgear[i].nameKey:data.sgear[i].id)+'\n'
      }
    }
    if(data.specGear){
      embedMsg.description += '**Special Gear** : \n'
      for(let i in data.specGear) embedMsg.description += '`'+data.specGear[i].total.toString().padStart(2, '0')+'` '+(data.specGear[i].nameKey ? data.specGear[i].nameKey:data.specGear[i].id)+'\n'
    }
    if(data.unit){
      embedMsg.description += '**Units**\n'
      for(let i in data.unit) embedMsg.description += '`'+data.unit[i].total.toString().padStart(2, '0')+'`'+' '+(data.unit[i].nameKey ? data.unit[i].nameKey:data.unit[i].id)+'\n'
    }
    msg2send.embeds = [embedMsg]
    msg2send.content = null
    if((+(Date.now()) - timeNow) < 480000){
      msg2send.components = [{ type:1, components: []}]
      msg2send.components[0].components.push({
        type: 2,
        label: 'Pull '+qty+' again',
        style: 3,
        custom_id: JSON.stringify({id: obj.id, qty: qty, timeNow: +timeNow})
      })
      if(qty < 100){
        msg2send.components[0].components.push({
          type: 2,
          label: 'Pull 100',
          style: 3,
          custom_id: JSON.stringify({id: obj.id, qty: 100, timeNow: +timeNow})
        })
      }
    }
    if(msg2send?.components?.length > 0){
      await buttonPick(obj, msg2send, 'POST')
      return
    }
    return msg2send

  }catch(e){
    replyError(obj)
    throw(e)
  }
}
