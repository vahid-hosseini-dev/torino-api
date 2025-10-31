const Tour = require("../models/Tour");

exports.getTours = async (req, res) => {
  const { destinationId, originId, startDate, endDate } = req.query;

  const isProduction = process.env.NODE_ENV === "production";
  const BASE_URL = isProduction
    ? "https://torino-api-ecru.vercel.app"
    : "http://localhost:6500";

  try {
    let tours = await Tour.getAllTours();

    // فیلترها
    if (destinationId) {
      tours = tours.filter((tour) => tour.destination.id === destinationId);
    }

    if (originId) {
      tours = tours.filter((tour) => tour.origin.id === originId);
    }

    if (startDate) {
      const start = new Date(startDate);
      tours = tours.filter((tour) => new Date(tour.startDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      tours = tours.filter((tour) => new Date(tour.endDate) <= end);
    }

    tours = tours.map((tour) => {
      if (!tour.image.startsWith("http")) {
        tour.image = `${BASE_URL}${tour.image}`;
      } else if (tour.image.includes("http://localhost:6500") && isProduction) {
        tour.image = tour.image.replace("http://localhost:6500", BASE_URL);
      }
      return tour;
    });

    res.json(tours);
  } catch (err) {
    console.error("Error in getTours:", err.message);
    res.status(500).json({ message: "خطا در دریافت تورها." });
  }
};

exports.getTourById = async (req, res) => {
  const { tourId } = req.params;

  const isProduction = process.env.NODE_ENV === "production";
  const BASE_URL = isProduction
    ? "https://torino-api-ecru.vercel.app"
    : "http://localhost:6500";

  if (!tourId) {
    return res.status(400).json({ message: "ID تور الزامی است." });
  }

  try {
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      return res.status(404).json({ message: "تور درخواستی وجود ندارد!" });
    }

    if (!tour.image.startsWith("http")) {
      tour.image = `${BASE_URL}${tour.image}`;
    } else if (tour.image.includes("http://localhost:6500") && isProduction) {
      tour.image = tour.image.replace("http://localhost:6500", BASE_URL);
    }

    res.json(tour);
  } catch (err) {
    console.error("Error in getTourById:", err.message);
    res.status(500).json({ message: "خطا در دریافت تور." });
  }
};
