import * as BlogPostModel from '../model/blogpost.model.js';

export async function getAllPosts(req, res){

    try {
        let allPosts = await BlogPostModel.getAll();

        res.send(allPosts);

    } catch (error) {
        res.status(500).send({error: error.message});

    }
}

export async function getPostById(req, res){
    let blogId = req.params.id;

    try {
        let post = await BlogPostModel.findById(blogId);


        res.send(post);

    } catch (error) {
        res.status(500).send({error: error.message});
        
    }


}

export async function insertNewPost(req, res){

    let blogPostBody = req.body;
    let authorId = req.tokenPayload.userId;
    blogPostBody.author = authorId;

    try {

        let post = await BlogPostModel.insertNew(blogPostBody);

        res.status(201).send(post);
        
    } catch (error) {
        res.status(400).send(error.message)
    }
}

export async function editPost(req, res){

    let postId = req.params.id;
    let blogPostBody = req.body;
    let authorId = req.tokenPayload.userId;

    try {

        if (blogPostBody.title || blogPostBody.text) {

            let post = await BlogPostModel.updateById(postId, authorId, blogPostBody);
            res.status(200).send(post);

        } else res.status(400).send("Only text and title can be modified")


        
    } catch (error) {
        res.status(400).send(error.message)
    }

}

export async function deletePost(req, res){

    let postId = req.params.id;
    let authorId = req.tokenPayload.userId;
    let authorRole = req.tokenPayload.role;

    try {

        let response = await BlogPostModel.deleteById(postId, authorId, authorRole);
        res.status(200).send(response);
        
    } catch (error) {
        res.status(400).send(error.message)
    }
    

}