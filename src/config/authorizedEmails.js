// Authorized email lists for different roles
export const AUTHORIZED_EMAILS = {
  admin: [
    "siddharthpaladugula@gmail.com",
    "samhithbade44@gmail.com",
    "aenreddy.souchithreddy@gmail.com",
    "admin@insta-maintain.com",
    "manager@insta-maintain.com",
    "supervisor@insta-maintain.com",
    // Add more admin emails here
  ],
  contractor: [
    "siddharthsleeps@gmail.com",
    "24071a6760@vnrvjiet.in",
    "electrician1@resolve360.com",
    "electrician2@resolve360.com",
    "contractor1@resolve360.com",
    "contractor2@resolve360.com",
    "maintenance1@resolve360.com",
    "maintenance2@resolve360.com",
    "hvac1@resolve360.com",
    "hvac2@resolve360.com",
    "plumber1@insta-maintain.com",
    "plumber2@insta-maintain.com",
    "electrician1@insta-maintain.com",
    "electrician2@insta-maintain.com",
    "contractor1@insta-maintain.com",
    "contractor2@insta-maintain.com",
    "maintenance1@insta-maintain.com",
    "maintenance2@insta-maintain.com",
    "hvac1@insta-maintain.com",
    "hvac2@insta-maintain.com",
    // Add more contractor emails here
  ],
};

// Function to determine user role based on email
export const getUserRole = (email) => {
  const lowerEmail = email.toLowerCase();

  if (AUTHORIZED_EMAILS.admin.includes(lowerEmail)) {
    return "admin";
  } else if (AUTHORIZED_EMAILS.contractor.includes(lowerEmail)) {
    return "contractor";
  } else {
    return "user"; // Default role for residents
  }
};

// Function to check if email is authorized for a specific role
export const isEmailAuthorized = (email, role) => {
  const lowerEmail = email.toLowerCase();
  return AUTHORIZED_EMAILS[role]?.includes(lowerEmail) || false;
};
