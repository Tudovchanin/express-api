
import argon2 from 'argon2';

import type { CreateUserData, UserRepository } from '../types';



class UserService {
  constructor(private userRepository: UserRepository) { }

  async createUser(data: CreateUserData) {

    const userExist = await this.userRepository.findByEmail(data.email);
    if (userExist) {
      throw new Error('Mail already exists');
    }

    const hashed = await argon2.hash(data.password);
    const birthDateObj = new Date(data.birthDate);

    const userData = {
      fullName: data.fullName,
      birthDate: birthDateObj,
      email: data.email,
      password: hashed,
      role:  'USER',
      isActive: true,
    }

    const newUser = await this.userRepository.create(userData);

    return newUser;
  }

  async authenticateUser(email: string, password: string) {
    const user =  await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User with such email does not exist');
    }
    const passwordIsValid = await argon2.verify(user.password!, password);
    if (!passwordIsValid) {
      throw new Error('Password incorrect');
    }
    return user;
  }

  async userIsActive(id:number) {
    return this.userRepository.findActiveById(id);
  }


  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users;
  }

  async blockUser(id: number) {

    const blockUser = await this.userRepository.update(id, { isActive: false });


    return blockUser;
  }

  async unblockUser(id: number) {
    const unblockedUser = await this.userRepository.update(id, { isActive: true })
    return unblockedUser;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.deleteUserById(id);
    return user;
  }
}


export default UserService;