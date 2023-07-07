'use strict'
const { apiFetch } = require('helpers')
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY
const Cmds = {}
const GetWeather = async(id, lon, lat)=>{
  try{
    let data = await redis.get('weather-'+id)
    if(!data || !data.current){
      data = await apiFetch('https://api.openweathermap.org/data/2.5/onecall?appid='+OPEN_WEATHER_API_KEY+'&units=imperial&lat='+lat+'&lon='+lon)
      if(data?.current) redis.setTTL('weather-'+id, data, 600)
    }
    if(data?.current) return data
  }catch(e){
    throw(e)
  }
}
module.exports = GetWeather
