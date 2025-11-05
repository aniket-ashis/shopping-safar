import nodemailer from "nodemailer";

// SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send account credentials email to guest users
 */
export const sendAccountCredentialsEmail = async (email, password) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Email will not be sent.");
      return { success: false, message: "SMTP not configured" };
    }

    const transporter = createTransporter();
    const siteName = process.env.SITE_NAME || "Shopping Safari";

    const mailOptions = {
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to ${siteName} - Your Account Details`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb; }
            .credential-item { margin: 15px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .value { font-size: 18px; color: #1f2937; font-family: monospace; background-color: #f3f4f6; padding: 8px; border-radius: 4px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${siteName}!</h1>
            </div>
            <div class="content">
              <p>Thank you for your order! We've created an account for you so you can track your orders and manage your account.</p>
              
              <div class="credentials">
                <h2 style="margin-top: 0;">Your Account Credentials</h2>
                <div class="credential-item">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="credential-item">
                  <div class="label">Password:</div>
                  <div class="value">${password}</div>
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Please save this password securely. For security reasons, we recommend changing your password after your first login.
              </div>

              <p>You can now login to your account using these credentials to:</p>
              <ul>
                <li>Track your order status</li>
                <li>View your order history</li>
                <li>Manage your addresses</li>
                <li>Update your profile</li>
              </ul>

              <p style="margin-top: 30px;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/login" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Your Account
                </a>
              </p>

              <div class="footer">
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Account credentials email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending account credentials email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (email, order) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Email will not be sent.");
      return { success: false, message: "SMTP not configured" };
    }

    const transporter = createTransporter();
    const siteName = process.env.SITE_NAME || "Shopping Safari";

    // Format order items
    const orderItemsHtml = order.order_items
      ? order.order_items
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${item.product?.name || "Product"} ${
              item.variant_name ? `(${item.variant_name})` : ""
            }
                <br>
                <small style="color: #6b7280;">Quantity: ${
                  item.quantity
                }</small>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ₹${parseFloat(item.price || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          `
          )
          .join("")
      : "";

    const mailOptions = {
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmation - Order #${order.id
        .substring(0, 8)
        .toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: bold; color: #4b5563; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total-row { background-color: #f3f4f6; font-weight: bold; }
            .shipping-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your order</p>
            </div>
            <div class="content">
              <p>Dear ${order.shipping_name || "Customer"},</p>
              <p>We're happy to confirm that your order has been received and is being processed.</p>

              <div class="order-info">
                <h2 style="margin-top: 0;">Order Details</h2>
                <div class="info-row">
                  <span class="info-label">Order ID:</span>
                  <span>#${order.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Date:</span>
                  <span>${new Date(order.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span style="text-transform: capitalize;">${
                    order.status || "Pending"
                  }</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span>${order.payment_method || "Cash on Delivery"}</span>
                </div>
              </div>

              <div class="order-info">
                <h2 style="margin-top: 0;">Order Items</h2>
                <table class="items-table">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                    <tr class="total-row">
                      <td style="padding: 15px; text-align: right; font-size: 18px;">Total:</td>
                      <td style="padding: 15px; text-align: right; font-size: 18px;">₹${parseFloat(
                        order.total || 0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="shipping-info">
                <h2 style="margin-top: 0;">Shipping Address</h2>
                <p>
                  ${order.shipping_name || ""}<br>
                  ${order.shipping_address || ""}<br>
                  ${order.shipping_city || ""}, ${order.shipping_state || ""} ${
        order.shipping_zip || ""
      }<br>
                  ${
                    order.shipping_phone ? `Phone: ${order.shipping_phone}` : ""
                  }
                </p>
              </div>

              <p>We'll send you another email when your order ships. You can also track your order status by logging into your account.</p>

              <p style="margin-top: 30px;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/orders" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Order Details
                </a>
              </p>

              <div class="footer">
                <p>If you have any questions about your order, please contact our support team.</p>
                <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error: error.message };
  }
};
