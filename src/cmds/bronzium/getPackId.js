'use strict'
const mongo = require('mongoclient')
const log = require('logger')
module.exports = (data = {})=>{
  if(data?.player?.allyCode && data?.store){
    mongo.set('bronziumCache', { _id: data?.player?.allyCode }, data)
  }else{
    log.info('something is wrong with the data')
  }

  let packId
  let obj = data?.store?.storeItem?.find(x=>x.offer.filter(y=>y.paymentCurrency === 4 && y.price === 250).length > 0)
  if(obj?.id) packId = obj.id
  if(!packId){
    let timeNow = Date.now()
    obj = data.cooldownStatus?.find(x=>x.id.includes('premium-pack-silver') && +x.cooldownTime > (timeNow - 172800000))
    if(obj?.id){
      packId = obj.id.split(':')[1]
    }
  }
  if(packId?.includes('premium-pack-silver')) return packId
}
