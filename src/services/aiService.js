import axios from 'axios';
import { cloudinaryConfig } from '../cloudinary/config';

// Simulated AI classification categories
const ISSUE_CATEGORIES = {
  'Plumbing': {
    keywords: ['pipe', 'leak', 'water', 'drain', 'faucet', 'toilet', 'sink', 'shower', 'valve'],
    priority: 'high',
    description: 'Water-related issues including leaks, clogs, and fixture problems'
  },
  'Electrical': {
    keywords: ['wire', 'outlet', 'switch', 'light', 'power', 'circuit', 'breaker', 'fuse', 'electrical'],
    priority: 'critical',
    description: 'Electrical issues including wiring, outlets, and power problems'
  },
  'Civil': {
    keywords: ['wall', 'ceiling', 'floor', 'crack', 'structural', 'concrete', 'brick', 'paint', 'damage'],
    priority: 'medium',
    description: 'Structural and civil engineering issues'
  },
  'Common Area Maintenance/Housekeeping': {
    keywords: ['clean', 'trash', 'litter', 'maintenance', 'common', 'area', 'housekeeping', 'cleaning'],
    priority: 'low',
    description: 'General maintenance and housekeeping issues'
  },
  'HVAC': {
    keywords: ['air', 'conditioning', 'heating', 'ventilation', 'ac', 'hvac', 'cooling', 'thermostat', 'duct'],
    priority: 'high',
    description: 'Heating, ventilation, and air conditioning issues'
  }
};

// Simulated contractor assignments based on issue type
const CONTRACTOR_ASSIGNMENTS = {
  'Plumbing': ['plumber1@resolve360.com', 'plumber2@resolve360.com'],
  'Electrical': ['electrician1@resolve360.com', 'electrician2@resolve360.com'],
  'Civil': ['contractor1@resolve360.com', 'contractor2@resolve360.com'],
  'Common Area Maintenance/Housekeeping': ['maintenance1@resolve360.com', 'maintenance2@resolve360.com'],
  'HVAC': ['hvac1@resolve360.com', 'hvac2@resolve360.com']
};

export class AIService {
  static async classifyImage(imageFile, description = '') {
    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('cloud_name', cloudinaryConfig.cloudName);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData
      );

      const imageUrl = uploadResponse.data.secure_url;

      // Simulate AI classification using image analysis and description
      const classification = await this.simulateAIClassification(imageUrl, description);

      return {
        imageUrl,
        classification,
        confidence: classification.confidence,
        category: classification.category,
        contractor: classification.contractor
      };
    } catch (error) {
      console.error('AI classification error:', error);
      throw new Error('Failed to classify image');
    }
  }

  static async simulateAIClassification(imageUrl, description) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Combine image analysis with text description
    const combinedText = description.toLowerCase();
    
    // Calculate scores for each category based on keywords
    const scores = {};
    Object.entries(ISSUE_CATEGORIES).forEach(([category, config]) => {
      let score = 0;
      config.keywords.forEach(keyword => {
        if (combinedText.includes(keyword)) {
          score += 1;
        }
      });
      scores[category] = score;
    });

    // Find the category with highest score
    const maxScore = Math.max(...Object.values(scores));
    const categories = Object.keys(scores).filter(cat => scores[cat] === maxScore);
    
    // If no clear match, default to Common Area Maintenance
    const selectedCategory = categories.length > 0 ? categories[0] : 'Common Area Maintenance/Housekeeping';
    
    // Calculate confidence based on score
    const confidence = Math.min(0.95, 0.6 + (maxScore * 0.1));
    
    // Assign contractor
    const contractors = CONTRACTOR_ASSIGNMENTS[selectedCategory] || ['general@resolve360.com'];
    const assignedContractor = contractors[Math.floor(Math.random() * contractors.length)];

    return {
      category: selectedCategory,
      confidence: confidence,
      contractor: assignedContractor,
      priority: ISSUE_CATEGORIES[selectedCategory]?.priority || 'medium',
      description: ISSUE_CATEGORIES[selectedCategory]?.description || 'General maintenance issue'
    };
  }

  static async getContractorsByCategory(category) {
    return CONTRACTOR_ASSIGNMENTS[category] || ['general@resolve360.com'];
  }

  static async getAllCategories() {
    return Object.keys(ISSUE_CATEGORIES);
  }

  static async getCategoryDetails(category) {
    return ISSUE_CATEGORIES[category] || null;
  }
} 