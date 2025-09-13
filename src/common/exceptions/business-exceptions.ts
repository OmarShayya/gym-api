import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string,
    status: HttpStatus,
    details?: any,
  ) {
    super({ message, code, details }, status);
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor(message = 'Invalid email or password') {
    super(message, 'INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(
      `Email ${email} is already registered`,
      'EMAIL_EXISTS',
      HttpStatus.CONFLICT,
    );
  }
}

export class TokenExpiredException extends BusinessException {
  constructor(message = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends BusinessException {
  constructor(message = 'Invalid token') {
    super(message, 'INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
  }
}

export class AccountInactiveException extends BusinessException {
  constructor(message = 'Account is inactive') {
    super(message, 'ACCOUNT_INACTIVE', HttpStatus.FORBIDDEN);
  }
}

export class MembershipExpiredException extends BusinessException {
  constructor(message = 'Membership has expired') {
    super(message, 'MEMBERSHIP_EXPIRED', HttpStatus.FORBIDDEN);
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier: string) {
    super(
      `${resource} with identifier ${identifier} not found`,
      'RESOURCE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InsufficientPermissionsException extends BusinessException {
  constructor(message = 'Insufficient permissions to perform this action') {
    super(message, 'INSUFFICIENT_PERMISSIONS', HttpStatus.FORBIDDEN);
  }
}

export class InvalidOperationException extends BusinessException {
  constructor(message: string) {
    super(message, 'INVALID_OPERATION', HttpStatus.BAD_REQUEST);
  }
}
