const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(new RegExp(search, 'g'), replace);
    }
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

// Update FarmerDashboard.jsx
const farmerReplacements = [
    ['> My Store<', '> {t(\'myStore\')}<'],
    ['> Post a Story<', '> {t(\'postStory\')}<'],
    ['Verification Pending', '{t(\'verificationPendingProfile\')}'],
    ['Unverified Profile', '{t(\'unverifiedProfile\')}'],
    ['Your documents are currently under review by our team. This usually takes 1-2 business days.', '{t(\'verificationPendingDesc\')}'],
    ['Upload your official documents to get verified and build trust with customers.', '{t(\'uploadDocsDesc\')}'],
    ['>Messages<', '>{t(\'messages\')}<'],
    ['>Financials ', '>{t(\'financials\')} '],
    ['>Weather & Forecast<', '>{t(\'weatherForecast\')}<'],
    ['>Chat with Customer<', '>{t(\'chatWithCustomer\')}<'],
    ['>No messages yet<', '>{t(\'noMessagesYet\')}<'],
    ['>When customers ask about your products, they\\\'ll appear here.<', '>{t(\'messagesDesc\')}<'],
    ['title="Delete Conversation"', 'title={t(\'deleteConversation\')}'],
    ['>Temperature<', '>{t(\'temperature\')}<'],
    ['>Ideal for most vegetables<', '>{t(\'tempTip\')}<'],
    ['>Rainfall<', '>{t(\'rainfall\')}<'],
    ['>Low chance of rain today<', '>{t(\'rainTip\')}<'],
    ['>Wind Speed<', '>{t(\'windSpeed\')}<'],
    ['>Calm conditions<', '>{t(\'windTip\')}<'],
    ['>This Week\\\'s Farming Tip<', '>{t(\'farmingTipTitle\')}<'],
    ['>Good conditions for spring planting. Soil moisture levels are optimal. Consider planting leafy greens and root vegetables. Mulching is recommended to retain moisture during the expected dry spell next week.<', '>{t(\'farmingTipDesc\')}<'],
    ['>Total Earnings<', '>{t(\'totalEarnings\')}<'],
    ['>Total Expenses<', '>{t(\'totalExpenses\')}<'],
    ['>Net Profit<', '>{t(\'netProfit\')}<'],
    ['>Crop-wise Profit<', '>{t(\'cropWiseProfit\')}<'],
    ['>No data available.<', '>{t(\'noDataAvailable\')}<'],
    ['>Rev<', '>{t(\'rev\')}<'],
    ['>Exp<', '>{t(\'exp\')}<'],
    ['>Expense Tracking<', '>{t(\'expenseTracking\')}<'],
    ['>Add<', '>{t(\'add\')}<'],
    ['>No expenses recorded yet.<', '>{t(\'noExpensesYet\')}<'],
    ['>Product Fresh For \\(Days\\)<', '>{t(\'productFreshFor\')}<']
];

replaceInFile('src/pages/dashboards/FarmerDashboard.jsx', farmerReplacements);

// Update CustomerDashboard.jsx
const customerReplacements = [
    ['> All Orders ', '> {t(\'allOrders\')} '],
    ['> Spending Breakdown<', '> {t(\'spendingBreakdown\')}<'],
    ['>Total Spent<', '>{t(\'totalSpent\')}<'],
    [' valid orders placed<', ' {t(\'validOrdersPlaced\')}<'],
    ['>No spending yet<', '>{t(\'noSpendingYet\')}<'],
    ['> Delivered Orders ', '> {t(\'deliveredOrders\')} '],
    ['>No delivered orders yet<', '>{t(\'noDeliveredOrdersYet\')}<'],
    ['> My Messages<', '> {t(\'myMessages\')}<'],
    ['>Find Farmers<', '>{t(\'findFarmers\')}<'],
    ['> Saved Reels ', '> {t(\'savedReels\')} '],
    ['>No saved reels yet<', '>{t(\'noSavedReelsYet\')}<'],
    ['>Watch Stories<', '>{t(\'watchStories\')}<'],
    ['> Following \\(', '> {t(\'following\')} \\('],
    ['>You aren\\\'t following any farmers yet<', '>{t(\'notFollowingFarmers\')}<'],
    ['>Browse Farmers<', '>{t(\'browseFarmers\')}<'],
    ['>Recent Orders<', '>{t(\'recentOrders\')}<'],
    ['>View all \\$\\{orders\\.length\\} orders<', '>{t(\'viewAllOrders\')}<'],
    ['>Tap to view details →<', '>{t(\'tapToViewDetails\')}<'],
    ['>Tap to view full details →<', '>{t(\'tapToViewDetails\')}<'],
    ['Back to Dashboard', '{t(\'backToDashboard\')}']
];

replaceInFile('src/pages/dashboards/CustomerDashboard.jsx', customerReplacements);
