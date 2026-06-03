/* global TrelloPowerUp */

// 🛑 1. THE RULEBOOK 🛑
const QC_RULES = [
  // --- 🌍 UNIVERSAL RULES (Applies to EVERY list on the board) ---
  {
    applyToAll: true, 
    requiredFields: ["Video ID"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },

  // --- 🟡 YELLOW REMINDER BADGES ---
  {
    listNameContains: "Clip Review", 
    requiredFields: ["Clip Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Clip Revision", 
    requiredFields: ["Clip Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Clip Storage", 
    requiredFields: ["Clip Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Script Review", 
    requiredFields: ["Word Count"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Script Revision", 
    requiredFields: ["Word Count"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },

  // --- 🔴 RED MISSING BADGES ---
  {
    listNameContains: "Clips Finished", 
    requiredFields: ["Clip Review Time (Decimal Hour)"], // Confirm with David Trigger Point
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Clip Collection", 
    requiredFields: ["Collector"],
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
    requiredFields: ["Editor", "Video Reviewer"], 
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  }
];

// 🛡️ 2. THE EXCEPTION SHIELD 🛡️
const IGNORE_NAMES = [
  "---", 
  "***", 
  "label:", 
  "[label]"
];

const IGNORE_LABELS = [
  "Keep On Top",
  "No QC"
];


// 🚀 3. THE POWER-UP INITIALIZATION 🚀
window.TrelloPowerUp.initialize({
  
  'card-badges': function(t, options) {
    
    // 🚨 NEW: Added .catch() safety nets so Trello doesn't crash the script!
    return Promise.all([
      t.list('name').catch(() => null),
      t.board('customFields').catch(() => null),
      t.card('name', 'customFieldItems', 'labels').catch(() => null) 
    ])
    .then(function(results) {
      // 🚨 NEW: Added fallback empty strings/arrays just in case Trello returns null
      const currentList = (results[0] && results[0].name) ? results[0].name : "";
      const boardCustomFields = (results[1] && results[1].customFields) ? results[1].customFields : [];
      const cardData = results[2] || {};
      
      const cardName = cardData.name || "";
      const cardCustomFields = cardData.customFieldItems || [];
      const cardLabels = cardData.labels || [];

      // --- 🛡️ RUN THE SHIELD CHECK FIRST 🛡️ ---
      const isNameIgnored = IGNORE_NAMES.some(ignoreStr => cardName.toLowerCase().startsWith(ignoreStr.toLowerCase()));
      const hasIgnoreLabel = cardLabels.some(label => IGNORE_LABELS.includes(label.name));

      if (isNameIgnored || hasIgnoreLabel) {
        return []; 
      }
      // ------------------------------------------

      let finalBadges = [];

      // 🔍 4. THE INSPECTOR 🔍
      QC_RULES.forEach(rule => {
        
        if (rule.applyToAll || (rule.listNameContains && currentList.includes(rule.listNameContains))) {
          
          let missingFieldsForThisRule = [];
          
          rule.requiredFields.forEach(requiredFieldName => {
            let fieldDef = boardCustomFields.find(cf => cf.name === requiredFieldName);
            
            if (fieldDef) {
              let cardHasField = cardCustomFields.find(item => item.idCustomField === fieldDef.id);
              
              if (!cardHasField || (!cardHasField.value && !cardHasField.idValue)) {
                missingFieldsForThisRule.push(requiredFieldName);
              }
            }
          });

          // 🚨 5. BUILD THE CUSTOM BADGE 🚨
          if (missingFieldsForThisRule.length > 0) {
            finalBadges.push({
              text: rule.badgePrefix + missingFieldsForThisRule.join(', '),
              color: rule.badgeColor 
            });
          }
        }
      });

      return finalBadges;
    });
  }
});
