'use strict'
const mongo = require('mongoclient')
const { confirmButton } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(!opt.season?.value) return { content: 'You must provide a season number' }

  if(!obj.confirm){
    await confirmButton(obj, `Do you really want to clear ga history for season ${opt.season.value}?`)
    return
  }
  if(obj.confirm?.response === 'yes'){
    await mongo.set('gaHistoryClearCache', { _id: opt.season.value?.toString() }, { season: +opt.season.value })
    return { content: `Sent clear for ga history for season ${opt.season.value}` }
  }
  return { content: 'command canceled' }
}
