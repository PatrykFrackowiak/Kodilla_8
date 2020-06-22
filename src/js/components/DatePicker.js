/* global flatpickr */

import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import { select, settings } from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [date => (date.getDay() === 1 || date.getDay() === 7)],
      locale: { firstDayOfWeek: 1 },
      onChange: (selectedDates, dateStr) => { thisWidget.value = dateStr;},
    });
  }

  parseValue(value) {
    return value;
  }

  isValid() { //TODO
    return true;
  }

  renderValue() { }
}

export default DatePicker;
