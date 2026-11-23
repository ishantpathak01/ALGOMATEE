// Profile photos: old accounts may hold an expired/broken default image URL.
// These helpers always give something that loads (initials avatar as fallback).
const initialsUrl = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "User")}`;

export const avatarFor = (picture, name) =>
  !picture || /freepik\.com/i.test(picture) ? initialsUrl(name) : picture;

/** Use as: <img src={avatarFor(p, name)} onError={onAvatarError(name)} /> */
export const onAvatarError = (name) => (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = initialsUrl(name);
};
