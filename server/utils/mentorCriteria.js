// The checklist the admin sees for every mentor application.
// Edit this list to change the verification criteria: add, remove or reword items.
// An item passes when its check() returns true for the mentor's saved profile.
export const MENTOR_CRITERIA = [
  {
    key: "photo",
    label: "Profile photo uploaded",
    check: (m) => !!m.Picture && !m.Picture.includes("blue-circle-with-white-user"),
  },
  {
    key: "about",
    label: "About section written (30+ characters)",
    check: (m) =>
      !!m.About && m.About !== "I am a mentor" && m.About.trim().length >= 30,
  },
  {
    key: "experience",
    label: "At least 1 year of experience",
    check: (m) => Number(m.Experience) >= 1,
  },
  {
    key: "expertise",
    label: "At least one area of expertise",
    check: (m) => !!m.Expertise && Object.keys(m.Expertise).length > 0,
  },
  {
    key: "mobile",
    label: "Mobile number provided",
    check: (m) => !!m.MobileNumber,
  },
  {
    key: "location",
    label: "Location provided",
    check: (m) => !!m.Location && m.Location !== "--",
  },
];

export const evaluateMentor = (mentor) => {
  const m = typeof mentor.toObject === "function" ? mentor.toObject() : mentor;
  return MENTOR_CRITERIA.map((c) => ({
    key: c.key,
    label: c.label,
    passed: !!c.check(m),
  }));
};
