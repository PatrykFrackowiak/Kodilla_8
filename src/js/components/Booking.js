import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
    };
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
export default Booking;
