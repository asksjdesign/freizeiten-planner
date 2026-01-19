// Planner Module
const Planner = {
  people: [],
  selectedPeopleIds: new Set(),
  // Map of campId -> Set of personIds
  selections: new Map(),

  async init() {
    await this.loadPeople();
    this.renderPeopleCheckboxes();
  },

  async loadPeople() {
    try {
      this.people = await Api.getPeople();
    } catch (error) {
      console.error('Failed to load people:', error);
      this.people = [];
    }
  },

  calculateAge(birthdate, referenceDate = new Date()) {
    const birth = new Date(birthdate);
    let age = referenceDate.getFullYear() - birth.getFullYear();
    const monthDiff = referenceDate.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  getAgeAtDate(person, date) {
    return this.calculateAge(person.birthdate, new Date(date));
  },

  isEligible(person, camp) {
    if (!camp.alter_min && !camp.alter_max) return true;

    const ageAtCamp = this.getAgeAtDate(person, camp.start_date);

    if (camp.alter_min && ageAtCamp < camp.alter_min) return false;
    if (camp.alter_max && ageAtCamp > camp.alter_max) return false;

    return true;
  },

  renderPeopleCheckboxes() {
    const container = document.getElementById('people-checkboxes');

    if (this.people.length === 0) {
      container.innerHTML = '<p class="empty-state">Add children in the Children tab first</p>';
      return;
    }

    container.innerHTML = this.people.map(person => {
      const age = this.calculateAge(person.birthdate);
      const checked = this.selectedPeopleIds.has(person.id) ? 'checked' : '';
      return `
        <label class="person-checkbox">
          <input type="checkbox" ${checked} onchange="Planner.togglePerson(${person.id})">
          <span>${person.name}</span>
          <span class="age">${age} years</span>
        </label>
      `;
    }).join('');
  },

  togglePerson(personId) {
    if (this.selectedPeopleIds.has(personId)) {
      this.selectedPeopleIds.delete(personId);
      // Remove from all camp selections
      this.selections.forEach((personIds, campId) => {
        personIds.delete(personId);
        if (personIds.size === 0) {
          this.selections.delete(campId);
        }
      });
    } else {
      this.selectedPeopleIds.add(personId);
    }
    this.updateUI();
  },

  isCampSelected(campId) {
    return this.selections.has(campId);
  },

  toggleCampForPerson(campId, personId) {
    if (!this.selections.has(campId)) {
      this.selections.set(campId, new Set());
    }

    const campSelections = this.selections.get(campId);

    if (campSelections.has(personId)) {
      campSelections.delete(personId);
      if (campSelections.size === 0) {
        this.selections.delete(campId);
      }
    } else {
      campSelections.add(personId);
    }

    this.updateUI();
    Calendar.updateEventSelection();
  },

  showCampModal(camp) {
    const modal = document.getElementById('camp-modal');
    document.getElementById('modal-camp-name').textContent = camp.name;

    // Camp details
    const details = document.getElementById('modal-camp-details');
    details.innerHTML = `
      <p><span class="label">Dates:</span> ${this.formatDate(camp.start_date)} - ${this.formatDate(camp.end_date)}</p>
      ${camp.zeit ? `<p><span class="label">Time:</span> ${camp.zeit}</p>` : ''}
      <p><span class="label">Location:</span> ${camp.ort}</p>
      ${camp.veranstaltungsort_adresse ? `<p><span class="label">Address:</span> ${camp.veranstaltungsort_adresse}</p>` : ''}
      <p><span class="label">Age:</span> ${camp.alter_zielgruppe}</p>
      <p><span class="label">Price:</span> ${camp.kosten ? camp.kosten.toFixed(2) + ' EUR' : 'TBD'}</p>
      ${camp.kosten_geschwister ? `<p><span class="label">Sibling Price:</span> ${camp.kosten_geschwister.toFixed(2)} EUR</p>` : ''}
      ${camp.kosten_notiz ? `<p><span class="label">Note:</span> ${camp.kosten_notiz}</p>` : ''}
      ${camp.beschreibung ? `<p><span class="label">Description:</span> ${camp.beschreibung}</p>` : ''}
      ${camp.freie_plaetze ? `<p><span class="label">Available spots:</span> ${camp.freie_plaetze}</p>` : ''}
      ${camp.anmeldeschluss ? `<p><span class="label">Registration deadline:</span> ${this.formatDate(camp.anmeldeschluss)}</p>` : ''}
      ${camp.detail_url ? `<p><a href="${camp.detail_url}" target="_blank">More details</a></p>` : ''}
      ${camp.anmelde_url ? `<p><a href="${camp.anmelde_url}" target="_blank">Register</a></p>` : ''}
    `;

    // Person selection
    const selectionDiv = document.getElementById('modal-camp-selection');
    const selectedPeople = this.people.filter(p => this.selectedPeopleIds.has(p.id));

    if (selectedPeople.length === 0) {
      selectionDiv.innerHTML = '<p class="empty-state">Select children above first</p>';
    } else {
      selectionDiv.innerHTML = selectedPeople.map(person => {
        const eligible = this.isEligible(person, camp);
        const ageAtCamp = this.getAgeAtDate(person, camp.start_date);
        const isSelected = this.selections.get(camp.id)?.has(person.id) || false;

        if (!eligible) {
          return `
            <div class="camp-person-select ineligible">
              <span>${person.name} (${ageAtCamp} at camp)</span>
              <span class="ineligible-reason">Age ${ageAtCamp} not in range ${camp.alter_min || '?'}-${camp.alter_max || '?'}</span>
            </div>
          `;
        }

        return `
          <label class="camp-person-select">
            <span>${person.name} (${ageAtCamp} at camp)</span>
            <input type="checkbox" ${isSelected ? 'checked' : ''}
              onchange="Planner.toggleCampForPerson(${camp.id}, ${person.id})">
          </label>
        `;
      }).join('');
    }

    modal.showModal();
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  updateUI() {
    this.renderSelectedCamps();
    this.renderCostBreakdown();
  },

  renderSelectedCamps() {
    const container = document.getElementById('selected-camps');

    if (this.selections.size === 0) {
      container.innerHTML = '<p class="empty-state">Click on camps in the calendar to select them</p>';
      return;
    }

    const campItems = [];
    this.selections.forEach((personIds, campId) => {
      const camp = Calendar.camps.find(c => c.id === campId);
      if (camp && personIds.size > 0) {
        const peopleNames = Array.from(personIds)
          .map(pid => this.people.find(p => p.id === pid)?.name || 'Unknown')
          .join(', ');

        campItems.push(`
          <div class="selected-camp-item">
            <div>
              <div class="camp-name">${camp.name}</div>
              <div class="camp-people">${peopleNames}</div>
            </div>
            <button class="secondary outline" onclick="Planner.removeCamp(${campId})">Remove</button>
          </div>
        `);
      }
    });

    container.innerHTML = campItems.join('');
  },

  removeCamp(campId) {
    this.selections.delete(campId);
    this.updateUI();
    Calendar.updateEventSelection();
  },

  calculateCost() {
    let total = 0;
    const breakdown = [];

    this.selections.forEach((personIds, campId) => {
      const camp = Calendar.camps.find(c => c.id === campId);
      if (!camp || !camp.kosten) return;

      const peopleCount = personIds.size;
      if (peopleCount === 0) return;

      // First person pays full price
      let campCost = camp.kosten;

      // Additional people pay sibling price if available
      if (peopleCount > 1 && camp.kosten_geschwister) {
        campCost += camp.kosten_geschwister * (peopleCount - 1);
        breakdown.push({
          camp: camp.name,
          cost: campCost,
          detail: `1 x ${camp.kosten.toFixed(2)} + ${peopleCount - 1} x ${camp.kosten_geschwister.toFixed(2)} (sibling)`,
          hasSiblingDiscount: true
        });
      } else {
        campCost = camp.kosten * peopleCount;
        breakdown.push({
          camp: camp.name,
          cost: campCost,
          detail: `${peopleCount} x ${camp.kosten.toFixed(2)}`,
          hasSiblingDiscount: false
        });
      }

      total += campCost;
    });

    return { total, breakdown };
  },

  renderCostBreakdown() {
    const { total, breakdown } = this.calculateCost();
    const container = document.getElementById('cost-breakdown');
    const totalEl = document.getElementById('total-cost');

    if (breakdown.length === 0) {
      container.innerHTML = '<p class="empty-state">No camps selected</p>';
      totalEl.textContent = '0.00';
      return;
    }

    container.innerHTML = breakdown.map(item => `
      <div class="cost-line ${item.hasSiblingDiscount ? 'sibling-discount' : ''}">
        <span>${item.camp}</span>
        <span>${item.cost.toFixed(2)} EUR</span>
      </div>
      <div class="cost-line" style="font-size: 0.75rem; color: var(--pico-muted-color);">
        <span>${item.detail}</span>
      </div>
    `).join('');

    totalEl.textContent = total.toFixed(2);
  },

  async saveSelection() {
    const { total } = this.calculateCost();

    if (this.selections.size === 0) {
      alert('Please select at least one camp first');
      return;
    }

    const name = prompt('Enter a name for this plan:', `Plan ${new Date().toLocaleDateString('de-DE')}`);
    if (!name) return;

    // Convert selections to array format
    const selectionsArray = [];
    this.selections.forEach((personIds, campId) => {
      personIds.forEach(personId => {
        selectionsArray.push({ person_id: personId, freizeit_id: campId });
      });
    });

    try {
      await Api.saveSelection(name, selectionsArray, total);
      alert('Plan saved successfully!');
    } catch (error) {
      alert('Failed to save plan: ' + error.message);
    }
  },

  clearSelection() {
    if (this.selections.size > 0) {
      if (!confirm('Are you sure you want to clear all selections?')) return;
    }

    this.selections.clear();
    this.updateUI();
    Calendar.updateEventSelection();
  },

  loadSelection(selection) {
    // Clear current selections
    this.selections.clear();

    // Rebuild selections from saved data
    if (selection.selections && Array.isArray(selection.selections)) {
      selection.selections.forEach(item => {
        const campId = item.freizeit_id;
        const personId = item.person_id;

        if (!this.selections.has(campId)) {
          this.selections.set(campId, new Set());
        }
        this.selections.get(campId).add(personId);

        // Make sure person is in selectedPeopleIds
        this.selectedPeopleIds.add(personId);
      });
    }

    this.renderPeopleCheckboxes();
    this.updateUI();
    Calendar.updateEventSelection();

    // Switch to planner view
    App.showView('planner');
  }
};

function closeCampModal() {
  document.getElementById('camp-modal').close();
}
