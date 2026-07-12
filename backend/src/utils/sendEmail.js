import nodemailer from "nodemailer";

const sendEmail = async ({
    to,
    subject,
    text,
    html
}) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: Number(process.env.MAIL_PORT) === 465,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const emailInfo = await transporter.sendMail({
        from: {
            name: process.env.MAIL_FROM_NAME || "PantryPal",
            address:
                process.env.MAIL_FROM_EMAIL ||
                "hello@pantrypal.com"
        },
        to,
        subject,
        text,
        html
    });
    return emailInfo;
};

export default sendEmail