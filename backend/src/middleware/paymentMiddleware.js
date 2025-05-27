// Set payment date when status changes to Completed
const setPaymentDateOnComplete = function updatePaymentDate(next) {
  if (this.isModified('payment_status') && this.payment_status === 'Completed') {
    this.payment_date = new Date();
  }
  next();
};

module.exports = {
  setPaymentDateOnComplete,
};
