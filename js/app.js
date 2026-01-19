// Main App Controller
const App = {
  async init() {
    // Check authentication
    if (!Auth.requireAuth()) return;

    // Display user name
    const user = Auth.getUser();
    if (user) {
      document.getElementById('user-name').textContent = user.name;
    }

    // Set up navigation
    this.setupNavigation();

    // Initialize modules
    await Promise.all([
      Calendar.init(),
      Planner.init()
    ]);

    // Load initial data
    this.loadPeopleView();
    this.loadSelectionsView();
  },

  setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.target.dataset.view;
        this.showView(view);
      });
    });
  },

  showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.style.display = 'none';
    });

    // Show selected view
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
      activeView.style.display = 'block';
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      }
    });

    // Refresh data if needed
    if (viewName === 'people') {
      this.loadPeopleView();
    } else if (viewName === 'selections') {
      this.loadSelectionsView();
    } else if (viewName === 'planner') {
      Planner.renderPeopleCheckboxes();
    }
  },

  // People View
  async loadPeopleView() {
    try {
      const people = await Api.getPeople();
      Planner.people = people;
      this.renderPeopleCards(people);
    } catch (error) {
      console.error('Failed to load people:', error);
    }
  },

  renderPeopleCards(people) {
    const container = document.getElementById('people-list');

    if (people.length === 0) {
      container.innerHTML = '<p class="empty-state">No children added yet. Click "Add Child" to get started.</p>';
      return;
    }

    container.innerHTML = people.map(person => {
      const age = Planner.calculateAge(person.birthdate);
      const birthdate = new Date(person.birthdate).toLocaleDateString('de-DE');

      return `
        <article class="person-card">
          <h4>${person.name}</h4>
          <p class="birthdate">Born: ${birthdate}</p>
          <p class="age">Age: ${age} years</p>
          <div class="actions">
            <button class="secondary outline" onclick="showEditPersonModal(${person.id})">Edit</button>
            <button class="secondary outline" onclick="deletePerson(${person.id})">Delete</button>
          </div>
        </article>
      `;
    }).join('');
  },

  // Selections View
  async loadSelectionsView() {
    try {
      const selections = await Api.getSelections();
      this.renderSelectionsCards(selections);
    } catch (error) {
      console.error('Failed to load selections:', error);
    }
  },

  renderSelectionsCards(selections) {
    const container = document.getElementById('selections-list');

    if (selections.length === 0) {
      container.innerHTML = '<p class="empty-state">No saved plans yet. Create a plan in the Planner tab.</p>';
      return;
    }

    container.innerHTML = selections.map(selection => {
      const createdAt = new Date(selection.created_at * 1000).toLocaleDateString('de-DE');
      const campsCount = selection.selections ? selection.selections.length : 0;

      return `
        <article class="selection-card">
          <h4>${selection.name}</h4>
          <p class="meta">Created: ${createdAt}</p>
          <p class="camps-preview">${campsCount} camp selection${campsCount !== 1 ? 's' : ''}</p>
          <p class="total">Total: ${(selection.total_cost || 0).toFixed(2)} EUR</p>
          <div class="actions">
            <button onclick="loadSavedSelection(${selection.id})">Load</button>
            <button class="secondary outline" onclick="deleteSelection(${selection.id})">Delete</button>
          </div>
        </article>
      `;
    }).join('');
  }
};

// Person Modal Functions
function showAddPersonModal() {
  document.getElementById('person-modal-title').textContent = 'Add Child';
  document.getElementById('person-id').value = '';
  document.getElementById('person-name').value = '';
  document.getElementById('person-birthdate').value = '';
  document.getElementById('person-modal').showModal();
}

function showEditPersonModal(personId) {
  const person = Planner.people.find(p => p.id === personId);
  if (!person) return;

  document.getElementById('person-modal-title').textContent = 'Edit Child';
  document.getElementById('person-id').value = person.id;
  document.getElementById('person-name').value = person.name;
  document.getElementById('person-birthdate').value = person.birthdate;
  document.getElementById('person-modal').showModal();
}

function closePersonModal() {
  document.getElementById('person-modal').close();
}

async function handlePersonSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('person-id').value;
  const name = document.getElementById('person-name').value;
  const birthdate = document.getElementById('person-birthdate').value;

  try {
    if (id) {
      await Api.updatePerson(parseInt(id), { name, birthdate });
    } else {
      await Api.addPerson(name, birthdate);
    }

    closePersonModal();
    await App.loadPeopleView();
    Planner.renderPeopleCheckboxes();
  } catch (error) {
    alert('Failed to save: ' + error.message);
  }
}

async function deletePerson(personId) {
  if (!confirm('Are you sure you want to delete this child?')) return;

  try {
    await Api.deletePerson(personId);
    await App.loadPeopleView();
    await Planner.loadPeople();
    Planner.renderPeopleCheckboxes();
  } catch (error) {
    alert('Failed to delete: ' + error.message);
  }
}

// Selection Functions
async function loadSavedSelection(selectionId) {
  try {
    const selections = await Api.getSelections();
    const selection = selections.find(s => s.id === selectionId);
    if (selection) {
      Planner.loadSelection(selection);
    }
  } catch (error) {
    alert('Failed to load selection: ' + error.message);
  }
}

async function deleteSelection(selectionId) {
  if (!confirm('Are you sure you want to delete this saved plan?')) return;

  try {
    await Api.deleteSelection(selectionId);
    await App.loadSelectionsView();
  } catch (error) {
    alert('Failed to delete: ' + error.message);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
