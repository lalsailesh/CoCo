COCOS_ACCURACY = 100000
tableo = {}
tableo[1] = {buy=60 , rent=2}
tableo[3] = {buy=60 , rent=4}
tableo[5] = {buy=200 , rent=25}
tableo[6] = {buy=100 , rent=6}
tableo[8] = {buy=100 , rent=6}
tableo[9] = {buy=120 , rent=8}
tableo[11] = {buy=140 , rent=10}
tableo[12] = {buy=150 , rent=12}
tableo[13] = {buy=140 , rent=10}
tableo[14] = {buy=160 , rent=12}
tableo[15] = {buy=200 , rent=25}
tableo[16] = {buy=180 , rent=14}
tableo[18] = {buy=180 , rent=20}
tableo[19] = {buy=200 , rent=16}
tableo[21] = {buy=220 , rent=18}
tableo[23] = {buy=220 , rent=18}
tableo[24] = {buy=240 , rent=20}
tableo[25] = {buy=200 , rent=15}
tableo[26] = {buy=260 , rent=22}
tableo[27] = {buy=260 , rent=22}
tableo[28] = {buy=150 , rent=15}
tableo[29] = {buy=280 , rent=22}
tableo[31] = {buy=300 , rent=26}
tableo[32] = {buy=300 , rent=26}
tableo[34] = {buy=320 , rent=28}
tableo[35] = {buy=200 , rent=25}
tableo[37] = {buy=350 , rent=35}
tableo[39] = {buy=60 , rent=2}



function init()
    assert(chainhelper:is_owner(),'no auth')
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    public_data.data = {}

    public_data.rate  = 98
    public_data.max_bet = 1000000
	write_list = {public_data={rate=true,max_bet=true,data=true}}
	chainhelper:write_chain()
end
function startgame(gameid)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    gametab = {}
    for i = 1, #tableo do
        if tableo[i] ~= nil then
            gametab[i] ={buy = tableo[i]['buy'], rent = tableo[i]['rent'],bought=0,owner=""}
            chainhelper:log('The value of gametab'..gametab[i]['buy'])
            end
        end
    public_data.data[gameid] = {id = gameid,gamet=gametab}
    public_data.data[gameid]['userlist'] = {}
    public_data.data[gameid]['turn'] = 1
    public_data.data[gameid]['players'] = 0
    public_data.data[gameid]['mapping'] = {}
    public_data.data[gameid]['blacklist'] = {}
    write_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:write_chain()
    end

function register(gameid)

    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    current_user = tostring(contract_base_info.caller)
    assert(public_data.data ~= nil,"data is nil")
    assert(public_data.data[current_user] == nil,'current user is taken')
    players = public_data.data[gameid]['players']
    public_data.data[gameid][current_user] = {}
    table.insert(public_data.data[gameid]['userlist'],current_user)
    public_data.data[gameid]['players'] = players +1
    public_data.data[gameid][current_user] = {num_id=public_data.data[gameid]['players'],id = current_user,money=700,turn = 0,position=0,properties={}}
    public_data.data[gameid]['mapping'][players+1] = contract_base_info.caller
    chainhelper:transfejr_from_caller(contract_base_info.owner, 700*COCOS_ACCURACY, 'COCOS', true)
    write_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:write_chain()
end


function getallcallerid(gameid)
    assert(chainhelper:is_owner(),'no auth')

	read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    assert(public_data.data ~= nil)
    
    for k,v in pairs(public_data.data[gameid]['mapping']) do
    if public_data.data[gameid][v] ~=nil then
    if public_data.data[gameid][v]['money'] ~= nil then
     chainhelper:log(v)
 end
 end
end
end

