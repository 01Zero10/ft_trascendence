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

  @Get('accountInfo/:username')
  async GetAccountInfo(@Param('username') username: string): Promise <User> {
    const res = await this.userService.getAccountInfo(username);
    return res;
  }

  @Post('changeNickname') //quii
  async changeUsername(@Body('username') username: string, @Body('newNickname') newNickname: string) {
    await this.userService.changeNickname(username, newNickname);
  }

  @Post('changeAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(@UploadedFile() file: Express.Multer.File, @Body() body){
    const base64string = btoa(String.fromCharCode(...new Uint8Array(file.buffer)));
    return {img: await this.userService.changeAvatar(Number(body.client), base64string)};
  }

  @Get('getAvatar/:client')
  async getAvatar(@Param('client') client: string){
    return (await this.userService.getByUsername(client)).avatar;
  }

  @Post('blockUser')
  async blockUser(@Body('client') client: string, @Body('userToBlock')userToBlock: string){
    await this.userService.blockUser(client, userToBlock);
    //return ();
  }

  @Post('checkBlock')
  async checkBlock(@Body('client') client: string, @Body('userToCheck') userToCheck: string){
    return await this.userService.checkBlock(client, userToCheck);
  }

  // @Post('blockUser') //on-off
  // async BlockUser(@Body('client') client: string, @Body('userToBlock') userToBlock: string){
  //   return await this.userService.blockUser(client, userToBlock);
  // }

  @Post('checkFriendship')
  async checkFriendship(@Body('client1') client1: string, @Body('client2')client2: string){
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

  @Post('getFriendsRequest')
  async GetFriendsRequest(@Body('client') client: string, @Body('profileUser') profileUser: string){
    return await this.userService.getFriendsRequest(client, profileUser);
  }

  @Get('getListFriends/:client')
  async GetListFriends(@Param('client') client: string){
    return await this.userService.getListFriends(client);
  }

  @Get('getOnlineFriends/:client')
  async GetOnlineFriends(@Param('client') client: string){
    return await this.userService.getOnlineFriends(client);
  }

  @Post('bellUserToUpdate')
  async UpdateBell(@Body('bellUserToUpdate')bellUserToUpdate: string){
    await this.userService.updateBell(bellUserToUpdate);
  }

  @Get('getUserFromNick/:nickname')
  async GetUserFromNick(@Param('nickname') nickname: string) {
    return {'username': await this.userService.getUserFromNick(nickname)};
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
  }*/

  // @Get("prova/:username")
  // async paginaProva(@Param('username') username: string){
  //   //console.log("ciao");
  //   return this.userService.getUserForAccountPage(username);
  // }
}
