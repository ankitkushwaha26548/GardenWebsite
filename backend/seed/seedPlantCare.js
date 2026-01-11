import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Plant from '../models/Plant.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedPlantCare() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const filePath = path.join(__dirname, 'plantCareDatabase.json');
    
    if (!fs.existsSync(filePath)) {
      console.error(` File not found: ${filePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const plants = JSON.parse(fileContent);

    // Clear existing plant care records
    await Plant.deleteMany({});
    console.log('  Cleared existing plant records');

    // Insert plant care data
    const toInsert = plants.map(plant => ({
      name: plant.name || plant.common_name,
      type: plant.type || 'Unknown',
      botanicalName: plant.botanicalName || plant.botanical_name || 'Unknown',
      description: plant.about || plant.description || '',
      image: plant.image || '🌿',
      care: {
        watering: Array.isArray(plant.care?.watering) ? plant.care.watering : (plant.watering ? [plant.watering] : []),
        sunlight: Array.isArray(plant.care?.sunlight) ? plant.care.sunlight : (plant.sunlight ? [plant.sunlight] : []),
        soil: Array.isArray(plant.care?.soil) ? plant.care.soil : (plant.soil ? [plant.soil] : []),
        fertilizer: Array.isArray(plant.care?.fertilizer) ? plant.care.fertilizer : (plant.fertilizer ? [plant.fertilizer] : []),
        temperature: Array.isArray(plant.care?.temperature) ? plant.care.temperature : (plant.temperature ? [plant.temperature] : []),
        pests: Array.isArray(plant.care?.pests) ? plant.care.pests : (plant.pests ? [plant.pests] : []),
        pruning: Array.isArray(plant.care?.pruning) ? plant.care.pruning : (plant.pruning ? [plant.pruning] : []),
        seasonalTips: Array.isArray(plant.care?.seasonalTips) ? plant.care.seasonalTips : (plant.seasonalTips ? [plant.seasonalTips] : [])
      }
    }));

    await Plant.insertMany(toInsert);
    console.log(` Seeded ${toInsert.length} plant care records from plantCareDatabase.json`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding database:', error.message);
    process.exit(1);
  }
}

seedPlantCare();
