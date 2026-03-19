/**
 * Custom Exercise Manager
 * Bass Academy - 2026
 * 
 * Service class for managing custom exercises: CRUD, import/export, storage
 */

// Storage key for custom exercises
export const CUSTOM_EXERCISES_KEY = 'bass-academy-custom-exercises-v1';

/**
 * Playing techniques for notation
 */
export const PLAYING_TECHNIQUES = {
  NORMAL: { id: 'normal', label: 'Fingerstyle', icon: '👆' },
  SLAP: { id: 'slap', label: 'Slap', icon: '👊' },
  POP: { id: 'pop', label: 'Pop', icon: '💥' },
  HAMMER: { id: 'hammer', label: 'Hammer-On', icon: 'H' },
  PULL: { id: 'pull', label: 'Pull-Off', icon: 'P' },
  SLIDE: { id: 'slide', label: 'Slide', icon: '/' },
  MUTE: { id: 'mute', label: 'Muted', icon: 'X' },
  HARMONIC: { id: 'harmonic', label: 'Harmonic', icon: '◊' },
};

/**
 * Quick-start templates
 */
export const EXERCISE_TEMPLATES = {
  EMPTY_4_4: {
    name: 'Blank 4/4',
    beatsPerMeasure: 4,
    notesPerBeat: 3,
    notes: [],
  },
  MAJOR_SCALE: {
    name: 'Major Scale Pattern',
    beatsPerMeasure: 4,
    notesPerBeat: 4,
    notes: [
      { string: 'E', fret: 0 },
      { string: 'E', fret: 2 },
      { string: 'E', fret: 4 },
      { string: 'A', fret: 0 },
      { string: 'A', fret: 2 },
      { string: 'A', fret: 4 },
      { string: 'D', fret: 1 },
      { string: 'D', fret: 2 },
    ],
  },
  GROOVE_PATTERN: {
    name: '8-Bar Groove',
    beatsPerMeasure: 4,
    notesPerBeat: 4,
    notes: [
      { string: 'E', fret: 0, technique: 'slap' },
      { string: 'E', fret: 0, technique: 'mute' },
      { string: 'D', fret: 10, technique: 'pop' },
      { string: 'E', fret: 0, technique: 'normal' },
    ],
  },
};

/**
 * Custom Exercise Manager Class
 */
class CustomExerciseManager {
  static STORAGE_KEY = CUSTOM_EXERCISES_KEY;

  /**
   * Create new exercise from template
   */
  static create(name = 'New Exercise', template = 'EMPTY_4_4') {
    const templateData = EXERCISE_TEMPLATES[template] || EXERCISE_TEMPLATES.EMPTY_4_4;
    
    return {
      id: crypto.randomUUID(),
      name,
      description: '',
      author: '',
      created: Date.now(),
      modified: Date.now(),
      category: 'custom',
      difficulty: 3,
      tempo: 100,
      tags: [],
      isPublic: false,
      pattern: {
        beatsPerMeasure: templateData.beatsPerMeasure,
        notesPerBeat: templateData.notesPerBeat,
        rootNote: 'E',
        notes: templateData.notes.map((note, i) => ({
          id: i,
          ...note,
          technique: note.technique || 'normal',
          duration: 1,
        })),
      },
      stats: {
        timesPlayed: 0,
        lastPlayed: null,
        averageTempo: 100,
      },
    };
  }

  /**
   * Load all exercises from storage
   */
  static loadAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.warn('Failed to load custom exercises:', error);
      return [];
    }
  }

  /**
   * Save all exercises to storage
   */
  static saveAll(exercises) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exercises));
      return true;
    } catch (error) {
      console.error('Failed to save custom exercises:', error);
      return false;
    }
  }

  /**
   * Save a single exercise
   */
  static save(exercise) {
    const exercises = this.loadAll();
    const index = exercises.findIndex(e => e.id === exercise.id);
    
    exercise.modified = Date.now();
    
    if (index >= 0) {
      exercises[index] = exercise;
    } else {
      exercises.push(exercise);
    }
    
    return this.saveAll(exercises);
  }

  /**
   * Delete exercise by ID
   */
  static delete(exerciseId) {
    const exercises = this.loadAll();
    const filtered = exercises.filter(e => e.id !== exerciseId);
    return this.saveAll(filtered);
  }

  /**
   * Export exercise to JSON file download
   */
  static export(exercise) {
    const json = JSON.stringify(exercise, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exercise.name.replace(/\s+/g, '_')}.bass.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import exercise from JSON file
   */
  static import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exercise = JSON.parse(e.target.result);
          // Regenerate ID to avoid conflicts
          exercise.id = crypto.randomUUID();
          exercise.created = Date.now();
          exercise.modified = Date.now();
          resolve(exercise);
        } catch (error) {
          reject(new Error('Invalid exercise file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Duplicate an exercise
   */
  static duplicate(exercise) {
    return {
      ...exercise,
      id: crypto.randomUUID(),
      name: `${exercise.name} (Copy)`,
      created: Date.now(),
      modified: Date.now(),
      pattern: {
        ...exercise.pattern,
        notes: exercise.pattern.notes.map((note, i) => ({ ...note, id: i })),
      },
      stats: {
        timesPlayed: 0,
        lastPlayed: null,
        averageTempo: exercise.tempo,
      },
    };
  }

  /**
   * Get exercise by ID
   */
  static getById(exerciseId) {
    const exercises = this.loadAll();
    return exercises.find(e => e.id === exerciseId) || null;
  }

  /**
   * Get all unique tags across all exercises, sorted alphabetically
   */
  static getAllTags() {
    const exercises = this.loadAll();
    const tagSet = new Set();
    exercises.forEach(ex => {
      if (Array.isArray(ex.tags)) {
        ex.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Get exercises filtered by tag
   */
  static getByTag(tag) {
    const exercises = this.loadAll();
    return exercises.filter(ex => Array.isArray(ex.tags) && ex.tags.includes(tag));
  }
}

export default CustomExerciseManager;
