'use client';

import React, { useEffect, useState } from 'react';

interface Model {
    name: string;
    display_name: string;
    description: string;
    use_case: string;
    recommended_tokens: number;
    temperature: number;
}

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelName: string) => void;
    className?: string;
}

export default function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchModels();
    }, []);

    async function fetchModels() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/models`);
            if (!response.ok) throw new Error('Failed to fetch models');

            const data = await response.json();
            setModels(data.models || []);
        } catch (err) {
            console.error('Failed to load models:', err);
            setError('Could not load AI models');
        } finally {
            setLoading(false);
        }
    }

    const selectedModelData = models.find(m => m.name === selectedModel);

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-10 bg-slate-200 rounded-lg"></div>
            </div>
        );
    }

    if (error || models.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 mb-1">
                AI Model
            </label>
            <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 pr-8 bg-white"
            >
                {models.map((model) => (
                    <option key={model.name} value={model.name}>
                        {model.display_name}
                    </option>
                ))}
            </select>

            {selectedModelData && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">
                        <strong className="text-slate-700">{selectedModelData.display_name}:</strong> {selectedModelData.description}
                    </p>
                    <p className="text-xs text-slate-500">
                        💡 {selectedModelData.use_case}
                    </p>
                </div>
            )}
        </div>
    );
}
