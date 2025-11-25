import React, { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { XMarkIcon, UploadIcon, SparklesIcon } from './icons';
import { notify } from './layout/Toast';
import { analyzePairedPhotos, compressImage } from '../services/photoAnalysisService';
import { useTranslation } from 'react-i18next';

// Camera icon component
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

// Alert icon for warnings
const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

interface PhotoCaptureDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded?: () => void;
}

export default function PhotoCaptureDialog({
  userId,
  isOpen,
  onClose,
  onPhotoUploaded
}: PhotoCaptureDialogProps) {
  const { t } = useTranslation();
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const uploadPhotoMutation = useMutation(api.photoMutations.uploadProgressPhoto);
  const userPhotos = useQuery(api.photoQueries.getUserProgressPhotos, { userId, limit: 5 });

  // Check if user uploaded photos within last 14 days
  const canUploadPhotos = () => {
    if (!userPhotos || userPhotos.length === 0) return true;

    const latestPhoto = userPhotos[0];
    const latestDate = new Date(latestPhoto.date);
    const daysSinceLastPhoto = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceLastPhoto >= 14;
  };

  const getDaysUntilNextUpload = () => {
    if (!userPhotos || userPhotos.length === 0) return 0;

    const latestPhoto = userPhotos[0];
    const latestDate = new Date(latestPhoto.date);
    const daysSinceLastPhoto = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    return Math.max(0, 14 - daysSinceLastPhoto);
  };

  const handleFileSelect = (type: 'front' | 'back') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notify({ type: 'error', message: t('photos.errors.selectImage') });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notify({ type: 'error', message: t('photos.errors.fileTooLarge') });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'front') {
        setFrontPhoto(dataUrl);
      } else {
        setBackPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = (type: 'front' | 'back') => {
    if (type === 'front') {
      frontInputRef.current?.click();
    } else {
      backInputRef.current?.click();
    }
  };

  const handleAnalyzeAndUpload = async () => {
    if (!frontPhoto || !backPhoto) {
      notify({ type: 'error', message: t('photos.errors.bothRequired') });
      return;
    }

    if (!canUploadPhotos()) {
      const daysLeft = getDaysUntilNextUpload();
      notify({
        type: 'error',
        message: `Please wait ${daysLeft} more day${daysLeft > 1 ? 's' : ''} before uploading new photos. Progress photos are most accurate every 14 days.`
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Compress images
      const compressedFront = await compressImage(
        await fetch(frontPhoto).then(r => r.blob()).then(b => new File([b], 'front.jpg', { type: 'image/jpeg' })),
        1200,
        0.85
      );
      const compressedBack = await compressImage(
        await fetch(backPhoto).then(r => r.blob()).then(b => new File([b], 'back.jpg', { type: 'image/jpeg' })),
        1200,
        0.85
      );

      // Extract base64 data
      const frontBase64 = compressedFront.split(',')[1];
      const backBase64 = compressedBack.split(',')[1];

      // Get previous photos for comparison
      const previousFront = userPhotos?.find(p => p.photoType === 'front');
      const previousBack = userPhotos?.find(p => p.photoType === 'back');

      const previousFrontBase64 = previousFront?.photoUrl ? previousFront.photoUrl.split(',')[1] : undefined;
      const previousBackBase64 = previousBack?.photoUrl ? previousBack.photoUrl.split(',')[1] : undefined;

      // Analyze paired photos with AI
      const analysis = await analyzePairedPhotos(
        frontBase64,
        backBase64,
        previousFrontBase64,
        previousBackBase64
      );

      // Upload front photo
      await uploadPhotoMutation({
        userId,
        photoUrl: compressedFront,
        photoType: 'front',
        analysis: {
          bodyFatEstimate: analysis.bodyFatEstimate,
          muscleChanges: analysis.muscleChanges,
          improvements: analysis.improvements,
          suggestions: analysis.suggestions,
          confidence: analysis.confidence
        }
      });

      // Upload back photo with same analysis
      await uploadPhotoMutation({
        userId,
        photoUrl: compressedBack,
        photoType: 'back',
        analysis: {
          bodyFatEstimate: analysis.bodyFatEstimate,
          muscleChanges: analysis.muscleChanges,
          improvements: analysis.improvements,
          suggestions: analysis.suggestions,
          confidence: analysis.confidence
        }
      });

      notify({ type: 'success', message: t('photos.upload.success', { defaultValue: 'Progress photos uploaded and analyzed successfully!' }) });

      // Reset state
      setFrontPhoto(null);
      setBackPhoto(null);

      // Callback
      if (onPhotoUploaded) {
        onPhotoUploaded();
      }

      onClose();
    } catch (error) {
      console.error('Photo upload error:', error);
      notify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload photos'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontPhoto(null);
    } else {
      setBackPhoto(null);
    }
  };

  if (!isOpen) return null;

  const uploadAllowed = canUploadPhotos();
  const daysLeft = getDaysUntilNextUpload();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl shadow-elevated animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
                <CameraIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
                  {t('photos.title')}
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  {t('photos.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-all"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Photo Guidelines */}
          <div className="p-4 bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl">
            <h4 className="text-[13px] font-bold text-[var(--accent)] mb-3 flex items-center gap-2">
              <CameraIcon className="w-4 h-4" />
              {t('photos.guidelines.title')}
            </h4>
            <ul className="text-[12px] text-[var(--text-primary)] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">✓</span>
                <span>{t('photos.guidelines.lighting')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">✓</span>
                <span>{t('photos.guidelines.fullBody')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">✓</span>
                <span>{t('photos.guidelines.distance')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">✓</span>
                <span>{t('photos.guidelines.outfit')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">✓</span>
                <span>{t('photos.guidelines.pose')}</span>
              </li>
            </ul>
          </div>

          {/* Frequency Warning */}
          {!uploadAllowed && (
            <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)]/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-[var(--warning)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-[var(--text-primary)] mb-1">
                    Wait {daysLeft} more day{daysLeft > 1 ? 's' : ''} for best results
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Progress photos are most accurate when taken every 14 days. This gives your body time to show meaningful changes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Photo */}
            <div>
              <p className="text-[12px] font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
                Front Photo *
              </p>
              {!frontPhoto ? (
                <button
                  onClick={() => handleUploadClick('front')}
                  className="w-full aspect-[3/4] border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[var(--primary)] hover:bg-[var(--surface-secondary)] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                    <UploadIcon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">
                      {t('photos.upload.front')}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {t('photos.upload.format')}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={frontPhoto}
                    alt="Front preview"
                    className="w-full aspect-[3/4] object-cover rounded-xl border border-[var(--border)]"
                  />
                  <button
                    onClick={() => handleReset('front')}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect('front')}
                className="hidden"
              />
            </div>

            {/* Back Photo */}
            <div>
              <p className="text-[12px] font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
                Back Photo *
              </p>
              {!backPhoto ? (
                <button
                  onClick={() => handleUploadClick('back')}
                  className="w-full aspect-[3/4] border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[var(--primary)] hover:bg-[var(--surface-secondary)] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                    <UploadIcon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">
                      {t('photos.upload.back')}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {t('photos.upload.format')}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={backPhoto}
                    alt="Back preview"
                    className="w-full aspect-[3/4] object-cover rounded-xl border border-[var(--border)]"
                  />
                  <button
                    onClick={() => handleReset('back')}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect('back')}
                className="hidden"
              />
            </div>
          </div>

          {/* AI Analysis Info */}
          {frontPhoto && backPhoto && (
            <div className="p-3 bg-gradient-to-br from-[var(--accent-light)] to-[var(--primary-light)] border border-[var(--accent)]/20 rounded-xl">
              <div className="flex items-start gap-2">
                <SparklesIcon className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">
                  {t('photos.analysis.analyzing')}
                </p>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
            <div className="flex items-start gap-2">
              <AlertIcon className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {t('photos.analysis.disclaimer')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1"
              disabled={isAnalyzing}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAnalyzeAndUpload}
              variant="accent"
              className="flex-1"
              disabled={!frontPhoto || !backPhoto || isAnalyzing || !uploadAllowed}
              loading={isAnalyzing}
            >
              {isAnalyzing ? (
                t('photos.upload.analyzing')
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  {t('photos.upload.analyzeAndUpload')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
