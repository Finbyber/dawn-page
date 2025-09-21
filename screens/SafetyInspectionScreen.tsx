


import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Screen, ChecklistItem, SafetyInspectionData, Report, FieldUser } from '../types';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import DatePicker from '../components/common/DatePicker';
import { saveReport, fileToBase64, saveOfflineReport, updateReport, getGpsEnabled, saveOfflineEdit } from '../utils/storage';
import {
    DotsHorizontalIcon,
    CalendarIcon,
    LocationMarkerIcon,
    UserIcon,
    CameraIcon,
    DocumentUploadIcon,
    TrashIcon,
} from '../components/icons/Icons';

const initialChecklist: ChecklistItem[] = [
    { id: 1, text: 'Incidents', status: null },
    { id: 2, text: 'Near Miss', status: null },
    { id: 3, text: 'Environmental', status: null },
];

interface SafetyInspectionScreenProps {
    setScreen: (screen: Screen) => void;
    user: FieldUser | null;
    reportToEdit?: Report | null;
    onFinishEditing: () => void;
}

const SafetyInspectionScreen: React.FC<SafetyInspectionScreenProps> = ({ setScreen, user, reportToEdit, onFinishEditing }) => {
    const isEditMode = !!reportToEdit;
    const inspectorName = user?.fullName || '';

    const [formState, setFormState] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return {
            date: `${year}-${month}-${day}`,
            siteArea: '',
            inspectorName: inspectorName,
            notes: '',
        };
    });
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode && reportToEdit) {
            const data = reportToEdit.data as SafetyInspectionData;
            setFormState({
                date: data.inspectionDate,
                siteArea: data.siteArea,
                inspectorName: data.inspectorName,
                notes: data.notes,
            });
            setChecklist(data.checklist);
            setExistingPhotos(data.photos || []);
        } else {
            // Reset form when switching from edit to create mode
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            setFormState({
                date: `${year}-${month}-${day}`,
                siteArea: '',
                inspectorName: inspectorName,
                notes: '',
            });
            setChecklist(initialChecklist);
            setExistingPhotos([]);
            setNewPhotos([]);
        }
    }, [isEditMode, reportToEdit, inspectorName]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleDateChange = (newDate: string) => {
        setFormState(prev => ({ ...prev, date: newDate }));
    };

    const handleChecklistChange = (id: number, status: 'Pass' | 'Fail') => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: item.status === status ? null : status } : item));
    };

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles: File[] = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;

        const combinedFiles = [...newPhotos, ...selectedFiles];
        setNewPhotos(combinedFiles);

        if (event.target) {
            event.target.value = '';
        }
    }, [newPhotos]);
    
    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index: number) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleBack = () => {
        onFinishEditing();
        setScreen(isEditMode ? Screen.Reports : Screen.Home);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to submit a report.");
            return;
        }
        setIsSubmitting(true);
    
        let location;
        if (getGpsEnabled()) {
            try {
                location = await new Promise<{ latitude: number; longitude: number; }>((resolve, reject) => {
                    if (!navigator.geolocation) {
                        return reject(new Error('Geolocation is not supported.'));
                    }
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }),
                        (err) => reject(new Error(`Could not get location: ${err.message}`))
                    );
                });
            } catch (error) {
                console.warn("Could not get location:", error);
            }
        }

        try {
            const newPhotoPromises = newPhotos.map(file => fileToBase64(file));
            const newBase64Photos = await Promise.all(newPhotoPromises);
            const finalPhotos = [...existingPhotos, ...newBase64Photos];
    
            const reportData: SafetyInspectionData = {
                inspectionDate: formState.date,
                siteArea: formState.siteArea,
                inspectorName: formState.inspectorName,
                notes: formState.notes,
                checklist: checklist,
                photos: finalPhotos,
                notesLength: formState.notes.length,
                photoCount: finalPhotos.length,
                gps: location,
            };

            if (isEditMode && reportToEdit) {
                if (navigator.onLine) {
                    updateReport(reportToEdit.id, reportData);
                    alert('Report updated successfully!');
                } else {
                    saveOfflineEdit({ reportId: reportToEdit.id, updatedData: reportData });
                    alert('No internet connection. Report edit saved locally and will sync when you are back online.');
                }
            } else {
                const reportToSubmit = {
                    type: 'Safety Inspection' as const,
                    data: reportData,
                };
        
                if (navigator.onLine) {
                    try {
                        saveReport(reportToSubmit, user.id);
                        alert('Safety inspection submitted successfully!');
                    } catch (submissionError) {
                        console.error('Online submission failed, saving report for later.', submissionError);
                        saveOfflineReport({ ...reportToSubmit, submittedBy: user.id });
                        alert('Submission failed. Report saved locally and will submit when online.');
                    }
                } else {
                    saveOfflineReport({ ...reportToSubmit, submittedBy: user.id });
                    alert('No internet connection. Report saved locally and will submit later.');
                }
            }
            onFinishEditing();
            setScreen(Screen.Reports);
    
        } catch (error) {
            console.error("Failed to prepare report for submission:", error);
            alert('There was an error preparing your report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Header
                title={isEditMode ? "Edit Safety Inspection" : "Safety Inspection"}
                onBack={handleBack}
                actions={
                    <button className="p-2 rounded-full hover:bg-slate-700">
                        <DotsHorizontalIcon />
                    </button>
                }
            />
            <form onSubmit={handleSubmit} className="p-4 space-y-8">
                <div className="space-y-4">
                    <DatePicker
                        id="date"
                        label="Inspection Date"
                        value={formState.date}
                        onChange={handleDateChange}
                        required
                    />
                    <Input
                        id="siteArea"
                        label="Site/Area"
                        type="text"
                        placeholder="e.g. Workshop 3"
                        value={formState.siteArea}
                        onChange={handleFormChange}
                        icon={<LocationMarkerIcon className="h-5 w-5 text-slate-400" />}
                        className="!bg-slate-800 !border-slate-700 !text-white !placeholder-slate-400 !py-3 !rounded-lg"
                        maxLength={100}
                        required
                    />
                    <Input
                        id="inspectorName"
                        label="Inspector Name"
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={formState.inspectorName}
                        onChange={handleFormChange}
                        icon={<UserIcon className="h-5 w-5 text-slate-400" />}
                        className="!bg-slate-800 !border-slate-700 !text-white !placeholder-slate-400 !py-3 !rounded-lg"
                        maxLength={50}
                        required
                        readOnly
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-200">Inspection Checklist</h3>
                    <div className="bg-slate-800 rounded-lg">
                        {checklist.map((item, index) => (
                            <div key={item.id} className={`flex items-center justify-between p-4 ${index < checklist.length - 1 ? 'border-b border-slate-700' : ''}`}>
                                <p className="text-slate-200">{item.text}</p>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleChecklistChange(item.id, 'Pass')}
                                        className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${item.status === 'Pass' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >Pass</button>
                                    <button
                                        type="button"
                                        onClick={() => handleChecklistChange(item.id, 'Fail')}
                                        className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${item.status === 'Fail' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >Fail</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Textarea
                        id="notes"
                        label="Notes"
                        placeholder="Add notes..."
                        value={formState.notes}
                        onChange={handleFormChange}
                        className="!bg-slate-800 !border-slate-700 !text-white !placeholder-slate-400 !py-3 !rounded-lg"
                        maxLength={500}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-200">Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg h-32 hover:bg-slate-700 transition-colors">
                            <CameraIcon className="h-8 w-8 text-white mb-2" />
                            <span className="text-white">Take Photo</span>
                        </button>
                        <button type="button" onClick={() => uploadInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg h-32 hover:bg-slate-700 transition-colors">
                            <DocumentUploadIcon className="h-8 w-8 text-white mb-2" />
                            <span className="text-white">Upload Photo</span>
                        </button>
                    </div>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                    <input ref={uploadInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    
                    {existingPhotos.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-slate-300 mb-2">Current Photos ({existingPhotos.length})</h4>
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {existingPhotos.map((photoSrc, index) => (
                                    <div key={`existing-${index}`} className="relative group">
                                        <img src={photoSrc} alt={`Existing attachment ${index}`} className="h-24 w-full object-cover rounded-md" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingPhoto(index)}
                                            className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove image"
                                        >
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {newPhotos.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-slate-300 mb-2">New Photos ({newPhotos.length})</h4>
                            <div className="space-y-2">
                                {newPhotos.map((photo, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                                        <p className="text-sm text-slate-300 truncate pr-2">{photo.name}</p>
                                        <button type="button" onClick={() => removeNewPhoto(index)} className="p-1 text-red-500 hover:text-red-400">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Report' : 'Submit')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SafetyInspectionScreen;