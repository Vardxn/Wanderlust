/**
 * Database Connection Test Script
 * Tests both MongoDB and PostgreSQL connections
 */

require('dotenv').config();

// Test MongoDB connection
const testMongoDB = async () => {
    console.log('\n🍃 Testing MongoDB Connection...');
    console.log('━'.repeat(50));
    
    try {
        const mongoose = require('mongoose');
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/wanderlust';
        
        await mongoose.connect(mongoUrl);
        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
        
        // Get database stats
        const admin = mongoose.connection.db.admin();
        const info = await admin.serverInfo();
        console.log(`🗄️  MongoDB Version: ${info.version}`);
        
        // Get collections count
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📚 Collections: ${collections.length}`);
        
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
};

// Test PostgreSQL connection
const testPostgreSQL = async () => {
    console.log('\n🐘 Testing PostgreSQL Connection...');
    console.log('━'.repeat(50));
    
    try {
        const pg = require('./connection');
        const connected = await pg.testConnection();
        
        if (connected) {
            // Get database size
            const sizeResult = await pg.query(`
                SELECT pg_size_pretty(pg_database_size($1)) as size
            `, [process.env.PG_DATABASE || 'wanderlust']);
            console.log(`💾 Database size: ${sizeResult.rows[0].size}`);
            
            // Get table count
            const tableResult = await pg.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            `);
            console.log(`📊 Tables: ${tableResult.rows[0].count}`);
            
            // Get connection pool stats
            const stats = pg.getPoolStats();
            console.log(`🏊 Pool stats: Total=${stats.total}, Idle=${stats.idle}, Waiting=${stats.waiting}`);
            
            await pg.closePool();
        }
        
        return connected;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Tip: Make sure PostgreSQL server is running');
        } else if (error.code === '28P01') {
            console.log('💡 Tip: Check your PostgreSQL username/password in .env file');
        } else if (error.code === '3D000') {
            console.log('💡 Tip: Database does not exist. Create it first with: createdb wanderlust');
        }
        return false;
    }
};

// Main test function
const runTests = async () => {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║     Wanderlust Database Connection Test       ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    const mongoResult = await testMongoDB();
    const pgResult = await testPostgreSQL();
    
    console.log('\n' + '━'.repeat(50));
    console.log('📋 Test Summary');
    console.log('━'.repeat(50));
    console.log(`MongoDB:    ${mongoResult ? '✅ Connected' : '❌ Failed'}`);
    console.log(`PostgreSQL: ${pgResult ? '✅ Connected' : '❌ Failed'}`);
    console.log('━'.repeat(50));
    
    if (mongoResult && pgResult) {
        console.log('\n🎉 Both databases are ready!');
    } else if (mongoResult) {
        console.log('\n⚠️  MongoDB is working. Set up PostgreSQL when ready.');
    } else if (pgResult) {
        console.log('\n⚠️  PostgreSQL is working. MongoDB might need attention.');
    } else {
        console.log('\n❌ Both database connections failed. Check configuration.');
    }
    
    process.exit(0);
};

// Run the tests
runTests().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});
