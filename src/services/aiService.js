import axios from "axios";
import * as tf from "@tensorflow/tfjs";
import { cloudinaryConfig } from "../cloudinary/config";

// Teachable Machine model URL (may redirect)
const TEACHABLE_MACHINE_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/jkm8RlkVB/";

// Alternative: If the main model fails, we can use a more robust classification system
const BACKUP_CLASSIFICATION_RULES = {
  // Keywords that strongly indicate specific categories
  strongIndicators: {
    Plumbing: [
      "water",
      "leak",
      "pipe",
      "drain",
      "faucet",
      "toilet",
      "sink",
      "shower",
      "plumb",
    ],
    Electrical: [
      "wire",
      "outlet",
      "switch",
      "power",
      "electric",
      "light",
      "circuit",
      "breaker",
    ],
    HVAC: [
      "air",
      "ac",
      "heating",
      "cooling",
      "hvac",
      "temperature",
      "thermostat",
      "vent",
    ],
    Civil: [
      "wall",
      "ceiling",
      "floor",
      "crack",
      "structure",
      "concrete",
      "paint",
      "damage",
    ],
  },
  // Image-based heuristics (simple color/content analysis)
  imageHeuristics: {
    // These would be based on dominant colors or simple features
    hasWater: ["blue", "wet", "stain"],
    hasElectrical: ["wire", "socket", "panel"],
    hasStructural: ["crack", "damage", "wall"],
  },
};

// Issue categories based on the Teachable Machine model
const ISSUE_CATEGORIES = {
  Plumbing: {
    keywords: [
      "pipe",
      "leak",
      "water",
      "drain",
      "faucet",
      "toilet",
      "sink",
      "shower",
      "valve",
    ],
    priority: "high",
    description:
      "Water-related issues including leaks, clogs, and fixture problems",
  },
  Electrical: {
    keywords: [
      "wire",
      "outlet",
      "switch",
      "light",
      "power",
      "circuit",
      "breaker",
      "fuse",
      "electrical",
    ],
    priority: "critical",
    description:
      "Electrical issues including wiring, outlets, and power problems",
  },
  Civil: {
    keywords: [
      "wall",
      "ceiling",
      "floor",
      "crack",
      "structural",
      "concrete",
      "brick",
      "paint",
      "damage",
    ],
    priority: "medium",
    description: "Structural and civil engineering issues",
  },
  "Common Area Maintenance/Housekeeping": {
    keywords: [
      "clean",
      "trash",
      "litter",
      "maintenance",
      "common",
      "area",
      "housekeeping",
      "cleaning",
    ],
    priority: "low",
    description: "General maintenance and housekeeping issues",
  },
  HVAC: {
    keywords: [
      "air",
      "conditioning",
      "heating",
      "ventilation",
      "ac",
      "hvac",
      "cooling",
      "thermostat",
      "duct",
    ],
    priority: "high",
    description: "Heating, ventilation, and air conditioning issues",
  },
};

// Simulated contractor assignments based on issue type
const CONTRACTOR_ASSIGNMENTS = {
  Plumbing: ["plumber1@resolve360.com", "plumber2@resolve360.com"],
  Electrical: ["electrician1@resolve360.com", "electrician2@resolve360.com"],
  Civil: ["contractor1@resolve360.com", "contractor2@resolve360.com"],
  "Common Area Maintenance/Housekeeping": [
    "maintenance1@resolve360.com",
    "maintenance2@resolve360.com",
  ],
  HVAC: ["hvac1@resolve360.com", "hvac2@resolve360.com"],
};

export class AIService {
  // Check if TensorFlow.js is properly loaded
  static isTensorFlowAvailable() {
    return typeof tf !== "undefined" && tf.loadLayersModel;
  }

  // Test if the Teachable Machine model is accessible
  static async testModelAvailability() {
    try {
      if (!this.isTensorFlowAvailable()) {
        console.error("TensorFlow.js is not available");
        return false;
      }

      const modelURL = TEACHABLE_MACHINE_MODEL_URL + "model.json";
      const response = await fetch(modelURL);
      const isAvailable = response.ok;
      console.log(
        `Teachable Machine model availability: ${isAvailable} (status: ${response.status})`
      );
      return isAvailable;
    } catch (error) {
      console.error("Model availability test failed:", error);
      return false;
    }
  }

