import {Request, Response, NextFunction} from "express";

export default function isAuthenticated(req:Request, res:Response, next:NextFunction) {
  if (!req.session.userId) return res.status(401).send("please log in");
  if (req.session.userId) {next()}
}