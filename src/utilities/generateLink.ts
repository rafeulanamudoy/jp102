import { IUser } from "../app/modules/user/user.interface";
import Stripe from "stripe";
import config from "../config";
import emailSender from "../helpers/sendEmail";
const stripe = new Stripe(config.stripe.secretKey as string);
export const generateNewAccountLink = async (account: any,payload:any) => {

  console.log(account,"check account from genereate new account link")
    const accountLink = await stripe.accountLinks.create({
      account: account.id as string,
      refresh_url: "https://your-platform.com/reauth",
      return_url: "https://www.luminor-ltd.com",
      type: "account_onboarding",
    });

  
    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #007bff; text-align: center;">Complete Your Onboarding</h2>
    
      <p>Dear <b></b>,</p>
    
      <p>We’re excited to have you onboard! To get started, please complete your onboarding process by clicking the link below:</p>
    
      <div style="text-align: center; margin: 20px 0;">
        <a href=${accountLink.url} style="background-color: #007bff; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Complete Onboarding
        </a>
      </div>
    
      <p>If the button above doesn’t work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
        ${accountLink.url}
      </p>
    
      <p><b>Note:</b> This link is valid for a limited time. Please complete your onboarding as soon as possible.</p>
    
      <p>Thank you,</p>
      <p><b>The Support Team</b></p>
    
      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777; text-align: center;">
        If you didn’t request this, please ignore this email or contact support.
      </p>
    </div>
    `;
    await emailSender("Your Onboarding Url", payload.email, html);
  };