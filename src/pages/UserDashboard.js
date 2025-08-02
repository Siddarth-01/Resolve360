import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { AIService } from "../services/aiService";
import { FirestoreService } from "../services/firestoreService";
import ModelInfo from "../components/ModelInfo";
import {
  Plus,
  Camera,
  Upload,
  X,
  Clock,
  CheckCircle,
  User,
  LogOut,
  FileText,
  Zap,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserIssues();
  }, []);

  const loadUserIssues = async (retryCount = 0) => {
    try {
      setRefreshing(true);
      console.log("Loading user issues for user:", currentUser.uid);
      const userIssues = await FirestoreService.getUserIssues(currentUser.uid);
      console.log("Loaded issues:", userIssues);
      setIssues(userIssues);
    } catch (error) {
      console.error("Error loading issues:", error);

      // Retry up to 3 times for temporary issues
      if (
        retryCount < 3 &&
        (error.message.includes("index") ||
          error.message.includes("permission"))
      ) {
        console.log(`Retrying to load issues (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadUserIssues(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      // Only show error toast if it's not a temporary issue
      if (error.message && !error.message.includes("index")) {
        toast.error("Failed to load issues: " + error.message);
      } else {
        console.warn(
          "Temporary issue loading problem, will retry later:",
          error.message
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitIssue = async () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    setClassifying(true);
    try {
      // AI classification
      console.log("Starting AI classification...");
      const result = await AIService.classifyImage(selectedImage, description);
      console.log("AI classification result:", result);
      setClassification(result);

      // Create issue in database
      const issueData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        imageUrl: result.imageUrl,
        description: description,
        category: result.category,
        priority: result.classification.priority,
        assignedContractor: result.contractor,
        confidence: result.confidence,
        status: "Open",
        uploadSuccess: result.uploadSuccess || false, // Track if image was uploaded to Cloudinary
      };

      console.log("Creating issue with data:", issueData);
      await FirestoreService.createIssue(issueData);

      toast.success("Issue reported successfully!");
      setShowReportModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      setDescription("");
      setClassification(null);

      // Add a small delay to ensure Firestore write has propagated
      setTimeout(() => {
        loadUserIssues().catch((error) => {
          console.warn(
            "Failed to reload issues, but issue was created successfully:",
            error
          );
          // Show a success message that the issue was created
          toast.success(
            "Issue created! You can refresh to see it in the list."
          );
        });
      }, 1000);
    } catch (error) {
      console.error("Submit issue error:", error);
      toast.error("Failed to submit issue: " + error.message);
    } finally {
      setClassifying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-yellow-600 bg-yellow-100";
      case "Assigned":
        return "text-blue-600 bg-blue-100";
      case "Resolved":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Resolve360</h1>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">Resident Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{currentUser.displayName}</span>
              </div>
              <button
                onClick={() => loadUserIssues()}
                disabled={refreshing}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh issues"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Issues
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter((issue) => issue.status === "Open").length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter((issue) => issue.status === "Resolved").length}
                </p>
              </div>
            </div>
          </motion.div>

         
        </div>

        {/* AI Model Information */}
        <div className="mb-8">
          <ModelInfo />
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Issues</h2>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No issues reported yet
              </h3>
              <p className="text-gray-600 mb-4">
                Report your first maintenance issue to get started
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-primary"
              >
                Report Issue
              </button>
            </motion.div>
          ) : (
            issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={issue.imageUrl}
                      alt="Issue"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {issue.category}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            issue.priority
                          )}`}
                        >
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{issue.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Assigned to: {issue.assignedContractor}</span>
                      <span>Reported: {formatDate(issue.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Report New Issue
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="btn-primary cursor-pointer"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {/* AI Classification Result */}
              {classification && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    AI Classification Result
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 text-blue-700">
                        {classification.category}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span>
                      <span className="ml-2 text-blue-700">
                        {(classification.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <span className="ml-2 text-blue-700">
                        {classification.classification.priority}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Assigned To:</span>
                      <span className="ml-2 text-blue-700">
                        {classification.contractor}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitIssue}
                  disabled={!selectedImage || classifying}
                  className={`btn-primary ${
                    !selectedImage || classifying
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {classifying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    "Submit Issue"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
