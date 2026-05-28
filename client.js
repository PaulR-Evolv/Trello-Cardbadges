/* global TrelloPowerUp */

// 🛑 1. THE RULEBOOK 🛑
// Add as many rules as you want here. It uses '.includes' so emojis won't break it!
const QC_RULES = [
  {
    listNameContains: "Script Writing", 
    requiredFields: ["Writer"]
  },
  {
    listNameContains: "Transcription", 
    requiredFields: ["Transcriber"]
  },
  {
    listNameContains: "Video Editing", 
    requiredFields: ["Editor"]
  },
  {
    listNameContains: "Video Review", 
    requiredFields: ["Editor", "Video Reviewer"] // You can require multiple fields at once!
  }
];


// 🚀 2. THE POWER-UP INITIALIZATION 🚀
window.TrelloPowerUp.initialize({
  
  // This tells Trello we want to put Badges on the front of the cards
  'card-badges': function(t, options) {
    
    // Ask Trello for the current List Name, the Board's Custom Field definitions, and the Card's actual data
    return Promise.all([
      t.list('name'),
      t.board('customFields'),
      t.card('customFieldItems')
    ])
    .then(function(results) {
      const currentList = results[0].name;
      const boardCustomFields = results[1].customFields || [];
      const cardCustomFields = results[2].customFieldItems || [];

      let missingFields = [];

      // 🔍 3. THE INSPECTOR 🔍
      // Loop through our Rulebook to see if the current list triggers any rules
      QC_RULES.forEach(rule => {
        if (currentList.includes(rule.listNameContains)) {
          
          // A rule was triggered! Now check if they filled out the required fields.
          rule.requiredFields.forEach(requiredFieldName => {
            
            // Find the ID of the custom field we are looking for
            let fieldDef = boardCustomFields.find(cf => cf.name === requiredFieldName);
            
            if (fieldDef) {
              // Check if the card actually has data for this field ID
              let cardHasField = cardCustomFields.find(item => item.idCustomField === fieldDef.id);
              
              // If it doesn't exist, or the value is empty, flag it!
              if (!cardHasField || (!cardHasField.value && !cardHasField.idValue)) {
                missingFields.push(requiredFieldName);
              }
            }
          });
        }
      });

      // 🚨 4. THE SCREAMING BADGE 🚨
      // If we found missing fields, throw up the red flag!
      if (missingFields.length > 0) {
        return [{
          text: '⚠️ MISSING: ' + missingFields.join(', '),
          color: 'red' 
        }];
      }

      // If everything is perfect, return an empty array (no badge!)
      return [];
    });
  }
});
