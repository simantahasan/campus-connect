// server/utils/verifyStudent.js
const axios = require('axios');

const verifyStudentData = async (email, providedName) => {
  try {
    console.log(`🔍 [Hunter.io] Verifying existence of: ${email}`);

    // ------------------------------------------------------
    // 1. EXISTENCE CHECK (Using Hunter.io API)
    // ------------------------------------------------------
    const response = await axios.get(`https://api.hunter.io/v2/email-verifier`, {
      params: {
        email: email,
        api_key: process.env.HUNTER_API_KEY // 👈 Uses the key you have!
      }
    });

    const data = response.data?.data;
    
    // Safety check: verify we got a valid response
    if (!data) {
        console.warn("Hunter.io returned empty data.");
        return { valid: false, message: "Verification service unavailable." };
    }

    // Hunter returns "deliverable", "risky", or "undeliverable"
    if (data.result === "undeliverable") {
      return { 
        valid: false, 
        message: "This email address does not exist or cannot receive emails." 
      };
    }

    // ------------------------------------------------------
    // 2. INTEGRITY CHECK (Name Matching Logic)
    // ------------------------------------------------------
    
    // A. Domain Check
    if (!email.toLowerCase().endsWith("bracu.ac.bd")) {
      return { valid: false, message: "Must be a valid university email (@g.bracu.ac.bd)." };
    }

    // B. Match Name Logic (Does "Simanta" appear in the email?)
    // Remove numbers and split by dots
    const emailNameParts = email.split('@')[0].replace(/\d+/g, '').split('.');
    const inputNameParts = providedName.toLowerCase().split(' ');

    const nameMatch = emailNameParts.some(emailPart => 
      emailPart.length > 2 && inputNameParts.some(inputPart => inputPart.includes(emailPart))
    );

    if (!nameMatch) {
      return { 
        valid: false, 
        message: `Identity Mismatch: The name "${providedName}" does not match the email owner.` 
      };
    }

    // C. Extract Student ID
    const idMatch = email.match(/(\d{8})/);
    const studentId = idMatch ? idMatch[0] : null;

    return { 
      valid: true, 
      studentId: studentId || "Verified" 
    };

  } catch (error) {
    console.error("Hunter API Error:", error.message);
    // If Hunter is down, block registration for safety
    return { valid: false, message: "Verification failed. Check API Key or Internet." };
  }
};

module.exports = verifyStudentData;
