// Calendar Module
const Calendar = {
  instance: null,
  camps: [],
  currentView: 'calendar',

  getSourceClass(source) {
    switch (source) {
      case 'Kids Team': return 'fc-event-kids-team';
      case 'Neues Leben': return 'fc-event-neues-leben';
      case 'Schloss Klaus': return 'fc-event-schloss-klaus';
      default: return '';
    }
  },

  async init() {
    const calendarEl = document.getElementById('calendar');

    this.instance = new FullCalendar.Calendar(calendarEl, {
      initialView: 'multiMonth',
      locale: 'de',
      firstDay: 1,
      height: 'auto',
      multiMonthMaxColumns: 1,
      multiMonthMinWidth: 300,
      duration: { months: 12 },
      headerToolbar: {
        left: '',
        center: 'title',
        right: ''
      },
      titleFormat: { year: 'numeric' },
      eventClick: (info) => {
        const camp = this.camps.find(c => c.id === parseInt(info.event.id));
        if (camp) {
          Planner.showCampModal(camp);
        }
      },
      eventDidMount: (info) => {
        // Add selected class if camp is selected
        if (Planner.isCampSelected(parseInt(info.event.id))) {
          info.el.classList.add('fc-event-selected');
        }
      }
    });

    this.instance.render();
    await this.loadCamps();
  },

  async loadCamps() {
    try {
      this.camps = await Api.getCamps();
      this.renderCamps();
      this.jumpToFirstEvent();
    } catch (error) {
      console.error('Failed to load camps:', error);
    }
  },

  jumpToFirstEvent() {
    if (this.camps.length === 0) return;

    // Find the earliest camp start date
    const earliestDate = this.camps.reduce((earliest, camp) => {
      const startDate = new Date(camp.start_date);
      return startDate < earliest ? startDate : earliest;
    }, new Date(this.camps[0].start_date));

    this.instance.gotoDate(earliestDate);
  },

  renderCamps(campsToShow = null) {
    // Clear existing events
    this.instance.removeAllEvents();

    // Use filtered camps if provided, otherwise all camps
    const displayCamps = campsToShow || this.camps;

    // Add camp events
    const events = displayCamps.map(camp => ({
      id: camp.id.toString(),
      title: camp.name,
      start: camp.start_date,
      end: this.getEndDateForCalendar(camp.end_date),
      allDay: true,
      classNames: [this.getSourceClass(camp.source)],
      extendedProps: { camp }
    }));

    this.instance.addEventSource(events);
  },

  filterBySelectedPeople() {
    const eligibleCamps = Planner.getEligibleCamps();
    this.renderCamps(eligibleCamps);
  },

  getEndDateForCalendar(endDate) {
    // FullCalendar end dates are exclusive, so add 1 day
    const date = new Date(endDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  },

  updateEventSelection() {
    // Re-render with current filter and selection state
    this.filterBySelectedPeople();
    if (this.currentView === 'list') {
      this.renderCampsList();
    }
  },

  showView(view) {
    this.currentView = view;
    const calendarEl = document.getElementById('calendar');
    const listEl = document.getElementById('camps-list');
    const buttons = document.querySelectorAll('.view-toggle-btn');

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'calendar') {
      calendarEl.style.display = 'block';
      listEl.style.display = 'none';
    } else {
      calendarEl.style.display = 'none';
      listEl.style.display = 'block';
      this.renderCampsList();
    }
  },

  renderCampsList() {
    const container = document.getElementById('camps-list');
    const eligibleCamps = Planner.getEligibleCamps();
    const campsToShow = eligibleCamps.length > 0 ? eligibleCamps : this.camps;

    // Sort by start date
    const sortedCamps = [...campsToShow].sort((a, b) =>
      new Date(a.start_date) - new Date(b.start_date)
    );

    if (sortedCamps.length === 0) {
      container.innerHTML = `<p class="empty-state">${I18n.t('noCamps')}</p>`;
      return;
    }

    container.innerHTML = sortedCamps.map(camp => {
      const startDate = new Date(camp.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      const endDate = new Date(camp.end_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
      const isSelected = Planner.isCampSelected(camp.id);
      const sourceClass = this.getSourceClass(camp.source);

      return `
        <div class="camp-list-card ${sourceClass} ${isSelected ? 'selected' : ''}" onclick="Planner.showCampModal(Calendar.camps.find(c => c.id === ${camp.id}))">
          <div class="camp-list-content">
            <div class="camp-list-name">${camp.name}</div>
            <div class="camp-list-dates">${startDate} – ${endDate}</div>
          </div>
          <div class="camp-list-source">${camp.source}</div>
        </div>
      `;
    }).join('');
  }
};
