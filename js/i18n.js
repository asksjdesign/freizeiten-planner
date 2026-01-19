// Internationalization
const I18n = {
  currentLang: localStorage.getItem('lang') || 'de',

  translations: {
    en: {
      // Auth
      appTitle: 'Freizeiten Planner',
      appSubtitle: 'Plan summer camps for your children',
      login: 'Login',
      email: 'Email',
      password: 'Password',
      createAccount: 'Create Account',
      name: 'Name',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      hasAccount: 'Already have an account?',
      loginFailed: 'Login failed',
      signupFailed: 'Signup failed',
      logout: 'Logout',

      // Navigation
      planner: 'Planner',
      children: 'Children',
      savedPlans: 'Saved Plans',

      // Planner
      selectChildren: 'Select Children',
      selectedCamps: 'Selected Camps',
      clickToSelect: 'Click on camps in the calendar to select them',
      total: 'Total',
      savePlan: 'Save Plan',
      clear: 'Clear',
      years: 'years',
      addChildrenFirst: 'Add children in the Children tab first',

      // Camp Modal
      dates: 'Dates',
      time: 'Time',
      location: 'Location',
      address: 'Address',
      age: 'Age',
      price: 'Price',
      earlyBird: 'Early Bird',
      siblingPrice: 'Sibling Price',
      note: 'Note',
      description: 'Description',
      availableSpots: 'Available spots',
      registrationDeadline: 'Registration deadline',
      moreDetails: 'More details',
      register: 'Register',
      active: 'Active',
      expired: 'Expired',
      atCamp: 'at camp',
      ageNotInRange: 'Age not in range',
      selectChildrenFirst: 'Select children above first',
      tbd: 'TBD',
      until: 'until',

      // Children
      manageChildren: 'Manage Children',
      addChild: 'Add Child',
      editChild: 'Edit Child',
      oldestFirst: 'Oldest first',
      youngestFirst: 'Youngest first',
      born: 'Born',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      noChildren: 'No children added yet. Click "Add Child" to get started.',
      confirmDelete: 'Are you sure you want to delete this child?',
      childName: "Child's name",

      // Saved Plans
      savedPlansTitle: 'Saved Plans',
      created: 'Created',
      campSelections: 'camp selection',
      campSelectionsPlural: 'camp selections',
      load: 'Load',
      noSavedPlans: 'No saved plans yet. Create a plan in the Planner tab.',
      confirmDeletePlan: 'Are you sure you want to delete this saved plan?',
      confirmClear: 'Are you sure you want to clear all selections?',
      enterPlanName: 'Enter a name for this plan:',
      planDefault: 'Plan',
      selectCampFirst: 'Please select at least one camp first',
      planSaved: 'Plan saved successfully!',

      // Errors
      failedToSave: 'Failed to save',
      failedToDelete: 'Failed to delete',
      failedToLoad: 'Failed to load selection',

      // Cost
      sibling: 'sibling',
      earlyBirdLabel: 'Early Bird',
      priceTbd: 'Price TBD'
    },
    de: {
      // Auth
      appTitle: 'Freizeiten Planner',
      appSubtitle: 'Sommercamps für deine Kinder planen',
      login: 'Anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      createAccount: 'Konto erstellen',
      name: 'Name',
      noAccount: 'Noch kein Konto?',
      signUp: 'Registrieren',
      hasAccount: 'Bereits ein Konto?',
      loginFailed: 'Anmeldung fehlgeschlagen',
      signupFailed: 'Registrierung fehlgeschlagen',
      logout: 'Abmelden',

      // Navigation
      planner: 'Planer',
      children: 'Kinder',
      savedPlans: 'Gespeicherte Pläne',

      // Planner
      selectChildren: 'Kinder auswählen',
      selectedCamps: 'Ausgewählte Camps',
      clickToSelect: 'Klicke auf Camps im Kalender um sie auszuwählen',
      total: 'Gesamt',
      savePlan: 'Plan speichern',
      clear: 'Löschen',
      years: 'Jahre',
      addChildrenFirst: 'Füge zuerst Kinder im Kinder-Tab hinzu',

      // Camp Modal
      dates: 'Datum',
      time: 'Zeit',
      location: 'Ort',
      address: 'Adresse',
      age: 'Alter',
      price: 'Preis',
      earlyBird: 'Frühbucher',
      siblingPrice: 'Geschwisterpreis',
      note: 'Hinweis',
      description: 'Beschreibung',
      availableSpots: 'Freie Plätze',
      registrationDeadline: 'Anmeldeschluss',
      moreDetails: 'Mehr Details',
      register: 'Anmelden',
      active: 'Aktiv',
      expired: 'Abgelaufen',
      atCamp: 'beim Camp',
      ageNotInRange: 'Alter nicht im Bereich',
      selectChildrenFirst: 'Wähle zuerst oben Kinder aus',
      tbd: 'TBD',
      until: 'bis',

      // Children
      manageChildren: 'Kinder verwalten',
      addChild: 'Kind hinzufügen',
      editChild: 'Kind bearbeiten',
      oldestFirst: 'Älteste zuerst',
      youngestFirst: 'Jüngste zuerst',
      born: 'Geboren',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      noChildren: 'Noch keine Kinder hinzugefügt. Klicke auf "Kind hinzufügen".',
      confirmDelete: 'Möchtest du dieses Kind wirklich löschen?',
      childName: 'Name des Kindes',

      // Saved Plans
      savedPlansTitle: 'Gespeicherte Pläne',
      created: 'Erstellt',
      campSelections: 'Camp-Auswahl',
      campSelectionsPlural: 'Camp-Auswahlen',
      load: 'Laden',
      noSavedPlans: 'Noch keine Pläne gespeichert. Erstelle einen Plan im Planer-Tab.',
      confirmDeletePlan: 'Möchtest du diesen gespeicherten Plan wirklich löschen?',
      confirmClear: 'Möchtest du wirklich alle Auswahlen löschen?',
      enterPlanName: 'Gib einen Namen für diesen Plan ein:',
      planDefault: 'Plan',
      selectCampFirst: 'Bitte wähle zuerst mindestens ein Camp aus',
      planSaved: 'Plan erfolgreich gespeichert!',

      // Errors
      failedToSave: 'Speichern fehlgeschlagen',
      failedToDelete: 'Löschen fehlgeschlagen',
      failedToLoad: 'Plan laden fehlgeschlagen',

      // Cost
      sibling: 'Geschwister',
      earlyBirdLabel: 'Frühbucher',
      priceTbd: 'Preis TBD'
    }
  },

  t(key) {
    return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.updatePage();
  },

  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Update language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    // Trigger custom event for dynamic content updates
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  },

  init() {
    this.updatePage();
  }
};
