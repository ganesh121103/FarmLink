const fs = require('fs');
let file = fs.readFileSync('src/constants/index.js', 'utf8');

const additionalEn = {
    myStore: 'My Store', postStory: 'Post a Story', verificationPendingProfile: 'Verification Pending',
    unverifiedProfile: 'Unverified Profile', verificationPendingDesc: 'Your documents are currently under review by our team. This usually takes 1-2 business days.',
    uploadDocsDesc: 'Upload your official documents to get verified and build trust with customers.',
    messages: 'Messages', financials: 'Financials', weatherForecast: 'Weather & Forecast',
    chatWithCustomer: 'Chat with Customer', noMessagesYet: 'No messages yet', messagesDesc: 'When customers ask about your products, they\'ll appear here.',
    deleteConversation: 'Delete Conversation', temperature: 'Temperature', tempTip: 'Ideal for most vegetables',
    rainfall: 'Rainfall', rainTip: 'Low chance of rain today', windSpeed: 'Wind Speed', windTip: 'Calm conditions',
    farmingTipTitle: 'This Week\'s Farming Tip', farmingTipDesc: 'Good conditions for spring planting. Soil moisture levels are optimal. Consider planting leafy greens and root vegetables. Mulching is recommended to retain moisture during the expected dry spell next week.',
    totalEarnings: 'Total Earnings', totalExpenses: 'Total Expenses', netProfit: 'Net Profit', cropWiseProfit: 'Crop-wise Profit',
    noDataAvailable: 'No data available.', rev: 'Rev', exp: 'Exp', expenseTracking: 'Expense Tracking', add: 'Add',
    noExpensesYet: 'No expenses recorded yet.', productFreshFor: 'Product Fresh For (Days)', allOrders: 'All Orders',
    spendingBreakdown: 'Spending Breakdown', totalSpent: 'Total Spent', validOrdersPlaced: 'valid orders placed',
    noSpendingYet: 'No spending yet', deliveredOrders: 'Delivered Orders', noDeliveredOrdersYet: 'No delivered orders yet',
    myMessages: 'My Messages', findFarmers: 'Find Farmers', savedReels: 'Saved Reels', noSavedReelsYet: 'No saved reels yet',
    watchStories: 'Watch Stories', following: 'Following', notFollowingFarmers: 'You aren\'t following any farmers yet',
    browseFarmers: 'Browse Farmers', recentOrders: 'Recent Orders', viewAllOrders: 'View all orders',
    tapToViewDetails: 'Tap to view details →', backToDashboard: 'Back to Dashboard', autoDeletedSoon: 'Auto-deleted soon',
    deletesOn: 'Deletes on', expiresToday: 'Expires today!', daysLeft: 'days left', expired: 'Expired',
    viewAllOrdersTemplate: 'View all {count} orders', myCrop: 'My Crop Disease'
};

