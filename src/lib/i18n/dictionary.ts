export type Locale = "en" | "te";

export const LOCALE_COOKIE = "lang";

type Dictionary = {
  header: {
    admin: string;
    myBookings: string;
    login: string;
  };
  home: {
    badge: (town: string) => string;
    heroLine1: string;
    heroLine2: string;
    subtitle: (siteName: string, towns: string) => string;
    browseCta: (town: string) => string;
    statTowns: string;
    statVehicles: string;
    statPayAtPickup: string;
    readyToRide: string;
    availableNow: (town: string) => string;
    viewAll: string;
    viewAllVehicles: string;
    whyChooseUs: string;
    whySiteName: (siteName: string) => string;
    features: { title: string; body: string }[];
    coverage: string;
    whereWeOperate: string;
  };
  listing: {
    comingSoon: string;
    comingSoonBody: (town: string) => string;
    notifyMe: (town: string) => string;
    available: (count: number) => string;
    vehiclesIn: (town: string) => string;
    typeAll: string;
    typeBikes: string;
    typeCars: string;
    empty: string;
  };
  vehicleCard: {
    perDay: string;
    cheaperLongTerm: string;
  };
  vehicleDetail: {
    perDay: string;
    longerYouRent: string;
    requestThisBooking: string;
    policyLink: string;
    or: string;
    daysWord: string;
  };
  calendar: {
    prevMonth: string;
    nextMonth: string;
    legendBooked: string;
    helperText: string;
  };
  bookingForm: {
    startDate: string;
    endDate: string;
    selectDatesError: string;
    estimateDays: (days: number, rate: number) => string;
    estimateTotal: (total: string) => string;
    yourName: string;
    phoneNumber: string;
    phonePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    payAtPickupNote: string;
  };
  login: {
    title: string;
    subtitle: string;
    phoneNumber: string;
    phonePlaceholder: string;
    sendCode: string;
    sendingCode: string;
    enterCode: (phone: string) => string;
    verify: string;
    verifying: string;
    changePhone: string;
  };
  footer: {
    blurb: string;
    whereWeOperate: string;
    company: string;
    aboutPolicies: string;
    account: string;
    myBookings: string;
    login: string;
    copyright: (year: number, siteName: string) => string;
  };
  about: {
    badge: string;
    title: string;
    subtitle: (siteName: string) => string;
    howItWorks: string;
    steps: { title: string; body: string }[];
    policyTitle: string;
    policies: { title: string; body: string }[];
    questionsTitle: string;
    questionsBody: (towns: string) => string;
    chatCta: string;
  };
};

