export interface GoogleDirectionsResponse {
  status: string;
  routes: Array<{
    legs: Array<{
      distance: {
        value: number;
        text: string;
      };
    }>;
  }>;
}
