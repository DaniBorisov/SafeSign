export  interface Signs {
    id: number;
    csId: number;
    planId: number;
    sensorId: string;
    ogAngle: number;
    currAngle: number;
    issue: string;
    ogX?: number;
    ogY?: number;
    ogZ?: number;
    currX?: number;
    currY?: number;
    currZ?: number;
  }
  