const en: Dictionary = {
  header: {
    admin: "Admin",
    myBookings: "My Bookings",
    login: "Login",
  },
  home: {
    badge: (town) => `Now open in ${town} · more towns coming soon`,
    heroLine1: "Bike & car rentals,",
    heroLine2: "now in your own town",
    subtitle: (siteName, towns) =>
      `${siteName} brings organized vehicle rentals to ${towns} — no more depending on the city for a bike or car.`,
    browseCta: (town) => `Browse vehicles in ${town}`,
    statTowns: "towns served",
    statVehicles: "vehicles ready",
    statPayAtPickup: "pay at pickup",
    readyToRide: "Ready to ride",
    availableNow: (town) => `Available now in ${town}`,
    viewAll: "View all →",
    viewAllVehicles: "View all vehicles →",
    whyChooseUs: "Why choose us",
    whySiteName: (siteName) => `Why ${siteName}?`,
    features: [
      {
        title: "Doorstep delivery",
        body: "We drop the bike or car at your home, hostel, or hotel — no need to travel to a pickup point.",
      },
      {
        title: "Pay at pickup",
        body: "Book online, pay the deposit and rent in cash or UPI when you collect the vehicle.",
      },
      {
        title: "Book on WhatsApp",
        body: "Prefer to talk it through? Message us directly and we'll confirm your booking there.",
      },
      {
        title: "Local, verified vehicles",
        body: "Every vehicle is checked and verified in your own town before it's listed.",
      },
    ],
    coverage: "Coverage",
    whereWeOperate: "Where we operate",
  },
  listing: {
    comingSoon: "Coming soon",
    comingSoonBody: (town) =>
      `We're not live in ${town} yet, but we're expanding fast. Message us on WhatsApp and we'll notify you the moment vehicles are available.`,
    notifyMe: (town) => `Notify me for ${town}`,
    available: (count) => `${count} available`,
    vehiclesIn: (town) => `Vehicles in ${town}`,
    typeAll: "All",
    typeBikes: "Bikes",
    typeCars: "Cars",
    empty: "No vehicles available right now. Check back soon or message us on WhatsApp.",
  },
  vehicleCard: {
    perDay: "/ day",
    cheaperLongTerm: "Cheaper for longer rentals",
  },
  vehicleDetail: {
    perDay: "/ day",
    longerYouRent: "Longer you rent, less you pay",
    requestThisBooking: "Request this booking",
    policyLink: "Booking & deposit policy →",
    or: "or",
    daysWord: "days",
  },
  calendar: {
    prevMonth: "Previous month",
    nextMonth: "Next month",
    legendBooked: "Booked",
    helperText: "Tap a start date, then an end date.",
  },
  bookingForm: {
    startDate: "Start date",
    endDate: "End date",
    selectDatesError: "Please select your start and end date.",
    estimateDays: (days, rate) => `${days} day${days > 1 ? "s" : ""} · ₹${rate}/day`,
    estimateTotal: (total) => `≈ ₹${total} estimated`,
    yourName: "Your name",
    phoneNumber: "Phone number",
    phonePlaceholder: "10-digit mobile number",
    submit: "Request Booking",
    submitting: "Sending request…",
    successTitle: "Booking request sent!",
    successBody:
      "We'll call you shortly to confirm. You can pay the deposit and rent at pickup.",
    payAtPickupNote: "No payment now — pay the deposit and rent in cash or UPI at pickup.",
  },
  login: {
    title: "Log in",
    subtitle: "We'll text you a one-time code — no password needed.",
    phoneNumber: "Phone number",
    phonePlaceholder: "10-digit mobile number",
    sendCode: "Send code",
    sendingCode: "Sending code…",
    enterCode: (phone) => `Enter the 6-digit code sent to +91${phone}`,
    verify: "Verify & log in",
    verifying: "Verifying…",
    changePhone: "Change phone number",
  },
  footer: {
    blurb:
      "Organized bike & car rentals for towns the big platforms skip. Doorstep delivery, pay at pickup, book on WhatsApp.",
    whereWeOperate: "Where we operate",
    company: "Company",
    aboutPolicies: "About & policies",
    account: "Account",
    myBookings: "My Bookings",
    login: "Login",
    copyright: (year, siteName) => `© ${year} ${siteName}. All rights reserved.`,
  },
  about: {
    badge: "About & policies",
    title: "Straightforward rentals, no surprises",
    subtitle: (siteName) =>
      `${siteName} brings organized, verified bike & car rentals to towns that the big city platforms skip. Here's exactly how it works.`,
    howItWorks: "How booking works",
    steps: [
      {
        title: "Browse & pick dates",
        body: "Choose your town, pick a bike or car, and select your rental dates. We'll show you the price upfront, including long-term discounts.",
      },
      {
        title: "Request your booking",
        body: "Submit your name and phone number — no payment needed online. We call to confirm within a few hours.",
      },
      {
        title: "Pick up & pay",
        body: "Bring your documents, pay the deposit and rent in cash or UPI, and ride off.",
      },
    ],
    policyTitle: "Booking & deposit policy",
    policies: [
      {
        title: "Documents required",
        body: "A valid original Driving Licence is required for every rental. We also accept your Aadhaar card as a secondary ID. Photocopies alone aren't accepted at pickup.",
      },
      {
        title: "Security deposit & payment",
        body: "A refundable security deposit is collected at pickup, along with the rental amount — both payable in cash or UPI. ₹1,000 for bikes, ₹5,000 for cars.",
      },
      {
        title: "Damage & fuel policy",
        body: "Vehicles are handed over with a noted fuel level and a quick joint inspection — please return it in the same condition and fuel level. Any damage beyond normal wear is deducted from the deposit.",
      },
      {
        title: "Cancellation policy",
        body: "Free cancellation any time before pickup — just message us on WhatsApp or call. No cancellation fee.",
      },
    ],
    questionsTitle: "Still have questions?",
    questionsBody: (towns) => `We're on WhatsApp and serve ${towns}. Message us any time.`,
    chatCta: "Chat with us on WhatsApp",
  },
};

