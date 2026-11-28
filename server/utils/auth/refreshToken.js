import jwt from "jsonwebtoken";

const DAY = 24 * 60 * 60 * 1000;
const SESSION_DAYS = 7;

/**
 * Keeps students logged in.
 *  - Old sign-ups got a 2-hour token although the cookie lasts 7 days -> "token expired" while the
 *    cookie was still there. An expired token with a VALID signature that was issued within the last
 *    7 days is accepted and replaced by a fresh 7-day one.
 *  - Sliding session: an active user whose token has less than 3 days left gets a fresh 7-day token,
 *    so nobody has to log in again while they keep using the site.
 * Runs before every route, so all existing verifyToken checks keep working unchanged.
 */
export const refreshSession = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token || !process.env.SECRET_KEY) return next();

  try {
    let payload;
    let expired = false;
    try {
      payload = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name !== "TokenExpiredError") return next(); // invalid token: let the route reject it
      payload = jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
      expired = true;
    }
    if (!payload?.Id) return next(); // not a user/mentor session token

    const issuedMs = (payload.iat || 0) * 1000;
    const leftMs = (payload.exp || 0) * 1000 - Date.now();
    const tooOld = Date.now() - issuedMs > SESSION_DAYS * DAY;
    if (expired && tooOld) return next(); // really old: must log in again
    if (!expired && leftMs > 3 * DAY) return next(); // still plenty of time left

    const fresh = jwt.sign({ Id: payload.Id }, process.env.SECRET_KEY, { expiresIn: `${SESSION_DAYS}d` });
    res.cookie("token", fresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: SESSION_DAYS * DAY,
    });
    req.cookies.token = fresh; // the route's own check now sees the fresh token
  } catch (e) {
    /* bad signature etc.: leave it to the route */
  }
  next();
};
