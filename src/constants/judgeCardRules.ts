export interface JudgeCardRule {
  label: string; rule: string 
}

export const JUDGE_CARD_RULES: {
  position: Record<string, JudgeCardRule>;
  geography: Record<string, JudgeCardRule>;
  fact: Record<string, JudgeCardRule>;
} = {
  'position': {
    'Вратарь': {
      'label': 'Goalkeeper',
      'rule': 'First-choice goalkeeper of a senior team. Outfield players do not fit.',
    },
    'Защитник': {
      'label': 'Defender',
      'rule': 'Centre-back, full-back or wing-back as the role for a significant part of the senior career, not a one-off. Goalkeepers do not fit.',
    },
    'Полузащитник': {
      'label': 'Midfielder',
      'rule': 'Defensive, central, attacking, left or right midfielder as the role for a significant part of the senior career, not a one-off. A winger who regularly played both in midfield and in attack fits. Goalkeepers do not fit.',
    },
    'Нападающий': {
      'label': 'Forward',
      'rule': 'Striker, second striker, left or right winger as the role for a significant part of the senior career, not a one-off. Goalkeepers do not fit.',
    },
  },
  'geography': {
    'Франция': {
      'label': 'France',
      'rule': 'Citizen of France (by birth or naturalisation) or a senior France international. Dual citizenship counts.',
    },
    'Португалия': {
      'label': 'Portugal',
      'rule': 'Citizen of Portugal (by birth or naturalisation) or a senior Portugal international. Dual citizenship counts.',
    },
    'Аргентина': {
      'label': 'Argentina',
      'rule': 'Citizen of Argentina (by birth or naturalisation) or a senior Argentina international. Dual citizenship counts.',
    },
    'Италия': {
      'label': 'Italy',
      'rule': 'Citizen of Italy (by birth or naturalisation) or a senior Italy international. Dual citizenship counts.',
    },
    'Испания': {
      'label': 'Spain',
      'rule': 'Citizen of Spain (by birth or naturalisation) or a senior Spain international. Dual citizenship counts.',
    },
    'Бразилия': {
      'label': 'Brazil',
      'rule': 'Citizen of Brazil (by birth or naturalisation) or a senior Brazil international. Dual citizenship counts.',
    },
    'Нидерланды': {
      'label': 'Netherlands',
      'rule': 'Citizen of Netherlands (by birth or naturalisation) or a senior Netherlands international. Dual citizenship counts.',
    },
    'Германия': {
      'label': 'Germany',
      'rule': 'Citizen of Germany (by birth or naturalisation) or a senior Germany international. Dual citizenship counts.',
    },
    'Англия': {
      'label': 'England',
      'rule': 'Senior England international or English. Scotland, Wales and Northern Ireland are not England (Bale, Robertson do not fit). Dual citizenship counts.',
    },
    'Южная Америка': {
      'label': 'South America',
      'rule': 'Citizen of any South American country: Argentina, Brazil, Uruguay, Colombia, Chile, Ecuador, Paraguay, Peru, Venezuela, Bolivia, etc.',
    },
    'Северная Америка': {
      'label': 'North America',
      'rule': 'Citizen of the USA, Canada, Mexico, or a Central American or Caribbean country (Costa Rica, Jamaica, Panama, etc.).',
    },
    'Африка': {
      'label': 'Africa',
      'rule': 'Citizen of any African country: Egypt, Morocco, Algeria, Nigeria, Senegal, Ghana, Ivory Coast, Cameroon, etc.',
    },
    'Евразия': {
      'label': 'Eurasia',
      'rule': 'Citizen of any European or Asian country, incl. Turkey, Russia, Japan, Korea, Saudi Arabia. Australia and Oceania do not fit.',
    },
  },
  'fact': {
    'Играл в Италии': {
      'label': 'Played in Italy',
      'rule': 'Was in the first-team squad of a senior club playing in the Italian league system (any division; loans count).',
    },
    'Играл в Англии': {
      'label': 'Played in England',
      'rule': 'Was in the first-team squad of a senior club playing in the English league system (any division; loans count). Swansea and Cardiff count as England.',
    },
    'Играл в Испании': {
      'label': 'Played in Spain',
      'rule': 'Was in the first-team squad of a senior club playing in the Spanish league system (any division; loans count).',
    },
    'Играл в Германии': {
      'label': 'Played in Germany',
      'rule': 'Was in the first-team squad of a senior club playing in the German league system (any division; loans count).',
    },
    'Играл во Франции': {
      'label': 'Played in France',
      'rule': 'Was in the first-team squad of a senior club playing in the French league system (any division; loans count). Monaco counts as France.',
    },
    'Закончил карьеру': {
      'label': 'Retired',
      'rule': 'As of today, has retired and does not play for a professional club. Free agent without a retirement announcement → unsure.',
    },
    'Выиграл трофей со сборной': {
      'label': 'Won a trophy with the national team',
      'rule': 'Won with the senior national team: World Cup, EURO, Copa América, Africa Cup of Nations, UEFA Nations League or CONCACAF Gold Cup. In why name the tournament and year. Lost finals and youth tournaments do not count.',
    },
    'Выиграл чемпионат страны': {
      'label': 'Won a national league title',
      'rule': 'Was in the squad of a club that won the top division of any country. Domestic cups, super cups and European trophies do not count.',
    },
    'Выиграл еврокубок': {
      'label': 'Won a European club trophy',
      'rule': "Was in the squad of the winning club: Champions League / European Cup, Europa League / UEFA Cup, Cup Winners' Cup, UEFA Super Cup, Conference League. In why name the competition, club and year. Lost finals, Club World Cup, domestic cups and individual awards do not count.",
    },
    'Обладатель Золотого мяча': {
      'label': "Ballon d'Or winner",
      'rule': "Only the France Football Ballon d'Or. Complete list of winners: Stanley Matthews, Alfredo Di Stéfano, Raymond Kopa, Luis Suárez Miramontes (Spaniard, 1960, not the Uruguayan), Omar Sívori, Josef Masopust, Lev Yashin, Denis Law, Eusébio, Bobby Charlton, Flórián Albert, George Best, Gianni Rivera, Gerd Müller, Johan Cruyff, Franz Beckenbauer, Oleg Blokhin, Allan Simonsen, Kevin Keegan, Karl-Heinz Rummenigge, Paolo Rossi, Michel Platini, Igor Belanov, Ruud Gullit, Marco van Basten, Lothar Matthäus, Jean-Pierre Papin, Roberto Baggio, Hristo Stoichkov, George Weah, Matthias Sammer, Ronaldo (Brazilian), Zinedine Zidane, Rivaldo, Luís Figo, Michael Owen, Pavel Nedvěd, Andriy Shevchenko, Ronaldinho, Fabio Cannavaro, Kaká, Cristiano Ronaldo, Lionel Messi, Luka Modrić, Karim Benzema, Rodri, Ousmane Dembélé. Anyone not on the list → no.",
    },
    'Забил в финале': {
      'label': 'Scored in a final',
      'rule': 'Personally scored (not just won the final) in normal or extra time of the final match of a senior tournament, club or national team. In why name the final and year. Penalty shoot-outs do not count. Goalkeepers almost never score.',
    },
    'Капитан': {
      'label': 'Captain',
      'rule': 'Was the appointed captain of a senior club or senior national team. A one-off armband and youth teams do not count.',
    },
    'Старше 30 лет': {
      'label': 'Aged 30 or over',
      'rule': 'As of today, aged 30 or older in full years. Always fill born.',
    },
    'Младше 25 лет': {
      'label': 'Aged 25 or under',
      'rule': 'As of today, aged 25 or younger in full years. Always fill born.',
    },
    'Играл в трёх лигах и более': {
      'label': 'Played in 3+ leagues',
      'rule': 'Senior clubs in the leagues of at least three different countries (loans count). Country = league country. In why list the countries.',
    },
    'Играл в пяти клубах и более': {
      'label': 'Played for 5+ clubs',
      'rule': 'Five or more different senior clubs. Returning to the same club is not a new club; a loan to another club is. In why list the clubs.',
    },
  },
};
