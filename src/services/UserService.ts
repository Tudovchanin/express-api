import argon2 from "argon2";
import { generateRefreshToken, verifyToken} from '../utils/authUtils';
import type { CreateUserData, UserRepository } from "../types";
import type { JwtPayload } from "jsonwebtoken";

import type { IEmailService } from "./EmailService";
import { log } from "console";
const JWT_ACTIVATE_EMAIL_SECRET = process.env.JWT_ACTIVATE_EMAIL_SECRET!;

class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService?: IEmailService
  ) {}

  async createUser(data: CreateUserData) {
    const userExist = await this.userRepository.findByEmail(data.email);
    if (userExist) {
      throw new Error("Mail already exists");
    }

    const hashed = await argon2.hash(data.password);
    const birthDateObj = new Date(data.birthDate);

    const userData = {
      fullName: data.fullName,
      birthDate: birthDateObj,
      email: data.email,
      password: hashed,
      role: "USER",
      isActive: true,
    };

    const newUser = await this.userRepository.create(userData);
    const emailUser =newUser.email;
    const userId = newUser.id;

    if(this.emailService) {
     
    try {
      const tokenActivateEmail = generateRefreshToken({ userId, secret: JWT_ACTIVATE_EMAIL_SECRET, expiresIn: '1d'});
      const activationLink = `${process.env.CLIENT_URL}/${process.env.ACTIVATE_PAGE}?token=${tokenActivateEmail}`;
      await this.emailService.sendActivateEmail(emailUser, activationLink);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }
    }

    return newUser;
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User with such email does not exist");
    }
    const passwordIsValid = await argon2.verify(user.password!, password);
    if (!passwordIsValid) {
      throw new Error("Password incorrect");
    }
    return user;
  }

  async userIsActive(id: number) {
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
    const unblockedUser = await this.userRepository.update(id, {
      isActive: true,
    });
    return unblockedUser;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.deleteUserById(id);
    return user;
  }

  async activateEmail(token: string){
    console.log(token, 'TOKENeMAIL');
    
    const payload = verifyToken(token, JWT_ACTIVATE_EMAIL_SECRET);
    console.log(payload, 'PAYLOAD');
    
    if (!payload || typeof payload === 'string' ) throw new Error("Invalid or expired token");
    const user = await this.userRepository.findById(payload.userId);
    if (!user) throw new Error("User not found");

    if (user.emailConfirmed) {
      throw new Error("User already activated");
    }

    const result = await this.userRepository.update(user.id, { emailConfirmed: true});

    return result;
  }
}

export default UserService;
