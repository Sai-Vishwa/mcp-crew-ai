import express from 'express';
import { Router } from 'express';
import {Request} from 'express';
import {Response} from 'express';
import { NextFunction } from 'express';
import { RequestHandler } from 'express';
import login from '../controllers/login/login.js';
import chatPage from '../controllers/chatPage/chatPage.js';
import createPlacement from '../controllers/placement/createPlacement.js';
import verify_user_session_and_create_new_chat from '../controllers/lang_graph/verify_user_session_and_create_new_chat.js';
import verify_user_session from '../controllers/lang_graph/verify_user_session.js';
import verify_user_session_and_load_memory from '../controllers/lang_graph/verify_user_session_and_load_memory.js';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

  router.post('/login', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await login(req,res);
  }));

  router.post('/chat-page', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await chatPage(req,res);
  }));

  router.post('/chat-history', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await login(req,res);
  }));


  router.post('/create-placement', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await createPlacement(req,res);
  }));

  router.post('/verify_user_session_and_create_new_chat', asyncHandler(async (req : Request, res : Response) => {
    await verify_user_session_and_create_new_chat(req , res);
  }));

  router.post('/verify_user_session', asyncHandler(async (req : Request, res : Response) => {
    await verify_user_session(req , res);
  }));

    router.post('/verify_user_session_and_load_memory', asyncHandler(async (req : Request, res : Response) => {
    await verify_user_session_and_load_memory(req , res);
  }));

export default router;