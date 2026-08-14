-- Ramesh Rentals: add real photos to the remaining demo vehicles that
-- still show emoji placeholders.

update vehicles set photos = array[
  '/vehicles/honda-activa-6g-side.webp',
  '/vehicles/honda-activa-6g-angle.webp'
] where make = 'Honda' and model = 'Activa 6G';

update vehicles set photos = array[
  '/vehicles/tvs-jupiter-side.webp'
] where make = 'TVS' and model = 'Jupiter';

update vehicles set photos = array[
  '/vehicles/royal-enfield-classic-350-side.webp'
] where make = 'Royal Enfield' and model = 'Classic 350';

update vehicles set photos = array[
  '/vehicles/maruti-suzuki-swift-angle.webp'
] where make = 'Maruti Suzuki' and model = 'Swift';

update vehicles set photos = array[
  '/vehicles/hyundai-i10-angle.jpg'
] where make = 'Hyundai' and model = 'i10';
