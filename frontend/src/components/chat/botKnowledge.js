/**
 * FarmLink AI Support Bot — Knowledge Base (Multilingual)
 * Pattern-matched Q&A engine with contextual responses and quick reply chips.
 */

// ─── Utility ───────────────────────────────────────────────────────────────
export const normalize = (text) =>
    text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();

const matches = (input, patterns) =>
    patterns.some((p) => normalize(input).includes(normalize(p)));

// ─── Bot Persona ────────────────────────────────────────────────────────────
export const BOT_NAME = {
    en: 'FarmLink Assistant',
    hi: 'FarmLink सहायक',
    mr: 'FarmLink सहाय्यक'
};
export const BOT_AVATAR = '🌾';

// ─── Knowledge Base ─────────────────────────────────────────────────────────
export const getKB = (lang = 'en') => {
    const data = {
        en: [
            {
                id: 'greet',
                patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy', 'namaste', 'hola', 'greetings', 'sup', 'what\'s up'],
                response: () => `👋 Hello! I'm **FarmLink Assistant**, your personal guide to the platform.\n\nI can help you with:\n• 🛒 Shopping & placing orders\n• 🌾 Selling products as a farmer\n• 👤 Account & profile management\n• 💳 Payments & tracking\n• 🧭 Navigating the app\n\nWhat would you like to know?`,
                quickReplies: ['How do I place an order?', 'How do I list a product?', 'What is FarmLink?', 'How do I reset my password?'],
            },
            {
                id: 'about',
                patterns: ['what is farmlink', 'about farmlink', 'tell me about', 'what does farmlink do', 'farmlink mission', 'purpose of farmlink', 'who made farmlink', 'what is this app', 'what is this platform'],
                response: () => `🌱 **About FarmLink**\n\nFarmLink is a farm-to-table marketplace that **directly connects local farmers with consumers** — cutting out middlemen and ensuring:\n\n✅ **Farmers** get fair prices for their produce\n✅ **Customers** get fresh, chemical-free food\n✅ **Lower food miles** & a smaller carbon footprint\n\nIt's built as a B.Tech Final Year project with real-time chat, payment integration (Razorpay), AI crop scanning, and multi-language support (English, Hindi, Marathi).`,
                quickReplies: ['How do I register?', 'Browse products', 'Find farmers near me', 'How do payments work?'],
            },
            {
                id: 'register',
                patterns: ['register', 'sign up', 'create account', 'new account', 'join farmlink', 'how to register', 'how to create', 'become a member', 'signup'],
                response: () => `📝 **How to Create an Account**\n\n1. Click **Login / Register** in the top navigation bar\n2. Switch to the **"Register"** tab\n3. Enter your **Full Name**, **Email**, and **Password**\n4. Choose your role:\n   - 🌾 **Farmer** — to list and sell products\n   - 🛒 **Customer** — to browse and buy\n5. Click **"Create Account"**\n\nYou can also **sign in with Google** for instant access! ✨`,
                quickReplies: ['How do I login?', 'Forgot my password', 'What is the farmer role?', 'What is the customer role?'],
            },
            {
                id: 'login',
                patterns: ['login', 'log in', 'sign in', 'how to login', 'can\'t login', 'unable to login', 'not logging in', 'signin'],
                response: () => `🔐 **How to Login**\n\n1. Click **Login** in the top navigation bar\n2. Enter your registered **Email** and **Password**\n3. Click **"Login"**\n\n**Other options:**\n• 🌐 **Google Sign-In** — click "Continue with Google"\n• 🔑 **Forgot Password?** — click the link below the login form to get a reset email\n\n> If you're seeing an error, make sure your email is correct and your account is verified.`,
                quickReplies: ['Forgot my password', 'How do I register?', 'Google sign-in', 'Account issues'],
            },
            {
                id: 'forgot_password',
                patterns: ['forgot password', 'reset password', 'password reset', 'lost password', 'can\'t remember password', 'change password', 'forgot my password'],
                response: () => `🔑 **Reset Your Password**\n\n1. Go to the **Login** page\n2. Click **"Forgot Password?"** below the login form\n3. Enter your registered **email address**\n4. Click **"Send Reset Link"**\n5. Check your inbox for the reset email and follow the link\n\n**To change your password while logged in:**\n1. Go to **My Profile** (top-right menu)\n2. Click **"Change Password"**\n3. Enter your current password and set a new one`,
                quickReplies: ['How do I login?', 'Update my profile', 'Account security'],
            },
            {
                id: 'browse_products',
                patterns: ['browse products', 'find products', 'search products', 'view products', 'see products', 'marketplace', 'shop', 'buy products', 'find produce', 'search produce', 'look for products'],
                response: () => `🛒 **Browsing the Marketplace**\n\n1. Click **Marketplace** in the top navigation\n2. Use the **search bar** to find specific items (e.g., "tomatoes", "rice")\n3. Filter by **category** (Vegetables, Fruits, Grains, Dairy)\n4. Filter by **region/location**\n5. Sort by price (low to high or high to low)\n\nClick any product card to see:\n• Full description & images\n• Farmer details\n• Stock availability\n• Customer reviews\n• Option to **Add to Cart** or **Add to Wishlist** ❤️`,
                quickReplies: ['How do I add to cart?', 'How do I place an order?', 'Find farmers', 'What categories are available?'],
            },
            {
                id: 'cart',
                patterns: ['cart', 'add to cart', 'my cart', 'shopping cart', 'view cart', 'remove from cart', 'update cart', 'cart empty', 'cart items'],
                response: () => `🛒 **Managing Your Cart**\n\n**Adding items:**\n• Click **"Add to Cart"** on any product card or product detail page\n\n**Viewing your cart:**\n• Click the 🛒 **cart icon** in the top navigation bar\n\n**In your cart you can:**\n• Adjust quantities with **+/-** buttons\n• Remove items using the **trash icon**\n• See the **total price**\n• Proceed to **Checkout**\n\n> Your cart is saved locally even if you refresh the page!`,
                quickReplies: ['How do I checkout?', 'Payment options', 'Track my order', 'My wishlist'],
            },
            {
                id: 'wishlist',
                patterns: ['wishlist', 'wish list', 'save product', 'save for later', 'favorite', 'bookmark', 'heart icon', 'saved items'],
                response: () => `❤️ **Using Your Wishlist**\n\n**Add to Wishlist:**\n• Click the **❤️ heart icon** on any product card\n\n**View your Wishlist:**\n• Go to **My Profile** → **Wishlist** tab\n• Or visit your **Dashboard**\n\n**Features:**\n• Wishlisted items are **synced to your account** (you won't lose them if you log out)\n• You'll get **price drop alerts** 🔔 if a wishlisted item goes on sale\n• Easily move items from wishlist → cart when ready to buy\n\n> You must be **logged in** to use the wishlist.`,
                quickReplies: ['How do I add to cart?', 'My profile', 'Price alerts', 'Browse products'],
            },
            {
                id: 'place_order',
                patterns: ['place order', 'how do i place an order', 'how to order', 'buy', 'purchase', 'checkout', 'how to buy', 'order food', 'make a purchase', 'how to checkout'],
                response: () => `✅ **Placing an Order on FarmLink**\n\n**Step 1:** Browse the **Marketplace** and add items to your cart 🛒\n\n**Step 2:** Click the cart icon → review your items → click **"Checkout"**\n\n**Step 3:** Enter your **delivery address**\n\n**Step 4:** Choose a payment method:\n   • 💳 **Razorpay** (UPI, cards, net banking)\n   • 💵 **Cash on Delivery (COD)**\n\n**Step 5:** Confirm your order → Done! 🎉\n\nYou can track your order under **My Activity** or your **Dashboard**.`,
                quickReplies: ['Track my order', 'Payment options', 'Cancel an order', 'Order history'],
            },
            {
                id: 'payment',
                patterns: ['payment', 'pay', 'razorpay', 'upi', 'cod', 'cash on delivery', 'net banking', 'debit card', 'credit card', 'how to pay', 'payment options', 'payment failed', 'payment issue'],
                response: () => `💳 **Payment Options on FarmLink**\n\n**1. Razorpay (Online Payment):**\n• UPI (Google Pay, PhonePe, Paytm, etc.)\n• Debit / Credit cards\n• Net Banking\n• Wallet payments\n\n**2. Cash on Delivery (COD):**\n• Pay when your order arrives at your door\n\n**Payment security:**\n• All online transactions go through **Razorpay's secure gateway**\n• FarmLink never stores your card details\n\n> If your payment failed, check your internet connection and try again. The amount will be refunded within 5-7 business days if deducted.`,
                quickReplies: ['Place an order', 'Track my order', 'Refund policy', 'Contact support'],
            },
            {
                id: 'track_order',
                patterns: ['track order', 'track my order', 'order status', 'where is my order', 'my order', 'order history', 'order tracking', 'delivery status', 'order placed', 'order processing', 'shipped', 'delivered', 'order not received'],
                response: () => `📦 **Tracking Your Order**\n\n1. Go to **My Activity** (top navigation, logged in as customer)\n   — or — go to your **Dashboard** → **My Orders** tab\n2. Find your order in the list\n3. Each order shows a **status timeline:**\n   - 🟡 **Placed** — order received\n   - 🔵 **Processing** — farmer is preparing your order\n   - 🚚 **Shipped** — your order is on the way\n   - ✅ **Delivered** — order arrived!\n\n> You'll receive **notifications** at each stage. Check the 🔔 bell icon.`,
                quickReplies: ['Cancel an order', 'Leave a review', 'Payment issues', 'Contact farmer'],
            },
            {
                id: 'cancel_order',
                patterns: ['cancel order', 'cancel my order', 'refund', 'return order', 'how to cancel', 'i want to cancel', 'order cancellation'],
                response: () => `❌ **Cancelling or Returning an Order**\n\n**To cancel an order:**\n1. Go to **My Activity** → **My Orders**\n2. Find the order you want to cancel\n3. Click **"Cancel"** (only available for orders in **Placed** or **Processing** status)\n\n**Refund policy:**\n• Online payments (Razorpay): refunded within **5-7 business days**\n• COD orders: no payment to refund\n\n> Orders that are already **Shipped** cannot be cancelled. Please contact the farmer directly via the in-app chat.`,
                quickReplies: ['Track my order', 'Contact farmer', 'Payment issues', 'Leave a review'],
            },
            {
                id: 'notifications',
                patterns: ['notification', 'alerts', 'bell icon', 'push notification', 'no notifications', 'notification not working', 'enable notifications'],
                response: () => `🔔 **Notifications on FarmLink**\n\nFarmLink sends you notifications for:\n• New messages from farmers/customers 💬\n• Order status updates 📦\n• Wishlist price drop alerts ❤️\n• Verification status updates ✅\n\n**How to check:**\n• Click the **🔔 bell icon** in the navigation bar\n\n**Enable push notifications:**\n• When prompted, click **"Allow"** in your browser\n• This lets you receive alerts even when the app is in the background\n\n> Notifications are also sent by email for important updates.`,
                quickReplies: ['Track my order', 'My messages', 'Wishlist alerts', 'Account settings'],
            },
            {
                id: 'find_farmers',
                patterns: ['find farmer', 'local farmers', 'farmers near me', 'list of farmers', 'browse farmers', 'farmer list', 'see farmers', 'nearby farmers', 'view farmers'],
                response: () => `🌾 **Finding Farmers on FarmLink**\n\n1. Click **"Farmers"** in the top navigation bar\n2. Browse all verified farmers on the platform\n3. Use the **search bar** to find farmers by name\n4. Click a farmer's card to see:\n   • Their profile & specialization\n   • Rating & reviews\n   • All their available products\n   • Contact options\n\n**Verified farmers** have a ✅ **blue verified badge** — their identity and farm documents have been checked.\n\nYou can also **chat directly** with a farmer from their product page!`,
                quickReplies: ['Browse products', 'Chat with a farmer', 'What is verified farmer?', 'Place an order'],
            },
            {
                id: 'farmer_verification',
                patterns: ['verified farmer', 'verification', 'get verified', 'how to get verified', 'farmer badge', 'verification process', 'upload documents', 'verify account', 'verification pending'],
                response: () => `✅ **Farmer Verification on FarmLink**\n\nVerification builds trust with customers. Here's how to get verified:\n\n1. Go to your **Farmer Dashboard**\n2. Click **"Get Verified"** in your profile section\n3. Upload the required documents:\n   • 🪪 **Aadhar Card**\n   • 📄 **PAN Card**\n   • 🏦 **Bank Passbook**\n4. Submit — our admin team will review within **2-3 business days**\n\n**Benefits of verification:**\n• ✅ Blue verified badge on your profile\n• 🔝 Higher ranking in search results\n• 💬 Greater trust from customers`,
                quickReplies: ['How to list a product?', 'My dashboard', 'Upload documents', 'Check verification status'],
            },
            {
                id: 'list_product',
                patterns: ['list product', 'how do i list a product', 'add product', 'sell product', 'add listing', 'create listing', 'how to sell', 'upload product', 'post product', 'list produce', 'how to list', 'new product', 'list item'],
                response: () => `🌱 **How to List a Product (Farmers Only)**\n\n1. Login and go to your **Farmer Dashboard**\n2. Click **"Add Product"** or **"List New Product"**\n3. Fill in the details:\n   • 📦 **Product Name**\n   • 💰 **Price (₹/kg)**\n   • 📊 **Stock (kg)**\n   • 🏷️ **Category** (Vegetables, Fruits, Grains, Dairy)\n   • 📍 **Location Tag**\n   • 🖊️ **Description** (quality, harvest date, etc.)\n4. Upload a **product photo** 📸\n5. Use **"AI Price Suggest"** 🤖 for a market-based price recommendation!\n6. Click **"Save"** — your product is now live!\n\n> You can also use the **Crop Disease Scanner** 🌿 to check your crops for issues.`,
                quickReplies: ['Edit or delete a product?', 'AI price suggestion', 'Crop scanner', 'View my listings'],
            },
            {
                id: 'edit_product',
                patterns: ['edit product', 'delete product', 'update product', 'remove product', 'change product', 'update listing', 'remove listing', 'how to edit', 'manage products'],
                response: () => `✏️ **Editing or Deleting a Product**\n\n1. Go to your **Farmer Dashboard**\n2. Find the product in **"My Stock"** or **"Listed Products"**\n3. Click the **✏️ Edit** button to update:\n   • Price, stock, description, images\n4. Click **💾 Save Changes** to update\n\n**To delete a product:**\n• Click the **🗑️ Delete** button on the product card\n• Confirm deletion in the dialog box\n\n> ⚠️ Deleting a product is **permanent and cannot be undone**. Make sure you want to remove it!`,
                quickReplies: ['Add a new product', 'View my listings', 'Update stock', 'Farmer dashboard'],
            },
            {
                id: 'ai_price',
                patterns: ['ai price', 'price suggestion', 'suggest price', 'ai suggest', 'automatic price', 'market price', 'fair price', 'price recommendation'],
                response: () => `🤖 **AI Price Suggestion Feature**\n\nWhen listing a product, FarmLink offers an **AI-powered price recommendation** based on current market rates.\n\n**How to use it:**\n1. Start filling in your product listing form\n2. Click the **"Auto-suggest Price (AI)"** button\n3. The AI scans crop data and suggests a fair market price\n4. Accept the suggestion or adjust it manually\n\nThis helps farmers price their produce **competitively and fairly** without needing market research!`,
                quickReplies: ['How to list a product?', 'Crop disease scanner', 'My dashboard', 'Pricing strategies'],
            },
            {
                id: 'crop_scanner',
                patterns: ['crop scanner', 'crop disease', 'disease scanner', 'plant disease', 'crop health', 'scan crop', 'ai scanner', 'crop problem', 'plant problem', 'diseased crop'],
                response: () => `🌿 **Crop Disease Scanner**\n\nFarmLink includes an **AI-powered crop disease scanner** to help farmers identify plant diseases early.\n\n**How to use it:**\n1. Go to your **Farmer Dashboard**\n2. Find the **"Crop Disease Scanner"** section\n3. Upload a **photo of your crop leaf or plant**\n4. The AI will analyze it and identify potential diseases\n5. Get actionable recommendations for treatment\n\n**Benefits:**\n• Early disease detection 🔍\n• Reduce crop loss\n• Get treatment suggestions instantly`,
                quickReplies: ['Add a product', 'AI price suggestion', 'My dashboard', 'Farmer verification'],
            },
            {
                id: 'profile',
                patterns: ['profile', 'my profile', 'edit profile', 'update profile', 'personal details', 'account settings', 'change name', 'change email', 'change phone', 'profile picture', 'account info'],
                response: () => `👤 **Managing Your Profile**\n\n1. Click your **profile icon** or name in the top navigation\n2. Select **"My Profile"** from the dropdown\n\n**What you can update:**\n• 📛 Full Name\n• 📧 Email address\n• 📱 Phone number\n• 📍 Address\n• 🖼️ Profile Picture\n• 🌾 *Farmers:* Bio, specialization, farm details\n\n3. Click **"Edit Profile"**, make changes, and click **"Save Changes"**\n\n**Also in Profile:**\n• Change Password\n• View your Wishlist\n• View your Orders`,
                quickReplies: ['Change password', 'My wishlist', 'My orders', 'Account security'],
            },
            {
                id: 'dashboard',
                patterns: ['dashboard', 'my dashboard', 'farmer dashboard', 'customer dashboard', 'admin dashboard', 'go to dashboard', 'how to access dashboard'],
                response: () => `📊 **Your Dashboard**\n\nYour dashboard depends on your role:\n\n🌾 **Farmer Dashboard:**\n• Add/edit/delete products\n• View orders received\n• Revenue stats & analytics\n• Crop disease scanner\n• AI price suggestion\n• Verification status\n\n🛒 **Customer Dashboard:**\n• View order history\n• Track active orders\n• Manage wishlist\n\n👑 **Admin Dashboard:**\n• Manage all users & farmers\n• Review verification documents\n• Monitor platform stats\n• Remove inappropriate products\n\n**Access:** Click **"Dashboard"** in the top navigation bar.`,
                quickReplies: ['How to list a product?', 'Track my order', 'Profile settings', 'Verification'],
            },
            {
                id: 'chat',
                patterns: ['chat', 'message farmer', 'contact farmer', 'message customer', 'how to chat', 'send message', 'talk to farmer', 'communicate', 'inbox'],
                response: () => `💬 **Chatting on FarmLink**\n\nYou can directly message farmers or customers!\n\n**How to start a chat:**\n• Visit a **farmer's profile** or **product page**\n• Click **"Contact Farmer"** or the chat icon 💬\n• A chat window opens in the **bottom-right corner**\n\n**Features:**\n• Real-time messaging via Socket.IO ⚡\n• You'll get a push notification 🔔 if you receive a message while offline\n• Hover over your own messages to **delete** them\n• Message history is saved\n\n> You must be **logged in** to send messages.`,
                quickReplies: ['Find farmers', 'Notifications', 'My profile', 'Place an order'],
            },
            {
                id: 'language',
                patterns: ['language', 'change language', 'hindi', 'marathi', 'english', 'language settings', 'switch language', 'translate', 'other languages'],
                response: () => `🌐 **Multi-Language Support**\n\nFarmLink supports **3 languages:**\n• 🇬🇧 **English**\n• 🇮🇳 **Hindi (हिन्दी)**\n• 🟠 **Marathi (मराठी)**\n\n**How to switch language:**\n1. Look for the **language selector** in the navigation bar (🌐 icon or "EN/HI/MR")\n2. Click to toggle between languages\n\nThe entire UI — menus, buttons, and labels — will switch instantly! 🎉`,
                quickReplies: ['Back to navigation help', 'My profile', 'What is FarmLink?'],
            },
            {
                id: 'dark_mode',
                patterns: ['dark mode', 'light mode', 'theme', 'dark theme', 'switch theme', 'night mode', 'appearance'],
                response: () => `🌙 **Dark Mode / Light Mode**\n\nFarmLink supports both dark and light themes!\n\n**How to toggle:**\n• Click the **🌙 moon** (or ☀️ sun) icon in the **top navigation bar**\n• The app will instantly switch between dark and light mode\n\nYour preference is **saved automatically** so it persists across page refreshes.`,
                quickReplies: ['Navigation help', 'Language settings', 'What is FarmLink?'],
            },
            {
                id: 'admin',
                patterns: ['admin', 'administrator', 'admin panel', 'admin dashboard', 'manage users', 'manage farmers', 'platform admin', 'admin role', 'approve farmer'],
                response: () => `👑 **Admin Role on FarmLink**\n\nAdmins manage the entire platform:\n\n**Admin capabilities:**\n• 👥 View & manage all users (customers, farmers)\n• 🌾 Review & approve/reject farmer verifications\n• 📦 Remove inappropriate products\n• 📊 Monitor platform statistics\n• 🔧 System health monitoring\n\n**Admin Dashboard access:**\n• Login with an admin account\n• Click **"Dashboard"** in the navigation\n\n> Admin accounts are created separately — regular users cannot self-assign admin role.`,
                quickReplies: ['Farmer verification', 'Platform stats', 'Manage users', 'Remove products'],
            },
            {
                id: 'transparency',
                patterns: ['transparency', 'transparency report', 'impact report', 'platform report', 'co2', 'carbon footprint', 'sustainability', 'environmental impact'],
                response: () => `📊 **Transparency Report**\n\nFarmLink publishes an **open Transparency Report** showing the platform's real-world impact:\n\n• 🌾 **Farmers onboarded** and their products\n• 🛒 **Total orders** completed\n• 🌍 **CO2 saved** by reducing food miles\n• 📈 **Revenue** generated for farmers\n• 💚 **Sustainability** metrics\n\n**How to view it:**\n• Scroll to the footer → click **"Transparency Report"**\n• Or look for it in the site navigation\n\nThis report updates automatically based on real platform data!`,
                quickReplies: ['What is FarmLink?', 'Find farmers', 'Browse products'],
            },
            {
                id: 'review',
                patterns: ['review', 'rating', 'leave review', 'write review', 'rate product', 'feedback', 'product review', 'farmer review', 'how to review'],
                response: () => `⭐ **Leaving a Review**\n\nHelp other customers by sharing your experience!\n\n**How to leave a review:**\n1. After receiving your order, go to **My Orders**\n2. Find the delivered order\n3. Click **"Leave Review"** ⭐\n4. Rate the product (1–5 stars)\n5. Write your feedback\n6. Click **"Submit Review"**\n\nYour review will appear on the **product page** for all users to see.\n\n> Reviews help farmers improve and help customers make informed choices! 🙏`,
                quickReplies: ['Track my order', 'My order history', 'Find products', 'Contact farmer'],
            },
            {
                id: 'logout',
                patterns: ['logout', 'log out', 'sign out', 'how to logout', 'exit account', 'end session'],
                response: () => `🚪 **How to Logout**\n\n1. Click your **profile picture** or **name** in the top navigation bar\n2. Select **"Logout"** from the dropdown menu\n3. You'll be redirected to the home page\n\n> Your cart items are saved locally. Your wishlist is saved to your account and will be there when you log back in! 💾`,
                quickReplies: ['How to login?', 'My profile', 'Account security'],
            },
            {
                id: 'technical_issues',
                patterns: ['not working', 'error', 'bug', 'issue', 'problem', 'glitch', 'loading', 'slow', 'broken', 'crash', 'stuck', 'page not loading', 'blank screen', 'technical issue', 'technical problem'],
                response: () => `🔧 **Troubleshooting Technical Issues**\n\n**Try these steps first:**\n1. 🔄 **Refresh the page** (F5 or Ctrl+R)\n2. 🌐 Check your **internet connection**\n3. 🧹 **Clear browser cache** (Ctrl+Shift+Delete)\n4. 🔒 Try a **different browser** (Chrome is recommended)\n5. 📱 If on mobile, try **clearing app cache**\n\n**Common fixes:**\n• Login issues → try **Forgot Password**\n• Payment failed → check bank app / try again in 5 mins\n• Products not loading → check internet & refresh\n\n> If the issue persists, contact the FarmLink team via the email in the footer 📧`,
                quickReplies: ['Login issues', 'Payment failed', 'Order not updating', 'Contact support'],
            },
            {
                id: 'contact',
                patterns: ['contact', 'support', 'help', 'contact support', 'reach out', 'email', 'customer service', 'customer support', 'get help'],
                response: () => `📬 **Contact & Support**\n\nNeed more help?\n\n• 📧 **Email us:** Check the **footer** of the website for the contact email\n• 💬 **Chat feature:** Use the in-app chat to message farmers directly\n• 📋 **Legal:** Visit **Privacy Policy** or **Terms of Service** in the footer\n\n**Self-service options:**\n• 🤖 Keep chatting with me for instant answers!\n• 📊 Check the Transparency Report for platform info\n• 🔔 Enable notifications to stay updated\n\n> We typically respond to emails within **24–48 hours** on business days.`,
                quickReplies: ['Technical issues', 'Refund policy', 'About FarmLink', 'Privacy policy'],
            },
            {
                id: 'legal',
                patterns: ['privacy', 'privacy policy', 'terms', 'terms of service', 'legal', 'data', 'gdpr', 'personal data', 'data privacy'],
                response: () => `⚖️ **Privacy & Terms**\n\nFarmLink takes your privacy seriously!\n\n**View our policies:**\n• Scroll to the **footer** of any page\n• Click **"Privacy Policy"** or **"Terms of Service"**\n\n**Key points:**\n• Your personal data is encrypted and never sold\n• Card details are handled by **Razorpay** (PCI-compliant)\n• You can request account deletion at any time\n• Cookies are used only for session management\n\n> For any data-related concerns, email us at the address in the footer.`,
                quickReplies: ['Contact support', 'Account security', 'About FarmLink'],
            },
            {
                id: 'farmer_guide',
                patterns: ['farmer guide', 'how to be a farmer', 'farmer tips', 'farmer help', 'getting started as farmer', 'new farmer', 'farmer features', 'what can farmers do'],
                response: () => `🌾 **Getting Started as a Farmer**\n\nHere's everything you can do as a FarmLink farmer:\n\n1. **Register** as a Farmer 📝\n2. **Complete your profile** with bio & specialization 👤\n3. **Get Verified** ✅ (upload documents for the trust badge)\n4. **List your products** 🥕 with photos, price & stock\n5. **Use AI Price Suggest** for fair pricing 🤖\n6. **Receive orders** and update their status 📦\n7. **Chat directly** with customers 💬\n8. **Monitor earnings** in your dashboard 📊\n9. **Scan crops** for disease detection 🌿\n\nNeed help with any specific step?`,
                quickReplies: ['List a product', 'Get verified', 'AI price suggestion', 'Manage orders'],
            },
            {
                id: 'customer_guide',
                patterns: ['customer guide', 'how to shop', 'customer tips', 'shopping guide', 'how to use farmlink', 'getting started', 'new customer', 'customer features'],
                response: () => `🛒 **Getting Started as a Customer**\n\nHere's your complete guide to shopping on FarmLink:\n\n1. **Register** as a Customer 📝\n2. **Browse the Marketplace** 🥦 for fresh produce\n3. **Filter** by category, location & price\n4. **Add to Cart** 🛒 or **Wishlist** ❤️\n5. **Checkout** with your preferred payment method 💳\n6. **Track your order** in My Activity 📦\n7. **Chat** with farmers for questions 💬\n8. **Leave reviews** after delivery ⭐\n9. **Get notifications** for order updates & deals 🔔\n\nHappy shopping! 🌱`,
                quickReplies: ['Browse products', 'Place an order', 'Payment options', 'Find local farmers'],
            },
        ],
        hi: [
            {
                id: 'greet',
                patterns: ['नमस्ते', 'हेलो', 'हाय', 'प्रणाम', 'नमस्कार', 'सुप्रभात', 'शुभ संध्या', 'कैसे हो', 'क्या हाल है', 'hello', 'hi'],
                response: () => `👋 नमस्ते! मैं **FarmLink सहायक** हूँ, आपका व्यक्तिगत मार्गदर्शक।\n\nमैं आपकी मदद कर सकता हूँ:\n• 🛒 खरीदारी और ऑर्डर देने में\n• 🌾 किसान के रूप में उत्पाद बेचने में\n• 👤 खाता और प्रोफ़ाइल प्रबंधन में\n• 💳 भुगतान और ट्रैकिंग में\n• 🧭 ऐप नेविगेशन में\n\nआप क्या जानना चाहेंगे?`,
                quickReplies: ['ऑर्डर कैसे दें?', 'उत्पाद कैसे जोड़ें?', 'FarmLink क्या है?', 'पासवर्ड कैसे रीसेट करें?'],
            },
            {
                id: 'about',
                patterns: ['farmlink क्या है', 'farmlink के बारे में', 'मुझे बताएं', 'farmlink क्या करता है', 'मिशन', 'उद्देश्य', 'किसने बनाया', 'यह ऐप क्या है', 'यह प्लेटफॉर्म क्या है'],
                response: () => `🌱 **FarmLink के बारे में**\n\nFarmLink एक 'फार्म-टू-टेबल' मार्केटप्लेस है जो **सीधे स्थानीय किसानों को उपभोक्ताओं से जोड़ता है** — बिचौलियों को हटाकर यह सुनिश्चित करता है:\n\n✅ **किसानों** को उनकी उपज का सही दाम मिले\n✅ **ग्राहकों** को ताजा, रसायन-मुक्त भोजन मिले\n✅ **फूड माइल्स** कम हों और पर्यावरण को लाभ हो\n\nयह एक B.Tech अंतिम वर्ष का प्रोजेक्ट है जिसमें रीयल-टाइम चैट, पेमेंट इंटीग्रेशन (Razorpay), AI फसल स्कैनिंग, और बहु-भाषा (अंग्रेजी, हिंदी, मराठी) सपोर्ट है।`,
                quickReplies: ['रजिस्टर कैसे करें?', 'उत्पाद देखें', 'मेरे पास के किसान', 'भुगतान कैसे होता है?'],
            },
            {
                id: 'register',
                patterns: ['रजिस्टर', 'साइन अप', 'अकाउंट बनाएं', 'नया खाता', 'farmlink से जुड़ें', 'कैसे रजिस्टर करें', 'कैसे बनाएं', 'सदस्य बनें'],
                response: () => `📝 **अकाउंट कैसे बनाएं**\n\n1. शीर्ष नेविगेशन बार में **Login / Register** पर क्लिक करें\n2. **"Register"** टैब पर जाएं\n3. अपना **पूरा नाम**, **ईमेल** और **पासवर्ड** दर्ज करें\n4. अपनी भूमिका चुनें:\n   - 🌾 **किसान** — उत्पाद सूचीबद्ध करने और बेचने के लिए\n   - 🛒 **ग्राहक** — ब्राउज़ करने और खरीदने के लिए\n5. **"Create Account"** पर क्लिक करें\n\nआप तुरंत पहुँच के लिए **Google से साइन इन** भी कर सकते हैं! ✨`,
                quickReplies: ['लॉगिन कैसे करें?', 'पासवर्ड भूल गए', 'किसान की भूमिका क्या है?', 'ग्राहक की भूमिका क्या है?'],
            },
            {
                id: 'login',
                patterns: ['लॉगिन', 'लॉग इन', 'साइन इन', 'कैसे लॉगिन करें', 'लॉगिन नहीं हो रहा', 'लॉगिन समस्या'],
                response: () => `🔐 **लॉगिन कैसे करें**\n\n1. शीर्ष नेविगेशन बार में **Login** पर क्लिक करें\n2. अपना पंजीकृत **ईमेल** और **पासवर्ड** दर्ज करें\n3. **"Login"** पर क्लिक करें\n\n**अन्य विकल्प:**\n• 🌐 **Google साइन-इन** — "Continue with Google" पर क्लिक करें\n• 🔑 **पासवर्ड भूल गए?** — रीसेट ईमेल पाने के लिए लॉगिन फॉर्म के नीचे दिए लिंक पर क्लिक करें\n\n> यदि आपको त्रुटि मिल रही है, तो सुनिश्चित करें कि आपका ईमेल सही है।`,
                quickReplies: ['पासवर्ड भूल गए', 'रजिस्टर कैसे करें?', 'Google साइन-इन', 'खाता समस्या'],
            },
            {
                id: 'forgot_password',
                patterns: ['पासवर्ड भूल गए', 'पासवर्ड रीसेट', 'पासवर्ड बदलें', 'पासवर्ड याद नहीं'],
                response: () => `🔑 **अपना पासवर्ड रीसेट करें**\n\n1. **लॉगिन** पृष्ठ पर जाएं\n2. लॉगिन फॉर्म के नीचे **"Forgot Password?"** पर क्लिक करें\n3. अपना पंजीकृत **ईमेल पता** दर्ज करें\n4. **"Send Reset Link"** पर क्लिक करें\n5. अपने इनबॉक्स में रीसेट ईमेल देखें और लिंक का पालन करें\n\n**लॉगिन होने पर पासवर्ड बदलने के लिए:**\n1. **My Profile** पर जाएं (शीर्ष-दाएं मेनू)\n2. **"Change Password"** पर क्लिक करें\n3. अपना वर्तमान पासवर्ड दर्ज करें और नया सेट करें`,
                quickReplies: ['लॉगिन कैसे करें?', 'प्रोफ़ाइल अपडेट करें', 'खाता सुरक्षा'],
            },
            {
                id: 'browse_products',
                patterns: ['उत्पाद देखें', 'उत्पाद खोजें', 'सामान', 'बाज़ार', 'खरीदारी', 'फल', 'सब्जी', 'उत्पाद खरीदें', 'दुकान'],
                response: () => `🛒 **बाज़ार में उत्पाद खोजना**\n\n1. शीर्ष नेविगेशन में **Marketplace** पर क्लिक करें\n2. विशिष्ट आइटम खोजने के लिए **सर्च बार** का उपयोग करें (जैसे, "टमाटर", "चावल")\n3. **श्रेणी** (सब्जियां, फल, अनाज, डेयरी) के अनुसार फ़िल्टर करें\n4. **क्षेत्र/स्थान** के अनुसार फ़िल्टर करें\n5. कीमत के अनुसार सॉर्ट करें (कम से ज्यादा या ज्यादा से कम)\n\nकिसी भी उत्पाद कार्ड पर क्लिक करके देखें:\n• पूर्ण विवरण और चित्र\n• किसान का विवरण\n• स्टॉक की उपलब्धता\n• ग्राहक समीक्षा\n• **कार्ट में जोड़ें** या **विशलिस्ट में जोड़ें** ❤️ का विकल्प`,
                quickReplies: ['कार्ट में कैसे जोड़ें?', 'ऑर्डर कैसे दें?', 'किसान खोजें', 'कौन सी श्रेणियां उपलब्ध हैं?'],
            },
            {
                id: 'cart',
                patterns: ['कार्ट', 'कार्ट में जोड़ें', 'मेरा कार्ट', 'शॉपिंग कार्ट', 'कार्ट देखें', 'कार्ट से हटाएं', 'कार्ट अपडेट करें', 'कार्ट खाली है'],
                response: () => `🛒 **अपना कार्ट प्रबंधित करना**\n\n**आइटम जोड़ना:**\n• किसी भी उत्पाद कार्ड या विवरण पृष्ठ पर **"Add to Cart"** पर क्लिक करें\n\n**अपना कार्ट देखना:**\n• शीर्ष नेविगेशन बार में 🛒 **कार्ट आइकन** पर क्लिक करें\n\n**अपने कार्ट में आप कर सकते हैं:**\n• **+/-** बटन के साथ मात्रा समायोजित करें\n• **कचरा आइकन** का उपयोग करके आइटम हटाएं\n• **कुल कीमत** देखें\n• **चेकआउट** के लिए आगे बढ़ें\n\n> यदि आप पृष्ठ को रिफ्रेश करते हैं तो भी आपका कार्ट स्थानीय रूप से सहेजा जाता है!`,
                quickReplies: ['चेकआउट कैसे करें?', 'भुगतान विकल्प', 'ऑर्डर ट्रैक करें', 'मेरी विशलिस्ट'],
            },
            {
                id: 'wishlist',
                patterns: ['विशलिस्ट', 'बाद के लिए सेव करें', 'पसंदीदा', 'बुकमार्क', 'हार्ट आइकन', 'सेव किए गए आइटम'],
                response: () => `❤️ **अपनी विशलिस्ट का उपयोग करना**\n\n**विशलिस्ट में जोड़ें:**\n• किसी भी उत्पाद कार्ड पर **❤️ हार्ट आइकन** पर क्लिक करें\n\n**अपनी विशलिस्ट देखें:**\n• **My Profile** → **Wishlist** टैब पर जाएं\n• या अपने **Dashboard** पर जाएं\n\n**विशेषताएं:**\n• विशलिस्ट किए गए आइटम **आपके खाते से सिंक** हो जाते हैं (लॉग आउट करने पर भी खोएंगे नहीं)\n• यदि किसी आइटम की कीमत कम होती है तो आपको **मूल्य गिरावट अलर्ट** 🔔 मिलेंगे\n• खरीदने के लिए तैयार होने पर आइटम को आसानी से विशलिस्ट से कार्ट में ले जाएं\n\n> विशलिस्ट का उपयोग करने के लिए आपका **लॉगिन** होना आवश्यक है।`,
                quickReplies: ['कार्ट में कैसे जोड़ें?', 'मेरी प्रोफ़ाइल', 'मूल्य अलर्ट', 'उत्पाद देखें'],
            },
            {
                id: 'place_order',
                patterns: ['ऑर्डर दें', 'ऑर्डर कैसे दें', 'कैसे ऑर्डर करें', 'खरीदें', 'चेकआउट', 'कैसे खरीदें', 'खाना मंगाएं', 'चेकआउट कैसे करें'],
                response: () => `✅ **FarmLink पर ऑर्डर देना**\n\n**चरण 1:** **Marketplace** ब्राउज़ करें और आइटम को अपने कार्ट 🛒 में जोड़ें\n\n**चरण 2:** कार्ट आइकन पर क्लिक करें → अपने आइटम की समीक्षा करें → **"Checkout"** पर क्लिक करें\n\n**चरण 3:** अपना **डिलीवरी पता** दर्ज करें\n\n**चरण 4:** भुगतान विधि चुनें:\n   • 💳 **Razorpay** (UPI, कार्ड, नेट बैंकिंग)\n   • 💵 **कैश ऑन डिलीवरी (COD)**\n\n**चरण 5:** अपने ऑर्डर की पुष्टि करें → हो गया! 🎉\n\nआप अपने ऑर्डर को **My Activity** या अपने **Dashboard** के अंतर्गत ट्रैक कर सकते हैं।`,
                quickReplies: ['ऑर्डर ट्रैक करें', 'भुगतान विकल्प', 'ऑर्डर रद्द करें', 'ऑर्डर इतिहास'],
            },
            {
                id: 'payment',
                patterns: ['भुगतान', 'पे', 'razorpay', 'upi', 'cod', 'कैश ऑन डिलीवरी', 'नेट बैंकिंग', 'डेबिट कार्ड', 'क्रेडिट कार्ड', 'कैसे भुगतान करें', 'भुगतान विकल्प', 'भुगतान विफल'],
                response: () => `💳 **FarmLink पर भुगतान विकल्प**\n\n**1. Razorpay (ऑनलाइन भुगतान):**\n• UPI (Google Pay, PhonePe, Paytm, आदि)\n• डेबिट / क्रेडिट कार्ड\n• नेट बैंकिंग\n• वॉलेट भुगतान\n\n**2. कैश ऑन डिलीवरी (COD):**\n• जब आपका ऑर्डर आपके दरवाजे पर पहुंचे तब भुगतान करें\n\n**भुगतान सुरक्षा:**\n• सभी ऑनलाइन लेनदेन **Razorpay के सुरक्षित गेटवे** के माध्यम से होते हैं\n• FarmLink कभी भी आपके कार्ड का विवरण संग्रहीत नहीं करता है\n\n> यदि आपका भुगतान विफल हो गया है, तो अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें। पैसे कटने पर 5-7 कार्य दिवसों में रिफंड कर दिए जाएंगे।`,
                quickReplies: ['ऑर्डर दें', 'ऑर्डर ट्रैक करें', 'रिफंड नीति', 'समर्थन से संपर्क करें'],
            },
            {
                id: 'track_order',
                patterns: ['ऑर्डर ट्रैक करें', 'ऑर्डर स्थिति', 'मेरा ऑर्डर कहां है', 'मेरा ऑर्डर', 'ऑर्डर इतिहास', 'डिलीवरी स्थिति', 'डिलीवर', 'ऑर्डर नहीं मिला'],
                response: () => `📦 **अपना ऑर्डर ट्रैक करना**\n\n1. **My Activity** पर जाएं (शीर्ष नेविगेशन, ग्राहक के रूप में लॉग इन होने पर)\n   — या — अपने **Dashboard** → **My Orders** टैब पर जाएं\n2. सूची में अपना ऑर्डर ढूंढें\n3. प्रत्येक ऑर्डर एक **स्थिति टाइमलाइन** दिखाता है:\n   - 🟡 **Placed** — ऑर्डर प्राप्त हुआ\n   - 🔵 **Processing** — किसान आपका ऑर्डर तैयार कर रहा है\n   - 🚚 **Shipped** — आपका ऑर्डर रास्ते में है\n   - ✅ **Delivered** — ऑर्डर पहुंच गया!\n\n> आपको प्रत्येक चरण पर **सूचनाएं** प्राप्त होंगी। 🔔 बेल आइकन जांचें।`,
                quickReplies: ['ऑर्डर रद्द करें', 'समीक्षा छोड़ें', 'भुगतान समस्या', 'किसान से संपर्क करें'],
            },
            {
                id: 'cancel_order',
                patterns: ['ऑर्डर रद्द करें', 'मेरा ऑर्डर रद्द करें', 'रिफंड', 'वापसी', 'कैसे रद्द करें', 'मैं रद्द करना चाहता हूं'],
                response: () => `❌ **ऑर्डर रद्द करना या वापस करना**\n\n**ऑर्डर रद्द करने के लिए:**\n1. **My Activity** → **My Orders** पर जाएं\n2. वह ऑर्डर ढूंढें जिसे आप रद्द करना चाहते हैं\n3. **"Cancel"** पर क्लिक करें (केवल **Placed** या **Processing** स्थिति वाले ऑर्डर के लिए उपलब्ध)\n\n**रिफंड नीति:**\n• ऑनलाइन भुगतान (Razorpay): **5-7 कार्य दिवसों** के भीतर रिफंड\n• COD ऑर्डर: रिफंड के लिए कोई भुगतान नहीं\n\n> जो ऑर्डर पहले ही **Shipped** (भेजे जा चुके) हैं, उन्हें रद्द नहीं किया जा सकता। इन-ऐप चैट के माध्यम से किसान से सीधे संपर्क करें।`,
                quickReplies: ['ऑर्डर ट्रैक करें', 'किसान से संपर्क करें', 'भुगतान समस्या', 'समीक्षा छोड़ें'],
            },
            {
                id: 'notifications',
                patterns: ['अधिसूचना', 'अलर्ट', 'बेल आइकन', 'पुश नोटिफिकेशन', 'कोई सूचना नहीं', 'सूचना काम नहीं कर रही', 'सूचना चालू करें'],
                response: () => `🔔 **FarmLink पर सूचनाएं**\n\nFarmLink आपको इसके लिए सूचनाएं भेजता है:\n• किसानों/ग्राहकों के नए संदेश 💬\n• ऑर्डर स्थिति अपडेट 📦\n• विशलिस्ट मूल्य गिरावट अलर्ट ❤️\n• सत्यापन स्थिति अपडेट ✅\n\n**कैसे जांचें:**\n• नेविगेशन बार में **🔔 बेल आइकन** पर क्लिक करें\n\n**पुश नोटिफिकेशन सक्षम करें:**\n• संकेत मिलने पर, अपने ब्राउज़र में **"Allow"** पर क्लिक करें\n• इससे ऐप बैकग्राउंड में होने पर भी आपको अलर्ट मिल सकेंगे\n\n> महत्वपूर्ण अपडेट के लिए ईमेल द्वारा भी सूचनाएं भेजी जाती हैं।`,
                quickReplies: ['ऑर्डर ट्रैक करें', 'मेरे संदेश', 'विशलिस्ट अलर्ट', 'खाता सेटिंग'],
            },
            {
                id: 'find_farmers',
                patterns: ['किसान खोजें', 'स्थानीय किसान', 'मेरे पास के किसान', 'किसानों की सूची', 'किसान ब्राउज़ करें', 'किसान सूची', 'आसपास के किसान'],
                response: () => `🌾 **FarmLink पर किसानों को खोजना**\n\n1. शीर्ष नेविगेशन बार में **"Farmers"** पर क्लिक करें\n2. मंच पर सभी सत्यापित किसानों को ब्राउज़ करें\n3. नाम से किसानों को खोजने के लिए **सर्च बार** का उपयोग करें\n4. किसान का विवरण देखने के लिए उसके कार्ड पर क्लिक करें:\n   • उनकी प्रोफ़ाइल और विशेषज्ञता\n   • रेटिंग और समीक्षाएं\n   • उनके सभी उपलब्ध उत्पाद\n   • संपर्क विकल्प\n\n**सत्यापित किसानों** के पास ✅ **नीला सत्यापित बैज** होता है — उनकी पहचान और खेत के दस्तावेजों की जांच की जा चुकी है।\n\nआप उत्पाद पृष्ठ से सीधे किसान के साथ **चैट भी कर सकते हैं**!`,
                quickReplies: ['उत्पाद देखें', 'किसान के साथ चैट करें', 'सत्यापित किसान क्या है?', 'ऑर्डर दें'],
            },
            {
                id: 'farmer_verification',
                patterns: ['सत्यापित किसान', 'सत्यापन', 'सत्यापित हो जाओ', 'सत्यापित कैसे हों', 'किसान बैज', 'सत्यापन प्रक्रिया', 'दस्तावेज अपलोड करें', 'खाता सत्यापित करें'],
                response: () => `✅ **FarmLink पर किसान सत्यापन**\n\nसत्यापन से ग्राहकों का विश्वास बढ़ता है। यहां बताया गया है कि सत्यापित कैसे हों:\n\n1. अपने **Farmer Dashboard** पर जाएं\n2. अपनी प्रोफ़ाइल अनुभाग में **"Get Verified"** पर क्लिक करें\n3. आवश्यक दस्तावेज अपलोड करें:\n   • 🪪 **आधार कार्ड**\n   • 📄 **पैन कार्ड**\n   • 🏦 **बैंक पासबुक**\n4. सबमिट करें — हमारी एडमिन टीम **2-3 कार्य दिवसों** के भीतर समीक्षा करेगी\n\n**सत्यापन के लाभ:**\n• ✅ आपकी प्रोफ़ाइल पर नीला सत्यापित बैज\n• 🔝 खोज परिणामों में उच्च रैंकिंग\n• 💬 ग्राहकों से अधिक विश्वास`,
                quickReplies: ['उत्पाद कैसे सूचीबद्ध करें?', 'मेरा डैशबोर्ड', 'दस्तावेज अपलोड करें', 'सत्यापन स्थिति जांचें'],
            },
            {
                id: 'list_product',
                patterns: ['उत्पाद सूचीबद्ध करें', 'उत्पाद कैसे जोड़ें', 'उत्पाद जोड़ें', 'उत्पाद बेचें', 'लिस्टिंग जोड़ें', 'लिस्टिंग बनाएं', 'कैसे बेचें', 'उत्पाद अपलोड करें', 'नया उत्पाद'],
                response: () => `🌱 **उत्पाद कैसे सूचीबद्ध करें (केवल किसानों के लिए)**\n\n1. लॉगिन करें और अपने **Farmer Dashboard** पर जाएं\n2. **"Add Product"** या **"List New Product"** पर क्लिक करें\n3. विवरण भरें:\n   • 📦 **उत्पाद का नाम**\n   • 💰 **मूल्य (₹/किलो)**\n   • 📊 **स्टॉक (किलो)**\n   • 🏷️ **श्रेणी** (सब्जियां, फल, अनाज, डेयरी)\n   • 📍 **स्थान टैग**\n   • 🖊️ **विवरण** (गुणवत्ता, फसल तिथि, आदि)\n4. **उत्पाद की फोटो** अपलोड करें 📸\n5. बाजार-आधारित मूल्य अनुशंसा के लिए **"AI Price Suggest"** 🤖 का उपयोग करें!\n6. **"Save"** पर क्लिक करें — आपका उत्पाद अब लाइव है!\n\n> आप समस्याओं के लिए अपनी फसलों की जांच करने के लिए **Crop Disease Scanner** 🌿 का भी उपयोग कर सकते हैं।`,
                quickReplies: ['उत्पाद संपादित या हटाएं?', 'AI मूल्य सुझाव', 'फसल स्कैनर', 'मेरी लिस्टिंग देखें'],
            },
            {
                id: 'edit_product',
                patterns: ['उत्पाद संपादित करें', 'उत्पाद हटाएं', 'उत्पाद अपडेट करें', 'उत्पाद हटाएं', 'उत्पाद बदलें', 'लिस्टिंग अपडेट करें', 'कैसे संपादित करें', 'उत्पाद प्रबंधित करें'],
                response: () => `✏️ **किसी उत्पाद को संपादित करना या हटाना**\n\n1. अपने **Farmer Dashboard** पर जाएं\n2. उत्पाद को **"My Stock"** या **"Listed Products"** में खोजें\n3. अपडेट करने के लिए **✏️ Edit** बटन पर क्लिक करें:\n   • मूल्य, स्टॉक, विवरण, चित्र\n4. अपडेट करने के लिए **💾 Save Changes** पर क्लिक करें\n\n**किसी उत्पाद को हटाने के लिए:**\n• उत्पाद कार्ड पर **🗑️ Delete** बटन पर क्लिक करें\n• डायलॉग बॉक्स में विलोपन की पुष्टि करें\n\n> ⚠️ किसी उत्पाद को हटाना **स्थायी है और इसे पूर्ववत नहीं किया जा सकता है**। सुनिश्चित करें कि आप इसे हटाना चाहते हैं!`,
                quickReplies: ['नया उत्पाद जोड़ें', 'मेरी लिस्टिंग देखें', 'स्टॉक अपडेट करें', 'किसान डैशबोर्ड'],
            },
            {
                id: 'ai_price',
                patterns: ['ai मूल्य', 'मूल्य सुझाव', 'सुझाव मूल्य', 'ai सुझाव', 'स्वचालित मूल्य', 'बाजार मूल्य', 'उचित मूल्य', 'मूल्य सिफारिश'],
                response: () => `🤖 **AI मूल्य सुझाव सुविधा**\n\nकिसी उत्पाद को सूचीबद्ध करते समय, FarmLink वर्तमान बाजार दरों के आधार पर **AI-संचालित मूल्य अनुशंसा** प्रदान करता है।\n\n**इसका उपयोग कैसे करें:**\n1. अपना उत्पाद लिस्टिंग फॉर्म भरना शुरू करें\n2. **"Auto-suggest Price (AI)"** बटन पर क्लिक करें\n3. AI फसल डेटा को स्कैन करता है और उचित बाजार मूल्य का सुझाव देता है\n4. सुझाव स्वीकार करें या इसे मैन्युअल रूप से समायोजित करें\n\nयह किसानों को बाजार अनुसंधान की आवश्यकता के बिना अपनी उपज का **प्रतिस्पर्धी और उचित मूल्य** तय करने में मदद करता है!`,
                quickReplies: ['उत्पाद कैसे सूचीबद्ध करें?', 'फसल रोग स्कैनर', 'मेरा डैशबोर्ड', 'मूल्य निर्धारण रणनीतियाँ'],
            },
            {
                id: 'crop_scanner',
                patterns: ['फसल स्कैनर', 'फसल रोग', 'रोग स्कैनर', 'पौधे रोग', 'फसल स्वास्थ्य', 'फसल स्कैन', 'ai स्कैनर', 'फसल समस्या', 'पौधे की समस्या', 'बीमार फसल'],
                response: () => `🌿 **फसल रोग स्कैनर**\n\nFarmLink में पौधों की बीमारियों को जल्दी पहचानने में किसानों की मदद करने के लिए एक **AI-संचालित फसल रोग स्कैनर** शामिल है।\n\n**इसका उपयोग कैसे करें:**\n1. अपने **Farmer Dashboard** पर जाएं\n2. **"Crop Disease Scanner"** अनुभाग खोजें\n3. अपने **फसल के पत्ते या पौधे की फोटो** अपलोड करें\n4. AI इसका विश्लेषण करेगा और संभावित बीमारियों की पहचान करेगा\n5. उपचार के लिए कार्रवाई योग्य सिफारिशें प्राप्त करें\n\n**लाभ:**\n• रोग का शीघ्र पता लगाना 🔍\n• फसल के नुकसान को कम करना\n• तुरंत उपचार के सुझाव प्राप्त करना`,
                quickReplies: ['उत्पाद जोड़ें', 'AI मूल्य सुझाव', 'मेरा डैशबोर्ड', 'किसान सत्यापन'],
            },
            {
                id: 'profile',
                patterns: ['प्रोफ़ाइल', 'मेरी प्रोफ़ाइल', 'प्रोफ़ाइल संपादित करें', 'प्रोफ़ाइल अपडेट करें', 'व्यक्तिगत विवरण', 'खाता सेटिंग', 'नाम बदलें', 'ईमेल बदलें', 'फोन बदलें', 'खाता जानकारी'],
                response: () => `👤 **अपनी प्रोफ़ाइल प्रबंधित करना**\n\n1. शीर्ष नेविगेशन में अपने **प्रोफ़ाइल आइकन** या नाम पर क्लिक करें\n2. ड्रॉपडाउन से **"My Profile"** चुनें\n\n**आप क्या अपडेट कर सकते हैं:**\n• 📛 पूरा नाम\n• 📧 ईमेल पता\n• 📱 फोन नंबर\n• 📍 पता\n• 🖼️ प्रोफ़ाइल चित्र\n• 🌾 *किसान:* बायो, विशेषज्ञता, खेत का विवरण\n\n3. **"Edit Profile"** पर क्लिक करें, परिवर्तन करें, और **"Save Changes"** पर क्लिक करें\n\n**प्रोफ़ाइल में भी:**\n• पासवर्ड बदलें\n• अपनी विशलिस्ट देखें\n• अपने ऑर्डर देखें`,
                quickReplies: ['पासवर्ड बदलें', 'मेरी विशलिस्ट', 'मेरे ऑर्डर', 'खाता सुरक्षा'],
            },
            {
                id: 'dashboard',
                patterns: ['डैशबोर्ड', 'मेरा डैशबोर्ड', 'किसान डैशबोर्ड', 'ग्राहक डैशबोर्ड', 'एडमिन डैशबोर्ड', 'डैशबोर्ड पर जाएं', 'डैशबोर्ड कैसे देखें'],
                response: () => `📊 **आपका डैशबोर्ड**\n\nआपका डैशबोर्ड आपकी भूमिका पर निर्भर करता है:\n\n🌾 **किसान डैशबोर्ड:**\n• उत्पाद जोड़ें/संपादित करें/हटाएं\n• प्राप्त ऑर्डर देखें\n• राजस्व आँकड़े और एनालिटिक्स\n• फसल रोग स्कैनर\n• AI मूल्य सुझाव\n• सत्यापन स्थिति\n\n🛒 **ग्राहक डैशबोर्ड:**\n• ऑर्डर इतिहास देखें\n• सक्रिय ऑर्डर ट्रैक करें\n• विशलिस्ट प्रबंधित करें\n\n👑 **एडमिन डैशबोर्ड:**\n• सभी उपयोगकर्ताओं और किसानों को प्रबंधित करें\n• सत्यापन दस्तावेजों की समीक्षा करें\n• प्लेटफ़ॉर्म आँकड़ों की निगरानी करें\n• अनुचित उत्पादों को हटाएं\n\n**पहुंच:** शीर्ष नेविगेशन बार में **"Dashboard"** पर क्लिक करें।`,
                quickReplies: ['उत्पाद कैसे सूचीबद्ध करें?', 'ऑर्डर ट्रैक करें', 'प्रोफ़ाइल सेटिंग', 'सत्यापन'],
            },
            {
                id: 'chat',
                patterns: ['चैट', 'किसान को संदेश', 'किसान से संपर्क करें', 'ग्राहक को संदेश', 'कैसे चैट करें', 'संदेश भेजें', 'किसान से बात करें', 'इनबॉक्स'],
                response: () => `💬 **FarmLink पर चैटिंग**\n\nआप सीधे किसानों या ग्राहकों को संदेश भेज सकते हैं!\n\n**चैट कैसे शुरू करें:**\n• किसी **किसान की प्रोफ़ाइल** या **उत्पाद पृष्ठ** पर जाएं\n• **"Contact Farmer"** या चैट आइकन 💬 पर क्लिक करें\n• **नीचे-दाएं कोने** में एक चैट विंडो खुलती है\n\n**विशेषताएं:**\n• Socket.IO ⚡ के माध्यम से रीयल-टाइम संदेश सेवा\n• यदि आप ऑफ़लाइन रहते हुए संदेश प्राप्त करते हैं तो आपको एक पुश सूचना 🔔 मिलेगी\n• अपने स्वयं के संदेशों को **हटाने** के लिए उन पर होवर करें\n• संदेश इतिहास सहेजा जाता है\n\n> संदेश भेजने के लिए आपका **लॉगिन** होना आवश्यक है।`,
                quickReplies: ['किसान खोजें', 'सूचनाएं', 'मेरी प्रोफ़ाइल', 'ऑर्डर दें'],
            },
            {
                id: 'language',
                patterns: ['भाषा', 'भाषा बदलें', 'हिंदी', 'मराठी', 'अंग्रेजी', 'भाषा सेटिंग', 'अनुवाद करें', 'अन्य भाषाएं'],
                response: () => `🌐 **बहु-भाषा समर्थन**\n\nFarmLink **3 भाषाओं** का समर्थन करता है:\n• 🇬🇧 **अंग्रेजी (English)**\n• 🇮🇳 **हिंदी (Hindi)**\n• 🟠 **मराठी (Marathi)**\n\n**भाषा कैसे बदलें:**\n1. नेविगेशन बार में **भाषा चयनकर्ता** देखें (🌐 आइकन या "EN/HI/MR")\n2. भाषाओं के बीच टॉगल करने के लिए क्लिक करें\n\nपूरा UI — मेनू, बटन और लेबल — तुरंत बदल जाएगा! 🎉`,
                quickReplies: ['नेविगेशन सहायता पर वापस', 'मेरी प्रोफ़ाइल', 'FarmLink क्या है?'],
            },
            {
                id: 'dark_mode',
                patterns: ['डार्क मोड', 'लाइट मोड', 'थीम', 'डार्क थीम', 'थीम बदलें', 'नाइट मोड', 'दिखावट'],
                response: () => `🌙 **डार्क मोड / लाइट मोड**\n\nFarmLink डार्क और लाइट दोनों थीम का समर्थन करता है!\n\n**कैसे टॉगल करें:**\n• **शीर्ष नेविगेशन बार** में **🌙 चांद** (या ☀️ सूरज) आइकन पर क्लिक करें\n• ऐप तुरंत डार्क और लाइट मोड के बीच स्विच हो जाएगा\n\nआपकी प्राथमिकता **स्वचालित रूप से सहेजी जाती है** इसलिए यह पृष्ठ रीफ्रेश होने पर बनी रहती है।`,
                quickReplies: ['नेविगेशन सहायता', 'भाषा सेटिंग', 'FarmLink क्या है?'],
            },
            {
                id: 'admin',
                patterns: ['एडमिन', 'व्यवस्थापक', 'एडमिन पैनल', 'एडमिन डैशबोर्ड', 'उपयोगकर्ता प्रबंधित करें', 'किसान प्रबंधित करें', 'एडमिन भूमिका', 'किसान को मंजूरी दें'],
                response: () => `👑 **FarmLink पर एडमिन की भूमिका**\n\nएडमिन पूरे प्लेटफॉर्म का प्रबंधन करते हैं:\n\n**एडमिन क्षमताएं:**\n• 👥 सभी उपयोगकर्ताओं (ग्राहकों, किसानों) को देखें और प्रबंधित करें\n• 🌾 किसान सत्यापनों की समीक्षा करें और स्वीकृत/अस्वीकृत करें\n• 📦 अनुचित उत्पादों को हटाएं\n• 📊 प्लेटफ़ॉर्म आँकड़ों की निगरानी करें\n• 🔧 सिस्टम स्वास्थ्य निगरानी\n\n**एडमिन डैशबोर्ड तक पहुंच:**\n• एडमिन खाते से लॉगिन करें\n• नेविगेशन में **"Dashboard"** पर क्लिक करें\n\n> एडमिन खाते अलग से बनाए जाते हैं — नियमित उपयोगकर्ता खुद को एडमिन भूमिका नहीं दे सकते।`,
                quickReplies: ['किसान सत्यापन', 'प्लेटफ़ॉर्म आँकड़े', 'उपयोगकर्ता प्रबंधित करें', 'उत्पाद हटाएं'],
            },
            {
                id: 'transparency',
                patterns: ['पारदर्शिता', 'पारदर्शिता रिपोर्ट', 'प्रभाव रिपोर्ट', 'प्लेटफ़ॉर्म रिपोर्ट', 'co2', 'कार्बन फुटप्रिंट', 'पर्यावरण प्रभाव'],
                response: () => `📊 **पारदर्शिता रिपोर्ट**\n\nFarmLink एक **खुली पारदर्शिता रिपोर्ट** प्रकाशित करता है जो प्लेटफॉर्म के वास्तविक दुनिया के प्रभाव को दिखाती है:\n\n• 🌾 **शामिल हुए किसान** और उनके उत्पाद\n• 🛒 **कुल ऑर्डर** पूरे हुए\n• 🌍 **CO2 बचाई गई** (फूड माइल्स कम करके)\n• 📈 किसानों के लिए उत्पन्न **राजस्व**\n• 💚 **स्थिरता** मेट्रिक्स\n\n**इसे कैसे देखें:**\n• पाद लेख (फ़ुटर) तक स्क्रॉल करें → **"Transparency Report"** पर क्लिक करें\n• या साइट नेविगेशन में इसे खोजें\n\nयह रिपोर्ट वास्तविक प्लेटफ़ॉर्म डेटा के आधार पर स्वचालित रूप से अपडेट होती है!`,
                quickReplies: ['FarmLink क्या है?', 'किसान खोजें', 'उत्पाद देखें'],
            },
            {
                id: 'review',
                patterns: ['समीक्षा', 'रेटिंग', 'समीक्षा छोड़ें', 'समीक्षा लिखें', 'उत्पाद को रेट करें', 'फ़ीडबैक', 'उत्पाद समीक्षा', 'किसान समीक्षा', 'समीक्षा कैसे करें'],
                response: () => `⭐ **समीक्षा छोड़ना**\n\nअपना अनुभव साझा करके अन्य ग्राहकों की मदद करें!\n\n**समीक्षा कैसे छोड़ें:**\n1. अपना ऑर्डर प्राप्त करने के बाद, **My Orders** पर जाएं\n2. डिलीवर किया गया ऑर्डर ढूंढें\n3. **"Leave Review"** ⭐ पर क्लिक करें\n4. उत्पाद को रेट करें (1-5 स्टार)\n5. अपना फ़ीडबैक लिखें\n6. **"Submit Review"** पर क्लिक करें\n\nआपकी समीक्षा सभी उपयोगकर्ताओं को देखने के लिए **उत्पाद पृष्ठ** पर दिखाई देगी।\n\n> समीक्षाएं किसानों को बेहतर बनाने में मदद करती हैं और ग्राहकों को सूचित विकल्प चुनने में मदद करती हैं! 🙏`,
                quickReplies: ['ऑर्डर ट्रैक करें', 'मेरा ऑर्डर इतिहास', 'उत्पाद खोजें', 'किसान से संपर्क करें'],
            },
            {
                id: 'logout',
                patterns: ['लॉगआउट', 'लॉग आउट', 'साइन आउट', 'कैसे लॉगआउट करें', 'खाता बंद करें', 'सत्र समाप्त करें'],
                response: () => `🚪 **लॉगआउट कैसे करें**\n\n1. शीर्ष नेविगेशन बार में अपनी **प्रोफ़ाइल चित्र** या **नाम** पर क्लिक करें\n2. ड्रॉपडाउन मेनू से **"Logout"** चुनें\n3. आपको होम पेज पर पुनर्निर्देशित किया जाएगा\n\n> आपके कार्ट आइटम स्थानीय रूप से सहेजे जाते हैं। आपकी विशलिस्ट आपके खाते में सहेजी जाती है और जब आप वापस लॉग इन करेंगे तो वहां होगी! 💾`,
                quickReplies: ['लॉगिन कैसे करें?', 'मेरी प्रोफ़ाइल', 'खाता सुरक्षा'],
            },
            {
                id: 'technical_issues',
                patterns: ['काम नहीं कर रहा', 'त्रुटि', 'बग', 'समस्या', 'गड़बड़', 'लोडिंग', 'धीमा', 'क्रैश', 'फंस गया', 'पृष्ठ लोड नहीं हो रहा', 'तकनीकी समस्या'],
                response: () => `🔧 **तकनीकी समस्याओं का निवारण**\n\n**पहले इन चरणों का प्रयास करें:**\n1. 🔄 **पृष्ठ को रिफ्रेश करें** (F5 या Ctrl+R)\n2. 🌐 अपना **इंटरनेट कनेक्शन** जांचें\n3. 🧹 **ब्राउज़र कैश साफ़ करें** (Ctrl+Shift+Delete)\n4. 🔒 एक **अलग ब्राउज़र** का प्रयास करें (Chrome अनुशंसित है)\n5. 📱 यदि मोबाइल पर हैं, तो **ऐप कैश साफ़ करने** का प्रयास करें\n\n**सामान्य समाधान:**\n• लॉगिन समस्याएं → **Forgot Password** का प्रयास करें\n• भुगतान विफल → बैंक ऐप जांचें / 5 मिनट में फिर से प्रयास करें\n• उत्पाद लोड नहीं हो रहे → इंटरनेट जांचें और रिफ्रेश करें\n\n> यदि समस्या बनी रहती है, तो पाद लेख में ईमेल के माध्यम से FarmLink टीम से संपर्क करें 📧`,
                quickReplies: ['लॉगिन समस्याएं', 'भुगतान विफल', 'ऑर्डर अपडेट नहीं हो रहा', 'समर्थन से संपर्क करें'],
            },
            {
                id: 'contact',
                patterns: ['संपर्क', 'समर्थन', 'मदद', 'समर्थन से संपर्क करें', 'संपर्क समर्थन', 'पहुंच', 'ईमेल', 'ग्राहक सेवा', 'ग्राहक सहायता', 'मदद प्राप्त करें'],
                response: () => `📬 **संपर्क और समर्थन**\n\nक्या आपको और मदद चाहिए?\n\n• 📧 **हमें ईमेल करें:** संपर्क ईमेल के लिए वेबसाइट का **फ़ुटर** देखें\n• 💬 **चैट सुविधा:** किसानों को सीधे संदेश भेजने के लिए इन-ऐप चैट का उपयोग करें\n• 📋 **कानूनी:** फ़ुटर में **Privacy Policy** या **Terms of Service** पर जाएं\n\n**स्व-सेवा विकल्प:**\n• 🤖 त्वरित उत्तरों के लिए मेरे साथ चैट करते रहें!\n• 📊 प्लेटफ़ॉर्म जानकारी के लिए पारदर्शिता रिपोर्ट जांचें\n• 🔔 अपडेट रहने के लिए सूचनाएं सक्षम करें\n\n> हम आमतौर पर कार्य दिवसों में **24-48 घंटों** के भीतर ईमेल का जवाब देते हैं।`,
                quickReplies: ['तकनीकी समस्याएं', 'रिफंड नीति', 'FarmLink के बारे में', 'गोपनीयता नीति'],
            },
            {
                id: 'legal',
                patterns: ['गोपनीयता', 'गोपनीयता नीति', 'शर्तें', 'सेवा की शर्तें', 'कानूनी', 'डेटा', 'gdpr', 'व्यक्तिगत डेटा', 'डेटा गोपनीयता'],
                response: () => `⚖️ **गोपनीयता और शर्तें**\n\nFarmLink आपकी गोपनीयता को गंभीरता से लेता है!\n\n**हमारी नीतियां देखें:**\n• किसी भी पृष्ठ के **फ़ुटर** तक स्क्रॉल करें\n• **"Privacy Policy"** या **"Terms of Service"** पर क्लिक करें\n\n**मुख्य बिंदु:**\n• आपका व्यक्तिगत डेटा एन्क्रिप्ट किया गया है और कभी बेचा नहीं जाता है\n• कार्ड विवरण **Razorpay** (PCI-अनुपालन) द्वारा नियंत्रित किए जाते हैं\n• आप किसी भी समय खाता हटाने का अनुरोध कर सकते हैं\n• कुकीज़ का उपयोग केवल सत्र प्रबंधन के लिए किया जाता है\n\n> किसी भी डेटा-संबंधित चिंताओं के लिए, हमें फ़ुटर में दिए गए पते पर ईमेल करें।`,
                quickReplies: ['समर्थन से संपर्क करें', 'खाता सुरक्षा', 'FarmLink के बारे में'],
            },
            {
                id: 'farmer_guide',
                patterns: ['किसान मार्गदर्शिका', 'किसान कैसे बनें', 'किसान टिप्स', 'किसान मदद', 'किसान के रूप में शुरुआत', 'नया किसान', 'किसान विशेषताएं', 'किसान क्या कर सकते हैं'],
                response: () => `🌾 **एक किसान के रूप में शुरुआत करना**\n\nयहां वह सब कुछ है जो आप FarmLink किसान के रूप में कर सकते हैं:\n\n1. किसान के रूप में **रजिस्टर करें** 📝\n2. बायो और विशेषज्ञता के साथ **अपनी प्रोफ़ाइल पूरी करें** 👤\n3. **सत्यापित हो जाएं** ✅ (ट्रस्ट बैज के लिए दस्तावेज़ अपलोड करें)\n4. फोटो, मूल्य और स्टॉक के साथ **अपने उत्पादों को सूचीबद्ध करें** 🥕\n5. उचित मूल्य निर्धारण के लिए **AI Price Suggest** का उपयोग करें 🤖\n6. **ऑर्डर प्राप्त करें** और उनकी स्थिति अपडेट करें 📦\n7. ग्राहकों के साथ **सीधे चैट करें** 💬\n8. अपने डैशबोर्ड में **आय की निगरानी करें** 📊\n9. बीमारी का पता लगाने के लिए **फसलों को स्कैन करें** 🌿\n\nकिसी विशिष्ट चरण में मदद चाहिए?`,
                quickReplies: ['उत्पाद सूचीबद्ध करें', 'सत्यापित हो जाएं', 'AI मूल्य सुझाव', 'ऑर्डर प्रबंधित करें'],
            },
            {
                id: 'customer_guide',
                patterns: ['ग्राहक मार्गदर्शिका', 'खरीदारी कैसे करें', 'ग्राहक टिप्स', 'शॉपिंग गाइड', 'farmlink का उपयोग कैसे करें', 'शुरुआत कैसे करें', 'नया ग्राहक', 'ग्राहक विशेषताएं'],
                response: () => `🛒 **एक ग्राहक के रूप में शुरुआत करना**\n\nFarmLink पर खरीदारी के लिए आपकी पूरी मार्गदर्शिका यहां दी गई है:\n\n1. ग्राहक के रूप में **रजिस्टर करें** 📝\n2. ताजी उपज के लिए **Marketplace** ब्राउज़ करें 🥦\n3. श्रेणी, स्थान और कीमत के आधार पर **फ़िल्टर करें**\n4. **Cart** 🛒 या **Wishlist** ❤️ में जोड़ें\n5. अपनी पसंदीदा भुगतान विधि से **चेकआउट करें** 💳\n6. My Activity में **अपना ऑर्डर ट्रैक करें** 📦\n7. प्रश्नों के लिए किसानों के साथ **चैट करें** 💬\n8. डिलीवरी के बाद **समीक्षाएं छोड़ें** ⭐\n9. ऑर्डर अपडेट और सौदों के लिए **सूचनाएं प्राप्त करें** 🔔\n\nहैप्पी शॉपिंग! 🌱`,
                quickReplies: ['उत्पाद देखें', 'ऑर्डर दें', 'भुगतान विकल्प', 'स्थानीय किसान खोजें'],
            },
        ],
        mr: [
            {
                id: 'greet',
                patterns: ['नमस्कार', 'हॅलो', 'हाय', 'शुभ प्रभात', 'कसे आहात', 'hello', 'hi'],
                response: () => `👋 नमस्कार! मी **FarmLink सहाय्यक** आहे, तुमचा वैयक्तिक मार्गदर्शक.\n\nमी तुम्हाला यात मदत करू शकतो:\n• 🛒 खरेदी आणि ऑर्डर करणे\n• 🌾 शेतकरी म्हणून उत्पादने विकणे\n• 👤 खाते आणि प्रोफाइल व्यवस्थापन\n• 💳 पेमेंट आणि ट्रॅकिंग\n• 🧭 ॲप नेव्हिगेशन\n\nतुम्हाला काय जाणून घ्यायचे आहे?`,
                quickReplies: ['ऑर्डर कशी द्यायची?', 'उत्पादन कसे जोडायचे?', 'FarmLink काय आहे?', 'पासवर्ड कसा रिसेट करायचा?'],
            },
            {
                id: 'about',
                patterns: ['farmlink काय आहे', 'farmlink बद्दल', 'मला सांगा', 'farmlink काय करते', 'मिशन', 'उद्देश', 'कोणी बनवले', 'हे ॲप काय आहे', 'हे प्लॅटफॉर्म काय आहे'],
                response: () => `🌱 **FarmLink बद्दल**\n\nFarmLink एक 'फार्म-टू-टेबल' मार्केटप्लेस आहे जे **स्थानिक शेतकऱ्यांना थेट ग्राहकांशी जोडते** — मध्यस्थांना वगळून हे सुनिश्चित करते:\n\n✅ **शेतकऱ्यांना** त्यांच्या मालाचा योग्य भाव मिळतो\n✅ **ग्राहकांना** ताजे, रसायनमुक्त अन्न मिळते\n✅ **फूड माइल्स** कमी होतात आणि पर्यावरणाला फायदा होतो\n\nहा एक B.Tech अंतिम वर्षाचा प्रकल्प आहे ज्यामध्ये रिअल-टाइम चॅट, पेमेंट इंटिग्रेशन (Razorpay), AI पीक स्कॅनिंग आणि बहु-भाषा (इंग्रजी, हिंदी, मराठी) सपोर्ट आहे.`,
                quickReplies: ['नोंदणी कशी करायची?', 'उत्पादने पहा', 'माझ्याजवळील शेतकरी', 'पेमेंट कसे होते?'],
            },
            {
                id: 'register',
                patterns: ['नोंदणी', 'साइन अप', 'खाते तयार करा', 'नवीन खाते', 'farmlink मध्ये सामील व्हा', 'नोंदणी कशी करायची', 'कसे तयार करायचे', 'सदस्य व्हा'],
                response: () => `📝 **खाते कसे तयार करायचे**\n\n1. शीर्ष नेव्हिगेशन बारमध्ये **Login / Register** वर क्लिक करा\n2. **"Register"** टॅबवर जा\n3. तुमचे **पूर्ण नाव**, **ईमेल** आणि **पासवर्ड** प्रविष्ट करा\n4. तुमची भूमिका निवडा:\n   - 🌾 **शेतकरी** — उत्पादने सूचीबद्ध आणि विक्री करण्यासाठी\n   - 🛒 **ग्राहक** — ब्राउझ आणि खरेदी करण्यासाठी\n5. **"Create Account"** वर क्लिक करा\n\nतुम्ही त्वरित प्रवेशासाठी **Google सह साइन इन** देखील करू शकता! ✨`,
                quickReplies: ['लॉगिन कसे करायचे?', 'पासवर्ड विसरलो', 'शेतकऱ्याची भूमिका काय आहे?', 'ग्राहकाची भूमिका काय आहे?'],
            },
            {
                id: 'login',
                patterns: ['लॉगिन', 'लॉग इन', 'साइन इन', 'कसे लॉगिन करायचे', 'लॉगिन होत नाही', 'लॉगिन समस्या'],
                response: () => `🔐 **लॉगिन कसे करायचे**\n\n1. शीर्ष नेव्हिगेशन बारमध्ये **Login** वर क्लिक करा\n2. तुमचा नोंदणीकृत **ईमेल** आणि **पासवर्ड** प्रविष्ट करा\n3. **"Login"** वर क्लिक करा\n\n**इतर पर्याय:**\n• 🌐 **Google साइन-इन** — "Continue with Google" वर क्लिक करा\n• 🔑 **पासवर्ड विसरलात?** — रिसेट ईमेल मिळवण्यासाठी लॉगिन फॉर्मच्या खालील लिंकवर क्लिक करा\n\n> जर तुम्हाला त्रुटी येत असेल, तर तुमचा ईमेल बरोबर असल्याची खात्री करा.`,
                quickReplies: ['पासवर्ड विसरलो', 'नोंदणी कशी करायची?', 'Google साइन-इन', 'खाते समस्या'],
            },
            {
                id: 'forgot_password',
                patterns: ['पासवर्ड विसरलो', 'पासवर्ड रिसेट', 'पासवर्ड बदला', 'पासवर्ड आठवत नाही'],
                response: () => `🔑 **तुमचा पासवर्ड रिसेट करा**\n\n1. **लॉगिन** पृष्ठावर जा\n2. लॉगिन फॉर्मच्या खाली **"Forgot Password?"** वर क्लिक करा\n3. तुमचा नोंदणीकृत **ईमेल पत्ता** प्रविष्ट करा\n4. **"Send Reset Link"** वर क्लिक करा\n5. तुमच्या इनबॉक्समध्ये रिसेट ईमेल तपासा आणि लिंक फॉलो करा\n\n**लॉगिन असताना पासवर्ड बदलण्यासाठी:**\n1. **My Profile** वर जा (वरच्या उजव्या कोपऱ्यातील मेनू)\n2. **"Change Password"** वर क्लिक करा\n3. तुमचा सध्याचा पासवर्ड टाका आणि नवीन सेट करा`,
                quickReplies: ['लॉगिन कसे करायचे?', 'प्रोफाइल अपडेट करा', 'खाते सुरक्षा'],
            },
            {
                id: 'browse_products',
                patterns: ['उत्पादने पहा', 'उत्पादने शोधा', 'बाजार', 'खरेदी', 'फळे', 'भाजीपाला', 'उत्पादने खरेदी करा', 'दुकान'],
                response: () => `🛒 **बाजारपेठेत उत्पादने शोधणे**\n\n1. शीर्ष नेव्हिगेशनमध्ये **Marketplace** वर क्लिक करा\n2. विशिष्ट आयटम शोधण्यासाठी **सर्च बार** वापरा (उदा. "टोमॅटो", "तांदूळ")\n3. **श्रेणी** (भाजीपाला, फळे, धान्य, दुग्धजन्य पदार्थ) नुसार फिल्टर करा\n4. **विभाग/स्थान** नुसार फिल्टर करा\n5. किंमतीनुसार क्रमवारी लावा (कमी ते जास्त किंवा जास्त ते कमी)\n\nकोणत्याही उत्पादन कार्डवर क्लिक करून पहा:\n• पूर्ण वर्णन आणि चित्रे\n• शेतकऱ्याचा तपशील\n• स्टॉकची उपलब्धता\n• ग्राहक पुनरावलोकने\n• **कार्टमध्ये जोडा** किंवा **विशलिस्टमध्ये जोडा** ❤️ चा पर्याय`,
                quickReplies: ['कार्टमध्ये कसे जोडायचे?', 'ऑर्डर कशी द्यायची?', 'शेतकरी शोधा', 'कोणत्या श्रेणी उपलब्ध आहेत?'],
            },
            {
                id: 'cart',
                patterns: ['कार्ट', 'कार्टमध्ये जोडा', 'माझे कार्ट', 'शॉपिंग कार्ट', 'कार्ट पहा', 'कार्टमधून काढा', 'कार्ट अपडेट करा', 'कार्ट रिकामी आहे'],
                response: () => `🛒 **तुमचे कार्ट व्यवस्थापित करणे**\n\n**आयटम जोडणे:**\n• कोणत्याही उत्पादन कार्डवर किंवा तपशील पृष्ठावर **"Add to Cart"** वर क्लिक करा\n\n**तुमचे कार्ट पाहणे:**\n• शीर्ष नेव्हिगेशन बारमधील 🛒 **कार्ट आयकॉन** वर क्लिक करा\n\n**तुमच्या कार्टमध्ये तुम्ही करू शकता:**\n• **+/-** बटणांसह प्रमाण समायोजित करा\n• **कचरा आयकॉन** वापरून आयटम काढा\n• **एकूण किंमत** पहा\n• **चेकआउट** साठी पुढे जा\n\n> जर तुम्ही पृष्ठ रिफ्रेश केले तरीही तुमचे कार्ट स्थानिक पातळीवर जतन केले जाते!`,
                quickReplies: ['चेकआउट कसे करायचे?', 'पेमेंट पर्याय', 'ऑर्डर ट्रॅक करा', 'माझी विशलिस्ट'],
            },
            {
                id: 'wishlist',
                patterns: ['विशलिस्ट', 'नंतरसाठी जतन करा', 'आवडते', 'बुकमार्क', 'हार्ट आयकॉन', 'जतन केलेले आयटम'],
                response: () => `❤️ **तुमची विशलिस्ट वापरणे**\n\n**विशलिस्टमध्ये जोडा:**\n• कोणत्याही उत्पादन कार्डवरील **❤️ हार्ट आयकॉन** वर क्लिक करा\n\n**तुमची विशलिस्ट पहा:**\n• **My Profile** → **Wishlist** टॅबवर जा\n• किंवा तुमच्या **Dashboard** वर जा\n\n**वैशिष्ट्ये:**\n• विशलिस्ट केलेले आयटम **तुमच्या खात्याशी सिंक** केले जातात (लॉग आउट केल्यावरही ते गमावणार नाहीत)\n• जर एखाद्या आयटमची किंमत कमी झाली तर तुम्हाला **किंमत घसरण अलर्ट** 🔔 मिळतील\n• खरेदी करण्यास तयार असताना आयटम सहजपणे विशलिस्टमधून कार्टमध्ये हलवा\n\n> विशलिस्ट वापरण्यासाठी तुमचे **लॉगिन** असणे आवश्यक आहे.`,
                quickReplies: ['कार्टमध्ये कसे जोडायचे?', 'माझे प्रोफाइल', 'किंमत अलर्ट', 'उत्पादने पहा'],
            },
            {
                id: 'place_order',
                patterns: ['ऑर्डर द्या', 'ऑर्डर कशी द्यायची', 'कशी ऑर्डर करायची', 'खरेदी करा', 'चेकआउट', 'कसे खरेदी करायचे', 'अन्न मागवा', 'चेकआउट कसे करायचे'],
                response: () => `✅ **FarmLink वर ऑर्डर देणे**\n\n**पायरी 1:** **Marketplace** ब्राउझ करा आणि आयटम तुमच्या कार्ट 🛒 मध्ये जोडा\n\n**पायरी 2:** कार्ट आयकॉनवर क्लिक करा → तुमच्या आयटमचे पुनरावलोकन करा → **"Checkout"** वर क्लिक करा\n\n**पायरी 3:** तुमचा **डिलिव्हरी पत्ता** प्रविष्ट करा\n\n**पायरी 4:** पेमेंट पद्धत निवडा:\n   • 💳 **Razorpay** (UPI, कार्ड, नेट बँकिंग)\n   • 💵 **कॅश ऑन डिलिव्हरी (COD)**\n\n**पायरी 5:** तुमच्या ऑर्डरची पुष्टी करा → पूर्ण झाले! 🎉\n\nतुम्ही तुमची ऑर्डर **My Activity** किंवा तुमच्या **Dashboard** अंतर्गत ट्रॅक करू शकता.`,
                quickReplies: ['ऑर्डर ट्रॅक करा', 'पेमेंट पर्याय', 'ऑर्डर रद्द करा', 'ऑर्डर इतिहास'],
            },
            {
                id: 'payment',
                patterns: ['पेमेंट', 'पे', 'razorpay', 'upi', 'cod', 'कॅश ऑन डिलिव्हरी', 'नेट बँकिंग', 'डेबिट कार्ड', 'क्रेडिट कार्ड', 'कसे पेमेंट करायचे', 'पेमेंट पर्याय', 'पेमेंट अयशस्वी'],
                response: () => `💳 **FarmLink वरील पेमेंट पर्याय**\n\n**1. Razorpay (ऑनलाइन पेमेंट):**\n• UPI (Google Pay, PhonePe, Paytm इ.)\n• डेबिट / क्रेडिट कार्ड\n• नेट बँकिंग\n• वॉलेट पेमेंट\n\n**2. कॅश ऑन डिलिव्हरी (COD):**\n• जेव्हा तुमची ऑर्डर तुमच्या दारात पोहोचेल तेव्हा पैसे द्या\n\n**पेमेंट सुरक्षा:**\n• सर्व ऑनलाइन व्यवहार **Razorpay च्या सुरक्षित गेटवे** द्वारे होतात\n• FarmLink तुमचे कार्ड तपशील कधीही साठवत नाही\n\n> जर तुमचे पेमेंट अयशस्वी झाले असेल, तर तुमचे इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा. पैसे कापले गेल्यास 5-7 व्यावसायिक दिवसांत परत केले जातील.`,
                quickReplies: ['ऑर्डर द्या', 'ऑर्डर ट्रॅक करा', 'परतावा धोरण', 'सपोर्टशी संपर्क साधा'],
            },
            {
                id: 'track_order',
                patterns: ['ऑर्डर ट्रॅक करा', 'ऑर्डर स्थिती', 'माझी ऑर्डर कुठे आहे', 'माझी ऑर्डर', 'ऑर्डर इतिहास', 'डिलिव्हरी स्थिती', 'डिलिव्हर', 'ऑर्डर मिळाली नाही'],
                response: () => `📦 **तुमची ऑर्डर ट्रॅक करणे**\n\n1. **My Activity** वर जा (शीर्ष नेव्हिगेशन, ग्राहक म्हणून लॉग इन असताना)\n   — किंवा — तुमच्या **Dashboard** → **My Orders** टॅबवर जा\n2. सूचीमध्ये तुमची ऑर्डर शोधा\n3. प्रत्येक ऑर्डर एक **स्थिती टाइमलाइन** दर्शवते:\n   - 🟡 **Placed** — ऑर्डर प्राप्त झाली\n   - 🔵 **Processing** — शेतकरी तुमची ऑर्डर तयार करत आहे\n   - 🚚 **Shipped** — तुमची ऑर्डर वाटेत आहे\n   - ✅ **Delivered** — ऑर्डर पोहोचली!\n\n> तुम्हाला प्रत्येक टप्प्यावर **सूचना** मिळतील. 🔔 बेल आयकॉन तपासा.`,
                quickReplies: ['ऑर्डर रद्द करा', 'पुनरावलोकन द्या', 'पेमेंट समस्या', 'शेतकऱ्याशी संपर्क साधा'],
            },
            {
                id: 'cancel_order',
                patterns: ['ऑर्डर रद्द करा', 'माझी ऑर्डर रद्द करा', 'परतावा', 'परत', 'कसे रद्द करायचे', 'मला रद्द करायचे आहे'],
                response: () => `❌ **ऑर्डर रद्द करणे किंवा परत करणे**\n\n**ऑर्डर रद्द करण्यासाठी:**\n1. **My Activity** → **My Orders** वर जा\n2. तुम्हाला जी ऑर्डर रद्द करायची आहे ती शोधा\n3. **"Cancel"** वर क्लिक करा (केवळ **Placed** किंवा **Processing** स्थिती असलेल्या ऑर्डरसाठी उपलब्ध)\n\n**परतावा धोरण:**\n• ऑनलाइन पेमेंट (Razorpay): **5-7 व्यावसायिक दिवसांत** परतावा\n• COD ऑर्डर: परताव्यासाठी कोणतेही पेमेंट नाही\n\n> ज्या ऑर्डर आधीच **Shipped** (पाठवल्या) आहेत त्या रद्द केल्या जाऊ शकत नाहीत. इन-ॲप चॅटद्वारे थेट शेतकऱ्याशी संपर्क साधा.`,
                quickReplies: ['ऑर्डर ट्रॅक करा', 'शेतकऱ्याशी संपर्क साधा', 'पेमेंट समस्या', 'पुनरावलोकन द्या'],
            },
            {
                id: 'notifications',
                patterns: ['सूचना', 'अलर्ट', 'बेल आयकॉन', 'पुश नोटिफिकेशन', 'कोणतीही सूचना नाही', 'सूचना काम करत नाही', 'सूचना चालू करा'],
                response: () => `🔔 **FarmLink वरील सूचना**\n\nFarmLink तुम्हाला यासाठी सूचना पाठवते:\n• शेतकरी/ग्राहकांचे नवीन संदेश 💬\n• ऑर्डर स्थिती अद्यतने 📦\n• विशलिस्ट किंमत घसरण अलर्ट ❤️\n• पडताळणी स्थिती अद्यतने ✅\n\n**कसे तपासायचे:**\n• नेव्हिगेशन बारमधील **🔔 बेल आयकॉन** वर क्लिक करा\n\n**पुश नोटिफिकेशन सक्षम करा:**\n• विचारल्यावर, तुमच्या ब्राउझरमध्ये **"Allow"** वर क्लिक करा\n• यामुळे ॲप बॅकग्राउंडमध्ये असतानाही तुम्हाला अलर्ट मिळतील\n\n> महत्त्वपूर्ण अद्यतनांसाठी ईमेलद्वारे देखील सूचना पाठवल्या जातात.`,
                quickReplies: ['ऑर्डर ट्रॅक करा', 'माझे संदेश', 'विशलिस्ट अलर्ट', 'खाते सेटिंग'],
            },
            {
                id: 'find_farmers',
                patterns: ['शेतकरी शोधा', 'स्थानिक शेतकरी', 'माझ्याजवळील शेतकरी', 'शेतकऱ्यांची यादी', 'शेतकरी ब्राउझ करा', 'शेतकरी यादी', 'आसपासचे शेतकरी'],
                response: () => `🌾 **FarmLink वर शेतकरी शोधणे**\n\n1. शीर्ष नेव्हिगेशन बारमध्ये **"Farmers"** वर क्लिक करा\n2. प्लॅटफॉर्मवरील सर्व सत्यापित शेतकरी ब्राउझ करा\n3. नावानुसार शेतकरी शोधण्यासाठी **सर्च बार** वापरा\n4. शेतकऱ्याचा तपशील पाहण्यासाठी त्याच्या कार्डवर क्लिक करा:\n   • त्यांचे प्रोफाइल आणि खासियत\n   • रेटिंग आणि पुनरावलोकने\n   • त्यांची सर्व उपलब्ध उत्पादने\n   • संपर्क पर्याय\n\n**सत्यापित शेतकऱ्यांकडे** ✅ **निळा सत्यापित बॅज** असतो — त्यांची ओळख आणि शेतातील कागदपत्रे तपासली गेली आहेत.\n\nतुम्ही उत्पादन पृष्ठावरून थेट शेतकऱ्याशी **चॅट देखील करू शकता**!`,
                quickReplies: ['उत्पादने पहा', 'शेतकऱ्यासोबत चॅट करा', 'सत्यापित शेतकरी म्हणजे काय?', 'ऑर्डर द्या'],
            },
            {
                id: 'farmer_verification',
                patterns: ['सत्यापित शेतकरी', 'पडताळणी', 'सत्यापित व्हा', 'सत्यापित कसे व्हायचे', 'शेतकरी बॅज', 'पडताळणी प्रक्रिया', 'कागदपत्रे अपलोड करा', 'खाते सत्यापित करा'],
                response: () => `✅ **FarmLink वर शेतकरी पडताळणी**\n\nपडताळणीमुळे ग्राहकांचा विश्वास वाढतो. सत्यापित कसे व्हायचे ते येथे आहे:\n\n1. तुमच्या **Farmer Dashboard** वर जा\n2. तुमच्या प्रोफाइल विभागात **"Get Verified"** वर क्लिक करा\n3. आवश्यक कागदपत्रे अपलोड करा:\n   • 🪪 **आधार कार्ड**\n   • 📄 **पॅन कार्ड**\n   • 🏦 **बँक पासबुक**\n4. सबमिट करा — आमची ॲडमिन टीम **2-3 व्यावसायिक दिवसांत** पुनरावलोकन करेल\n\n**पडताळणीचे फायदे:**\n• ✅ तुमच्या प्रोफाइलवर निळा सत्यापित बॅज\n• 🔝 शोध परिणामांमध्ये उच्च रँकिंग\n• 💬 ग्राहकांचा अधिक विश्वास`,
                quickReplies: ['उत्पादन कसे सूचीबद्ध करायचे?', 'माझा डॅशबोर्ड', 'कागदपत्रे अपलोड करा', 'पडताळणी स्थिती तपासा'],
            },
            {
                id: 'list_product',
                patterns: ['उत्पादन सूचीबद्ध करा', 'उत्पादन कसे जोडायचे', 'उत्पादन जोडा', 'उत्पादन विका', 'लिस्टिंग जोडा', 'लिस्टिंग तयार करा', 'कसे विकायचे', 'उत्पादन अपलोड करा', 'नवीन उत्पादन'],
                response: () => `🌱 **उत्पादन कसे सूचीबद्ध करायचे (केवळ शेतकऱ्यांसाठी)**\n\n1. लॉगिन करा आणि तुमच्या **Farmer Dashboard** वर जा\n2. **"Add Product"** किंवा **"List New Product"** वर क्लिक करा\n3. तपशील भरा:\n   • 📦 **उत्पादनाचे नाव**\n   • 💰 **किंमत (₹/किलो)**\n   • 📊 **स्टॉक (किलो)**\n   • 🏷️ **श्रेणी** (भाजीपाला, फळे, धान्य, दुग्धजन्य पदार्थ)\n   • 📍 **स्थान टॅग**\n   • 🖊️ **वर्णन** (गुणवत्ता, कापणीची तारीख इ.)\n4. **उत्पादनाचा फोटो** अपलोड करा 📸\n5. बाजार-आधारित किंमत शिफारसीसाठी **"AI Price Suggest"** 🤖 वापरा!\n6. **"Save"** वर क्लिक करा — तुमचे उत्पादन आता लाइव्ह आहे!\n\n> तुम्ही समस्यांसाठी तुमची पिके तपासण्यासाठी **Crop Disease Scanner** 🌿 देखील वापरू शकता.`,
                quickReplies: ['उत्पादन संपादित करा किंवा काढा?', 'AI किंमत सुचवा', 'पीक स्कॅनर', 'माझी लिस्टिंग पहा'],
            },
            {
                id: 'edit_product',
                patterns: ['उत्पादन संपादित करा', 'उत्पादन काढा', 'उत्पादन अपडेट करा', 'उत्पादन बदल', 'लिस्टिंग अपडेट करा', 'कसे संपादित करायचे', 'उत्पादने व्यवस्थापित करा'],
                response: () => `✏️ **एखादे उत्पादन संपादित करणे किंवा काढणे**\n\n1. तुमच्या **Farmer Dashboard** वर जा\n2. उत्पादन **"My Stock"** किंवा **"Listed Products"** मध्ये शोधा\n3. अपडेट करण्यासाठी **✏️ Edit** बटण दाबा:\n   • किंमत, स्टॉक, वर्णन, चित्रे\n4. अपडेट जतन करण्यासाठी **💾 Save Changes** दाबा\n\n**एखादे उत्पादन काढण्यासाठी:**\n• उत्पादन कार्डवरील **🗑️ Delete** बटण दाबा\n• डायलॉग बॉक्समध्ये डिलीट करण्याची पुष्टी करा\n\n> ⚠️ एखादे उत्पादन काढणे **कायमस्वरूपी आहे आणि ते पूर्ववत केले जाऊ शकत नाही**. तुम्हाला ते काढायचे आहे याची खात्री करा!`,
                quickReplies: ['नवीन उत्पादन जोडा', 'माझी लिस्टिंग पहा', 'स्टॉक अपडेट करा', 'शेतकरी डॅशबोर्ड'],
            },
            {
                id: 'ai_price',
                patterns: ['ai किंमत', 'किंमत सुचवा', 'सुचवलेली किंमत', 'ai सुचवा', 'स्वयंचलित किंमत', 'बाजारभाव', 'योग्य किंमत', 'किंमत शिफारस'],
                response: () => `🤖 **AI किंमत सुचवा वैशिष्ट्य**\n\nएखादे उत्पादन सूचीबद्ध करताना, FarmLink सध्याच्या बाजारदरांवर आधारित **AI-संचलित किंमत शिफारस** प्रदान करते.\n\n**हे कसे वापरायचे:**\n1. तुमचा उत्पादन लिस्टिंग फॉर्म भरणे सुरू करा\n2. **"Auto-suggest Price (AI)"** बटण दाबा\n3. AI पीक डेटा स्कॅन करते आणि योग्य बाजारभावाची शिफारस करते\n4. शिफारस स्वीकारा किंवा ती मॅन्युअली समायोजित करा\n\nहे शेतकऱ्यांना बाजार संशोधनाशिवाय त्यांच्या मालाची **स्पर्धात्मक आणि योग्य किंमत** ठरवण्यात मदत करते!`,
                quickReplies: ['उत्पादन कसे सूचीबद्ध करायचे?', 'पीक रोग स्कॅनर', 'माझा डॅशबोर्ड', 'किंमत धोरणे'],
            },
            {
                id: 'crop_scanner',
                patterns: ['पीक स्कॅनर', 'पीक रोग', 'रोग स्कॅनर', 'वनस्पती रोग', 'पीक आरोग्य', 'पीक स्कॅन', 'ai स्कॅनर', 'पीक समस्या', 'वनस्पती समस्या', 'आजारी पीक'],
                response: () => `🌿 **पीक रोग स्कॅनर**\n\nFarmLink मध्ये वनस्पतींच्या आजारांना लवकर ओळखण्यात शेतकऱ्यांना मदत करण्यासाठी एक **AI-संचलित पीक रोग स्कॅनर** समाविष्ट आहे.\n\n**हे कसे वापरायचे:**\n1. तुमच्या **Farmer Dashboard** वर जा\n2. **"Crop Disease Scanner"** विभाग शोधा\n3. तुमच्या **पिकाच्या पानाचा किंवा वनस्पतीचा फोटो** अपलोड करा\n4. AI त्याचे विश्लेषण करेल आणि संभाव्य आजारांची ओळख करेल\n5. उपचारासाठी कृतीयोग्य शिफारसी मिळवा\n\n**फायदे:**\n• आजाराचे लवकर निदान 🔍\n• पिकाचे नुकसान कमी करणे\n• लगेच उपचाराचे सल्ले मिळवणे`,
                quickReplies: ['उत्पादन जोडा', 'AI किंमत सुचवा', 'माझा डॅशबोर्ड', 'शेतकरी पडताळणी'],
            },
            {
                id: 'profile',
                patterns: ['प्रोफाइल', 'माझे प्रोफाइल', 'प्रोफाइल संपादित करा', 'प्रोफाइल अपडेट करा', 'वैयक्तिक तपशील', 'खाते सेटिंग्ज', 'नाव बदला', 'ईमेल बदला', 'फोन बदला', 'खाते माहिती'],
                response: () => `👤 **तुमचे प्रोफाइल व्यवस्थापित करणे**\n\n1. शीर्ष नेव्हिगेशनमध्ये तुमच्या **प्रोफाइल आयकॉन** किंवा नावावर क्लिक करा\n2. ड्रॉपडाउनमधून **"My Profile"** निवडा\n\n**तुम्ही काय अपडेट करू शकता:**\n• 📛 पूर्ण नाव\n• 📧 ईमेल पत्ता\n• 📱 फोन नंबर\n• 📍 पत्ता\n• 🖼️ प्रोफाइल चित्र\n• 🌾 *शेतकरी:* बायो, खासियत, शेताचा तपशील\n\n3. **"Edit Profile"** वर क्लिक करा, बदल करा आणि **"Save Changes"** दाबा\n\n**प्रोफाइलमध्ये हे देखील आहे:**\n• पासवर्ड बदला\n• तुमची विशलिस्ट पहा\n• तुमच्या ऑर्डर्स पहा`,
                quickReplies: ['पासवर्ड बदला', 'माझी विशलिस्ट', 'माझ्या ऑर्डर्स', 'खाते सुरक्षा'],
            },
            {
                id: 'dashboard',
                patterns: ['डॅशबोर्ड', 'माझा डॅशबोर्ड', 'शेतकरी डॅशबोर्ड', 'ग्राहक डॅशबोर्ड', 'ॲडमिन डॅशबोर्ड', 'डॅशबोर्डवर जा', 'डॅशबोर्ड कसा पाहायचा'],
                response: () => `📊 **तुमचा डॅशबोर्ड**\n\nतुमचा डॅशबोर्ड तुमच्या भूमिकेवर अवलंबून असतो:\n\n🌾 **शेतकरी डॅशबोर्ड:**\n• उत्पादने जोडा/संपादित करा/काढा\n• प्राप्त ऑर्डर्स पहा\n• महसूल आकडेवारी आणि ॲनालिटिक्स\n• पीक रोग स्कॅनर\n• AI किंमत सुचवा\n• पडताळणी स्थिती\n\n🛒 **ग्राहक डॅशबोर्ड:**\n• ऑर्डर इतिहास पहा\n• सक्रिय ऑर्डर्स ट्रॅक करा\n• विशलिस्ट व्यवस्थापित करा\n\n👑 **ॲडमिन डॅशबोर्ड:**\n• सर्व वापरकर्ते आणि शेतकरी व्यवस्थापित करा\n• पडताळणी कागदपत्रांचे पुनरावलोकन करा\n• प्लॅटफॉर्म आकडेवारीचे परीक्षण करा\n• अयोग्य उत्पादने काढा\n\n**प्रवेश:** शीर्ष नेव्हिगेशन बारमध्ये **"Dashboard"** वर क्लिक करा.`,
                quickReplies: ['उत्पादन कसे सूचीबद्ध करायचे?', 'ऑर्डर ट्रॅक करा', 'प्रोफाइल सेटिंग्ज', 'पडताळणी'],
            },
            {
                id: 'chat',
                patterns: ['चॅट', 'शेतकऱ्याला संदेश', 'शेतकऱ्याशी संपर्क साधा', 'ग्राहकाला संदेश', 'चॅट कसे करायचे', 'संदेश पाठवा', 'शेतकऱ्याशी बोला', 'इनबॉक्स'],
                response: () => `💬 **FarmLink वर चॅटिंग**\n\nतुम्ही थेट शेतकऱ्यांना किंवा ग्राहकांना संदेश पाठवू शकता!\n\n**चॅट कसे सुरू करायचे:**\n• कोणत्याही **शेतकऱ्याचे प्रोफाइल** किंवा **उत्पादन पृष्ठावर** जा\n• **"Contact Farmer"** किंवा चॅट आयकॉन 💬 वर क्लिक करा\n• **तळाशी उजव्या कोपऱ्यात** चॅट विंडो उघडेल\n\n**वैशिष्ट्ये:**\n• Socket.IO ⚡ द्वारे रिअल-टाइम संदेशन\n• तुम्ही ऑफलाइन असताना संदेश प्राप्त केल्यास तुम्हाला पुश नोटिफिकेशन 🔔 मिळेल\n• तुमचे स्वतःचे संदेश **काढून टाकण्यासाठी** त्यांच्यावर होव्हर करा\n• संदेश इतिहास जतन केला जातो\n\n> संदेश पाठवण्यासाठी तुमचे **लॉगिन** असणे आवश्यक आहे.`,
                quickReplies: ['शेतकरी शोधा', 'सूचना', 'माझे प्रोफाइल', 'ऑर्डर द्या'],
            },
            {
                id: 'language',
                patterns: ['भाषा', 'भाषा बदला', 'हिंदी', 'मराठी', 'इंग्रजी', 'भाषा सेटिंग्ज', 'अनुवाद करा', 'इतर भाषा'],
                response: () => `🌐 **बहु-भाषा सपोर्ट**\n\nFarmLink **3 भाषांना** सपोर्ट करते:\n• 🇬🇧 **इंग्रजी (English)**\n• 🇮🇳 **हिंदी (Hindi)**\n• 🟠 **मराठी (Marathi)**\n\n**भाषा कशी बदलायची:**\n1. नेव्हिगेशन बारमध्ये **भाषा निवडक** पहा (🌐 आयकॉन किंवा "EN/HI/MR")\n2. भाषा टॉगल करण्यासाठी क्लिक करा\n\nसंपूर्ण UI — मेनू, बटणे आणि लेबल्स — त्वरित बदलतील! 🎉`,
                quickReplies: ['नेव्हिगेशन मदतीवर परत', 'माझे प्रोफाइल', 'FarmLink काय आहे?'],
            },
            {
                id: 'dark_mode',
                patterns: ['डार्क मोड', 'लाइट मोड', 'थीम', 'डार्क थीम', 'थीम बदला', 'नाईट मोड', 'देखावा'],
                response: () => `🌙 **डार्क मोड / लाइट मोड**\n\nFarmLink डार्क आणि लाइट दोन्ही थीमना सपोर्ट करते!\n\n**कसे टॉगल करायचे:**\n• **शीर्ष नेव्हिगेशन बारमध्ये** **🌙 चंद्र** (किंवा ☀️ सूर्य) आयकॉनवर क्लिक करा\n• ॲप त्वरित डार्क आणि लाइट मोडमध्ये स्विच होईल\n\nतुमची पसंती **स्वयंचलितपणे जतन केली जाते** त्यामुळे ती पृष्ठ रिफ्रेश केल्यावरही तशीच राहते.`,
                quickReplies: ['नेव्हिगेशन मदत', 'भाषा सेटिंग्ज', 'FarmLink काय आहे?'],
            },
            {
                id: 'admin',
                patterns: ['ॲडमिन', 'प्रशासक', 'ॲडमिन पॅनेल', 'ॲडमिन डॅशबोर्ड', 'वापरकर्ते व्यवस्थापित करा', 'शेतकरी व्यवस्थापित करा', 'ॲडमिन भूमिका', 'शेतकऱ्याला मान्यता द्या'],
                response: () => `👑 **FarmLink वरील ॲडमिन भूमिका**\n\nॲडमिन संपूर्ण प्लॅटफॉर्मचे व्यवस्थापन करतात:\n\n**ॲडमिन क्षमता:**\n• 👥 सर्व वापरकर्ते (ग्राहक, शेतकरी) पहा आणि व्यवस्थापित करा\n• 🌾 शेतकरी पडताळणीचे पुनरावलोकन करा आणि मंजूर/नामंजूर करा\n• 📦 अयोग्य उत्पादने काढून टाका\n• 📊 प्लॅटफॉर्म आकडेवारीचे परीक्षण करा\n• 🔧 सिस्टम आरोग्य परीक्षण\n\n**ॲडमिन डॅशबोर्ड प्रवेश:**\n• ॲडमिन खात्याने लॉगिन करा\n• नेव्हिगेशनमध्ये **"Dashboard"** दाबा\n\n> ॲडमिन खाती वेगळी तयार केली जातात — नियमित वापरकर्ते स्वतःला ॲडमिन भूमिका देऊ शकत नाहीत.`,
                quickReplies: ['शेतकरी पडताळणी', 'प्लॅटफॉर्म आकडेवारी', 'वापरकर्ते व्यवस्थापित करा', 'उत्पादने काढा'],
            },
            {
                id: 'transparency',
                patterns: ['पारदर्शकता', 'पारदर्शकता अहवाल', 'प्रभाव अहवाल', 'प्लॅटफॉर्म अहवाल', 'co2', 'कार्बन फूटप्रिंट', 'पर्यावरण प्रभाव'],
                response: () => `📊 **पारदर्शकता अहवाल**\n\nFarmLink एक **खुला पारदर्शकता अहवाल** प्रकाशित करते जो प्लॅटफॉर्मचा वास्तविक प्रभाव दर्शवतो:\n\n• 🌾 **सामील झालेले शेतकरी** आणि त्यांची उत्पादने\n• 🛒 **एकूण ऑर्डर्स** पूर्ण झाल्या\n• 🌍 **CO2 वाचवला** (फूड माइल्स कमी करून)\n• 📈 शेतकऱ्यांसाठी निर्माण झालेला **महसूल**\n• 💚 **शाश्वतता** मेट्रिक्स\n\n**हे कसे पाहायचे:**\n• फुटरपर्यंत स्क्रोल करा → **"Transparency Report"** दाबा\n• किंवा साइट नेव्हिगेशनमध्ये शोधा\n\nहा अहवाल वास्तविक प्लॅटफॉर्म डेटावर आधारित स्वयंचलितपणे अपडेट होतो!`,
                quickReplies: ['FarmLink काय आहे?', 'शेतकरी शोधा', 'उत्पादने पहा'],
            },
            {
                id: 'review',
                patterns: ['पुनरावलोकन', 'रेटिंग', 'पुनरावलोकन द्या', 'पुनरावलोकन लिहा', 'उत्पादनाला रेट करा', 'अभिप्राय', 'उत्पादन पुनरावलोकन', 'शेतकरी पुनरावलोकन', 'पुनरावलोकन कसे द्यावे'],
                response: () => `⭐ **पुनरावलोकन देणे**\n\nतुमचा अनुभव शेअर करून इतर ग्राहकांना मदत करा!\n\n**पुनरावलोकन कसे द्यावे:**\n1. तुमची ऑर्डर प्राप्त झाल्यानंतर, **My Orders** वर जा\n2. वितरित झालेली ऑर्डर शोधा\n3. **"Leave Review"** ⭐ दाबा\n4. उत्पादनाला रेट करा (1-5 स्टार)\n5. तुमचा अभिप्राय लिहा\n6. **"Submit Review"** दाबा\n\nतुमचे पुनरावलोकन सर्व वापरकर्त्यांना पाहण्यासाठी **उत्पादन पृष्ठावर** दिसेल.\n\n> पुनरावलोकने शेतकऱ्यांना सुधारण्यास आणि ग्राहकांना माहितीपूर्ण निवड करण्यात मदत करतात! 🙏`,
                quickReplies: ['ऑर्डर ट्रॅक करा', 'माझा ऑर्डर इतिहास', 'उत्पादने शोधा', 'शेतकऱ्याशी संपर्क साधा'],
            },
            {
                id: 'logout',
                patterns: ['लॉगआउट', 'लॉग आउट', 'साइन आउट', 'लॉगआउट कसे करायचे', 'खाते बंद करा', 'सत्र समाप्त करा'],
                response: () => `🚪 **लॉगआउट कसे करायचे**\n\n1. शीर्ष नेव्हिगेशन बारमध्ये तुमचे **प्रोफाइल चित्र** किंवा **नाव** दाबा\n2. ड्रॉपडाउन मेनूमधून **"Logout"** निवडा\n3. तुम्हाला होम पेजवर पुनर्निर्देशित केले जाईल\n\n> तुमचे कार्ट आयटम स्थानिक पातळीवर जतन केले जातात. तुमची विशलिस्ट तुमच्या खात्यात जतन केली जाते आणि तुम्ही पुन्हा लॉग इन करता तेव्हा ती तिथे असेल! 💾`,
                quickReplies: ['लॉगिन कसे करायचे?', 'माझे प्रोफाइल', 'खाते सुरक्षा'],
            },
            {
                id: 'technical_issues',
                patterns: ['काम करत नाही', 'त्रुटी', 'बग', 'समस्या', 'लोडिंग', 'हळू', 'क्रॅश', 'अडकले', 'पृष्ठ लोड होत नाही', 'तांत्रिक समस्या'],
                response: () => `🔧 **तांत्रिक समस्या सोडवणे**\n\n**प्रथम या पायऱ्या करून पहा:**\n1. 🔄 **पृष्ठ रिफ्रेश करा** (F5 किंवा Ctrl+R)\n2. 🌐 तुमचे **इंटरनेट कनेक्शन** तपासा\n3. 🧹 **ब्राउझर कॅशे साफ करा** (Ctrl+Shift+Delete)\n4. 🔒 **वेगळा ब्राउझर** वापरून पहा (Chrome ची शिफारस केली जाते)\n5. 📱 मोबाइलवर असल्यास, **ॲप कॅशे साफ करण्याचा** प्रयत्न करा\n\n**सामान्य उपाय:**\n• लॉगिन समस्या → **Forgot Password** वापरून पहा\n• पेमेंट अयशस्वी → बँक ॲप तपासा / 5 मिनिटांत पुन्हा प्रयत्न करा\n• उत्पादने लोड होत नाहीत → इंटरनेट तपासा आणि रिफ्रेश करा\n\n> समस्या कायम राहिल्यास, फुटरमधील ईमेलद्वारे FarmLink टीमशी संपर्क साधा 📧`,
                quickReplies: ['लॉगिन समस्या', 'पेमेंट अयशस्वी', 'ऑर्डर अपडेट होत नाही', 'सपोर्टशी संपर्क साधा'],
            },
            {
                id: 'contact',
                patterns: ['संपर्क', 'सपोर्ट', 'मदत', 'सपोर्टशी संपर्क साधा', 'सपोर्टशी संपर्क', 'ईमेल', 'ग्राहक सेवा', 'मदत मिळवा'],
                response: () => `📬 **संपर्क आणि सपोर्ट**\n\nतुम्हाला आणखी मदत हवी आहे का?\n\n• 📧 **आम्हाला ईमेल करा:** संपर्क ईमेलसाठी वेबसाइटचा **फुटर** तपासा\n• 💬 **चॅट वैशिष्ट्य:** शेतकऱ्यांना थेट संदेश पाठवण्यासाठी इन-ॲप चॅट वापरा\n• 📋 **कायदेशीर:** फुटरमधील **Privacy Policy** किंवा **Terms of Service** ला भेट द्या\n\n**स्व-सेवा पर्याय:**\n• 🤖 त्वरित उत्तरांसाठी माझ्याशी चॅट करत राहा!\n• 📊 प्लॅटफॉर्म माहितीसाठी पारदर्शकता अहवाल तपासा\n• 🔔 अपडेट राहण्यासाठी सूचना सक्षम करा\n\n> आम्ही साधारणपणे व्यावसायिक दिवसांत **24-48 तासांत** ईमेलला उत्तर देतो.`,
                quickReplies: ['तांत्रिक समस्या', 'परतावा धोरण', 'FarmLink बद्दल', 'गोपनीयता धोरण'],
            },
            {
                id: 'legal',
                patterns: ['गोपनीयता', 'गोपनीयता धोरण', 'अटी', 'सेवा अटी', 'कायदेशीर', 'डेटा', 'gdpr', 'वैयक्तिक डेटा', 'डेटा गोपनीयता'],
                response: () => `⚖️ **गोपनीयता आणि अटी**\n\nFarmLink तुमची गोपनीयता गांभीर्याने घेते!\n\n**आमची धोरणे पहा:**\n• कोणत्याही पृष्ठाच्या **फुटरपर्यंत** स्क्रोल करा\n• **"Privacy Policy"** किंवा **"Terms of Service"** वर क्लिक करा\n\n**मुख्य मुद्दे:**\n• तुमचा वैयक्तिक डेटा एनक्रिप्टेड आहे आणि कधीही विकला जात नाही\n• कार्ड तपशील **Razorpay** (PCI-कंप्लायंट) द्वारे हाताळले जातात\n• तुम्ही कधीही खाते हटवण्याची विनंती करू शकता\n• कुकीजचा वापर केवळ सत्र व्यवस्थापनासाठी केला जातो\n\n> कोणत्याही डेटा-संबंधित समस्यांसाठी, आम्हाला फुटरमधील पत्त्यावर ईमेल करा.`,
                quickReplies: ['सपोर्टशी संपर्क साधा', 'खाते सुरक्षा', 'FarmLink बद्दल'],
            },
            {
                id: 'farmer_guide',
                patterns: ['शेतकरी मार्गदर्शक', 'शेतकरी कसे बनावे', 'शेतकरी टिप्स', 'शेतकरी मदत', 'शेतकरी म्हणून सुरुवात', 'नवीन शेतकरी', 'शेतकरी वैशिष्ट्ये', 'शेतकरी काय करू शकतात'],
                response: () => `🌾 **शेतकरी म्हणून सुरुवात करणे**\n\nFarmLink शेतकरी म्हणून तुम्ही करू शकता अशी सर्व माहिती येथे आहे:\n\n1. शेतकरी म्हणून **नोंदणी करा** 📝\n2. बायो आणि खासियतसह **तुमचे प्रोफाइल पूर्ण करा** 👤\n3. **सत्यापित व्हा** ✅ (ट्रस्ट बॅजसाठी कागदपत्रे अपलोड करा)\n4. फोटो, किंमत आणि स्टॉकसह **तुमची उत्पादने सूचीबद्ध करा** 🥕\n5. योग्य किंमतीसाठी **AI Price Suggest** वापरा 🤖\n6. **ऑर्डर्स प्राप्त करा** आणि त्यांची स्थिती अपडेट करा 📦\n7. ग्राहकांसोबत **थेट चॅट करा** 💬\n8. तुमच्या डॅशबोर्डवर **कमाईचे परीक्षण करा** 📊\n9. आजार ओळखण्यासाठी **पिके स्कॅन करा** 🌿\n\nकोणत्याही विशिष्ट पायरीसाठी मदत हवी आहे का?`,
                quickReplies: ['उत्पादन सूचीबद्ध करा', 'सत्यापित व्हा', 'AI किंमत सुचवा', 'ऑर्डर्स व्यवस्थापित करा'],
            },
            {
                id: 'customer_guide',
                patterns: ['ग्राहक मार्गदर्शक', 'खरेदी कशी करावी', 'ग्राहक टिप्स', 'शॉपिंग गाइड', 'farmlink कसे वापरावे', 'सुरुवात कशी करावी', 'नवीन ग्राहक', 'ग्राहक वैशिष्ट्ये'],
                response: () => `🛒 **ग्राहक म्हणून सुरुवात करणे**\n\nFarmLink वर खरेदी करण्यासाठी तुमचे संपूर्ण मार्गदर्शक येथे आहे:\n\n1. ग्राहक म्हणून **नोंदणी करा** 📝\n2. ताज्या उत्पादनांसाठी **Marketplace** ब्राउझ करा 🥦\n3. श्रेणी, स्थान आणि किंमतीनुसार **फिल्टर करा**\n4. **Cart** 🛒 किंवा **Wishlist** ❤️ मध्ये जोडा\n5. तुमच्या पसंतीच्या पेमेंट पद्धतीसह **चेकआउट करा** 💳\n6. My Activity मध्ये **तुमची ऑर्डर ट्रॅक करा** 📦\n7. प्रश्नांसाठी शेतकऱ्यांशी **चॅट करा** 💬\n8. डिलिव्हरीनंतर **पुनरावलोकने द्या** ⭐\n9. ऑर्डर अपडेट आणि डील्ससाठी **सूचना मिळवा** 🔔\n\nहॅप्पी शॉपिंग! 🌱`,
                quickReplies: ['उत्पादने पहा', 'ऑर्डर द्या', 'पेमेंट पर्याय', 'स्थानिक शेतकरी शोधा'],
            },
        ]
    };

    return data[lang] || data['en'];
};

