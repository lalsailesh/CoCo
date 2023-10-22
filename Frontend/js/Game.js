var CHECKERS = {
    WHITE: 1,
    BLACK: 2,
    GREEN: 3
};

CHECKERS.Game = function (options) {
    'use strict';
    
    options = options || {};
    
    /**********************************************************************************************/
    /* Private properties *************************************************************************/
   
    /** @type CHECKERS.BoardController */
    var boardController = null;
    var roomidx = sessionStorage.getItem('roomid');
    var playeridx = sessionStorage.getItem('playerid');

    var myid;
    var movnum;
    var bcx;
    var ws;
    var playerthing={};
    var playerthingx=[750,750,750,750];
    /**
     * The board representation.
     * @type Array
     */
    var board = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    var propert=[[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

    var placecard=[[],['Old Kent Road', '60', '2'], [], ['Whitechapel Road', '60', '4'], [], ['Kings Cross Station', '200', '25'], ['The Angel Islington', '100', '6'], [], ['Euston Road', '100', '6'], ['Pentonville Road', '120', '8'], [], ['Pall Mall', '140', '10'], ['Electric Company', '150', '12'], ['Whitehall', '140',  '10'], ['Northumberland Avenue', '160', '12'], ['Marylebone Station', '200', '25'], ['Bow Street', '180', '14'], [], ['Marlborough Street', '180', '20'], ['Vine Street', '200', '16'], [], ['The Strand', '220', '18'], [], ['Fleet Street',  '220', '18'], ['Trafalgar Square', '240', '20'], ['Fenchurch St Station', '200', '15'], ['Leicester Square', '260', '22'], ['Coventry Street', '260', '22'], ['Water Works', '150', '15 '], ['Piccadilly', '280', '22'], [], ['Regent Street', '300', '26'], ['Oxford Street', '300', '26'], [], ['Bond Street', '320', '28'], ['Liverpool Street Station', '200', '25 '], [], ['Park Lane', '350', '35'], [], ['Mayfair', '400', '50']];
    function randomjo(num){
        var ls = [];
        ls[2] = [[1,1]]
        ls[3] = [[2,1],[1,2]]
        ls[4] = [[2,2],[3,1],[1,3]]
        ls[5] = [[3,2],[2,3],[1,4],[4,1]]
        ls[6] = [[3,3],[4,2],[2,4],[1,5],[5,1]]
        ls[7] = [[4,3],[1,6],[6,1],[3,4],[5,2],[2,5]]
        ls[8] = [[4,4],[6,2],[2,6],[5,3],[3,5]]
        ls[9] = [[5,4],[4,5],[6,3],[3,6]]
        ls[10] = [[5,5],[6,4],[4,6]]
        ls[11] = [[6,5],[5,6]]
        ls[12] = [[6,6]]
        return ls[num][Math.floor(Math.random() * ls[num].length)]  
        
      }

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
      }
    var last=[0,0,0,0];  
    
    
    /**********************************************************************************************/
    /* Private methods ****************************************************************************/
   
    /**
     * Initializer.
     */
    function init() {
        boardController = new CHECKERS.BoardController({
            containerEl: options.containerEl,
            assetsUrl: options.assetsUrl
        });
        
        boardController.drawBoard(onBoardReady);
    }
    
    function zotal(res){
       
        last[movnum]=last[movnum]+res[0]+res[1];
        if(last[movnum]>39){
            last[movnum]=last[movnum]-39;
        }

        //console.log(placecard[last]);
        if(placecard[last[movnum]].length!=0){
          
            
            $("#plcb").show();
            if(propert[last[movnum]].length==0){
                if(movnum==myid){
                    $("#bton").show();
                }
                
            }else{
                $("#bton").hide();
            }
            $("#placen").text(placecard[last[movnum]][0]);
            $("#cost").text("COST: "+parseInt(placecard[last[movnum]][1])/2+" COCOS");
            $("#rent").text("Rent: "+parseInt(placecard[last[movnum]][2])/2+" COCOS");
            
        }else{
            $("#plcb").hide();
        }

        boardController.move(movnum,last[movnum]);
    }

    $(document).ready(function(){
        $("#btng").click(function(){
            $("#btng").hide();

            bcx.callContractFunction({
                nameOrId:"contract.final",
                functionName:"rolldice",
                valueList:[roomidx],
                runtime: 10,
                onlyGetFee: false
            }).then(function (res){
               if(res["code"]==1){
                   var drt=res['data'][0]['contract_affecteds'][0]['raw_data']['message'];
                   var dfdrt=drt.split(",");
                   var dicenum=parseInt(dfdrt[0]);
                   const element = document.getElementById('dicer');
                   var sssdsa=randomjo(dicenum);
                   var out='<font size="2" color="#db6767">';
                   for(var i=2;i<dfdrt.length;i++){
                        playerthingx[i-2]=dfdrt[i]; 
                        out=out+'<div class="column"><div class="rcorners1">'+playerthing[i-2]+':&nbsp'+dfdrt[i]+'&nbspCOCOS</div></div>'
                        
                   }
                   out=out+'</font>';
                   document.getElementById('jaddu').innerHTML=out
                   movnum=parseInt(myid);
                   ws.send(JSON.stringify({task : "brodcastroll",message:myid+","+drt}));
                   rollADie({ element, numberOfDice: 2, callback: zotal, values: sssdsa});

                }   
            })
            
            

     
        });
        $("#bton").click(function(){
            $("#bton").hide();
            bcx.callContractFunction({
                nameOrId:"contract.final",
                functionName:"buy",
                valueList:[roomidx],
                runtime: 10,
                onlyGetFee: false
            }).then(function (res){
               if(res["code"]==1){
                   var drt=res['data'][0]['contract_affecteds'][0]['raw_data']['message'];
                   var dfdrt=drt.split(",");
                   var out='<font size="2" color="#db6767">';
                   playerthingx[pasrseInt(myid)]=dfdrt[1];
                   for(var i=0;i<playerthing.length;i++){
                      
                        out=out+'<div class="column"><div class="rcorners1">'+playerthing[i]+':&nbsp'+playerthingx[i]+'&nbspCOCOS</div></div>'
                        
                   }
                   out=out+'</font>';
                   document.getElementById('jaddu').innerHTML=out
                   propert[parseInt(dfdrt[0])]=["HOUSEFULL"];
                   ws.send(JSON.stringify({task : "broadcastbuy",message:myid+","+drt}));
                  

                }   
            })
            
            

        });
      });



    /**
     * On board ready.
     */
    function onBoardReady() {
        // setup the board pieces
        var calleridx;
        bcx= window.BcxWeb;
        bcx.getAccountInfo().then(function (res){
			if(res["account_id"]!=""){
                calleridx=res["account_name"];
            }
        
         ws = new WebSocket("ws://127.0.0.1:5001/game");
				
        ws.onopen = function() {
           
           // Web Socket is connected, send data using send()
           ws.send(JSON.stringify({task : "register",roomid:roomidx,playerid:playeridx}));
           
        };
         
        ws.onmessage = function (evt) { 
            var received_msg = evt.data;
            var obj = JSON.parse(received_msg);
            if(obj.resposne=="sucess"){
                if(obj.task=="playerlist"){
                    var lsdsd = (obj.message).split(",");
                    var out='<font size="2" color="#db6767">';
                    lsdsd.forEach(function(item){
                        var sds =item.split(":");
                        var mymon=playerthingx[parseInt(sds[1])];
                        out=out+'<div class="column"><div class="rcorners1">'+sds[0]+':&nbsp'+mymon+'&nbspCOCOS</div></div>'
                        playerthing[sds[1]]=sds[0];
                        if(sds[0]==calleridx){
                            myid==sds[1];
                        }

                    });
                    out=out+'</font>';
                    document.getElementById('jaddu').innerHTML=out

                }else if(obj.task=="takechance"){
                    $("#btng").show();
                    alert("Its your chance! Roll Dice");
                }else if(obj.task=="brodcastroll"){
                    var dfdrt=(obj.message).split(",");
                    var dicenum=parseInt(dfdrt[1]);
                    var sssdsa=randomjo(dicenum);
                    var out='<font size="2" color="#db6767">';
                    for(var i=3;i<dfdrt.length;i++){
                         playerthingx[i-3]=dfdrt[i]; 
                         out=out+'<div class="column"><div class="rcorners1">'+playerthing[i-3]+':&nbsp'+dfdrt[i]+'&nbspCOCOS</div></div>'
                         
                    }
                    movnum=parseInt(dfdrt[0]);
                    
                    zotal(sssdsa);

                    out=out+'</font>';
                    document.getElementById('jaddu').innerHTML=out
                   
                }else if(obj.task=="broadcastbuy"){
                    var drt=res['data'][0]['contract_affecteds'][0]['raw_data']['message'];
                    var dfdrt=drt.split(",");
                    var out='<font size="2" color="#db6767">';
                    playerthingx[pasrseInt(dfdrt[0])]=dfdrt[2];
                    for(var i=0;i<playerthing.length;i++){
                       
                         out=out+'<div class="column"><div class="rcorners1">'+playerthing[i]+':&nbsp'+playerthingx[i]+'&nbspCOCOS</div></div>'
                         
                    }
                    out=out+'</font>';
                    document.getElementById('jaddu').innerHTML=out
                    propert[parseInt(dfdrt[1])]=["HOUSEFULL"];

                }
        
        }}
         
        ws.onclose = function() { 
           
           // websocket is closed.
           alert("Connection is closed..."); 
        };


    });


var piece = {
            color: CHECKERS.BLACK,
            pos: [6.8,7]
        };
        boardController.addPiece(piece);

     
        var piecex = {
            color: CHECKERS.WHITE,
            pos: [7.2,7]
        };
        boardController.addPiece(piecex);
        var piecexx= {
            color: CHECKERS.GREEN,
            pos: [6.8,7.4]
        };
        boardController.addPiece(piecexx);
        /*
	    var row, col, piece;
	    //
	    for (row = 0; row < board.length; row++) {
	        for (col = 0; col < board[row].length; col++) {
	            if (row < 3 && (row + col) % 2) { // black piece
	                piece = {
	                    color: CHECKERS.BLACK,
	                    pos: [row, col]
	                };
	            } else if (row > 4 && (row + col) % 2) { // white piece
	                piece = {
	                    color: CHECKERS.WHITE,
	                    pos: [row, col]
	                };
	            } else { // empty square
	                piece = 0;
	            }
	 
	            board[row][col] = piece;
	 
	            if (piece) {
	               
	            }
	        }
        }
        */
	}
    
    init();
};