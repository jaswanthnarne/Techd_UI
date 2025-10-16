import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { userCTFAPI } from '../../services/user';
import { submissionAPI } from '../../services/submission';
import { 
  Upload, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  ExternalLink,
  BarChart3,
  RefreshCw,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const CTFSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ctf, setCtf] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFData();
  }, [id]);

  const fetchCTFData = async () => {
    try {
      setLoading(true);
      const ctfResponse = await userCTFAPI.getCTF(id);
      console.log(ctfResponse.data.ctf);
      const ctfData = ctfResponse.data.ctf;
      setCtf(ctfData);

      // Try to get submission
      try {
        const submissionResponse = await userCTFAPI.getMySubmission(id);
        if (submissionResponse.data.submission) {
          setSubmission(submissionResponse.data.submission);
        } else {
          setSubmission(null);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setSubmission(null);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to fetch CTF data:', error);
      toast.error('Failed to load CTF data');
    } finally {
      setLoading(false);
    }
  };

/// In CTFSubmission.jsx - Fix the isWithinActiveHours function
const isWithinActiveHours = () => {
  if (!ctf?.activeHours) return false;

  const now = currentTime;
  const startTime = ctf.activeHours.startTime; // "HH:MM" format
  const endTime = ctf.activeHours.endTime;     // "HH:MM" format

  console.log('🕒 Frontend Active Hours Check:', {
    startTime,
    endTime,
    currentTime: now.toTimeString(),
    currentHours24: now.getHours(),
    currentMinutes: now.getMinutes()
  });

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutesTotal = startHours * 60 + startMinutes;
  const endMinutesTotal = endHours * 60 + endMinutes;

  console.log('📊 Frontend Time Comparison:', {
    currentMinutes,
    startMinutesTotal,
    endMinutesTotal,
    currentTime24: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  });

  // Handle case where active hours cross midnight
  let isActive;
  if (endMinutesTotal < startMinutesTotal) {
    // Active hours cross midnight (e.g., 22:00 - 06:00)
    isActive = currentMinutes >= startMinutesTotal || currentMinutes <= endMinutesTotal;
  } else {
    // Normal case (e.g., 02:00 - 18:00)
    isActive = currentMinutes >= startMinutesTotal && currentMinutes <= endMinutesTotal;
  }

  console.log('✅ Frontend Active Status:', isActive);
  return isActive;
};

// In your CTFSubmission component, update the calculateCTFStatus function
const calculateCTFStatus = () => {
  if (!ctf) return { status: 'inactive', canSubmit: false };

  const backendStatus = ctf.status?.toLowerCase();
  
  console.log('🔍 Frontend CTF Status Calculation:', {
    backendStatus,
    isVisible: ctf.isVisible,
    isPublished: ctf.isPublished,
    currentTime: currentTime.toLocaleTimeString(),
    activeHours: ctf.activeHours
  });

  // If CTF is not visible or not published, cannot submit
  if (!ctf.isVisible || !ctf.isPublished) {
    return { 
      status: 'inactive', 
      canSubmit: false,
      reason: 'CTF is not published or visible'
    };
  }

  // If backend status is not active, cannot submit
  if (backendStatus !== 'active') {
    return { 
      status: backendStatus || 'inactive', 
      canSubmit: false,
      reason: `Backend status is ${backendStatus}`
    };
  }

  // If backend status is active, check active hours
  const withinActiveHours = isWithinActiveHours();
  
  if (withinActiveHours) {
    return { 
      status: 'active', 
      canSubmit: true,
      reason: 'CTF is active and within active hours'
    };
  } else {
    return { 
      status: 'inactive_hours', 
      canSubmit: false,
      reason: 'Outside active hours'
    };
  }
};

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size must be less than 4MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Double-check CTF status before submitting
  const { canSubmit, reason } = calculateCTFStatus();
  console.log('🚀 Submit Check:', { canSubmit, reason, ctfStatus, hasSubmission });
  
  if (!canSubmit) {
    toast.error(`Submission is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}). Reason: ${reason}`);
    return;
  }

  if (!selectedFile || !flag.trim()) {
    toast.error('Please provide both flag and screenshot');
    return;
  }

  try {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('screenshot', selectedFile);
    formData.append('flag', flag.trim());

    console.log('📤 Submitting to CTF:', {
      ctfId: id,
      ctfTitle: ctf.title,
      ctfStatus: ctf.status,
      activeHours: ctf.activeHours,
      currentTime: currentTime.toLocaleTimeString(),
      canSubmit: canSubmit
    });

    const response = await submissionAPI.submitWithScreenshot(id, formData);
    
    console.log('✅ Submission successful:', response.data);
    toast.success('Submission received! Your screenshot is pending admin review.');
    setShowSubmitModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFlag('');
    fetchCTFData(); // Refresh data to get latest status
  } catch (error) {
    console.error('❌ Submission error:', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      
      const errorMessage = error.response.data?.error || 
                          error.response.data?.details?.[0]?.msg || 
                          'Submission failed';
      
      // If backend says CTF is not active, refresh data and show specific message
      if (errorMessage.includes('not active') || errorMessage.includes('active hours')) {
        // Refresh CTF data to sync with backend
        await fetchCTFData();
        toast.error(`CTF status changed: ${errorMessage}. Please check the current status.`);
      } else {
        toast.error(errorMessage);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      toast.error('Network error - please check your connection');
    } else {
      console.error('Error setting up request:', error.message);
      toast.error('Submission failed: ' + error.message);
    }
  } finally {
    setUploading(false);
  }
};

  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Check if CTF is active
    const { canSubmit } = calculateCTFStatus();
    if (!canSubmit) {
      toast.error(`Editing is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime})`);
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a new screenshot');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('screenshot', selectedFile);

      const response = await submissionAPI.editSubmissionScreenshot(submission._id, formData);
      
      toast.success('Screenshot updated successfully!');
      setShowEditModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchCTFData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setUploading(false);
    }
  };

  // Status calculation
  const { status: ctfStatus, canSubmit } = calculateCTFStatus();
  const hasSubmission = !!submission;
  const canResubmit = canSubmit && submission?.submissionStatus === 'rejected';
  const canEdit = submission?.submissionStatus === 'pending' && canSubmit;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: Clock,
        label: 'Pending Review',
        description: 'Waiting for admin approval'
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: CheckCircle,
        label: 'Approved',
        description: 'Submission accepted! Points awarded'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: XCircle,
        label: 'Rejected',
        description: 'Submission requires changes'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`px-4 py-3 rounded-lg flex items-center space-x-3 ${config.color}`}>
        <Icon className="h-5 w-5" />
        <div>
          <div className="font-medium">{config.label}</div>
          <div className="text-sm opacity-75">{config.description}</div>
        </div>
      </div>
    );
  };

  const getCTFStatusBadge = () => {
    if (!ctf) return null;

    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: CheckCircle,
        label: 'Active Now',
        description: 'Ready for submissions'
      },
      inactive_hours: {
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: Clock,
        label: 'Outside Active Hours',
        description: `Available ${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}`
      },
      upcoming: {
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: Calendar,
        label: 'Upcoming',
        description: `Starts ${new Date(ctf.schedule.startDate).toLocaleDateString()}`
      },
      ended: {
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: XCircle,
        label: 'Ended',
        description: 'Challenge has ended'
      },
      inactive: {
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: AlertCircle,
        label: 'Inactive',
        description: 'CTF is not available'
      },
      draft: {
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: AlertCircle,
        label: 'Draft',
        description: 'CTF is not published'
      }
    };

    const config = statusConfig[ctfStatus] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <div className={`px-4 py-3 rounded-lg flex items-center space-x-3 ${config.color}`}>
        <Icon className="h-5 w-5" />
        <div>
          <div className="font-medium">{config.label}</div>
          <div className="text-sm opacity-75">{config.description}</div>
        </div>
      </div>
    );
  };

  // Format 24-hour time for display (add AM/PM for better readability)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <StudentLayout title="CTF Submission" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
        </div>
      </StudentLayout>
    );
  }

  if (!ctf) {
    return (
      <StudentLayout title="CTF Not Found" subtitle="Challenge not available">
        <Card>
          <Card.Content className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">CTF Not Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The requested CTF challenge could not be found.
            </p>
            <Link to="/student/ctfs">
              <Button className="mt-4">Back to CTFs</Button>
            </Link>
          </Card.Content>
        </Card>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title={ctf.title} subtitle="Submit your solution">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* CTF Header */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ctf.title}</h1>
                <p className="text-gray-600 mb-4">{ctf.description}</p>
                
                {/* CTF Status Badge */}
                {getCTFStatusBadge()}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4">
                  <div className="flex items-center text-gray-500">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{ctf.category}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>{ctf.points} points</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {formatTimeForDisplay(ctf.activeHours.startTime)} - {formatTimeForDisplay(ctf.activeHours.endTime)}
                    </span>
                  </div>
                </div>

                {/* Current Time Display for debugging */}
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                  <strong>Current Server Time:</strong> {currentTime.toLocaleTimeString()} | 
                  <strong> Backend Status:</strong> {ctf.status} | 
                  <strong> Can Submit:</strong> {canSubmit ? 'Yes' : 'No'} |
                  <strong> Active Hours:</strong> {ctf.activeHours.startTime} - {ctf.activeHours.endTime} (24h format)
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {ctf.ctfLink && (
                  <Button 
                    onClick={() => window.open(ctf.ctfLink, '_blank')}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit Challenge</span>
                  </Button>
                )}
                
                {/* Submit Button - Only show when CTF backend status is active AND within active hours */}
                {canSubmit && !hasSubmission && (
                  <Button 
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Submit Solution</span>
                  </Button>
                )}
                
                <Link to={`/student/ctf/${id}`}>
                  <Button variant="outline" className="w-full">
                    Back to CTF Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Current Submission Status */}
        {hasSubmission ? (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Your Submission</h3>
            </Card.Header>
            <Card.Content className="space-y-4">
              {/* Status */}
              {getStatusBadge(submission.submissionStatus)}
              
              {/* Submission Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="text-gray-900">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Attempt:</span>
                      <span className="text-gray-900">#{submission.attemptNumber}</span>
                    </div>
                    {submission.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reviewed:</span>
                        <span className="text-gray-900">
                          {new Date(submission.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {submission.points > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Points Earned:</span>
                        <span className="text-green-600 font-semibold">+{submission.points}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshot Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Screenshot</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {submission.screenshot?.url ? (
                      <div className="space-y-3">
                        <img 
                          src={submission.screenshot.url} 
                          alt="Submission screenshot"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                        <div className="text-sm text-gray-500 text-center">
                          {submission.screenshot.filename}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <FileText className="mx-auto h-8 w-8 mb-2" />
                        <p>No screenshot available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Feedback */}
              {submission.adminFeedback && (
                <div className={`p-4 rounded-lg ${
                  submission.submissionStatus === 'rejected' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Feedback</h4>
                  <p className="text-sm text-gray-700">{submission.adminFeedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {canEdit && (
                  <Button 
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Screenshot</span>
                  </Button>
                )}
                
                {/* Resubmit button */}
                {canResubmit && (
                  <Button 
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Resubmit Solution</span>
                  </Button>
                )}
                
                <Button 
                  onClick={fetchCTFData}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Status</span>
                </Button>
              </div>
            </Card.Content>
          </Card>
        ) : (
          /* No Submission State */

         
          <Card>
            <Card.Content className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submission Yet</h3>
              <p className="text-gray-500 mb-6">
                 {console.log('🚀 No Submission State:', { ctfStatus, canSubmit, hasSubmission })}
                {canSubmit 
                  ? 'Submit your solution with a screenshot to earn points!'
                  : ctfStatus === 'active'
                    ? `Submissions are only accepted between ${formatTimeForDisplay(ctf.activeHours.startTime)} - ${formatTimeForDisplay(ctf.activeHours.endTime)}`
                    : 'CTF is not currently active for submissions'
                }
              </p>
              {canSubmit && (
                <Button 
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  <span>Make First Submission</span>
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Submission Guidelines */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Submission Guidelines</h3>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Screenshot must clearly show the flag or solution</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>File must be an image (JPEG, PNG, GIF) under 4MB</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Include the complete flag in the submission form</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Admin review typically takes 1-2 hours during active periods</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You can edit your screenshot while submission is pending review</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Submissions are only accepted when CTF status is <strong>active</strong> and between <strong>{formatTimeForDisplay(ctf.activeHours.startTime)}</strong> - <strong>{formatTimeForDisplay(ctf.activeHours.endTime)}</strong>
                </span>
              </li>
            </ul>
          </Card.Content>
        </Card>
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit CTF Solution"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CTF Status Check */}
          {!canSubmit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Submission Not Available</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>Submissions are only allowed when:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>CTF backend status is <strong>active</strong></li>
                      <li>Current time is within active hours: {formatTimeForDisplay(ctf.activeHours.startTime)} - {formatTimeForDisplay(ctf.activeHours.endTime)}</li>
                    </ul>
                    <p className="mt-1">Current backend status: <strong>{ctf.status}</strong></p>
                    <p>Current time: {currentTime.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTF Flag
            </label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="CTF{...}"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={!canSubmit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution Screenshot *
            </label>
            
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
                disabled={!canSubmit}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF (Max: 4MB)
              </p>
            </div>

            {/* Preview Section */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto h-48 object-contain rounded-lg"
                  />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            )}
            
            {/* Upload Instructions when no file selected */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No file selected</p>
                <p className="text-xs text-gray-500">
                  Please select an image file above
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Submission Process</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>Your submission will be reviewed by an admin. You'll receive an email notification once reviewed.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!selectedFile || !flag.trim() || !canSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Solution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Screenshot Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Screenshot"
        size="lg"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {/* CTF Status Check */}
          {!canSubmit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Editing Not Available</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>Editing is only allowed when:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>CTF backend status is <strong>active</strong></li>
                      <li>Current time is within active hours: {formatTimeForDisplay(ctf.activeHours.startTime)} - {formatTimeForDisplay(ctf.activeHours.endTime)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Screenshot *
            </label>
            
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
                disabled={!canSubmit}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF (Max: 4MB)
              </p>
            </div>

            {/* Preview Section */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto h-48 object-contain rounded-lg"
                  />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            )}
            
            {/* Upload Instructions when no file selected */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No file selected</p>
                <p className="text-xs text-gray-500">
                  Please select an image file above
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Replacing the screenshot will reset your position in the review queue.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!selectedFile || !canSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Screenshot
            </Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
};

export default CTFSubmission;