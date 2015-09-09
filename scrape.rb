# def makearray(dict)
#   result = []
#   dict.each do |x,key|
#     result.concat([key])
#   end
#   result
# end

# msd = { "Archer"=>"Archer", "Archer_F"=>"Archer_F", "ArcherinBallista"=>"ArcherinBallista", "ArcherinIronBallista"=>"ArcherinBallista", "ArcherinKillerBallista"=>"ArcherinBallista","Archsage"=>"Archsage","Assassin"=>"Assassin", "Assassin_F"=>"Assassin_F", "HungLeila"=>"Assasin_F","Bard"=>"Bard","Berserker"=>"Berserker", "Corsair"=>"Berserker","Bishop"=>"Bishop", "Bishop_F"=>"Bishop_F","BladeLord"=>"BladeLord","Blight"=>"Blight", "Entombed"=>"Blight","Brammimond"=>"Brammimond","Brigand"=>"Brigand","Cavalier"=>"Cavalier", "Cavalier_F"=>"Cavalier","Cleric"=>"Cleric","Civilian"=>"Civilian", "Civilian_2"=>"Civilian", "Civilian_F"=>"Civilian_F", "Civilian_2_F"=>"Civilian_F","Child"=>"Child", "Child_2"=>"Child", "Child_F"=>"Child_F", "Child_2_F"=>"Child_F","Dancer"=>"Dancer","DarkDruid"=>"DarkDruid","Druid"=>"Druid", "Druid_F"=>"Druid_F","EmptyBallista"=>"EmptyBallista", "EmptyIronBallista"=>"EmptyBallista", "EmptyKillerBallista"=>"EmptyBallista","FalcoKnight"=>"FalcoKnight","FallenIceDragon"=>"FallenIceDragon","FallenNinian"=>"FallenNinian","FallenPrince"=>"FallenPrince","FallenWarrior"=>"FallenWarrior","Fighter"=>"Fighter","FireDragon"=>"FireDragon","General"=>"General", "General_F"=>"General","GreatLord"=>"GreatLord","Hero"=>"Hero", "Hero_F"=>"Hero_F","Knight"=>"Knight", "Knight_F"=>"Knight","KnightLord"=>"KnightLord","EliwoodLord"=>"EliwoodLord","HectorLord"=>"HectorLord","LynLord"=>"LynLord","Mage"=>"Mage", "Mage_F"=>"Mage_F","MagicSeal"=>"MagicSeal","Mercenary"=>"Mercenary", "Mercenary_F"=>"Mercenary_F","Monk"=>"Monk","Myrmidon"=>"Myrmidon", "Myrmidon_F"=>"Myrmidon_F","Nomad"=>"Nomad", "Nomad_F"=>"Nomad_F","NomadTrooper"=>"NomadTrooper", "NomadTrooper_F"=>"NomadTrooper_F","Paladin"=>"Paladin", "Paladin_F"=>"Paladin","PegasusKnight"=>"PegasusKnight","Peer"=>"Peer", "Peer_F"=>"Peer_F","Pirate"=>"Pirate","Priest"=>"Priest","Prince"=>"Prince", "Princefacingupward"=>"Prince","Queen"=>"Queen","Sage"=>"Sage", "Sage_F"=>"Sage_F", "UberSage"=>"Sage","Shaman"=>"Shaman", "Shaman_F"=>"Shaman_F","Sniper"=>"Sniper", "Sniper_F"=>"Sniper_F","Soldier"=>"Soldier","Swordmaster"=>"Swordmaster", "Swordmaster_F"=>"Swordmaster_F","Prince_Tactician"=>"Tactician","Transporter"=>"Tent", "Tent"=>"Tent","Thief"=>"Thief", "Thief_F"=>"Thief_F","Troubadour"=>"Troubadour","TransporterHorse"=>"TransporterHorse","Valkyrie"=>"Valkyrie","Wagon"=>"TransporterHorse","Warrior"=>"Warrior","WyvernLord"=>"WyvernLord", "WyvernLord_F"=>"WyvernLord","WyvernKnight"=>"WyvernKnight", "WyvernKnight_F"=>"WyvernKnight","Zombie"=>"Zombie"}

alleg = ["Ally","Enemy","NPC"]

result = ["Archer", "Archer_F", "ArcherinBallista", "ArcherinBallista", "ArcherinBallista", "Archsage", "Assassin", "Assassin_F", "Assasin_F", "Bard", "Berserker", "Berserker", "Bishop", "Bishop_F", "BladeLord", "Blight", "Blight", "Brammimond", "Brigand", "Cavalier", "Cavalier", "Cleric", "Civilian", "Civilian", "Civilian_F", "Civilian_F", "Child", "Child", "Child_F", "Child_F", "Dancer", "DarkDruid", "Druid", "Druid_F", "EmptyBallista", "EmptyBallista", "EmptyBallista", "FalcoKnight", "FallenIceDragon", "FallenNinian", "FallenPrince", "FallenWarrior", "Fighter", "FireDragon", "General", "General", "GreatLord", "Hero", "Hero_F", "Knight", "Knight", "KnightLord", "EliwoodLord", "HectorLord", "LynLord", "Mage", "Mage_F", "MagicSeal", "Mercenary", "Mercenary_F", "Monk", "Myrmidon", "Myrmidon_F", "Nomad", "Nomad_F", "NomadTrooper", "NomadTrooper_F", "Paladin", "Paladin", "PegasusKnight", "Peer", "Peer_F", "Pirate", "Priest", "Prince", "Prince", "Queen", "Sage", "Sage_F", "Sage", "Shaman", "Shaman_F", "Sniper", "Sniper_F", "Soldier", "Swordmaster", "Swordmaster_F", "Tactician", "Tent", "Tent", "Thief", "Thief_F", "Troubadour", "TransporterHorse", "Valkyrie", "TransporterHorse", "Warrior", "WyvernLord", "WyvernLord", "WyvernKnight", "WyvernKnight", "Zombie"]

def geturls(alleg,result)
  to_pr = []
  result.each do |clas|
    alleg.each do |side|
      to_pr.concat(["https://dl.dropbox.com/u/71611130/MapSprites/#{clas}#{side}.png"])
    end
  end
  to_pr
end

# urls = geturls(alleg,result).join "\n"



directions = ['up','down','left','right']
colours = ['Orange','Blue','Red','Green']

def geturls2(colours,directions)
  to_pr = []
  colours.each do |colour|
    directions.each do |direction|
      to_pr.concat(["https://dl.dropbox.com/u/71611130/MoveArrows/#{colour}_#{direction}.png"])
    end
  end
  to_pr
end

urls = geturls2(colours,directions).join "\n"

output = File.new("urls.txt","w")
  output.syswrite urls
output.close