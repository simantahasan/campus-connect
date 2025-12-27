// server/utils/verifyStudent.js
const axios = require('axios');

const verifyStudentData = async (email, providedName) => {
  try {
    console.log(`🔍 [Hunter.io] Verifying existence of: ${email}`);

    // 1. EXISTENCE CHECK (Using Hunter.io API)
    const response = await axios.get(`https://api.hunter.io/v2/email-verifier`, {
      params: {
        email: email,
        api_key: process.env.HUNTER_API_KEY // 👈 Uses your Hunter Key
      }
    });

    // Handle potential API errors or empty data
    if (!response.data || !response.data.data) {
       console.warn("Hunter.io returned unexpected data:", response.data);
       return { valid: false, message: "Verification service currently unavailable." };
    }

    const { result } = response.data.data;

    // Hunter returns "deliverable", "risky", or "undeliverable"
    if (result === "undeliverable") {
      return { 
        valid: false, 
        message: "This email address does not exist or cannot receive emails." 
      };
    }

    // 2. INTEGRITY CHECK (Local Logic)
    
    // Check Domain
    if (!email.toLowerCase().endsWith("bracu.ac.bd")) {
      return { valid: false, message: "Must be a valid university email." };
    }

    // Extract Name Parts
    const emailNameParts = email.split('@')[0].replace(/\d+/g, '').split('.');
    const inputNameParts = providedName.toLowerCase().split(' ');

    // Match Logic
    const nameMatch = emailNameParts.some(emailPart => 
      emailPart.length > 2 && inputNameParts.some(inputPart => inputPart.includes(emailPart))
    );

    if (!nameMatch) {
      return { 
        valid: false, 
        message: `Identity Mismatch: The name "${providedName}" does not match the email owner.` 
      };
    }

    // Extract ID
    const idMatch = email.match(/(\d{8})/);
    const studentId = idMatch ? idMatch[0] : null;

    return { 
      valid: true, 
      studentId: studentId || "Verified" 
    };

  } catch (error) {
    console.error("Hunter API Error:", error.message);
    // If Hunter fails, we block registration to be safe, or you can return true to allow fallback.
    return { valid: false, message: "Verification failed. Check API Key or Internet." };
  }
};

module.exports = verifyStudentData;