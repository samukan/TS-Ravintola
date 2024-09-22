import { Menu } from './Menu';

export interface Location {
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Restaurant {
  _id: string;
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  company: string;
  location: Location;
  menu: Menu;
}
