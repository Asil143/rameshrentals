// Customer-facing text for browsing, booking and booking status, in English
// and Telugu. Plugged into the main dictionary as `ui`.

type NextStep = { title: string; body: string };

export type UiText = {
  /** Locale tag for formatting dates and times. */
  dateLocale: string;

  // Vehicle cards and detail page
  available: string;
  deliveryOrPickup: string;
  deposit: (amount: string) => string;
  viewDetails: string;
  vehicle: string;
  vehicleType: { bike: string; car: string };
  modelYear: string;
  handover: string;
  refundableDeposit: string;
  pickupLocation: string;
  from: string;
  perDayShort: string;
  checkAvailability: string;
  totalForDays: (total: string, days: number) => string;
  seatsCount: (n: number) => string;
  kmIncluded: (km: number) => string;
  helmets: (n: number) => string;

  // Vehicle list filters
  search: string;
  fromDate: string;
  toDate: string;
  maxPrice: string;
  pricePerDayPlaceholder: string;
  seats: string;
  fuel: string;
  gear: string;
  sort: string;
  any: string;
  fuels: { petrol: string; diesel: string; electric: string; cng: string };
  gears: { manual: string; automatic: string; gearless: string };
  sorts: { priceAsc: string; priceDesc: string; newest: string };
  filter: string;
  reset: string;
  moreFilters: string;

  // Booking form
  availabilityLoading: string;
  dates: string;
  estimatedTotal: string;
  steps: [string, string, string];
  addressLabel: string;
  addressPlaceholder: string;
  deliveryFee: (amount: string) => string;
  pickupTime: string;
  returnTime: string;
  returnMethod: string;
  returnAtLocation: string;
  collectFromMe: (amount: string) => string;
  notes: string;
  optional: string;
  notesPlaceholder: string;

  // Booking summary, confirmation and status
  progress: { pending: string; confirmed: string; ready: string; picked_up: string; returned: string; completed: string };
  stepOf: (step: number, total: number) => string;
  bookingCancelled: string;
  town: string;
  pickup: string;
  return: string;
  deliveredToYou: string;
  atOurLocation: string;
  collectedFromYou: string;
  estimatedRent: string;
  payment: string;
  paymentStatus: { unpaid: string; part_paid: string; paid: string; refunded: string };
  advanceDue: (amount: string) => string;
  payAdvance: string;
  requestReceived: string;
  requestReceivedBody: string;
  yourReference: string;
  whatNext: string;
  nextSteps: [NextStep, NextStep, NextStep];
  questionsWhatsApp: string;
  checkStatusLater: string;
  browseMore: string;
  statusTitle: string;
  statusIntro: string;
  bookingReference: string;
  phonePlaceholder: string;
  phoneNumber: string;
  check: string;
  noMatch: string;
  noMatchHelp: string;
  askWhatsApp: string;
  messageWhatsApp: string;

  // My bookings
  browseVehicles: string;
  bookedAsGuest: string;
  invoice: string;
  changeDates: string;
  saveDates: string;
  datesUpdated: string;
  cancel: string;
  bookingCancelledShort: string;
  uploadDocument: string;
  uploading: string;
  uploadFailed: string;
  uploaded: string;

  // Home search
  pickupDate: string;
  returnDate: string;
  showAvailable: string;
  browseAll: string;
  returnBeforePickup: string;
  freeBetween: (from: string, to: string) => string;
  clearDates: string;

  // Home page
  whereNeedVehicle: string;
  realLocalFleet: string;
  cleanInspected: string;
  easyLocalTravel: string;
  comfortEveryTrip: string;
  simpleStartFinish: string;
  threeSteps: string;
  customerTrust: string;
  recentExperiences: string;
  localAccountable: string;
  seeRealCustomers: string;
  reviewsByGoogle: string;
  viewOnGoogle: string;
  leaveReview: string;

  // Rental hub (/concepts)
  hubLink: string;
  hubBadge: string;
  hubTitle: string;
  hubIntro: string;
  hubFeaturesTitle: string;
  hubFeatures: [NextStep, NextStep, NextStep, NextStep];
  hubPlanTitle: string;
  hubPlanNote: string;
  hubPlanBody: string;
  hubZones: { forecourt: string; bikes: string; handover: string; cars: string; wash: string; service: string; store: string; office: string; gate: string };
  hubCta: string;
  hubSiteTitle: string;
  hubSiteBody: string;
  hubRoad: (n: number) => string;
  hubHere: string;
  hubGate: string;
  hubWc: string;
  hubMetres: (n: number) => string;
  hubSiteAlt: string;
  hubVideoLabel: string;
  hubVideoCaption: string;

  // Header, 404
  menu: string;
  status: string;
  owner: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
};

