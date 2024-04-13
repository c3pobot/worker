'use strict'
module.exports = {
  reqStats: [
    1,//health
    5,//speed
    6,//PD
    7,//SD
    8,//armor
    9,//Resistance
    10,//armorpen
    11,//resistance pen
    14,//P CC
    15,//S CC
    16,//CD
    17,//pot
    18,//ten
    27,//health steal
    28,//protection
  ],
  relicStats: {
    '37':{
      id: 37,
      baseId: 52,
      base: 0,
      nameKey: 'Accuracy'
    },
    '39':{
      id: 39,
      baseId: 35,
      base: 0,
      nameKey: 'Crit Avoidance'
    },
    '12':{
      id: 12,
      baseId: 12,
      base: 0.02,
      nameKey: 'Evasion'
    }
  },
  gearColors: [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "#9241FF",//g7
    "#9241FF",//g8
    "#9241FF",//g9
    "#9241FF",//g10
    "#9241FF",//g11
    "#FFD036",//g12
    "#FF0F0D"//g13
  ],
  pct:[
    false,//"None 0",
    false,//"Health 1",
    false,//"Strength 2",
    false,//"Agility 3",
    false,//"Intelligence 4",
    false,//"Speed 5",
    false,//"Physical Damage 6",
    false,//"Special Damage", //"UNIT_STAT_ABILITY_POWER 7",
    true,//"Armor", //"UNIT_STAT_ARMOR 8",
    true,//"Resistance", //"UNIT_STAT_SUPPRESSION 9",
    false,//"Armor Penetration", //"UNIT_STAT_ARMOR_PENETRATION 10",
    false,//"Resistance Penetration", //"UNIT_STAT_SUPPRESSION_PENETRATION 11",
    true,//"Dodge Rating", //"UNIT_STAT_DODGE_RATING 12",
    true,//"Deflection Rating", //"UNIT_STAT_DEFLECTION_RATING 13",
    false,//"Physical Critical Rating", //"UNIT_STAT_ATTACK_CRITICAL_RATING 14",
    false,//"Special Critical Rating", //"UNIT_STAT_ABILITY_CRITICAL_RATING 15",
    true,//"Critical Damage 16",
    true,//"Potency 17",
    true,//"Tenacity 18",
    true,//"UNIT_STAT_DODGE_PERCENT_ADDITIVE 19",
    true,//"UNIT_STAT_DEFLECTION_PERCENT_ADDITIVE 20",
    true,//"Physical Critical Chance", //"UNIT_STAT_ATTACK_CRITICAL_PERCENT_ADDITIVE 21",
    true,//"Special Critical Chance", //"UNIT_STAT_ABILITY_CRITICAL_PERCENT_ADDITIVE 22",
    true,//"UNIT_STAT_ARMOR_PERCENT_ADDITIVE 23",
    true,//"UNIT_STAT_SUPPRESSION_PERCENT_ADDITIVE 24",
    true,//"UNIT_STAT_ARMOR_PENETRATION_PERCENT_ADDITIVE 25",
    true,//"UNIT_STAT_SUPPRESSION_PENETRATION_PERCENT_ADDITIVE 26",
    true,//"Health Steal",//"UNIT_STAT_HEALTH_STEAL 27",
    false,//"Protection 28",
    true,//"UNIT_STAT_SHIELD_PENETRATION 29",
    true,//"UNIT_STAT_HEALTH_REGEN 30",
    true,//"UNIT_STAT_ATTACK_DAMAGE_PERCENT_ADDITIVE 31",
    true,//"UNIT_STAT_ABILITY_POWER_PERCENT_ADDITIVE 32",
    true,//"UNIT_STAT_DODGE_NEGATE_PERCENT_ADDITIVE 33",
    true,//"UNIT_STAT_DEFLECTION_NEGATE_PERCENT_ADDITIVE 34",
    true,//"UNIT_STAT_ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE 35",
    true,//"UNIT_STAT_ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE 36",
    true,//"UNIT_STAT_DODGE_NEGATE_RATING 37",
    true,//"UNIT_STAT_DEFLECTION_NEGATE_RATING 38",
    true,//"UNIT_STAT_ATTACK_CRITICAL_NEGATE_RATING 39",
    true,//"UNIT_STAT_ABILITY_CRITICAL_NEGATE_RATING 40",
    false,//"Offense 41",
    false,//"Defense 42",
    true,//"UNIT_STAT_DEFENSE_PENETRATION 43",
    true,//"UNIT_STAT_EVASION_RATING 44",
    true,//"UNIT_STAT_CRITICAL_RATING 45",
    true,//"UNIT_STAT_EVASION_NEGATE_RATING 46",
    true,//"UNIT_STAT_CRITICAL_NEGATE_RATING 47",
    true,//"Offense % 48",
    true,//"Defense % 49",
    true,//"UNIT_STAT_DEFENSE_PENETRATION_PERCENT_ADDITIVE 50",
    true,//"UNIT_STAT_EVASION_PERCENT_ADDITIVE 51",
    true,//"Accuracy 52",
    true,//"Critical Chance 53 ",
    true,//"Critical Avoidance 54",
    true,//"Health % 55",
    true,//"Protection % 56",
    true,//"Speed %",// "UNIT_STAT_SPEED_PERCENT_ADDITIVE 57",
    true,//"UNIT_STAT_COUNTER_ATTACK_RATING 58",
    true,//"UNIT_STAT_TAUNT 59"
  ]
}
