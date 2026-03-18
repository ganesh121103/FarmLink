import React from 'react';
import { BackButton } from '../components/ui/BackButton';

export const PrivacyView = ({ BackBtn }) => (
    <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
        <BackBtn />
        <h1 className="text-4xl font-black text-black dark:text-white mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-slate-300 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 p-8 space-y-6">
                <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">1. Information We Collect</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">We collect information you provide directly to us, such as when you create an account, list a product, or contact us. This includes name, email address, phone number, address, and any documents for farmer verification.</p></div>
                <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">2. How We Use Your Information</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">We use your information to provide and improve our services, process transactions, send notifications, and ensure platform safety. We do not sell your personal data to third parties.</p></div>
                <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">3. Data Security</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">We implement industry-standard security measures including encryption in transit (HTTPS) and at rest. Passwords are hashed using bcrypt. Access tokens (JWT) expire regularly to ensure session security.</p></div>
                <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">4. Your Rights</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">You have the right to access, update, or delete your personal information at any time. You can do this through your profile settings or by contacting us at privacy@farmlink.in.</p></div>
                <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">5. Contact</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">For any privacy concerns, please contact us at privacy@farmlink.in.</p></div>
            </div>
        </div>
    </div>
);

export const TermsView = ({ BackBtn }) => (
    <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
        <BackBtn />
        <h1 className="text-4xl font-black text-black dark:text-white mb-8">Terms of Service</h1>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 p-8 space-y-6">
            <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">1. Acceptance of Terms</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">By accessing and using FarmLink, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p></div>
            <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">2. User Accounts</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information during registration.</p></div>
            <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">3. Farmer Responsibilities</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">Farmers must provide accurate product descriptions, maintain stock information, and ensure produce quality matches listed descriptions. Fraudulent listings will result in immediate account termination.</p></div>
            <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">4. Payments</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">All payments are processed securely. FarmLink is not responsible for any issues arising from payment gateway failures. Cash on Delivery is offered as an alternative payment method.</p></div>
            <div><h2 className="text-xl font-bold text-black dark:text-white mb-3">5. Limitation of Liability</h2><p className="leading-relaxed text-stone-600 dark:text-slate-400">FarmLink is a B.Tech student project provided "as is" for educational purposes. We are not liable for any direct or indirect damages arising from your use of the platform.</p></div>
        </div>
    </div>
);
