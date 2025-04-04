const Post = require("../../models/Post");
const Redis = require("../../vendor/Redis");
const BaseController = require("../express/server/BaseController");
class Controller extends BaseController {
    before() {
        // dd('before');
    }
    async getPosts() {
        const selectFields = [
            'Post.id',
            'Post.title',
            '(CASE WHEN Post.type = 1 THEN Admin.name ELSE User.name END) AS author',
            'Post.created_at',
        ];

        const redis = new Redis();
        let data = await redis.get('posts');

        if (!data) {
            const posts = await Post.select(...selectFields)
                .leftJoin('admins as Admin', 'Post.user_id', '=', 'Admin.id')
                .leftJoin('users as User', 'Post.user_id', '=', 'User.id')
                .get();

            redis.setExpiration(3600);
            await redis.set('posts', JSON.stringify(posts));

            return posts;
        }

        return JSON.parse(data);
    }
}

module.exports = Controller;