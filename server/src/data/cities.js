const cities = [
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Nashik", lat: 19.9975, lng: 73.7898 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Noida", lat: 28.5355, lng: 77.391 },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", lat: 21.1702, lng: 72.8311 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { name: "Patna", lat: 25.5941, lng: 85.1376 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
];

const cityMap = cities.reduce((acc, city) => {
  acc[city.name] = city;
  return acc;
}, {});

module.exports = { cities, cityMap };
