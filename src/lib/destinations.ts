export type Destination = {
  city: string;
  state: string;
  places: string[];
};

export const destinations: Destination[] = [
  {
    city: "Kolkata",
    state: "West Bengal",
    places: [
      "Victoria Memorial", "Howrah Bridge", "Indian Museum", "St. Paul's Cathedral",
      "Princep Ghat", "Kumartuli", "Marble Palace", "Jorasanko Thakur Bari",
      "Science City", "Birla Planetarium", "Kalighat Temple", "Eco Park",
    ],
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    places: [
      "Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort",
      "Jaigarh Fort", "Jal Mahal", "Albert Hall Museum", "Panna Meena ka Kund",
      "Galtaji Temple", "Patrika Gate", "Johari Bazaar",
    ],
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    places: [
      "Gateway of India", "Marine Drive", "Elephanta Caves", "Chhatrapati Shivaji Maharaj Terminus",
      "Sanjay Gandhi National Park", "Kanheri Caves", "Bandra–Worli Sea Link", "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
      "Haji Ali Dargah", "Siddhivinayak Temple", "Kala Ghoda", "Juhu Beach",
    ],
  },
  {
    city: "Delhi",
    state: "Delhi",
    places: [
      "Red Fort", "Qutub Minar", "Humayun's Tomb", "India Gate", "Lotus Temple",
      "Jama Masjid", "Akshardham", "Lodhi Garden", "National Museum", "Agrasen ki Baoli",
      "Raj Ghat", "Chandni Chowk",
    ],
  },
  {
    city: "Varanasi",
    state: "Uttar Pradesh",
    places: [
      "Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Assi Ghat", "Sarnath",
      "Manikarnika Ghat", "Ramnagar Fort", "Sankat Mochan Temple", "Tulsi Manas Temple",
      "Bharat Kala Bhavan", "Durga Kund Temple", "Alamgir Mosque", "Namo Ghat",
    ],
  },
  {
    city: "Goa",
    state: "Goa",
    places: [
      "Basilica of Bom Jesus", "Se Cathedral", "Fontainhas", "Reis Magos Fort",
      "Dudhsagar Falls", "Palolem Beach", "Agonda Beach", "Baga Beach", "Chapora Fort",
      "Fort Aguada", "Salim Ali Bird Sanctuary", "Divar Island",
    ],
  },
  {
    city: "Kochi",
    state: "Kerala",
    places: [
      "Fort Kochi", "Chinese Fishing Nets", "Mattancherry Palace", "Paradesi Synagogue",
      "Jew Town", "St. Francis Church", "Kerala Folklore Museum", "Marine Drive Kochi",
      "Hill Palace Museum", "Cherai Beach", "Kumbalangi", "Bolgatty Palace",
    ],
  },
  {
    city: "Leh",
    state: "Ladakh",
    places: [
      "Leh Palace", "Shanti Stupa", "Thiksey Monastery", "Hemis Monastery", "Shey Palace",
      "Hall of Fame", "Sangam Point", "Magnetic Hill", "Khardung La", "Pangong Tso",
      "Tso Moriri", "Nubra Valley",
    ],
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    places: [
      "Bengaluru Palace", "Lalbagh Botanical Garden", "Cubbon Park", "Vidhana Soudha",
      "ISKCON Temple", "National Gallery of Modern Art", "Visvesvaraya Museum", "Tipu Sultan's Summer Palace",
      "Bull Temple", "Ulsoor Lake", "Bannerghatta National Park", "Nandi Hills",
    ],
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    places: [
      "Charminar", "Golconda Fort", "Salar Jung Museum", "Qutb Shahi Tombs", "Chowmahalla Palace",
      "Hussain Sagar", "Birla Mandir", "Mecca Masjid", "Shilparamam", "Nehru Zoological Park",
      "Paigah Tombs", "Ramoji Film City",
    ],
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    places: [
      "Marina Beach", "Kapaleeshwarar Temple", "Government Museum", "San Thome Basilica",
      "Fort St. George", "Guindy National Park", "Valluvar Kottam", "Kalakshetra Foundation",
      "Elliot's Beach", "DakshinaChitra", "Arignar Anna Zoological Park", "Theosophical Society",
    ],
  },
  {
    city: "Udaipur",
    state: "Rajasthan",
    places: [
      "City Palace", "Lake Pichola", "Jag Mandir", "Jagdish Temple", "Sajjangarh Palace",
      "Saheliyon-ki-Bari", "Bagore Ki Haveli", "Fateh Sagar Lake", "Shilpgram", "Ahar Cenotaphs",
      "Badi Lake", "Sajjangarh Biological Park",
    ],
  },
  { city: "Agra", state: "Uttar Pradesh", places: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Itimad-ud-Daulah", "Mehtab Bagh", "Akbar's Tomb", "Jama Masjid Agra", "Kinari Bazaar", "Chini Ka Rauza", "Taj Museum", "Ram Bagh", "Mariam's Tomb"] },
  { city: "Amritsar", state: "Punjab", places: ["Golden Temple", "Jallianwala Bagh", "Wagah Border", "Partition Museum", "Durgiana Temple", "Gobindgarh Fort", "Maharaja Ranjit Singh Museum", "Ram Tirath", "Hall Bazaar", "Khalsa College", "Akal Takht", "Gurudwara Baba Atal Rai"] },
  { city: "Rishikesh", state: "Uttarakhand", places: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat", "Beatles Ashram", "Parmarth Niketan", "Neelkanth Mahadev Temple", "Rajaji National Park", "Kunjapuri Temple", "Shivpuri", "Tera Manzil Temple", "Vashishta Gufa", "Neer Garh Waterfall"] },
  { city: "Shimla", state: "Himachal Pradesh", places: ["The Ridge", "Mall Road", "Jakhoo Temple", "Christ Church", "Viceregal Lodge", "Kufri", "Chadwick Falls", "Annandale", "Tara Devi Temple", "Scandal Point", "Himachal State Museum", "Naldehra"] },
  { city: "Leh", state: "Ladakh", places: ["Leh Palace", "Shanti Stupa", "Thiksey Monastery", "Hemis Monastery", "Pangong Lake", "Nubra Valley", "Khardung La", "Magnetic Hill", "Hall of Fame", "Spituk Monastery", "Shey Palace", "Diskit Monastery"] },
  { city: "Kochi", state: "Kerala", places: ["Fort Kochi", "Chinese fishing nets", "Mattancherry Palace", "Paradesi Synagogue", "St. Francis Church", "Santa Cruz Cathedral Basilica", "Jew Town", "Marine Drive Kochi", "Hill Palace", "Cherai Beach", "Kerala Folklore Museum", "Bolgatty Palace"] },
  { city: "Munnar", state: "Kerala", places: ["Eravikulam National Park", "Mattupetty Dam", "Anamudi", "Top Station", "Kundala Lake", "Attukal Waterfalls", "Tata Tea Museum", "Echo Point", "Lakkam Waterfalls", "Chinnar Wildlife Sanctuary", "Pothamedu View Point", "Blossom Park"] },
  { city: "Mysuru", state: "Karnataka", places: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens", "St. Philomena's Church", "Mysore Zoo", "Jaganmohan Palace", "Srirangapatna", "Karanji Lake", "Devaraja Market", "Rail Museum Mysore", "Lalitha Mahal", "Ranganathittu Bird Sanctuary"] },
  { city: "Shillong", state: "Meghalaya", places: ["Umiam Lake", "Elephant Falls", "Shillong Peak", "Ward's Lake", "Don Bosco Museum", "Police Bazaar", "Laitlum Canyons", "Mawlynnong", "Cherrapunji", "Nohkalikai Falls", "Living root bridges", "Dawki"] },
  { city: "Darjeeling", state: "West Bengal", places: ["Tiger Hill", "Darjeeling Himalayan Railway", "Batasia Loop", "Padmaja Naidu Himalayan Zoological Park", "Himalayan Mountaineering Institute", "Peace Pagoda", "Ghum Monastery", "Happy Valley Tea Estate", "Darjeeling Mall", "Rock Garden", "Observatory Hill", "Japanese Peace Pagoda"] },
  { city: "Madurai", state: "Tamil Nadu", places: ["Meenakshi Temple", "Thirumalai Nayakkar Mahal", "Gandhi Memorial Museum", "Alagar Koyil", "Vandiyur Mariamman Teppakulam", "Thiruparankundram", "Koodal Azhagar Temple", "Samanar Hills", "Pudhu Mandapam", "Athisayam", "Kazimar Big Mosque", "St. Mary's Cathedral Madurai"] },
];

export const featuredCities = ["Kolkata", "Jaipur", "Mumbai", "Goa", "Varanasi", "Kochi"];