// ─── Fallback Response ───────────────────────────────────────────────────────
export const getFallbackResponse = (lang = 'en') => {
    const data = {
        en: {
            response: () => `🤔 I'm not sure I understand that, but I'm here to help!\n\nHere are some things I can assist with:\n• 🛒 Placing & tracking orders\n• 🌾 Listing & managing products (farmers)\n• 👤 Account & profile settings\n• 💳 Payments & checkout\n• 🔔 Notifications & alerts\n• 🌐 Navigation & features\n\nTry asking something like:\n_"How do I place an order?"_ or _"How do I list a product?"_`,
            quickReplies: ['How do I place an order?', 'How do I list a product?', 'What is FarmLink?', 'Contact support'],
        },
        hi: {
            response: () => `🤔 मुझे यकीन नहीं है कि मैं इसे समझ पाया, लेकिन मैं यहाँ मदद के लिए हूँ!\n\nयहाँ कुछ चीजें हैं जिनमें मैं सहायता कर सकता हूँ:\n• 🛒 ऑर्डर देना और ट्रैक करना\n• 🌾 उत्पादों को सूचीबद्ध करना (किसानों के लिए)\n• 👤 खाता और प्रोफ़ाइल सेटिंग\n• 💳 भुगतान और चेकआउट\n• 🔔 सूचनाएं और अलर्ट\n• 🌐 नेविगेशन और विशेषताएं\n\nकुछ ऐसा पूछने का प्रयास करें:\n_"मैं ऑर्डर कैसे दूं?"_ या _"मैं किसी उत्पाद को सूचीबद्ध कैसे करूं?"_`,
            quickReplies: ['ऑर्डर कैसे दें?', 'उत्पाद कैसे जोड़ें?', 'FarmLink क्या है?', 'समर्थन से संपर्क करें'],
        },
        mr: {
            response: () => `🤔 मला खात्री नाही की मला ते समजले, पण मी येथे मदतीसाठी आहे!\n\nमी यामध्ये मदत करू शकतो:\n• 🛒 ऑर्डर देणे आणि ट्रॅक करणे\n• 🌾 उत्पादने सूचीबद्ध करणे (शेतकऱ्यांसाठी)\n• 👤 खाते आणि प्रोफाइल सेटिंग्ज\n• 💳 पेमेंट आणि चेकआउट\n• 🔔 सूचना आणि अलर्ट\n• 🌐 नेव्हिगेशन आणि वैशिष्ट्ये\n\nअसे काहीतरी विचारून पहा:\n_"मी ऑर्डर कशी देऊ?"_ किंवा _"मी उत्पादन कसे जोडू?"_`,
            quickReplies: ['ऑर्डर कशी द्यायची?', 'उत्पादन कसे जोडायचे?', 'FarmLink काय आहे?', 'सपोर्टशी संपर्क साधा'],
        }
    };
    return data[lang] || data['en'];
};

