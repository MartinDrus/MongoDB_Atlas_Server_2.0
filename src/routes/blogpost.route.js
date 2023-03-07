import { Router } from "express";
import { getAllPosts, getPostById, insertNewPost, editPost, deletePost } from "../controller/blogpost.controller.js";
import verifyToken from "../service/jwt.verifyToken.js";
import authorizeAuthor from '../service/authorizeAuthor.js';


// Erstelle neue Router Instanz
const blogpostRouter = Router();

blogpostRouter.use(verifyToken)
blogpostRouter.use('/:id',verifyToken, authorizeAuthor)

// Routen Definition fuer root
blogpostRouter.route('/')
    .get(getAllPosts)
    .post(insertNewPost);

// Routen Definition fuer root
blogpostRouter.route('/:id')
    .get(getPostById)
    .patch(editPost)
    .delete(deletePost)
    


export default blogpostRouter