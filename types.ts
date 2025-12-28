
export interface VehicleData {
  title: string;
  year: number | string;
  make: string;
  model: string;
  price: string;
  mileage: string;
  vin: string;
  transmission: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  bodyStyle: string;
  description: string;
  features: string[];
}

export interface ListingStatus {
  isAnalyzing: boolean;
  error?: string;
  data?: VehicleData;
}
