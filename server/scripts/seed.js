require('dotenv').config()
const mongoose = require('mongoose')
const Question = require('../src/models/Question')
const Product = require('../src/models/Product')

const questions = [
  {
    _id: 'q1',
    text: 'What is your age group?',
    type: 'single_choice',
    options: [
      { value: 'under_18', label: 'Under 18', next: 'REJECT' },
      { value: '18_30', label: '18 – 30', next: 'q2' },
      { value: '30_50', label: '30 – 50', next: 'q2' },
      { value: '50_plus', label: '50+', next: 'q2' },
    ],
    tags: ['age'],
    order: 1,
  },
  {
    _id: 'q2',
    text: 'What is your primary fitness goal?',
    type: 'single_choice',
    options: [
      { value: 'weight_loss', label: 'Weight Loss', next: 'q3' },
      { value: 'muscle_gain', label: 'Muscle Gain', next: 'q3' },
      { value: 'endurance', label: 'Endurance & Stamina', next: 'q3' },
      { value: 'general_fitness', label: 'General Fitness', next: 'q4' },
    ],
    tags: ['goal'],
    order: 2,
  },
  {
    _id: 'q3',
    text: 'What is your current fitness level?',
    type: 'single_choice',
    options: [
      { value: 'beginner', label: 'Beginner – Just starting out', next: 'q5' },
      { value: 'intermediate', label: 'Intermediate – Workout regularly', next: 'q5' },
      { value: 'advanced', label: 'Advanced – Intense training', next: 'q5' },
    ],
    tags: ['level'],
    order: 3,
  },
  {
    _id: 'q4',
    text: 'Do you have any dietary restrictions?',
    type: 'single_choice',
    options: [
      { value: 'none', label: 'No restrictions', next: 'q5' },
      { value: 'vegetarian', label: 'Vegetarian', next: 'q5' },
      { value: 'vegan', label: 'Vegan', next: 'q5' },
      { value: 'gluten_free', label: 'Gluten-free', next: 'q5' },
    ],
    tags: ['diet'],
    order: 4,
  },
  {
    _id: 'q5',
    text: 'What is your monthly budget for fitness products?',
    type: 'single_choice',
    options: [
      { value: 'budget_low', label: 'Under ₹1,000', next: 'DONE' },
      { value: 'budget_mid', label: '₹1,000 – ₹3,000', next: 'DONE' },
      { value: 'budget_high', label: '₹3,000+', next: 'DONE' },
    ],
    tags: ['budget'],
    order: 5,
  },
]

const products = [
  {
    _id: 'p1',
    name: 'Whey Protein Powder',
    description: 'Premium whey protein for muscle recovery and growth',
    price: 2499,
    image: '/images/p1.png',
    tags: ['muscle_gain', 'intermediate', 'advanced', 'budget_mid', 'budget_high'],
    stock: 100,
  },
  {
    _id: 'p2',
    name: 'Resistance Band Set',
    description: '5-level resistance bands for home workouts',
    price: 699,
    image: '/images/p2.png',
    tags: ['beginner', 'weight_loss', 'general_fitness', 'budget_low', 'budget_mid'],
    stock: 200,
  },
  {
    _id: 'p3',
    name: 'Pre-Workout Energy Drink',
    description: 'High caffeine pre-workout for intense training sessions',
    price: 1299,
    image: '/images/p3.png',
    tags: ['muscle_gain', 'endurance', 'advanced', 'budget_mid'],
    stock: 80,
  },
  {
    _id: 'p4',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat for stretching and mindfulness',
    price: 899,
    image: '/images/p4.png',
    tags: ['general_fitness', 'beginner', 'weight_loss', 'budget_low', 'budget_mid'],
    stock: 150,
  },
  {
    _id: 'p5',
    name: 'Plant-Based Protein',
    description: 'Vegan-friendly protein from pea and rice isolate',
    price: 2199,
    image: '/images/p5.png',
    tags: ['muscle_gain', 'vegetarian', 'vegan', 'budget_mid', 'budget_high'],
    stock: 60,
  },
  {
    _id: 'p6',
    name: 'Fat Burner Capsules',
    description: 'Thermogenic formula to support weight management',
    price: 1599,
    image: '/images/p6.png',
    tags: ['weight_loss', 'intermediate', 'budget_mid', 'budget_high'],
    stock: 90,
  },
  {
    _id: 'p7',
    name: 'Running Hydration Belt',
    description: 'Lightweight belt with water bottles for endurance runners',
    price: 1199,
    image: '/images/p7.png',
    tags: ['endurance', 'intermediate', 'advanced', 'budget_mid'],
    stock: 70,
  },
  {
    _id: 'p8',
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells, 2.5kg to 20kg each',
    price: 4999,
    image: '/images/p8.png',
    tags: ['muscle_gain', 'intermediate', 'advanced', 'budget_high'],
    stock: 30,
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await Question.deleteMany({})
    await Product.deleteMany({})
    console.log('Cleared existing data')

    await Question.insertMany(questions)
    console.log(`Inserted ${questions.length} questions`)

    await Product.insertMany(products)
    console.log(`Inserted ${products.length} products`)

    console.log('Seed completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
