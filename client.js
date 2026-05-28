/* global TrelloPowerUp */

// 🛑 1. THE RULEBOOK 🛑
// Add as many rules as you want here. It uses '.includes' so emojis won't break it!
const QC_RULES = [
  {
    listNameContains: "Clip Review", 
    requiredFields: ["Clip Review Time (Decimal Hour)"],
    badgePrefix: "💡 Kindly fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Clips Finished", 
    requiredFields: ["Video ID"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Clip Collection", 
    requiredFields: ["Video ID"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Script Writing", 
    requiredFields: ["Writer"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Transcription", 
    requiredFields: ["Transcriber"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Editing", 
    requiredFields: ["Editor"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Review", 
    requiredFields: ["Editor", "Video Reviewer"], // You can require multiple fields at once!
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  }
];

// 🛡️ 2. THE EXCEPTION SHIELD 🛡️
// If a card name starts with any of these, it gets ignored.
const IGNORE_NAMES = [
  "---", 
  "***", 
  "label:", 
  "[label]"
];

// If a card has ANY of these exact labels, it gets ignored.
const IGNORE_LABELS = [
  "Keep On Top",
  "No QC"
];


// 🚀 3. THE POWER-UP INITIALIZATION 🚀
window.TrelloPowerUp.initialize({
  
  // This tells Trello we want to put Badges on the front of the cards
  'card-badges': function(t, options) {
    
    // 🚨 Ask Trello for the current List Name, Custom Fields, AND the Card's Name/Labels
    return Promise.all([
      t.list('name'),
      t.board('customFields'),
      t.card('name', 'customFieldItems', 'labels') 
    ])
    .then(function(results) {
      const currentList = results[0].name;
      const boardCustomFields = results[1].customFields || [];
      const cardData = results[2];
      
      const cardName = cardData.name || "";
      const cardCustomFields = cardData.customFieldItems || [];
      const cardLabels = cardData.labels || [];

      // --- 🛡️ RUN THE SHIELD CHECK FIRST 🛡️ ---
      // 1. Check if the card name starts with one of our ignored words
      const isNameIgnored = IGNORE_NAMES.some(ignoreStr => cardName.toLowerCase().startsWith(ignoreStr.toLowerCase()));
      
      // 2. Check if the card has a label from our IGNORE_LABELS list
      const hasIgnoreLabel = cardLabels.some(label => IGNORE_LABELS.includes(label.name));

      // If either of those are true, abort the inspection and return an empty card!
      if (isNameIgnored || hasIgnoreLabel) {
        return []; 
      }
      // ------------------------------------------

      let finalBadges = [];

      // 🔍 4. THE INSPECTOR 🔍
      // Loop through our Rulebook to see if the current list triggers any rules
      QC_RULES.forEach(rule => {
        if (currentList.includes(rule.listNameContains)) {
          
          let missingFieldsForThisRule = [];
          
          // A rule was triggered! Now check if they filled out the required fields.
          rule.requiredFields.forEach(requiredFieldName => {
            
            // Find the ID of the custom field we are looking for
            let fieldDef = boardCustomFields.find(cf => cf.name === requiredFieldName);
            
            if (fieldDef) {
              // Check if the card actually has data for this field ID
              let cardHasField = cardCustomFields.find(item => item.idCustomField === fieldDef.id);
              
              // If it doesn't exist, or the value is empty, flag it!
              if (!cardHasField || (!cardHasField.value && !cardHasField.idValue)) {
                missingFieldsForThisRule.push(requiredFieldName);
              }
            }
          });

          // 🚨 5. BUILD THE CUSTOM BADGE 🚨
          // If this specific rule found missing fields, build its custom badge!
          if (missingFieldsForThisRule.length > 0) {
            finalBadges.push({
              text: rule.badgePrefix + missingFieldsForThisRule.join(', '),
              color: rule.badgeColor 
            });
          }
        }
      });

      // Return all triggered badges (Trello will render them side-by-side if there are multiple)
      return finalBadges;
    });
  }
});