// ─── Role-based Greetings ────────────────────────────────────────────────────
export const getRoleGreetings = (lang = 'en') => {
    const data = {
        en: {
            farmer: (name) => `👋 Welcome back, **${name}**! 🌾\n\nAs a farmer, I can help you:\n• List or manage products\n• Track orders from customers\n• Get verified for a trust badge\n• Use AI price suggestion & crop scanner\n\nWhat do you need help with today?`,
            customer: (name) => `👋 Welcome back, **${name}**! 🛒\n\nAs a customer, I can help you:\n• Find fresh local produce\n• Place and track orders\n• Manage your cart & wishlist\n• Chat with farmers\n\nWhat can I help you with?`,
            admin: (name) => `👋 Welcome, **${name}**! 👑\n\nAs an admin, I can help you understand:\n• Managing users & farmers\n• Reviewing verifications\n• Platform stats & reports\n\nWhat do you need?`,
            guest: () => `👋 Hello! Welcome to **FarmLink**! 🌱\n\nI'm your AI assistant. I can help you:\n• Learn about the platform\n• Browse fresh produce\n• Register as a farmer or customer\n• Understand how orders & payments work\n\nWhat would you like to know?`,
        },
        hi: {
            farmer: (name) => `👋 वापसी पर स्वागत है, **${name}**! 🌾\n\nएक किसान के रूप में, मैं आपकी मदद कर सकता हूँ:\n• उत्पाद सूचीबद्ध या प्रबंधित करने में\n• ग्राहकों से ऑर्डर ट्रैक करने में\n• ट्रस्ट बैज के लिए सत्यापित होने में\n• AI मूल्य सुझाव और फसल स्कैनर का उपयोग करने में\n\nआज आपको किस चीज़ में मदद चाहिए?`,
            customer: (name) => `👋 वापसी पर स्वागत है, **${name}**! 🛒\n\nएक ग्राहक के रूप में, मैं आपकी मदद कर सकता हूँ:\n• ताजी स्थानीय उपज खोजने में\n• ऑर्डर देने और ट्रैक करने में\n• अपना कार्ट और विशलिस्ट प्रबंधित करने में\n• किसानों के साथ चैट करने में\n\nमैं आपकी क्या मदद कर सकता हूँ?`,
            admin: (name) => `👋 स्वागत है, **${name}**! 👑\n\nएक एडमिन के रूप में, मैं आपकी मदद कर सकता हूँ:\n• उपयोगकर्ताओं और किसानों को प्रबंधित करने में\n• सत्यापनों की समीक्षा करने में\n• प्लेटफ़ॉर्म आँकड़े और रिपोर्ट देखने में\n\nआपको क्या चाहिए?`,
            guest: () => `👋 नमस्ते! **FarmLink** में आपका स्वागत है! 🌱\n\nमैं आपका AI सहायक हूँ। मैं आपकी मदद कर सकता हूँ:\n• प्लेटफ़ॉर्म के बारे में जानने में\n• ताजी उपज ब्राउज़ करने में\n• किसान या ग्राहक के रूप में रजिस्टर करने में\n• यह समझने में कि ऑर्डर और भुगतान कैसे काम करते हैं\n\nआप क्या जानना चाहेंगे?`,
        },
        mr: {
            farmer: (name) => `👋 तुमचे स्वागत आहे, **${name}**! 🌾\n\nशेतकरी म्हणून, मी तुम्हाला यात मदत करू शकतो:\n• उत्पादने सूचीबद्ध करणे किंवा व्यवस्थापित करणे\n• ग्राहकांच्या ऑर्डर्स ट्रॅक करणे\n• ट्रस्ट बॅजसाठी सत्यापित होणे\n• AI किंमत सुचवा आणि पीक स्कॅनर वापरणे\n\nआज तुम्हाला कशात मदत हवी आहे?`,
            customer: (name) => `👋 तुमचे स्वागत आहे, **${name}**! 🛒\n\nग्राहक म्हणून, मी तुम्हाला यात मदत करू शकतो:\n• ताजी स्थानिक उत्पादने शोधणे\n• ऑर्डर्स देणे आणि ट्रॅक करणे\n• तुमचे कार्ट आणि विशलिस्ट व्यवस्थापित करणे\n• शेतकऱ्यांसोबत चॅट करणे\n\nमी तुम्हाला कशात मदत करू शकतो?`,
            admin: (name) => `👋 स्वागत आहे, **${name}**! 👑\n\nॲडमिन म्हणून, मी तुम्हाला हे समजण्यास मदत करू शकतो:\n• वापरकर्ते आणि शेतकरी व्यवस्थापित करणे\n• पडताळणीचे पुनरावलोकन करणे\n• प्लॅटफॉर्म आकडेवारी आणि अहवाल\n\nतुम्हाला काय हवे आहे?`,
            guest: () => `👋 नमस्कार! **FarmLink** मध्ये तुमचे स्वागत आहे! 🌱\n\nमी तुमचा AI सहाय्यक आहे. मी तुम्हाला यात मदत करू शकतो:\n• प्लॅटफॉर्मबद्दल माहिती मिळवणे\n• ताजी उत्पादने ब्राउझ करणे\n• शेतकरी किंवा ग्राहक म्हणून नोंदणी करणे\n• ऑर्डर्स आणि पेमेंट्स कसे काम करतात हे समजून घेणे\n\nतुम्हाला काय जाणून घ्यायचे आहे?`,
        }
    };
    return data[lang] || data['en'];
};

