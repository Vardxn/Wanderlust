module.exports.calculatePriceBreakdown = (pricePerNight, checkIn, checkOut, cleaningFee = 0) => {
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.15; // 15% service fee
  const taxes = (subtotal + serviceFee) * 0.10; // 10% tax
  const totalPrice = subtotal + cleaningFee + serviceFee + taxes;

  return {
    nights,
    price_per_night: pricePerNight,
    subtotal: parseFloat(subtotal.toFixed(2)),
    cleaning_fee: parseFloat(cleaningFee.toFixed(2)),
    service_fee: parseFloat(serviceFee.toFixed(2)),
    taxes: parseFloat(taxes.toFixed(2)),
    total_price: parseFloat(totalPrice.toFixed(2))
  };
};
