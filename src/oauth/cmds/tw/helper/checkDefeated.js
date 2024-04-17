'use strict'
module.exports = (obj)=>{
	if(obj.filter(x=>parseInt(x.unitState.healthPercent) > 0 && x.squadUnitType !== 3 && x.squadUnitType !== 5).length > 0){
		return "Alive"
	}else{
		return "Defeated"
	}
}
