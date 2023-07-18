'use strict'
const FormatItems = require('./formatItems')
const { log, mongo, ButtonPick, GetAllyCodeObj, GetOptValue, ReplyButton, ReplyError, ReplyMsg, ReplyTokenError } = require('helpers')
const swgohClient = require('swgohClient')
const numeral = require('numeral')
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'You do not have google/code auth linked to your discordId'}, pObj, tObj, socialTotal = 0, timeNow = Date.now(), sendMethod = 'PATCH'

    let qty = +GetOptValue(obj.data?.options, 'quantity', 100)
    if(obj?.confirm){
      sendMethod = 'POST'
      await ReplyButton(obj)
      qty = +obj.confirm.qty || qty
      if(obj.confirm?.timeNow) timeNow = +obj.confirm.timeNow
    }
    if(!qty || qty > 100) qty = 100
    let dObj = await GetAllyCodeObj(obj, obj.data?.options)
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting data'
      pObj = await swgohClient('getInitialData', {}, dObj, obj)
      if(pObj?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      if(pObj === 'GETTING_CONFIRMATION') return;
      pObj = pObj?.data
    }
    if(pObj?.inventory?.currencyItem){
      msg2send.content = 'You do not have enough allypoints'
      socialTotal = pObj.inventory.currencyItem.find(x=>x.currency == 4)?.quantity
      if(socialTotal) socialTotal = +socialTotal
    }
    if(socialTotal){
      let spendRequest = qty * 250
      if(spendRequest > socialTotal) qty = Math.floor(socialTotal / 250)
      if(qty > 0){
        msg2send.content = 'Error opening bronzium packs'
        tObj = await swgohClient('buyItem', { itemId: 'premium-pack-silver', paymentCurrency: 4, quantity: qty }, dObj, obj)
        if(tObj?.error == 'invalid_grant'){
          await ReplyTokenError(obj, dObj.allyCode)
          return;
        }
        if(tObj === 'GETTING_CONFIRMATION') return;
        tObj = tObj?.data
      }
    }
    if(tObj?.purchasedResult?.length > 0){
      mongo.set('webTemp', {_id: 'bronzium'}, { data: tObj })
      //await mongo.set('tempData', {_id: 'bronzium-100'}, tObj)
      let data = await FormatItems(tObj.purchasedResult)
      if(data?.spent){
        //await mongo.set('tempData', {_id: 'packData'}, data)
        const embedMsg = {
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
      }
    }
    if(msg2send.components?.length > 0){
      await ButtonPick(obj, msg2send, sendMethod)
    }else{
      await ReplyMsg(obj, msg2send)
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