  // Simple image analysis as backup (basic heuristics)
  static async analyzeImageHeuristics(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          // Create a canvas to analyze the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get image data for basic analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Simple color analysis
          let redSum = 0,
            greenSum = 0,
            blueSum = 0;
          let brightPixels = 0,
            darkPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            redSum += data[i];
            greenSum += data[i + 1];
            blueSum += data[i + 2];

            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 128) brightPixels++;
            else darkPixels++;
          }

          const pixelCount = data.length / 4;
          const avgRed = redSum / pixelCount;
          const avgGreen = greenSum / pixelCount;
          const avgBlue = blueSum / pixelCount;

          // Basic heuristics
          let suggestedCategory = "Common Area Maintenance/Housekeeping";
          let confidence = 0.3;

          // Blue-dominant images might be plumbing (water)
          if (avgBlue > avgRed && avgBlue > avgGreen && avgBlue > 100) {
            suggestedCategory = "Plumbing";
            confidence = 0.4;
          }
          // Dark images might be electrical
          else if (darkPixels > brightPixels * 1.5) {
            suggestedCategory = "Electrical";
            confidence = 0.35;
          }
          // Brownish/earthy colors might be civil/structural
          else if (
            avgRed > avgBlue &&
            avgGreen > avgBlue &&
            Math.abs(avgRed - avgGreen) < 30
          ) {
            suggestedCategory = "Civil";
            confidence = 0.4;
          }

          resolve({
            category: suggestedCategory,
            confidence: confidence,
            colorAnalysis: {
              avgRed,
              avgGreen,
              avgBlue,
              brightPixels,
              darkPixels,
            },
          });
        } catch (error) {
          console.error("Image heuristics analysis failed:", error);
          resolve({
            category: "Common Area Maintenance/Housekeeping",
            confidence: 0.3,
            error: error.message,
          });
        }
      };

      img.onerror = () => {
        resolve({
          category: "Common Area Maintenance/Housekeeping",
          confidence: 0.3,
          error: "Failed to load image for analysis",
        });
      };

      img.src = imageUrl;
    });
  }

  static async classifyImage(imageFile, description = "") {
    try {
      // Try to upload image to Cloudinary
      let imageUrl = "";
      let uploadSuccess = false;

      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", cloudinaryConfig.uploadPreset);
        formData.append("cloud_name", cloudinaryConfig.cloudName);

        console.log("Attempting Cloudinary upload...");
        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
          formData
        );

        imageUrl = uploadResponse.data.secure_url;
        uploadSuccess = true;
        console.log("Cloudinary upload successful:", imageUrl);
      } catch (uploadError) {
        console.warn(
          "Cloudinary upload failed, using local image:",
          uploadError.message
        );
        // Create a local blob URL as fallback
        imageUrl = URL.createObjectURL(imageFile);
        uploadSuccess = false;
      }

      // Use Teachable Machine model for classification
      console.log("Starting AI classification...");
      const classification = await this.classifyWithTeachableMachine(
        imageUrl,
        description
      );

      console.log("Classification result:", classification);

      return {
        imageUrl,
        classification,
        confidence: classification.confidence,
        category: classification.category,
        contractor: classification.contractor,
        uploadSuccess, // Add this flag to track upload status
      };
    } catch (error) {
      console.error("AI classification error:", error);
      throw new Error("Failed to classify image: " + error.message);
    }
  }

  static async classifyWithTeachableMachine(imageUrl, description) {
    try {
      console.log(
        "Loading Teachable Machine model for image classification..."
      );

      // Check if TensorFlow.js is available
      if (!this.isTensorFlowAvailable()) {
        throw new Error(
          "TensorFlow.js is not available. Cannot perform image classification."
        );
      }

      // Test model availability first
      const modelAvailable = await this.testModelAvailability();
      if (!modelAvailable) {
        throw new Error(
          "Teachable Machine model is not available. Cannot perform image classification."
        );
      }

      const modelURL = TEACHABLE_MACHINE_MODEL_URL + "model.json";

      // Create an image element to process
      const img = new Image();
      img.crossOrigin = "anonymous";

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            console.log("Image loaded, loading TensorFlow model...");

            // Load the model with retry logic
            let model;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
              try {
                attempts++;
                console.log(`Model loading attempt ${attempts}/${maxAttempts}`);
                model = await tf.loadLayersModel(modelURL);
                console.log("Model loaded successfully");
                break;
              } catch (modelError) {
                console.error(
                  `Model loading attempt ${attempts} failed:`,
                  modelError
                );
                if (attempts === maxAttempts) {
                  throw new Error(
                    `Failed to load Teachable Machine model after ${maxAttempts} attempts: ${modelError.message}`
                  );
                }
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }

            // Preprocess the image
            const tensor = tf.browser
              .fromPixels(img)
              .resizeNearestNeighbor([224, 224]) // Standard input size for Teachable Machine
              .toFloat()
              .div(255.0)
              .expandDims(0); // Add batch dimension

            console.log("Image preprocessed, making prediction...");

            // Make prediction
            const predictions = await model.predict(tensor).data();
            console.log("Raw predictions:", predictions);

            // Map predictions to categories (must match the exact order from Teachable Machine)
            // Note: The order here should match the training data labels in Teachable Machine
            const categories = [
              "Plumbing",
              "Electrical",
              "Civil",
              "Common Area Maintenance/Housekeeping",
              "HVAC",
            ];

            // Log all predictions for debugging
            console.log(
              "All predictions:",
              categories.map(
                (cat, idx) => `${cat}: ${predictions[idx]?.toFixed(3) || "N/A"}`
              )
            );

            const maxIndex = predictions.indexOf(Math.max(...predictions));
            const selectedCategory =
              categories[maxIndex] || "Common Area Maintenance/Housekeeping";
            const confidence = predictions[maxIndex] || 0;

            console.log(
              `Predicted category: ${selectedCategory} with confidence: ${confidence.toFixed(
                3
              )}`
            );

            // Validate prediction
            if (confidence < 0.1) {
              console.warn(
                "Very low confidence prediction, model might not be working correctly"
              );
            }

            // Clean up tensors
            tensor.dispose();
            model.dispose();

            // Use ONLY the Teachable Machine prediction (no text analysis fallback)
            const finalCategory = selectedCategory;
            const finalConfidence = confidence;

            console.log(
              `Teachable Machine prediction: ${finalCategory} (confidence: ${finalConfidence.toFixed(
                3
              )})`
            );

            // Assign contractor based on predicted category
            const contractors = CONTRACTOR_ASSIGNMENTS[finalCategory] || [
              "general@resolve360.com",
            ];
            const assignedContractor =
              contractors[Math.floor(Math.random() * contractors.length)];

            resolve({
              category: finalCategory,
              confidence: finalConfidence,
              contractor: assignedContractor,
              priority: ISSUE_CATEGORIES[finalCategory]?.priority || "medium",
              description:
                ISSUE_CATEGORIES[finalCategory]?.description ||
                "General maintenance issue",
            });
          } catch (error) {
            console.error("Teachable Machine model prediction error:", error);
            reject(
              new Error(
                `Teachable Machine classification failed: ${error.message}`
              )
            );
            const fallbackResult = await this.analyzeDescription(description);
            resolve(fallbackResult);
          }
        };

        img.onerror = (error) => {
          console.error("Failed to load image for classification:", error);
          reject(
            new Error(
              "Failed to load image for Teachable Machine classification"
            )
          );
        };

        // Set a timeout for image loading
        setTimeout(() => {
          if (!img.complete) {
            console.error(
              "Image loading timeout for Teachable Machine classification"
            );
            reject(
              new Error(
                "Image loading timeout for Teachable Machine classification"
              )
            );
          }
        }, 15000); // 15 second timeout

        img.src = imageUrl;
      });
    } catch (error) {
      console.error("Teachable Machine classification error:", error);
      throw new Error(
        `Teachable Machine classification failed: ${error.message}`
      );
    }
  }

  static async analyzeDescription(description) {
    // Enhanced text analysis with stronger classification rules
    const combinedText = description.toLowerCase();

    // First, check for strong indicators
    let bestMatch = null;
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(
      BACKUP_CLASSIFICATION_RULES.strongIndicators
    )) {
      let score = 0;
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          score += 2; // Strong indicators get double weight
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    // If strong indicators found, use them
    if (bestMatch && maxScore > 0) {
      const confidence = Math.min(0.9, 0.6 + maxScore * 0.1);
      const contractors = CONTRACTOR_ASSIGNMENTS[bestMatch] || [
        "general@resolve360.com",
      ];
      const assignedContractor =
        contractors[Math.floor(Math.random() * contractors.length)];

      return {
        category: bestMatch,
        confidence: confidence,
        contractor: assignedContractor,
        priority: ISSUE_CATEGORIES[bestMatch]?.priority || "medium",
        description:
          ISSUE_CATEGORIES[bestMatch]?.description ||
          "General maintenance issue",
      };
    }

    // Fallback to original keyword-based analysis
    const scores = {};
    Object.entries(ISSUE_CATEGORIES).forEach(([category, config]) => {
      let score = 0;
      config.keywords.forEach((keyword) => {
        if (combinedText.includes(keyword)) {
          score += 1;
        }
      });
      scores[category] = score;
    });

    // Find the category with highest score
    const finalMaxScore = Math.max(...Object.values(scores));
    const categories = Object.keys(scores).filter(
      (cat) => scores[cat] === finalMaxScore
    );

    // If no clear match, default to Common Area Maintenance
    const selectedCategory =
      categories.length > 0
        ? categories[0]
        : "Common Area Maintenance/Housekeeping";

    // Calculate confidence based on score
    const confidence =
      finalMaxScore > 0 ? Math.min(0.8, 0.4 + finalMaxScore * 0.15) : 0.3;

    // Assign contractor
    const contractors = CONTRACTOR_ASSIGNMENTS[selectedCategory] || [
      "general@resolve360.com",
    ];
    const assignedContractor =
      contractors[Math.floor(Math.random() * contractors.length)];

    return {
      category: selectedCategory,
      confidence: confidence,
      contractor: assignedContractor,
      priority: ISSUE_CATEGORIES[selectedCategory]?.priority || "medium",
      description:
        ISSUE_CATEGORIES[selectedCategory]?.description ||
        "General maintenance issue",
    };
  }

  static async getContractorsByCategory(category) {
    return CONTRACTOR_ASSIGNMENTS[category] || ["general@resolve360.com"];
  }

  static async getAllCategories() {
    return Object.keys(ISSUE_CATEGORIES);
  }

  static async getCategoryDetails(category) {
    return ISSUE_CATEGORIES[category] || null;
  }

  // Method to get the Teachable Machine model URL for reference
  static getModelURL() {
    return TEACHABLE_MACHINE_MODEL_URL;
  }

  // Debug method to get detailed classification info
  static async getDetailedClassification(imageFile, description = "") {
    try {
      const modelAvailable = await this.testModelAvailability();
      const textClassification = await this.analyzeDescription(description);

      let mlClassification = null;
      if (modelAvailable) {
        try {
          // Try to get ML classification
          const result = await this.classifyImage(imageFile, description);
          mlClassification = {
            category: result.category,
            confidence: result.confidence,
          };
        } catch (error) {
          console.error("ML classification failed:", error);
        }
      }

      return {
        modelAvailable,
        textClassification,
        mlClassification,
        description: description,
      };
    } catch (error) {
      console.error("Detailed classification error:", error);
      return {
        error: error.message,
        modelAvailable: false,
        textClassification: null,
        mlClassification: null,
      };
    }
  }
}