export const uiEn: UiText = {
  dateLocale: "en-IN",
  available: "Available",
  deliveryOrPickup: "Delivery or pickup",
  deposit: (amount) => `${amount} deposit`,
  viewDetails: "View details",
  vehicle: "Vehicle",
  vehicleType: { bike: "Bike", car: "Car" },
  modelYear: "Model year",
  handover: "Handover",
  refundableDeposit: "Refundable deposit",
  pickupLocation: "Pickup location",
  from: "From",
  perDayShort: "/day",
  checkAvailability: "Check availability",
  totalForDays: (total, days) => `${total} for ${days} day${days === 1 ? "" : "s"}`,
  seatsCount: (n) => `${n} seats`,
  kmIncluded: (km) => `${km} km/day included`,
  helmets: (n) => `${n} helmet${n === 1 ? "" : "s"}`,

  search: "Search",
  fromDate: "From",
  toDate: "To",
  maxPrice: "Max price",
  pricePerDayPlaceholder: "₹/day",
  seats: "Seats",
  fuel: "Fuel",
  gear: "Gear",
  sort: "Sort",
  any: "Any",
  fuels: { petrol: "Petrol", diesel: "Diesel", electric: "Electric", cng: "CNG" },
  gears: { manual: "Manual", automatic: "Automatic", gearless: "Gearless" },
  sorts: { priceAsc: "Lowest price", priceDesc: "Highest price", newest: "Newest" },
  filter: "Filter",
  reset: "Reset",
  moreFilters: "More filters",

  availabilityLoading: "Availability is still loading. Please try again in a moment.",
  dates: "Dates",
  estimatedTotal: "Estimated total",
  steps: ["1 · Dates", "2 · Details", "3 · Confirm"],
  addressLabel: "Delivery / collection address",
  addressPlaceholder: "House, street, landmark and town",
  deliveryFee: (amount) => `Delivery fee: ${amount}`,
  pickupTime: "Pickup time",
  returnTime: "Return time",
  returnMethod: "Return method",
  returnAtLocation: "Return at location",
  collectFromMe: (amount) => `Collect from my address (+${amount})`,
  notes: "Notes",
  optional: "(optional)",
  notesPlaceholder: "Landmark, special request, or trip notes",

  progress: { pending: "Requested", confirmed: "Confirmed", ready: "Ready", picked_up: "Picked up", returned: "Returned", completed: "Completed" },
  stepOf: (step, total) => `Step ${step} of ${total}`,
  bookingCancelled: "This booking was cancelled.",
  town: "Town",
  pickup: "Pickup",
  return: "Return",
  deliveredToYou: "Delivered to your address",
  atOurLocation: "At our location",
  collectedFromYou: "Collected from your address",
  estimatedRent: "Estimated rent",
  payment: "Payment",
  paymentStatus: { unpaid: "Unpaid", part_paid: "Part paid", paid: "Paid", refunded: "Refunded" },
  advanceDue: (amount) => `Advance due ${amount}`,
  payAdvance: "Pay advance online",
  requestReceived: "Booking request received",
  requestReceivedBody: "Nothing to pay yet. Save your reference — you'll need it with your phone number to check the status.",
  yourReference: "Your reference",
  whatNext: "What happens next",
  nextSteps: [
    { title: "We confirm with you", body: "We call or WhatsApp you within a few hours to confirm the vehicle and handover time." },
    { title: "Bring your documents", body: "Your original driving licence and Aadhaar card. Photocopies alone aren't accepted." },
    { title: "Pay at handover", body: "Rent plus the refundable deposit, in cash or UPI. The deposit comes back when you return the vehicle." },
  ],
  questionsWhatsApp: "Questions? WhatsApp us",
  checkStatusLater: "Check status later",
  browseMore: "Browse more vehicles",
  statusTitle: "Check booking status",
  statusIntro: "Enter the reference from your confirmation and the phone number you booked with.",
  bookingReference: "Booking reference",
  phonePlaceholder: "10-digit mobile number",
  phoneNumber: "Phone number",
  check: "Check",
  noMatch: "No booking matched those details.",
  noMatchHelp: "Check the reference (it starts with RR-) and use the same phone number you booked with.",
  askWhatsApp: "Ask us on WhatsApp",
  messageWhatsApp: "Message us on WhatsApp",

  browseVehicles: "Browse vehicles",
  bookedAsGuest: "Booked without logging in? Check status",
  invoice: "Invoice / agreement",
  changeDates: "Change dates",
  saveDates: "Save dates",
  datesUpdated: "Dates updated.",
  cancel: "Cancel",
  bookingCancelledShort: "Booking cancelled.",
  uploadDocument: "Upload document",
  uploading: "Uploading…",
  uploadFailed: "Upload failed. Use JPG, PNG or PDF under 5 MB.",
  uploaded: "Document uploaded securely.",

  pickupDate: "Pickup date",
  returnDate: "Return date",
  showAvailable: "Show available vehicles",
  browseAll: "Browse all vehicles",
  returnBeforePickup: "The return date can't be before the pickup date.",
  freeBetween: (from, to) => `Free from ${from} to ${to}`,
  clearDates: "Clear dates",
  whereNeedVehicle: "Where do you need a vehicle?",
  realLocalFleet: "Real local fleet",
  cleanInspected: "Clean, inspected, ready to go.",
  easyLocalTravel: "Easy local travel",
  comfortEveryTrip: "Comfort for every trip",
  simpleStartFinish: "Simple from start to finish",
  threeSteps: "On the road in three steps",
  customerTrust: "Customer trust",
  recentExperiences: "Recent rental experiences",
  localAccountable: "Local and accountable",
  seeRealCustomers: "See what real customers say",
  reviewsByGoogle: "Reviews are hosted and verified by Google.",
  viewOnGoogle: "View on Google",
  leaveReview: "Leave a review",

  hubLink: "Our new hub",
  hubBadge: "Coming soon",
  hubTitle: "Our new rental hub",
  hubIntro: "A dedicated home for the fleet — so every pickup is quick, every vehicle is clean, and every handover is checked with you.",
  hubFeaturesTitle: "What changes for you",
  hubFeatures: [
    { title: "Covered pickup forecourt", body: "Collect and return your vehicle under cover, right off the road." },
    { title: "360° handover check", body: "We photograph the vehicle with you at pickup and return, so there are no surprises." },
    { title: "Washed between rentals", body: "A dedicated wash bay means every vehicle goes out clean." },
    { title: "Secure parking and a customer desk", body: "CCTV-covered parking, and a desk for your documents and keys." },
  ],
  hubPlanTitle: "Inside the hub",
  hubPlanNote: "Concept layout on the 345.66 m² plot — the final design may change.",
  hubPlanBody: "Customers only use the front: the forecourt, handover bay and office by the gate. Parking runs up both sides of a central drive lane, with washing and servicing at the back.",
  hubZones: { forecourt: "Pickup & return forecourt", bikes: "Bike parking", handover: "Handover bay", cars: "Car parking", wash: "Wash bay", service: "Service bay", store: "Helmets & spares", office: "Office & keys", gate: "Road & main gate" },
  hubCta: "Book a vehicle today",
  hubSiteTitle: "Where it is",
  hubSiteBody: "On Road 1, in the middle of the block between the two junctions. The gate opens straight onto Road 1.",
  hubRoad: (n) => `Road ${n}`,
  hubHere: "Our hub",
  hubGate: "Gate",
  hubWc: "WC",
  hubMetres: (n) => `${n} m`,
  hubVideoCaption: "3D concept visualisation of the planned hub — not footage of a finished building.",
  hubVideoLabel: "3D walkthrough: from Road 1 through the gate, past the handover bay, fleet board, bike and car parking, to the wash and service bays, ending with an overhead view of the whole hub",
  hubSiteAlt: "Map of the block: the hub sits on Road 1 between junction J2 (with Road 3) and junction J1 (with Road 2)",

  menu: "Menu",
  status: "Status",
  owner: "Owner",
  notFoundTitle: "Page not found",
  notFoundBody: "The vehicle or page may no longer be available.",
  backHome: "Back home",
};