function rolldice(gameid)

    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    turn = public_data.data[gameid]['turn']
    while (public_data.data[gameid]['blacklist'][turn] ~= nil) do
        if (public_data.data[gameid]['turn']+1)%public_data.data[gameid]['players']==0 then
        public_data.data[gameid]['turn'] = public_data.data[gameid]['players']

        else
        public_data.data[gameid]['turn'] = (public_data.data[gameid]['turn']+1) % public_data.data[gameid]['players']
        end
    end

    assert(public_data.data ~= nil,"data is nil")
    assert(public_data.data[gameid][tostring(contract_base_info.caller)] ~= nil,'You are not a part of game')
    assert(public_data.data[gameid][contract_base_info.caller]['num_id'] == public_data.data[gameid]['turn'],'Not your turn')
    result_num = (chainhelper:random() % 12) +1
    public_data.data[gameid][tostring(contract_base_info.caller)]['position'] = (public_data.data[gameid][tostring(contract_base_info.caller)]['position']+ result_num)%40
    chainhelper:log(public_data.data[gameid][tostring(contract_base_info.caller)]['position'])
    chainhelper:log(result_num)
    position = public_data.data[gameid][tostring(contract_base_info.caller)]['position']
    if public_data.data[gameid]['gamet'][position] ~= nil then
        chainhelper:log('So that it is not nil in here i am here')
    if public_data.data[gameid]['gamet'][position]["bought"] == 1 then
        owner = public_data.data[gameid]['gamet'][position]['owner']
        if owner ~= contract_base_info.caller then

            public_data.data[gameid][contract_base_info.caller]['money'] = public_data.data[gameid][contract_base_info.caller]['money'] - public_data[gameid]['gamet'][position]["rent"]
            public_data.data[gameid][owner]['money'] = public_data.data[gameid][contract_base_info.caller]['money'] + public_data[gameid]['gamet'][position]["rent"]
            chainhelper:log(public_data.data[gameid][contract_base_info.caller]["money"])

        end
end
end
    if (public_data.data[gameid]['turn']+1)%public_data.data[gameid]['players']==0 then
        public_data.data[gameid]['turn'] = public_data.data[gameid]['players']

    else
        public_data.data[gameid]['turn'] = (public_data.data[gameid]['turn']+1) % public_data.data[gameid]['players']
    end



    write_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:write_chain()

end

function buy(gameid)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    position = public_data.data[gameid][tostring(contract_base_info.caller)]['position']
    assert(public_data.data ~= nil,"data is nil")
    assert(public_data.data[gameid]['gamet'][position]["bought"] == 0,"property is already allocated")
    assert(public_data.data[gameid][tostring(contract_base_info.caller)] ~= nil,'You are not a part of game')
    if public_data.data[gameid]['gamet'][position]["bought"] == 0 then
        priceo = public_data.data[gameid]['gamet'][position]['buy']
        assert(priceo ~= nil,"the value is"..public_data.data[gameid]['gamet'][position]['buy'])
        assert(public_data.data[gameid][contract_base_info.caller]['money'] >= priceo,"You Don't have enough money to buy this")
        public_data.data[gameid][contract_base_info.caller]['money'] = public_data.data[gameid][contract_base_info.caller]['money'] - priceo
        public_data.data[gameid]['gamet'][position]['bought'] = 1
        public_data.data[gameid]['gamet'][position]['owner'] = contract_base_info.caller
        table.insert(public_data.data[gameid][contract_base_info.caller]['properties'],position)
    end
    chainhelper:log(public_data.data[gameid][contract_base_info.caller]['position']..','..public_data.data[gameid][contract_base_info.caller]['money'])
    write_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:write_chain()


end

function getallmoney(gameid)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    for k,v in pairs(public_data.data[gameid]['mapping']) do
    if public_data.data[gameid][v] ~=nil then
    if public_data.data[gameid][v]['money'] ~= nil then
     chainhelper:log('k '..k..' v '..public_data.data[gameid][v]['money'])
 end
 end
end
end


function getturn(gameid)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    chainhelper:log(public_data.data[gameid]['turn'])

    end

function leavegame(gameid,id)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    caller = public_data.data[gameid]['mapping'][tonumber(id)]
    public_data.data[gameid]['blacklist'][tonumber(id)] = {"blacklisted"}
    for i = 1, #public_data.data[gameid]['gamet'] do
        if public_data.data[gameid]['gamet'][i] ~= nil then
            if public_data.data[gameid]['gamet'][i]['owner'] == caller then
                public_data.data[gameid]['gamet'][i]['owner'] =""
                public_data.data[gameid]['gamet'][i]['bought'] =0
           end
           end
    end
    assert(caller ~= nil,"Caller is nil "..tonumber(id))
    public_data.data[gameid][caller] = nil
    public_data.data[gameid]['mapping'][tonumber(id)] = nil
    for i = 1, #public_data.data[gameid]['userlist'] do
        if public_data.data[gameid]['userlist'][i] == caller then
        table.remove(public_data.data[gameid]['userlist'],i)

    end
    end

    write_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:write_chain()

    end


function isregistered(gameid,id)
    read_list = {public_data={rate=true,max_bet=true,data=true}}
    chainhelper:read_chain()
    
    if public_data.data[gameid][id] ~= nil then
	chainhelper:log('1')
   else
	chainhelper:log('0')
end
end
