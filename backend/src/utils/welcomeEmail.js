const welcomeEmail = (name) => {
    const safeName = name || "there";

    return {
        subject: "Welcome to PantryPal! 🥫",

        text: `
Hi ${safeName},

Welcome to PantryPal!

You can now keep track of:
- Pantry items
- Expiry dates
- Low-stock products
- Shopping lists

Thanks for joining PantryPal.
        `.trim(),

        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background: #f4f7f5;
                font-family: Arial, sans-serif;
                color: #1f2933;
            ">
                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                ">
                    <div style="
                        background: #ffffff;
                        border-radius: 20px;
                        padding: 36px;
                        box-shadow: 0 12px 30px rgba(0,0,0,0.08);
                    ">
                        <h1 style="
                            margin: 0 0 24px;
                            color: #173b2f;
                        ">
                            🥫 PantryPal
                        </h1>

                        <h2 style="
                            margin-bottom: 12px;
                            color: #1f2933;
                        ">
                            Welcome, ${safeName}! 👋
                        </h2>

                        <p style="
                            color: #52616b;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Your PantryPal account has been created
                            successfully.
                        </p>

                        <p style="
                            color: #52616b;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            You can now track your pantry items,
                            expiry dates, low-stock products, and
                            shopping list in one place.
                        </p>

                        <div style="
                            margin: 28px 0;
                            padding: 20px;
                            background: #f0faf4;
                            border-radius: 14px;
                        ">
                            <p style="margin: 0 0 10px;">
                                ✅ Track food expiry dates
                            </p>

                            <p style="margin: 0 0 10px;">
                                ✅ Receive low-stock reminders
                            </p>

                            <p style="margin: 0;">
                                ✅ Organise your shopping list
                            </p>
                        </div>

                        <p style="
                            margin-top: 28px;
                            color: #52616b;
                        ">
                            Thanks for joining PantryPal!
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

export default welcomeEmail;