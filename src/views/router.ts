import express from "express";
import * as EmailValidator from 'email-validator';
import bcrypt from 'bcryptjs';

import isAuthenticated from "../auth/isauthenticated";

import sendEmail from "../utils/sendemail";
import randomNumber from "../utils/randomnumber";

import { userModel } from "../model/userModel";
import { tokenModel } from "../model/tokenSchema";

const router = express.Router();

router.get('/', (req, res) => res.status(200).send('hello world'));

router.post('/register', async (req,res)=>{
  try{
    const email:string = req.body.email.toLowerCase();
    const {password} = req.body;

    if (EmailValidator.validate(email)==false) return res.status(400).send("please correct email field"); //invalid email
    if (!email || !password) return res.status(400).send("invalid input"); //either email or password fields blank
    if(await userModel.findOne({email})) return res.status(409).send("email already taken"); //email already registered

    const encryptedPassword = await bcrypt.hash(password,10);

    const user = await userModel.create({
      email: email,
      password: encryptedPassword
    });

    const token = await tokenModel.create({
      userId: user._id,
      token: randomNumber()
    });

    sendEmail(email, user._id.toString(), token.token);

    console.log(user);
    return res.status(201).json(`successfully created user ${email}`);

  } catch (err) {
    console.log("FATAL register ERROR");
    console.error(err);
  }
});

router.post('/login', async (req,res)=>{
  try{
    const {email, password} = req.body;

    const user = await userModel.findOne({email});
    
    if (req.session.userId) res.status(400).send("user already logged in");
    if (!email || !password) res.status(400).send("invalid input");
    if (!user || await (bcrypt.compare(password,user.password)) == false){
      res.status(400).send("invalid login");
    }

    if (user && await (bcrypt.compare(password, user.password))){
      req.session.userId = email;
      res.status(200).json(req.session);
    }
  } catch(err){
    console.log("FATAL login ERROR");
    console.error(err);
  }
});

router.get('/logout', isAuthenticated, (req, res)=>{
  console.log('user logging out');
  req.session.destroy(err=>{
    if (err) console.error(err);  
  });
  res.status(200).send("successfully logged out");
});

router.get('/profile', isAuthenticated,(req, res)=>{
  console.log(`${req.session.userId} visited profile`)
  res.status(200).json(`this is the profile for ${req.session.userId}`);
});

router.get('/verifyemail/:id/:token', async (req, res)=>{
  try{
    const user = await userModel.findOne({_id: req.params.id});
    const token = await tokenModel.findOne({userId:user._id, token:req.params.token});

    if (!user || !token) {
      console.log("invalid link");
      return res.status(400).send("invalid link");
    }

    await user.updateOne({verified: true});
    await tokenModel.deleteOne(token._id).catch(err=>console.log(err));

    console.log("email verified successfully");
    return res.status(200).send("email verified successfully")

  } catch(err){
    console.error(err);
    return res.status(400).send("FATAL email verify ERROR");
  }
});

router.post('/passwordchange', isAuthenticated, async (req, res)=>{
  try{
    const {oldPassword, newPassword, newPasswordCopy} = req.body;

    const user = await userModel.findOne({email:req.session.userId});
    
    if (!oldPassword || !newPassword || !newPasswordCopy) return res.status(400).send("invalid input");
    if (await (bcrypt.compare(oldPassword,user.password))==false) return res.status(400).send("incorrect old password");
    if (newPassword!==newPasswordCopy) return res.status(400).send("new passwords do not match");
    if (oldPassword===newPassword) return res.status(400).send("new password is already existing password");

    const encryptedPassword = await bcrypt.hash(newPassword,10);
    await user.updateOne({password:encryptedPassword});

    //log user out after successful password change
    req.session.destroy(err=>{
      if (err) console.error(err);  
    });

    console.log(`${req.session.userId} changed their password`);
    return res.status(200).send("password changed successfully. please log in again");

  } catch(err){
    console.log("FATAL password change ERROR");
    console.error(err);
  }
});

export default router;