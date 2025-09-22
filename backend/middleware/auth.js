import jwt from "jsonwebtoken";

const SECRET = "supersecret"; // ⚠️ move to process.env in production

export const auth = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, username, email }
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
