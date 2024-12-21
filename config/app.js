const constant = {
    timezone: env('TIMEZONE', 'Asia/Manila'), // for Carbon
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
            timezone: env('MYSQL_TIMEZONE', '+08:00'),
            dateStrings: true
        }
    }
};
module.exports = constant;