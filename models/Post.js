const Model = require("../main/base/Model");

class Post extends Model {
    static factory = true;
    fillable = [
        'type',
        'user_id',
        'title'
    ];
};

module.exports = Post;