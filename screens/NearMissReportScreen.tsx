import React, { useState } from 'react';
import { Screen, FieldUser } from '../types';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import PhotoUploader from '../components/common/PhotoUploader';
import Button from '../components/common/Button';
import { saveReport, saveOfflineReport, fileToBase64, getGpsEnabled } from '../utils/storage';

interface NearMissReportScreenProps {
  setScreen: (screen: Screen) => void;
  user: FieldUser | null;
  onFinishEditing: () => void;
}

const NearMissReportScreen: React.FC<NearMissReportScreenProps> = ({ setScreen, user, onFinishEditing }) => {
    const [formState, setFormState] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return {
            dateTime: now.toISOString().slice(0, 16),
            location: '',
            description: '',
            contributingFactors: '',
            correctiveActionNeeded: false
        };
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormState(prevState => ({ 
            ...prevState, 
            [id]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
        }));
    };
    
    const handlePhotoChange = (files: File[]) => {
        setPhotos(files);
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
            const photoPromises = photos.map(file => fileToBase64(file));
            const base64Photos = await Promise.all(photoPromises);
    
            const reportData = {
                ...formState,
                photos: base64Photos,
                gps: location,
            };
    
            const reportToSubmit = {
                type: 'Near Miss' as const,
                data: reportData,
            };
    
            if (navigator.onLine) {
                saveReport(reportToSubmit, user.id);
                alert('Near miss report submitted successfully!');
            } else {
                saveOfflineReport({ ...reportToSubmit, submittedBy: user.id });
                alert('No internet connection. Report saved locally and will submit later.');
            }
            onFinishEditing();
            setScreen(Screen.Home);
    
        } catch (error) {
            console.error("Failed to prepare report for submission:", error);
            alert('There was an error preparing your report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Header title="Near Miss Report" onBack={() => setScreen(Screen.Home)} />
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <Input
                    label="Date and Time"
                    id="dateTime"
                    type="datetime-local"
                    value={formState.dateTime}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Location"
                    id="location"
                    type="text"
                    placeholder="e.g., Loading Bay 3"
                    value={formState.location}
                    onChange={handleChange}
                    required
                />
                <Textarea
                    label="Description of Near Miss"
                    id="description"
                    placeholder="Describe the event and what could have happened."
                    value={formState.description}
                    onChange={handleChange}
                    required
                />
                <Textarea
                    label="Contributing Factors"
                    id="contributingFactors"
                    placeholder="What factors led to this near miss? (e.g., poor lighting, wet floor)"
                    value={formState.contributingFactors}
                    onChange={handleChange}
                />
                <div className="flex items-center">
                    <input
                        id="correctiveActionNeeded"
                        type="checkbox"
                        checked={formState.correctiveActionNeeded}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="correctiveActionNeeded" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Corrective Action Needed?
                    </label>
                </div>
                <PhotoUploader label="Attach Photos" onFilesChange={handlePhotoChange} />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
            </form>
        </div>
    );
};

export default NearMissReportScreen;
