// src/i18n.js

import i18n from 'i18next'; // <-- Ensure i18next is imported as i18n
import { initReactI18next } from 'react-i18next';

// Define your translation resources
const resources = {
  en: {
    translation: {
      "home": "Home",
      "sell": "Sell",
      "repair": "Repair",
      "marketplace": "Marketplace",
      "signup": "Sign Up",
      "login": "Login",
      "logout": "Logout",
      "myListings": "My Listings",
      "manageRepairs": "Manage Repairs",
      "profile": "Profile",
      "welcomeBack": "Welcome Back",
      "signInToAccount": "Sign in to your account",
      "allFieldsRequired": "Please fill in all fields",
      "emailAddress": "Email Address",
      "enterYourEmail": "Enter your email",
      "password": "Password",
      "enterYourPassword": "Enter your password",
      "forgotPassword": "Forgot password?",
      "signingIn": "Signing in...",
      "signIn": "Sign In",
      "noAccount": "Don't have an account?",
      "signUpHere": "Sign up",
      "loginFailedGeneric": "Login failed. Please try again.",
      "invalidCredentials": "Invalid email or password.", // Example for a specific error
      "networkError": "Network error. Please check your connection or if the backend server is running.",
      "unexpectedError": "An unexpected error occurred.",
      "register": "Register",
      "username": "Username",
      "yourUsername": "Your username",
      "confirmPassword": "Confirm Password",
      "confirmYourPassword": "Confirm your password",
      "createPassword": "Create a password",
      "passwordsDoNotMatch": "Passwords do not match.",
      "registrationSuccess": "Registration successful! Please log in.",
      "registrationFailed": "Registration failed. Please try again.",
      "alreadyHaveAccount": "Already have an account?",
      "loginHere": "Login here",
      "selectRole": "Select Role:",
      "roleUser": "User",
      "roleTechnician": "Technician",
      "roleAdmin": "Admin",
      "404NotFound": "404 - Page Not Found",
      "pageNotFound": "The page you are looking for does not exist.",
      "goToHome": "Go to Home",
      "unauthorizedAccess": "Unauthorized Access",
      "notAuthorized": "You are not authorized to view this page.",
      "backToLogin": "Back to Login",
      "submitRepairRequest": "Submit a Repair Request",
      "repairIssue": "Issue Description",
      "describeYourIssue": "Describe the issue with your laptop...",
      "contactNumber": "Contact Number",
      "enterContactNumber": "Enter your contact number",
      "submitRequest": "Submit Request",
      "requestSubmitted": "Repair request submitted successfully!",
      "requestFailed": "Failed to submit repair request. Please try again.",
      "myRepairRequests": "My Repair Requests",
      "noRepairRequests": "You have no repair requests.",
      "status": "Status",
      "submittedOn": "Submitted On",
      "viewDetails": "View Details",
      "repairRequestDetails": "Repair Request Details",
      "requestId": "Request ID:",
      "updatedOn": "Updated On:",
      "adminNotes": "Admin Notes:",
      "editRequest": "Edit Request",
      "updateRequest": "Update Request",
      "requestUpdated": "Repair request updated successfully!",
      "updateFailed": "Failed to update request. Please try again.",
      "pending": "Pending",
      "inProgress": "In Progress",
      "completed": "Completed",
      "cancelled": "Cancelled",
      "manageAllRepairs": "Manage All Repair Requests",
      "noRequestsToManage": "No repair requests to manage.",
      "clientName": "Client Name",
      "laptopIssue": "Laptop Issue",
      "filterByStatus": "Filter by Status:",
      "all": "All",
      "sellYourLaptop": "Sell Your Laptop",
      "laptopBrand": "Laptop Brand",
      "selectBrand": "Select Brand",
      "model": "Model",
      "enterModel": "Enter Model",
      "processor": "Processor",
      "ram": "RAM (GB)",
      "storage": "Storage (GB)",
      "storageType": "Storage Type",
      "selectStorageType": "Select Storage Type",
      "ssd": "SSD",
      "hdd": "HDD",
      "screenSize": "Screen Size (inches)",
      "condition": "Condition",
      "selectCondition": "Select Condition",
      "new": "New",
      "used": "Used",
      "price": "Price (PKR)",
      "enterPrice": "Enter Price",
      "description": "Description",
      "describeLaptop": "Describe your laptop...",
      "uploadImage": "Upload Image",
      "chooseFile": "Choose File",
      "noFileChosen": "No file chosen",
      "listLaptop": "List Laptop",
      "listingSuccess": "Laptop listed successfully!",
      "listingFailed": "Failed to list laptop. Please try again.",
      "myLaptopListings": "My Laptop Listings",
      "noLaptopListings": "You have no laptop listings.",
      "editListing": "Edit Listing",
      "deleteListing": "Delete Listing",
      "listingDetails": "Listing Details",
      "brand": "Brand:",
      "conditionLabel": "Condition:",
      "priceLabel": "Price:",
      "seller": "Seller:",
      "contactSeller": "Contact Seller",
      "viewListing": "View Listing",
      "marketplaceSub": "Find your next laptop or sell your old one!",
      "exploreMarketplace": "Explore Marketplace",
      "requestRepair": "Request Repair",
      "sellBuyRepair": "Sell, Buy, or Repair Your Laptop — All in One Place!",
      // Add any other translations you need
    }
  },
  // Add other languages here if needed
  // fr: {
  //   translation: {
  //     "home": "Accueil",
  //     // ... and so on for French
  //   }
  // }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en", // fallback language if translation not found
    interpolation: {
      escapeValue: false // react already escapes by default
    }
  });

export default i18n;