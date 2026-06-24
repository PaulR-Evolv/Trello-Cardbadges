/* global TrelloPowerUp */

// 🛑 1. THE RULEBOOK 🛑
const QC_RULES = [
  
  // ==========================================
  // 🌍 UNIVERSAL RULES
  // ==========================================
  {
    applyToAll: true, 
    requiredFields: ["Video ID"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },

  // ==========================================
  // 🟡 YELLOW REMINDER BADGES
  // ==========================================
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
  {
    listNameContains: "Final Review", 
    requiredFields: ["Final Video Time (Decimal Min)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Video Review TUF",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Video Review THF",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Video Review NKS",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },
  {
    listNameContains: "Video Editing Revision",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "💡 Fill up: ",
    badgeColor: "yellow"
  },

  // ==========================================
  // 🔴 RED MISSING BADGES
  // ==========================================
  {
    listNameContains: "Clips Finished", 
    requiredFields: ["Clip Review Time (Decimal Hour)"], 
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
    listNameContains: "Good for Posting", 
    requiredFields: ["Final Video Time (Decimal Min)"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Videos Scheduled for Posting but Holding for Thumbnail", 
    requiredFields: ["Final Video Time (Decimal Min)"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Ready for VO",
    requiredFields: ["Word Count"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Editing TUF",
    requiredFields: ["Editor"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Editing THF",
    requiredFields: ["Editor"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Editing NKS",
    requiredFields: ["Editor"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Review TUF",
    requiredFields: ["Video Reviewer"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Review THF",
    requiredFields: ["Video Reviewer"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Video Review NKS",
    requiredFields: ["Video Reviewer"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Final Review",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Good for Posting",
    requiredFields: ["Video Review Time (Decimal Hour)"],
    badgePrefix: "⚠️ MISSING: ",
    badgeColor: "red"
  },
  {
    listNameContains: "Videos Scheduled for Posting but Holding for Thumbnail",
    requiredFields: ["Video Review Time (Decimal Hour)"],
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
    
    return Promise.all([
      t.list('name').catch(() => null),
      t.board('customFields').catch(() => null),
      t.card('name', 'customFieldItems', 'labels').catch(() => null) 
    ])
    .then(function(results) {
      const currentList = (results[0] && results[0].name) ? results[0].name : "";
      
      const boardData = results[1] || {};
      const boardCustomFields = Array.isArray(boardData) ? boardData : (boardData.customFields || []);
      
      const cardData = results[2] || {};
      const cardName = cardData.name || "";
      const cardLabels = cardData.labels || [];
      
      const cardFieldData = cardData.customFieldItems || [];
      const cardCustomFields = Array.isArray(cardFieldData) ? cardFieldData : [];

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
    })
    .catch(err => {
      console.error("QC Gatekeeper Crash Error:", err);
      return [];
    });
  }
});