// ─── Quick Reply Suggestions (Global) ───────────────────────────────────────
export const getGlobalQuickReplies = (lang = 'en') => {
    const data = {
        en: [
            'What is FarmLink?',
            'How do I place an order?',
            'How do I list a product?',
            'Track my order',
            'Payment options',
            'Contact support',
        ],
        hi: [
            'FarmLink क्या है?',
            'ऑर्डर कैसे दें?',
            'उत्पाद कैसे जोड़ें?',
            'ऑर्डर ट्रैक करें',
            'भुगतान विकल्प',
            'समर्थन से संपर्क करें',
        ],
        mr: [
            'FarmLink काय आहे?',
            'ऑर्डर कशी द्यायची?',
            'उत्पादन कसे जोडायचे?',
            'ऑर्डर ट्रॅक करा',
            'पेमेंट पर्याय',
            'सपोर्टशी संपर्क साधा',
        ]
    };
    return data[lang] || data['en'];
};

// ─── Main Resolver ───────────────────────────────────────────────────────────
export const resolveResponse = (userInput, lang = 'en') => {
    const fallback = getFallbackResponse(lang);
    if (!userInput || !userInput.trim()) return fallback;

    const kb = getKB(lang);
    for (const entry of kb) {
        if (matches(userInput, entry.patterns)) {
            return {
                response: entry.response(userInput),
                quickReplies: entry.quickReplies || getGlobalQuickReplies(lang),
            };
        }
    }

    return {
        response: fallback.response(userInput),
        quickReplies: fallback.quickReplies,
    };
};
