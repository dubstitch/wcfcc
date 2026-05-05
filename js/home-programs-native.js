document.addEventListener('DOMContentLoaded', () => {
  const diag = document.getElementById('diagPrograms');
  if (!diag) return;

  const helperText = diag.previousElementSibling;
  if (helperText && helperText.textContent.trim().toLowerCase().includes('tap a side')) {
    helperText.textContent = 'Tap a program to expand';
  }

  diag.className = 'gameday-accordion anim anim-d4';
  diag.removeAttribute('id');
  diag.innerHTML = `
    <div class="gda-card is-open" id="homeFootball">
      <button class="gda-trigger" type="button" onclick="toggleGDA('homeFootball')">
        <div class="gda-trigger-left">
          <span class="gda-title">FOOTBALL COMBINE CAMP</span>
          <span class="gda-subtitle">Combine testing, position training, and weekly 7 on 7 competition</span>
        </div>
        <div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div>
      </button>
      <div class="gda-body">
        <div class="gda-body-inner">
          <p class="gda-desc">An intensive 6-week combine style training program built to develop athletic skill, game strategy, and competitive edge through structured evaluation and 7 on 7 competition.</p>
          <p class="gda-detail"><strong>Combine testing</strong> and skill tracking</p>
          <p class="gda-detail"><strong>Position specific training</strong> for each athlete</p>
          <p class="gda-detail"><strong>Weekly 7 on 7 competition</strong> every Friday</p>
          <p class="gda-detail"><strong>Championship Day</strong> with trophies</p>
          <span class="gda-badge">Ages 9–17</span>
          <a href="pages/football.html" class="diag-cta" style="margin-top:18px;">Learn More <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </div>
    <div class="gda-card" id="homeCheer">
      <button class="gda-trigger" type="button" onclick="toggleGDA('homeCheer')">
        <div class="gda-trigger-left">
          <span class="gda-title">SIDELINE CHEER CAMP</span>
          <span class="gda-subtitle">Sideline cheers, choreography, and game day performance</span>
        </div>
        <div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div>
      </button>
      <div class="gda-body">
        <div class="gda-body-inner">
          <p class="gda-desc">A 6-week sideline cheer program designed to build confident young women through technique, teamwork, and real game-day performance experience.</p>
          <p class="gda-detail"><strong>Sideline cheers</strong> motions and jumps</p>
          <p class="gda-detail"><strong>Choreographed sideline dances</strong></p>
          <p class="gda-detail"><strong>Weekly game day performances</strong></p>
          <p class="gda-detail"><strong>Mummers Parade performance</strong></p>
          <span class="gda-badge">Ages 8–13</span>
          <a href="pages/cheer.html" class="diag-cta" style="margin-top:18px;">Learn More <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </div>
  `;
});
