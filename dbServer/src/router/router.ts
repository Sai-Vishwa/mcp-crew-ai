import express from 'express';
import { Router } from 'express';
import {Request} from 'express';
import {Response} from 'express';
import { NextFunction } from 'express';
import { RequestHandler } from 'express';
import login from '../controllers/login/login.js';

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

  router.post('/bot-page', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await login(req,res);
  }));

  router.post('/chat-history', asyncHandler(async (req : Request, res : Response) => {
    console.log("im in router and this is the request i got -> ",req.body);
    await login(req,res);
  }));




export default router;