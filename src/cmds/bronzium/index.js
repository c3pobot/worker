'use strict'
const swgohClient = require('src/swgohClient')
const numeral = require('numeral')
const formatItems = require('./formatItems')
const getPackId = require('./getPackId')

const { getDiscordAC, replyError, replyTokenError, replyComponent } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    if(obj.confirm?.cancel || obj.confirm?.response == 'no') return { content: 'command canceled...', components: [] }

    let opt = obj?.data?.options || {}
    let qty = opt.quantity?.value || 100
    if(obj.confirm?.qty) qty = obj.confirm?.qty
    qty = +qty
    let dObj = await getDiscordAC(obj.member.user.id, opt)
    if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google linked' }

    let pObj = await swgohClient.oauth(obj, 'getInitialData', dObj, {})
    if(pObj === 'GETTING_CONFIRMATION') return
    if(pObj?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(pObj?.msg2send) return pObj.msg2send
    if(!pObj?.data?.inventory?.currencyItem) return { content: 'Error getting data' }

    let socialTotal = pObj.data.inventory.currencyItem.find(x=>x.currency == 4)?.quantity
    if(!socialTotal) return { content: 'You do not have enough allypoints' }
    
    socialTotal = +socialTotal
    let packId = getPackId(pObj.data)
    if(!packId) return { content: 'Error getting pack Id' }

    let spendRequest = qty * 250
    if(spendRequest > socialTotal) qty = Math.floor(socialTotal / 250)
    let tObj = await swgohClient.oauth(obj, 'buyItem', dObj, { itemId: packId, paymentCurrency: 4, quantity: qty })
    if(tObj === 'GETTING_CONFIRMATION') return
    if(tObj?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(tObj?.msg2send) return tObj.msg2send
    if(!tObj?.data?.purchasedResult || tObj?.data?.purchasedResult?.length === 0) return { content: 'Error opening bronzium packs' }

    let data = await formatItems(tObj.data.purchasedResult)
    if(!data?.spent) return { content: 'Packs where opened however i had an error figuring out what you got..'}
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
    let msg2send = { content: null, embeds: [embedMsg], components: [] }
    msg2send.components = [{ type:1, components: [] }]
    msg2send.components[0].components.push({
      type: 2,
      label: 'Pull '+qty+' again',
      style: 3,
      custom_id: JSON.stringify({ id: obj.id, qty: qty })
    })
    if(qty < 100){
      msg2send.components[0].components.push({
        type: 2,
        label: 'Pull 100',
        style: 3,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, qty: 100 })
      })
    }
    msg2send.components[0].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    })
    await replyComponent(obj, msg2send, 'POST')
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
