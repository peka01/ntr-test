import { Tour, TourStep } from '../contexts/TourContext';
import { ShoutoutFeature } from '../contexts/ShoutoutContext';

export interface TourManagementData {
  tours: Tour[];
  lastModified: string;
  version: string;
}

export interface ShoutoutManagementData {
  shoutouts: ShoutoutFeature[];
  lastModified: string;
  version: string;
}

export interface TourFormData {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'admin' | 'user';
  requiredRole: 'admin' | 'user' | 'any';
  estimatedDuration: number;
  language: 'en' | 'sv';
  steps: TourStep[];
}

export interface TourStepFormData {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'wait' | 'navigate' | 'scroll';
  actionTarget?: string;
  actionData?: any;
  waitTime?: number;
  requiredView?: string;
  skipIfNotFound?: boolean;
}

export interface ShoutoutFormData {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  tourId?: string;
  category: 'feature' | 'improvement' | 'announcement' | 'bugfix';
  priority: 'low' | 'medium' | 'high';
  releaseDate: string;
  expireDate?: string;
  isNew?: boolean;
}

class TourManagementService {
  private readonly STORAGE_KEY = 'admin-tours';
  private readonly SHOUTOUT_STORAGE_KEY = 'admin-shoutouts';
  private readonly VERSION = '1.0.0';

