'use strict'
module.exports = (timestamp)=>{
  let timeNow = Date.now()
  if(+timeNow < +timestamp){
    let delta = Math.abs(+timestamp - +timeNow) / 1000
    let hours = Math.floor(delta / 3600)
    delta -= hours * 3600
    let minutes = Math.floor(delta / 60)
    delta -= minutes * 60
    let seconds = Math.floor(delta)
    return({
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    })
  }else{
    return({
      h: '00',
      m: '00',
      s: '00'
    })
  }
}
