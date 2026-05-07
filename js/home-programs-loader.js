(function() {
  function addNFLDraftTrip() {
    var accordion = document.querySelector('.gameday-banner .gameday-accordion');
    if (!accordion || document.getElementById('gdaNFLDraft')) return;

    var card = document.createElement('div');
    card.className = 'gda-card';
    card.id = 'gdaNFLDraft';
    card.innerHTML = `
      <button class="gda-trigger" onclick="toggleGDA('gdaNFLDraft')">
        <div class="gda-trigger-left">
          <span class="gda-title">NFL DRAFT TRIP</span>
          <span class="gda-subtitle">2027</span>
        </div>
        <div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div>
      </button>
      <div class="gda-body">
        <div class="gda-body-inner">
          <p class="gda-detail"><strong>Exclusive Live Experience:</strong> Attend the official NFL Draft in Washington, D.C. with your team</p>
          <p class="gda-detail"><strong>Team Travel &amp; Group Access:</strong> Organized transportation, coordinated meet-up points, and full group experience</p>
          <p class="gda-detail"><strong>Player Motivation &amp; Exposure:</strong> See the highest level up close and connect camp training to real NFL dreams</p>
          <span class="gda-badge" style="margin-top:8px;">2027</span>
        </div>
      </div>
    `;
    accordion.appendChild(card);
  }

  var script = document.createElement('script');
  script.src = 'js/home-programs-fix.js?v=' + Date.now();
  script.defer = true;
  document.head.appendChild(script);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNFLDraftTrip);
  } else {
    addNFLDraftTrip();
  }
})();
