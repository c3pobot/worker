'use strict'
module.exports = (timestamp)=>{
  if(!timestamp) timestamp = Date.now()
  let dateOptions = {month: 'numeric', day: 'numeric', year: 'numeric'}
  let dateTime = new Date(+timestamp)
  return dateTime.toLocaleDateString('en-US', dateOptions)+' '+dateTime.toLocaleTimeString('en-US')
}
