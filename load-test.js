import http from "k6/http";
import { check, sleep } from "k6";

// Simulate 200 concurrent users ramping up gradually
export let options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "1m", target: 0 },
  ],
};

const BASE = "https://classdore.vercel.app";

// Random sample data
const keywords = ["chem", "math", "bio", "econ", "cs", "hist", "phys"];
const depts = ["all", "CHEM", "MATH", "CS", "ECON", "BSCI"];
const schools = ["all", "AS", "ENGR"];
const sortFields = ["course_code", "course_title"];
const sortDirections = ["asc", "desc"];

export default function () {
  // Random homepage visit (20% of users)
  if (Math.random() < 0.2) {
    let home = http.get(BASE);
    check(home, { "homepage 200": (r) => r.status === 200 });
  }

  // Random search query (80% of users)
  const kw = keywords[Math.floor(Math.random() * keywords.length)];
  const dept = depts[Math.floor(Math.random() * depts.length)];
  const school = schools[Math.floor(Math.random() * schools.length)];
  const sortField = sortFields[Math.floor(Math.random() * sortFields.length)];
  const sortDirection = sortDirections[Math.floor(Math.random() * sortDirections.length)];

  const url = `${BASE}/api/courses/search?keywords=${encodeURIComponent(
    kw
  )}&dept=${dept}&school=${school}&broadSearch=false&sortField=${sortField}&sortDirection=${sortDirection}`;

  const res = http.get(url);
  check(res, {
    "search success": (r) => r.status === 200,
    "search fast": (r) => r.timings.duration < 1500, // under 1.5s
  });

  sleep(Math.random() * 2 + 0.5); // pause between 0.5–2.5s
}

