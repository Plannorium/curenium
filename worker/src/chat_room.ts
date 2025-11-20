export class ChatRoom {
  state: any;
  env: any;
  constructor(state: any, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    return new Response("ChatRoom not implemented", { status: 501 });
  }
}