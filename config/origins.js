const constant = {
    'origins': JSON.parse(env('ORIGINS')) || []
};

module.exports = constant;