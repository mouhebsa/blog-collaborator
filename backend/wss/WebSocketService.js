class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  setClients(clients) {
    this.clients = clients;
  }

  sendNotificationToUser(userId, notificationData) {
    const clientWs = this.clients.get(userId.toString());
    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(notificationData));
      console.log(`Sent notification to user ${userId}`);
      return true;
    } else {
      console.log(`User ${userId} not connected or WebSocket not open.`);
      return false;
    }
  }
}

module.exports = new WebSocketService();
