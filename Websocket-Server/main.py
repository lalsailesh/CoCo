from tornado import websocket
from tornado.web import RequestHandler
import tornado.ioloop
import websocket as wer
import os
import json
import string
import random
import threading
import requests


availroom={"sada":"asds","sad":"sadasd","asdf":"rgdf"}
busyroom={}

roomuser={}
gameuser={}



def id_generator(size=4, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))



class player(object):
    def __init__(self,playerid):
        self.playerid=playerid

    def setcallerid(self,callerid):
        self.callerid=callerid

    def setchance(self,num):
        self.num=num





class roommanger(object):
    def __init__(self, id, playerid):
        self.id=id
        self.admin=playerid
        self.playerlist={}
        self.nextturn=1


    def join(self,playerid):
        if len(self.playerlist)>3:
            return False
        if playerid in self.playerlist:
            return False
        self.playerlist[playerid]=player(playerid)
        return True



    def exit(self,playerid):
        if len(self.playerlist) !=0:
            del self.playerlist[playerid]
            if len(self.playerlist)==0:
                global availroom
                del availroom[self.id]

class EchoWebSocket(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("Websocket Opened")

    def on_message(self, message):
        self.write_message(u"You said: %s" % message)

    def on_close(self):
        print("Websocket closed")

class roomsocket(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        pass

    def on_message(self, message):
        try:
            global roomuser
            global availroom
            global busyroom
            global roommanger
            data=json.loads(message)
            print(data)
            if data["task"]=="register":
                self.playerid=data["playerid"]
                roomuser[self.playerid]=self
                self.write_message({"response": "sucess","task":"register"})
            elif data["task"]=="createroom":
                roomid=""
                while True:
                    try:
                        roomid = id_generator()
                        temp=availroom[roomid]
                    except:
                        break
                self.roomid=roomid
                t1 = threading.Thread(target=createroomthred, args=(self.roomid,self.playerid,))
                t1.start()
                #execute thred to run contract init_game
            elif data["task"]=="joinroom":
                self.roomid=data["roomid"]

                print("this is the best")
                t1 = threading.Thread(target=joinroomthred, args=(self.roomid,self.playerid,data["callerid"],data["num"],))
                t1.start()
                # execute thred to run contract for if user paid
            elif data["task"]=="go":
                room=availroom[self.roomid]
                if room.admin==self.playerid and len(room.playerlist)>1:
                    for player in room.playerlist:
                        roomuser[player].write_message({"response":"sucess","task":"go"})
                    busyroom[self.roomid]=room
                    del availroom[self.roomid]
                else:
                    roomuser[self.playerid].write_message({"response": "error"})
            elif data["task"]=="background":
                if data["subtask"]=="createroom":
                    print("BEFORE ERROR")
                    availroom[data["roomid"]]= roommanger(data["roomid"],data["playerid"])
                    roomuser[data["playerid"]].write_message({"response":"sucess","task":"createroom","message": data["roomid"]})
                elif data["subtask"]=="joinroom":
                    if availroom[data["roomid"]].join(data["playerid"]):
                        availroom[data["roomid"]].playerlist[data["playerid"]].setcallerid(data["callerid"])
                        availroom[data["roomid"]].playerlist[data["playerid"]].setchance(data["num"])
                        roomuser[data["playerid"]].write_message({"response": "sucess", "task": "joinroom", "message": data["roomid"]})
                        for player in availroom[data["roomid"]].playerlist:
                            roomuser[player].write_message({"response": "sucess", "task": "syncroom", "message": data["playerid"]})
                    else:
                        roomuser[data["playerid"]].write_message({"response":"error"})
            else:
                self.write_message({"response":"error"})
        except Exception as e:
            print("Error",str(e))
            self.write_message({"response":"error"})


    def on_close(self):
        global roomuser
        try:
            del roomuser[self.playerid]
        except:
            pass


def createroomthred(roomid,playerid):
    def on_message(ws, message):
        pass

    def on_error(ws, error):
        pass

    def on_close(ws):
        pass

    def on_open(ws):
        data=json.dumps({"response":"sucess","task":"background","subtask":"createroom","playerid":playerid,"roomid":roomid})
        ws.send(data)
        ws.close()

    #call contract for init_game
    #if response True then send message to ws
    data={"gameid":roomid}
    p=requests.post("http://127.0.0.1:3002/startgame",data=data).text
    p=json.loads(p)
    if p["response"]=="sucess":
        if True:
            wer.enableTrace(True)
            ws = wer.WebSocketApp("ws://127.0.0.1:5001/room",on_message = on_message,on_error = on_error,on_close = on_close)
            ws.on_open = on_open
            ws.run_forever()

def joinroomthred(roomid,playerid,callerid,num):
    def on_message(ws, message):
        pass

    def on_error(ws, error):
        pass

    def on_close(ws):
        pass

    def on_open(ws):
        print("hello in thread")
        data=json.dumps({"response":"sucess","task":"background","subtask":"joinroom","playerid":playerid,"roomid":roomid,"callerid":callerid,"num":num})
        ws.send(data)
        ws.close()

    #call contract for register
    #if response True then send message to ws
    data={"gameid":roomid,"playerid":playerid}
    p=requests.post("http://127.0.0.1:3002/isregistered",data=data).text
    
    p=json.loads(p)
    if p["response"]=="sucess":
        if True:
            wer.enableTrace(True)
            ws = wer.WebSocketApp("ws://127.0.0.1:5001/room",on_message = on_message,on_error = on_error,on_close = on_close)
            ws.on_open = on_open
            ws.run_forever()

def settlmentthred(roomid,playerid):
    data = {"gameid": roomid,"playerid":playerid}
    p = requests.post("http://127.0.0.1:3002/settlment", data=data).text



class gamesocket(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        pass

    def on_message(self, message):
        global busyroom
        global gameuser
        try:
            data=json.loads(message)
            if data["task"]=="register":
                self.roomid=data["roomid"]
                self.playerid=data["playerid"]
                self.player=busyroom[self.roomid].playerlist[self.playerid]
                gameuser[self.playerid]=self
                self.write_message({"response":"sucess","task":"register","message":self.player.callerid})
                out=""
                for player in busyroom[self.roomid].playerlist:
                    out+=busyroom[self.roomid].playerlist[player].callerid+":"+busyroom[self.roomid].playerlist[player].num+","
                self.write_message({"response": "sucess", "task": "playerlist", "message": out})
                if self.player.num=="1":
                    self.write_message({"response": "sucess", "task": "takechance"})
            elif data["task"]=="brodcastroll":
                room=busyroom[self.roomid]
                current=room.nextturn
                room.nextturn=data["message"].split(",")[2]
                for player in room.playerlist:
                    if player != self.playerid:
                        gameuser[player].write_message({"response":"sucess","task":"brodcastroll","message":data["message"]+","+current})
            elif data["task"]=="turnover":
                room=busyroom[self.roomid]
                for player in room.playerlist:
                    if gameuser[player].player.num==room.nextturn:
                        gameuser[player].write_message({"response": "sucess", "task": "takechance"})
                        break
            elif data["task"]=="broadcastbuy":
                room = busyroom[self.roomid]
                for player in room.playerlist:
                    if player != self.playerid:
                        gameuser[player].write_message({"response": "sucess", "task": "broadcastbuy", "message": data["message"]})
            else:
                self.write_message({"response": "error"})
        except:
            self.write_message({"response":"error"})

    def on_close(self):
        #do settlment
        global gameuser
        global busyroom
        for player in busyroom[self.roomid].playerlist:
            if player != self.playerid:
                gameuser[player].write_message({"response": "sucess", "task": "exit", "message": self.playerid})
        del gameuser[self.playerid]
        del busyroom[self.roomid].playerlist[self.playerid]
        t1 = threading.Thread(target=settlmentthred(), args=(self.roomid, self.playerid,))
        t1.start()
        out = ""
        for player in busyroom[self.roomid].playerlist:
            out += busyroom[self.roomid].playerlist[player].callerid + ":" + busyroom[self.roomid].playerlist[player].num + ","
        self.write_message({"response": "sucess", "task": "playerlist", "message": out})
        if len(busyroom[self.roomid].playerlist) == 0:
            del busyroom[self.roomid]


'''
class createroom(RequestHandler):
    def check_origin(self, origin):
        return True

    def post(self):
        global availroom
        data=json.loads(self.request.body.decode("utf-8"))
        roomid=""
        while True:
            try:
                roomid=id_generator()
                availroom[roomid]
            except:
                break
        newroom=room(roomid, data["playerid"])
        availroom[roomid]=newroom
        self.write({"roomid":newroom.id})
'''

class getroom(RequestHandler):
    def check_origin(self, origin):
        return True

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        global availroom
        out=[]
        for x in availroom:
            out.append(x)
        z={}
        z[len(availroom)]=out
        self.write(z)

'''
class joinroom(RequestHandler):
    def check_origin(self, origin):
        return True

    def post(self):
        global availroom
        data = json.loads(self.request.body.decode("utf-8"))
        try:
            room=availroom[data["roomid"]]
            result=room.join(data["playerid"])
            if result:
                self.write({"response":"Room Joined"})
            else:
                self.write({"response":"Room is full"})
        except:
            self.write({"response":"Room not found"})

'''




application = tornado.web.Application([(r"/", EchoWebSocket),
                                       (r"/game", gamesocket),
                                       (r"/room", roomsocket),
                                       #(r"/createroom",createroom),
                                       #(r"/joinroom",joinroom),
                                       (r"/getroom", getroom)
                                       ])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    application.listen(port)
    tornado.ioloop.IOLoop.instance().start()
