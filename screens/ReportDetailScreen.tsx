import React, { useState, useEffect } from 'react';
import { Report, SafetyInspectionData, FieldUser, IncidentReportData, NearMissReportData, EnvironmentalReportData, FeaturePermissions } from '../types';
import Header from '../components/common/Header';
import { hasManagerialRole } from '../utils/auth';
import { getUsers } from '../utils/storage';
import Select from '../components/common/Select';
import PhotoGallery from '../components/common/PhotoGallery';

interface ReportDetailScreenProps {
    report: Report | null;
    user: FieldUser | null;
    userFeaturePermissions: FeaturePermissions | null;
    onBack: () => void;
    onReopen: (reportId: string) => void;
    onClose: (reportId: string) => void;
    onAssign: (reportId: string, assignedUserId: string) => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode | undefined }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="text-md text-slate-800 dark:text-slate-200">{value || 'N/A'}</div>
    </div>
);

const PhotoSection: React.FC<{ photos: string[] | undefined; canOpenGallery: boolean; onPhotoClick: (index: number) => void; }> = ({ photos, canOpenGallery, onPhotoClick }) => {
    if (!photos || photos.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Photos ({photos.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {photos.map((photoSrc, index) => (
                    <button
                        key={index}
                        onClick={() => canOpenGallery && onPhotoClick(index)}
                        className={`rounded-lg overflow-hidden w-full h-32 block ${canOpenGallery ? 'cursor-pointer group' : 'cursor-default'}`}
                        disabled={!canOpenGallery}
                        aria-label={`View photo ${index + 1} in gallery`}
                    >
                        <img 
                            src={photoSrc} 
                            alt={`Attachment ${index + 1}`} 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};


const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({ report, user, userFeaturePermissions, onBack, onReopen, onClose, onAssign }) => {
    const [users, setUsers] = useState<FieldUser[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const openGallery = (index: number) => {
        setGalleryStartIndex(index);
        setIsGalleryOpen(true);
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    if (!report) {
        React.useEffect(() => {
            onBack();
        }, [onBack]);
        return null;
    }
    
    const assignedUser = users.find(u => u.id === report.assignedTo);
    const canAssign = hasManagerialRole(user) && (report.status === 'In Review' || report.status === 'Submitted');
    const canViewGallery = !!userFeaturePermissions?.canViewPhotoGallery;

    const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onAssign(report.id, e.target.value);
    };

    const renderSafetyInspectionDetails = (data: SafetyInspectionData) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Inspection Details</h3>
                <DetailRow label="Inspection Date" value={data.inspectionDate ? new Date(data.inspectionDate.replace(/-/g, '/')).toLocaleDateString('en-GB') : 'N/A'} />
                <DetailRow label="Site / Area" value={data.siteArea} />
                 {data.gps && (
                    <DetailRow 
                        label="GPS Location"
                        value={
                            <a href={`https://www.google.com/maps?q=${data.gps.latitude},${data.gps.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                                View on Map
                            </a>
                        }
                    />
                )}
                <DetailRow label="Inspector Name" value={data.inspectorName} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">Inspection Checklist</h3>
                <div className="space-y-3">
                    {data.checklist.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                            <p className="text-slate-800 dark:text-slate-200">{item.text}</p>
                            <div className="flex items-center space-x-2">
                                <span className={`px-4 py-1 text-sm font-semibold rounded-full ${item.status === 'Pass' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400 opacity-70'}`}>
                                    Pass
                                </span>
                                <span className={`px-4 py-1 text-sm font-semibold rounded-full ${item.status === 'Fail' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400 opacity-70'}`}>
                                    Fail
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {data.notes && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Notes</h3>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{data.notes}</p>
                </div>
            )}

            <PhotoSection photos={data.photos} canOpenGallery={canViewGallery} onPhotoClick={openGallery} />
        </div>
    );
    
    const renderIncidentDetails = (data: IncidentReportData) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md space-y-4">
              <DetailRow label="Date and Time of Incident" value={new Date(data.dateTime).toLocaleString('en-GB')} />
              <DetailRow label="Location of Incident" value={data.location} />
              <DetailRow label="Incident Type" value={data.incidentType} />
              <DetailRow label="Severity Level" value={data.severity} />
              <DetailRow label="Detailed Description" value={<p className="whitespace-pre-wrap">{data.description}</p>} />
              {data.gps && (
                  <DetailRow 
                      label="GPS Location"
                      value={
                          <a href={`https://www.google.com/maps?q=${data.gps.latitude},${data.gps.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                              View on Map
                          </a>
                      }
                  />
              )}
            </div>
            <PhotoSection photos={data.photos} canOpenGallery={canViewGallery} onPhotoClick={openGallery} />
        </div>
      );
      
      const renderNearMissDetails = (data: NearMissReportData) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md space-y-4">
              <DetailRow label="Date and Time" value={new Date(data.dateTime).toLocaleString('en-GB')} />
              <DetailRow label="Location" value={data.location} />
              <DetailRow label="Description of Near Miss" value={<p className="whitespace-pre-wrap">{data.description}</p>} />
              <DetailRow label="Contributing Factors" value={<p className="whitespace-pre-wrap">{data.contributingFactors}</p>} />
              <DetailRow label="Corrective Action Needed?" value={data.correctiveActionNeeded ? 'Yes' : 'No'} />
              {data.gps && (
                  <DetailRow 
                      label="GPS Location"
                      value={
                          <a href={`https://www.google.com/maps?q=${data.gps.latitude},${data.gps.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                              View on Map
                          </a>
                      }
                  />
              )}
            </div>
            <PhotoSection photos={data.photos} canOpenGallery={canViewGallery} onPhotoClick={openGallery} />
        </div>
      );
      
      const renderEnvironmentalDetails = (data: EnvironmentalReportData) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md space-y-4">
              <DetailRow label="Date and Time" value={new Date(data.date).toLocaleString('en-GB')} />
              <DetailRow label="Location" value={data.location} />
              <DetailRow label="Type of Concern" value={data.concernType} />
              <DetailRow label="Description of Concern" value={<p className="whitespace-pre-wrap">{data.description}</p>} />
              <DetailRow label="Actions Taken" value={<p className="whitespace-pre-wrap">{data.actionsTaken}</p>} />
              {data.gps && (
                  <DetailRow 
                      label="GPS Location"
                      value={
                          <a href={`https://www.google.com/maps?q=${data.gps.latitude},${data.gps.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                              View on Map
                          </a>
                      }
                  />
              )}
            </div>
            <PhotoSection photos={data.photos} canOpenGallery={canViewGallery} onPhotoClick={openGallery} />
        </div>
      );

    const getHeaderActions = () => {
        if (!hasManagerialRole(user)) {
            return null;
        }

        if (report.status === 'Closed') {
            return (
                <button 
                    onClick={() => onReopen(report.id)}
                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors dark:bg-yellow-600 dark:hover:bg-yellow-700"
                >
                    Re-open
                </button>
            );
        }
        if (report.status === 'In Review' || report.status === 'Submitted') {
             return (
                <button
                    onClick={() => onClose(report.id)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
                >
                    Close Report
                </button>
            );
        }
        return null;
    }

    const renderReportContent = () => {
        if (!report?.data) {
            return <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md"><p className="text-slate-600 dark:text-slate-400 text-center">No data available for this report.</p></div>;
        }
        switch (report.type) {
            case 'Safety Inspection':
                return renderSafetyInspectionDetails(report.data as SafetyInspectionData);
            case 'Incident':
                return renderIncidentDetails(report.data as IncidentReportData);
            case 'Near Miss':
                return renderNearMissDetails(report.data as NearMissReportData);
            case 'Environmental':
                return renderEnvironmentalDetails(report.data as EnvironmentalReportData);
            default:
                return <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md"><p className="text-slate-600 dark:text-slate-400 text-center">Detailed view for this report type is not available.</p></div>;
        }
    };
    
    return (
        <div>
            <Header 
                title="Report Details" 
                onBack={onBack}
                actions={getHeaderActions()}
            />
            <div className="p-4 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <DetailRow label="Report ID" value={report.id} />
                    <DetailRow label="Report Type" value={report.type} />
                    <DetailRow label="Date Submitted" value={new Date(report.date.replace(/-/g, '/')).toLocaleDateString('en-GB')} />
                    {report.lastEdited && <DetailRow label="Last Edited" value={new Date(report.lastEdited).toLocaleString('en-GB')} />}
                    <DetailRow label="Status" value={report.status} />
                    <DetailRow label="Assigned To" value={assignedUser ? assignedUser.fullName : 'Unassigned'} />
                </div>

                {canAssign && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <Select
                            id="assign-user"
                            label="Assign Report To"
                            value={report.assignedTo || ''}
                            onChange={handleAssignmentChange}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.status === 'Active').map(u => (
                                <option key={u.id} value={u.id}>{u.fullName}</option>
                            ))}
                        </Select>
                    </div>
                )}
                
                {renderReportContent()}
            </div>
            {isGalleryOpen && report?.data?.photos && (
                <PhotoGallery
                    photos={report.data.photos}
                    initialIndex={galleryStartIndex}
                    onClose={closeGallery}
                />
            )}
        </div>
    );
};

export default ReportDetailScreen;