import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

export class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;
    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(bookingContainer) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    bookingContainer.innerHTML = generatedHTML;
    thisBooking.dom = {
      wrapper: bookingContainer,
      peopleAmount: bookingContainer.querySelector(select.booking.peopleAmount),
      hoursAmount: bookingContainer.querySelector(select.booking.hoursAmount),
      datePicker: bookingContainer.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: bookingContainer.querySelector(select.widgets.hourPicker.wrapper),
      tables: bookingContainer.querySelectorAll(select.booking.tables),
    };
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', () => {
      thisBooking.clearSelectedTables();
      thisBooking.updateDOM();
    });

    for (const table of thisBooking.dom.tables) {
      table.addEventListener('click', () => {
        thisBooking.selectTable(table);
      });
    }

    thisBooking.dom.wrapper.addEventListener('submit', () => {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then((allResponses) => {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      }).then(([bookings, eventsCurrent, eventsRepeat]) => {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (const item of bookings) {
      item.tables.forEach(table => {
        console.log('bookings');
        console.log(table);
        thisBooking.makeBooked(item.date, item.hour, item.duration, table);
      });
    }

    for (const item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (const item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.clearSelectedTables();
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvaliable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvaliable = true;
    }

    for (const table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvaliable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  sendBooking() {
    const thisBooking = this;
    const selectedTables = thisBooking.getSelectedTables();
    if (typeof selectedTables === 'undefined' || selectedTables.length === 0) {
      alert('Please select a free table');
      return;
    }
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      tables: selectedTables,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => console.log(parsedResponse))
      .then(() => {
        for (let table of payload.tables) {
          thisBooking.makeBooked(payload.date, payload.hour, payload.duration, table);
        }
        thisBooking.updateDOM();
      });
  }

  selectTable(table) {
    if (table === null || isNaN(table.getAttribute(settings.booking.tableIdAttribute))) {
      return;
    }

    table.classList.toggle(classNames.booking.tableSelected);
  }

  clearSelectedTables() {
    const thisBooking = this;
    thisBooking.dom.tables.forEach(t => t.classList.remove(classNames.booking.tableSelected));
  }

  getSelectedTables() {
    const thisBooking = this;
    let tables = [];
    for (const table of thisBooking.dom.tables) {
      if (table.classList.contains(classNames.booking.tableSelected)) {
        tables.push(parseInt(table.getAttribute(settings.booking.tableIdAttribute)));
      }
    }
    return tables;
  }
}
export default Booking;
