// Import all default images
const defaultImages = {
  // Example format - we'll populate this with your actual images
  // id should be unique, name is what's shown/spoken
  objects: [
    {
      id: "default_1",
      name: "bed",
      uri: require("../../../assets/images/defaults/bed.png"),
      category: "furniture"
    },
    {
      id: "default_2",
      name: "chair",
      uri: require("../../../assets/images/defaults/chair.png"),
      category: "furniture"
    },
    {
      id: "default_3",
      name: "table",
      uri: require("../../../assets/images/defaults/table.png"),
      category: "furniture"
    },
    {
      id: "default_4",
      name: "cup",
      uri: require("../../../assets/images/defaults/cup.png"),
      category: "kitchen"
    },
    {
      id: "default_5",
      name: "car",
      uri: require("../../../assets/images/defaults/car.png"),
      category: "transport"
    },
    {
      id: "default_6",
      name: "glasses",
      uri: require("../../../assets/images/defaults/glasses.png"),
      category: "clothing"
    },
    {
      id: "default_7",
      name: "hat",
      uri: require("../../../assets/images/defaults/hat.png"),
      category: "clothing"
    },  
    {
      id: "default_8",
      name: "lamp",
      uri: require("../../../assets/images/defaults/lamp.png"),
      category: "home"
    },
    {
      id: "default_9",
      name: "shoe",
      uri: require("../../../assets/images/defaults/shoe.png"),
      category: "clothing"
    },
    {
      id: "default_10",
      name: "silverware",
      uri: require("../../../assets/images/defaults/silverware.png"),
      category: "kitchen"
    },
    // ... more objects
  ]
}

export default defaultImages 