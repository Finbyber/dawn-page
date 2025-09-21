import React, { useState } from 'react';
import { Screen, FieldUser } from '../types';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import PhotoUploader from '../components/common/PhotoUploader';
import Button from '../components/common/Button';
import { saveReport, saveOfflineReport, fileToBase64, getGpsEnabled } from '../utils/storage';

interface EnvironmentalReportScreenProps {
  setScreen: (screen: Screen) => void;
  user: FieldUser | null;
  onFinishEditing: () => void;
}

const EnvironmentalReportScreen: React.FC<EnvironmentalReportScreenProps> = ({ setScreen, user, onFinishEditing }) => {
    const [formState, setFormState] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return {
            date: now.toISOString().slice(0, 16),
            location: '',
            concernType: '',
            description: '',
            actionsTaken: '',
        };
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prevState => ({ ...prevState, [id]: value }));
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
                type: 'Environmental' as const,
                data: reportData,
            };
            
            if (navigator.onLine) {
                saveReport(reportToSubmit, user.id);
                alert('Environmental report submitted successfully!');
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
            <Header title="Environmental Report" onBack={() => setScreen(Screen.Home)} />
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <Input
                    label="Date and Time"
                    id="date"
                    type="datetime-local"
                    value={formState.date}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Location"
                    id="location"
                    type="text"
                    placeholder="e.g., Site B, Warehouse Area"
                    value={formState.location}
                    onChange={handleChange}
                    required
                />
                <Select
                    label="Type of Environmental Concern"
                    id="concernType"
                    value={formState.concernType}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a type...</option>
                    <option value="Spill">Spill / Leak</option>
                    <option value="Waste">Improper Waste Disposal</option>
                    <option value="Emissions">Air / Noise Emissions</option>
                    <option value="Wildlife">Wildlife Disturbance</option>
                    <option value="Other">Other</option>
                </Select>
                <Textarea
                    label="Description of Concern"
                    id="description"
                    placeholder="Provide a detailed description of the environmental concern."
                    value={formState.description}
                    onChange={handleChange}
                    required
                />
                 <Textarea
                    label="Actions Taken"
                    id="actionsTaken"
                    placeholder="Describe any immediate actions taken to mitigate the issue."
                    value={formState.actionsTaken}
                    onChange={handleChange}
                    required
                />
                <PhotoUploader label="Attach Photos" onFilesChange={handlePhotoChange} />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
            </form>
        </div>
    );
};

export default EnvironmentalReportScreen;