export const uiTe: UiText = {
  dateLocale: "te-IN",
  available: "అందుబాటులో ఉంది",
  deliveryOrPickup: "డెలివరీ లేదా పికప్",
  deposit: (amount) => `${amount} డిపాజిట్`,
  viewDetails: "వివరాలు చూడండి",
  vehicle: "వాహనం",
  vehicleType: { bike: "బైక్", car: "కార్" },
  modelYear: "మోడల్ సంవత్సరం",
  handover: "అందజేత",
  refundableDeposit: "తిరిగి ఇచ్చే డిపాజిట్",
  pickupLocation: "పికప్ ప్రదేశం",
  from: "నుండి",
  perDayShort: "/రోజు",
  checkAvailability: "అందుబాటు చూడండి",
  totalForDays: (total, days) => `${days} రోజులకు ${total}`,
  seatsCount: (n) => `${n} సీట్లు`,
  kmIncluded: (km) => `రోజుకు ${km} కి.మీ. కలిపి`,
  helmets: (n) => `${n} హెల్మెట్${n === 1 ? "" : "లు"}`,

  search: "వెతకండి",
  fromDate: "నుండి",
  toDate: "వరకు",
  maxPrice: "గరిష్ఠ ధర",
  pricePerDayPlaceholder: "₹/రోజు",
  seats: "సీట్లు",
  fuel: "ఇంధనం",
  gear: "గేర్",
  sort: "క్రమం",
  any: "ఏదైనా",
  fuels: { petrol: "పెట్రోల్", diesel: "డీజిల్", electric: "ఎలక్ట్రిక్", cng: "CNG" },
  gears: { manual: "మాన్యువల్", automatic: "ఆటోమేటిక్", gearless: "గేర్‌లెస్" },
  sorts: { priceAsc: "తక్కువ ధర ముందు", priceDesc: "ఎక్కువ ధర ముందు", newest: "కొత్తవి ముందు" },
  filter: "ఫిల్టర్",
  reset: "రీసెట్",
  moreFilters: "మరిన్ని ఫిల్టర్లు",

  availabilityLoading: "అందుబాటు ఇంకా లోడ్ అవుతోంది. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
  dates: "తేదీలు",
  estimatedTotal: "అంచనా మొత్తం",
  steps: ["1 · తేదీలు", "2 · వివరాలు", "3 · నిర్ధారణ"],
  addressLabel: "డెలివరీ / కలెక్షన్ చిరునామా",
  addressPlaceholder: "ఇల్లు, వీధి, ల్యాండ్‌మార్క్ మరియు ఊరు",
  deliveryFee: (amount) => `డెలివరీ ఛార్జీ: ${amount}`,
  pickupTime: "పికప్ సమయం",
  returnTime: "తిరిగి ఇచ్చే సమయం",
  returnMethod: "తిరిగి ఇచ్చే విధానం",
  returnAtLocation: "మా ప్రదేశంలో తిరిగి ఇవ్వండి",
  collectFromMe: (amount) => `నా చిరునామా నుండి తీసుకెళ్లండి (+${amount})`,
  notes: "గమనికలు",
  optional: "(ఐచ్ఛికం)",
  notesPlaceholder: "ల్యాండ్‌మార్క్, ప్రత్యేక అభ్యర్థన లేదా ప్రయాణ వివరాలు",

  progress: { pending: "అభ్యర్థించారు", confirmed: "నిర్ధారించారు", ready: "సిద్ధంగా ఉంది", picked_up: "తీసుకున్నారు", returned: "తిరిగి ఇచ్చారు", completed: "పూర్తయింది" },
  stepOf: (step, total) => `దశ ${step} / ${total}`,
  bookingCancelled: "ఈ బుకింగ్ రద్దు చేయబడింది.",
  town: "ఊరు",
  pickup: "పికప్",
  return: "తిరిగి ఇవ్వడం",
  deliveredToYou: "మీ చిరునామాకు డెలివరీ",
  atOurLocation: "మా ప్రదేశంలో",
  collectedFromYou: "మీ చిరునామా నుండి తీసుకెళ్తాం",
  estimatedRent: "అంచనా అద్దె",
  payment: "చెల్లింపు",
  paymentStatus: { unpaid: "చెల్లించలేదు", part_paid: "పాక్షికంగా చెల్లించారు", paid: "చెల్లించారు", refunded: "తిరిగి చెల్లించారు" },
  advanceDue: (amount) => `ముందస్తు చెల్లింపు ${amount}`,
  payAdvance: "ముందస్తు మొత్తం ఆన్‌లైన్‌లో చెల్లించండి",
  requestReceived: "బుకింగ్ అభ్యర్థన అందింది",
  requestReceivedBody: "ఇప్పుడు ఏమీ చెల్లించనవసరం లేదు. మీ రిఫరెన్స్‌ను దాచుకోండి — స్టేటస్ చూడటానికి మీ ఫోన్ నంబర్‌తో పాటు ఇది అవసరం.",
  yourReference: "మీ రిఫరెన్స్",
  whatNext: "తర్వాత ఏమి జరుగుతుంది",
  nextSteps: [
    { title: "మేము మీతో నిర్ధారిస్తాం", body: "వాహనం మరియు అందజేత సమయాన్ని నిర్ధారించడానికి కొన్ని గంటల్లో మేము మీకు కాల్ లేదా వాట్సాప్ చేస్తాం." },
    { title: "మీ పత్రాలు తీసుకురండి", body: "మీ ఒరిజినల్ డ్రైవింగ్ లైసెన్స్ మరియు ఆధార్ కార్డు. కేవలం జిరాక్స్ కాపీలు అంగీకరించబడవు." },
    { title: "అందజేత సమయంలో చెల్లించండి", body: "అద్దె మరియు తిరిగి ఇచ్చే డిపాజిట్, నగదు లేదా UPI ద్వారా. వాహనం తిరిగి ఇచ్చినప్పుడు డిపాజిట్ తిరిగి వస్తుంది." },
  ],
  questionsWhatsApp: "సందేహాలా? వాట్సాప్ చేయండి",
  checkStatusLater: "తర్వాత స్టేటస్ చూడండి",
  browseMore: "మరిన్ని వాహనాలు చూడండి",
  statusTitle: "బుకింగ్ స్టేటస్ చూడండి",
  statusIntro: "మీ నిర్ధారణలోని రిఫరెన్స్ మరియు బుక్ చేసిన ఫోన్ నంబర్‌ను నమోదు చేయండి.",
  bookingReference: "బుకింగ్ రిఫరెన్స్",
  phonePlaceholder: "10-అంకెల మొబైల్ నంబర్",
  phoneNumber: "ఫోన్ నంబర్",
  check: "చూడండి",
  noMatch: "ఈ వివరాలతో బుకింగ్ ఏదీ కనబడలేదు.",
  noMatchHelp: "రిఫరెన్స్‌ను (RR-తో మొదలవుతుంది) సరిచూసుకోండి, బుక్ చేసిన అదే ఫోన్ నంబర్ ఉపయోగించండి.",
  askWhatsApp: "వాట్సాప్‌లో అడగండి",
  messageWhatsApp: "వాట్సాప్‌లో మెసేజ్ చేయండి",

  browseVehicles: "వాహనాలు చూడండి",
  bookedAsGuest: "లాగిన్ లేకుండా బుక్ చేశారా? స్టేటస్ చూడండి",
  invoice: "ఇన్వాయిస్ / ఒప్పందం",
  changeDates: "తేదీలు మార్చండి",
  saveDates: "తేదీలు సేవ్ చేయండి",
  datesUpdated: "తేదీలు మార్చబడ్డాయి.",
  cancel: "రద్దు చేయండి",
  bookingCancelledShort: "బుకింగ్ రద్దు చేయబడింది.",
  uploadDocument: "పత్రం అప్‌లోడ్ చేయండి",
  uploading: "అప్‌లోడ్ అవుతోంది…",
  uploadFailed: "అప్‌లోడ్ విఫలమైంది. 5 MB లోపు JPG, PNG లేదా PDF ఉపయోగించండి.",
  uploaded: "పత్రం సురక్షితంగా అప్‌లోడ్ అయింది.",

  pickupDate: "పికప్ తేదీ",
  returnDate: "తిరిగి ఇచ్చే తేదీ",
  showAvailable: "అందుబాటులో ఉన్న వాహనాలు చూడండి",
  browseAll: "అన్ని వాహనాలు చూడండి",
  returnBeforePickup: "తిరిగి ఇచ్చే తేదీ పికప్ తేదీ కంటే ముందు ఉండకూడదు.",
  freeBetween: (from, to) => `${from} నుండి ${to} వరకు ఖాళీగా ఉన్నవి`,
  clearDates: "తేదీలు తీసివేయండి",
  whereNeedVehicle: "మీకు వాహనం ఎక్కడ కావాలి?",
  realLocalFleet: "నిజమైన స్థానిక వాహనాలు",
  cleanInspected: "శుభ్రంగా, తనిఖీ చేసి, సిద్ధంగా.",
  easyLocalTravel: "సులభమైన స్థానిక ప్రయాణం",
  comfortEveryTrip: "ప్రతి ప్రయాణానికి సౌకర్యం",
  simpleStartFinish: "మొదటి నుండి చివరి వరకు సులభం",
  threeSteps: "మూడు దశల్లో రోడ్డు మీదకి",
  customerTrust: "కస్టమర్ నమ్మకం",
  recentExperiences: "ఇటీవలి అద్దె అనుభవాలు",
  localAccountable: "స్థానికంగా, బాధ్యతగా",
  seeRealCustomers: "నిజమైన కస్టమర్లు ఏమంటున్నారో చూడండి",
  reviewsByGoogle: "రివ్యూలు Google ద్వారా ధృవీకరించబడతాయి.",
  viewOnGoogle: "Googleలో చూడండి",
  leaveReview: "రివ్యూ ఇవ్వండి",

  hubLink: "మా కొత్త హబ్",
  hubBadge: "త్వరలో",
  hubTitle: "మా కొత్త రెంటల్ హబ్",
  hubIntro: "వాహనాల కోసం ప్రత్యేక కేంద్రం — ప్రతి పికప్ వేగంగా, ప్రతి వాహనం శుభ్రంగా, ప్రతి అందజేత మీ ముందే తనిఖీతో.",
  hubFeaturesTitle: "మీకు ఏమి మారుతుంది",
  hubFeatures: [
    { title: "నీడ ఉన్న పికప్ ప్రాంగణం", body: "రోడ్డు పక్కనే, నీడలో మీ వాహనాన్ని తీసుకోండి, తిరిగి ఇవ్వండి." },
    { title: "360° అందజేత తనిఖీ", body: "పికప్ మరియు రిటర్న్ సమయంలో మీ ముందే వాహనాన్ని ఫోటోలు తీస్తాం — ఎలాంటి ఆశ్చర్యాలు ఉండవు." },
    { title: "ప్రతి అద్దె తర్వాత వాష్", body: "ప్రత్యేక వాష్ బే ఉండటం వల్ల ప్రతి వాహనం శుభ్రంగా బయటకు వెళ్తుంది." },
    { title: "సురక్షిత పార్కింగ్, కస్టమర్ డెస్క్", body: "CCTV రక్షణలో పార్కింగ్, మీ పత్రాలు మరియు తాళాల కోసం డెస్క్." },
  ],
  hubPlanTitle: "హబ్ లోపల",
  hubPlanNote: "345.66 చ.మీ. స్థలంపై ప్రాథమిక నమూనా — తుది డిజైన్ మారవచ్చు.",
  hubPlanBody: "కస్టమర్లు ముందు భాగం మాత్రమే ఉపయోగిస్తారు: గేటు దగ్గర ప్రాంగణం, అందజేత బే, ఆఫీస్. మధ్య దారికి రెండు వైపులా పార్కింగ్, వెనుక భాగంలో వాష్ మరియు సర్వీస్.",
  hubZones: { forecourt: "పికప్ & రిటర్న్ ప్రాంగణం", bikes: "బైక్ పార్కింగ్", handover: "అందజేత బే", cars: "కార్ పార్కింగ్", wash: "వాష్ బే", service: "సర్వీస్ బే", store: "హెల్మెట్లు & విడిభాగాలు", office: "ఆఫీస్ & తాళాలు", gate: "రోడ్డు & ప్రధాన గేటు" },
  hubCta: "ఈరోజే వాహనం బుక్ చేయండి",
  hubSiteTitle: "ఎక్కడ ఉంది",
  hubSiteBody: "రోడ్ 1 మీద, రెండు జంక్షన్ల మధ్య. గేటు నేరుగా రోడ్ 1 మీదకి తెరుచుకుంటుంది.",
  hubRoad: (n) => `రోడ్ ${n}`,
  hubHere: "మా హబ్",
  hubGate: "గేటు",
  hubWc: "టాయిలెట్",
  hubMetres: (n) => `${n} మీ.`,
  hubVideoCaption: "ప్రణాళికలోని హబ్ యొక్క 3D ప్రాథమిక దృశ్యం — పూర్తైన భవనం వీడియో కాదు.",
  hubVideoLabel: "3D నడక: రోడ్ 1 నుండి గేటు ద్వారా, అందజేత బే, ఫ్లీట్ బోర్డు, బైక్ మరియు కార్ పార్కింగ్ దాటి, వాష్ మరియు సర్వీస్ బేల వరకు, చివరగా మొత్తం హబ్ పై నుండి",
  hubSiteAlt: "బ్లాక్ మ్యాప్: హబ్ రోడ్ 1 మీద, J2 (రోడ్ 3 జంక్షన్) మరియు J1 (రోడ్ 2 జంక్షన్) మధ్య ఉంది",

  menu: "మెనూ",
  status: "స్టేటస్",
  owner: "యజమాని",
  notFoundTitle: "పేజీ కనబడలేదు",
  notFoundBody: "ఈ వాహనం లేదా పేజీ ఇప్పుడు అందుబాటులో లేకపోవచ్చు.",
  backHome: "హోమ్‌కు వెళ్లండి",
};
