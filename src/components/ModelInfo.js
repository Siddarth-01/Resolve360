import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target } from 'lucide-react';

const ModelInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Classification</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Teachable Machine Model</h4>
            <p className="text-sm text-gray-600">
              Using simulated AI classification with text analysis (development mode)
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">5 Categories</h4>
            <p className="text-sm text-gray-600">
              Plumbing, Electrical, Civil, HVAC, and Common Area Maintenance
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded-lg border">
        <p className="text-xs text-gray-600">
          <strong>Model URL:</strong> https://teachablemachine.withgoogle.com/models/jkm8RlkVB/
        </p>
      </div>
    </motion.div>
  );
};

export default ModelInfo; 