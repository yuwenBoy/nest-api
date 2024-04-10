import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from 'socket.io'

@WebSocketGateway(3002)
export class WsStartGateway {


    @SubscribeMessage('message')
    handleMeaage(client,data){
        console.log('接收客户端的消息：',data);
        client.emit('response',123);
    }
     
    @SubscribeMessage('hello')
    hello(@MessageBody() data:any):any{
        return {
            "event":"hello",
            "data":data,
            "msg":"resufisher.com"
        }
    }

      
    @SubscribeMessage('hello2')
    hello2(@MessageBody() data:any,@ConnectedSocket() client:Socket):any{
        console.log('收到消息 client',client);
        client.send(JSON.stringify({event:'temp',data:'这里是个临时信息'}));
        return {
            "event":"hello",
            "data":data,
        }
    }
}