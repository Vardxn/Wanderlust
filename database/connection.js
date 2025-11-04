/**
 * PostgreSQL Database Connection Module
 * Handles connection pooling and query execution for PostgreSQL
 */

const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool configuration
const poolConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'wanderlust',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    
    // Connection pool settings
    min: parseInt(process.env.PG_POOL_MIN) || 2,
    max: parseInt(process.env.PG_POOL_MAX) || 10,
    idleTimeoutMillis: parseInt(process.env.PG_POOL_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Pool error handler
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Pool connection event
pool.on('connect', (client) => {
    console.log('🔗 New PostgreSQL client connected');
});

// Pool removal event
pool.on('remove', (client) => {
    console.log('👋 PostgreSQL client removed from pool');
});

/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as now, version() as version');
        console.log('✅ PostgreSQL connected successfully');
        console.log('📅 Server time:', result.rows[0].now);
        console.log('🗄️  Version:', result.rows[0].version.split(',')[0]);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        return false;
    }
};

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.ENABLE_QUERY_LOGGING === 'true') {
            console.log('📝 Executed query:', {
                text,
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        
        return result;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        throw error;
    }
};

/**
 * Get a client from the pool for transaction handling
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Set timeout to prevent hung connections
    const timeout = setTimeout(() => {
        console.error('❌ Client checkout timeout');
        client.release();
    }, 5000);
    
    // Override release to clear timeout
    client.release = () => {
        clearTimeout(timeout);
        client.release = release;
        return release();
    };
    
    return client;
};

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<any>} Transaction result
 */
const transaction = async (callback) => {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction rolled back:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Close all connections in the pool
 */
const closePool = async () => {
    try {
        await pool.end();
        console.log('✅ PostgreSQL connection pool closed');
    } catch (error) {
        console.error('❌ Error closing PostgreSQL pool:', error.message);
    }
};

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
const getPoolStats = () => {
    return {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
    };
};

// Export pool and utility functions
module.exports = {
    pool,
    query,
    getClient,
    transaction,
    testConnection,
    closePool,
    getPoolStats
};

// Handle application shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down PostgreSQL connection pool...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⏹️  Shutting down PostgreSQL connection pool...');
    await closePool();
    process.exit(0);
});
