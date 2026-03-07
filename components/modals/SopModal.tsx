
import React from 'react';
import BaseModal from './BaseModal';
import type { Lesson } from '../../types';

interface SopModalProps {
    lesson: Lesson;
    onClose: () => void;
}

const SopModal: React.FC<SopModalProps> = ({ lesson, onClose }) => {
    return (
        <BaseModal onClose={onClose} title={lesson.title}>
            <div className="space-y-6">
                {lesson.video_url && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                        <video 
                            src={lesson.video_url} 
                            controls 
                            className="w-full h-full object-contain"
                            poster="https://placehold.co/600x400/1e293b/ffffff?text=Training+Video"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none">
                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
            </div>
        </BaseModal>
    );
};

export default SopModal;
