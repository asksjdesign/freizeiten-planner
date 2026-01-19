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
      container.innerHTML = `<p class="empty-state">${I18n.t('addChildrenFirst')}</p>`;
      return;
    }

    container.innerHTML = this.people.map(person => {
      const age = this.calculateAge(person.birthdate);
      const checked = this.selectedPeopleIds.has(person.id) ? 'checked' : '';
      return `
        <label class="person-checkbox">
          <input type="checkbox" ${checked} onchange="Planner.togglePerson(${person.id})">
          <span>${person.name}</span>
          <span class="age">${age} ${I18n.t('years')}</span>
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
    Calendar.filterBySelectedPeople();
  },

  getEligibleCamps() {
    // If no people selected, show all camps
    if (this.selectedPeopleIds.size === 0) {
      return Calendar.camps;
    }

    // Filter to camps where at least one selected person is eligible
    const selectedPeople = this.people.filter(p => this.selectedPeopleIds.has(p.id));
    return Calendar.camps.filter(camp => {
      return selectedPeople.some(person => this.isEligible(person, camp));
    });
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
      <p><span class="label">${I18n.t('dates')}:</span> ${this.formatDate(camp.start_date)} - ${this.formatDate(camp.end_date)}</p>
      ${camp.zeit ? `<p><span class="label">${I18n.t('time')}:</span> ${camp.zeit}</p>` : ''}
      <p><span class="label">${I18n.t('location')}:</span> ${camp.ort}</p>
      ${camp.veranstaltungsort_adresse ? `<p><span class="label">${I18n.t('address')}:</span> ${camp.veranstaltungsort_adresse}</p>` : ''}
      <p><span class="label">${I18n.t('age')}:</span> ${camp.alter_zielgruppe}</p>
      <p><span class="label">${I18n.t('price')}:</span> ${camp.kosten ? camp.kosten.toFixed(2) + ' EUR' : I18n.t('tbd')}</p>
      ${camp.kosten_fruehbucher ? `<p><span class="label">${I18n.t('earlyBird')}:</span> ${camp.kosten_fruehbucher.toFixed(2)} EUR ${camp.fruehbucher_bis ? `(${I18n.t('until')} ${this.formatDate(camp.fruehbucher_bis)})` : ''} ${this.isEarlyBirdActive(camp) ? `<span class="early-bird-active">✓ ${I18n.t('active')}</span>` : `<span class="early-bird-expired">${I18n.t('expired')}</span>`}</p>` : ''}
      ${camp.kosten_geschwister ? `<p><span class="label">${I18n.t('siblingPrice')}:</span> ${camp.kosten_geschwister.toFixed(2)} EUR</p>` : ''}
      ${camp.kosten_notiz ? `<p><span class="label">${I18n.t('note')}:</span> ${camp.kosten_notiz}</p>` : ''}
      ${camp.beschreibung ? `<p><span class="label">${I18n.t('description')}:</span> ${camp.beschreibung}</p>` : ''}
      ${camp.freie_plaetze ? `<p><span class="label">${I18n.t('availableSpots')}:</span> ${camp.freie_plaetze}</p>` : ''}
      ${camp.anmeldeschluss ? `<p><span class="label">${I18n.t('registrationDeadline')}:</span> ${this.formatDate(camp.anmeldeschluss)}</p>` : ''}
      ${camp.detail_url ? `<p><a href="${camp.detail_url}" target="_blank">${I18n.t('moreDetails')}</a></p>` : ''}
      ${camp.anmelde_url ? `<p><a href="${camp.anmelde_url}" target="_blank">${I18n.t('register')}</a></p>` : ''}
    `;

    // Person selection
    const selectionDiv = document.getElementById('modal-camp-selection');
    const selectedPeople = this.people.filter(p => this.selectedPeopleIds.has(p.id));

    if (selectedPeople.length === 0) {
      selectionDiv.innerHTML = `<p class="empty-state">${I18n.t('selectChildrenFirst')}</p>`;
    } else {
      selectionDiv.innerHTML = selectedPeople.map(person => {
        const eligible = this.isEligible(person, camp);
        const ageAtCamp = this.getAgeAtDate(person, camp.start_date);
        const isSelected = this.selections.get(camp.id)?.has(person.id) || false;

        if (!eligible) {
          return `
            <div class="camp-person-select ineligible">
              <span>${person.name} (${ageAtCamp} ${I18n.t('atCamp')})</span>
              <span class="ineligible-reason">${I18n.t('ageNotInRange')} ${camp.alter_min || '?'}-${camp.alter_max || '?'}</span>
            </div>
          `;
        }

        return `
          <label class="camp-person-select">
            <span>${person.name} (${ageAtCamp} ${I18n.t('atCamp')})</span>
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

  isEarlyBirdActive(camp) {
    if (!camp.kosten_fruehbucher || !camp.fruehbucher_bis) return false;
    const deadline = new Date(camp.fruehbucher_bis);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today <= deadline;
  },

  getEffectivePrice(camp) {
    if (camp.kosten === null || camp.kosten === undefined) return null;
    if (this.isEarlyBirdActive(camp) && camp.kosten_fruehbucher) {
      return camp.kosten_fruehbucher;
    }
    return camp.kosten;
  },

  getEffectiveSiblingPrice(camp) {
    if (!camp.kosten_geschwister) return this.getEffectivePrice(camp);
    // If early bird is active, calculate proportional sibling discount
    if (this.isEarlyBirdActive(camp) && camp.kosten_fruehbucher) {
      // Apply same percentage reduction to sibling price
      const regularRatio = camp.kosten_geschwister / camp.kosten;
      return camp.kosten_fruehbucher * regularRatio;
    }
    return camp.kosten_geschwister;
  },

  updateUI() {
    this.renderCostBreakdown();
  },

  removeCamp(campId) {
    this.selections.delete(campId);
    this.updateUI();
    Calendar.updateEventSelection();
  },

  calculateCost() {
    let total = 0;
    const breakdown = [];
    const campsWithoutPrice = [];

    this.selections.forEach((personIds, campId) => {
      const camp = Calendar.camps.find(c => c.id === campId);
      if (!camp) return;

      const peopleCount = personIds.size;
      if (peopleCount === 0) return;

      const peopleNames = Array.from(personIds)
        .map(pid => this.people.find(p => p.id === pid)?.name || 'Unknown')
        .join(', ');

      const effectivePrice = this.getEffectivePrice(camp);

      // Track camps without pricing
      if (effectivePrice === null) {
        campsWithoutPrice.push({ campId, camp, peopleNames });
        return;
      }

      const isEarlyBird = this.isEarlyBirdActive(camp);
      const effectiveSiblingPrice = this.getEffectiveSiblingPrice(camp);
      const hasSiblingPrice = camp.kosten_geschwister && peopleCount > 1;

      // First person pays effective price (early bird or regular)
      let campCost = effectivePrice;
      let detail;

      // Additional people pay sibling price if available
      if (hasSiblingPrice) {
        campCost += effectiveSiblingPrice * (peopleCount - 1);
        detail = `1 x ${effectivePrice.toFixed(2)} + ${peopleCount - 1} x ${effectiveSiblingPrice.toFixed(2)} (${I18n.t('sibling')})`;
      } else {
        campCost = effectivePrice * peopleCount;
        detail = `${peopleCount} x ${effectivePrice.toFixed(2)}`;
      }
      if (isEarlyBird) detail += ` [${I18n.t('earlyBirdLabel')}]`;

      breakdown.push({
        campId,
        camp: camp.name,
        peopleNames,
        cost: campCost,
        detail,
        hasSiblingDiscount: hasSiblingPrice,
        hasEarlyBird: isEarlyBird
      });

      total += campCost;
    });

    return { total, breakdown, campsWithoutPrice };
  },

  renderCostBreakdown() {
    const { total, breakdown, campsWithoutPrice } = this.calculateCost();
    const container = document.getElementById('cost-breakdown');
    const totalEl = document.getElementById('total-cost');

    if (breakdown.length === 0 && campsWithoutPrice.length === 0) {
      container.innerHTML = `<p class="empty-state">${I18n.t('clickToSelect')}</p>`;
      totalEl.textContent = '0.00';
      return;
    }

    let html = breakdown.map(item => `
      <div class="camp-cost-item ${item.hasSiblingDiscount ? 'sibling-discount' : ''} ${item.hasEarlyBird ? 'early-bird' : ''}">
        <div class="camp-cost-header">
          <div class="camp-cost-info">
            <div class="camp-cost-name">${item.camp}</div>
            <div class="camp-cost-people">${item.peopleNames}</div>
          </div>
          <div class="camp-cost-right">
            <span class="camp-cost-price">${item.cost.toFixed(2)} EUR</span>
            <button class="remove-btn" onclick="Planner.removeCamp(${item.campId})" title="Remove">&times;</button>
          </div>
        </div>
        <div class="camp-cost-detail">${item.detail}</div>
      </div>
    `).join('');

    // Add camps without pricing
    if (campsWithoutPrice.length > 0) {
      html += campsWithoutPrice.map(item => `
        <div class="camp-cost-item no-price">
          <div class="camp-cost-header">
            <div class="camp-cost-info">
              <div class="camp-cost-name">${item.camp.name}</div>
              <div class="camp-cost-people">${item.peopleNames}</div>
            </div>
            <div class="camp-cost-right">
              <span class="camp-cost-price">${I18n.t('tbd')}</span>
              <button class="remove-btn" onclick="Planner.removeCamp(${item.campId})" title="Remove">&times;</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = html;
    totalEl.textContent = total.toFixed(2);
  },

  async saveSelection() {
    const { total } = this.calculateCost();

    if (this.selections.size === 0) {
      alert(I18n.t('selectCampFirst'));
      return;
    }

    const name = prompt(I18n.t('enterPlanName'), `${I18n.t('planDefault')} ${new Date().toLocaleDateString('de-DE')}`);
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
      alert(I18n.t('planSaved'));
    } catch (error) {
      alert(I18n.t('failedToSave') + ': ' + error.message);
    }
  },

  clearSelection() {
    if (this.selections.size > 0) {
      if (!confirm(I18n.t('confirmClear'))) return;
    }

    this.selections.clear();
    this.updateUI();
    Calendar.updateEventSelection();
  },

  loadSelection(selection) {
    // Clear current selections
    this.selections.clear();
    this.selectedPeopleIds.clear();

    // Handle selections - could be array or object depending on how Xano returns it
    let selectionsArray = selection.selections;
    if (selectionsArray && typeof selectionsArray === 'object' && !Array.isArray(selectionsArray)) {
      // Convert object to array if needed
      selectionsArray = Object.values(selectionsArray);
    }

    // Rebuild selections from saved data
    if (selectionsArray && Array.isArray(selectionsArray)) {
      selectionsArray.forEach(item => {
        const campId = item.freizeit_id;
        const personId = item.person_id;

        // Verify person exists in our people list
        const personExists = this.people.some(p => p.id === personId);
        if (!personExists) {
          console.warn(`Person ID ${personId} not found in people list`);
          return;
        }

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

    // Show all camps first, then update selection state
    Calendar.renderCamps();
    Calendar.updateEventSelection();

    // Switch to planner view
    App.showView('planner');
  },

  showExpandedView() {
    if (this.selections.size === 0) return;

    const modal = document.getElementById('expanded-modal');
    const content = document.getElementById('expanded-content');
    const totalEl = document.getElementById('expanded-total-cost');

    const { total, breakdown, campsWithoutPrice } = this.calculateCost();

    let html = '<div class="expanded-camps-grid">';

    // Add camps with pricing
    breakdown.forEach(item => {
      const camp = Calendar.camps.find(c => c.id === item.campId);
      if (!camp) return;

      html += `
        <div class="expanded-camp-card ${item.hasEarlyBird ? 'early-bird' : ''}">
          <div class="expanded-camp-header">
            <h4>${camp.name}</h4>
            <button class="remove-btn" onclick="Planner.removeCamp(${item.campId}); Planner.showExpandedView();" title="Remove">&times;</button>
          </div>
          <div class="expanded-camp-details">
            <p><strong>${I18n.t('dates')}:</strong> ${this.formatDate(camp.start_date)} - ${this.formatDate(camp.end_date)}</p>
            <p><strong>${I18n.t('location')}:</strong> ${camp.ort}</p>
            ${camp.veranstaltungsort_adresse ? `<p><strong>${I18n.t('address')}:</strong> ${camp.veranstaltungsort_adresse}</p>` : ''}
            <p><strong>${I18n.t('age')}:</strong> ${camp.alter_zielgruppe}</p>
            ${camp.beschreibung ? `<p class="camp-description">${camp.beschreibung}</p>` : ''}
          </div>
          <div class="expanded-camp-footer">
            <div class="camp-attendees">
              <strong>${I18n.t('children')}:</strong> ${item.peopleNames}
            </div>
            <div class="camp-price">
              <span class="price-amount">${item.cost.toFixed(2)} EUR</span>
              <span class="price-detail">${item.detail}</span>
            </div>
          </div>
        </div>
      `;
    });

    // Add camps without pricing
    campsWithoutPrice.forEach(item => {
      const camp = item.camp;
      html += `
        <div class="expanded-camp-card no-price">
          <div class="expanded-camp-header">
            <h4>${camp.name}</h4>
            <button class="remove-btn" onclick="Planner.removeCamp(${item.campId}); Planner.showExpandedView();" title="Remove">&times;</button>
          </div>
          <div class="expanded-camp-details">
            <p><strong>${I18n.t('dates')}:</strong> ${this.formatDate(camp.start_date)} - ${this.formatDate(camp.end_date)}</p>
            <p><strong>${I18n.t('location')}:</strong> ${camp.ort}</p>
            ${camp.veranstaltungsort_adresse ? `<p><strong>${I18n.t('address')}:</strong> ${camp.veranstaltungsort_adresse}</p>` : ''}
            <p><strong>${I18n.t('age')}:</strong> ${camp.alter_zielgruppe}</p>
            ${camp.beschreibung ? `<p class="camp-description">${camp.beschreibung}</p>` : ''}
          </div>
          <div class="expanded-camp-footer">
            <div class="camp-attendees">
              <strong>${I18n.t('children')}:</strong> ${item.peopleNames}
            </div>
            <div class="camp-price">
              <span class="price-amount">${I18n.t('tbd')}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';

    content.innerHTML = html;
    totalEl.textContent = total.toFixed(2);
    modal.showModal();
  }
};

function closeCampModal() {
  document.getElementById('camp-modal').close();
}

function closeExpandedModal() {
  document.getElementById('expanded-modal').close();
}