  // Generate a unique ID
  private generateId(): string {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Get all tours from storage
  getTours(): Tour[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: TourManagementData = JSON.parse(data);
        return parsed.tours || [];
      }
    } catch (error) {
      console.error('Error loading tours:', error);
    }
    return [];
  }

  // Get all tours including default tours (for management interface)
  getAllToursForManagement(defaultTours: Tour[]): Tour[] {
    const adminTours = this.getTours();
    const tourMap = new Map<string, Tour>();
    
    // Add default tours first
    defaultTours.forEach(tour => {
      tourMap.set(tour.id, { ...tour, category: tour.category || 'onboarding' });
    });
    
    // Override with admin tours
    adminTours.forEach(tour => {
      tourMap.set(tour.id, tour);
    });
    
    return Array.from(tourMap.values());
  }

  // Check if a tour is a default tour
  isDefaultTour(tourId: string, defaultTours: Tour[]): boolean {
    return defaultTours.some(tour => tour.id === tourId);
  }

  // Save tours to storage
  saveTours(tours: Tour[]): boolean {
    try {
      const data: TourManagementData = {
        tours,
        lastModified: new Date().toISOString(),
        version: this.VERSION
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving tours:', error);
      return false;
    }
  }

  // Get a specific tour by ID
  getTourById(id: string): Tour | null {
    const tours = this.getTours();
    return tours.find(tour => tour.id === id) || null;
  }

  // Create a new tour
  createTour(tourData: Omit<Tour, 'id'>): Tour | null {
    const tours = this.getTours();
    const newTour: Tour = {
      ...tourData,
      id: this.generateTourId(tourData.name)
    };

    // Check if ID already exists
    if (tours.find(tour => tour.id === newTour.id)) {
      newTour.id = this.generateUniqueTourId(tourData.name, tours);
    }

    tours.push(newTour);
    
    if (this.saveTours(tours)) {
      return newTour;
    }
    return null;
  }

  // Update an existing tour
  updateTour(id: string, tourData: Partial<Tour>): Tour | null {
    const tours = this.getTours();
    const index = tours.findIndex(tour => tour.id === id);
    
    if (index === -1) {
      return null;
    }

    tours[index] = { ...tours[index], ...tourData };
    
    if (this.saveTours(tours)) {
      return tours[index];
    }
    return null;
  }

  // Delete a tour
  deleteTour(id: string): boolean {
    const tours = this.getTours();
    const filteredTours = tours.filter(tour => tour.id !== id);
    
    if (filteredTours.length === tours.length) {
      return false; // Tour not found
    }

    return this.saveTours(filteredTours);
  }

  // Duplicate a tour
  duplicateTour(id: string): Tour | null {
    const originalTour = this.getTourById(id);
    if (!originalTour) {
      return null;
    }

    const duplicatedTour: Tour = {
      ...originalTour,
      id: this.generateUniqueTourId(`${originalTour.name} (Copy)`, this.getTours()),
      name: `${originalTour.name} (Copy)`,
      steps: originalTour.steps.map(step => ({
        ...step,
        id: this.generateStepId(step.title)
      }))
    };

    const tours = this.getTours();
    tours.push(duplicatedTour);
    
    if (this.saveTours(tours)) {
      return duplicatedTour;
    }
    return null;
  }

  // Reorder tours
  reorderTours(tourIds: string[]): boolean {
    const tours = this.getTours();
    const reorderedTours: Tour[] = [];
    
    // Add tours in the specified order
    tourIds.forEach(id => {
      const tour = tours.find(t => t.id === id);
      if (tour) {
        reorderedTours.push(tour);
      }
    });

    // Add any remaining tours that weren't in the reorder list
    tours.forEach(tour => {
      if (!tourIds.includes(tour.id)) {
        reorderedTours.push(tour);
      }
    });

    return this.saveTours(reorderedTours);
  }

  // Export tours to JSON
  exportTours(): string {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data || '[]';
  }

  // Import tours from JSON
  importTours(jsonData: string): boolean {
    try {
      const parsed: TourManagementData = JSON.parse(jsonData);
      if (parsed.tours && Array.isArray(parsed.tours)) {
        return this.saveTours(parsed.tours);
      }
    } catch (error) {
      console.error('Error importing tours:', error);
    }
    return false;
  }

  // Reset to default tours
  resetToDefaults(): boolean {
    return this.saveTours([]);
  }

  // Get tour statistics
  getTourStats(): {
    totalTours: number;
    totalSteps: number;
    toursByCategory: Record<string, number>;
    averageStepsPerTour: number;
  } {
    const tours = this.getTours();
    const totalTours = tours.length;
    const totalSteps = tours.reduce((sum, tour) => sum + tour.steps.length, 0);
    
    const toursByCategory = tours.reduce((acc, tour) => {
      acc[tour.category || 'other'] = (acc[tour.category || 'other'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageStepsPerTour = totalTours > 0 ? totalSteps / totalTours : 0;

    return {
      totalTours,
      totalSteps,
      toursByCategory,
      averageStepsPerTour
    };
  }

  // Generate unique tour ID
  private generateTourId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  // Generate unique tour ID ensuring no conflicts
  private generateUniqueTourId(name: string, existingTours: Tour[]): string {
    let baseId = this.generateTourId(name);
    let counter = 1;
    let uniqueId = baseId;

    while (existingTours.find(tour => tour.id === uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    return uniqueId;
  }

  // Generate unique step ID
  private generateStepId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }

  // Validate tour data
  validateTour(tour: Partial<Tour>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tour.name || tour.name.trim().length === 0) {
      errors.push('Tour name is required');
    }

    if (!tour.description || tour.description.trim().length === 0) {
      errors.push('Tour description is required');
    }

    if (!tour.steps || tour.steps.length === 0) {
      errors.push('Tour must have at least one step');
    }

    if (tour.steps) {
      tour.steps.forEach((step, index) => {
        if (!step.title || step.title.trim().length === 0) {
          errors.push(`Step ${index + 1}: Title is required`);
        }
        if (!step.content || step.content.trim().length === 0) {
          errors.push(`Step ${index + 1}: Content is required`);
        }
        if (!step.target || step.target.trim().length === 0) {
          errors.push(`Step ${index + 1}: Target selector is required`);
        }
      });
    }

    if (tour.estimatedDuration && tour.estimatedDuration < 1) {
      errors.push('Estimated duration must be at least 1 minute');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===== SHOUTOUT MANAGEMENT METHODS =====

  // Get all shoutouts from storage
  getShoutouts(): ShoutoutFeature[] {
    try {
      const data = localStorage.getItem(this.SHOUTOUT_STORAGE_KEY);
      if (data) {
        const parsed: ShoutoutManagementData = JSON.parse(data);
        return parsed.shoutouts || [];
      }
    } catch (error) {
      console.error('Error loading shoutouts:', error);
    }
    return [];
  }

  // Save shoutouts to storage
  saveShoutouts(shoutouts: ShoutoutFeature[]): void {
    try {
      const data: ShoutoutManagementData = {
        shoutouts,
        lastModified: new Date().toISOString(),
        version: this.VERSION
      };
      localStorage.setItem(this.SHOUTOUT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving shoutouts:', error);
    }
  }

  // Create a new shoutout
  createShoutout(shoutoutData: ShoutoutFormData): ShoutoutFeature {
    const shoutouts = this.getShoutouts();
    const newShoutout: ShoutoutFeature = {
      id: shoutoutData.id || this.generateId(),
      title: shoutoutData.title,
      description: shoutoutData.description,
      image: shoutoutData.image,
      icon: shoutoutData.icon,
      tourId: shoutoutData.tourId,
      category: shoutoutData.category,
      priority: shoutoutData.priority,
      releaseDate: shoutoutData.releaseDate,
      expireDate: shoutoutData.expireDate,
      isNew: shoutoutData.isNew || true
    };

    shoutouts.push(newShoutout);
    this.saveShoutouts(shoutouts);
    return newShoutout;
  }

  // Update an existing shoutout
  updateShoutout(id: string, shoutoutData: ShoutoutFormData): ShoutoutFeature | null {
    const shoutouts = this.getShoutouts();
    const index = shoutouts.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    const updatedShoutout: ShoutoutFeature = {
      ...shoutouts[index],
      title: shoutoutData.title,
      description: shoutoutData.description,
      image: shoutoutData.image,
      icon: shoutoutData.icon,
      tourId: shoutoutData.tourId,
      category: shoutoutData.category,
      priority: shoutoutData.priority,
      releaseDate: shoutoutData.releaseDate,
      expireDate: shoutoutData.expireDate,
      isNew: shoutoutData.isNew
    };

    shoutouts[index] = updatedShoutout;
    this.saveShoutouts(shoutouts);
    return updatedShoutout;
  }

  // Delete a shoutout
  deleteShoutout(id: string): boolean {
    const shoutouts = this.getShoutouts();
    const filtered = shoutouts.filter(s => s.id !== id);
    
    if (filtered.length === shoutouts.length) return false;
    
    this.saveShoutouts(filtered);
    return true;
  }

  // Duplicate a shoutout
  duplicateShoutout(id: string): ShoutoutFeature | null {
    const shoutouts = this.getShoutouts();
    const original = shoutouts.find(s => s.id === id);
    
    if (!original) return null;

    const duplicated: ShoutoutFeature = {
      ...original,
      id: this.generateId(),
      title: `${original.title} (Copy)`,
      isNew: true
    };

    shoutouts.push(duplicated);
    this.saveShoutouts(shoutouts);
    return duplicated;
  }

  // Export shoutouts to JSON
  exportShoutouts(): string {
    const data: ShoutoutManagementData = {
      shoutouts: this.getShoutouts(),
      lastModified: new Date().toISOString(),
      version: this.VERSION
    };
    return JSON.stringify(data, null, 2);
  }

  // Import shoutouts from JSON
  importShoutouts(jsonData: string): { success: boolean; message: string; count: number } {
    try {
      const data: ShoutoutManagementData = JSON.parse(jsonData);
      
      if (!data.shoutouts || !Array.isArray(data.shoutouts)) {
        return { success: false, message: 'Invalid shoutout data format', count: 0 };
      }

      // Validate shoutouts
      const validation = this.validateShoutouts(data.shoutouts);
      if (!validation.isValid) {
        return { success: false, message: `Validation failed: ${validation.errors.join(', ')}`, count: 0 };
      }

      this.saveShoutouts(data.shoutouts);
      return { success: true, message: 'Shoutouts imported successfully', count: data.shoutouts.length };
    } catch (error) {
      return { success: false, message: 'Invalid JSON format', count: 0 };
    }
  }

  // Get shoutout statistics
  getShoutoutStats(): { total: number; byCategory: Record<string, number>; byPriority: Record<string, number> } {
    const shoutouts = this.getShoutouts();
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    shoutouts.forEach(shoutout => {
      byCategory[shoutout.category] = (byCategory[shoutout.category] || 0) + 1;
      byPriority[shoutout.priority] = (byPriority[shoutout.priority] || 0) + 1;
    });

    return {
      total: shoutouts.length,
      byCategory,
      byPriority
    };
  }

  // Validate shoutouts
  validateShoutouts(shoutouts: ShoutoutFeature[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(shoutouts)) {
      errors.push('Shoutouts must be an array');
      return { isValid: false, errors };
    }

    shoutouts.forEach((shoutout, index) => {
      if (!shoutout.id || shoutout.id.trim().length === 0) {
        errors.push(`Shoutout ${index + 1}: ID is required`);
      }
      if (!shoutout.title || shoutout.title.trim().length === 0) {
        errors.push(`Shoutout ${index + 1}: Title is required`);
      }
      if (!shoutout.description || shoutout.description.trim().length === 0) {
        errors.push(`Shoutout ${index + 1}: Description is required`);
      }
      if (!shoutout.category || !['feature', 'improvement', 'announcement', 'bugfix'].includes(shoutout.category)) {
        errors.push(`Shoutout ${index + 1}: Valid category is required`);
      }
      if (!shoutout.priority || !['low', 'medium', 'high'].includes(shoutout.priority)) {
        errors.push(`Shoutout ${index + 1}: Valid priority is required`);
      }
      if (!shoutout.releaseDate || isNaN(Date.parse(shoutout.releaseDate))) {
        errors.push(`Shoutout ${index + 1}: Valid release date is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const tourManagementService = new TourManagementService();
