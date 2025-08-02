import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export class FirestoreService {
  // Issues
  static async createIssue(issueData) {
    try {
      console.log("FirestoreService: Creating issue with data:", issueData);

      // Validate required fields
      if (!issueData.userId) {
        throw new Error("userId is required");
      }
      if (!issueData.category) {
        throw new Error("category is required");
      }
      if (!issueData.imageUrl) {
        throw new Error("imageUrl is required");
      }

      const docRef = await addDoc(collection(db, "issues"), {
        ...issueData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "Open",
      });

      console.log(
        "FirestoreService: Issue created successfully with ID:",
        docRef.id
      );
      return docRef.id;
    } catch (error) {
      console.error("FirestoreService: Error creating issue:", error);
      console.error("FirestoreService: Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  static async updateIssue(issueId, updateData) {
    try {
      const issueRef = doc(db, "issues", issueId);
      await updateDoc(issueRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating issue:", error);
      throw error;
    }
  }

  static async getIssue(issueId) {
    try {
      const issueRef = doc(db, "issues", issueId);
      const issueSnap = await getDoc(issueRef);

      if (issueSnap.exists()) {
        return { id: issueSnap.id, ...issueSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting issue:", error);
      throw error;
    }
  }

  static async getUserIssues(userId) {
    try {
      console.log("FirestoreService: Getting issues for user:", userId);

      // Simple query without ordering to avoid index requirements
      const q = query(collection(db, "issues"), where("userId", "==", userId));

      const querySnapshot = await getDocs(q);
      const issues = [];

      querySnapshot.forEach((doc) => {
        issues.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side to avoid index requirements
      issues.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime =
          b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(
        "FirestoreService: Successfully loaded",
        issues.length,
        "issues"
      );
      return issues;
    } catch (error) {
      console.error("FirestoreService: Error getting user issues:", error);
      throw error;
    }
  }

  static async getAllIssues() {
    try {
      console.log("FirestoreService: Getting all issues");

      // Simple query without ordering to avoid index requirements
      const querySnapshot = await getDocs(collection(db, "issues"));
      const issues = [];

      querySnapshot.forEach((doc) => {
        issues.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side to avoid index requirements
      issues.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime =
          b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(
        "FirestoreService: Successfully loaded",
        issues.length,
        "issues"
      );
      return issues;
    } catch (error) {
      console.error("FirestoreService: Error getting all issues:", error);
      throw error;
    }
  }

  static async getIssuesByStatus(status) {
    try {
      console.log("FirestoreService: Getting issues by status:", status);

      // Simple query without ordering to avoid index requirements
      const q = query(collection(db, "issues"), where("status", "==", status));

      const querySnapshot = await getDocs(q);
      const issues = [];

      querySnapshot.forEach((doc) => {
        issues.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side to avoid index requirements
      issues.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime =
          b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(
        "FirestoreService: Successfully loaded",
        issues.length,
        "issues with status:",
        status
      );
      return issues;
    } catch (error) {
      console.error("FirestoreService: Error getting issues by status:", error);
      throw error;
    }
  }

  static async getContractorIssues(contractorEmail) {
    try {
      console.log(
        "FirestoreService: Getting issues for contractor:",
        contractorEmail
      );

      // Simple query without ordering to avoid index requirements
      const q = query(
        collection(db, "issues"),
        where("assignedContractor", "==", contractorEmail)
      );

      const querySnapshot = await getDocs(q);
      const issues = [];

      querySnapshot.forEach((doc) => {
        issues.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side to avoid index requirements
      issues.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime =
          b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(
        "FirestoreService: Successfully loaded",
        issues.length,
        "issues for contractor"
      );
      return issues;
    } catch (error) {
      console.error(
        "FirestoreService: Error getting contractor issues:",
        error
      );
      throw error;
    }
  }

  // Users
  static async createUser(userData) {
    try {
      await addDoc(collection(db, "users"), {
        ...userData,
        createdAt: serverTimestamp(),
        isActive: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async getUser(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  static async getUsersByType(userType) {
    try {
      const q = query(
        collection(db, "users"),
        where("userType", "==", userType),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error("Error getting users by type:", error);
      throw error;
    }
  }

  // Contractors
  static async createContractor(contractorData) {
    try {
      await addDoc(collection(db, "contractors"), {
        ...contractorData,
        createdAt: serverTimestamp(),
        isActive: true,
      });
    } catch (error) {
      console.error("Error creating contractor:", error);
      throw error;
    }
  }

  static async getAllContractors() {
    try {
      const q = query(
        collection(db, "contractors"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const contractors = [];

      querySnapshot.forEach((doc) => {
        contractors.push({ id: doc.id, ...doc.data() });
      });

      return contractors;
    } catch (error) {
      console.error("Error getting all contractors:", error);
      throw error;
    }
  }

  static async getContractorsByCategory(category) {
    try {
      const q = query(
        collection(db, "contractors"),
        where("categories", "array-contains", category),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      const contractors = [];

      querySnapshot.forEach((doc) => {
        contractors.push({ id: doc.id, ...doc.data() });
      });

      return contractors;
    } catch (error) {
      console.error("Error getting contractors by category:", error);
      throw error;
    }
  }

  // Statistics
  static async getIssueStatistics() {
    try {
      const allIssues = await this.getAllIssues();

      const stats = {
        total: allIssues.length,
        open: allIssues.filter((issue) => issue.status === "Open").length,
        assigned: allIssues.filter((issue) => issue.status === "Assigned")
          .length,
        resolved: allIssues.filter((issue) => issue.status === "Resolved")
          .length,
        byCategory: {},
        byPriority: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      allIssues.forEach((issue) => {
        // Count by category
        if (issue.category) {
          stats.byCategory[issue.category] =
            (stats.byCategory[issue.category] || 0) + 1;
        }

        // Count by priority
        if (issue.priority) {
          stats.byPriority[issue.priority] =
            (stats.byPriority[issue.priority] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting issue statistics:", error);
      throw error;
    }
  }
}
