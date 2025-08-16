import { PrismaClient } from '@prisma/client';
import { logger, dbLogger, logDatabaseQuery } from './logger';

// Extend PrismaClient with logging and error handling
class DatabaseClient extends PrismaClient {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Set up event listeners for logging
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        logDatabaseQuery(e.query, e.duration);
      });
    }

    // Log errors
    this.$on('error', (e) => {
      dbLogger.error('Database error', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    // Log info messages
    this.$on('info', (e) => {
      dbLogger.info('Database info', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    // Log warnings
    this.$on('warn', (e) => {
      dbLogger.warn('Database warning', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });
  }

  // Enhanced connection method with retry logic
  async connect(retries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.$connect();
        dbLogger.info('✅ Database connected successfully');
        return;
      } catch (error) {
        dbLogger.error(`❌ Database connection attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw new Error(`Failed to connect to database after ${retries} attempts`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        dbLogger.info(`⏳ Retrying database connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Enhanced disconnect method
  async disconnect(): Promise<void> {
    try {
      await this.$disconnect();
      dbLogger.info('✅ Database disconnected successfully');
    } catch (error) {
      dbLogger.error('❌ Error disconnecting from database:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      dbLogger.error('Database health check failed:', error);
      throw new Error('Database health check failed');
    }
  }

  // Transaction wrapper with logging
  async executeTransaction<T>(
    fn: (tx: any) => Promise<T>,
    options?: { timeout?: number; isolationLevel?: any }
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await this.$transaction(fn, {
        timeout: options?.timeout || 10000, // 10 seconds default
        isolationLevel: options?.isolationLevel,
      });
      
      const duration = Date.now() - start;
      dbLogger.info(`Transaction completed successfully in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      dbLogger.error(`Transaction failed after ${duration}ms:`, error);
      throw error;
    }
  }

  // Batch operation helper
  async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      dbLogger.debug(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(operations.length / batchSize)}`);
    }
    
    return results;
  }

  // Soft delete helper
  async softDelete(model: string, id: string, userId?: string): Promise<any> {
    const updateData: any = {
      isDeleted: true,
      deletedAt: new Date(),
    };
    
    if (userId) {
      updateData.updatedBy = userId;
    }

    // @ts-ignore - Dynamic model access
    return this[model].update({
      where: { id },
      data: updateData,
    });
  }

  // Restore soft deleted record
  async restore(model: string, id: string, userId?: string): Promise<any> {
    const updateData: any = {
      isDeleted: false,
      deletedAt: null,
    };
    
    if (userId) {
      updateData.updatedBy = userId;
    }

    // @ts-ignore - Dynamic model access
    return this[model].update({
      where: { id },
      data: updateData,
    });
  }

  // Find with soft delete filter
  findManyActive(model: string, args: any = {}): Promise<any[]> {
    const whereClause = {
      ...args.where,
      isDeleted: false,
    };

    // @ts-ignore - Dynamic model access
    return this[model].findMany({
      ...args,
      where: whereClause,
    });
  }

  // Count with soft delete filter
  countActive(model: string, where: any = {}): Promise<number> {
    const whereClause = {
      ...where,
      isDeleted: false,
    };

    // @ts-ignore - Dynamic model access
    return this[model].count({
      where: whereClause,
    });
  }

  // Pagination helper
  async paginate<T>(
    model: string,
    args: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = args.page || 1;
    const limit = Math.min(args.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    const whereClause = {
      ...args.where,
      isDeleted: false,
    };

    const [data, total] = await Promise.all([
      // @ts-ignore - Dynamic model access
      this[model].findMany({
        where: whereClause,
        orderBy: args.orderBy,
        include: args.include,
        select: args.select,
        skip,
        take: limit,
      }),
      // @ts-ignore - Dynamic model access
      this[model].count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

// Create and export database instance
export const prisma = new DatabaseClient();

// Database connection helper
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.connect();
    logger.info('🗄️ Database connection established');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

// Database disconnection helper
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.disconnect();
    logger.info('🗄️ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

// Export types for use in other files
export type DatabaseTransaction = Parameters<typeof prisma.$transaction>[0];
export type DatabaseClient = typeof prisma;

export default prisma;
