const cityGraph = {
  Bengaluru: { Mysuru: 145, Chennai: 350, Hyderabad: 570, Pune: 840 },
  Mysuru: { Bengaluru: 145, Coimbatore: 200 },
  Chennai: { Bengaluru: 350, Coimbatore: 505, Hyderabad: 630, Vijayawada: 450 },
  Coimbatore: { Mysuru: 200, Chennai: 505, Hyderabad: 900 },
  Hyderabad: { Bengaluru: 570, Chennai: 630, Vijayawada: 275, Pune: 560, Mumbai: 710 },
  Vijayawada: { Hyderabad: 275, Chennai: 450, Bhubaneswar: 830 },
  Pune: { Bengaluru: 840, Hyderabad: 560, Mumbai: 150, Nashik: 210, Ahmedabad: 660 },
  Mumbai: { Pune: 150, Nashik: 165, Surat: 280, Ahmedabad: 530 },
  Nashik: { Mumbai: 165, Pune: 210, Surat: 250, Delhi: 1260 },
  Delhi: { Noida: 25, Gurugram: 35, Jaipur: 280, Lucknow: 555, Nashik: 1260 },
  Noida: { Delhi: 25, Lucknow: 530 },
  Gurugram: { Delhi: 35, Jaipur: 250 },
  Jaipur: { Delhi: 280, Gurugram: 250, Ahmedabad: 670 },
  Ahmedabad: { Jaipur: 670, Surat: 270, Mumbai: 530, Pune: 660 },
  Surat: { Ahmedabad: 270, Mumbai: 280, Nashik: 250 },
  Kolkata: { Bhubaneswar: 440, Patna: 620 },
  Bhubaneswar: { Kolkata: 440, Vijayawada: 830, Patna: 860 },
  Patna: { Kolkata: 620, Bhubaneswar: 860, Lucknow: 530, Kanpur: 370 },
  Lucknow: { Noida: 530, Delhi: 555, Patna: 530, Kanpur: 90 },
  Kanpur: { Lucknow: 90, Patna: 370 },
};

module.exports = cityGraph;
