import { Get, Controller, Render, Param, Put, Post, Body, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { get } from "http";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/:username')
  async getByUsername(
    @Param('username') username: string,
  ): Promise<User | { id: number }> {
    const res = await this.userService.getByUsername(username);
    if (!res) return { id: 0 };
    return res;
  }

  @Post('changeUsername')
  async changeUsername(@Body('newname') newname: string, @Body('oldname') oldname: string) {
    await this.userService.changeName(newname, oldname);
  }

  @Post('changeAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(@UploadedFile() file: Express.Multer.File, @Body() body){
    //console.log ("");
    //console.log ("[changeAvatar]");
    //console.log(body.client);
    const base64string = btoa(String.fromCharCode(...new Uint8Array(file.buffer)));
    //console.log(base64string);
    return {img: await this.userService.changeAvatar(Number(body.client), base64string)};
  }

  @Get('getAvatar/:client')
  async getAvatar(@Param('client') client: string){
    return (await this.userService.getByUsername(client)).avatar;
  }

  @Post('blockUser')
  async blockUser(@Body('client') client: string, @Body('userToBlock')userToBlock: string){
    //console.log(["___blockUser"]);
    //console.log("client = ", client, "userToBlock = ", userToBlock);
    await this.userService.blockUser(client, userToBlock);
    //return ();
  }

  @Post('checkFriendship')
  async checkFriendship(@Body('client1') client1: string, @Body('client2')client2: string){
    //console.log("[__checkFriendship]");
    return await this.userService.checkFriendship(client1, client2);
    //return ()
  }

  @Post('addFriend')
  async addFriend(@Body('client') client: string, @Body('profileUser') profileUser: string){
      return await this.userService.addFriend(client, profileUser);
  }

  @Post('deleteRequestOrFriendship')
  async deleteRequestOrFriendship(@Body('client') client: string, @Body('profileUser') profileUser: string){
    return await this.userService.deleteRequestOrFriendship(client, profileUser);
  }

  @Post('acceptFriendRequest')
  async acceptFriendRequest(@Body('client') client: string, @Body('profileUser') profileUser: string){
    return await this.userService.acceptFriendRequest(client, profileUser);
  }

  @Get('getFriendships/:client')
  async GetFriendships(@Param('client') client: string){
    return await this.userService.getFriendships(client);
  }

  @Post('getFriends')
  async GetFriends(@Body('client') client: string, @Body('profileUser') profileUser: string){
    return await this.userService.getFriends(client, profileUser);
  }

  @Get('getListFriends/:client')
  async GetListFriends(@Param('client') client: string){
    return await this.userService.getListFriends(client);
  }

  @Get('getOnlineFriends/:client')
  async GetOnlineFriends(@Param('client') client: string){
    return await this.userService.getOnlineFriends(client);
  }

  /*@Put("create/:username") //da aggiungere qualcosa qui???
  async createUser(@Param("username") username: string, clientSocket: string) {
    //da aggiungere un secondo @Params???
    return this.userService.create(username);
  }

  @Get("id/:id")
  async getUserFromId(@Param("id") id: number) {
    const user: User = await this.userService.findOne(id);
    return user;
  }

  @Get("prova")
  async paginaProva(){
    return "hai fatto l'accesso";
  }*/
}
