import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: string;
  level: string;
  context?: string;
  message: string;
  trace?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private context?: string;
  private logDir: string;
  private isProduction: boolean;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    this.logDir = path.join(process.cwd(), 'logs');
    
    if (this.isProduction) {
      this.ensureLogDirectory();
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  private formatMessage(level: string, message: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context: context || this.context,
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
    };
  }

  private writeToFile(entry: LogEntry) {
    if (!this.isProduction) return;

    const fileName = this.getLogFileName(entry.level.toLowerCase());
    const logLine = JSON.stringify(entry) + '\n';

    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        if (stats.size >= this.maxFileSize) {
          this.rotateLogFile(fileName);
        }
      }

      fs.appendFileSync(fileName, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  private rotateLogFile(fileName: string) {
    const baseName = path.basename(fileName);
    const dir = path.dirname(fileName);

    // Shift existing rotated files
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${baseName}.${i}`);
      const newFile = path.join(dir, `${baseName}.${i + 1}`);
      if (fs.existsSync(oldFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    // Rename current file to .1
    fs.renameSync(fileName, path.join(dir, `${baseName}.1`));
  }

  private colorize(level: string, message: string): string {
    const colors: Record<string, string> = {
      LOG: '\x1b[32m',     // Green
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      DEBUG: '\x1b[36m',   // Cyan
      VERBOSE: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    return `${colors[level] || ''}${message}${reset}`;
  }

  private printToConsole(entry: LogEntry, trace?: string) {
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const output = `[${entry.timestamp}] ${this.colorize(entry.level, entry.level.padEnd(7))} ${contextStr} ${entry.message}`;
    
    if (entry.level === 'ERROR') {
      console.error(output);
      if (trace) console.error(trace);
    } else if (entry.level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  log(message: any, context?: string) {
    const entry = this.formatMessage('log', message, context);
    this.printToConsole(entry);
    this.writeToFile(entry);
  }

  error(message: any, trace?: string, context?: string) {
    const entry = this.formatMessage('error', message, context);
    entry.trace = trace;
    this.printToConsole(entry, trace);
    this.writeToFile(entry);
  }

  warn(message: any, context?: string) {
    const entry = this.formatMessage('warn', message, context);
    this.printToConsole(entry);
    this.writeToFile(entry);
  }

  debug(message: any, context?: string) {
    if (this.isProduction) return; // Skip debug in production console
    const entry = this.formatMessage('debug', message, context);
    this.printToConsole(entry);
  }

  verbose(message: any, context?: string) {
    if (this.isProduction) return; // Skip verbose in production console
    const entry = this.formatMessage('verbose', message, context);
    this.printToConsole(entry);
  }

  fatal(message: any, context?: string) {
    const entry = this.formatMessage('error', `[FATAL] ${message}`, context);
    this.printToConsole(entry);
    this.writeToFile(entry);
  }

  setLogLevels?(levels: LogLevel[]) {
    // Implement if needed
  }
}
