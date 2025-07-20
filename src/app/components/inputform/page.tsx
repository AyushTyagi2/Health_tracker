'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Calendar, Utensils, Heart, FileText } from 'lucide-react';

import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

interface FormData {
  Date: string;
  Time: string;
  Food_Item: string;
  Quantity: string;
  Calories: string;
  Meal_Time: string;
  BP_Systolic: string;
  BP_Diastolic: string;
  Sugar_Level: string;
  Weight: string;
  Waist_Circumference: string;
  Notes: string;
}

interface Card {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  fields: (keyof FormData)[];
}

export default function HealthTracker() {
  const [formData, setFormData] = useState<FormData>({
    Date: '',
    Time: '',
    Food_Item: '',
    Quantity: '',
    Calories: '',
    Meal_Time: '',
    BP_Systolic: '',
    BP_Diastolic: '',
    Sugar_Level: '',
    Weight: '',
    Waist_Circumference: '',
    Notes: '',
  });

  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark card as completed if it has meaningful data
    if (value) {
      const cardType = getCardType(name as keyof FormData);
      if (cardType && !completedCards.has(cardType)) {
        setCompletedCards(prev => new Set([...prev, cardType]));
      }
    }
  };

  const getCardType = (fieldName: keyof FormData): string | null => {
    if (['Date', 'Time'].includes(fieldName)) return 'basic';
    if (['Food_Item', 'Quantity', 'Calories', 'Meal_Time'].includes(fieldName)) return 'nutrition';
    if (['BP_Systolic', 'BP_Diastolic', 'Sugar_Level', 'Weight', 'Waist_Circumference'].includes(fieldName)) return 'vitals';
    if (['Notes'].includes(fieldName)) return 'notes';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

      try {
    const docRef = await addDoc(collection(db, "trackerEntries"), {
      ...formData,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
    // Basic validation
    if (!formData.Date || !formData.Time) {
      alert("Please fill in the date and time fields.");
      return;
    }

    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      
      if (result.success) {
        console.log("Health data logged:", result);
        alert(`Health data logged successfully! Total logs: ${result.totalLogs}`);
        
        // Optional: Reset form after successful submission
        // setFormData({...initialFormData});
        // setCompletedCards(new Set());
        // setActiveCard(null);
      } else {
        throw new Error(result.error || 'Failed to log data');
      }
      
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error submitting data. Please try again.");
    }
  };

  const cards: Card[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      fields: ['Date', 'Time']
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      icon: Utensils,
      color: 'from-green-500 to-green-600',
      fields: ['Food_Item', 'Quantity', 'Calories', 'Meal_Time']
    },
    {
      id: 'vitals',
      title: 'Health Vitals',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      fields: ['BP_Systolic', 'BP_Diastolic', 'Sugar_Level', 'Weight', 'Waist_Circumference']
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: FileText,
      color: 'from-gray-500 to-gray-600',
      fields: ['Notes']
    }
  ];

  useEffect(() => {
    const now = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    const formatTime = (date: Date) => {
      return date.toTimeString().slice(0, 5);
    };

    setFormData(prev => ({
      ...prev,
      Date: formatDate(now),
      Time: formatTime(now),
    }));
  }, []);

  const renderField = (fieldName: keyof FormData) => {
    const value = formData[fieldName];
    const label = fieldName.replace(/_/g, ' ');

    if (fieldName === 'Meal_Time') {
      return (
        <select 
          name={fieldName} 
          value={value} 
          onChange={handleChange} 
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Select Meal</option>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (fieldName === 'Notes') {
      return (
        <textarea 
          name={fieldName} 
          value={value} 
          onChange={handleChange} 
          placeholder="Any additional notes about your day..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none" 
          rows={4} 
        />
      );
    }

    const inputType = fieldName.includes('Date') ? 'date' : 
                     fieldName.includes('Time') ? 'time' : 
                     ['Calories', 'Quantity', 'BP_Systolic', 'BP_Diastolic', 'Sugar_Level', 'Weight', 'Waist_Circumference'].includes(fieldName) ? 'number' : 
                     'text';

    const placeholder = {
      'Food_Item': 'e.g., Grilled chicken salad',
      'Quantity': '150',
      'Calories': '320',
      'BP_Systolic': '120',
      'BP_Diastolic': '80',
      'Sugar_Level': '95',
      'Weight': '70.5',
      'Waist_Circumference': '32',
    }[fieldName] || '';

    return (
      <input
        type={inputType}
        name={fieldName}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
        step={inputType === 'number' ? '0.1' : undefined}
        min={inputType === 'number' ? '0' : undefined}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Tracker</h1>
          <p className="text-gray-700 text-lg">Track your daily health metrics in one beautiful dashboard</p>
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {cards.map(card => (
                <div 
                  key={card.id} 
                  className={`w-3 h-3 rounded-full transition-all ${
                    completedCards.has(card.id) ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => {
              const IconComponent = card.icon;
              const isCompleted = completedCards.has(card.id);
              const isActive = activeCard === card.id;
              
              return (
                <div
                  key={card.id}
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${
                    isActive ? 'ring-4 ring-blue-400 scale-105' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveCard(isActive ? null : card.id);
                  }}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${card.color} p-6 text-white relative`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent size={24} />
                        <h3 className="font-semibold text-lg">{card.title}</h3>
                      </div>
                      {isCompleted && (
                        <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
                    <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white bg-opacity-10 rounded-full" />
                  </div>

                  {/* Expandable Content */}
                  {isActive && (
                    <div className="transition-all duration-300 p-6 space-y-4">
                      {card.fields.map(field => (
                        <div key={field} onClick={(e) => e.stopPropagation()}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.replace(/_/g, ' ')}
                          </label>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview when collapsed */}
                  {!isActive && (
                    <div className="p-4">
                      <p className="text-gray-600 text-sm">
                        {card.fields.some(field => formData[field]) 
                          ? `${card.fields.filter(field => formData[field]).length} of ${card.fields.length} filled`
                          : `Click to fill ${card.fields.length} fields`
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto space-x-2"
            >
              <Heart size={20} />
              <span>Log Health Data</span>
            </button>
            
            {completedCards.size > 0 && (
              <p className="mt-4 text-gray-600">
                Great progress! You've completed {completedCards.size} out of {cards.length} categories.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}