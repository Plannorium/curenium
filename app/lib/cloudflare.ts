export const connectToDO = async (room: string, token: string ) => { 
  const response = await fetch(`/api/chat/socket?room=${room} `, { 
    headers: { Authorization: `Bearer ${token} ` }, 
  }); 

  const wsUrl = await response.text (); 
  const socket = new WebSocket (wsUrl); 

  return  socket; 
};