import mongoose from "mongoose";

const blogPostSchema = mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    editedBy: [
      {
        author: { type: mongoose.Types.ObjectId, ref: "User" },
        updated: { type: Date},
        _id: false
      },
    ],
  },
  { timestamps: true }
);

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export async function getAll() {
  return await BlogPost.find().populate("author", {
    fullname: true,
  }).populate("editedBy.author", {
    fullname: true
  });
}

export async function getById(id) {
    let post = await BlogPost.findById(id);
    if (!post) throw new Error(`Post with Id: ${id} not found!`, { cause: 404 });
    return post;
}

export async function insertNew(blogBody) {
  try {
    let post = await new BlogPost(blogBody);
    return await post.save();
  } catch (error) {
    // Pruefe, ob Conflict durch Dupletten-Verletzung
    if (error.hasOwnProperty("code") && error.code === 11000) {
      // Schmeisse entsprechendes Fehlerobjekt
      throw {
        code: 409,
        message: error.message,
      };
    } else {
      // Muss ein Validierungsproblem sein
      // Schmeisse entsprechendes Fehlerobjekt
      throw {
        code: 400,
        message: error.message,
      };
    }
  }
}

export async function updateById(postId, authorId, blogPostBody) {
    let post = await getById(postId)

    post.editedBy.push({author: authorId, updated: Date.now()});

    if (blogPostBody.title) {
        post.title = blogPostBody.title;
    }

    if (blogPostBody.text) {
        post.text = blogPostBody.text;
    }

    return await post.save();
}



export async function deleteById(postId, authorId, authorRole) {
    let post = await getById(postId);

    if (post.author.toString() === authorId || authorRole === "admin") {

        return await BlogPost.deleteOne({ _id: postId});
        
    } else throw new Error(`Role ${authorRole} is not authorized for the endpoint`, { cause: 401 });
}
