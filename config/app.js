const constant = {
    timezone: env('TIMEZONE', 'Asia/Tokyo'), // for Carbon
    datetime_format: "Y-m-d H:i:s",
    date_format: "Y-m-d",
    time_format: "H:i:s",
    database: {
        type: env('DATABASE', 'sqlite'),
        mysql: {
            host: env('MYSQL_HOST', 'localhost'),
            port: env('MYSQL_PORT', 3306),
            user: env('MYSQL_USER', 'root'),
            password: env('MYSQL_PASSWORD', ''),
            database: env('MYSQL_DB', 'express'),
            charset: 'utf8mb4',
            connectionLimit: 5,
            dateStrings: true
        },
        timezone: env('DATABASE_TIMEZONE', '+08:00'),
    },
    redis: {
        "url": env('REDIS_URL', '')
    }
};
module.exports = constant;