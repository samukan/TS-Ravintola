import { errorModal, restaurantModal, restaurantRow } from './components';
import { fetchData } from './functions';
import { apiUrl, positionOptions } from './variables';
import { Restaurant } from './interfaces/Restaurant';
import { MenuResponse } from './interfaces/MenuResponse';

const modal = document.querySelector('dialog') as HTMLDialogElement;
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants: Restaurant[]): void => {
  const table = document.querySelector('table') as HTMLTableElement;
  if (!table) {
    throw new Error('Table not found');
  }
  table.innerHTML = '';
  restaurants.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    table.appendChild(tr);
    tr.addEventListener('click', async () => {
      try {
        // Remove all highlights
        const allHighs = document.querySelectorAll('.highlight');
        allHighs.forEach((high) => {
          high.classList.remove('highlight');
        });
        // Add highlight
        tr.classList.add('highlight');
        // Add restaurant data to modal
        modal.innerHTML = '';

        // Fetch menu
        const menuUrl = `${apiUrl}/restaurants/daily/${restaurant._id}/fi`;
        const menu = await fetchData<MenuResponse>(menuUrl);
        console.log(menu);

        const menuHtml = restaurantModal(restaurant, menu);
        modal.insertAdjacentHTML('beforeend', menuHtml);

        modal.showModal();
      } catch (error) {
        modal.innerHTML = errorModal((error as Error).message);
        modal.showModal();
      }
    });
  });
};

const error = (err: GeolocationPositionError): void => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition): Promise<void> => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(`${apiUrl}/restaurants`);
    console.log(restaurants);

    restaurants.sort((a, b) => {
      const x1 = crd.latitude;
      const y1 = crd.longitude;
      const x2a = a.location.coordinates[1];
      const y2a = a.location.coordinates[0];
      const distanceA = calculateDistance(x1, y1, x2a, y2a);
      const x2b = b.location.coordinates[1];
      const y2b = b.location.coordinates[0];
      const distanceB = calculateDistance(x1, y1, x2b, y2b);
      return distanceA - distanceB;
    });

    createTable(restaurants);

    // Buttons for filtering
    const sodexoBtn = document.querySelector('#sodexo') as HTMLButtonElement;
    const compassBtn = document.querySelector('#compass') as HTMLButtonElement;
    const resetBtn = document.querySelector('#reset') as HTMLButtonElement;

    sodexoBtn.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants);
    });

    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants);
    });

    resetBtn.addEventListener('click', () => {
      createTable(restaurants);
    });
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
