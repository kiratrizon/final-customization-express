const Factory = require("../../base/Factory");
const Hash = require("../../../libraries/Services/Hash");
const Post = require("../../../models/Post");

class PostFactory extends Factory {

    model = Post;
    
    async definition() {
        return {
            user_id: this.faker.number.int({min: 1, max:20}),
            type: this.faker.number.int({min:1, max:2}),
            title: this.faker.lorem.words(5)
        };
    }
}

module.exports = PostFactory;