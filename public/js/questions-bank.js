// Custom Questions Bank for Form Builder
// Industry-specific questions for lead generation forms

const QUESTIONS_BANK = {
  // Realtors - 20 questions
  realtors: [
    "What type of property are you looking for?",
    "What's your preferred price range?",
    "Which neighborhood interests you most?",
    "Are you a first-time buyer?",
    "Do you need financing assistance?",
    "What's your ideal move-in timeline?",
    "How many bedrooms do you need?",
    "Do you prefer newer construction or historic homes?",
    "Are you interested in investment properties?",
    "What's most important to you in a home?",
    "Do you have a home to sell first?",
    "Are you working with any other agents?",
    "What's your current housing situation?",
    "Do you need help with mortgage pre-approval?",
    "Are you open to fixer-upper properties?",
    "What school district preferences do you have?",
    "Do you need a garage or parking space?",
    "Are you interested in condos or single-family homes?",
    "What's your preferred lot size?",
    "Do you have any specific home features in mind?"
  ],

  // Consultants - 20 questions
  consultants: [
    "What specific challenges is your business facing?",
    "What's your current annual revenue?",
    "How many employees do you have?",
    "What industry are you in?",
    "What's your biggest business goal right now?",
    "Have you worked with consultants before?",
    "What's your timeline for seeing results?",
    "What's your budget for consulting services?",
    "What areas need the most improvement?",
    "Who would be involved in the decision-making process?",
    "What's your current growth rate?",
    "What systems and processes do you have in place?",
    "What's your biggest competitive advantage?",
    "Are you looking to expand or optimize?",
    "What's your current marketing strategy?",
    "Do you have any compliance or regulatory concerns?",
    "What technology platforms do you currently use?",
    "What's your customer acquisition cost?",
    "How do you currently measure success?",
    "What's keeping you up at night about your business?"
  ],

  // Coaches - 20 questions
  coaches: [
    "What area of your life do you want to improve most?",
    "What's your biggest challenge right now?",
    "Have you worked with a coach before?",
    "What does success look like for you?",
    "What's holding you back from achieving your goals?",
    "How committed are you to making changes?",
    "What's your timeline for reaching your goals?",
    "What support system do you have in place?",
    "What's your preferred coaching style?",
    "How do you best learn and process information?",
    "What motivates you most?",
    "What are you willing to invest in yourself?",
    "What habits would you like to change?",
    "Where do you see yourself in 6 months?",
    "What's your biggest fear about making changes?",
    "How do you handle accountability?",
    "What skills do you want to develop?",
    "What's your energy level throughout the day?",
    "How do you prefer to communicate?",
    "What's worked for you in the past?"
  ],

  // Sales Reps - 20 questions
  salesReps: [
    "What's your current sales volume?",
    "Which products/services interest you most?",
    "What's your decision-making timeline?",
    "Who else is involved in the buying process?",
    "What's your current solution/provider?",
    "What's your biggest pain point?",
    "What's your budget range?",
    "When do you need implementation by?",
    "What features are most important to you?",
    "Have you evaluated other options?",
    "What's driving this purchase decision?",
    "How do you measure ROI?",
    "What's your current process?",
    "Do you have any integration requirements?",
    "What's your company size?",
    "What's your growth trajectory?",
    "Are there any compliance requirements?",
    "What's your preferred contract length?",
    "Do you need training and support?",
    "What would make this a no-brainer decision?"
  ],

  // Fitness Trainers - 20 questions
  fitnessTrainers: [
    "What are your current fitness goals?",
    "How often do you currently exercise?",
    "Do you have any injuries or limitations?",
    "What's your fitness experience level?",
    "What type of workouts do you enjoy most?",
    "What's your biggest fitness challenge?",
    "How much time can you commit to training?",
    "Do you prefer individual or group sessions?",
    "What's your current diet like?",
    "Have you worked with a trainer before?",
    "What motivates you to stay active?",
    "What's your preferred workout schedule?",
    "Do you have access to a gym?",
    "What's your stress level?",
    "How much sleep do you typically get?",
    "What's your target timeline for results?",
    "Do you take any medications or supplements?",
    "What's your current weight/body composition goal?",
    "How do you track your progress?",
    "What's most important: strength, cardio, or flexibility?"
  ],

  // Photographers - 15 questions
  photographers: [
    "What type of photography session are you interested in?",
    "What's the date and location for your session?",
    "How many people will be included?",
    "What's your preferred style?",
    "What's your budget for photography?",
    "Have you had professional photos taken before?",
    "What will these photos be used for?",
    "Do you need help with styling/wardrobe?",
    "What's your timeline for receiving photos?",
    "Do you prefer indoor or outdoor sessions?",
    "How many final edited photos do you need?",
    "Are there any specific shots you must have?",
    "Do you need prints or just digital files?",
    "What's the most important thing to capture?",
    "Do you have any photo ideas or inspiration?"
  ],

  // Event Organizers - 15 questions
  eventOrganizers: [
    "What type of event are you planning?",
    "What's your event date and time?",
    "How many guests are you expecting?",
    "What's your total event budget?",
    "What's your venue situation?",
    "What services do you need help with?",
    "What's your theme or vision?",
    "Do you need catering services?",
    "What's your timeline for planning?",
    "Have you organized events before?",
    "What's most important for this event's success?",
    "Do you need entertainment or speakers?",
    "What's your backup plan for weather?",
    "Do you need help with decorations?",
    "What's your biggest event concern?"
  ],

  // General Business - 10 questions
  general: [
    "What's your primary business objective?",
    "What's your target market?",
    "What's your current biggest challenge?",
    "How can we best help you?",
    "What's your preferred communication method?",
    "What's your timeline for getting started?",
    "What's your budget range?",
    "Who makes the final decisions?",
    "What questions do you have for us?",
    "What would make this a perfect solution?"
  ]
};

// Answer field types configuration
const ANSWER_FIELD_TYPES = {
  text: {
    label: "Short Text",
    icon: "fas fa-font",
    placeholder: "Enter your answer...",
    maxLength: 100
  },
  textarea: {
    label: "Long Text",
    icon: "fas fa-align-left", 
    placeholder: "Enter detailed response...",
    maxLength: 500
  },
  radio: {
    label: "Multiple Choice",
    icon: "fas fa-dot-circle",
    options: ["Option 1", "Option 2", "Option 3"]
  },
  checkbox: {
    label: "Checkboxes",
    icon: "fas fa-check-square",
    options: ["Option 1", "Option 2", "Option 3"]
  },
  select: {
    label: "Dropdown",
    icon: "fas fa-chevron-down",
    options: ["Select an option", "Option 1", "Option 2", "Option 3"]
  },
  rating: {
    label: "Star Rating",
    icon: "fas fa-star",
    placeholder: "Click stars to rate..."
  }
};

// Export for use in form builder
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS_BANK, ANSWER_FIELD_TYPES };
} else {
  window.QUESTIONS_BANK = QUESTIONS_BANK;
  window.ANSWER_FIELD_TYPES = ANSWER_FIELD_TYPES;
}