const additionalHi = {
    myStore: 'मेरा स्टोर', postStory: 'स्टोरी पोस्ट करें', verificationPendingProfile: 'सत्यापन लंबित',
    unverifiedProfile: 'असत्यापित प्रोफ़ाइल', verificationPendingDesc: 'आपके दस्तावेज़ वर्तमान में हमारी टीम द्वारा समीक्षाधीन हैं। इसमें आमतौर पर 1-2 कार्यदिवस लगते हैं।',
    uploadDocsDesc: 'सत्यापित होने और ग्राहकों का विश्वास बनाने के लिए अपने आधिकारिक दस्तावेज़ अपलोड करें।',
    messages: 'संदेश', financials: 'वित्तीय', weatherForecast: 'मौसम और पूर्वानुमान',
    chatWithCustomer: 'ग्राहक से चैट करें', noMessagesYet: 'अभी तक कोई संदेश नहीं', messagesDesc: 'जब ग्राहक आपके उत्पादों के बारे में पूछेंगे, तो वे यहाँ दिखाई देंगे।',
    deleteConversation: 'बातचीत हटाएं', temperature: 'तापमान', tempTip: 'अधिकांश सब्जियों के लिए आदर्श',
    rainfall: 'वर्षा', rainTip: 'आज बारिश की संभावना कम है', windSpeed: 'हवा की गति', windTip: 'शांत स्थिति',
    farmingTipTitle: 'इस सप्ताह की कृषि टिप', farmingTipDesc: 'वसंत की बुवाई के लिए अच्छी स्थिति। मिट्टी में नमी का स्तर इष्टतम है। पत्तेदार साग और जड़ वाली सब्जियां लगाने पर विचार करें।',
    totalEarnings: 'कुल कमाई', totalExpenses: 'कुल खर्च', netProfit: 'शुद्ध लाभ', cropWiseProfit: 'फसल-वार लाभ',
    noDataAvailable: 'कोई डेटा उपलब्ध नहीं।', rev: 'राजस्व', exp: 'खर्च', expenseTracking: 'खर्च ट्रैकिंग', add: 'जोड़ें',
    noExpensesYet: 'अभी तक कोई खर्च दर्ज नहीं किया गया है।', productFreshFor: 'उत्पाद ताज़ा (दिनों के लिए)', allOrders: 'सभी ऑर्डर',
    spendingBreakdown: 'खर्च का विवरण', totalSpent: 'कुल खर्च', validOrdersPlaced: 'वैध ऑर्डर दिए गए',
    noSpendingYet: 'अभी तक कोई खर्च नहीं', deliveredOrders: 'वितरित ऑर्डर', noDeliveredOrdersYet: 'अभी तक कोई वितरित ऑर्डर नहीं',
    myMessages: 'मेरे संदेश', findFarmers: 'किसान खोजें', savedReels: 'सहेजे गए रील्स', noSavedReelsYet: 'अभी तक कोई सहेजी गई रील्स नहीं',
    watchStories: 'कहानियां देखें', following: 'अनुसरण कर रहे हैं', notFollowingFarmers: 'आप अभी तक किसी किसान का अनुसरण नहीं कर रहे हैं',
    browseFarmers: 'किसान ब्राउज़ करें', recentOrders: 'हाल के ऑर्डर', viewAllOrders: 'सभी ऑर्डर देखें',
    tapToViewDetails: 'विवरण देखने के लिए टैप करें →', backToDashboard: 'डैशबोर्ड पर वापस जाएं', autoDeletedSoon: 'जल्द ही स्वतः हटा दिया जाएगा',
    deletesOn: 'हटा दिया जाएगा', expiresToday: 'आज समाप्त हो रहा है!', daysLeft: 'दिन शेष', expired: 'समाप्त हो गया',
    viewAllOrdersTemplate: 'सभी {count} ऑर्डर देखें', myCrop: 'मेरा फसल रोग'
};

