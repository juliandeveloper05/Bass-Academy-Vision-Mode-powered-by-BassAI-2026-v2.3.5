import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Play, Trash2, Copy, Download, Upload, Search, Filter, ArrowLeft, Tag, X } from 'lucide-react';
import CustomExerciseManager from '../../services/CustomExerciseManager';

/**
 * Custom Builder Hub - List and manage custom exercises
 * Mobile-first design - 2026
 */
const CustomBuilderHub = ({ onSelectExercise, onCreateNew, onBack }) => {
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterTag, setFilterTag] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = () => {
    setIsLoading(true);
    const data = CustomExerciseManager.loadAll();
    setExercises(data);
    setAllTags(CustomExerciseManager.getAllTags());
    setIsLoading(false);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este ejercicio?')) {
      CustomExerciseManager.delete(id);
      loadExercises();
    }
  };

  const handleDuplicate = (exercise) => {
    const duplicate = CustomExerciseManager.duplicate(exercise);
    CustomExerciseManager.save(duplicate);
    loadExercises();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const exercise = await CustomExerciseManager.import(file);
      CustomExerciseManager.save(exercise);
      loadExercises();
    } catch (error) {
      alert('Error al importar: ' + error.message);
    }
    e.target.value = ''; // Reset input
  };

  const filteredExercises = exercises.filter(ex => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query ||
      ex.name.toLowerCase().includes(query) ||
      (ex.description || '').toLowerCase().includes(query) ||
      (Array.isArray(ex.tags) && ex.tags.some(tag => tag.toLowerCase().includes(query)));
    const matchesDifficulty = filterDifficulty === 'all' || ex.difficulty === parseInt(filterDifficulty);
    const matchesTag = !filterTag || (Array.isArray(ex.tags) && ex.tags.includes(filterTag));
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0a1628] p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#778DA9] hover:text-[#C9A554] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A554] to-[#E0C285] mb-4">
            <Edit3 size={32} className="text-[#0D1B2A]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-['Playfair_Display']">
            Custom Builder
          </h1>
          <p className="text-[#778DA9] text-sm sm:text-base">
            Crea tus propios ejercicios de bajo
          </p>
        </div>

        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-[#C9A554] to-[#E0C285] text-[#0D1B2A] 
                   py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3
                   hover:shadow-[0_0_30px_rgba(201,165,84,0.4)] transition-all duration-300
                   active:scale-95"
        >
          <Plus size={24} />
          <span>Crear Nuevo Ejercicio</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#778DA9]" size={20} />
            <input
              type="text"
              placeholder="Buscar ejercicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder-[#778DA9] focus:border-[#C9A554] 
                       focus:outline-none transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#778DA9]" size={20} />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="pl-11 pr-8 py-3 rounded-xl bg-white/5 border border-white/10
                       text-white focus:border-[#C9A554] focus:outline-none
                       appearance-none cursor-pointer transition-colors min-w-[140px]"
            >
              <option value="all">All Levels</option>
              <option value="1">★ Beginner</option>
              <option value="2">★★ Easy</option>
              <option value="3">★★★ Medium</option>
              <option value="4">★★★★ Hard</option>
              <option value="5">★★★★★ Expert</option>
            </select>
          </div>

          {/* Import Button */}
          <label className="px-4 py-3 rounded-xl bg-white/5 border border-white/10
                          text-white hover:bg-white/10 transition-colors cursor-pointer
                          flex items-center gap-2">
            <Upload size={20} />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json,.bass" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="flex items-center gap-1 text-xs text-[#778DA9] py-1">
              <Tag size={12} />
              Tags:
            </span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterTag === tag
                    ? 'bg-[#C9A554] text-[#0D1B2A]'
                    : 'bg-white/10 text-[#C9A554] hover:bg-white/20'
                }`}
              >
                {tag}
              </button>
            ))}
            {filterTag && (
              <button
                onClick={() => setFilterTag(null)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-[#778DA9] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={10} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-[#778DA9]">
            <div className="w-12 h-12 border-4 border-[#C9A554] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Cargando ejercicios...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Edit3 size={32} className="text-[#778DA9]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No hay ejercicios aún</h3>
            <p className="text-[#778DA9] mb-6">
              {searchQuery || filterTag ? 'No se encontraron ejercicios' : 'Crea tu primer ejercicio personalizado'}
            </p>
            {!searchQuery && !filterTag && (
              <button
                onClick={onCreateNew}
                className="px-6 py-3 bg-[#C9A554] text-[#0D1B2A] rounded-xl font-semibold
                         hover:bg-[#E0C285] transition-colors"
              >
                Crear Ahora
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPlay={() => onSelectExercise(exercise)}
                onEdit={() => onSelectExercise(exercise, true)}
                onDelete={() => handleDelete(exercise.id)}
                onDuplicate={() => handleDuplicate(exercise)}
                onExport={() => CustomExerciseManager.export(exercise)}
                onTagClick={(tag) => setFilterTag(filterTag === tag ? null : tag)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Exercise Card Component
 */
const ExerciseCard = ({ exercise, onPlay, onEdit, onDelete, onDuplicate, onExport, onTagClick }) => {
  const noteCount = exercise.pattern?.notes?.length || 0;
  const notesPerBeat = exercise.pattern?.notesPerBeat || 3;
  const duration = Math.round((noteCount / notesPerBeat / (exercise.tempo || 100)) * 60);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5
                    hover:bg-white/8 hover:border-[#C9A554]/30 transition-all duration-300
                    group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate font-['Playfair_Display']">
            {exercise.name}
          </h3>
          {exercise.description && (
            <p className="text-sm text-[#778DA9] line-clamp-2">
              {exercise.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#C9A554]">
          {'★'.repeat(exercise.difficulty || 1)}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[#778DA9] mb-4">
        <span>{noteCount} notes</span>
        <span>•</span>
        <span>~{duration}s</span>
        <span>•</span>
        <span>{exercise.tempo || 100} BPM</span>
      </div>

      {/* Tags */}
      {exercise.tags && exercise.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.tags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              onClick={() => onTagClick && onTagClick(tag)}
              className="px-2 py-1 bg-white/10 rounded-lg text-xs text-[#C9A554] hover:bg-[#C9A554]/20 transition-colors"
              title={`Filter by "${tag}"`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          className="flex-1 bg-gradient-to-r from-[#C9A554] to-[#E0C285] text-[#0D1B2A]
                   py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2
                   hover:shadow-lg transition-all active:scale-95"
        >
          <Play size={16} fill="currentColor" />
          <span>Play</span>
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-2.5 bg-white/10 text-white rounded-xl
                   hover:bg-white/20 transition-colors"
          title="Edit"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={onDuplicate}
          className="px-3 py-2.5 bg-white/10 text-white rounded-xl
                   hover:bg-white/20 transition-colors"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={onExport}
          className="px-3 py-2.5 bg-white/10 text-white rounded-xl
                   hover:bg-white/20 transition-colors"
          title="Export"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2.5 bg-red-500/20 text-red-400 rounded-xl
                   hover:bg-red-500/30 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CustomBuilderHub;
