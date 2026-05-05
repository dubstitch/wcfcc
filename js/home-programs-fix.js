document.addEventListener('DOMContentLoaded', () => {
  const diag = document.getElementById('diagPrograms');
  if (!diag) return;

  diag.outerHTML = `
    <div class="gameday-accordion anim anim-d4 home-program-accordion">
      <div class="gda-card is-open" id="homeFootballProgram">
        <button class="gda-trigger" onclick="toggleGDA('homeFootballProgram')">
          <div class="gda-trigger-left">
            <span class="gda-title">FOOTBALL COMBINE CAMP</span>
            <span class="gda-subtitle">Combine testing, position training, and weekly 7 on 7 competition</span>
          </div>
          <div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div>
        </button>
        <div class="gda-body">
          <div class="gda-body-inner">
            <p class="gda-desc">An intensive 6-week combine style training program built to develop athletic skill, game strategy, and competitive edge through structured evaluation and 7 on 7 competition.</p>
            <p class="gda-detail"><strong>Training:</strong> Combine testing, skill tracking, and position specific coaching</p>
            <p class="gda-detail"><strong>Competition:</strong> Weekly 7 on 7 game reps every Friday</p>
            <p class="gda-detail"><strong>Finale:</strong> Championship Day with trophies</p>
            <span class="gda-badge">Ages 9-17</span>
            <a href="pages/football.html" class="diag-cta" style="margin-top:18px;">Learn More <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </div>

      <div class="gda-card" id="homeCheerProgram">
        <button class="gda-trigger" onclick="toggleGDA('homeCheerProgram')">
          <div class="gda-trigger-left">
            <span class="gda-title">SIDELINE CHEER CAMP</span>
            <span class="gda-subtitle">Sideline cheers, motions, jumps, choreography, and game day performance</span>
          </div>
          <div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div>
        </button>
        <div class="gda-body">
          <div class="gda-body-inner">
            <p class="gda-desc">A 6-week sideline cheer program designed to build confident young women through technique, teamwork, and real game-day performance experience.</p>
            <p class="gda-detail"><strong>Training:</strong> Sideline cheers, motions, jumps, and choreographed sideline dances</p>
            <p class="gda-detail"><strong>Performance:</strong> Weekly game day sideline reps</p>
            <p class="gda-detail"><strong>Finale:</strong> Mummers Parade performance</p>
            <span class="gda-badge">Ages 8-13</span>
            <a href="pages/cheer.html" class="diag-cta" style="margin-top:18px;">Learn More <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </div>
    </div>
  `;

  const tapText = document.querySelector('.programs .section-subtitle[style*="Tap a side"]');
  if (tapText) {
    tapText.textContent = 'Tap a program to expand';
  }
});
