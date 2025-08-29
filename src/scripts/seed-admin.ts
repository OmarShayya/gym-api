import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MembersService } from '../members/members.service';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const membersService = app.get(MembersService);

  try {
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gym.com',
      phone: '0000000000',
      password: 'admin123',
      membershipStartDate: new Date().toISOString(),
      membershipEndDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    const admin = await membersService.create(adminData);

    // Update to admin role
    await membersService.update(admin._id.toString(), { role: 'admin' });

    console.log('Admin user created successfully');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await app.close();
  }
}

seedAdmin();
