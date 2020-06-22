import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export class Booking {
  constructor(bookingContainer){
    const thisBooking = this;
    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
  }

  render(bookingContainer){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    bookingContainer.innerHTML=generatedHTML;
    thisBooking.dom = {
      wrapper: bookingContainer,
      peopleAmount: bookingContainer.querySelector(select.booking.peopleAmount),
      hoursAmount: bookingContainer.querySelector(select.booking.hoursAmount),
      datePicker: bookingContainer.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: bookingContainer.querySelector(select.widgets.hourPicker.wrapper),
    };
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
export default Booking;
