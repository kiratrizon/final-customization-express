const constant = {
    timezone: "Asia/Manila",
    datetime_format: "Y-m-d H:i:s",
    date_format: "Y-m-d",
    time_format: "H:i:s",
    database: {
        type: env('DATABASE', 'sqlite'),
        mysql: {
            host: env('MYSQL_HOST', 'localhost'),
            port: env('MYSQL_PORT', 3306),
            username: env('MYSQL_USER', 'root'),
            password: env('MYSQL_PASSWORD', ''),
            database: env('MYSQL_DB', 'troy_project'),
        }
    }
};

module.exports = constant;