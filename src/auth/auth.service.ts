import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MembersService } from '../members/members.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Types } from 'mongoose';

export interface ValidatedUser {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  memberId: string;
  phone: string;
  qrCode: string;
  fingerprintId?: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    memberId: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    const member = await this.membersService.findByEmail(email);
    if (!member) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      _id: member._id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      memberId: member.memberId,
      phone: member.phone,
      qrCode: member.qrCode,
      fingerprintId: member.fingerprintId,
      membershipStartDate: member.membershipStartDate,
      membershipEndDate: member.membershipEndDate,
      status: member.status,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        memberId: user.memberId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const member = await this.membersService.create(registerDto);

    const payload = {
      email: member.email,
      sub: member._id.toString(),
      role: member.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: member._id.toString(),
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        memberId: member.memberId,
      },
    };
  }
}
