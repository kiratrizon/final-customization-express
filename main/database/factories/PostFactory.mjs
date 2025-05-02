import Factory from "../../base/Factory.mjs";
import Post from "../../../models/Post.mjs";


class PostFactory extends Factory {

    model = Post;

    definition() {
        return {
            user_id: this.faker.number.int({ min: 1, max: 20 }),
            type: this.faker.number.int({ min: 1, max: 2 }),
            title: this.faker.lorem.words(5)
        };
    }
}

export default PostFactory;