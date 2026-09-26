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
];

export const featuredCities = ["Kolkata", "Jaipur", "Mumbai", "Goa", "Varanasi", "Kochi"];