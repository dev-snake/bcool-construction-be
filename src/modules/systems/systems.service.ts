import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class SystemsService {
  private readonly logger = new Logger(SystemsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createBackup(res: Response) {
    const dbConfig = this.configService.get('database');
    const fileName = `backup-${Date.now()}.sql`;
    const filePath = path.join(process.cwd(), fileName);

    try {
      // Direct command with environment variables for password to avoid interactive prompt
      const cmd = `PGPASSWORD='${dbConfig.password}' pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f ${filePath}`;

      await execPromise(cmd);

      res.download(filePath, fileName, (err) => {
        if (err) {
          this.logger.error(`Error downloading backup: ${err.message}`);
        }
        // Cleanup file after download
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  async exportUsers(res: Response) {
    const users = await this.userRepository.find({
      relations: ['roles'],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Roles', key: 'roles', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 25 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        roles: user.roles?.map((r) => r.name).join(', '),
        status: user.isActive
          ? user.isLocked
            ? 'Locked'
            : 'Active'
          : 'Inactive',
        createdAt: user.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'users.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async importUsers(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    const usersToCreate: any[] = [];
    const rolesMap = new Map();

    // Skip header row
    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber === 1) return;

      const email = row.getCell(2).value?.toString();
      const fullName = row.getCell(3).value?.toString();
      const phone = row.getCell(4).value?.toString();
      const rolesStr = row.getCell(5).value?.toString();

      if (email) {
        usersToCreate.push({
          email,
          fullName,
          phone,
          rolesStr,
        });
      }
    });

    for (const userData of usersToCreate) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser) continue;

      const newUser = this.userRepository.create({
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        isActive: true,
        // Default password for imported users - should be changed
        passwordHash:
          '$2b$10$ru9XXL2t6rDvVe3lh3McL.fR7PCHjcGZmo03JG0P1BedSZd.0NsWK',
      });

      if (userData.rolesStr) {
        const roleNames = userData.rolesStr.split(',').map((s) => s.trim());
        const roles: Role[] = [];
        for (const name of roleNames) {
          let role = rolesMap.get(name);
          if (!role) {
            role = await this.roleRepository.findOne({ where: { name } });
            if (role) rolesMap.set(name, role);
          }
          if (role) roles.push(role);
        }
        newUser.roles = roles;
      }

      await this.userRepository.save(newUser);
    }

    // Cleanup uploaded file
    fs.unlinkSync(file.path);

    return {
      message: 'Users imported successfully',
      count: usersToCreate.length,
    };
  }
}
