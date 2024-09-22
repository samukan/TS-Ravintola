export interface Course {
    name: string;
    diets?: string;
    price?: string;
  }

  export interface MenuResponse {
    courses: Course[];
  }
