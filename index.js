import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error('FATAL ERROR: RESEND_API_KEY is not defined in your .env file.');
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL) {
  console.error('FATAL ERROR: ADMIN_EMAIL is not defined in your .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

app.use(cors());
app.use(express.json());

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📧 Received contact form submission:', {
      timestamp: new Date().toISOString(),
      body: req.body,
    });

    const { name, email, phone, description, formType, planName, businessName, location, city, country } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !description) {
      console.error('❌ Missing required fields:', { name: !!name, email: !!email, phone: !!phone, description: !!description });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Name, email, phone, and description are required' 
      });
    }

    // Email to client
    const clientEmailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: 'Thank You for Contacting Tallix Financials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Tallix Financials</h1>
              <p style="color: #64748b; margin: 5px 0 0 0;">Empowering Your Financial Success</p>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 20px;">Thank You, ${name}!</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              We appreciate you reaching out to Tallix Financials. Your inquiry is important to us, and we're excited about the opportunity to help transform your financial management.
            </p>
            
            ${planName ? `
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #2563eb; margin: 0 0 10px 0;">Selected Plan: ${planName}</h3>
                <p style="color: #475569; margin: 0;">We'll prepare a customized proposal based on your selected plan and business requirements.</p>
              </div>
            ` : ''}
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">What Happens Next?</h3>
              <ul style="color: #475569; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our team will review your requirements within 24 hours</li>
                <li style="margin-bottom: 8px;">We'll schedule a free 30-minute consultation call</li>
                <li style="margin-bottom: 8px;">You'll receive a customized proposal tailored to your needs</li>
                <li>We'll answer any questions and help you get started</li>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
              In the meantime, feel free to explore our website to learn more about how we help businesses like yours achieve financial clarity and growth.
            </p>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="mailto:Sample@gmail.com" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Contact Us Directly
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                <strong>Tallix Financials</strong><br>
                Email: Sample@gmail.com | Phone: +1 713 234 6762<br>
                Serving clients across the cosmos (digitally!)
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Email to admin
    const adminEmailOptions = {
      from: FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New ${formType === 'pricing' ? 'Pricing Plan' : 'Contact'} Inquiry - Tallix Financials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #dc2626; margin-bottom: 20px;">🚨 New Client Inquiry</h2>
            
            ${planName ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 5px 0;">Selected Plan: ${planName}</h3>
              </div>
            ` : ''}
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">Client Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 30%;">Name:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Email:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Phone:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${phone}</td>
                </tr>
                ${businessName ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Business:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${businessName}</td>
                </tr>
                ` : ''}
                ${location ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Location:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${location}</td>
                </tr>
                ` : ''}
                ${city ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">City:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${city}</td>
                </tr>
                ` : ''}
                ${country ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #475569;">Country:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${country}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0c4a6e; margin: 0 0 10px 0;">Business Description</h3>
              <p style="color: #0f172a; margin: 0; line-height: 1.6;">${description}</p>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                Inquiry received on ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Send emails separately to handle individual failures
    let adminEmailSent = false;
    let clientEmailSent = false;
    let clientEmailError = null;

    try {
      const adminResult = await resend.emails.send(adminEmailOptions);
      adminEmailSent = true;
      console.log('✅ Admin email sent successfully:', adminResult);
    } catch (adminError) {
      console.error('❌ Failed to send admin email:', adminError);
      throw adminError; // Re-throw admin errors as they're critical
    }

    // Try to send client confirmation email
    try {
      const clientResult = await resend.emails.send(clientEmailOptions);
      clientEmailSent = true;
      console.log('✅ Client confirmation email sent successfully:', clientResult);
    } catch (clientError) {
      clientEmailError = clientError;
      console.error('❌ Failed to send client confirmation email:', clientError);
      console.error('📧 Client email error details:', {
        message: clientError?.message,
        name: clientError?.name,
        statusCode: clientError?.statusCode,
        response: clientError?.response,
      });
      
      // Common issue: Resend requires verified domain to send to external recipients
      if (clientError?.message?.includes('domain') || clientError?.message?.includes('verify')) {
        console.error('⚠️  NOTE: To send emails to clients, you need to verify a domain with Resend.');
        console.error('⚠️  Currently using onboarding@resend.dev which only works for testing.');
        console.error('⚠️  Visit https://resend.com/domains to verify your domain.');
      }
    }

    // Return success even if client email fails (admin email is more critical)
    if (adminEmailSent) {
      const responseMessage = clientEmailSent 
        ? 'Emails sent successfully' 
        : 'Admin email sent. Client confirmation email failed (may require domain verification).';
      
      console.log('📊 Email status:', { 
        admin: adminEmailSent ? '✅ Sent' : '❌ Failed',
        client: clientEmailSent ? '✅ Sent' : '❌ Failed',
        clientError: clientEmailError?.message || null
      });

      res.status(200).json({ 
        message: responseMessage,
        adminEmailSent,
        clientEmailSent,
        clientEmailError: clientEmailError?.message || null
      });
    }
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    // Send a more detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Failed to send emails', details: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`Please either:`);
    console.error(`  1. Kill the process using port ${PORT}: netstat -ano | findstr :${PORT}`);
    console.error(`  2. Use a different port by setting PORT environment variable`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});