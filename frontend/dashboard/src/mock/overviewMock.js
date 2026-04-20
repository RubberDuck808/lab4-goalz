export const mockOverviewData = {
    sensors: [
        { id: 1, temp: 22, humidity: 65, light: 800 },
        { id: 2, temp: 19, humidity: 72, light: 430 },
        { id: 3, temp: 25, humidity: 58, light: 1200 },
        { id: 4, temp: 21, humidity: 80, light: 290 },
    ],
    element: [
        { id: 1,  elementType: 1, isGreen: true  },  // Tree
        { id: 2,  elementType: 1, isGreen: true  },  // Tree
        { id: 3,  elementType: 1, isGreen: true  },  // Tree
        { id: 4,  elementType: 2, isGreen: true  },  // Shrub
        { id: 5,  elementType: 2, isGreen: true  },  // Shrub
        { id: 6,  elementType: 3, isGreen: true  },  // Grass/lawn
        { id: 7,  elementType: 3, isGreen: true  },  // Grass/lawn
        { id: 8,  elementType: 4, isGreen: false },  // Mulch
        { id: 9,  elementType: 5, isGreen: false },  // Garden bed
        { id: 10, elementType: 5, isGreen: false },  // Garden bed
        { id: 11, elementType: 6, isGreen: true  },  // Ground cover
        { id: 12, elementType: 7, isGreen: true  },  // Green roof
        { id: 13, elementType: 7, isGreen: true  },  // Green roof
        { id: 14, elementType: 8, isGreen: false },  // Water body
        { id: 15, elementType: 8, isGreen: false },  // Water body
    ],
};
