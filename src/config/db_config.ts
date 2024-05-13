import dotenv from 'dotenv';
dotenv.config();
// Config for the DB and the Sequelize CLI
const db_config = {
    'development': {
        'username': process.env.NYUNGANIRA_DB_USER || 'postgres',
        'password': process.env.NYUNGANIRA_DB_PASSWORD || 'postgres',
        'database': process.env.NYUNGANIRA_DB_NAME || 'skill_sync',
        'host': process.env.NYUNGANIRA_DB_HOST || 'localhost',
        'port': parseInt(process.env.NYUNGANIRA_DB_PORT || '5432'),
        'dialect': 'postgres',
    },
    // Hardcode test_env vars so test functions do not get into any other system
    'test': {
        'username': 'nyunganira_user',
        'password': 'nyunganira_pass',
        'database': 'nyunganira_database',
        'host': 'nyunganira_db',
        'port': 5432,
        'dialect': 'postgres',
    },
    'production': {
        'username': process.env.NYUNGANIRA_DB_USER,
        'password': process.env.NYUNGANIRA_DB_PASSWORD,
        'database': process.env.NYUNGANIRA_DB_NAME,
        'host': process.env.NYUNGANIRA_DB_HOST,
        'port': parseInt(process.env.NYUNGANIRA_DB_PORT),
        'dialect': 'postgres',
    },
};

export { db_config };