const additionalMr = {
    myStore: 'माझे स्टोअर', postStory: 'स्टोरी पोस्ट करा', verificationPendingProfile: 'सत्यापन प्रलंबित',
    unverifiedProfile: 'असत्यापित प्रोफाइल', verificationPendingDesc: 'तुमची कागदपत्रे सध्या आमच्या टीमद्वारे तपासली जात आहेत. यासाठी साधारणपणे 1-2 कामाचे दिवस लागतात.',
    uploadDocsDesc: 'सत्यापित होण्यासाठी आणि ग्राहकांचा विश्वास मिळवण्यासाठी तुमची अधिकृत कागदपत्रे अपलोड करा.',
    messages: 'संदेश', financials: 'आर्थिक', weatherForecast: 'हवामान आणि अंदाज',
    chatWithCustomer: 'ग्राहकाशी चॅट करा', noMessagesYet: 'अद्याप कोणतेही संदेश नाहीत', messagesDesc: 'जेव्हा ग्राहक तुमच्या उत्पादनांबद्दल विचारतील, तेव्हा ते येथे दिसतील.',
    deleteConversation: 'संभाषण हटवा', temperature: 'तापमान', tempTip: 'बहुतेक भाज्यांसाठी आदर्श',
    rainfall: 'पाऊस', rainTip: 'आज पावसाची शक्यता कमी', windSpeed: 'वाऱ्याचा वेग', windTip: 'शांत परिस्थिती',
    farmingTipTitle: 'या आठवड्याची शेती टिप', farmingTipDesc: 'वसंत ऋतूतील पेरणीसाठी चांगली परिस्थिती. मातीतील ओलावा इष्टतम आहे. पालेभाज्या आणि मुळे असलेल्या भाज्या लावण्याचा विचार करा.',
    totalEarnings: 'एकूण कमाई', totalExpenses: 'एकूण खर्च', netProfit: 'निव्वळ नफा', cropWiseProfit: 'पीकनिहाय नफा',
    noDataAvailable: 'कोणताही डेटा उपलब्ध नाही.', rev: 'उत्पन्न', exp: 'खर्च', expenseTracking: 'खर्च ट्रॅकिंग', add: 'जोडा',
    noExpensesYet: 'अद्याप कोणताही खर्च नोंदवलेला नाही.', productFreshFor: 'उत्पादन ताजे राहते (दिवस)', allOrders: 'सर्व ऑर्डर',
    spendingBreakdown: 'खर्चाचा तपशील', totalSpent: 'एकूण खर्च', validOrdersPlaced: 'वैध ऑर्डर दिल्या',
    noSpendingYet: 'अद्याप कोणताही खर्च नाही', deliveredOrders: 'वितरित ऑर्डर', noDeliveredOrdersYet: 'अद्याप कोणतीही ऑर्डर वितरित केलेली नाही',
    myMessages: 'माझे संदेश', findFarmers: 'शेतकरी शोधा', savedReels: 'सेव्ह केलेले रील्स', noSavedReelsYet: 'अद्याप कोणतेही सेव्ह केलेले रील्स नाहीत',
    watchStories: 'कथा पहा', following: 'फॉलो करत आहात', notFollowingFarmers: 'तुम्ही अद्याप कोणत्याही शेतकऱ्याला फॉलो करत नाही आहात',
    browseFarmers: 'शेतकरी ब्राउझ करा', recentOrders: 'नुकत्याच झालेल्या ऑर्डर्स', viewAllOrders: 'सर्व ऑर्डर पहा',
    tapToViewDetails: 'तपशील पाहण्यासाठी टॅप करा →', backToDashboard: 'डॅशबोर्डवर परत जा', autoDeletedSoon: 'लवकरच स्वयंचलितपणे काढले जाईल',
    deletesOn: 'या तारखेला काढले जाईल', expiresToday: 'आज संपत आहे!', daysLeft: 'दिवस उरले', expired: 'कालबाह्य',
    viewAllOrdersTemplate: 'सर्व {count} ऑर्डर्स पहा', myCrop: 'माझे पीक रोग'
};

const serializeObj = (obj) => {
    let str = '';
    for(let k in obj) {
        str += '        ' + k + ': ' + JSON.stringify(obj[k]) + ',\n';
    }
    return str;
};

file = file.replace(/approve: "Approve", reject: "Reject"\n    },/g, 
    "approve: \"Approve\", reject: \"Reject\",\n" + serializeObj(additionalEn) + "    },");
file = file.replace(/approve: "स्वीकृत करें", reject: "अस्वीकार करें"\n    },/g, 
    "approve: \"स्वीकृत करें\", reject: \"अस्वीकार करें\",\n" + serializeObj(additionalHi) + "    },");
file = file.replace(/approve: "मंजूर करा", reject: "नाकारा"\n    }\n};/g, 
    "approve: \"मंजूर करा\", reject: \"नाकारा\",\n" + serializeObj(additionalMr) + "    }\n};");

fs.writeFileSync('src/constants/index.js', file);
console.log('Constants updated');