const te: Dictionary = {
  header: {
    admin: "అడ్మిన్",
    myBookings: "నా బుకింగ్‌లు",
    login: "లాగిన్",
  },
  home: {
    badge: (town) => `ఇప్పుడు ${town}‌లో అందుబాటులో · మరిన్ని పట్టణాలు త్వరలో`,
    heroLine1: "బైక్ & కార్ అద్దెలు,",
    heroLine2: "ఇప్పుడు మీ సొంత టౌన్‌లో",
    subtitle: (siteName, towns) =>
      `${siteName} ${towns} పట్టణాలకు వ్యవస్థీకృత వాహన అద్దె సేవలు అందిస్తోంది — బైక్ లేదా కారు కోసం ఇక సిటీ మీద ఆధారపడాల్సిన అవసరం లేదు.`,
    browseCta: (town) => `${town}‌లో వాహనాలు చూడండి`,
    statTowns: "పట్టణాలు",
    statVehicles: "వాహనాలు సిద్ధం",
    statPayAtPickup: "పికప్‌లో చెల్లింపు",
    readyToRide: "సవారీకి సిద్ధం",
    availableNow: (town) => `${town}‌లో ఇప్పుడు అందుబాటులో`,
    viewAll: "అన్నీ చూడండి →",
    viewAllVehicles: "అన్ని వాహనాలు చూడండి →",
    whyChooseUs: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
    whySiteName: (siteName) => `${siteName} ఎందుకు?`,
    features: [
      {
        title: "డోర్‌స్టెప్ డెలివరీ",
        body: "మీ ఇల్లు, హాస్టల్ లేదా హోటల్‌కే బైక్ లేదా కారు తీసుకొస్తాం — పికప్ పాయింట్‌కు వెళ్లాల్సిన అవసరం లేదు.",
      },
      {
        title: "పికప్‌లో చెల్లింపు",
        body: "ఆన్‌లైన్‌లో బుక్ చేయండి, వాహనం తీసుకునేటప్పుడు డిపాజిట్ మరియు అద్దె నగదు లేదా UPI ద్వారా చెల్లించండి.",
      },
      {
        title: "వాట్సాప్‌లో బుక్ చేయండి",
        body: "మాట్లాడి బుక్ చేయాలనుకుంటున్నారా? నేరుగా మాకు మెసేజ్ చేయండి, అక్కడే బుకింగ్ కన్ఫర్మ్ చేస్తాం.",
      },
      {
        title: "స్థానిక, ధృవీకరించిన వాహనాలు",
        body: "ప్రతి వాహనం మీ టౌన్‌లోనే లిస్ట్ చేయడానికి ముందు తనిఖీ చేసి ధృవీకరిస్తాం.",
      },
    ],
    coverage: "కవరేజ్",
    whereWeOperate: "మేము ఎక్కడ అందుబాటులో ఉన్నాం",
  },
  listing: {
    comingSoon: "త్వరలో వస్తోంది",
    comingSoonBody: (town) =>
      `మేము ఇంకా ${town}‌లో అందుబాటులో లేము, కానీ వేగంగా విస్తరిస్తున్నాం. వాట్సాప్‌లో మెసేజ్ చేయండి, వాహనాలు అందుబాటులోకి రాగానే మీకు తెలియజేస్తాం.`,
    notifyMe: (town) => `${town} కోసం తెలియజేయండి`,
    available: (count) => `${count} అందుబాటులో ఉన్నాయి`,
    vehiclesIn: (town) => `${town}‌లో వాహనాలు`,
    typeAll: "అన్నీ",
    typeBikes: "బైక్‌లు",
    typeCars: "కార్లు",
    empty: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు. త్వరలో మళ్లీ చూడండి లేదా వాట్సాప్‌లో మమ్మల్ని సంప్రదించండి.",
  },
  vehicleCard: {
    perDay: "/ రోజుకు",
    cheaperLongTerm: "ఎక్కువ రోజులు తీసుకుంటే తక్కువ ధర",
  },
  vehicleDetail: {
    perDay: "/ రోజుకు",
    longerYouRent: "ఎంత ఎక్కువ రోజులు, అంత తక్కువ ధర",
    requestThisBooking: "ఈ బుకింగ్ కోరండి",
    policyLink: "బుకింగ్ & డిపాజిట్ పాలసీ →",
    or: "లేదా",
    daysWord: "రోజులు",
  },
  calendar: {
    prevMonth: "మునుపటి నెల",
    nextMonth: "తదుపరి నెల",
    legendBooked: "బుక్ చేయబడింది",
    helperText: "ప్రారంభ తేదీని నొక్కండి, తర్వాత ముగింపు తేదీని నొక్కండి.",
  },
  bookingForm: {
    startDate: "ప్రారంభ తేదీ",
    endDate: "ముగింపు తేదీ",
    selectDatesError: "దయచేసి మీ ప్రారంభ మరియు ముగింపు తేదీని ఎంచుకోండి.",
    estimateDays: (days, rate) => `${days} రోజులు · ₹${rate}/రోజుకు`,
    estimateTotal: (total) => `≈ ₹${total} అంచనా`,
    yourName: "మీ పేరు",
    phoneNumber: "ఫోన్ నంబర్",
    phonePlaceholder: "10-అంకెల మొబైల్ నంబర్",
    submit: "బుకింగ్ కోరండి",
    submitting: "పంపుతోంది…",
    successTitle: "బుకింగ్ అభ్యర్థన పంపబడింది!",
    successBody: "మేము త్వరలో కాల్ చేసి కన్ఫర్మ్ చేస్తాం. మీరు పికప్‌లో డిపాజిట్ మరియు అద్దె చెల్లించవచ్చు.",
    payAtPickupNote: "ఇప్పుడే చెల్లింపు అవసరం లేదు — పికప్‌లో నగదు లేదా UPI ద్వారా డిపాజిట్ మరియు అద్దె చెల్లించండి.",
  },
  login: {
    title: "లాగిన్",
    subtitle: "మేము మీకు వన్-టైమ్ కోడ్ పంపుతాం — పాస్‌వర్డ్ అవసరం లేదు.",
    phoneNumber: "ఫోన్ నంబర్",
    phonePlaceholder: "10-అంకెల మొబైల్ నంబర్",
    sendCode: "కోడ్ పంపండి",
    sendingCode: "పంపుతోంది…",
    enterCode: (phone) => `+91${phone}కు పంపిన 6-అంకెల కోడ్‌ను నమోదు చేయండి`,
    verify: "వెరిఫై చేసి లాగిన్ చేయండి",
    verifying: "వెరిఫై చేస్తోంది…",
    changePhone: "ఫోన్ నంబర్ మార్చండి",
  },
  footer: {
    blurb:
      "పెద్ద ప్లాట్‌ఫారమ్‌లు వదిలేసిన పట్టణాలకు వ్యవస్థీకృత బైక్ & కార్ అద్దెలు. డోర్‌స్టెప్ డెలివరీ, పికప్‌లో చెల్లింపు, వాట్సాప్‌లో బుకింగ్.",
    whereWeOperate: "మేము ఎక్కడ అందుబాటులో ఉన్నాం",
    company: "కంపెనీ",
    aboutPolicies: "గురించి & పాలసీలు",
    account: "ఖాతా",
    myBookings: "నా బుకింగ్‌లు",
    login: "లాగిన్",
    copyright: (year, siteName) => `© ${year} ${siteName}. అన్ని హక్కులు కలిగి ఉంది.`,
  },
  about: {
    badge: "గురించి & పాలసీలు",
    title: "సూటిగా అద్దె సేవలు, ఆశ్చర్యాలు లేవు",
    subtitle: (siteName) =>
      `${siteName} పెద్ద నగర ప్లాట్‌ఫారమ్‌లు వదిలేసిన పట్టణాలకు వ్యవస్థీకృత, ధృవీకరించిన బైక్ & కార్ అద్దె సేవలను అందిస్తుంది. ఇది ఎలా పనిచేస్తుందో ఇక్కడ ఉంది.`,
    howItWorks: "బుకింగ్ ఎలా పనిచేస్తుంది",
    steps: [
      {
        title: "బ్రౌజ్ చేసి తేదీలు ఎంచుకోండి",
        body: "మీ టౌన్ ఎంచుకోండి, బైక్ లేదా కారు ఎంచుకోండి, మీ అద్దె తేదీలను ఎంచుకోండి. దీర్ఘకాలిక తగ్గింపులతో సహా ధరను ముందుగానే చూపిస్తాం.",
      },
      {
        title: "మీ బుకింగ్‌ను కోరండి",
        body: "మీ పేరు మరియు ఫోన్ నంబర్ సమర్పించండి — ఆన్‌లైన్ చెల్లింపు అవసరం లేదు. కొన్ని గంటల్లో కన్ఫర్మ్ చేయడానికి కాల్ చేస్తాం.",
      },
      {
        title: "తీసుకెళ్లి చెల్లించండి",
        body: "మీ డాక్యుమెంట్లు తీసుకురండి, డిపాజిట్ మరియు అద్దెను నగదు లేదా UPI ద్వారా చెల్లించండి, తర్వాత రైడ్ చేయండి.",
      },
    ],
    policyTitle: "బుకింగ్ & డిపాజిట్ పాలసీ",
    policies: [
      {
        title: "అవసరమైన పత్రాలు",
        body: "ప్రతి అద్దెకు చెల్లుబాటు అయ్యే ఒరిజినల్ డ్రైవింగ్ లైసెన్స్ అవసరం. మేము ఆధార్ కార్డును సెకండరీ ఐడీగా కూడా అంగీకరిస్తాం. పికప్‌లో కేవలం ఫోటోకాపీలు అంగీకరించము.",
      },
      {
        title: "సెక్యూరిటీ డిపాజిట్ & చెల్లింపు",
        body: "పికప్ వద్ద రీఫండ్ చేయదగిన సెక్యూరిటీ డిపాజిట్‌తో పాటు అద్దె మొత్తం వసూలు చేస్తాం — రెండూ నగదు లేదా UPI ద్వారా చెల్లించవచ్చు. బైక్‌లకు ₹1,000, కార్లకు ₹5,000.",
      },
      {
        title: "డ్యామేజ్ & ఇంధన పాలసీ",
        body: "వాహనాన్ని ఇంధన స్థాయిని నమోదు చేసి, త్వరిత ఉమ్మడి తనిఖీతో అందజేస్తాం — దయచేసి అదే స్థితిలో మరియు ఇంధన స్థాయితో తిరిగి ఇవ్వండి. సాధారణ అరుగుదల కంటే ఎక్కువ డ్యామేజ్ డిపాజిట్ నుండి తీసివేయబడుతుంది.",
      },
      {
        title: "క్యాన్సలేషన్ పాలసీ",
        body: "పికప్‌కు ముందు ఎప్పుడైనా ఉచిత క్యాన్సలేషన్ — వాట్సాప్‌లో మెసేజ్ చేయండి లేదా కాల్ చేయండి. క్యాన్సలేషన్ ఫీజు లేదు.",
      },
    ],
    questionsTitle: "ఇంకా ప్రశ్నలు ఉన్నాయా?",
    questionsBody: (towns) => `మేము వాట్సాప్‌లో ఉన్నాం మరియు ${towns}‌లో సేవలు అందిస్తున్నాం. ఎప్పుడైనా మమ్మల్ని సంప్రదించండి.`,
    chatCta: "వాట్సాప్‌లో మాతో చాట్ చేయండి",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, te };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
