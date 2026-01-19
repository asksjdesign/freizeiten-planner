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
    } catch (error) {
      console.error('Failed to load camps:', error);
    }
  },

  renderCamps() {
    // Clear existing events
    this.instance.removeAllEvents();

    // Add camp events
    const events = this.camps.map(camp => ({
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

  getEndDateForCalendar(endDate) {
    // FullCalendar end dates are exclusive, so add 1 day
    const date = new Date(endDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  },

  updateEventSelection() {
    // Update visual selection state for all events
    const events = this.instance.getEvents();
    events.forEach(event => {
      const el = event.el;
      if (el) {
        if (Planner.isCampSelected(parseInt(event.id))) {
          event.setProp('classNames', [...event.classNames, 'fc-event-selected']);
        } else {
          event.setProp('classNames', event.classNames.filter(c => c !== 'fc-event-selected'));
        }
      }
    });
    // Re-render to apply changes
    this.instance.refetchEvents();
    this.renderCamps();
  }
};
