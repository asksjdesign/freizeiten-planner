// Calendar Module
const Calendar = {
  instance: null,
  camps: [],

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
      initialView: 'dayGridMonth',
      locale: 'de',
      firstDay: 1,
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
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
  }
};
